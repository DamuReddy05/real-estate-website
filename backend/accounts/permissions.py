from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users (is_admin=True) to access.
    This ensures that customers with Auth0 authentication cannot access admin endpoints.
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user is an admin
        return getattr(request.user, 'is_admin', False) and request.user.is_active


