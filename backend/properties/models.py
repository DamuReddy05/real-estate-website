from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator, URLValidator
from django.utils.text import slugify

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


class Tag(models.Model):
    """Reusable tags for properties"""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.CharField(max_length=200, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'property_tags'
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Category(models.Model):
    """Top-level property categories (e.g., Apartments, Villas)"""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    description = models.CharField(max_length=255, blank=True, null=True)
    priority = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'property_categories'
        ordering = ['priority', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class SubCategory(models.Model):
    """Child category grouped under a Category (e.g., 2 BHK, Ready to Move)"""
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories')
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=160, unique=True, blank=True)
    description = models.CharField(max_length=255, blank=True, null=True)
    priority = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'property_subcategories'
        unique_together = ('category', 'name')
        ordering = ['category', 'priority', 'name']

    def __str__(self):
        return f"{self.category.name} - {self.name}"

    def save(self, *args, **kwargs):
        if not self.slug:
            base = f"{self.category.slug}-{self.name}" if self.category_id else self.name
            self.slug = slugify(base)
        super().save(*args, **kwargs)


class Amenity(models.Model):
    """Amenity model for property amenities"""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True, help_text="Font Awesome icon class")
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'amenities'
        ordering = ['priority', 'name']
        verbose_name_plural = 'Amenities'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base = self.name
            self.slug = slugify(base)
        super().save(*args, **kwargs)


class Property(models.Model):
    """Property model with all required fields"""
    
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
    category = models.CharField(max_length=120, blank=True, null=True)
    subcategory = models.CharField(max_length=120, blank=True, null=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    price = models.BigIntegerField(validators=[MinValueValidator(0)], help_text="Price in rupees (integer)")
    location = models.CharField(max_length=200)
    carpet_area = models.PositiveIntegerField(validators=[MinValueValidator(1)], help_text="Carpet area in sq ft")
    buildup_area = models.PositiveIntegerField(validators=[MinValueValidator(1)], help_text="Buildup area in sq ft", blank=True, null=True)
    
    # Dimensions (optional, for plots/land)
    length = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text="Length in feet")
    width = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text="Width in feet")
    height = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text="Height in feet (for buildings)")
    
    # Property Details
    bedrooms = models.CharField(max_length=10, default='N/A')  # Can be 'N/A' for plots
    bathrooms = models.CharField(max_length=10, default='N/A')  # Can be 'N/A' for plots
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    
    # Additional Information
    description = models.TextField(blank=True, null=True)
    amenities = models.ManyToManyField('Amenity', blank=True, related_name='properties')
    
    # Owner Information
    owner_name = models.CharField(max_length=100, blank=True, null=True)
    owner_phone = models.CharField(max_length=15, blank=True, null=True)
    owner_email = models.EmailField(blank=True, null=True)
    tags = models.ManyToManyField(Tag, blank=True, related_name='properties')
    is_phone_approved = models.BooleanField(default=False)
    
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
        """Return amenities as a list of names"""
        return [amenity.name for amenity in self.amenities.all()]

    @property
    def masked_owner_phone(self):
        """Return masked version of owner phone"""
        if not self.owner_phone:
            return None
        if len(self.owner_phone) <= 4:
            return '*' * len(self.owner_phone)
        return f"{self.owner_phone[:2]}{'*' * (len(self.owner_phone) - 4)}{self.owner_phone[-2:]}"

    def owner_phone_display(self, user=None):
        """Determine which phone value should be exposed"""
        if not self.owner_phone:
            return None
        if self.is_phone_approved:
            return self.owner_phone
        if user and getattr(user, 'is_authenticated', False):
            if user == self.created_by or getattr(user, 'is_admin', False) or getattr(user, 'is_staff', False):
                return self.owner_phone
        return self.masked_owner_phone


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


class PropertyEnquiry(models.Model):
    """Enquiries raised by customers for properties"""

    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('scheduled', 'Visit Scheduled'),
        ('closed', 'Closed'),
    ]

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='enquiries')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='property_enquiries')
    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'property_enquiries'
        ordering = ['-created_at']

    def __str__(self):
        return f"Enquiry #{self.id} - {self.property.title}"


class Banner(models.Model):
    """Model for managing advertisable banners"""
    
    BANNER_TYPE_CHOICES = [
        ('main_banner', 'Main Banner'),
        ('buy_banner', 'Buy Banner'),
        ('rent_banner', 'Rent Banner'),
    ]
    
    name = models.CharField(max_length=200, help_text="Internal name for this banner")
    banner_type = models.CharField(max_length=20, choices=BANNER_TYPE_CHOICES, help_text="Where this banner will be displayed")
    image = models.ImageField(upload_to='banners/', blank=True, null=True, help_text="Banner image file")
    image_url = models.URLField(max_length=500, blank=True, null=True, validators=[URLValidator()], help_text="External image URL (alternative to upload)")
    link_url = models.URLField(max_length=500, blank=True, null=True, validators=[URLValidator()], help_text="URL to navigate when banner is clicked")
    title = models.CharField(max_length=200, blank=True, null=True, help_text="Optional banner title/text overlay")
    description = models.TextField(blank=True, null=True, help_text="Optional banner description")
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0, help_text="Higher priority banners appear first")
    start_date = models.DateTimeField(blank=True, null=True, help_text="Optional: Start date for banner display")
    end_date = models.DateTimeField(blank=True, null=True, help_text="Optional: End date for banner display")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'banners'
        ordering = ['-priority', '-created_at']
        verbose_name_plural = 'Banners'
    
    def __str__(self):
        return f"{self.name} ({self.get_banner_type_display()})"
    
    def get_image_source(self):
        """Return image URL or uploaded image URL"""
        if self.image_url:
            return self.image_url
        elif self.image:
            return self.image.url
        return None
    
    def is_currently_active(self):
        """Check if banner should be displayed based on dates"""
        from django.utils import timezone
        now = timezone.now()
        if not self.is_active:
            return False
        if self.start_date and now < self.start_date:
            return False
        if self.end_date and now > self.end_date:
            return False
        return True
