from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import AdminUser


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for AdminUser model"""
    
    class Meta:
        model = AdminUser
        fields = [
            'id',
            'username',
            'email',
            'phone',
            'first_name',
            'last_name',
            'is_admin',
            'is_active',
            'role',
            'auth_provider',
            'phone_verified',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'auth_provider']


class LoginSerializer(serializers.Serializer):
    """Serializer for admin login"""
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            # Try to authenticate with username first
            user = authenticate(username=username, password=password)
            
            # If authentication fails and input looks like email, try to find user by email
            if not user and '@' in username:
                try:
                    from .models import AdminUser
                    user_obj = AdminUser.objects.get(email=username)
                    # Now authenticate with the actual username
                    user = authenticate(username=user_obj.username, password=password)
                except AdminUser.DoesNotExist:
                    pass
            
            if not user:
                raise serializers.ValidationError('Invalid credentials. Please check your username/email and password.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            if not user.is_admin:
                raise serializers.ValidationError('Access denied. Admin privileges required.')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include username and password')


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect')
        return value


class GoogleAuthSerializer(serializers.Serializer):
    """Serializer for handling Auth0 Google login"""
    id_token = serializers.CharField()
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    role = serializers.ChoiceField(choices=AdminUser.Roles.choices, default=AdminUser.Roles.CUSTOMER)

    def validate(self, attrs):
        phone = attrs.get('phone')
        if phone:
            attrs['phone'] = phone.strip()
        return attrs
