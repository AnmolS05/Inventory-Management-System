# 🏪 Inventory Management System

A modern, cloud-based inventory management system designed for small shops with AI-powered bill processing, automated restocking, and comprehensive sales management.

## 🚀 Quick Start

### Want to Deploy Online? (Recommended)
```bash
# Run the deployment script
deploy.bat

# Or follow the guide
See START_HERE.md
```

### Want to Run Locally?
```bash
# Run the setup script
setup.bat

# Then start development
npm run dev
```

---

## ✨ Features

### 🤖 AI-Powered Bill Processing
- Upload purchase bill photos (JPG, PNG, PDF)
- Automatic text extraction using Google Gemini API
- Smart item recognition and inventory updates
- No manual data entry required

### 📦 Inventory Management
- Real-time stock tracking
- Low stock alerts and notifications
- Category-based organization
- Barcode support
- Bulk import/export capabilities

### 💰 Sales & Billing
- Quick point-of-sale interface
- Automatic PDF bill generation
- Multiple payment methods (Cash, Card, UPI)
- Customer information tracking
- Inventory deduction on sales

### 📊 Dashboard & Analytics
- Real-time business metrics
- Sales trend charts
- Top-selling items analysis
- Revenue tracking
- Low stock alerts

### 📋 Reports & Documentation
- Detailed inventory reports
- Sales performance analysis
- Custom date range reports
- PDF export functionality
- Purchase and sales bill history

## 🏗️ Architecture

```
Frontend (React + Tailwind)
    ↓ REST API
Backend (Node.js + Express)
    ↓
Database (PostgreSQL)
    ↓
External Services:
- Google Gemini API (OCR)
- AWS S3 (File Storage)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 15+
- Google Gemini API key
- AWS S3 bucket (optional, falls back to local storage)

### 1. Clone Repository
```bash
git clone <repository-url>
cd inventory-management-system
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Environment Setup

#### Backend Configuration
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/inventory_db

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name

# Security
JWT_SECRET=your_super_secret_jwt_key

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

#### Frontend Configuration
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Database Setup
```bash
# Create PostgreSQL database
createdb inventory_db

# The application will automatically create tables on first run
```

### 5. Start Development Servers
```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:backend  # Backend on http://localhost:5000
npm run dev:frontend # Frontend on http://localhost:3000
```

## 🐳 Docker Setup

### Using Docker Compose
```bash
# Copy environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit the .env files with your configuration

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Docker Builds
```bash
# Backend
cd backend
docker build -t inventory-backend .
docker run -p 5000:5000 inventory-backend

# Frontend
cd frontend
docker build -t inventory-frontend .
docker run -p 3000:3000 inventory-frontend
```

## 🔧 API Documentation

### Authentication
Currently using JWT tokens. Future versions will include user management.

### Core Endpoints

#### Inventory Management
```http
GET    /api/inventory              # Get all items
POST   /api/inventory              # Add new item
PUT    /api/inventory/:id          # Update item
DELETE /api/inventory/:id          # Delete item
POST   /api/inventory/process-bill # Process bill with AI
GET    /api/inventory/alerts/low-stock # Get low stock items
```

#### Sales Management
```http
GET    /api/sales                  # Get all sales
POST   /api/sales                  # Create new sale
GET    /api/sales/:id              # Get sale details
GET    /api/sales/stats/summary    # Get sales statistics
```

#### Dashboard & Reports
```http
GET    /api/dashboard/overview     # Dashboard data
GET    /api/dashboard/charts/sales # Sales chart data
GET    /api/dashboard/reports/inventory # Inventory report
```

### Example API Usage

#### Process Bill with AI
```javascript
const formData = new FormData();
formData.append('billImage', fileInput.files[0]);

const response = await fetch('/api/inventory/process-bill', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Processed items:', result.data.items);
```

#### Create Sale
```javascript
const saleData = {
  items: [
    { item_id: 1, quantity: 2 },
    { item_id: 5, quantity: 1 }
  ],
  customer_name: 'John Doe',
  customer_phone: '+1234567890',
  payment_method: 'card'
};

const response = await fetch('/api/sales', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(saleData)
});
```

## 🌐 Cloud Deployment

### Backend Deployment (Railway/Render/AWS)

1. **Environment Variables**: Set all required environment variables
2. **Database**: Use managed PostgreSQL (AWS RDS, Railway, etc.)
3. **File Storage**: Configure AWS S3 for production
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npm start`

### Frontend Deployment (Vercel/Netlify)

1. **Build Command**: `npm run build`
2. **Output Directory**: `dist`
3. **Environment Variables**: Set `VITE_API_URL` to your backend URL

### Example Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod

# Set environment variable
vercel env add VITE_API_URL production
```

### Example Railway Deployment
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy backend
cd backend
railway login
railway init
railway up
```

## 🔐 Security Considerations

### Production Checklist
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable database SSL
- [ ] Set up proper S3 bucket policies
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Enable security headers (Helmet.js)

### Environment Variables Security
```bash
# Never commit .env files
echo ".env" >> .gitignore

# Use different secrets for each environment
JWT_SECRET=$(openssl rand -base64 32)
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### API Testing with curl
```bash
# Health check
curl http://localhost:5000/api/health

# Get inventory
curl http://localhost:5000/api/inventory

# Create item
curl -X POST http://localhost:5000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Item","quantity":10,"unit_price":5.99}'
```

## 📱 Mobile Support

The application is fully responsive and works on mobile devices. For native mobile apps, consider:

- React Native version
- Progressive Web App (PWA) features
- Mobile-optimized barcode scanning

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Check connection string
echo $DATABASE_URL
```

#### Gemini API Error
```bash
# Verify API key
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
  https://generativelanguage.googleapis.com/v1/models
```

#### File Upload Issues
```bash
# Check upload directory permissions
ls -la backend/uploads/

# Create directories if missing
mkdir -p backend/uploads/{bills,pdfs,reports}
```

### Performance Optimization

#### Database Indexing
```sql
-- Add indexes for better performance
CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_sales_created_at ON sales(created_at);
```

#### Image Optimization
- Compress images before upload
- Use WebP format when possible
- Implement image resizing

### Monitoring & Logging

#### Production Logging
```javascript
// Use structured logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🎯 Roadmap

### Version 2.0 Features
- [ ] Multi-store support
- [ ] Advanced analytics with ML
- [ ] Barcode scanning mobile app
- [ ] Supplier management
- [ ] Purchase order automation
- [ ] Integration with accounting software
- [ ] Multi-language support
- [ ] Advanced user roles and permissions

### Version 3.0 Features
- [ ] AI-powered demand forecasting
- [ ] Automated reordering
- [ ] Integration with e-commerce platforms
- [ ] Advanced reporting with BI tools
- [ ] Mobile POS application
- [ ] Voice-activated inventory management

---

**Built with ❤️ for small businesses**

For questions or support, please open an issue or contact the development team.