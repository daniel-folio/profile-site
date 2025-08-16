# Deployment Guide | 배포 가이드

> **📖 이중 언어 안내**: 이 문서는 한국어와 영어로 작성되었습니다. 한국어 버전을 먼저 확인하신 후, 필요시 영어 버전을 참고하세요.  
> **📖 Bilingual Guide**: This document is available in both Korean and English. Please check the Korean version first, then refer to the English version if needed.

---

## 🇰🇷 한국어 버전

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

### 🚀 백엔드 환경변수

#### **Strapi 백엔드 (Render/Railway)**
```bash
# 데이터베이스
DATABASE_URL=postgresql://username:password@host:port/database

# Strapi 설정
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=your_api_token_salt
ADMIN_JWT_SECRET=your_admin_jwt_secret
TRANSFER_TOKEN_SALT=your_transfer_token_salt
JWT_SECRET=your_jwt_secret

# Cloudinary (이미지 저장소)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret

# CORS 설정
CLIENT_URL=https://your-frontend-domain.vercel.app
```

#### **프론트엔드 환경변수**
```bash
# API 연결
NEXT_PUBLIC_STRAPI_API_URL=https://your-backend-url.render.com

# 관리자 접근
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password

# 방문자 분석 (선택사항 - 기본값: 활성화)
# 방문자 추적은 Strapi Admin의 enableVisitorTracking 설정으로 제어됩니다
```

### 🌍 환경별 구성

#### **운영 환경**
- **도메인**: `your-portfolio.vercel.app`
- **백엔드**: `your-backend.render.com`
- **데이터베이스**: 운영용 PostgreSQL
- **패스워드**: 강력하고 고유한 운영 패스워드

#### **미리보기/테스트 환경**
- **도메인**: `your-portfolio-git-branch.vercel.app`
- **백엔드**: 동일한 백엔드 또는 테스트 백엔드
- **데이터베이스**: 동일하거나 테스트 데이터베이스
- **패스워드**: 보안을 위해 운영과 다른 테스트 패스워드

### 🔧 로컬 개발

프론트엔드 디렉토리에 `.env.local` 파일 생성:
```bash
# Frontend/.env.local
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
NEXT_PUBLIC_ADMIN_PASSWORD=local_dev_password_123
NEXT_PUBLIC_ENABLE_VISITOR_TRACKING=true
```

### 🚨 문제 해결

#### **"관리자 패스워드가 설정되지 않았습니다" 오류**
1. Vercel 환경변수가 올바르게 설정되었는지 확인
2. 변수명이 정확히 `NEXT_PUBLIC_ADMIN_PASSWORD`인지 확인
3. 변수 설정 후 애플리케이션 재배포
4. 브라우저 콘솔에서 추가 오류 확인

#### **패스워드가 작동하지 않는 경우**
1. 패스워드가 정확히 일치하는지 확인 (공백 없음)
2. 올바른 환경(운영 vs 미리보기)을 사용하는지 확인
3. 브라우저 캐시 및 쿠키 삭제 시도
4. Vercel 배포 로그에서 오류 확인

### 📊 모니터링 및 분석

#### **방문자 분석 접근**
- **URL**: `https://your-domain.vercel.app/admin/visitors`
- **인증**: 환경별 패스워드
- **기능**: 실시간 대시보드, 사용자 정의 날짜 범위, 세션 분석

#### **보안 모니터링**
- 로그인 실패 시도 모니터링
- 비정상적인 접근 패턴 알림 설정
- 정기적인 패스워드 변경 (3-6개월마다 권장)

### 🔄 배포 워크플로우

1. **개발**
   ```bash
   npm run dev
   # 접근: http://localhost:3000/admin/visitors
   # 패스워드: local_dev_password_123
   ```

2. **미리보기 배포**
   ```bash
   git push origin feature-branch
   # 자동 배포: your-portfolio-git-feature-branch.vercel.app
   # 패스워드: your_test_password_here
   ```

3. **운영 배포**
   ```bash
   git push origin main
   # 자동 배포: your-portfolio.vercel.app
   # 패스워드: your_secure_production_password_here
   ```

---

## 🇺🇸 English Version

### Vercel Environment Variables Setup

#### 🔐 Admin Password Configuration

For security, the admin password must be set via environment variables in Vercel. **Never use hardcoded passwords in production.**

##### 1. **Production Environment**
```bash
# Vercel Dashboard > Project > Settings > Environment Variables
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_production_password_here
```

##### 2. **Preview/Test Environment**
```bash
# Vercel Dashboard > Project > Settings > Environment Variables
NEXT_PUBLIC_ADMIN_PASSWORD=your_test_password_here
```

#### 📋 **Step-by-Step Setup in Vercel**

1. **Access Vercel Dashboard**
   - Navigate to your project
   - Click on **Settings** tab
   - Select **Environment Variables**

2. **Configure Production Password**
   - **Key**: `NEXT_PUBLIC_ADMIN_PASSWORD`
   - **Value**: Your secure production password
   - **Environments**: Select **Production**
   - Click **Save**

3. **Configure Preview/Test Password**
   - **Key**: `NEXT_PUBLIC_ADMIN_PASSWORD`
   - **Value**: Your test password (can be different from production)
   - **Environments**: Select **Preview** and **Development**
   - Click **Save**

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
# API Connection
NEXT_PUBLIC_STRAPI_API_URL=https://your-backend-url.render.com

# Admin Access
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password

# Visitor Analytics (Optional - defaults to enabled)
# Visitor tracking is now controlled via Strapi Admin enableVisitorTracking setting
```

#### 🔒 **Security Best Practices**

##### **Password Requirements**
- **Minimum 12 characters**
- **Include uppercase, lowercase, numbers, and symbols**
- **Different passwords for production vs test environments**
- **Rotate passwords regularly**

##### **Example Strong Passwords**
```bash
# Production (example - generate your own!)
NEXT_PUBLIC_ADMIN_PASSWORD=Pr0d#2025$V1s1t0r@Dash

# Test/Preview (example - generate your own!)
NEXT_PUBLIC_ADMIN_PASSWORD=T3st#2025$V1s1t0r@Dev
```

#### 🌍 **Environment-Specific Configuration**

##### **Production**
- **Domain**: `your-portfolio.vercel.app`
- **Backend**: `your-backend.render.com`
- **Database**: Production PostgreSQL
- **Password**: Strong, unique production password

##### **Preview/Test**
- **Domain**: `your-portfolio-git-branch.vercel.app`
- **Backend**: Same backend or test backend
- **Database**: Same or test database
- **Password**: Different test password for security

#### 🔧 **Local Development**

Create `.env.local` file in frontend directory:
```bash
# Frontend/.env.local
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
NEXT_PUBLIC_ADMIN_PASSWORD=local_dev_password_123
NEXT_PUBLIC_ENABLE_VISITOR_TRACKING=true
```

#### 🚨 **Troubleshooting**

##### **"Admin Password Not Set" Error**
1. Check Vercel environment variables are set correctly
2. Ensure variable name is exactly `NEXT_PUBLIC_ADMIN_PASSWORD`
3. Redeploy the application after setting variables
4. Check browser console for any additional errors

##### **Password Authentication Issues**
1. Verify the password matches exactly (no extra spaces)
2. Check if you're using the correct environment (prod vs preview)
3. Try clearing browser cache and cookies
4. Check Vercel deployment logs for any errors

#### 📊 **Monitoring & Analytics**

##### **Visitor Analytics Access**
- **URL**: `https://your-domain.vercel.app/admin/visitors`
- **Authentication**: Environment-specific password
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
