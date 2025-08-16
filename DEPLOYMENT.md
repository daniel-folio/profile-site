# Deployment Guide | 배포 가이드

## Vercel Environment Variables Setup

### 🔐 Admin Password Configuration

For security, the admin password must be set via environment variables in Vercel. **Never use hardcoded passwords in production.**

#### 1. **Production Environment**
```bash
# Vercel Dashboard > Project > Settings > Environment Variables
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_production_password_here
```

#### 2. **Preview/Test Environment**
```bash
# Vercel Dashboard > Project > Settings > Environment Variables
NEXT_PUBLIC_ADMIN_PASSWORD=your_test_password_here
```

### 📋 **Step-by-Step Setup in Vercel**

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click on **Settings** tab
   - Select **Environment Variables**

2. **Add Production Password**
   - **Key**: `NEXT_PUBLIC_ADMIN_PASSWORD`
   - **Value**: Your secure production password
   - **Environments**: Select **Production**
   - Click **Save**

3. **Add Preview/Test Password**
   - **Key**: `NEXT_PUBLIC_ADMIN_PASSWORD`
   - **Value**: Your test password (can be different from production)
   - **Environments**: Select **Preview** and **Development**
   - Click **Save**

### 🚀 **Backend Environment Variables**

#### **Strapi Backend (Render/Railway)**
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

#### **Frontend Environment Variables**
```bash
# API Connection
NEXT_PUBLIC_STRAPI_API_URL=https://your-backend-url.render.com

# Admin Access
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password

# Analytics (Optional)
NEXT_PUBLIC_ENABLE_VISITOR_TRACKING=true
```

### 🔒 **Security Best Practices**

#### **Password Requirements**
- **Minimum 12 characters**
- **Include uppercase, lowercase, numbers, and symbols**
- **Different passwords for production vs test environments**
- **Rotate passwords regularly**

#### **Example Strong Passwords**
```bash
# Production (example - generate your own!)
NEXT_PUBLIC_ADMIN_PASSWORD=Pr0d#2025$V1s1t0r@Dash

# Test/Preview (example - generate your own!)
NEXT_PUBLIC_ADMIN_PASSWORD=T3st#2025$V1s1t0r@Dev
```

### 🌍 **Environment-Specific Configuration**

#### **Production**
- **Domain**: `your-portfolio.vercel.app`
- **Backend**: `your-backend.render.com`
- **Database**: Production PostgreSQL
- **Password**: Strong, unique production password

#### **Preview/Test**
- **Domain**: `your-portfolio-git-branch.vercel.app`
- **Backend**: Same backend or test backend
- **Database**: Same or test database
- **Password**: Different test password for security

### 🔧 **Local Development**

Create `.env.local` file in frontend directory:
```bash
# Frontend/.env.local
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
NEXT_PUBLIC_ADMIN_PASSWORD=local_dev_password_123
NEXT_PUBLIC_ENABLE_VISITOR_TRACKING=true
```

### 🚨 **Troubleshooting**

#### **"관리자 패스워드가 설정되지 않았습니다" Error**
1. Check Vercel environment variables are set correctly
2. Ensure variable name is exactly `NEXT_PUBLIC_ADMIN_PASSWORD`
3. Redeploy the application after setting variables
4. Check browser console for any additional errors

#### **Password Not Working**
1. Verify the password matches exactly (no extra spaces)
2. Check if you're using the correct environment (prod vs preview)
3. Try clearing browser cache and cookies
4. Check Vercel deployment logs for any errors

### 📊 **Monitoring & Analytics**

#### **Visitor Analytics Access**
- **URL**: `https://your-domain.vercel.app/admin/visitors`
- **Authentication**: Environment-specific password
- **Features**: Real-time dashboard, custom date ranges, session analysis

#### **Security Monitoring**
- Monitor failed login attempts
- Set up alerts for unusual access patterns
- Regular password rotation (recommended: every 3-6 months)

### 🔄 **Deployment Workflow**

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

---

## 한국어 가이드

### 🔐 관리자 패스워드 설정

보안을 위해 관리자 패스워드는 반드시 Vercel 환경변수로 설정해야 합니다. **운영 환경에서는 절대 하드코딩된 패스워드를 사용하지 마세요.**

### 📋 Vercel 설정 단계

1. **Vercel 대시보드 접속**
   - 프로젝트 선택
   - **Settings** 탭 클릭
   - **Environment Variables** 선택

2. **운영 환경 패스워드 추가**
   - **Key**: `NEXT_PUBLIC_ADMIN_PASSWORD`
   - **Value**: 안전한 운영 패스워드
   - **Environments**: **Production** 선택
   - **Save** 클릭

3. **테스트 환경 패스워드 추가**
   - **Key**: `NEXT_PUBLIC_ADMIN_PASSWORD`
   - **Value**: 테스트용 패스워드 (운영과 다르게 설정)
   - **Environments**: **Preview**, **Development** 선택
   - **Save** 클릭

### 🔒 보안 권장사항

- **최소 12자 이상**의 복잡한 패스워드 사용
- **운영과 테스트 환경에 서로 다른 패스워드** 설정
- **정기적인 패스워드 변경** (3-6개월마다 권장)
- **패스워드 관리 도구** 사용 권장
