#!/bin/bash

# Docker Management Script for Real Estate Hub

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    print_info "Docker is running."
}

# Function to build and start containers
start_dev() {
    print_info "Starting development environment..."
    check_docker
    docker-compose up --build -d
    print_info "Containers started successfully!"
    print_info "Frontend: http://localhost:4200"
    print_info "Backend API: http://localhost:8000"
    print_info "Django Admin: http://localhost:8000/admin"
}

# Function to start containers without building
start() {
    print_info "Starting containers..."
    check_docker
    docker-compose up -d
    print_info "Containers started successfully!"
}

# Function to stop containers
stop() {
    print_info "Stopping containers..."
    docker-compose down
    print_info "Containers stopped."
}

# Function to view logs
logs() {
    if [ -z "$1" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$1"
    fi
}

# Function to restart a service
restart() {
    if [ -z "$1" ]; then
        print_error "Please specify a service: backend, frontend, or db"
        exit 1
    fi
    print_info "Restarting $1..."
    docker-compose restart "$1"
    print_info "$1 restarted."
}

# Function to create superuser
create_superuser() {
    print_info "Creating Django superuser..."
    docker-compose exec backend python manage.py createsuperuser
}

# Function to run migrations
migrate() {
    print_info "Running database migrations..."
    docker-compose exec backend python manage.py migrate
    print_info "Migrations completed."
}

# Function to create sample data
create_sample_data() {
    print_info "Creating sample data..."
    docker-compose exec backend python manage.py create_sample_data
    print_info "Sample data created."
}

# Function to access Django shell
shell() {
    print_info "Opening Django shell..."
    docker-compose exec backend python manage.py shell
}

# Function to access database shell
db_shell() {
    print_info "Opening PostgreSQL shell..."
    docker-compose exec db psql -U postgres -d realestatehub
}

# Function to clean everything
clean() {
    print_warning "This will remove all containers, volumes, and images. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_info "Cleaning up..."
        docker-compose down -v --rmi all
        print_info "Cleanup completed."
    else
        print_info "Cleanup cancelled."
    fi
}

# Function to show status
status() {
    print_info "Container status:"
    docker-compose ps
    echo ""
    print_info "Resource usage:"
    docker stats --no-stream
}

# Function to backup database
backup_db() {
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    print_info "Backing up database to $BACKUP_FILE..."
    docker-compose exec -T db pg_dump -U postgres realestatehub > "$BACKUP_FILE"
    print_info "Database backed up to $BACKUP_FILE"
}

# Function to restore database
restore_db() {
    if [ -z "$1" ]; then
        print_error "Please provide backup file path"
        exit 1
    fi
    print_warning "This will restore the database from $1. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_info "Restoring database from $1..."
        docker-compose exec -T db psql -U postgres realestatehub < "$1"
        print_info "Database restored."
    else
        print_info "Restore cancelled."
    fi
}

# Function to show help
show_help() {
    cat << EOF
${GREEN}Real Estate Hub - Docker Management Script${NC}

${YELLOW}Usage:${NC}
  ./docker-run.sh [command]

${YELLOW}Commands:${NC}
  start-dev         Build and start all containers (development)
  start             Start all containers without building
  stop              Stop all containers
  restart [service] Restart a specific service (backend/frontend/db)
  logs [service]    View logs (all services or specific service)
  status            Show container status and resource usage
  
  ${GREEN}Database Commands:${NC}
  migrate           Run database migrations
  create-superuser  Create Django admin superuser
  create-samples    Create sample data
  db-shell          Access PostgreSQL shell
  backup            Backup database to SQL file
  restore [file]    Restore database from SQL file
  
  ${GREEN}Development Commands:${NC}
  shell             Access Django Python shell
  clean             Remove all containers, volumes, and images
  
  ${GREEN}Examples:${NC}
  ./docker-run.sh start-dev
  ./docker-run.sh logs backend
  ./docker-run.sh restart frontend
  ./docker-run.sh backup

EOF
}

# Main script logic
case "$1" in
    start-dev)
        start_dev
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    logs)
        logs "$2"
        ;;
    restart)
        restart "$2"
        ;;
    create-superuser)
        create_superuser
        ;;
    migrate)
        migrate
        ;;
    create-samples)
        create_sample_data
        ;;
    shell)
        shell
        ;;
    db-shell)
        db_shell
        ;;
    clean)
        clean
        ;;
    status)
        status
        ;;
    backup)
        backup_db
        ;;
    restore)
        restore_db "$2"
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac


