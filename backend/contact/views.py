from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters
from .models import ContactMessage
from .serializers import ContactMessageSerializer, ContactMessageCreateSerializer


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
    permission_classes = [IsAuthenticated]
    serializer_class = ContactMessageSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return ContactMessage.objects.all()


class ContactMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Contact message detail view (admin only)"""
    permission_classes = [IsAuthenticated]
    serializer_class = ContactMessageSerializer
    queryset = ContactMessage.objects.all()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
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
