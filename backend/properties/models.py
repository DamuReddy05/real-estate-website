from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class Pincode(models.Model):
    """Model for managing pincodes with city and state"""
    pincode = models.CharField(max_length=10, unique=True, db_index=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    area = models.CharField(max_length=200, blank=True, null=True)  # Optional: specific area/locality
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'pincodes'
        ordering = ['pincode']
        verbose_name_plural = 'Pincodes'
    
    def __str__(self):
        return f"{self.pincode} - {self.city}, {self.state}"


class City(models.Model):
    """Model for managing cities to ensure consistency"""
    name = models.CharField(max_length=100, unique=True)
    state = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'cities'
        ordering = ['name']
        verbose_name_plural = 'Cities'
    
    def __str__(self):
        return f"{self.name}, {self.state}"


class Property(models.Model):
    """Property model with all required fields"""
    
    CATEGORY_CHOICES = [
        ('flat', 'Flat/Apartment'),
        ('house', 'House/Villa'),
        ('plot', 'Plot'),
        ('commercial', 'Commercial'),
    ]
    
    TYPE_CHOICES = [
        ('For Sale', 'For Sale'),
        ('For Rent', 'For Rent'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('sold', 'Sold'),
        ('rented', 'Rented'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    price = models.CharField(max_length=100)  # Store as string to handle various formats
    location = models.CharField(max_length=200)
    area = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    
    # Property Details
    bedrooms = models.CharField(max_length=10, default='N/A')  # Can be 'N/A' for plots
    bathrooms = models.CharField(max_length=10, default='N/A')  # Can be 'N/A' for plots
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    
    # Additional Information
    description = models.TextField(blank=True, null=True)
    amenities = models.TextField(blank=True, null=True)  # Comma-separated amenities
    
    # Owner Information
    owner_name = models.CharField(max_length=100, blank=True, null=True)
    owner_phone = models.CharField(max_length=15, blank=True, null=True)
    owner_email = models.EmailField(blank=True, null=True)
    
    # System Fields
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_properties')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Analytics
    view_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'properties'
        ordering = ['-created_at']
        verbose_name_plural = 'Properties'
    
    def __str__(self):
        return f"{self.title} - {self.location}"
    
    @property
    def is_active(self):
        return self.status == 'active'
    
    @property
    def amenities_list(self):
        """Return amenities as a list"""
        if self.amenities:
            return [amenity.strip() for amenity in self.amenities.split(',')]
        return []


class PropertyImage(models.Model):
    """Model for property images"""
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='property_images/', blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)  # For external URLs
    caption = models.CharField(max_length=200, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'property_images'
        ordering = ['-is_primary', 'created_at']
    
    def __str__(self):
        return f"{self.property.title} - Image {self.id}"
    
    def get_image_source(self):
        """Return image URL or uploaded image URL"""
        if self.image_url:
            return self.image_url
        elif self.image:
            return self.image.url
        return None
    
    def save(self, *args, **kwargs):
        # If this is set as primary, unset other primary images for this property
        if self.is_primary:
            PropertyImage.objects.filter(property=self.property, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)
