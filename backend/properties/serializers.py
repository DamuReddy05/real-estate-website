from rest_framework import serializers
from .models import Property, PropertyImage


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


class PropertySerializer(serializers.ModelSerializer):
    """Serializer for Property model"""
    images = PropertyImageSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    amenities_list = serializers.ReadOnlyField()
    
    class Meta:
        model = Property
        fields = [
            'id', 'title', 'category', 'type', 'price', 'location', 'area',
            'bedrooms', 'bathrooms', 'city', 'state', 'pincode', 'description',
            'amenities', 'amenities_list', 'owner_name', 'owner_phone', 'owner_email',
            'status', 'created_by', 'created_by_name', 'created_at', 'updated_at', 'images'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Set the created_by field to the current user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class PropertyListSerializer(serializers.ModelSerializer):
    """Simplified serializer for property lists"""
    primary_image = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Property
        fields = [
            'id', 'title', 'category', 'type', 'price', 'location', 'area',
            'bedrooms', 'bathrooms', 'city', 'state', 'status', 'primary_image',
            'images', 'created_by_name', 'created_at', 'view_count'
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


class PropertyCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating properties"""
    
    class Meta:
        model = Property
        fields = [
            'title', 'category', 'type', 'price', 'location', 'area',
            'bedrooms', 'bathrooms', 'city', 'state', 'pincode', 'description',
            'amenities', 'owner_name', 'owner_phone', 'owner_email', 'status'
        ]
    
    def create(self, validated_data):
        # Set the created_by field to the current user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


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
