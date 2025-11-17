from rest_framework import serializers
from .models import ContactMessage, SiteSettings


class ContactMessageSerializer(serializers.ModelSerializer):
    """Serializer for contact messages"""
    
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'phone', 'message', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']


class ContactMessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating contact messages"""
    
    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'phone', 'message']
    
    def validate_email(self, value):
        """Validate email format"""
        if not value:
            raise serializers.ValidationError("Email is required")
        return value
    
    def validate_phone(self, value):
        """Validate phone number"""
        if not value:
            raise serializers.ValidationError("Phone number is required")
        # Basic phone validation (can be enhanced)
        if len(value) < 10:
            raise serializers.ValidationError("Phone number must be at least 10 digits")
        return value


class SiteSettingsSerializer(serializers.ModelSerializer):
    """Serializer for site settings (public read-only)"""
    
    class Meta:
        model = SiteSettings
        fields = [
            'contact_address', 'contact_phone', 'contact_email', 'working_hours',
            'facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url'
        ]


class SiteSettingsAdminSerializer(serializers.ModelSerializer):
    """Serializer for site settings (admin read-write)"""
    
    class Meta:
        model = SiteSettings
        fields = [
            'id', 'contact_address', 'contact_phone', 'contact_email', 'working_hours',
            'facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
