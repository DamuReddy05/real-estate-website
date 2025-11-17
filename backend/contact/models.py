from django.db import models
from django.core.validators import URLValidator


class ContactMessage(models.Model):
    """Model for contact form submissions"""
    
    STATUS_CHOICES = [
        ('new', 'New'),
        ('read', 'Read'),
        ('replied', 'Replied'),
        ('closed', 'Closed'),
    ]
    
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'contact_messages'
        ordering = ['-created_at']
        verbose_name = 'Contact Message'
        verbose_name_plural = 'Contact Messages'
    
    def __str__(self):
        return f"{self.name} - {self.email} ({self.created_at.strftime('%Y-%m-%d')})"


class SiteSettings(models.Model):
    """Model for site-wide settings (contact info, social links)"""
    
    # Contact Information
    contact_address = models.TextField(blank=True, null=True, help_text="Full address")
    contact_phone = models.CharField(max_length=20, blank=True, null=True, help_text="Contact phone number")
    contact_email = models.EmailField(blank=True, null=True, help_text="Contact email address")
    working_hours = models.CharField(max_length=200, blank=True, null=True, help_text="e.g., Mon - Sat: 9:00 AM - 7:00 PM")
    
    # Social Media Links
    facebook_url = models.URLField(blank=True, null=True, validators=[URLValidator()], help_text="Facebook page URL")
    twitter_url = models.URLField(blank=True, null=True, validators=[URLValidator()], help_text="Twitter/X profile URL")
    instagram_url = models.URLField(blank=True, null=True, validators=[URLValidator()], help_text="Instagram profile URL")
    linkedin_url = models.URLField(blank=True, null=True, validators=[URLValidator()], help_text="LinkedIn profile URL")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'site_settings'
        verbose_name = 'Site Settings'
        verbose_name_plural = 'Site Settings'
    
    def __str__(self):
        return "Site Settings"
    
    def save(self, *args, **kwargs):
        # Ensure only one instance exists
        self.pk = 1
        super().save(*args, **kwargs)
    
    @classmethod
    def load(cls):
        """Get or create the single SiteSettings instance"""
        obj, created = cls.objects.get_or_create(pk=1)
        return obj
