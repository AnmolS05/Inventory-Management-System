# ✅ Deployment Checklist

Use this checklist to ensure smooth deployment to production.

## 📋 Pre-Deployment

### Code Preparation
- [ ] All code committed to Git
- [ ] No sensitive data in code (API keys, passwords)
- [ ] `.env` files in `.gitignore`
- [ ] Dependencies up to date (`npm audit`)
- [ ] Code tested locally
- [ ] No console.log in production code

### Accounts Setup
- [ ] GitHub account created
- [ ] Google account for Gemini API
- [ ] Cloud platform account (Railway/Vercel/Render)
- [ ] Database platform account (Neon/Supabase)

### API Keys Obtained
- [ ] Gemini API key from Google AI Studio
- [ ] Database connection string
- [ ] JWT secret generated (32+ characters)
- [ ] AWS keys (if using S3)

---

## 🗄️ Database Setup

### Neon (Recommended)
- [ ] Account created at neon.tech
- [ ] Project created: "inventory-system"
- [ ] Connection string copied
- [ ] Connection string includes `?sslmode=require`
- [ ] Database region selected (closest to users)

### Alternative: Render PostgreSQL
- [ ] Database created in Render
- [ ] Internal connection string copied
- [ ] Backup schedule configured

### Alternative: AWS RDS
- [ ] RDS instance created (PostgreSQL 15+)
- [ ] Security group configured
- [ ] Backup retention set
- [ ] Connection string obtained

---

## 🔧 Backend Deployment

