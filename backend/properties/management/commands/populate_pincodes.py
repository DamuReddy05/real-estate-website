from django.core.management.base import BaseCommand
from properties.models import Pincode, Property


class Command(BaseCommand):
    help = 'Populate pincodes from existing properties and add sample Indian pincodes'

    def handle(self, *args, **kwargs):
        # Sample Hyderabad pincodes
        hyderabad_pincodes = [
            {'pincode': '500001', 'city': 'Hyderabad', 'state': 'Telangana', 'area': 'Abids'},
            {'pincode': '500003', 'city': 'Hyderabad', 'state': 'Telangana', 'area': 'Kachiguda'},
            {'pincode': '500004', 'city': 'Hyderabad', 'state': 'Telangana', 'area': 'Sultan Bazaar'},
            {'pincode': '500008', 'city': 'Hyderabad', 'state': 'Telangana', 'area': 'Golconda'},
            {'pincode': '500016', 'city': 'Hyderabad', 'state': 'Telangana', 'area': 'Malakpet'},
            {'pincode': '500018', 'city': 'Hyderabad', 'state': 'Telangana', 'area': 'Toli Chowki'},
            {'pincode': '500032', 'city': 'Hyderabad', 'state': 'Telangana', 'area': 'Gachibowli'},
            {'pincode': '500033', 'city': 'Hyderabad', 'state': 'Telangana', 'area': 'HITEC City'},
            {'pincode': '500034', 'city': 'Hyderabad', 'state': 'Telangana', 'area': 'Madhapur'},
            {'pincode': '500035', 'city': 'Hyderabad', 'state': 'Telangana', 'area': 'Jubilee Hills'},
            {'pincode': '500036', 'city': 'Hyderabad', 'state': 'Telangana', 'area': 'Banjara Hills'},
            {'pincode': '500038', 'city': 'Hyderabad', 'state': 'Telangana', 'area': 'Kondapur'},
            {'pincode': '500072', 'city': 'Hyderabad', 'state': 'Telangana', 'area': 'Kukatpally'},
            {'pincode': '500081', 'city': 'Hyderabad', 'state': 'Telangana', 'area': 'Miyapur'},
            {'pincode': '500084', 'city': 'Hyderabad', 'state': 'Telangana', 'area': 'Kukatpally Housing Board'},
        ]
        
        # Sample Bangalore pincodes
        bangalore_pincodes = [
            {'pincode': '560001', 'city': 'Bangalore', 'state': 'Karnataka', 'area': 'MG Road'},
            {'pincode': '560002', 'city': 'Bangalore', 'state': 'Karnataka', 'area': 'Bangalore City'},
            {'pincode': '560008', 'city': 'Bangalore', 'state': 'Karnataka', 'area': 'Basavanagudi'},
            {'pincode': '560016', 'city': 'Bangalore', 'state': 'Karnataka', 'area': 'Indiranagar'},
            {'pincode': '560017', 'city': 'Bangalore', 'state': 'Karnataka', 'area': 'Shivajinagar'},
            {'pincode': '560025', 'city': 'Bangalore', 'state': 'Karnataka', 'area': 'Ulsoor'},
            {'pincode': '560029', 'city': 'Bangalore', 'state': 'Karnataka', 'area': 'Banashankari'},
            {'pincode': '560034', 'city': 'Bangalore', 'state': 'Karnataka', 'area': 'Marathahalli'},
            {'pincode': '560037', 'city': 'Bangalore', 'state': 'Karnataka', 'area': 'JP Nagar'},
            {'pincode': '560066', 'city': 'Bangalore', 'state': 'Karnataka', 'area': 'Whitefield'},
            {'pincode': '560076', 'city': 'Bangalore', 'state': 'Karnataka', 'area': 'Marathahalli'},
            {'pincode': '560087', 'city': 'Bangalore', 'state': 'Karnataka', 'area': 'Yelahanka'},
            {'pincode': '560100', 'city': 'Bangalore', 'state': 'Karnataka', 'area': 'Electronic City'},
        ]
        
        # Sample Mumbai pincodes
        mumbai_pincodes = [
            {'pincode': '400001', 'city': 'Mumbai', 'state': 'Maharashtra', 'area': 'Churchgate'},
            {'pincode': '400002', 'city': 'Mumbai', 'state': 'Maharashtra', 'area': 'Kalbadevi'},
            {'pincode': '400020', 'city': 'Mumbai', 'state': 'Maharashtra', 'area': 'Santacruz East'},
            {'pincode': '400050', 'city': 'Mumbai', 'state': 'Maharashtra', 'area': 'Bandra West'},
            {'pincode': '400051', 'city': 'Mumbai', 'state': 'Maharashtra', 'area': 'Andheri West'},
            {'pincode': '400052', 'city': 'Mumbai', 'state': 'Maharashtra', 'area': 'Andheri East'},
            {'pincode': '400058', 'city': 'Mumbai', 'state': 'Maharashtra', 'area': 'Andheri'},
            {'pincode': '400059', 'city': 'Mumbai', 'state': 'Maharashtra', 'area': 'Goregaon West'},
            {'pincode': '400063', 'city': 'Mumbai', 'state': 'Maharashtra', 'area': 'Goregaon East'},
            {'pincode': '400101', 'city': 'Mumbai', 'state': 'Maharashtra', 'area': 'Borivali East'},
        ]
        
        # Sample Ananthapur pincodes
        ananthapur_pincodes = [
            {'pincode': '515001', 'city': 'Ananthapur', 'state': 'Andhra Pradesh', 'area': 'Central Ananthapur'},
            {'pincode': '515002', 'city': 'Ananthapur', 'state': 'Andhra Pradesh', 'area': 'Ananthapur Town'},
            {'pincode': '515003', 'city': 'Ananthapur', 'state': 'Andhra Pradesh', 'area': 'Ananthapur'},
            {'pincode': '515004', 'city': 'Ananthapur', 'state': 'Andhra Pradesh', 'area': 'Ananthapur'},
            {'pincode': '515005', 'city': 'Ananthapur', 'state': 'Andhra Pradesh', 'area': 'Ananthapur'},
        ]
        
        all_pincodes = hyderabad_pincodes + bangalore_pincodes + mumbai_pincodes + ananthapur_pincodes
        
        created_count = 0
        skipped_count = 0
        
        for pincode_data in all_pincodes:
            pincode_obj, created = Pincode.objects.get_or_create(
                pincode=pincode_data['pincode'],
                defaults={
                    'city': pincode_data['city'],
                    'state': pincode_data['state'],
                    'area': pincode_data.get('area', ''),
                    'is_active': True
                }
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Created: {pincode_obj}'))
            else:
                skipped_count += 1
        
        # Get pincodes from existing properties
        existing_pincodes = Property.objects.exclude(pincode='').exclude(pincode__isnull=True).values_list('pincode', 'city', 'state').distinct()
        
        for pincode_val, city, state in existing_pincodes:
            if pincode_val and pincode_val.strip():
                pincode_obj, created = Pincode.objects.get_or_create(
                    pincode=pincode_val.strip(),
                    defaults={
                        'city': city or 'Unknown',
                        'state': state or 'Unknown',
                        'is_active': True
                    }
                )
                if created:
                    created_count += 1
                    self.stdout.write(self.style.SUCCESS(f'✓ Created from properties: {pincode_obj}'))
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Summary:'))
        self.stdout.write(self.style.SUCCESS(f'  • Pincodes created: {created_count}'))
        self.stdout.write(self.style.SUCCESS(f'  • Pincodes already existed: {skipped_count}'))
        self.stdout.write(self.style.SUCCESS(f'  • Total pincodes now: {Pincode.objects.count()}'))


