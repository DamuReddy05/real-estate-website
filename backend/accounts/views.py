import logging
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import login
from django.db import transaction
from .models import AdminUser
from .serializers import (
    AdminUserSerializer,
    LoginSerializer,
    ChangePasswordSerializer,
    GoogleAuthSerializer
)
from .auth0 import verify_auth0_token

logger = logging.getLogger(__name__)


def _generate_username(email: str) -> str:
    base_username = email.split('@')[0].replace('+', '.')
    username = base_username
    counter = 1
    while AdminUser.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1
    return username


class LoginView(generics.GenericAPIView):
    """Admin login view"""
    permission_classes = [AllowAny]
    authentication_classes = []  # Disable authentication for login
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': AdminUserSerializer(user).data
        }, status=status.HTTP_200_OK)


class LogoutView(generics.GenericAPIView):
    """Admin logout view"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Since we're not using blacklist, just return success
        return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    permission_classes = [IsAuthenticated]
    serializer_class = AdminUserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.GenericAPIView):
    """Change password view"""
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    """Get current user information"""
    serializer = AdminUserSerializer(request.user)
    return Response(serializer.data)


class GoogleAuthView(generics.GenericAPIView):
    """Handle Auth0 Google login for customers and admins"""
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = GoogleAuthSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        id_token = serializer.validated_data['id_token']
        phone = serializer.validated_data.get('phone')
        target_role = serializer.validated_data['role']

        try:
            payload = verify_auth0_token(id_token)
        except Exception as exc:  # noqa: BLE001
            logger.exception("Auth0 token verification failed")
            raise AuthenticationFailed(f'Invalid Google token: {exc}') from exc

        email = payload.get('email')
        if not email:
            return Response({'detail': 'Email not provided by Google'}, status=status.HTTP_400_BAD_REQUEST)

        first_name = payload.get('given_name') or ''
        last_name = payload.get('family_name') or ''

        with transaction.atomic():
            user, created = AdminUser.objects.select_for_update().get_or_create(
                email=email,
                defaults={
                    'username': _generate_username(email),
                    'first_name': first_name,
                    'last_name': last_name,
                    'role': target_role,
                    'auth_provider': AdminUser.AuthProviders.GOOGLE,
                }
            )

            if target_role == AdminUser.Roles.ADMIN and not user.is_admin:
                return Response({'detail': 'You are not authorized as admin'}, status=status.HTTP_403_FORBIDDEN)

            update_fields = set()

            if created:
                update_fields.update({'first_name', 'last_name'})

            if user.auth_provider != AdminUser.AuthProviders.GOOGLE:
                user.auth_provider = AdminUser.AuthProviders.GOOGLE
                update_fields.add('auth_provider')

            needs_phone = not user.phone
            if needs_phone and not phone:
                return Response(
                    {'code': 'phone_required', 'message': 'Phone number required to complete signup.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if phone:
                user.phone = phone
                user.phone_verified = True
                update_fields.update({'phone', 'phone_verified'})

            if target_role == AdminUser.Roles.CUSTOMER:
                user.role = AdminUser.Roles.CUSTOMER
                update_fields.add('role')
            else:
                user.role = AdminUser.Roles.ADMIN
                update_fields.add('role')

            if first_name and user.first_name != first_name:
                user.first_name = first_name
                update_fields.add('first_name')

            if last_name and user.last_name != last_name:
                user.last_name = last_name
                update_fields.add('last_name')

            if created or update_fields:
                if created:
                    user.save()
                else:
                    user.save(update_fields=list(update_fields))

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': AdminUserSerializer(user).data
        }, status=status.HTTP_200_OK)
