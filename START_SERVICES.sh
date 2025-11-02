#!/bin/bash

# Real Estate Hub - Service Startup Script
# This script starts only the database in Docker, and backend/frontend locally

echo "🏠 Starting Real Estate Hub Services..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Start or check database
echo "📊 Starting Database (Docker)..."
if docker ps --filter "name=realestate_db" --format "{{.Names}}" | grep -q "realestate_db"; then
    echo "✅ Database already running"
else
    docker start realestate_db 2>/dev/null || \
    docker-compose -f docker-compose.db-only.yml up -d
    echo "✅ Database started"
fi

# Wait for database to be healthy
echo "⏳ Waiting for database to be ready..."
sleep 5

# Check if backend is already running
if lsof -i :8000 > /dev/null 2>&1; then
    echo "✅ Backend already running on port 8000"
else
    echo "🐍 Starting Django Backend..."
    cd backend
    source venv/bin/activate
    python manage.py runserver > /dev/null 2>&1 &
    cd ..
    echo "✅ Backend started on port 8000"
fi

# Check if frontend is already running
if lsof -i :4200 > /dev/null 2>&1; then
    echo "✅ Frontend already running on port 4200"
else
    echo "🅰️  Starting Angular Frontend..."
    cd frontend
    npm start > /dev/null 2>&1 &
    cd ..
    echo "✅ Frontend started on port 4200"
fi

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "🎉 All services are running!"
echo ""
echo "📍 Access URLs:"
echo "  • Frontend:    http://localhost:4200"
echo "  • Backend API: http://localhost:8000/api/"
echo "  • Admin Panel: http://localhost:8000/admin"
echo ""
echo "🔑 Admin Credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "✨ Happy coding! 🚀"


