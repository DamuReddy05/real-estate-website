from django.core.management.base import BaseCommand
from properties.models import City, Property
from django.db.models import Count


class Command(BaseCommand):
    help = 'Fix duplicate city names (case-insensitive) and update properties'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('🔍 Searching for duplicate cities...'))
        
        # Find duplicate city names (case-insensitive)
        from django.db.models.functions import Lower
        
        duplicates = City.objects.values(city_lower=Lower('name')).annotate(
            count=Count('id')
        ).filter(count__gt=1)
        
        if not duplicates:
            self.stdout.write(self.style.SUCCESS('✅ No duplicate cities found!'))
            return
        
        fixed_count = 0
        
        for dup in duplicates:
            city_name_lower = dup['city_lower']
            
            # Get all cities with this name (case-insensitive)
            cities = City.objects.filter(name__iexact=city_name_lower).order_by('id')
            
            if cities.count() <= 1:
                continue
            
            # Keep the first one (usually the correctly capitalized one)
            correct_city = cities.first()
            duplicates_to_merge = cities.exclude(id=correct_city.id)
            
            self.stdout.write(self.style.WARNING(f'\n📍 Found duplicate: {city_name_lower}'))
            self.stdout.write(f'   Keeping: {correct_city.name}, {correct_city.state}')
            
            # Update properties to use the correct city name
            for dup_city in duplicates_to_merge:
                properties = Property.objects.filter(city=dup_city.name)
                count = properties.count()
                
                if count > 0:
                    properties.update(city=correct_city.name)
                    self.stdout.write(f'   ✓ Updated {count} properties from "{dup_city.name}" to "{correct_city.name}"')
                
                # Delete the duplicate
                dup_city.delete()
                self.stdout.write(f'   ✓ Deleted duplicate: {dup_city.name}')
                fixed_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Fixed {fixed_count} duplicate cities!'))
        self.stdout.write(self.style.SUCCESS(f'✅ Total cities now: {City.objects.count()}'))




