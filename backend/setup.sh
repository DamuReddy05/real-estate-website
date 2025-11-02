#!/bin/bash

# RealEstateHub Django Backend Setup Script

echo "🏠 Setting up RealEstateHub Django Backend..."

# Check if Python 3.8+ is installed
python_version=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
required_version="3.8"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Python 3.8+ is required. Current version: $python_version"
    exit 1
fi

echo "✅ Python version check passed: $python_version"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📥 Installing requirements..."
pip install -r requirements.txt

# Copy environment file
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp env.example .env
    echo "⚠️ Please edit .env file with your database credentials and secret key"
fi

# Create logs directory
mkdir -p logs
touch logs/django.log

# Run migrations
echo "🗄️ Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Create superuser
echo "👤 Creating admin superuser..."
echo "You can create a superuser with: python manage.py createsuperuser"

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ Django backend setup completed!"
echo ""
echo "🚀 To start the development server:"
echo "   source venv/bin/activate"
echo "   python manage.py runserver"
echo ""
echo "🔧 To create an admin user:"
echo "   python manage.py createsuperuser"
echo ""
echo "📊 To access Django admin:"
echo "   http://localhost:8000/admin/"
