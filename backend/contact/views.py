from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters
from accounts.permissions import IsAdminUser
from .models import ContactMessage, SiteSettings
from .serializers import (
    ContactMessageSerializer, ContactMessageCreateSerializer,
    SiteSettingsSerializer, SiteSettingsAdminSerializer
)


class ContactMessageCreateView(generics.CreateAPIView):
    """Create contact message (public endpoint)"""
    permission_classes = [AllowAny]
    authentication_classes = []  # Disable authentication for public contact form
    serializer_class = ContactMessageCreateSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {'message': 'Thank you for your message. We will get back to you soon!'},
            status=status.HTTP_201_CREATED,
            headers=headers
        )


class ContactMessageListView(generics.ListAPIView):
    """List contact messages (admin only)"""
    permission_classes = [IsAdminUser]
    serializer_class = ContactMessageSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return ContactMessage.objects.all()


class ContactMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Contact message detail view (admin only)"""
    permission_classes = [IsAdminUser]
    serializer_class = ContactMessageSerializer
    queryset = ContactMessage.objects.all()


@api_view(['GET'])
@permission_classes([IsAdminUser])
def contact_stats(request):
    """Get contact message statistics"""
    stats = {
        'total_messages': ContactMessage.objects.count(),
        'new_messages': ContactMessage.objects.filter(status='new').count(),
        'read_messages': ContactMessage.objects.filter(status='read').count(),
        'replied_messages': ContactMessage.objects.filter(status='replied').count(),
        'closed_messages': ContactMessage.objects.filter(status='closed').count(),
    }
    return Response(stats)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_site_settings(request):
    """Get site settings (public endpoint)"""
    settings = SiteSettings.load()
    serializer = SiteSettingsSerializer(settings)
    return Response(serializer.data)


@api_view(['GET', 'PUT'])
@permission_classes([IsAdminUser])
def admin_site_settings(request):
    """Get or update site settings (admin only)"""
    settings = SiteSettings.load()
    
    if request.method == 'GET':
        serializer = SiteSettingsAdminSerializer(settings)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = SiteSettingsAdminSerializer(settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
