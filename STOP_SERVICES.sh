#!/bin/bash

# Real Estate Hub - Service Shutdown Script

echo "🛑 Stopping Real Estate Hub Services..."
echo ""

# Stop backend
if lsof -i :8000 > /dev/null 2>&1; then
    echo "🐍 Stopping Django Backend..."
    PID=$(lsof -ti :8000)
    kill -9 $PID 2>/dev/null
    echo "✅ Backend stopped"
else
    echo "✅ Backend not running"
fi

# Stop frontend
if lsof -i :4200 > /dev/null 2>&1; then
    echo "🅰️  Stopping Angular Frontend..."
    PID=$(lsof -ti :4200)
    kill -9 $PID 2>/dev/null
    echo "✅ Frontend stopped"
else
    echo "✅ Frontend not running"
fi

# Ask about database
echo ""
echo "📊 Database Status:"
if docker ps --filter "name=realestate_db" --format "{{.Names}}" | grep -q "realestate_db"; then
    echo "  Database container is running"
    echo ""
    read -p "  Stop database container? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker stop realestate_db
        echo "✅ Database stopped"
    else
        echo "✅ Database left running (uses minimal resources)"
    fi
else
    echo "✅ Database not running"
fi

echo ""
echo "✅ Services stopped successfully!"


