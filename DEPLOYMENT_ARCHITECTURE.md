# 🏗️ Deployment Architecture

## Real Estate Website on Google Cloud Platform

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GOOGLE CLOUD PLATFORM                    │
│                                                              │
│  ┌────────────────────┐         ┌────────────────────┐     │
│  │   Cloud Run        │         │   Cloud Run        │     │
│  │   (Frontend)       │◄────────┤   (Backend)        │     │
│  │                    │  API    │                    │     │
│  │  - Angular App     │  Calls  │  - Django REST API │     │
│  │  - Nginx Server    │         │  - Gunicorn        │     │
│  │  - Port 80         │         │  - Port 8000       │     │
│  │                    │         │                    │     │
│  │  Auto-scaling      │         │  Auto-scaling      │     │
│  │  HTTPS enabled     │         │  HTTPS enabled     │     │
│  └────────────────────┘         └──────────┬─────────┘     │
│           │                                 │               │
│           │                                 │               │
│           │                                 ▼               │
│           │                    ┌────────────────────┐       │
│           │                    │   Cloud SQL        │       │
│           │                    │   (PostgreSQL 15)  │       │
│           │                    │                    │       │
│           │                    │  - Database        │       │
│           │                    │  - Auto-backup     │       │
│           │                    │  - Encrypted       │       │
│           │                    └────────────────────┘       │
│           │                                                 │
│           ▼                                                 │
│  ┌────────────────────┐                                    │
│  │  Container         │                                    │
│  │  Registry (GCR)    │                                    │
│  │                    │                                    │
│  │  - Docker Images   │                                    │
│  │  - Version Control │                                    │
│  └────────────────────┘                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │
                           │ HTTPS
                           │
                    ┌──────┴──────┐
                    │    Users    │
                    │  (Browser)  │
                    └─────────────┘
```

---

## 🔄 Deployment Flow

### What Happens on Your Local Machine:

```
┌──────────────────────────────────────────────────────┐
│  YOUR LOCAL MACHINE                                  │
│                                                       │
│  1. Run: ./deploy-to-gcp.sh                         │
│     └──► Authenticate with Google Cloud             │
│                                                       │
│  2. Build Docker Images                              │
│     ├──► Backend: Django + Dependencies             │
│     └──► Frontend: Angular + Nginx                  │
│                                                       │
│  3. Push Images to Google Container Registry         │
│     └──► Upload to gcr.io/your-project-id/...       │
│                                                       │
│  4. Deploy to Cloud Run                              │
│     ├──► Create backend service                     │
│     ├──► Create frontend service                    │
│     ├──► Configure networking                       │
│     └──► Set environment variables                  │
│                                                       │
│  5. Configure Services                               │
│     ├──► Set up CORS                                │
│     ├──► Link database                              │
│     └──► Enable auto-scaling                        │
│                                                       │
│  6. Get URLs                                         │
│     ├──► Frontend: https://xxx.run.app              │
│     └──► Backend: https://yyy.run.app               │
└──────────────────────────────────────────────────────┘
```

---

## 🌐 What You Do in GCP Portal

### Initial Setup (Do Once):

```
GCP CONSOLE (console.cloud.google.com)
│
├─ 1. Create Project
│   └─ Name: RealEstateHub
│   └─ Save Project ID
│
├─ 2. Enable Billing
│   └─ Add payment method
│   └─ Link to project
│
├─ 3. Enable APIs (or let script do it)
│   ├─ Cloud Run API
│   ├─ Cloud Build API
│   ├─ Container Registry API
│   └─ Cloud SQL Admin API
│
└─ 4. Create Cloud SQL Instance (Optional)
    ├─ Choose PostgreSQL 15
    ├─ Instance ID: realestatehub-db
    ├─ Region: us-central1
    ├─ Machine: db-f1-micro
    ├─ Create database: realestatehub
    ├─ Create user: realestate_user
    └─ Note connection name
```

### After Deployment (Monitoring):

```
GCP CONSOLE
│
├─ Cloud Run
│   ├─ View running services
│   ├─ Check logs
│   ├─ Monitor traffic
│   └─ Update configurations
│
├─ Cloud SQL
│   ├─ Check database status
│   ├─ View backups
│   └─ Monitor connections
│
├─ Billing
│   ├─ View costs
│   ├─ Set budget alerts
│   └─ Monitor usage
│
└─ Logs Explorer
    └─ View application logs
    └─ Debug errors
```

---

## 🔐 Security Features (Automatic)

```
✅ HTTPS/SSL Certificates
   └─ Automatically provisioned by Cloud Run

✅ DDoS Protection
   └─ Built into Google Cloud

✅ Encrypted Database
   └─ Cloud SQL encryption at rest

✅ Isolated Containers
   └─ Each service runs in isolation

✅ Secrets Management
   └─ Environment variables encrypted

✅ IAM Controls
   └─ Fine-grained access control
