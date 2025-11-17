from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='admin_login'),
    path('google-login/', views.GoogleAuthView.as_view(), name='google_login'),
    path('logout/', views.LogoutView.as_view(), name='admin_logout'),
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('user-info/', views.user_info, name='user_info'),
]
