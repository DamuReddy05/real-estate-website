import django_filters
from django.db.models import Q
from .models import Property
import re


class PropertyFilter(django_filters.FilterSet):
    """Filter for properties"""
    
    # Text search
    search = django_filters.CharFilter(method='filter_search')
    
    # Category and type filters
    category = django_filters.ChoiceFilter(choices=Property.CATEGORY_CHOICES)
    type = django_filters.ChoiceFilter(choices=Property.TYPE_CHOICES)
    status = django_filters.ChoiceFilter(choices=Property.STATUS_CHOICES)
    
    # Location filters
    city = django_filters.CharFilter(field_name='city', lookup_expr='icontains')
    state = django_filters.CharFilter(field_name='state', lookup_expr='icontains')
    
    # Numeric filters
    min_area = django_filters.NumberFilter(field_name='area', lookup_expr='gte')
    max_area = django_filters.NumberFilter(field_name='area', lookup_expr='lte')
    
    # Price filters (custom methods for string-based prices)
    min_price = django_filters.NumberFilter(method='filter_min_price')
    max_price = django_filters.NumberFilter(method='filter_max_price')
    
    # Bedroom and bathroom filters
    bedrooms = django_filters.CharFilter(field_name='bedrooms')
    bathrooms = django_filters.CharFilter(field_name='bathrooms')
    
    class Meta:
        model = Property
        fields = ['category', 'type', 'status', 'city', 'state', 'bedrooms', 'bathrooms']
    
    def filter_search(self, queryset, name, value):
        """Custom search filter"""
        if value:
            return queryset.filter(
                Q(title__icontains=value) |
                Q(location__icontains=value) |
                Q(city__icontains=value) |
                Q(description__icontains=value) |
                Q(amenities__icontains=value)
            )
        return queryset
    
    def extract_numeric_price(self, price_str):
        """Extract numeric price from string like '₹25 Lakh' or '₹1.5 Cr'"""
        if not price_str:
            return 0
        
        # Remove currency symbols and clean
        price_str = price_str.replace('₹', '').replace(',', '').strip()
        
        # Extract number
        match = re.search(r'[\d.]+', price_str)
        if not match:
            return 0
        
        num = float(match.group())
        
        # Convert based on unit
        if 'Cr' in price_str or 'Crore' in price_str:
            return num * 10000000  # 1 Cr = 1,00,00,000
        elif 'Lakh' in price_str or 'Lac' in price_str:
            return num * 100000  # 1 Lakh = 1,00,000
        else:
            return num
    
    def filter_min_price(self, queryset, name, value):
        """Filter properties with price >= min_price"""
        if value:
            filtered_ids = []
            for prop in queryset:
                numeric_price = self.extract_numeric_price(prop.price)
                if numeric_price >= value:
                    filtered_ids.append(prop.id)
            return queryset.filter(id__in=filtered_ids)
        return queryset
    
    def filter_max_price(self, queryset, name, value):
        """Filter properties with price <= max_price"""
        if value:
            filtered_ids = []
            for prop in queryset:
                numeric_price = self.extract_numeric_price(prop.price)
                if numeric_price <= value:
                    filtered_ids.append(prop.id)
            return queryset.filter(id__in=filtered_ids)
        return queryset
