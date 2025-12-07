from rest_framework import serializers
from .models import Property, PropertyImage, PropertyEnquiry, Tag, Category, SubCategory, City, Pincode, Amenity, Banner


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'description', 'is_active']
        read_only_fields = ['slug']


class CityPublicSerializer(serializers.ModelSerializer):
    pincodes = serializers.SerializerMethodField()
    property_count = serializers.SerializerMethodField()

    class Meta:
        model = City
        fields = ['id', 'name', 'state', 'is_active', 'property_count', 'pincodes']

    def get_pincodes(self, obj):
        return list(Pincode.objects.filter(city__iexact=obj.name, is_active=True)
                    .values_list('pincode', flat=True))

    def get_property_count(self, obj):
        return Property.objects.filter(status='active', city__iexact=obj.name).count()


class CityAdminSerializer(serializers.ModelSerializer):
    total_pincodes = serializers.SerializerMethodField()
    property_count = serializers.SerializerMethodField()

    class Meta:
        model = City
        fields = ['id', 'name', 'state', 'is_active', 'total_pincodes', 'property_count', 'created_at', 'updated_at']
        read_only_fields = ['total_pincodes', 'property_count', 'created_at', 'updated_at']

    def get_total_pincodes(self, obj):
        return Pincode.objects.filter(city__iexact=obj.name).count()

    def get_property_count(self, obj):
        return Property.objects.filter(city__iexact=obj.name).count()


class PincodeAdminSerializer(serializers.ModelSerializer):
    city_ref = serializers.PrimaryKeyRelatedField(
        queryset=City.objects.all(),
        write_only=True,
        required=False,
        help_text='City this pincode belongs to'
    )
    city_id = serializers.SerializerMethodField()

    class Meta:
        model = Pincode
        fields = [
            'id', 'pincode', 'city_ref', 'city_id', 'city',
            'area', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['city_id', 'city', 'created_at', 'updated_at']

    def create(self, validated_data):
        city = validated_data.pop('city_ref')
        validated_data['city'] = city.name
        validated_data.setdefault('state', city.state)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        city = validated_data.pop('city_ref', None)
        if city:
            validated_data['city'] = city.name
            validated_data.setdefault('state', city.state)
        return super().update(instance, validated_data)

    def get_city_id(self, obj):
        city = City.objects.filter(name__iexact=obj.city).first()
        return city.id if city else None

    def validate(self, attrs):
        if self.instance is None and not attrs.get('city_ref'):
            raise serializers.ValidationError({'city_ref': 'City selection is required.'})
        return super().validate(attrs)


class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ['id', 'name', 'slug', 'description', 'priority', 'is_active', 'category']
        read_only_fields = ['slug']


class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategorySerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'priority', 'is_active', 'subcategories']
        read_only_fields = ['slug']


