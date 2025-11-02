from django.urls import path
from . import views

urlpatterns = [
    # Public endpoints
    path('', views.PropertyListView.as_view(), name='property_list'),
    path('<int:pk>/', views.PropertyDetailView.as_view(), name='property_detail'),
    path('<int:pk>/track-view/', views.track_property_view, name='track_property_view'),
    path('search/', views.search_properties, name='search_properties'),
    path('stats/', views.public_property_stats, name='public_property_stats'),
    path('stats/<str:tab_type>/', views.tab_specific_stats, name='tab_specific_stats'),
    path('cities/', views.get_cities, name='get_cities'),
    path('pincode/<str:pincode>/', views.lookup_pincode, name='lookup_pincode'),
    
    # Admin endpoints
    path('admin/', views.AdminPropertyListView.as_view(), name='admin_property_list'),
    path('admin/create/', views.PropertyCreateView.as_view(), name='property_create'),
    path('admin/<int:pk>/', views.AdminPropertyDetailView.as_view(), name='admin_property_detail'),
    path('admin/<int:pk>/toggle-status/', views.toggle_property_status, name='toggle_property_status'),
    
    # Image endpoints
    path('admin/<int:property_id>/images/', views.upload_property_image, name='upload_property_image'),
    path('admin/images/<int:image_id>/', views.delete_property_image, name='delete_property_image'),
    
    # Stats endpoint
    path('admin/stats/', views.property_stats, name='property_stats'),
]
