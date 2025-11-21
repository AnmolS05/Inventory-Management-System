# 🚀 Cloud Deployment Guide

This guide will help you deploy the Inventory Management System to the cloud with proper database and server hosting.

## 🌐 Recommended Cloud Setup

### Architecture
```
Frontend (Vercel/Netlify) → Backend (Railway/Render) → Database (Neon/Supabase)
```

---

## Option 1: Quick Deploy (Recommended for Beginners)

### Step 1: Deploy Database (Neon - Free PostgreSQL)

1. Go to [Neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create a new project: "inventory-system"
4. Copy the connection string (looks like):
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. Save this - you'll need it for backend deployment

### Step 2: Deploy Backend (Railway - Free Tier)

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Click "Add variables" and set:
   ```
   DATABASE_URL=your_neon_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=your_random_secret_key
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   ```
6. Set Root Directory: `backend`
7. Set Start Command: `npm start`
8. Deploy! Copy your backend URL (e.g., `https://your-app.up.railway.app`)

### Step 3: Deploy Frontend (Vercel - Free)

1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import your repository
5. Configure:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend.up.railway.app/api
   ```
7. Deploy!

### Step 4: Update Backend FRONTEND_URL

1. Go back to Railway
2. Update `FRONTEND_URL` variable with your Vercel URL
3. Redeploy backend

---

## Option 2: All-in-One Platform (Render)

### Step 1: Database (Render PostgreSQL)

1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "PostgreSQL"
4. Name: `inventory-db`
5. Plan: Free
6. Create Database
7. Copy "Internal Database URL"

### Step 2: Backend (Render Web Service)

1. Click "New" → "Web Service"
2. Connect your repository
3. Configure:
   - Name: `inventory-backend`
   - Root Directory: `backend`
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add Environment Variables:
   ```
   DATABASE_URL=your_render_db_url
   GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=your_random_secret
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-frontend.onrender.com
   ```
5. Create Web Service
6. Copy your backend URL

### Step 3: Frontend (Render Static Site)

1. Click "New" → "Static Site"
2. Connect your repository
3. Configure:
   - Name: `inventory-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```
5. Create Static Site

---

## Option 3: AWS (Production Grade)

### Prerequisites
- AWS Account
- AWS CLI installed
- Basic AWS knowledge

### Step 1: Database (AWS RDS PostgreSQL)

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier inventory-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password YourSecurePassword123 \
  --allocated-storage 20
```

### Step 2: Backend (AWS Elastic Beanstalk)

1. Install EB CLI:
   ```bash
   pip install awsebcli
   ```

2. Initialize and deploy:
   ```bash
   cd backend
   eb init -p node.js inventory-backend
   eb create inventory-backend-env
   eb setenv DATABASE_URL=your_rds_url GEMINI_API_KEY=your_key
   eb deploy
   ```

### Step 3: Frontend (AWS S3 + CloudFront)

```bash
cd frontend
npm run build

# Create S3 bucket
aws s3 mb s3://inventory-frontend

# Upload files
aws s3 sync dist/ s3://inventory-frontend --acl public-read

# Enable static website hosting
aws s3 website s3://inventory-frontend --index-document index.html
```

---

## 🔑 Getting API Keys

### Gemini API Key (Required)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

### AWS S3 (Optional - for file uploads)
1. Go to AWS Console → IAM
2. Create new user with S3 access
3. Generate access keys
4. Create S3 bucket for file storage

---

## 📝 Environment Variables Reference

### Backend (.env)
```env
# Database (from Neon/Render/RDS)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Gemini AI (from Google AI Studio)
GEMINI_API_KEY=AIzaSy...

# Security (generate random string)
JWT_SECRET=use_openssl_rand_base64_32
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=production

# Frontend URL (from Vercel/Render)
FRONTEND_URL=https://your-frontend-url.com

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket
```

### Frontend (.env)
```env
# Backend API URL (from Railway/Render)
VITE_API_URL=https://your-backend-url.com/api
```

---

## 🔧 Platform-Specific Configurations

### Railway (railway.json)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Render (render.yaml)
```yaml
services:
  - type: web
    name: inventory-backend
    env: node
    rootDir: backend
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production

  - type: web
    name: inventory-frontend
    env: static
    rootDir: frontend
    buildCommand: npm install && npm run build
    staticPublishPath: dist
```

### Vercel (vercel.json)
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🧪 Testing Your Deployment

### 1. Test Backend Health
```bash
curl https://your-backend-url.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### 2. Test Database Connection
Check backend logs for:
```
✅ Database initialized successfully
✅ Database tables created successfully
```

### 3. Test Frontend
1. Open your frontend URL
2. Check browser console for errors
3. Try creating a test inventory item

---

## 🐛 Common Issues & Solutions

### Issue: Database Connection Failed
**Solution:**
- Check DATABASE_URL format includes `?sslmode=require` for cloud databases
- Verify database is running and accessible
- Check firewall rules allow connections

### Issue: CORS Error
**Solution:**
- Update backend `FRONTEND_URL` environment variable
- Ensure it matches your actual frontend URL (no trailing slash)
- Redeploy backend after changing

### Issue: API Key Invalid
**Solution:**
- Verify Gemini API key is correct
- Check if API is enabled in Google Cloud Console
- Ensure no extra spaces in environment variable

### Issue: Build Failed
**Solution:**
- Check Node.js version (should be 18+)
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall

---

## 💰 Cost Estimates

### Free Tier (Perfect for Testing)
- **Neon**: Free PostgreSQL (0.5GB storage)
- **Railway**: $5 credit/month (enough for small apps)
- **Vercel**: Unlimited for personal projects
- **Total**: FREE for small usage

### Production (Small Business)
- **Render**: $7/month (PostgreSQL) + $7/month (Backend)
- **Vercel**: Free (Frontend)
- **Total**: ~$14/month

### Production (High Traffic)
- **AWS RDS**: ~$15/month (db.t3.micro)
- **AWS Elastic Beanstalk**: ~$25/month
- **AWS S3 + CloudFront**: ~$5/month
- **Total**: ~$45/month

---

## 🔒 Security Checklist

Before going live:
- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS (automatic on Vercel/Railway/Render)
- [ ] Set up database backups
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Enable database SSL
- [ ] Review S3 bucket permissions
- [ ] Set up monitoring/alerts
- [ ] Add environment-specific configs

---

## 📊 Monitoring & Maintenance

### Logging
- Railway: Built-in logs viewer
- Render: Logs tab in dashboard
- Vercel: Function logs in dashboard

### Database Backups
- Neon: Automatic daily backups
- Render: Automatic backups on paid plans
- AWS RDS: Configure automated backups

### Uptime Monitoring
Use free services:
- [UptimeRobot](https://uptimerobot.com)
- [Pingdom](https://www.pingdom.com)
- [StatusCake](https://www.statuscake.com)

---

## 🚀 Quick Start Commands

### Deploy to Railway (Backend)
```bash
npm i -g @railway/cli
railway login
cd backend
railway init
railway up
railway variables set DATABASE_URL=your_db_url
railway variables set GEMINI_API_KEY=your_key
```

### Deploy to Vercel (Frontend)
```bash
npm i -g vercel
cd frontend
vercel login
vercel --prod
vercel env add VITE_API_URL production
```

---

## 📞 Support

If you encounter issues:
1. Check platform status pages
2. Review deployment logs
3. Test API endpoints individually
4. Check environment variables
5. Verify database connectivity

For platform-specific help:
- Railway: [docs.railway.app](https://docs.railway.app)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Render: [render.com/docs](https://render.com/docs)
- Neon: [neon.tech/docs](https://neon.tech/docs)
