from django.core.management.base import BaseCommand
from properties.models import Property, PropertyImage

class Command(BaseCommand):
    help = 'Add dummy images to all properties'

    def handle(self, *args, **kwargs):
        # Dummy image URLs (placeholder images)
        dummy_images = [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',  # Modern house exterior
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',  # Modern house front
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',  # Living room
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',  # Bedroom
            'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800',  # Kitchen
            'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',  # Bathroom
            'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',  # Balcony view
        ]

        properties = Property.objects.all()
        
        for property in properties:
            # Clear existing images
            PropertyImage.objects.filter(property=property).delete()
            
            # Add 5 images per property
            for i in range(5):
                PropertyImage.objects.create(
                    property=property,
                    image_url=dummy_images[i % len(dummy_images)],
                    caption=f'View {i+1}',
                    is_primary=(i == 0)
                )
            
            self.stdout.write(
                self.style.SUCCESS(f'Added 5 images to: {property.title}')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'\n✅ Successfully added images to {properties.count()} properties!')
        )

