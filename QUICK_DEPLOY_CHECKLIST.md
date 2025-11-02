# ⚡ Quick Deployment Checklist

## Real Estate Website → Google Cloud Platform

---

## 🎯 PART 1: GCP Portal Setup (One-time)

### 1. Create GCP Account & Project
- [ ] Go to https://console.cloud.google.com/
- [ ] Sign in with Google account
- [ ] Click "New Project"
- [ ] Name: `RealEstateHub`
- [ ] **SAVE YOUR PROJECT ID** → _____________________

### 2. Enable Billing
- [ ] Go to Billing menu
- [ ] Link billing account
- [ ] Add payment method

### 3. Create Database (Recommended)
- [ ] Go to SQL → Create Instance → PostgreSQL
- [ ] Instance ID: `realestatehub-db`
- [ ] Choose region: `us-central1`
- [ ] Machine: db-f1-micro
- [ ] **SAVE PASSWORD** → _____________________
- [ ] Create database: `realestatehub`
- [ ] Create user: `realestate_user`
- [ ] **SAVE CONNECTION NAME** → _____________________
  - Format: `project-id:region:instance-name`

---

## 💻 PART 2: Local Setup (One-time)

### 4. Install Google Cloud SDK
```bash
# macOS
brew install --cask google-cloud-sdk

# Verify
gcloud --version
```

### 5. Login to Google Cloud
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud auth configure-docker
```

---

## 🚀 PART 3: Deploy Application

### 6. Run Deployment Script
```bash
cd /Users/damureddy/real-estate-website
chmod +x deploy-to-gcp.sh
./deploy-to-gcp.sh
```

### 7. Answer Prompts
- **Project ID**: [Enter your saved Project ID]
- **Region**: [Press Enter for us-central1]
- **SECRET_KEY**: [Press Enter to auto-generate]
- **Have Cloud SQL?**: [y or n]
  - If yes:
    - **Connection name**: [Enter saved connection name]
    - **DB Password**: [Enter saved password]

### 8. Wait & Note URLs
- [ ] Wait 10-20 minutes for deployment
- [ ] **SAVE BACKEND URL** → _____________________
- [ ] **SAVE FRONTEND URL** → _____________________

---

## ✅ PART 4: Verify Deployment

### 9. Test Your Application
- [ ] Open frontend URL in browser
- [ ] Check if website loads
- [ ] Test navigation (Home, Buy, Rent, Contact)
- [ ] Open backend URL + `/admin`
- [ ] Login with: admin@realestate.com / admin123

---

## 📋 Important Information to Save

| Item | Value |
|------|-------|
| Project ID | ___________________ |
| Region | us-central1 |
| DB Password | ___________________ |
| DB Connection | ___________________ |
| Backend URL | ___________________ |
| Frontend URL | ___________________ |
| SECRET_KEY | ___________________ |

---

## 🆘 Quick Troubleshooting

### "Permission denied"
```bash
gcloud auth login
```

### "Docker not found"
```bash
# Check Docker is running
docker ps
```

### "Cannot connect to database"
- Check Cloud SQL instance is running in GCP Console
- Verify connection name is correct

### View Logs
```bash
gcloud run services logs read realestatehub-backend --region=us-central1
```

---

## 💰 Expected Costs

**Free Tier covers**:
- 2 million requests/month
- Should be FREE for initial testing

**With Database**:
- ~$7-15/month for Cloud SQL db-f1-micro
- ~$10-20/month total for small traffic

---

## 🔄 To Update Your App Later

```bash
# Just run the deployment script again
./deploy-to-gcp.sh
```

---

## 📞 Helpful Commands

```bash
# Check deployment status
gcloud run services list

# View live logs
gcloud logging tail "resource.type=cloud_run_revision"

# Get service URL
gcloud run services describe realestatehub-backend --format="value(status.url)"
```

---

## ✨ You're Done!

Access your live application at the Frontend URL!

🌐 **Frontend**: Your saved frontend URL
🔧 **Admin Panel**: Backend URL + `/admin`

---

**For detailed instructions, see: GCP_DEPLOYMENT_GUIDE.md**

