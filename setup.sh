#!/bin/bash

# RealEstateHub Full-Stack Setup Script
# This script sets up both Django backend and Angular frontend

echo "🏠 RealEstateHub Full-Stack Setup"
echo "================================="

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Please run this script from the real-estate-website root directory"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists python3; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is required but not installed"
    exit 1
fi

if ! command_exists psql; then
    echo "❌ PostgreSQL is required but not installed"
    exit 1
fi

echo "✅ All prerequisites found"

# Setup Backend
echo ""
echo "🐍 Setting up Django Backend..."
echo "==============================="

cd backend

# Make setup script executable and run it
chmod +x setup.sh
./setup.sh

# Check if backend setup was successful
if [ $? -eq 0 ]; then
    echo "✅ Backend setup completed successfully"
else
    echo "❌ Backend setup failed"
    exit 1
fi

cd ..

# Setup Frontend
echo ""
echo "🅰️ Setting up Angular Frontend..."
echo "================================="

cd frontend

# Install dependencies
echo "📦 Installing Angular dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Frontend dependency installation failed"
    exit 1
fi

cd ..

# Create environment files if they don't exist
echo ""
echo "⚙️ Setting up environment configuration..."

if [ ! -f "backend/.env" ]; then
    echo "📋 Creating backend .env file..."
    cp backend/env.example backend/.env
    echo "⚠️ Please edit backend/.env with your database credentials"
fi

# Final instructions
echo ""
echo "🎉 Setup completed successfully!"
echo "==============================="
echo ""
echo "📋 Next Steps:"
echo "1. Configure your database in backend/.env"
echo "2. Create a PostgreSQL database named 'realestatehub'"
echo "3. Run backend migrations:"
echo "   cd backend && source venv/bin/activate && python manage.py migrate"
echo "4. Create an admin user:"
echo "   python manage.py createsuperuser"
echo "5. Start the backend server:"
echo "   python manage.py runserver"
echo "6. In a new terminal, start the frontend:"
echo "   cd frontend && npm start"
echo ""
echo "🌐 URLs:"
echo "- Frontend: http://localhost:4200"
echo "- Backend API: http://localhost:8000/api"
echo "- Django Admin: http://localhost:8000/admin"
echo "- Admin Panel: http://localhost:4200/admin"
echo ""
echo "🔐 Default Admin Credentials:"
echo "- Username: admin"
echo "- Password: admin123"
echo ""
echo "📚 For detailed setup instructions, see SETUP_GUIDE.md"
echo ""
echo "Happy coding! 🚀"
