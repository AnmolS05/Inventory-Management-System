# ⚡ Quick Start - Cloud Deployment (Windows)

Get your app online in 15 minutes!

## 🎯 What You'll Get

- ✅ Live website accessible from anywhere
- ✅ Cloud PostgreSQL database
- ✅ Automatic HTTPS/SSL
- ✅ Free hosting (for small usage)
- ✅ No server maintenance

---

## 🚀 Fastest Method (Railway + Vercel)

### Prerequisites
- GitHub account
- Node.js installed
- 15 minutes of your time

### Step 1: Prepare Your Code (2 min)

```bash
# Open terminal in project folder
cd your-project-folder

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### Step 2: Setup Database (3 min)

1. **Go to [neon.tech](https://neon.tech)**
2. Click "Sign Up" → Use GitHub
3. Click "Create Project"
   - Name: `inventory-system`
   - Region: Choose closest to you
4. **Copy the connection string** (looks like):
   ```
   postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. Save it in Notepad - you'll need it soon!

### Step 3: Get Gemini API Key (2 min)

1. **Go to [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)**
2. Click "Create API Key"
3. Copy the key (starts with `AIzaSy...`)
4. Save it in Notepad

### Step 4: Deploy Backend (4 min)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login
# (Browser will open - sign in with GitHub)

# Deploy backend
cd backend
railway init
# Choose: "Create new project"
# Name it: "inventory-backend"

# Set environment variables
railway variables set DATABASE_URL="paste_your_neon_url_here"
railway variables set GEMINI_API_KEY="paste_your_gemini_key_here"
railway variables set JWT_SECRET="my_super_secret_key_12345"
railway variables set NODE_ENV="production"
railway variables set PORT="5000"

# Deploy!
railway up

# Get your backend URL
railway domain
# Copy the URL (e.g., https://inventory-backend-production.up.railway.app)
```

### Step 5: Deploy Frontend (4 min)

```bash
# Install Vercel CLI
npm install -g vercel

# Go to frontend folder
cd ../frontend

# Login to Vercel
vercel login
# (Browser will open - sign in with GitHub)

# Deploy!
vercel --prod
# Answer questions:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name? inventory-frontend
# - Directory? ./
# - Override settings? N

# Your frontend is now live!
# Copy the URL (e.g., https://inventory-frontend.vercel.app)
```

### Step 6: Connect Frontend to Backend (1 min)

```bash
# Still in frontend folder
vercel env add VITE_API_URL production
# When prompted, enter: https://your-backend-url.up.railway.app/api

# Redeploy to apply changes
vercel --prod
```

### Step 7: Update Backend with Frontend URL (1 min)

```bash
cd ../backend
railway variables set FRONTEND_URL="https://your-frontend-url.vercel.app"
railway up
```

---

## 🎉 Done! Your App is Live!

Visit your frontend URL to see your app online!

### Test It:
1. Open: `https://your-frontend-url.vercel.app`
2. Check backend health: `https://your-backend-url.up.railway.app/api/health`

---

## 🔧 Alternative: Use the Deploy Script

We've created a helper script for you:

```bash
# Run the deployment script
deploy.bat

# Follow the interactive prompts
```

---

## 💡 What Just Happened?

1. **Neon** hosts your PostgreSQL database (free 0.5GB)
2. **Railway** runs your Node.js backend (free $5 credit/month)
3. **Vercel** serves your React frontend (free unlimited)
4. All connected with environment variables

---

## 📱 Share Your App

Your app is now accessible from:
- Any computer
- Any phone
- Anywhere in the world

Just share your Vercel URL!

---

## 🐛 Troubleshooting

### "railway: command not found"
```bash
npm install -g @railway/cli
# Restart your terminal
```

### "vercel: command not found"
```bash
npm install -g vercel
# Restart your terminal
```

### Backend shows "Database connection failed"
- Check your DATABASE_URL includes `?sslmode=require`
- Verify the connection string is correct
- Check Neon dashboard - database should be "Active"

### Frontend can't connect to backend
- Check VITE_API_URL includes `/api` at the end
- Verify backend URL is correct (test with `/api/health`)
- Check Railway logs for errors: `railway logs`

### CORS Error
- Make sure FRONTEND_URL in Railway matches your Vercel URL exactly
- No trailing slash in FRONTEND_URL
- Redeploy backend after changing: `railway up`

---

## 💰 Costs

### Free Tier (Perfect for Testing)
- Neon: Free forever (0.5GB storage)
- Railway: $5 credit/month (enough for small apps)
- Vercel: Free unlimited for personal projects
- **Total: $0/month** for small usage

### When You Grow
- Railway: ~$5-10/month
- Neon: ~$0-20/month (based on usage)
- Vercel: Still free!

---

## 🔐 Security Tips

Before sharing with customers:

1. **Change JWT_SECRET** to something random:
   ```bash
   railway variables set JWT_SECRET="use_a_long_random_string_here"
   ```

2. **Enable database backups** (in Neon dashboard)

3. **Monitor usage** (check Railway/Vercel dashboards)

---

## 📊 Managing Your App

### View Backend Logs
```bash
cd backend
railway logs
```

### View Database
```bash
railway run psql $DATABASE_URL
```

### Update Backend Code
```bash
cd backend
# Make your changes
railway up
```

### Update Frontend Code
```bash
cd frontend
# Make your changes
vercel --prod
```

---

## 🎓 Next Steps

1. **Add your data**: Start adding inventory items
2. **Test features**: Upload a bill, make a sale
3. **Customize**: Change colors, add your logo
4. **Monitor**: Check Railway/Vercel dashboards
5. **Scale**: Upgrade plans when needed

---

## 📞 Need Help?

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Neon Docs: [neon.tech/docs](https://neon.tech/docs)

For detailed deployment options, see `DEPLOYMENT.md`

---

**Your inventory system is now running in the cloud! 🚀**
