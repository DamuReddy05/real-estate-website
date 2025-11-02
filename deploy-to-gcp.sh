#!/bin/bash

# 🚀 Google Cloud Platform Deployment Script for RealEstateHub
# This script automates the deployment process to Google Cloud Run

set -e  # Exit on error

echo "🚀 Starting Google Cloud Platform Deployment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
read -p "Enter your Google Cloud Project ID: " PROJECT_ID
read -p "Enter region (default: us-central1): " REGION
REGION=${REGION:-us-central1}

export PROJECT_ID
export REGION

echo ""
echo -e "${BLUE}📦 Configuration:${NC}"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Step 1: Set project
echo -e "${YELLOW}Step 1: Setting up Google Cloud project...${NC}"
gcloud config set project $PROJECT_ID

# Step 2: Enable APIs
echo -e "${YELLOW}Step 2: Enabling required APIs...${NC}"
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Step 3: Configure Docker
echo -e "${YELLOW}Step 3: Configuring Docker for GCR...${NC}"
gcloud auth configure-docker

# Step 4: Build Docker images
echo -e "${YELLOW}Step 4: Building Docker images...${NC}"
echo "Building backend image..."
docker build -t gcr.io/$PROJECT_ID/realestatehub-backend:latest ./backend

echo "Building frontend image..."
docker build -f frontend/Dockerfile.prod -t gcr.io/$PROJECT_ID/realestatehub-frontend:latest ./frontend

# Step 5: Push images to GCR
echo -e "${YELLOW}Step 5: Pushing images to Google Container Registry...${NC}"
echo "Pushing backend..."
docker push gcr.io/$PROJECT_ID/realestatehub-backend:latest

echo "Pushing frontend..."
docker push gcr.io/$PROJECT_ID/realestatehub-frontend:latest

# Step 6: Deploy Backend to Cloud Run
echo -e "${YELLOW}Step 6: Deploying backend to Cloud Run...${NC}"
read -p "Enter your production SECRET_KEY (or press enter to generate): " SECRET_KEY
if [ -z "$SECRET_KEY" ]; then
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")
    echo "Generated SECRET_KEY: $SECRET_KEY"
fi

read -p "Do you have Cloud SQL instance? (y/n): " HAS_CLOUDSQL

if [ "$HAS_CLOUDSQL" = "y" ]; then
    read -p "Enter Cloud SQL connection name (PROJECT:REGION:INSTANCE): " CLOUDSQL_CONNECTION
    read -p "Enter DB password: " DB_PASSWORD
    
    gcloud run deploy realestatehub-backend \
      --image gcr.io/$PROJECT_ID/realestatehub-backend:latest \
      --platform managed \
      --region $REGION \
      --allow-unauthenticated \
      --add-cloudsql-instances $CLOUDSQL_CONNECTION \
      --set-env-vars="DEBUG=False,SECRET_KEY=$SECRET_KEY,DB_NAME=realestatehub,DB_USER=realestate_user,DB_PASSWORD=$DB_PASSWORD,DB_HOST=/cloudsql/$CLOUDSQL_CONNECTION,ALLOWED_HOSTS=*" \
      --max-instances=10 \
      --memory=512Mi \
      --cpu=1 \
      --port=8000
else
    echo -e "${YELLOW}⚠️  Deploying without Cloud SQL. You'll need to configure database later.${NC}"
    gcloud run deploy realestatehub-backend \
      --image gcr.io/$PROJECT_ID/realestatehub-backend:latest \
      --platform managed \
      --region $REGION \
      --allow-unauthenticated \
      --set-env-vars="DEBUG=False,SECRET_KEY=$SECRET_KEY" \
      --max-instances=10 \
      --memory=512Mi \
      --cpu=1 \
      --port=8000
fi

# Get backend URL
BACKEND_URL=$(gcloud run services describe realestatehub-backend --region=$REGION --format="value(status.url)")
echo -e "${GREEN}✅ Backend deployed at: $BACKEND_URL${NC}"

# Step 7: Deploy Frontend to Cloud Run
echo -e "${YELLOW}Step 7: Deploying frontend to Cloud Run...${NC}"
gcloud run deploy realestatehub-frontend \
  --image gcr.io/$PROJECT_ID/realestatehub-frontend:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="API_URL=$BACKEND_URL" \
  --max-instances=10 \
  --memory=256Mi \
  --cpu=1 \
  --port=80

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe realestatehub-frontend --region=$REGION --format="value(status.url)")
echo -e "${GREEN}✅ Frontend deployed at: $FRONTEND_URL${NC}"

# Step 8: Update backend CORS
echo -e "${YELLOW}Step 8: Updating backend CORS settings...${NC}"
gcloud run services update realestatehub-backend \
  --update-env-vars="CORS_ALLOWED_ORIGINS=$FRONTEND_URL" \
  --region=$REGION

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}📊 Your Application URLs:${NC}"
echo "Frontend: $FRONTEND_URL"
echo "Backend API: $BACKEND_URL"
echo ""
echo -e "${BLUE}🔐 Admin Credentials:${NC}"
echo "Email: admin@realestate.com"
echo "Password: admin123"
echo ""
echo -e "${YELLOW}⚠️  Next Steps:${NC}"
echo "1. Map your custom domain to Cloud Run services"
echo "2. Update CORS with your domain"
echo "3. Run database migrations"
echo "4. Create sample data"
echo ""
echo "See GOOGLE_CLOUD_DEPLOYMENT.md for detailed instructions!"

