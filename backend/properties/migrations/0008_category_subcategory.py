from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('properties', '0007_tag_property_tags'),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120, unique=True)),
                ('slug', models.SlugField(blank=True, max_length=150, unique=True)),
                ('description', models.CharField(blank=True, max_length=255, null=True)),
                ('priority', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'property_categories',
                'ordering': ['priority', 'name'],
            },
        ),
        migrations.CreateModel(
            name='SubCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120)),
                ('slug', models.SlugField(blank=True, max_length=160, unique=True)),
                ('description', models.CharField(blank=True, max_length=255, null=True)),
                ('priority', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subcategories', to='properties.category')),
            ],
            options={
                'db_table': 'property_subcategories',
                'ordering': ['category', 'priority', 'name'],
                'unique_together': {('category', 'name')},
            },
        ),
        migrations.AddField(
            model_name='property',
            name='subcategory',
            field=models.CharField(blank=True, max_length=120, null=True),
        ),
    ]
