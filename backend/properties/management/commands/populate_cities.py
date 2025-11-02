from django.core.management.base import BaseCommand
from properties.models import City, Property


class Command(BaseCommand):
    help = 'Populate cities from existing properties and add predefined Indian cities'

    def handle(self, *args, **kwargs):
        # Predefined major Indian cities
        predefined_cities = [
            {'name': 'Hyderabad', 'state': 'Telangana'},
            {'name': 'Ananthapur', 'state': 'Andhra Pradesh'},
            {'name': 'Bangalore', 'state': 'Karnataka'},
            {'name': 'Mumbai', 'state': 'Maharashtra'},
            {'name': 'Delhi', 'state': 'Delhi'},
            {'name': 'Chennai', 'state': 'Tamil Nadu'},
            {'name': 'Kolkata', 'state': 'West Bengal'},
            {'name': 'Pune', 'state': 'Maharashtra'},
            {'name': 'Ahmedabad', 'state': 'Gujarat'},
            {'name': 'Jaipur', 'state': 'Rajasthan'},
            {'name': 'Surat', 'state': 'Gujarat'},
            {'name': 'Lucknow', 'state': 'Uttar Pradesh'},
            {'name': 'Kanpur', 'state': 'Uttar Pradesh'},
            {'name': 'Nagpur', 'state': 'Maharashtra'},
            {'name': 'Indore', 'state': 'Madhya Pradesh'},
            {'name': 'Thane', 'state': 'Maharashtra'},
            {'name': 'Bhopal', 'state': 'Madhya Pradesh'},
            {'name': 'Visakhapatnam', 'state': 'Andhra Pradesh'},
            {'name': 'Pimpri-Chinchwad', 'state': 'Maharashtra'},
            {'name': 'Patna', 'state': 'Bihar'},
            {'name': 'Vadodara', 'state': 'Gujarat'},
            {'name': 'Ghaziabad', 'state': 'Uttar Pradesh'},
            {'name': 'Ludhiana', 'state': 'Punjab'},
            {'name': 'Agra', 'state': 'Uttar Pradesh'},
            {'name': 'Nashik', 'state': 'Maharashtra'},
            {'name': 'Faridabad', 'state': 'Haryana'},
            {'name': 'Meerut', 'state': 'Uttar Pradesh'},
            {'name': 'Rajkot', 'state': 'Gujarat'},
            {'name': 'Kalyan-Dombivali', 'state': 'Maharashtra'},
            {'name': 'Vasai-Virar', 'state': 'Maharashtra'},
            {'name': 'Varanasi', 'state': 'Uttar Pradesh'},
            {'name': 'Srinagar', 'state': 'Jammu and Kashmir'},
            {'name': 'Aurangabad', 'state': 'Maharashtra'},
            {'name': 'Dhanbad', 'state': 'Jharkhand'},
            {'name': 'Amritsar', 'state': 'Punjab'},
            {'name': 'Navi Mumbai', 'state': 'Maharashtra'},
            {'name': 'Allahabad', 'state': 'Uttar Pradesh'},
            {'name': 'Ranchi', 'state': 'Jharkhand'},
            {'name': 'Howrah', 'state': 'West Bengal'},
            {'name': 'Coimbatore', 'state': 'Tamil Nadu'},
            {'name': 'Jabalpur', 'state': 'Madhya Pradesh'},
            {'name': 'Gwalior', 'state': 'Madhya Pradesh'},
            {'name': 'Vijayawada', 'state': 'Andhra Pradesh'},
            {'name': 'Jodhpur', 'state': 'Rajasthan'},
            {'name': 'Madurai', 'state': 'Tamil Nadu'},
            {'name': 'Raipur', 'state': 'Chhattisgarh'},
            {'name': 'Kota', 'state': 'Rajasthan'},
            {'name': 'Chandigarh', 'state': 'Chandigarh'},
            {'name': 'Guwahati', 'state': 'Assam'},
        ]

        # Add predefined cities
        cities_created = 0
        cities_skipped = 0

        for city_data in predefined_cities:
            city, created = City.objects.get_or_create(
                name=city_data['name'],
                defaults={'state': city_data['state'], 'is_active': True}
            )
            if created:
                cities_created += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Created: {city.name}, {city.state}'))
            else:
                cities_skipped += 1

        # Get cities from existing properties
        existing_cities = Property.objects.values_list('city', 'state').distinct()
        
        for city_name, state_name in existing_cities:
            if city_name and city_name.strip():  # Only if not empty
                city, created = City.objects.get_or_create(
                    name=city_name.strip(),
                    defaults={'state': state_name or 'Unknown', 'is_active': True}
                )
                if created:
                    cities_created += 1
                    self.stdout.write(self.style.SUCCESS(f'✓ Created from properties: {city.name}'))

        self.stdout.write(self.style.SUCCESS(f'\n✅ Summary:'))
        self.stdout.write(self.style.SUCCESS(f'  • Cities created: {cities_created}'))
        self.stdout.write(self.style.SUCCESS(f'  • Cities already existed: {cities_skipped}'))
        self.stdout.write(self.style.SUCCESS(f'  • Total cities now: {City.objects.count()}'))


