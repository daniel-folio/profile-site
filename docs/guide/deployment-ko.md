# 🚀 배포 가이드 (Deployment)

### 🔐 관리자 패스워드 설정

방문자 대시보드 관리자 패스워드는 이제 Strapi Admin의 `Site Settings`에서 관리됩니다. 프론트엔드 환경변수 `NEXT_PUBLIC_ADMIN_PASSWORD`는 더 이상 사용되지 않습니다. **운영 환경에서는 절대 하드코딩된 패스워드를 사용하지 마세요.**

### 📋 Vercel 설정 단계

1. **Vercel 대시보드 접속**
   - 프로젝트 선택
   - **Settings** 탭 클릭
   - **Environment Variables** 선택

2. **Strapi Admin에서 설정**
   - Strapi Admin 접속 → `Content-Type: Site Setting`
   - `adminPassword` 값을 설정/변경 후 저장합니다.
   - 프론트엔드는 이 값을 사용하여 인증합니다.

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
# API 연결 (중앙 선택 로직 사용)
NEXT_PUBLIC_STRAPI_API_URL_PRIMARY=https://your-backend-url.render.com
# 선택: 장애 시 보조 백엔드
NEXT_PUBLIC_STRAPI_API_URL_SECONDARY=https://your-backup-backend.example.com
# 선택: Vercel Preview/Dev 전용 URL
NEXT_PUBLIC_STRAPI_URL=https://your-preview-backend.example.com
# 선택: Vercel에서 Strapi API Token 사용 시
# STRAPI_API_TOKEN=vercel_strapi_api_token
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
NEXT_PUBLIC_STRAPI_API_URL_PRIMARY=http://localhost:1337
```

### 🚨 문제 해결

#### **인증 실패/접속 오류**
1. 백엔드가 정상 동작 중인지 확인 (Render/Railway 상태, CORS)
2. `NEXT_PUBLIC_STRAPI_API_URL_PRIMARY`가 올바른지 확인 (프로덕션 필수)
3. Vercel Preview/Dev에서는 `NEXT_PUBLIC_STRAPI_URL`(선택) → PRIMARY 순으로 사용됩니다
4. Strapi Admin의 `Site Settings > adminPassword`가 의도한 값인지 확인

#### **패스워드가 작동하지 않는 경우**
1. 올바른 백엔드로 요청되는지 확인 (`frontend/src/lib/api.ts`의 `getApiUrl()` 로직 참고)
2. 환경변수 캐시로 인해 값이 반영되지 않을 수 있으니 재배포/새로고침
3. Strapi DB의 `site-setting` 값이 실제로 갱신되었는지 확인
4. 네트워크 탭에서 `/api/site-settings/validatePassword` 응답 확인 (`success: true` 기대)

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
