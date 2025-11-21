# 🌐 Cloud-Ready Inventory Management System

A production-ready inventory management system with AI-powered bill processing, designed for easy cloud deployment.

## ⚡ Quick Deploy (15 minutes)

### Option 1: One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Option 2: Automated Script (Windows)

```bash
# Clone and setup
git clone <your-repo>
cd inventory-management-system

# Run deployment script
deploy.bat
```

### Option 3: Manual (Full Control)

See [QUICKSTART_CLOUD.md](QUICKSTART_CLOUD.md) for step-by-step guide.

---

## 🏗️ Cloud Architecture

```
┌─────────────────┐
│   Users/Phones  │
└────────┬────────┘
         │
    ┌────▼─────┐
    │ Vercel   │ ← Frontend (React)
    │ (Free)   │
    └────┬─────┘
         │ HTTPS
    ┌────▼─────┐
    │ Railway  │ ← Backend (Node.js)
    │ ($5/mo)  │
    └────┬─────┘
         │
    ┌────▼─────┐
    │ Neon     │ ← Database (PostgreSQL)
    │ (Free)   │
    └──────────┘
```

---

## ✨ Features

### 🤖 AI-Powered
- Upload bill photos → Auto-extract items
- Google Gemini AI integration
- No manual data entry

### 📦 Inventory Management
- Real-time stock tracking
- Low stock alerts
- Category organization
- Barcode support

### 💰 Sales & Billing
- Quick POS interface
- Auto PDF generation
- Multiple payment methods
- Customer tracking

### 📊 Analytics
- Sales trends
- Revenue tracking
- Top products
- Custom reports

---

## 🚀 Deployment Platforms

### Recommended Stack (Free Tier)