class PropertyImageSerializer(serializers.ModelSerializer):
    """Serializer for property images"""
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = PropertyImage
        fields = ['id', 'property', 'image', 'image_url', 'caption', 'is_primary', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_image(self, obj):
        """Return image_url if available, otherwise uploaded image URL"""
        return obj.get_image_source()


class AmenitySerializer(serializers.ModelSerializer):
    """Serializer for Amenity model"""
    class Meta:
        model = Amenity
        fields = ['id', 'name', 'slug', 'description', 'icon', 'is_active']


class PropertySerializer(serializers.ModelSerializer):
    """Serializer for Property model"""
    images = PropertyImageSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    amenities_list = serializers.ReadOnlyField()
    amenities = serializers.SerializerMethodField()
    tags = TagSerializer(many=True, read_only=True)
    owner_phone_masked = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = [
            'id', 'title', 'category', 'type', 'price', 'location', 
            'carpet_area', 'buildup_area', 'length', 'width', 'height',
            'bedrooms', 'bathrooms', 'city', 'state', 'pincode', 'description',
            'amenities', 'amenities_list', 'owner_name', 'owner_phone', 'owner_email',
            'subcategory', 'is_phone_approved', 'owner_phone_masked', 'tags',
            'status', 'created_by', 'created_by_name', 'created_at', 'updated_at', 'images'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Set the created_by field to the current user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

    def get_owner_phone_masked(self, obj):
        return obj.masked_owner_phone

    def get_amenities(self, obj):
        """Explicitly get amenities, using prefetched if available"""
        # Check if amenities are prefetched
        if hasattr(obj, '_prefetched_objects_cache') and 'amenities' in obj._prefetched_objects_cache:
            amenities = obj._prefetched_objects_cache['amenities']
        else:
            # Fallback to querying if not prefetched
            amenities = obj.amenities.all()
        
        # Filter to only active amenities and order by priority
        amenities = amenities.filter(is_active=True).order_by('-priority', 'name')
        
        # Serialize the amenities
        return AmenitySerializer(amenities, many=True).data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else None
        
        # Check if user is admin or the property owner
        is_admin = getattr(user, 'is_admin', False) if user else False
        is_owner = user == instance.created_by if user else False
        
        # For customers (non-admin, non-owner), hide owner contact info and show admin contact
        if user and not is_admin and not is_owner:
            # Hide owner phone and email from customers
            data['owner_phone'] = None
            data['owner_email'] = None
            data['owner_phone_full'] = None
            
            # Show admin contact info instead
            from contact.models import SiteSettings
            site_settings = SiteSettings.load()
            data['admin_contact_phone'] = site_settings.contact_phone
            data['admin_contact_email'] = site_settings.contact_email
        else:
            # For admins and property owners, show full owner info
            data['owner_phone'] = instance.owner_phone_display(user)
            if instance.owner_phone and (
                instance.is_phone_approved or is_admin or is_owner
            ):
                data['owner_phone_full'] = instance.owner_phone
            else:
                data['owner_phone_full'] = None
            data['admin_contact_phone'] = None
            data['admin_contact_email'] = None
        
        return data


class PropertyListSerializer(serializers.ModelSerializer):
    """Simplified serializer for property lists"""
    primary_image = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    owner_phone_masked = serializers.SerializerMethodField()
    enquiries_count = serializers.SerializerMethodField()
    tags = TagSerializer(many=True, read_only=True)
    
    class Meta:
        model = Property
        fields = [
            'id', 'title', 'category', 'type', 'price', 'location', 
            'carpet_area', 'buildup_area', 'length', 'width', 'height',
            'bedrooms', 'bathrooms', 'city', 'state', 'subcategory', 'status', 'primary_image',
            'images', 'created_by_name', 'created_at', 'view_count',
            'owner_phone_masked', 'is_phone_approved', 'enquiries_count', 'tags'
        ]
    
    def get_primary_image(self, obj):
        """Get the primary image URL or first image"""
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image:
            return primary_image.get_image_source()
        
        first_image = obj.images.first()
        if first_image:
            return first_image.get_image_source()
        
        return None
    
    def get_images(self, obj):
        """Get all images for the property"""
        images = obj.images.all()
        return [
            {
                'id': img.id,
                'image': img.get_image_source(),
                'caption': img.caption or '',
                'is_primary': img.is_primary
            }
            for img in images
        ]

    def get_owner_phone_masked(self, obj):
        return obj.masked_owner_phone

    def get_enquiries_count(self, obj):
        prefetched = getattr(obj, '_prefetched_objects_cache', {}).get('enquiries')
        if prefetched is not None:
            return len(prefetched)
        return obj.enquiries.count()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else None
        
        # Check if user is admin or the property owner
        is_admin = getattr(user, 'is_admin', False) if user else False
        is_owner = user == instance.created_by if user else False
        
        # For customers (non-admin, non-owner), hide owner contact info
        if user and not is_admin and not is_owner:
            data['owner_phone'] = None
        else:
            data['owner_phone'] = instance.owner_phone_display(user)
        
        return data


class PropertyCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating properties"""
    tag_ids = serializers.PrimaryKeyRelatedField(queryset=Tag.objects.filter(is_active=True), many=True, required=False, write_only=True)
    amenity_ids = serializers.PrimaryKeyRelatedField(queryset=Amenity.objects.filter(is_active=True), many=True, required=False, write_only=True)

    class Meta:
        model = Property
        fields = [
            'title', 'category', 'subcategory', 'type', 'price', 'location', 
            'carpet_area', 'buildup_area', 'length', 'width', 'height',
            'bedrooms', 'bathrooms', 'city', 'state', 'pincode', 'description',
            'owner_name', 'owner_phone', 'owner_email',
            'status', 'tag_ids', 'amenity_ids'
        ]
    
    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        amenity_ids = validated_data.pop('amenity_ids', [])
        validated_data['created_by'] = self.context['request'].user
        property_obj = super().create(validated_data)
        if tag_ids:
            property_obj.tags.set(tag_ids)
        if amenity_ids:
            property_obj.amenities.set(amenity_ids)
        return property_obj

    def validate(self, attrs):
        attrs = super().validate(attrs)
        city_name = attrs.get('city') or getattr(self.instance, 'city', None)
        pincode = attrs.get('pincode') or getattr(self.instance, 'pincode', None)

        if city_name:
            city_obj = City.objects.filter(name__iexact=city_name).first()
            if not city_obj:
                raise serializers.ValidationError({
                    'city': [f"We are not live in {city_name} yet. Please contact support."],
                    'error_code': 'city_not_supported'
                })
            if not city_obj.is_active:
                raise serializers.ValidationError({
                    'city': [f"{city_name} is currently inactive. Please choose another active city."],
                    'error_code': 'city_inactive'
                })

        if city_name and pincode:
            # Check if pincode exists for this city
            pincode_exists = Pincode.objects.filter(city__iexact=city_name, pincode=pincode, is_active=True).exists()
            
            # If pincode doesn't exist, only warn but allow for customers
            # Admin properties should have valid pincodes
            user = self.context.get('request').user if self.context.get('request') else None
            is_admin = getattr(user, 'is_admin', False) if user else False
            
            if not pincode_exists:
                if is_admin:
                    # Admins should use valid pincodes
                    raise serializers.ValidationError({
                        'pincode': [f"Pincode {pincode} is not enabled for {city_name} yet. Please add it in the admin panel first."],
                        'error_code': 'pincode_not_allowed'
                    })
                else:
                    # For customers, allow but log a warning
                    # The pincode will be saved, but admin should verify it later
                    pass

        return attrs

    def update(self, instance, validated_data):
        tag_ids = validated_data.pop('tag_ids', None)
        amenity_ids = validated_data.pop('amenity_ids', None)
        property_obj = super().update(instance, validated_data)
        if tag_ids is not None:
            property_obj.tags.set(tag_ids)
        if amenity_ids is not None:
            property_obj.amenities.set(amenity_ids)
        return property_obj


class PropertyStatsSerializer(serializers.Serializer):
    """Serializer for property statistics"""
    total_properties = serializers.IntegerField()
    for_sale = serializers.IntegerField()
    for_rent = serializers.IntegerField()
    plots = serializers.IntegerField()
    active_properties = serializers.IntegerField()
    inactive_properties = serializers.IntegerField()
    
    # Recent uploads.
    # recent_uploads_7_days = serializers.IntegerField()
    # recent_uploads_30_days = serializers.IntegerField()
    
    # Category breakdown
    flats = serializers.IntegerField()
    houses = serializers.IntegerField()
    commercial = serializers.IntegerField()
    
    # Popular locations
    popular_locations = serializers.ListField()
    
    # Price ranges
    price_ranges = serializers.DictField()


class PropertyEnquirySerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source='property.title', read_only=True)
    property_location = serializers.CharField(source='property.location', read_only=True)
    property_primary_image = serializers.SerializerMethodField()
    enquiry_type = serializers.SerializerMethodField()

    class Meta:
        model = PropertyEnquiry
        fields = [
            'id', 'property', 'property_title', 'property_location', 'property_primary_image',
            'status', 'message', 'name', 'email', 'phone', 'user', 'created_at', 'updated_at',
            'enquiry_type'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_enquiry_type(self, obj):
        return 'property_enquiry'

    def get_property_primary_image(self, obj):
        primary_image = obj.property.images.filter(is_primary=True).first()
        if primary_image:
            return primary_image.get_image_source()
        first_image = obj.property.images.first()
        if first_image:
            return first_image.get_image_source()
        return None


class BannerSerializer(serializers.ModelSerializer):
    """Serializer for Banner model"""
    image_source = serializers.SerializerMethodField()
    is_currently_active = serializers.SerializerMethodField()
    
    class Meta:
        model = Banner
        fields = [
            'id', 'name', 'banner_type', 'image', 'image_url', 'link_url',
            'title', 'description', 'is_active', 'priority',
            'start_date', 'end_date', 'created_at', 'updated_at',
            'image_source', 'is_currently_active'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_image_source(self, obj):
        """Return full image URL for the frontend"""
        image_source = obj.get_image_source()
        if image_source:
            # If it's already a full URL, return as is
            if image_source.startswith('http://') or image_source.startswith('https://'):
                return image_source
            # If it's a relative URL, make it absolute using request
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(image_source)
            # Fallback: return as is (will need frontend to prepend API URL)
            return image_source
        return None
    
    def get_is_currently_active(self, obj):
        return obj.is_currently_active()
