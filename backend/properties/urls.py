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
    path('tags/', views.TagListView.as_view(), name='tag_list'),
    path('admin/tags/', views.TagAdminListCreateView.as_view(), name='admin_tag_list'),
    path('admin/tags/<int:pk>/', views.TagAdminDetailView.as_view(), name='admin_tag_detail'),
    path('amenities/', views.AmenityListView.as_view(), name='amenity_list'),
    path('admin/amenities/', views.AmenityAdminListCreateView.as_view(), name='admin_amenity_list'),
    path('admin/amenities/<int:pk>/', views.AmenityAdminDetailView.as_view(), name='admin_amenity_detail'),
    path('categories/', views.CategoryListView.as_view(), name='category_list'),
    path('admin/categories/', views.CategoryAdminListCreateView.as_view(), name='admin_category_list'),
    path('admin/categories/<int:pk>/', views.CategoryAdminDetailView.as_view(), name='admin_category_detail'),
    path('admin/subcategories/', views.SubCategoryAdminListCreateView.as_view(), name='admin_subcategory_list'),
    path('admin/subcategories/<int:pk>/', views.SubCategoryAdminDetailView.as_view(), name='admin_subcategory_detail'),
    path('admin/cities/', views.CityAdminListCreateView.as_view(), name='admin_city_list'),
    path('admin/cities/<int:pk>/', views.CityAdminDetailView.as_view(), name='admin_city_detail'),
    path('admin/pincodes/', views.PincodeAdminListCreateView.as_view(), name='admin_pincode_list'),
    path('admin/pincodes/<int:pk>/', views.PincodeAdminDetailView.as_view(), name='admin_pincode_detail'),
    
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

    # Customer endpoints
    path('customer/my-properties/', views.CustomerPropertyListView.as_view(), name='customer_properties'),
    path('customer/my-properties/create/', views.CustomerPropertyCreateView.as_view(), name='customer_property_create'),
    path('customer/my-properties/<int:pk>/', views.CustomerPropertyDetailView.as_view(), name='customer_property_detail'),
    path('customer/my-properties/stats/', views.CustomerPropertyStatsView.as_view(), name='customer_property_stats'),
    path('customer/my-enquiries/', views.CustomerEnquiryListView.as_view(), name='customer_enquiries'),
    path('customer/<int:property_id>/images/', views.upload_property_image, name='customer_upload_property_image'),
    path('<int:property_id>/enquiries/', views.PropertyEnquiryCreateView.as_view(), name='property_enquiry_create'),
]
