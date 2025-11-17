from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from django.db import models
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import Property, PropertyImage, PropertyEnquiry, Tag, Category, SubCategory, City, Pincode, Amenity
from .serializers import (
    PropertySerializer, PropertyListSerializer, PropertyCreateUpdateSerializer,
    PropertyImageSerializer, PropertyStatsSerializer, PropertyEnquirySerializer,
    TagSerializer, CategorySerializer, SubCategorySerializer,
    CityAdminSerializer, PincodeAdminSerializer, CityPublicSerializer, AmenitySerializer
)
from .filters import PropertyFilter


class PropertyListView(generics.ListAPIView):
    """List all active properties (public endpoint)"""
    permission_classes = [AllowAny]
    authentication_classes = []  # Disable authentication for public property list
    serializer_class = PropertyListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PropertyFilter
    search_fields = ['title', 'location', 'city', 'description']
    ordering_fields = ['created_at', 'price', 'area']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Property.objects.filter(status='active').select_related('created_by').prefetch_related('images', 'enquiries', 'tags')


class PropertyDetailView(generics.RetrieveAPIView):
    """Get property details (public endpoint)"""
    permission_classes = [AllowAny]
    authentication_classes = []  # Disable authentication for public property detail
    serializer_class = PropertySerializer
    queryset = Property.objects.filter(status='active').select_related('created_by').prefetch_related('images', 'enquiries', 'tags')


class PropertyCreateView(generics.CreateAPIView):
    """Create new property (admin only)"""
    permission_classes = [IsAuthenticated]
    serializer_class = PropertyCreateUpdateSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PropertyUpdateView(generics.UpdateAPIView):
    """Update property (admin only)"""
    permission_classes = [IsAuthenticated]
    serializer_class = PropertyCreateUpdateSerializer
    queryset = Property.objects.all()


class PropertyDeleteView(generics.DestroyAPIView):
    """Delete property (admin only)"""
    permission_classes = [IsAuthenticated]
    queryset = Property.objects.all()


class AdminPropertyListView(generics.ListAPIView):
    """List all properties for admin (including inactive)"""
    permission_classes = [IsAuthenticated]
    serializer_class = PropertySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PropertyFilter
    search_fields = ['title', 'location', 'city', 'description']
    ordering_fields = ['created_at', 'price', 'area']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Property.objects.all().select_related('created_by').prefetch_related('images', 'enquiries', 'tags')


class AdminPropertyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin property detail view with full CRUD"""
    permission_classes = [IsAuthenticated]
    serializer_class = PropertySerializer
    queryset = Property.objects.all().select_related('created_by').prefetch_related('images', 'enquiries', 'tags')


class CustomerPropertyListView(generics.ListAPIView):
    """List properties created by the logged-in customer"""
    permission_classes = [IsAuthenticated]
    serializer_class = PropertyListSerializer

    def get_queryset(self):
        return Property.objects.filter(created_by=self.request.user).prefetch_related('images', 'enquiries', 'tags')


class CustomerPropertyCreateView(generics.CreateAPIView):
    """Create new property (customer endpoint)"""
    permission_classes = [IsAuthenticated]
    serializer_class = PropertyCreateUpdateSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class CustomerPropertyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Customer property detail view with full CRUD"""
    permission_classes = [IsAuthenticated]
    serializer_class = PropertySerializer
    
    def get_queryset(self):
        # Only allow customers to access their own properties
        return Property.objects.filter(created_by=self.request.user).select_related('created_by').prefetch_related('images', 'enquiries', 'tags')


class CustomerEnquiryListView(generics.ListAPIView):
    """List enquiries created by the customer"""
    permission_classes = [IsAuthenticated]
    serializer_class = PropertyEnquirySerializer

    def get_queryset(self):
        return PropertyEnquiry.objects.filter(user=self.request.user).select_related('property', 'property__created_by').prefetch_related('property__images')


class CustomerPropertyStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        properties = Property.objects.filter(created_by=request.user)
        stats = {
            'total_properties': properties.count(),
            'active_properties': properties.filter(status='active').count(),
            'inactive_properties': properties.exclude(status='active').count(),
            'pending_phone_approval': properties.filter(is_phone_approved=False).count(),
            'enquiries_received': PropertyEnquiry.objects.filter(property__created_by=request.user).count(),
            'enquiries_sent': PropertyEnquiry.objects.filter(user=request.user).count(),
        }
        return Response(stats)


class PropertyEnquiryCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, property_id):
        property_obj = get_object_or_404(Property, pk=property_id, status='active')
        if property_obj.created_by == request.user:
            return Response({'detail': 'You cannot enquire about your own property.'}, status=status.HTTP_400_BAD_REQUEST)

        name = request.data.get('name') or request.user.first_name or request.user.username
        email = request.data.get('email') or request.user.email
        phone = request.data.get('phone') or getattr(request.user, 'phone', None)
        message = request.data.get('message', '')

        if not phone:
            return Response({'detail': 'Phone number is required to contact owner.'}, status=status.HTTP_400_BAD_REQUEST)

        enquiry = PropertyEnquiry.objects.create(
            property=property_obj,
            user=request.user,
            name=name,
            email=email,
            phone=phone,
            message=message
        )
        serializer = PropertyEnquirySerializer(enquiry, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TagListView(generics.ListAPIView):
    """Public endpoint to list active tags"""
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = TagSerializer
    pagination_class = None

    def get_queryset(self):
        return Tag.objects.filter(is_active=True).order_by('name')


class TagAdminListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TagSerializer
    queryset = Tag.objects.all().order_by('name')
    pagination_class = None


class TagAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TagSerializer
    queryset = Tag.objects.all()


class AmenityListView(generics.ListAPIView):
    """List all active amenities (public)"""
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = AmenitySerializer
    pagination_class = None

    def get_queryset(self):
        return Amenity.objects.filter(is_active=True).order_by('priority', 'name')


class AmenityAdminListCreateView(generics.ListCreateAPIView):
    """Admin: List and create amenities"""
    permission_classes = [IsAuthenticated]
    serializer_class = AmenitySerializer
    queryset = Amenity.objects.all().order_by('priority', 'name')
    pagination_class = None


class AmenityAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Amenity detail view"""
    permission_classes = [IsAuthenticated]
    serializer_class = AmenitySerializer
    queryset = Amenity.objects.all()


class CityAdminListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CityAdminSerializer
    queryset = City.objects.all().order_by('name')
    pagination_class = None


class CityAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CityAdminSerializer
    queryset = City.objects.all()


class PincodeAdminListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PincodeAdminSerializer
    pagination_class = None

    def get_queryset(self):
        qs = Pincode.objects.all().order_by('pincode')
        city_id = self.request.query_params.get('city')
        if city_id:
            city = City.objects.filter(pk=city_id).first()
            if city:
                qs = qs.filter(city__iexact=city.name)
        return qs


class PincodeAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PincodeAdminSerializer
    queryset = Pincode.objects.all()
    pagination_class = None


class CategoryListView(generics.ListAPIView):
    """Public endpoint to list categories with subcategories"""
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = CategorySerializer
    pagination_class = None

    def get_queryset(self):
        return Category.objects.filter(is_active=True).prefetch_related('subcategories').order_by('priority', 'name')


class CategoryAdminListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CategorySerializer
    pagination_class = None

    def get_queryset(self):
        return Category.objects.all().prefetch_related('subcategories').order_by('priority', 'name')


class CategoryAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CategorySerializer
    queryset = Category.objects.all()


class SubCategoryAdminListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubCategorySerializer
    pagination_class = None

    def get_queryset(self):
        qs = SubCategory.objects.select_related('category').order_by('category__name', 'priority', 'name')
        category_id = self.request.query_params.get('category')
        if category_id:
            qs = qs.filter(category_id=category_id)
        return qs


class SubCategoryAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubCategorySerializer
    queryset = SubCategory.objects.all()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def property_stats(request):
    """Get property statistics for dashboard"""
    stats = {
        'total_properties': Property.objects.count(),
        'for_sale': Property.objects.filter(type='For Sale').count(),
        'for_rent': Property.objects.filter(type='For Rent').count(),
        'plots': Property.objects.filter(category='plot').count(),
        'active_properties': Property.objects.filter(status='active').count(),
        'inactive_properties': Property.objects.filter(status='inactive').count(),
        
        # Category breakdown
        'flats': Property.objects.filter(category='flat').count(),
        'houses': Property.objects.filter(category='house').count(),
        'commercial': Property.objects.filter(category='commercial').count(),
        
        # Popular locations (top 5)
        'popular_locations': list(Property.objects.filter(status='active').values('city').annotate(
            count=models.Count('id')
        ).order_by('-count')[:5]),
        
        # Price ranges (simplified)
        'price_ranges': {
            'under_50k': Property.objects.filter(status='active', type='For Rent').count(),
            '50k_to_1lakh': Property.objects.filter(status='active', type='For Sale').count(),
        }
    }
    
    serializer = PropertyStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_property_status(request, pk):
    """Toggle property status between active and inactive"""
    try:
        property_obj = Property.objects.get(pk=pk)
        if property_obj.status == 'active':
            property_obj.status = 'inactive'
        else:
            property_obj.status = 'active'
        property_obj.save()
        
        serializer = PropertySerializer(property_obj)
        return Response(serializer.data)
    except Property.DoesNotExist:
        return Response({'error': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_property_image(request, property_id):
    """Upload image for a property to Cloudinary"""
    import cloudinary.uploader
    
    try:
        # Validate property exists
        try:
            property_obj = Property.objects.get(pk=property_id)
        except Property.DoesNotExist:
            return Response({
                'error': 'Property not found',
                'message': f'Property with ID {property_id} does not exist.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user owns the property (for customers) or is admin
        if not (property_obj.created_by == request.user or getattr(request.user, 'is_admin', False) or getattr(request.user, 'is_staff', False)):
            return Response({
                'error': 'Permission denied',
                'message': 'You can only upload images for your own properties.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Validate image file
        if 'image' not in request.FILES:
            return Response({
                'error': 'No image provided',
                'message': 'Please select an image file to upload.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        image_file = request.FILES['image']
        
        # Validate file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if image_file.size > max_size:
            return Response({
                'error': 'File too large',
                'message': f'Image size must be less than 10MB. Your file is {image_file.size / (1024 * 1024):.2f}MB.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if image_file.content_type not in allowed_types:
            return Response({
                'error': 'Invalid file type',
                'message': f'Only JPEG, PNG, and WebP images are allowed. You uploaded: {image_file.content_type}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Upload to Cloudinary
        try:
            upload_result = cloudinary.uploader.upload(
                image_file,
                folder=f"realestate/properties/{property_id}",
                resource_type="auto",
                transformation=[
                    {'width': 1200, 'height': 800, 'crop': 'limit'},
                    {'quality': 'auto:good'}
                ]
            )
        except Exception as cloudinary_error:
            return Response({
                'error': 'Cloud upload failed',
                'message': f'Failed to upload image to cloud storage. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Save the Cloudinary URL to database
        image_data = {
            'property': property_obj.id,
            'image_url': upload_result['secure_url'],
            'caption': request.data.get('caption', ''),
            'is_primary': request.data.get('is_primary', False)
        }
        
        serializer = PropertyImageSerializer(data=image_data)
        if serializer.is_valid():
            image_instance = serializer.save()
            return Response({
                'id': image_instance.id,
                'image': image_instance.get_image_source(),
                'image_url': image_instance.image_url,
                'caption': image_instance.caption,
                'is_primary': image_instance.is_primary,
                'message': 'Image uploaded successfully!'
            }, status=status.HTTP_201_CREATED)
        else:
            # Return detailed validation errors
            error_messages = []
            for field, errors in serializer.errors.items():
                for error in errors:
                    error_messages.append(f"{field}: {error}")
            
            return Response({
                'error': 'Validation failed',
                'message': ' | '.join(error_messages),
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        import traceback
        print(f"Unexpected error during image upload: {str(e)}")
        print(traceback.format_exc())
        return Response({
            'error': 'Unexpected error',
            'message': 'An unexpected error occurred while uploading the image. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_property_image(request, image_id):
    """Delete a property image from Cloudinary and database"""
    import cloudinary.uploader
    import re
    
    try:
        image = PropertyImage.objects.get(pk=image_id)
        
        # Delete from Cloudinary if image_url exists
        if image.image_url:
            try:
                # Extract public_id from Cloudinary URL
                # URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
                match = re.search(r'/realestate/properties/\d+/[^/]+$', image.image_url)
                if match:
                    public_id = match.group(0).replace('.jpg', '').replace('.png', '').replace('.jpeg', '').lstrip('/')
                    cloudinary.uploader.destroy(public_id)
            except Exception as e:
                print(f"Failed to delete from Cloudinary: {str(e)}")
                # Continue with database deletion even if Cloudinary deletion fails
        
        # Delete from database
        image.delete()
        return Response({'message': 'Image deleted successfully'}, status=status.HTTP_200_OK)
    except PropertyImage.DoesNotExist:
        return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Delete failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_property_stats(request):
    """Get public property statistics"""
    from django.utils import timezone
    from datetime import timedelta
    
    # Get current time for recent calculations
    now = timezone.now()
    last_30_days = now - timedelta(days=30)
    last_7_days = now - timedelta(days=7)
    
    stats = {
        'total_properties': Property.objects.filter(status='active').count(),
        'for_sale': Property.objects.filter(status='active', type='For Sale').count(),
        'for_rent': Property.objects.filter(status='active', type='For Rent').count(),
        'plots': Property.objects.filter(status='active', category='plot').count(),
        'active_properties': Property.objects.filter(status='active').count(),
        'inactive_properties': Property.objects.filter(status='inactive').count(),
        
        # Recent uploads
        'recent_uploads_7_days': Property.objects.filter(status='active', created_at__gte=last_7_days).count(),
        'recent_uploads_30_days': Property.objects.filter(status='active', created_at__gte=last_30_days).count(),
        
        # Category breakdown
        'flats': Property.objects.filter(status='active', category='flat').count(),
        'houses': Property.objects.filter(status='active', category='house').count(),
        'commercial': Property.objects.filter(status='active', category='commercial').count(),
        
        # Popular locations (top 5)
        'popular_locations': list(Property.objects.filter(status='active').values('city').annotate(
            count=models.Count('id')
        ).order_by('-count')[:5]),
        
        # Price ranges
        'price_ranges': {
            'under_50k': Property.objects.filter(status='active', type='For Rent').count(),  # Simplified for demo
            '50k_to_1lakh': Property.objects.filter(status='active', type='For Sale').count(),  # Simplified for demo
        }
    }
    
    serializer = PropertyStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def tab_specific_stats(request, tab_type):
    """Get tab-specific statistics and data"""
    from django.utils import timezone
    from datetime import timedelta
    
    now = timezone.now()
    last_30_days = now - timedelta(days=30)
    last_7_days = now - timedelta(days=7)
    
    if tab_type == 'buy':
        # For Sale properties
        base_query = Property.objects.filter(status='active', type='For Sale')
        stats = {
            'total_count': base_query.count(),
            'recent_uploads_7_days': base_query.filter(created_at__gte=last_7_days).count(),
            'recent_uploads_30_days': base_query.filter(created_at__gte=last_30_days).count(),
            'categories': {
                'flats': base_query.filter(category='flat').count(),
                'houses': base_query.filter(category='house').count(),
                'plots': base_query.filter(category='plot').count(),
                'commercial': base_query.filter(category='commercial').count(),
            },
            'popular_locations': list(base_query.values('city').annotate(
                count=Count('id')
            ).order_by('-count')[:5]),
        }
    elif tab_type == 'rent':
        # For Rent properties
        base_query = Property.objects.filter(status='active', type='For Rent')
        stats = {
            'total_count': base_query.count(),
            'recent_uploads_7_days': base_query.filter(created_at__gte=last_7_days).count(),
            'recent_uploads_30_days': base_query.filter(created_at__gte=last_30_days).count(),
            'categories': {
                'flats': base_query.filter(category='flat').count(),
                'houses': base_query.filter(category='house').count(),
                'plots': base_query.filter(category='plot').count(),
                'commercial': base_query.filter(category='commercial').count(),
            },
            'popular_locations': list(base_query.values('city').annotate(
                count=Count('id')
            ).order_by('-count')[:5]),
        }
    elif tab_type == 'plot':
        # Plot properties
        base_query = Property.objects.filter(status='active', category='plot')
        stats = {
            'total_count': base_query.count(),
            'recent_uploads_7_days': base_query.filter(created_at__gte=last_7_days).count(),
            'recent_uploads_30_days': base_query.filter(created_at__gte=last_30_days).count(),
            'categories': {
                'residential_plots': base_query.filter(type='For Sale').count(),
                'commercial_plots': base_query.filter(type='For Rent').count(),
            },
            'popular_locations': list(base_query.values('city').annotate(
                count=Count('id')
            ).order_by('-count')[:5]),
        }
    else:
        return Response({'error': 'Invalid tab type'}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([AllowAny])
def search_properties(request):
    """Advanced search for properties"""
    query = request.GET.get('q', '')
    category = request.GET.get('category', '')
    property_type = request.GET.get('type', '')
    min_price = request.GET.get('min_price')
    max_price = request.GET.get('max_price')
    city = request.GET.get('city', '')
    
    queryset = Property.objects.filter(status='active')
    
    if query:
        queryset = queryset.filter(
            Q(title__icontains=query) |
            Q(location__icontains=query) |
            Q(city__icontains=query) |
            Q(description__icontains=query)
        )
    
    if category:
        queryset = queryset.filter(category=category)
    
    if property_type:
        queryset = queryset.filter(type=property_type)
    
    if city:
        queryset = queryset.filter(city__icontains=city)
    
    # Note: Price filtering would need more complex logic to parse price strings
    # This is a simplified version
    
    serializer = PropertyListSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_cities(request):
    """Get all active cities from City model"""
    cities = City.objects.filter(is_active=True).order_by('name')
    serializer = CityPublicSerializer(cities, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def lookup_pincode(request, pincode):
    """Lookup city and state by pincode"""
    from .models import Pincode
    
    try:
        pincode_obj = Pincode.objects.get(pincode=pincode, is_active=True)
        return Response({
            'pincode': pincode_obj.pincode,
            'city': pincode_obj.city,
            'state': pincode_obj.state,
            'area': pincode_obj.area or '',
            'found': True
        })
    except Pincode.DoesNotExist:
        return Response({
            'pincode': pincode,
            'found': False,
            'message': 'Pincode not found. Please add it or contact admin.'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def track_property_view(request, pk):
    """Increment property view count"""
    try:
        property_obj = Property.objects.get(pk=pk, status='active')
        property_obj.view_count += 1
        property_obj.save(update_fields=['view_count'])
        return Response({'view_count': property_obj.view_count}, status=status.HTTP_200_OK)
    except Property.DoesNotExist:
        return Response({'error': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)
