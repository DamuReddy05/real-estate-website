from rest_framework import serializers
from .models import Property, PropertyImage, PropertyEnquiry, Tag, Category, SubCategory, City, Pincode, Amenity


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
            'id', 'pincode', 'city_ref', 'city_id', 'city', 'state',
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
    amenities = AmenitySerializer(many=True, read_only=True)
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

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else None
        data['owner_phone'] = instance.owner_phone_display(user)
        if instance.owner_phone and (
            instance.is_phone_approved or (
                user and getattr(user, 'is_authenticated', False) and
                (user == instance.created_by or getattr(user, 'is_admin', False) or getattr(user, 'is_staff', False))
            )
        ):
            data['owner_phone_full'] = instance.owner_phone
        else:
            data['owner_phone_full'] = None
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
            if not Pincode.objects.filter(city__iexact=city_name, pincode=pincode, is_active=True).exists():
                raise serializers.ValidationError({
                    'pincode': [f"Pincode {pincode} is not enabled for {city_name} yet."],
                    'error_code': 'pincode_not_allowed'
                })

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

    class Meta:
        model = PropertyEnquiry
        fields = [
            'id', 'property', 'property_title', 'property_location', 'property_primary_image',
            'status', 'message', 'created_at', 'updated_at'
        ]

    def get_property_primary_image(self, obj):
        primary_image = obj.property.images.filter(is_primary=True).first()
        if primary_image:
            return primary_image.get_image_source()
        first_image = obj.property.images.first()
        if first_image:
            return first_image.get_image_source()
        return None
