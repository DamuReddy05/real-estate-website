# 🚀 Complete Google Cloud Platform Deployment Guide

## Real Estate Website - GCP Deployment

This guide will walk you through deploying your real estate website to Google Cloud Platform using Cloud Run.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [GCP Portal Setup](#gcp-portal-setup)
3. [Local Machine Setup](#local-machine-setup)
4. [Database Setup (Optional but Recommended)](#database-setup)
5. [Deployment Process](#deployment-process)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Prerequisites

### On Your Local Machine:
- ✅ Docker installed and running
- ✅ Google Cloud SDK (gcloud CLI) installed
- ✅ Git installed
- ✅ Your project files ready

### Install Google Cloud SDK:
```bash
# For macOS
brew install --cask google-cloud-sdk

# For Linux
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# For Windows
# Download from: https://cloud.google.com/sdk/docs/install
```

---

## 🌐 GCP Portal Setup (Step-by-Step)

### Step 1: Create a Google Cloud Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Accept terms of service
4. **Note**: New users get $300 free credits for 90 days!

### Step 2: Create a New Project
1. In GCP Console, click on the project dropdown (top navigation bar)
2. Click **"New Project"**
3. Fill in the details:
   - **Project Name**: `RealEstateHub` (or your preferred name)
   - **Project ID**: Will be auto-generated (e.g., `realestatehub-123456`)
   - **Location**: Select your organization (or leave as "No organization")
4. Click **"Create"**
5. **IMPORTANT**: Note down your **Project ID** - you'll need this!

### Step 3: Enable Billing
1. In the GCP Console, go to **Billing** (left menu → Billing)
2. Click **"Link a billing account"**
3. Create a new billing account or select existing one
4. Add payment method (credit card required, but you won't be charged if staying in free tier)
5. Link the billing account to your project

### Step 4: Enable Required APIs
You can do this manually in the portal (or the script will do it):

1. Go to **APIs & Services** → **Library**
2. Search and enable these APIs:
   - ✅ **Cloud Run API**
   - ✅ **Cloud Build API**
   - ✅ **Container Registry API**
   - ✅ **Cloud SQL Admin API** (if using database)
   - ✅ **Compute Engine API**

**OR** Let the deployment script enable them automatically!

### Step 5: Set Up Cloud SQL (Database) - RECOMMENDED

#### Option A: Using GCP Console
1. Go to **SQL** (left menu → SQL)
2. Click **"Create Instance"**
3. Choose **PostgreSQL**
4. Configure the instance:
   - **Instance ID**: `realestatehub-db`
   - **Password**: Create a strong password (save this!)
   - **Database version**: PostgreSQL 15
   - **Region**: Choose same as your Cloud Run region (e.g., `us-central1`)
   - **Zonal availability**: Single zone (for cost savings)
   - **Machine type**: Shared core → db-f1-micro (cheapest option)
   - **Storage**: 10 GB SSD (minimum)
   - **Enable automatic backups**: Yes (recommended)
5. Click **"Create Instance"** (takes 5-10 minutes)

#### After Database Instance is Created:
1. Click on your database instance
2. Go to **"Databases"** tab → Click **"Create Database"**
   - Database name: `realestatehub`
3. Go to **"Users"** tab → Click **"Add User Account"**
   - Username: `realestate_user`
   - Password: Create a strong password (save this!)
4. Note down the **Connection Name** (format: `PROJECT_ID:REGION:INSTANCE_ID`)
   - Example: `realestatehub-123456:us-central1:realestatehub-db`

#### Option B: Skip Database (Use SQLite)
- The app will use SQLite (not recommended for production)
- You can add Cloud SQL later

---

## 💻 Local Machine Setup

### Step 1: Authenticate with Google Cloud
Open your terminal and run:

```bash
# Login to Google Cloud
gcloud auth login
```
- This will open a browser window
- Sign in with your Google account
- Grant permissions

### Step 2: Initialize gcloud
```bash
# Set your default project
gcloud config set project YOUR_PROJECT_ID

# Example:
# gcloud config set project realestatehub-123456

# Verify configuration
gcloud config list
```

### Step 3: Configure Docker for Google Container Registry
```bash
gcloud auth configure-docker
```

### Step 4: Verify Docker is Running
```bash
# Check Docker is running
docker --version
docker ps
```

---

## 🚀 Deployment Process

### Method 1: Using the Automated Script (RECOMMENDED)

1. **Navigate to your project directory:**
```bash
cd /Users/damureddy/real-estate-website
```

2. **Make the deployment script executable:**
```bash
chmod +x deploy-to-gcp.sh
```

3. **Run the deployment script:**
```bash
./deploy-to-gcp.sh
```

4. **Follow the prompts:**
   - Enter your **Project ID** (from GCP Console)
   - Enter **region** (or press Enter for `us-central1`)
   - Enter **SECRET_KEY** (or press Enter to auto-generate)
   - Choose if you have Cloud SQL:
     - If **YES**: 
       - Enter Cloud SQL connection name (e.g., `project-id:region:instance-name`)
       - Enter database password
     - If **NO**: Will use SQLite (not recommended for production)

5. **Wait for deployment** (takes 10-20 minutes):
   - Script will build Docker images
   - Push images to Google Container Registry
   - Deploy backend to Cloud Run
   - Deploy frontend to Cloud Run
   - Configure CORS automatically

6. **Note down the URLs** displayed at the end:
   - Frontend URL: `https://realestatehub-frontend-xxxxx.run.app`
   - Backend API URL: `https://realestatehub-backend-xxxxx.run.app`

### Method 2: Manual Deployment

If you prefer to do it step by step:

#### Step 1: Build Backend Docker Image
```bash
cd /Users/damureddy/real-estate-website
docker build -t gcr.io/YOUR_PROJECT_ID/realestatehub-backend:latest ./backend
```

#### Step 2: Build Frontend Docker Image
```bash
docker build -f frontend/Dockerfile.prod -t gcr.io/YOUR_PROJECT_ID/realestatehub-frontend:latest ./frontend
```

#### Step 3: Push Images to Container Registry
```bash
docker push gcr.io/YOUR_PROJECT_ID/realestatehub-backend:latest
docker push gcr.io/YOUR_PROJECT_ID/realestatehub-frontend:latest
```

#### Step 4: Deploy Backend to Cloud Run
```bash
gcloud run deploy realestatehub-backend \
  --image gcr.io/YOUR_PROJECT_ID/realestatehub-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="DEBUG=False,SECRET_KEY=your-secret-key-here" \
  --max-instances=10 \
  --memory=512Mi \
  --port=8000
```

#### Step 5: Deploy Frontend to Cloud Run
```bash
# First, get your backend URL
BACKEND_URL=$(gcloud run services describe realestatehub-backend --region=us-central1 --format="value(status.url)")

# Deploy frontend
gcloud run deploy realestatehub-frontend \
  --image gcr.io/YOUR_PROJECT_ID/realestatehub-frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="API_URL=$BACKEND_URL" \
  --max-instances=10 \
  --memory=256Mi \
  --port=80
```

---

## 🔧 Post-Deployment Configuration

### Step 1: Run Database Migrations

Option A: Using Cloud Run CLI:
```bash
# Get your backend service URL
BACKEND_URL=$(gcloud run services describe realestatehub-backend --region=us-central1 --format="value(status.url)")

# Run migrations (if you have Cloud SQL properly configured)
gcloud run jobs execute migrate-db --region=us-central1
```

Option B: Access Cloud Run console and use Cloud Shell:
1. Go to **Cloud Run** in GCP Console
2. Click on **realestatehub-backend**
3. Click **"Cloud Shell"** button (top right)
4. Run migrations:
```bash
gcloud run jobs execute realestatehub-backend --command "python manage.py migrate"
```

### Step 2: Create Django Superuser

You have two options:

Option A: Use Cloud Run console:
1. Go to Cloud Run → Select your backend service
2. Click on **"Logs"** tab
3. Create admin via Django command

Option B: Access via Cloud Shell:
```bash
# Execute command in Cloud Run
gcloud run services update realestatehub-backend \
  --command "python manage.py createsuperuser"
```

### Step 3: Configure Custom Domain (Optional)

1. Go to **Cloud Run** → Select service
2. Click **"Manage Custom Domains"**
3. Click **"Add Mapping"**
4. Follow the wizard to add your domain
5. Update DNS records as instructed

### Step 4: Update CORS Settings

Update your backend with your actual frontend domain:
```bash
# Get your frontend URL
FRONTEND_URL=$(gcloud run services describe realestatehub-frontend --region=us-central1 --format="value(status.url)")

# Update backend CORS
gcloud run services update realestatehub-backend \
  --update-env-vars="CORS_ALLOWED_ORIGINS=$FRONTEND_URL,https://yourdomain.com" \
  --region=us-central1
```

### Step 5: Set Up Environment Variables

Update backend with production values:
```bash
gcloud run services update realestatehub-backend \
  --update-env-vars="DEBUG=False,ALLOWED_HOSTS=your-backend-url.run.app,yourdomain.com" \
  --region=us-central1
```

---

## 🎨 Configure Frontend API URL

If the automated script didn't set it correctly:

1. Update frontend environment in the deployment:
```bash
# Get backend URL
BACKEND_URL=$(gcloud run services describe realestatehub-backend --region=us-central1 --format="value(status.url)")

# Update frontend
gcloud run services update realestatehub-frontend \
  --update-env-vars="API_URL=$BACKEND_URL" \
  --region=us-central1
```

---

## 📊 Monitoring and Logs

### View Logs:
```bash
# Backend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=realestatehub-backend" --limit 50

# Frontend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=realestatehub-frontend" --limit 50
```

### Using GCP Console:
1. Go to **Cloud Run**
2. Click on your service
3. Go to **"Logs"** tab
4. View real-time logs and errors

### Monitor Costs:
1. Go to **Billing** → **Reports**
2. View your daily spending
3. Set up budget alerts

---

## 🔐 Security Best Practices

### 1. Generate Strong SECRET_KEY
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(50))"
```

### 2. Update Backend Security Settings
```bash
gcloud run services update realestatehub-backend \
  --update-env-vars="SECRET_KEY=your-generated-key,\
SECURE_SSL_REDIRECT=True,\
SESSION_COOKIE_SECURE=True,\
CSRF_COOKIE_SECURE=True" \
  --region=us-central1
```

### 3. Restrict Access (Optional)
If you don't want public access:
```bash
gcloud run services update realestatehub-backend \
  --no-allow-unauthenticated \
  --region=us-central1
```

---

## 💰 Cost Estimates

### Free Tier Includes:
- ✅ 2 million requests per month
- ✅ 360,000 GB-seconds of compute time
- ✅ 180,000 vCPU-seconds of compute time
- ✅ 1 GB network egress per month

### Typical Monthly Costs (Small Traffic):
- **Cloud Run**: $0-5/month (usually free tier covers it)
- **Cloud SQL**: $7-15/month (db-f1-micro instance)
- **Container Registry**: $0.50-2/month (storage)
- **Total**: ~$10-20/month for small to medium traffic

### Tips to Reduce Costs:
- Use **minimum instances = 0** (cold starts acceptable)
- Set **max instances = 5-10**
- Choose **f1-micro** for Cloud SQL
- Use **single zone** availability

---

## 🔍 Troubleshooting

### Issue 1: "Permission denied" errors
```bash
# Re-authenticate
gcloud auth login
gcloud auth configure-docker
```

### Issue 2: Build fails
```bash
# Check Docker is running
docker ps

# Clear Docker cache
docker system prune -a
```

### Issue 3: Cloud SQL connection fails
- Verify Cloud SQL instance is running
- Check connection name format: `PROJECT_ID:REGION:INSTANCE`
- Ensure Cloud SQL Admin API is enabled

### Issue 4: Frontend can't connect to backend
- Check CORS settings
- Verify backend URL is correct in frontend environment
- Check backend is deployed and running

### Issue 5: "Quota exceeded" errors
- Check your billing is enabled
- Verify APIs are enabled
- Check resource quotas in IAM & Admin

### Check Service Status:
```bash
# List all Cloud Run services
gcloud run services list

# Describe a service
gcloud run services describe realestatehub-backend --region=us-central1

# Check service logs
gcloud run services logs read realestatehub-backend --region=us-central1
```

---

## 🔄 Updating Your Application

### Quick Update:
```bash
# Just run the deployment script again
./deploy-to-gcp.sh
```

### Manual Update:
```bash
# Rebuild and push images
docker build -t gcr.io/YOUR_PROJECT_ID/realestatehub-backend:latest ./backend
docker push gcr.io/YOUR_PROJECT_ID/realestatehub-backend:latest

# Deploy new version
gcloud run deploy realestatehub-backend \
  --image gcr.io/YOUR_PROJECT_ID/realestatehub-backend:latest \
  --region=us-central1
```

---

## 🎯 Checklist

Before deployment:
- [ ] Google Cloud account created
- [ ] Project created in GCP Console
- [ ] Billing enabled
- [ ] gcloud CLI installed and authenticated
- [ ] Docker installed and running
- [ ] Cloud SQL instance created (optional)

During deployment:
- [ ] Project ID noted down
- [ ] Cloud SQL connection name noted
- [ ] Database credentials saved securely
- [ ] Deployment script executed successfully
- [ ] Frontend and Backend URLs received

After deployment:
- [ ] Database migrations run
- [ ] Admin user created
- [ ] CORS configured correctly
- [ ] SSL certificates active (automatic with Cloud Run)
- [ ] Test the application
- [ ] Set up monitoring and alerts
- [ ] Configure custom domain (if applicable)

---

## 📞 Need Help?

### Useful GCP Commands:
```bash
# Check project configuration
gcloud config list

# List all services
gcloud run services list

# Get service URL
gcloud run services describe SERVICE_NAME --format="value(status.url)"

# View logs in real-time
gcloud logging tail "resource.type=cloud_run_revision"

# Check billing
gcloud billing accounts list

# Check enabled APIs
gcloud services list --enabled
```

### Useful Links:
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [GCP Free Tier](https://cloud.google.com/free)
- [GCP Pricing Calculator](https://cloud.google.com/products/calculator)

---

## 🎉 Success!

Once deployed, you can access:
- **Frontend**: https://realestatehub-frontend-xxxxx.run.app
- **Backend API**: https://realestatehub-backend-xxxxx.run.app/api
- **Admin Panel**: https://realestatehub-backend-xxxxx.run.app/admin

---

## 📝 Notes

- Cloud Run automatically provides HTTPS certificates
- Services auto-scale from 0 to max instances
- You pay only for actual usage (request-based billing)
- Cloud Run has built-in load balancing
- Automatic health checks and restarts

---

**Happy Deploying! 🚀**

