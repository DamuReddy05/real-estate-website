from django.db import migrations


def activate_only_ananthapur(apps, schema_editor):
    City = apps.get_model('properties', 'City')
    City.objects.exclude(name__iexact='Ananthapur').update(is_active=False)
    City.objects.filter(name__iexact='Ananthapur').update(is_active=True)


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('properties', '0009_alter_category_name_alter_category_slug_and_more'),
    ]

    operations = [
        migrations.RunPython(activate_only_ananthapur, noop),
    ]
