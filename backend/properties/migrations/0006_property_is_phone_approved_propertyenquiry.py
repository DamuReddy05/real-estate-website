from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('properties', '0005_pincode'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='property',
            name='is_phone_approved',
            field=models.BooleanField(default=False),
        ),
        migrations.CreateModel(
            name='PropertyEnquiry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120)),
                ('email', models.EmailField(max_length=254)),
                ('phone', models.CharField(max_length=20)),
                ('message', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('new', 'New'), ('contacted', 'Contacted'), ('scheduled', 'Visit Scheduled'), ('closed', 'Closed')], default='new', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('property', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='enquiries', to='properties.property')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='property_enquiries', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'property_enquiries',
                'ordering': ['-created_at'],
            },
        ),
    ]