```

---

## 📊 Auto-Scaling Behavior

```
Traffic Level          Cloud Run Response
────────────────────────────────────────────
No traffic        →    0 instances (saves money)
                       Cold start: ~2-5 seconds

Light traffic     →    1-2 instances
                       Response time: <100ms

Medium traffic    →    2-5 instances
                       Auto-scales up

High traffic      →    Up to max instances (10)
                       Maintains performance

After traffic     →    Scales down to 0
spike                  Cost optimized
```

---

## 💰 Cost Breakdown

### Free Tier (First 2M requests/month):
```
Component          Free Tier            After Free Tier
──────────────────────────────────────────────────────
Cloud Run          2M requests FREE     $0.40 per million
Compute            360k GB-sec FREE     $0.00002400 per GB-sec
Networking         1 GB egress FREE     $0.12 per GB
Container Storage  0.5 GB FREE          $0.26 per GB/month
```

### Cloud SQL (No Free Tier):
```
Instance Type      Storage    Monthly Cost
───────────────────────────────────────────
db-f1-micro       10 GB SSD   ~$7-10/month
db-g1-small       10 GB SSD   ~$25/month
```

### Typical Monthly Cost for Small Site:
```
- Cloud Run:        $0-5   (usually free)
- Cloud SQL:        $7-10  (if using database)
- Container Reg:    $0.50
───────────────────
Total:              ~$10-15/month
```

---

## 🚀 Request Flow

When a user visits your website:

```
1. User enters URL
   └─► https://realestatehub-frontend-xxx.run.app
        │
        ▼
2. Google Cloud Load Balancer
   └─► Routes to nearest region
        │
        ▼
3. Cloud Run (Frontend)
   ├─► Serves Angular application
   ├─► User browses properties
   └─► Clicks on property details
        │
        ▼
4. Frontend makes API call
   └─► https://realestatehub-backend-xxx.run.app/api/properties/
        │
        ▼
5. Cloud Run (Backend)
   ├─► Django processes request
   ├─► Queries Cloud SQL database
   └─► Returns property data as JSON
        │
        ▼
6. Frontend receives data
   └─► Displays properties to user
        │
        ▼
7. User sees property listings
   └─► Fast, secure, scalable! ✅
```

---

## 🔧 Development vs Production

### Development (Local):
```
┌─────────────────────────┐
│  YOUR COMPUTER          │
│                         │
│  ├─ Frontend (localhost:4200)
│  │   └─ ng serve
│  │
│  ├─ Backend (localhost:8000)
│  │   └─ python manage.py runserver
│  │
│  └─ Database (SQLite)
│      └─ db.sqlite3
└─────────────────────────┘
```

### Production (GCP):
```
┌─────────────────────────────────┐
│  GOOGLE CLOUD                   │
│                                 │
│  ├─ Frontend (Cloud Run)       │
│  │   └─ Nginx + Angular dist   │
│  │   └─ Auto-scaling           │
│  │   └─ HTTPS enabled          │
│  │                              │
│  ├─ Backend (Cloud Run)        │
│  │   └─ Gunicorn + Django      │
│  │   └─ Auto-scaling           │
│  │   └─ HTTPS enabled          │
│  │                              │
│  └─ Database (Cloud SQL)       │
│      └─ PostgreSQL 15          │
│      └─ Auto-backup             │
│      └─ Encrypted              │
└─────────────────────────────────┘
```

---

## 📝 Environment Variables

### Backend Environment Variables:
```
DEBUG=False
SECRET_KEY=<auto-generated-secure-key>
DB_NAME=realestatehub
DB_USER=realestate_user
DB_PASSWORD=<your-db-password>
DB_HOST=/cloudsql/<connection-name>
ALLOWED_HOSTS=<backend-url>.run.app
CORS_ALLOWED_ORIGINS=<frontend-url>.run.app
```

### Frontend Environment Variables:
```
API_URL=<backend-url>.run.app/api
production=true
```

---

## 🎯 Key Benefits of This Architecture

✅ **Serverless**: No server management needed
✅ **Auto-scaling**: Handles traffic spikes automatically
✅ **Cost-effective**: Pay only for actual usage
✅ **Secure**: HTTPS, encryption, DDoS protection
✅ **Reliable**: 99.95% uptime SLA
✅ **Fast**: Global CDN, low latency
✅ **Easy updates**: Just run deploy script again

---

## 🔄 CI/CD Pipeline (Future Enhancement)

You can set up automated deployments:

```
GitHub Push
    │
    ▼
Cloud Build Trigger
    │
    ├─► Build Images
    ├─► Run Tests
    ├─► Push to GCR
    └─► Deploy to Cloud Run
    │
    ▼
Automatic Deployment ✅
```

---

## 📚 Related Documentation

- **Detailed Guide**: `GCP_DEPLOYMENT_GUIDE.md`
- **Quick Checklist**: `QUICK_DEPLOY_CHECKLIST.md`
- **Deployment Script**: `deploy-to-gcp.sh`

---

**Questions? Check the troubleshooting section in GCP_DEPLOYMENT_GUIDE.md**

