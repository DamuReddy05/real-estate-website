from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from properties.models import Property
from contact.models import ContactMessage
from datetime import datetime, timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample data for testing'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Get or create admin user
        try:
            admin_user = User.objects.get(username='admin')
            self.stdout.write('Admin user already exists')
        except User.DoesNotExist:
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin123',
                first_name='Admin',
                last_name='User'
            )
            self.stdout.write('Created admin user')

        # Delete existing properties to start fresh
        Property.objects.all().delete()
        self.stdout.write('Cleared existing properties')

        # Create sample properties - ALL IN HYDERABAD
        sample_properties = [
            # ========== FOR SALE - BUY PAGE (5 properties) ==========
            {
                'title': 'Luxury 3BHK Apartment in Jubilee Hills',
                'category': 'flat',
                'type': 'For Sale',
                'price': '₹1.8 Cr',
                'location': 'Jubilee Hills',
                'area': 2100,
                'bedrooms': '3',
                'bathrooms': '3',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'pincode': '500033',
                'description': 'Premium 3BHK apartment in Jubilee Hills with modern amenities, excellent connectivity, and prime location.',
                'amenities': 'Parking, Gym, Swimming Pool, Security, Club House, Lift',
                'owner_name': 'Rajesh Reddy',
                'owner_phone': '+91 98765 43210',
                'owner_email': 'rajesh@example.com',
                'status': 'active'
            },
            {
                'title': 'Spacious 2BHK Flat in Gachibowli',
                'category': 'flat',
                'type': 'For Sale',
                'price': '₹95 Lakhs',
                'location': 'Gachibowli',
                'area': 1450,
                'bedrooms': '2',
                'bathrooms': '2',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'pincode': '500032',
                'description': 'Well-ventilated 2BHK apartment near IT hubs with excellent infrastructure.',
                'amenities': 'Parking, Security, Gym, 24x7 Water, Power Backup',
                'owner_name': 'Srinivas Kumar',
                'owner_phone': '+91 98765 11111',
                'owner_email': 'srini@example.com',
                'status': 'active'
            },
            {
                'title': '4BHK Independent House in Banjara Hills',
                'category': 'house',
                'type': 'For Sale',
                'price': '₹3.2 Cr',
                'location': 'Banjara Hills',
                'area': 3500,
                'bedrooms': '4',
                'bathrooms': '4',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'pincode': '500034',
                'description': 'Luxurious independent house with private parking, garden, and terrace.',
                'amenities': 'Private Garden, Parking, Security, Terrace, Servant Room',
                'owner_name': 'Lakshmi Devi',
                'owner_phone': '+91 98765 22222',
                'owner_email': 'lakshmi@example.com',
                'status': 'active'
            },
            {
                'title': 'Modern 2BHK in Hitech City',
                'category': 'flat',
                'type': 'For Sale',
                'price': '₹1.1 Cr',
                'location': 'Hitech City',
                'area': 1350,
                'bedrooms': '2',
                'bathrooms': '2',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'pincode': '500081',
                'description': 'Ready to move 2BHK in prime IT corridor with all modern amenities.',
                'amenities': 'Gym, Swimming Pool, Club House, Security, Parking',
                'owner_name': 'Venkat Rao',
                'owner_phone': '+91 98765 33333',
                'owner_email': 'venkat@example.com',
                'status': 'active'
            },
            {
                'title': '3BHK Villa in Kokapet',
                'category': 'house',
                'type': 'For Sale',
                'price': '₹2.4 Cr',
                'location': 'Kokapet',
                'area': 2800,
                'bedrooms': '3',
                'bathrooms': '3',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'pincode': '500075',
                'description': 'Beautiful villa in gated community with 24x7 security and amenities.',
                'amenities': 'Club House, Swimming Pool, Gym, Garden, Security, Parking',
                'owner_name': 'Prasad Goud',
                'owner_phone': '+91 98765 44444',
                'owner_email': 'prasad@example.com',
                'status': 'active'
            },
            
            # ========== FOR RENT - RENT PAGE (5 properties) ==========
            {
                'title': 'Furnished 2BHK Apartment in Madhapur',
                'category': 'flat',
                'type': 'For Rent',
                'price': '₹35,000/month',
                'location': 'Madhapur',
                'area': 1200,
                'bedrooms': '2',
                'bathrooms': '2',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'pincode': '500081',
                'description': 'Fully furnished 2BHK apartment perfect for working professionals.',
                'amenities': 'Furnished, Parking, Security, Gym, Power Backup',
                'owner_name': 'Priya Sharma',
                'owner_phone': '+91 98765 55555',
                'owner_email': 'priya@example.com',
                'status': 'active'
            },
            {
                'title': '1BHK Flat for Rent in Kondapur',
                'category': 'flat',
                'type': 'For Rent',
                'price': '₹18,000/month',
                'location': 'Kondapur',
                'area': 850,
                'bedrooms': '1',
                'bathrooms': '1',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'pincode': '500084',
                'description': 'Affordable 1BHK flat near IT companies with good connectivity.',
                'amenities': 'Semi-Furnished, Parking, Security, Water Supply',
                'owner_name': 'Anitha Reddy',
                'owner_phone': '+91 98765 66666',
                'owner_email': 'anitha@example.com',
                'status': 'active'
            },
            {
                'title': '3BHK House for Rent in Manikonda',
                'category': 'house',
                'type': 'For Rent',
                'price': '₹45,000/month',
                'location': 'Manikonda',
                'area': 1800,
                'bedrooms': '3',
                'bathrooms': '2',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'pincode': '500089',
                'description': 'Spacious 3BHK independent house with parking and garden.',
                'amenities': 'Semi-Furnished, Parking, Garden, Security',
                'owner_name': 'Kumar Swamy',
                'owner_phone': '+91 98765 77777',
                'owner_email': 'kumar@example.com',
                'status': 'active'
            },
            {
                'title': 'Semi-Furnished 2BHK in Financial District',
                'category': 'flat',
                'type': 'For Rent',
                'price': '₹32,000/month',
                'location': 'Financial District',
                'area': 1300,
                'bedrooms': '2',
                'bathrooms': '2',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'pincode': '500032',
                'description': 'Modern 2BHK apartment in Financial District with excellent amenities.',
                'amenities': 'Semi-Furnished, Gym, Swimming Pool, Security, Lift',
                'owner_name': 'Deepa Reddy',
                'owner_phone': '+91 98765 88888',
                'owner_email': 'deepa@example.com',
                'status': 'active'
            },
            {
                'title': 'Unfurnished 1BHK in Kukatpally',
                'category': 'flat',
                'type': 'For Rent',
                'price': '₹12,000/month',
                'location': 'Kukatpally',
                'area': 700,
                'bedrooms': '1',
                'bathrooms': '1',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'pincode': '500072',
                'description': 'Budget-friendly 1BHK apartment with basic amenities.',
                'amenities': 'Parking, Security, Water Supply',
                'owner_name': 'Ramesh Babu',
                'owner_phone': '+91 98765 99999',
                'owner_email': 'ramesh@example.com',
                'status': 'active'
            },
            
            # ========== ANANTHAPUR - FOR SALE (5 properties) ==========
            {
                'title': 'Spacious 3BHK Villa in Ananthapur',
                'category': 'house',
                'type': 'For Sale',
                'price': '₹75 Lakhs',
                'location': 'Sai Nagar',
                'area': 1800,
                'bedrooms': '3',
                'bathrooms': '2',
                'city': 'Ananthapur',
                'state': 'Andhra Pradesh',
                'pincode': '515001',
                'description': 'Beautiful independent house with modern amenities in prime location of Ananthapur.',
                'amenities': 'Parking, Security, Garden, Terrace, Water Supply',
                'owner_name': 'Venkatesh Reddy',
                'owner_phone': '+91 98765 10001',
                'owner_email': 'venkatesh@example.com',
                'status': 'active'
            },
            {
                'title': '2BHK Apartment in Ananthapur City',
                'category': 'flat',
                'type': 'For Sale',
                'price': '₹42 Lakhs',
                'location': 'Railway Station Road',
                'area': 1150,
                'bedrooms': '2',
                'bathrooms': '2',
                'city': 'Ananthapur',
                'state': 'Andhra Pradesh',
                'pincode': '515004',
                'description': 'Well-maintained 2BHK flat near railway station with excellent connectivity.',
                'amenities': 'Parking, Security, Lift, Power Backup, Water',
                'owner_name': 'Manjula Devi',
                'owner_phone': '+91 98765 10002',
                'owner_email': 'manjula@example.com',
                'status': 'active'
            },
            {
                'title': 'Commercial Building in Ananthapur',
                'category': 'commercial',
                'type': 'For Sale',
                'price': '₹1.2 Cr',
                'location': 'Gandhi Road',
                'area': 3000,
                'bedrooms': '',
                'bathrooms': '4',
                'city': 'Ananthapur',
                'state': 'Andhra Pradesh',
                'pincode': '515001',
                'description': 'Prime commercial property on main road ideal for retail or office.',
                'amenities': 'Prime Location, Parking, Security, 24x7 Water, Power Backup',
                'owner_name': 'Nagendra Babu',
                'owner_phone': '+91 98765 10003',
                'owner_email': 'nagendra@example.com',
                'status': 'active'
            },
            {
                'title': '4BHK House in Ananthapur Suburbs',
                'category': 'house',
                'type': 'For Sale',
                'price': '₹88 Lakhs',
                'location': 'Gooty Road',
                'area': 2200,
                'bedrooms': '4',
                'bathrooms': '3',
                'city': 'Ananthapur',
                'state': 'Andhra Pradesh',
                'pincode': '515002',
                'description': 'Spacious house with large compound wall and garden area.',
                'amenities': 'Garden, Parking, Bore Well, Security, Compound Wall',
                'owner_name': 'Sridhar Rao',
                'owner_phone': '+91 98765 10004',
                'owner_email': 'sridhar@example.com',
                'status': 'active'
            },
            {
                'title': '1BHK Budget Flat in Ananthapur',
                'category': 'flat',
                'type': 'For Sale',
                'price': '₹28 Lakhs',
                'location': 'Subhash Nagar',
                'area': 650,
                'bedrooms': '1',
                'bathrooms': '1',
                'city': 'Ananthapur',
                'state': 'Andhra Pradesh',
                'pincode': '515005',
                'description': 'Affordable 1BHK flat perfect for first-time home buyers.',
                'amenities': 'Parking, Security, Water Supply, Electricity',
                'owner_name': 'Lakshmi Prasad',
                'owner_phone': '+91 98765 10005',
                'owner_email': 'lakshmi.p@example.com',
                'status': 'active'
            },
            
            # ========== ANANTHAPUR - FOR RENT (3 properties) ==========
            {
                'title': '2BHK Furnished Flat in Ananthapur',
                'category': 'flat',
                'type': 'For Rent',
                'price': '₹12,000/month',
                'location': 'Railway Colony',
                'area': 1000,
                'bedrooms': '2',
                'bathrooms': '2',
                'city': 'Ananthapur',
                'state': 'Andhra Pradesh',
                'pincode': '515004',
                'description': 'Fully furnished 2BHK apartment perfect for families.',
                'amenities': 'Furnished, Parking, Security, Water Supply',
                'owner_name': 'Ramesh Chandra',
                'owner_phone': '+91 98765 10006',
                'owner_email': 'ramesh.c@example.com',
                'status': 'active'
            },
            {
                'title': '3BHK House for Rent in Ananthapur',
                'category': 'house',
                'type': 'For Rent',
                'price': '₹18,000/month',
                'location': 'Sathya Sai Nagar',
                'area': 1600,
                'bedrooms': '3',
                'bathrooms': '2',
                'city': 'Ananthapur',
                'state': 'Andhra Pradesh',
                'pincode': '515001',
                'description': 'Spacious independent house with parking and garden.',
                'amenities': 'Semi-Furnished, Parking, Garden, Bore Well',
                'owner_name': 'Padmavathi Reddy',
                'owner_phone': '+91 98765 10007',
                'owner_email': 'padmavathi@example.com',
                'status': 'active'
            },
            {
                'title': '1BHK Budget Rental in Ananthapur',
                'category': 'flat',
                'type': 'For Rent',
                'price': '₹6,000/month',
                'location': 'Municipal Colony',
                'area': 550,
                'bedrooms': '1',
                'bathrooms': '1',
                'city': 'Ananthapur',
                'state': 'Andhra Pradesh',
                'pincode': '515005',
                'description': 'Affordable 1BHK rental perfect for students and working professionals.',
                'amenities': 'Basic Facilities, Water Supply, Electricity',
                'owner_name': 'Venu Gopal',
                'owner_phone': '+91 98765 10008',
                'owner_email': 'venu@example.com',
                'status': 'active'
            },
            
            # ========== PLOTS - PLOT PAGE (5 plots) ==========
            {
                'title': 'Residential Plot in Kompally',
                'category': 'plot',
                'type': 'For Sale',
                'price': '₹85 Lakhs',
                'location': 'Kompally',
                'area': 1800,
                'bedrooms': '',
                'bathrooms': '',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'pincode': '500014',
                'description': 'DTCP approved residential plot in developing area with good appreciation potential.',
                'amenities': 'Road Access, Electricity, Water Connection, Street Lights',
                'owner_name': 'Naresh Kumar',
                'owner_phone': '+91 98765 12345',
                'owner_email': 'naresh@example.com',
                'status': 'active'
            },
            {
                'title': 'Commercial Plot in Shamshabad',
                'category': 'plot',
                'type': 'For Sale',
                'price': '₹1.5 Cr',
                'location': 'Shamshabad',
                'area': 3600,
                'bedrooms': '',
                'bathrooms': '',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'pincode': '500409',
                'description': 'Prime commercial plot near airport with excellent ROI potential.',
                'amenities': 'Highway Access, Electricity, Water, Corner Plot',
                'owner_name': 'Vishnu Vardhan',
                'owner_phone': '+91 98765 23456',
                'owner_email': 'vishnu@example.com',
                'status': 'active'
            },
            {
                'title': 'Agricultural Land in Shankarpally',
                'category': 'plot',
                'type': 'For Sale',
                'price': '₹65 Lakhs',
                'location': 'Shankarpally',
                'area': 5000,
                'bedrooms': '',
                'bathrooms': '',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'pincode': '500075',
                'description': 'Fertile agricultural land with water source and road connectivity.',
                'amenities': 'Water Source, Road Access, Electricity Nearby',
                'owner_name': 'Rama Krishna',
                'owner_phone': '+91 98765 34567',
                'owner_email': 'rama@example.com',
                'status': 'active'
            },
            {
                'title': 'Residential Plot in Bachupally',
                'category': 'plot',
                'type': 'For Sale',
                'price': '₹72 Lakhs',
                'location': 'Bachupally',
                'area': 2000,
                'bedrooms': '',
                'bathrooms': '',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'pincode': '500090',
                'description': 'Approved residential plot in gated community with all facilities.',
                'amenities': 'Gated Community, Security, Street Lights, Drainage',
                'owner_name': 'Suresh Goud',
                'owner_phone': '+91 98765 45678',
                'owner_email': 'suresh@example.com',
                'status': 'active'
            },
            {
                'title': 'Open Plot in Nanakramguda',
                'category': 'plot',
                'type': 'For Sale',
                'price': '₹1.1 Cr',
                'location': 'Nanakramguda',
                'area': 2400,
                'bedrooms': '',
                'bathrooms': '',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'pincode': '500032',
                'description': 'HMDA approved plot in prime IT corridor location.',
                'amenities': 'HMDA Approved, Road Access, Electricity, Water',
                'owner_name': 'Madhavi Latha',
                'owner_phone': '+91 98765 56789',
                'owner_email': 'madhavi@example.com',
                'status': 'active'
            }
        ]

        for prop_data in sample_properties:
            property_obj, created = Property.objects.get_or_create(
                title=prop_data['title'],
                defaults={
                    **prop_data,
                    'created_by': admin_user
                }
            )
            if created:
                self.stdout.write(f'Created property: {prop_data["title"]}')

        # Create sample contact messages
        sample_messages = [
            {
                'name': 'John Doe',
                'email': 'john@example.com',
                'phone': '+91 98765 43210',
                'message': 'I am interested in the 3BHK apartment in Bandra West. Can you please provide more details about the property?',
                'status': 'new'
            },
            {
                'name': 'Sarah Wilson',
                'email': 'sarah@example.com',
                'phone': '+91 87654 32109',
                'message': 'I would like to schedule a visit for the house in Whitefield. What are the available timings?',
                'status': 'read'
            },
            {
                'name': 'Mike Johnson',
                'email': 'mike@example.com',
                'phone': '+91 76543 21098',
                'message': 'Is the commercial plot in Electronic City still available? I am looking to invest in commercial real estate.',
                'status': 'replied'
            },
            {
                'name': 'Lisa Brown',
                'email': 'lisa@example.com',
                'phone': '+91 65432 10987',
                'message': 'I am interested in renting the 1BHK apartment in Koramangala. What is the security deposit required?',
                'status': 'new'
            },
            {
                'name': 'David Miller',
                'email': 'david@example.com',
                'phone': '+91 54321 09876',
                'message': 'Can you provide more information about the villa in HSR Layout? I would like to know about the neighborhood and amenities.',
                'status': 'closed'
            }
        ]

        for msg_data in sample_messages:
            message, created = ContactMessage.objects.get_or_create(
                email=msg_data['email'],
                message=msg_data['message'],
                defaults=msg_data
            )
            if created:
                self.stdout.write(f'Created contact message from: {msg_data["name"]}')

        self.stdout.write(
            self.style.SUCCESS('Successfully created sample data!')
        )
