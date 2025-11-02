from django.db import models


class City(models.Model):
    """Model for managing cities"""
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