### Railway (Recommended)
- [ ] Railway CLI installed: `npm i -g @railway/cli`
- [ ] Logged in: `railway login`
- [ ] Project initialized: `railway init`
- [ ] Environment variables set:
  - [ ] `DATABASE_URL`
  - [ ] `GEMINI_API_KEY`
  - [ ] `JWT_SECRET`
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5000`
  - [ ] `FRONTEND_URL` (temporary, update later)
- [ ] Deployed: `railway up`
- [ ] Domain obtained and copied
- [ ] Health check tested: `/api/health`

### Alternative: Render
- [ ] Web service created
- [ ] Root directory set to `backend`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Environment variables configured
- [ ] Service deployed
- [ ] URL copied

### Alternative: AWS Elastic Beanstalk
- [ ] EB CLI installed
- [ ] Application initialized
- [ ] Environment created
- [ ] Environment variables set
- [ ] Application deployed

---

## 🎨 Frontend Deployment

### Vercel (Recommended)
- [ ] Vercel CLI installed: `npm i -g vercel`
- [ ] Logged in: `vercel login`
- [ ] Deployed: `vercel --prod`
- [ ] Environment variable set:
  - [ ] `VITE_API_URL` = backend URL + `/api`
- [ ] Redeployed after env change
- [ ] URL copied
- [ ] Site loads correctly
- [ ] No console errors

### Alternative: Netlify
- [ ] Site created in Netlify
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Site deployed
- [ ] Custom domain configured (optional)

### Alternative: Render Static Site
- [ ] Static site created
- [ ] Root directory: `frontend`
- [ ] Build command: `npm install && npm run build`
- [ ] Publish directory: `dist`
- [ ] Environment variables set
- [ ] Site deployed

---

## 🔗 Connect Frontend & Backend

### Update Backend
- [ ] Backend `FRONTEND_URL` updated with actual Vercel URL
- [ ] No trailing slash in URL
- [ ] Backend redeployed
- [ ] CORS working (test from frontend)

### Update Frontend
- [ ] Frontend `VITE_API_URL` points to backend
- [ ] URL includes `/api` at the end
- [ ] Frontend redeployed
- [ ] API calls working

---

## 🧪 Testing

### Backend Tests
- [ ] Health endpoint: `GET /api/health` returns 200
- [ ] Database connection working (check logs)
- [ ] Tables created automatically
- [ ] CORS headers present
- [ ] Error handling working

### Frontend Tests
- [ ] Site loads without errors
- [ ] Can navigate between pages
- [ ] API calls successful (check Network tab)
- [ ] No CORS errors
- [ ] Images/assets loading
- [ ] Responsive on mobile

### Feature Tests
- [ ] Can add inventory item
- [ ] Can upload bill image
- [ ] AI processing works
- [ ] Can create sale
- [ ] Dashboard shows data
- [ ] Reports generate
- [ ] PDF generation works

---

## 🔐 Security

### Environment Variables
- [ ] All secrets in environment variables (not code)
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] Database password is strong
- [ ] No API keys in frontend code
- [ ] `.env` files not committed to Git

### HTTPS/SSL
- [ ] Frontend uses HTTPS (automatic on Vercel/Netlify)
- [ ] Backend uses HTTPS (automatic on Railway/Render)
- [ ] Database connection uses SSL
- [ ] Mixed content warnings resolved

### Access Control
- [ ] CORS configured correctly
- [ ] Only frontend URL allowed
- [ ] Rate limiting considered
- [ ] Input validation in place
- [ ] SQL injection prevention active

---

## 📊 Monitoring

### Logging
- [ ] Backend logs accessible (Railway/Render dashboard)
- [ ] Frontend errors tracked (Vercel dashboard)
- [ ] Database logs available (Neon dashboard)
- [ ] Error notifications configured (optional)

### Performance
- [ ] Backend response times acceptable (< 500ms)
- [ ] Frontend load time acceptable (< 3s)
- [ ] Database queries optimized
- [ ] Images optimized

### Uptime Monitoring (Optional)
- [ ] UptimeRobot configured
- [ ] Health check endpoint monitored
- [ ] Email alerts set up
- [ ] Status page created

---

## 💾 Backups

### Database
- [ ] Automatic backups enabled (Neon/Render)
- [ ] Backup retention period set
- [ ] Backup restoration tested
- [ ] Point-in-time recovery available

### Code
- [ ] Code in Git repository
- [ ] Repository backed up (GitHub)
- [ ] Environment variables documented
- [ ] Deployment process documented

---

## 📱 User Access

### URLs
- [ ] Frontend URL shared with team
- [ ] Backend URL documented (for API access)
- [ ] Health check URL bookmarked
- [ ] Admin credentials created

### Documentation
- [ ] User guide created
- [ ] API documentation available
- [ ] Troubleshooting guide ready
- [ ] Support contact provided

---

## 🚀 Post-Deployment

### Immediate (Day 1)
- [ ] Monitor logs for errors
- [ ] Test all critical features
- [ ] Verify data is saving correctly
- [ ] Check performance metrics
- [ ] Confirm backups running

### Short-term (Week 1)
- [ ] Review usage metrics
- [ ] Check cost/billing
- [ ] Gather user feedback
- [ ] Fix any reported issues
- [ ] Optimize slow queries

### Long-term (Month 1)
- [ ] Review security logs
- [ ] Analyze performance trends
- [ ] Plan scaling if needed
- [ ] Update documentation
- [ ] Consider additional features

---

## 💰 Cost Monitoring

### Free Tier Limits
- [ ] Neon: < 0.5GB database
- [ ] Railway: < $5/month usage
- [ ] Vercel: Unlimited (personal)
- [ ] Monitoring usage dashboards

### Billing Alerts
- [ ] Railway billing alerts set
- [ ] Neon usage notifications enabled
- [ ] AWS billing alerts configured (if using)
- [ ] Budget limits set

---

## 🔄 Maintenance Plan

### Daily
- [ ] Check error logs
- [ ] Monitor uptime
- [ ] Review critical alerts

### Weekly
- [ ] Review performance metrics
- [ ] Check database size
- [ ] Update dependencies (if needed)
- [ ] Backup verification

### Monthly
- [ ] Security updates
- [ ] Cost review
- [ ] Feature planning
- [ ] User feedback review

---

## 📞 Emergency Contacts

### Platform Support
- Railway: support@railway.app
- Vercel: support@vercel.com
- Neon: support@neon.tech

### Internal Team
- Developer: _______________
- Admin: _______________
- Support: _______________

---

## ✅ Final Verification

Before announcing to users:

- [ ] All checklist items completed
- [ ] No critical errors in logs
- [ ] Performance acceptable
- [ ] Security measures in place
- [ ] Backups configured
- [ ] Monitoring active
- [ ] Documentation complete
- [ ] Team trained
- [ ] Support plan ready

---

## 🎉 Launch!

- [ ] Announce to users
- [ ] Share access URLs
- [ ] Provide user guide
- [ ] Monitor closely for 24 hours
- [ ] Celebrate! 🎊

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Frontend URL**: _______________
**Backend URL**: _______________
**Database**: _______________

---

## 📝 Notes

Use this space for deployment-specific notes:

```
[Your notes here]
```
