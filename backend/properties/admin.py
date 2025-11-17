from django.contrib import admin
from .models import (
    Property,
    PropertyImage,
    City,
    Pincode,
    PropertyEnquiry,
    Tag,
    Category,
    SubCategory,
    Amenity,
)


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1
    fields = ['image', 'caption', 'is_primary']


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'subcategory', 'type', 'price', 'location', 'city', 'status', 'is_phone_approved', 'created_at']
    list_filter = ['category', 'subcategory', 'type', 'status', 'city', 'state', 'is_phone_approved', 'created_at', 'tags']
    search_fields = ['title', 'location', 'city', 'description', 'owner_name', 'owner_phone']
    list_editable = ['status', 'is_phone_approved']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'category', 'subcategory', 'type', 'price', 'location', 
                      'carpet_area', 'buildup_area', 'length', 'width', 'height')
        }),
        ('Property Details', {
            'fields': ('bedrooms', 'bathrooms', 'city', 'state', 'pincode')
        }),
        ('Additional Information', {
            'fields': ('description', 'amenities')
        }),
        ('Owner Information', {
            'fields': ('owner_name', 'owner_phone', 'owner_email', 'is_phone_approved')
        }),
        ('Tags', {
            'fields': ('tags',),
            'classes': ('collapse',)
        }),
        ('System Information', {
            'fields': ('status', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [PropertyImageInline]
    
    def save_model(self, request, obj, form, change):
        if not change:  # If creating new object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ['property', 'image', 'is_primary', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['property__title', 'caption']
    list_editable = ['is_primary']


@admin.register(Pincode)
class PincodeAdmin(admin.ModelAdmin):
    list_display = ['pincode', 'city', 'state', 'area', 'is_active', 'property_count', 'created_at']
    list_filter = ['state', 'city', 'is_active', 'created_at']
    search_fields = ['pincode', 'city', 'state', 'area']
    list_editable = ['is_active']
    ordering = ['pincode']
    
    fieldsets = (
        ('Pincode Information', {
            'fields': ('pincode', 'city', 'state', 'area')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )
    
    def property_count(self, obj):
        """Count properties with this pincode"""
        return Property.objects.filter(pincode=obj.pincode).count()
    property_count.short_description = 'Properties'


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ['name', 'state', 'is_active', 'property_count', 'created_at']
    list_filter = ['state', 'is_active', 'created_at']
    search_fields = ['name', 'state']
    list_editable = ['is_active']
    ordering = ['name']
    
    def property_count(self, obj):
        """Count properties in this city"""
        return Property.objects.filter(city=obj.name).count()
    property_count.short_description = 'Properties'


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'updated_at']
    list_filter = ['is_active']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'priority', 'is_active', 'updated_at']
    list_filter = ['is_active']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['priority', 'name']


@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'priority', 'is_active', 'updated_at']
    list_filter = ['category', 'is_active']
    search_fields = ['name', 'slug', 'category__name']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['category', 'priority', 'name']


@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'icon', 'priority', 'is_active', 'updated_at']
    list_filter = ['is_active']
    search_fields = ['name', 'slug', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['priority', 'name']


@admin.register(PropertyEnquiry)
class PropertyEnquiryAdmin(admin.ModelAdmin):
    list_display = ['property', 'name', 'phone', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['property__title', 'name', 'email', 'phone', 'message']
    readonly_fields = ['created_at', 'updated_at']
