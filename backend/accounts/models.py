from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class AdminUser(AbstractUser):
    """Custom user model for admin users"""
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_admin = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    phone_verified = models.BooleanField(default=False)

    class Roles(models.TextChoices):
        ADMIN = 'admin', _('Admin')
        CUSTOMER = 'customer', _('Customer')

    class AuthProviders(models.TextChoices):
        PASSWORD = 'password', _('Password')
        GOOGLE = 'google', _('Google')

    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.ADMIN)
    auth_provider = models.CharField(
        max_length=20,
        choices=AuthProviders.choices,
        default=AuthProviders.PASSWORD
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'admin_users'

    def __str__(self):
        return self.email

    @property
    def masked_phone(self):
        if not self.phone:
            return None
        if len(self.phone) <= 4:
            return '*' * len(self.phone)
        return f"{self.phone[:2]}{'*' * (len(self.phone) - 4)}{self.phone[-2:]}"

    def save(self, *args, **kwargs):
        # Ensure admin flags align with role
        if self.is_superuser:
            self.role = self.Roles.ADMIN
            self.is_admin = True
            self.is_staff = True
        else:
            if self.role == self.Roles.ADMIN:
                self.is_admin = True
                self.is_staff = True
            else:
                self.is_admin = False
                self.is_staff = False
        super().save(*args, **kwargs)
