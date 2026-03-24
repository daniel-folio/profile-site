# 🚀 Deployment Guide

### Environment Variables Setup (Frontend)

#### 🔐 Admin Password

The admin password is now managed in Strapi Admin `Site Settings`. The frontend env `NEXT_PUBLIC_ADMIN_PASSWORD` is deprecated and removed. **Never hardcode passwords.**

#### 🌐 API URL Variables
```bash
# Primary backend URL (required in production)
NEXT_PUBLIC_STRAPI_API_URL_PRIMARY=https://your-backend-url.render.com

# Optional: Secondary backend for failover
NEXT_PUBLIC_STRAPI_API_URL_SECONDARY=https://your-backup-backend.example.com

# Optional: Vercel Preview/Dev specific URL
NEXT_PUBLIC_STRAPI_URL=https://your-preview-backend.example.com

# Optional: API token when calling Strapi from Vercel
# STRAPI_API_TOKEN=vercel_strapi_api_token
```

#### 🚀 **Backend Environment Variables**

##### **Strapi Backend (Render/Railway)**
```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Strapi
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=your_api_token_salt
ADMIN_JWT_SECRET=your_admin_jwt_secret
TRANSFER_TOKEN_SALT=your_transfer_token_salt
JWT_SECRET=your_jwt_secret

# Cloudinary (Image Storage)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret

# CORS
CLIENT_URL=https://your-frontend-domain.vercel.app
```

##### **Frontend Environment Variables**
```bash
# API Connection (centralized selection logic)
NEXT_PUBLIC_STRAPI_API_URL_PRIMARY=https://your-backend-url.render.com
# Optional: Secondary backend for failover
NEXT_PUBLIC_STRAPI_API_URL_SECONDARY=https://your-backup-backend.example.com
# Optional: Vercel Preview/Dev specific URL
NEXT_PUBLIC_STRAPI_URL=https://your-preview-backend.example.com
# Optional: API token when calling Strapi from Vercel
# STRAPI_API_TOKEN=vercel_strapi_api_token
```

#### 🔒 **Security Best Practices**

##### **Password Requirements**
- **Minimum 12 characters**
- **Include uppercase, lowercase, numbers, and symbols**
- **Different passwords for production vs test environments**
- **Rotate passwords regularly**

#### 🌍 **Environment-Specific Configuration**

##### **Production**
- **Domain**: `your-portfolio.vercel.app`
- **Backend**: `your-backend.render.com`
- **Database**: Production PostgreSQL
- **Admin Password**: Configure in Strapi Admin `Site Settings`

##### **Preview/Test**
- **Domain**: `your-portfolio-git-branch.vercel.app`
- **Backend**: Same backend or test backend
- **Database**: Same or test database

#### 🔧 **Local Development**

Create `.env.local` file in frontend directory:
```bash
# Frontend/.env.local
NEXT_PUBLIC_STRAPI_API_URL_PRIMARY=http://localhost:1337
```

#### 🚨 **Troubleshooting**

##### **Authentication/Connectivity Issues**
1. Ensure the backend is healthy and CORS allows your frontend
2. Verify `NEXT_PUBLIC_STRAPI_API_URL_PRIMARY` in production
3. Preview/Dev on Vercel uses `NEXT_PUBLIC_STRAPI_URL` (optional) → PRIMARY
4. Check Strapi `Site Settings > adminPassword` and the API response from `/api/site-settings/validatePassword`

##### **Password Authentication Issues**
1. Verify the password matches exactly (no extra spaces)
2. Check if you're using the correct environment (prod vs preview)
3. Try clearing browser cache and cookies
4. Check Vercel deployment logs for any errors

#### 📊 **Monitoring & Analytics**

##### **Visitor Analytics Access**
- **URL**: `https://your-domain.vercel.app/admin/visitors`
- **Authentication**: Password from Strapi `Site Settings`
- **Features**: Real-time dashboard, custom date ranges, session analysis

##### **Security Monitoring**
- Monitor failed login attempts
- Set up alerts for unusual access patterns
- Regular password rotation (recommended: every 3-6 months)

#### 🔄 **Deployment Workflow**

1. **Development**
   ```bash
   npm run dev
   # Access: http://localhost:3000/admin/visitors
   # Password: local_dev_password_123
   ```

2. **Preview Deployment**
   ```bash
   git push origin feature-branch
   # Auto-deploys to: your-portfolio-git-feature-branch.vercel.app
   # Password: your_test_password_here
   ```

3. **Production Deployment**
   ```bash
   git push origin main
   # Auto-deploys to: your-portfolio.vercel.app
   # Password: your_secure_production_password_here
   ```

#### 🔍 **Advanced Configuration**

##### **Multi-Environment Strategy**
- **Development**: Use simple passwords for local testing
- **Staging**: Mirror production settings for accurate testing
- **Production**: Implement enterprise-level security measures
- **Preview**: Separate credentials for branch-based deployments

##### **Environment Variable Management**
- **Centralized Control**: Manage all environments from Vercel dashboard
- **Version Control**: Track environment variable changes
- **Backup Strategy**: Document all environment configurations
- **Access Control**: Limit dashboard access to authorized team members

##### **Performance Optimization**
- **CDN Configuration**: Optimize static asset delivery
- **Database Connections**: Configure connection pooling
- **Caching Strategy**: Implement Redis for session management
- **Monitoring**: Set up performance alerts and logging

##### **Disaster Recovery**
- **Backup Procedures**: Regular database and configuration backups
- **Rollback Strategy**: Quick rollback procedures for failed deployments
- **Health Checks**: Automated monitoring and alerting systems
- **Documentation**: Maintain updated deployment runbooks
