# 📋 Quick Reference Card

Keep this handy during deployment!

---

## 🔗 Sign Up Links

| Service | Purpose | URL |
|---------|---------|-----|
| **Neon** | Database | [neon.tech](https://neon.tech) |
| **Railway** | Backend | [railway.app](https://railway.app) |
| **Vercel** | Frontend | [vercel.com](https://vercel.com) |
| **Gemini** | AI API | [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey) |

---

## ⚡ Quick Commands

```bash
# Install CLIs
npm install -g @railway/cli
npm install -g vercel

# Login
railway login
vercel login

# Deploy
cd backend && railway up
cd frontend && vercel --prod

# View logs
railway logs
vercel logs
```

---

## 🔑 Environment Variables

### Backend (Railway)
```
DATABASE_URL=postgresql://...?sslmode=require
GEMINI_API_KEY=AIzaSy...
JWT_SECRET=random_32_char_string
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-api.railway.app/api
```

---

## ✅ Testing URLs

After deployment, test these:

```
Frontend:     https://your-app.vercel.app
Backend:      https://your-api.railway.app/api/health
Database:     Check Neon dashboard
```

---

## 🐛 Quick Fixes

| Problem | Solution |
|---------|----------|
| Command not found | Install CLI, restart terminal |
| Database error | Add `?sslmode=require` to URL |
| CORS error | Update FRONTEND_URL, redeploy |
| Build failed | Check Node.js 18+, clear cache |

---

## 💰 Free Tier Limits

- **Neon**: 0.5GB database
- **Railway**: $5 credit/month
- **Vercel**: Unlimited (personal)

---

## 📞 Support

- Railway: [docs.railway.app](https://docs.railway.app)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Neon: [neon.tech/docs](https://neon.tech/docs)

---

## 📁 Key Files

- `START_HERE.md` - Start here
- `QUICKSTART_CLOUD.md` - Step-by-step
- `DEPLOYMENT.md` - All options
- `deploy.bat` - Automated script

---

**Print this page and keep it nearby during deployment!**