| Service | Purpose | Free Tier | Cost After |
|---------|---------|-----------|------------|
| [Neon](https://neon.tech) | PostgreSQL Database | 0.5GB | $0-20/mo |
| [Railway](https://railway.app) | Backend API | $5 credit | $5-10/mo |
| [Vercel](https://vercel.com) | Frontend | Unlimited | Free |

**Total: $0/month** for small businesses!

### Alternative Platforms

- **Render**: All-in-one ($7/mo for DB + $7/mo for backend)
- **AWS**: Production-grade (~$45/mo)
- **DigitalOcean**: VPS hosting (~$12/mo)
- **Heroku**: Simple deployment (~$7/mo)

---

## 📋 Prerequisites

### Required
- GitHub account (for deployment)
- Google account (for Gemini API)
- 15 minutes

### Optional
- Custom domain
- AWS account (for S3 file storage)
- Stripe account (for payments)

---

## 🔑 API Keys Needed

### 1. Gemini API (Required - Free)
1. Go to [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key

### 2. Database URL (Required - Free)
1. Sign up at [neon.tech](https://neon.tech)
2. Create project
3. Copy connection string

### 3. AWS S3 (Optional)
For production file uploads:
1. Create S3 bucket
2. Generate IAM access keys
3. Configure in environment variables

---

## 🎯 Quick Start Guide

### For Windows Users

```bash
# 1. Clone repository
git clone <your-repo-url>
cd inventory-management-system

# 2. Run deployment script
deploy.bat

# 3. Follow the prompts
# - Enter database URL
# - Enter Gemini API key
# - Choose deployment platform

# 4. Done! Your app is live
```

### For Manual Deployment

See detailed guides:
- [QUICKSTART_CLOUD.md](QUICKSTART_CLOUD.md) - Step-by-step
- [DEPLOYMENT.md](DEPLOYMENT.md) - All platforms

---

## 🔧 Environment Variables

### Backend (Railway/Render)

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
GEMINI_API_KEY=AIzaSy...
JWT_SECRET=random_secret_key_32_chars
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (Vercel/Netlify)

```env
VITE_API_URL=https://your-backend.railway.app/api
```

---

## 📱 Access Your App

After deployment:

1. **Frontend**: `https://your-app.vercel.app`
2. **Backend API**: `https://your-api.railway.app/api`
3. **Health Check**: `https://your-api.railway.app/api/health`

Share the frontend URL with your team!

---

## 🧪 Testing Deployment

### 1. Check Backend
```bash
curl https://your-backend-url.com/api/health
```

Expected:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### 2. Check Frontend
- Open your Vercel URL
- Should see login/dashboard
- Check browser console (F12) for errors

### 3. Test Features
- Add inventory item
- Upload a bill (test AI)
- Create a sale
- View dashboard

---

## 💰 Cost Calculator

### Small Shop (< 100 transactions/day)
- Neon: Free
- Railway: $5/mo
- Vercel: Free
- **Total: $5/month**

### Medium Shop (< 1000 transactions/day)
- Neon: $10/mo
- Railway: $10/mo
- Vercel: Free
- **Total: $20/month**

### Large Shop (> 1000 transactions/day)
- AWS RDS: $15/mo
- AWS Elastic Beanstalk: $25/mo
- CloudFront: $5/mo
- **Total: $45/month**

---

## 🔐 Security Features

✅ HTTPS/SSL (automatic)
✅ JWT authentication
✅ Database SSL connections
✅ CORS protection
✅ Input validation
✅ SQL injection prevention
✅ XSS protection
✅ Rate limiting ready

---

## 📊 Monitoring

### Built-in Dashboards
- **Railway**: Real-time logs, metrics, usage
- **Vercel**: Analytics, performance, errors
- **Neon**: Database stats, queries, storage

### External Monitoring (Optional)
- [UptimeRobot](https://uptimerobot.com) - Free uptime monitoring
- [Sentry](https://sentry.io) - Error tracking
- [LogRocket](https://logrocket.com) - Session replay

---

## 🔄 Updates & Maintenance

### Update Backend
```bash
cd backend
# Make changes
railway up  # or: git push (if using GitHub integration)
```

### Update Frontend
```bash
cd frontend
# Make changes
vercel --prod  # or: git push (if using GitHub integration)
```

### Database Backups
- **Neon**: Automatic daily backups (free)
- **Render**: Automatic backups (paid plans)
- **AWS RDS**: Configure automated backups

---

## 🐛 Common Issues

### "Cannot connect to database"
- Check DATABASE_URL includes `?sslmode=require`
- Verify database is active in Neon dashboard
- Check Railway logs: `railway logs`

### "CORS error"
- Verify FRONTEND_URL matches your Vercel URL exactly
- No trailing slash
- Redeploy backend after changing

### "Gemini API error"
- Check API key is correct
- Verify API is enabled in Google Cloud Console
- Check Railway logs for detailed error

### "Build failed"
- Check Node.js version (18+)
- Verify all dependencies in package.json
- Check build logs in platform dashboard

---

## 📞 Support

### Documentation
- [Quick Start](QUICKSTART_CLOUD.md)
- [Full Deployment Guide](DEPLOYMENT.md)
- [API Documentation](API.md)

### Platform Help
- Railway: [docs.railway.app](https://docs.railway.app)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Neon: [neon.tech/docs](https://neon.tech/docs)

### Community
- GitHub Issues
- Discord (coming soon)
- Email support

---

## 🎓 Next Steps

1. ✅ Deploy to cloud
2. 📝 Add your inventory
3. 🧪 Test all features
4. 👥 Invite team members
5. 📱 Share with customers
6. 📊 Monitor usage
7. 🚀 Scale as needed

---

## 📄 License

MIT License - Free for commercial use

---

## 🌟 Features Roadmap

### Coming Soon
- [ ] Multi-store support
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Supplier management
- [ ] Automated reordering
- [ ] WhatsApp notifications
- [ ] Multi-language support

---

**Built for small businesses. Deployed in minutes. Scales with you. 🚀**

[Get Started](QUICKSTART_CLOUD.md) | [Full Guide](DEPLOYMENT.md) | [Demo](https://demo.example.com)
