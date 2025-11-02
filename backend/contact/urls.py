from django.urls import path
from . import views

urlpatterns = [
    path('', views.ContactMessageCreateView.as_view(), name='contact_create'),
    path('admin/', views.ContactMessageListView.as_view(), name='contact_list'),
    path('admin/<int:pk>/', views.ContactMessageDetailView.as_view(), name='contact_detail'),
    path('admin/stats/', views.contact_stats, name='contact_stats'),
]
