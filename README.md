# Developer Portfolio Website | 개발자 포트폴리오 웹사이트

> **📖 이중 언어 안내**: 이 문서는 한국어와 영어로 작성되었습니다. 한국어 버전을 먼저 확인하신 후, 필요시 영어 버전을 참고하세요.  
> **📖 Bilingual Guide**: This document is available in both Korean and English. Please check the Korean version first, then refer to the English version if needed.

**🌍 Language Selection | 언어 선택:**
- [🇰🇷 한국어 버전](#korean-version) (현재 위치)
- [🇺🇸 English Version](#english-version) (Jump to English)

---

<a name="korean-version"></a>
## 🇰🇷 한국어 버전</a>

개인의 이력서, 포트폴리오, 경력기술서를 체계적으로 관리하고 전시할 수 있는 개인 웹사이트입니다. **Next.js 15**, **Strapi CMS**, 그리고 **커스텀 방문자 분석 시스템**을 활용한 모던 웹 개발 사례를 보여줍니다.

### 🎯 핵심 기능

#### 📊 **고급 방문자 분석 시스템 (Admin전용 Visitors 페이지)**
- **탭 구성**: 개요, 세션 분석, 페이지 분석, 실시간, 지도 탭 제공. 모든 탭 상단에 세그먼트 탭(전체/일반/OWNER) 공통 노출.
- **기간 선택**: 1일/7일/30일 빠른 선택 및 사용자 정의 범위. 선택한 기간을 상단 배너에 `YYYY-MM-DD ~ YYYY-MM-DD (N일)` 형식으로 표시.
- **세그먼트 분리**: 오너 방문과 일반 방문을 __Owner IP 허용목록(ownerIpAllowlist)__ 기준으로 완전 분리. 백엔드/프론트 모두 동일 기준을 사용합니다.
- **오너 IP 허용목록**: Strapi Site Settings에서 오너 IP(또는 CIDR)들을 등록. 최대 5개까지 ‘OWNER’ 태깅 우선, 초과 항목도 관리 가능.
- **실시간/세션/페이지 분석**: 방문자 타임라인, 페이지뷰 집계, 브라우저/OS/디바이스 통계 제공. 빈 데이터 시 가독성 있는 대체 UI 제공.
- **지도 시각화**: OpenStreetMap 기반 `pigeon-maps` 사용(React 19 호환). 위치 정보가 있는 방문만 지도 탭에서 표시.
- **IP/프록시 처리**: `X-Forwarded-For` 등 헤더 기반으로 실제 클라이언트 IP 추출. 프록시 환경에서도 127.0.0.1 문제 완화.
- **엔드포인트 접근**: 방문자 수집/통계 API는 공개(`auth: false`)로 설정하여 로컬/프로덕션 모두 403 방지.
- **안정성/장애조치**: 프론트 `frontend/src/lib/api.ts`에서 URL 유효성 검사, 타임아웃, 선택적 재시도, 프로덕션 fail-fast를 적용.
- **운영 팁**:
  - 트래킹 중지: Site Settings의 `enableVisitorTracking=false`로 즉시 중단.
  - 점검 모드: `siteUsed=false`로 전체 접근 차단(관리자 포함) — 사용 시 주의.
  - 관리자 인증: `/admin/visitors` 진입 시 Site Settings의 `adminPassword` 사용(평문 저장 UI 한계로 강력한 비밀번호 권장).
  - 데이터 품질: 모바일 누락/프록시 환경 이슈는 IP/헤더 설정을 우선 점검.
  - 지도 성능: 무료 타일/네트워크 상황에 따라 초기 로딩이 지연될 수 있음.
  - 오너 자동 등록: 방문 URL에 특정 조건을 붙이면 현재 IP가 `ownerIpAllowlist`에 자동 추가되고, 해당 방문은 오너 방문으로 기록됩니다. 남용 위험이 있어 공개 링크로 노출하지 마세요.
    - 자동 메모 포맷: `countryCode/city, isp/asn, timezone, deviceType | YYYY-MM-DD HH:mm KST` (민감 파라미터는 기록하지 않음)

#### 📄 **동적 콘텐츠 관리**
- **PDF 생성** - html2pdf.js를 사용한 이력서 및 경력 상세 정보
- **리치 텍스트 렌더링** - 마크다운 및 HTML 지원
- **이미지 최적화** - Cloudinary 통합
- **SEO 최적화** - 메타 태그 및 Open Graph 구성
- **콘텐츠 버전 관리** - Strapi의 헤드리스 CMS 아키텍처

#### 🎨 **모던 UI/UX 디자인**
- **다크/라이트 모드** - 시스템 환경설정 감지
- **반응형 디자인** - 모바일, 태블릿, 데스크톱 최적화
- **부드러운 애니메이션** - Framer Motion 기반
- **인터랙티브 배경** - Three.js 및 Vanta 효과
- **타이핑 애니메이션** - 동적 텍스트 표현
- **접근성** - WCAG 가이드라인 준수

#### ⚡ **성능 및 보안**
- **Next.js App Router** - 서버 사이드 렌더링 및 정적 생성
- **이미지 최적화** - Next.js Image 컴포넌트 및 지연 로딩
- **캐싱 전략** - 최적의 로딩 성능
- **XSS 보호** - DOMPurify 살균 처리
- **보안 API 엔드포인트** - 적절한 인증 및 검증
- **코드 분할** - 최소 번들 크기

### 🛠️ 기술 아키텍처

#### **프론트엔드 스택**
- **프레임워크**: Next.js 15 (App Router 아키텍처)
- **언어**: TypeScript (타입 안전성 및 개발자 경험)
- **스타일링**: Tailwind CSS (커스텀 디자인 시스템)
- **애니메이션**: Framer Motion (부드러운 전환)
- **3D 그래픽**: Three.js와 Vanta.js (인터랙티브 배경)
- **상태 관리**: React hooks (커스텀 컨텍스트 프로바이더)
- **코드 품질**: ESLint, Prettier, Husky (일관된 코드 표준)

#### **백엔드 스택**
- **CMS**: Strapi 5.16 (커스텀 컨트롤러가 있는 헤드리스 CMS)
- **데이터베이스**: PostgreSQL (운영) / SQLite (개발)
- **이미지 저장소**: Cloudinary (자동 최적화)
- **API**: RESTful 엔드포인트 (커스텀 방문자 분석 API)
- **인증**: JWT 기반 관리자 인증
- **배포**: Render (자동화된 CI/CD 파이프라인)

#### **분석 및 모니터링**
- **커스텀 분석**: 내장 방문자 추적 시스템
- **실시간 데이터**: 실시간 방문자 모니터링 및 세션 분석
- **성능 지표**: Core Web Vitals 추적
- **오류 모니터링**: 포괄적인 오류 로깅 및 보고

### 🌟 **프로젝트 하이라이트**

이 포트폴리오는 다음을 보여줍니다:
- **풀스택 개발** - 모던 JavaScript 생태계 전문성
- **시스템 아키텍처** - 확장 가능하고 유지보수 가능한 코드 구조
- **UI/UX 디자인** - 사용자 경험에 대한 세심한 배려
- **성능 최적화** - 실제 구현을 통한 지식
- **보안 모범 사례** - 적절한 데이터 처리 및 보호
- **문서화 기술** - 포괄적인 기술 문서

### 🚀 **라이브 데모 및 배포**
- **프론트엔드**: Vercel에서 자동 배포
- **백엔드**: PostgreSQL 데이터베이스가 있는 Render에서 호스팅
- **CDN**: 최적화된 이미지 전송을 위한 Cloudinary

### 📁 **프로젝트 구조**

```
portfolio/
├── frontend/                    # Next.js 프론트엔드 애플리케이션
│   ├── src/
│   │   ├── app/                # Next.js App Router 페이지
│   │   │   ├── career-detail/  # 경력기술서 페이지
│   │   │   ├── portfolio/      # 프로젝트 상세 페이지
│   │   │   ├── resume/         # 이력서 페이지
│   │   │   └── admin/          # 관리자 대시보드
│   │   │       └── visitors/   # 방문자 분석 대시보드
│   │   ├── components/         # React 컴포넌트
│   │   │   ├── layout/         # 레이아웃 컴포넌트
│   │   │   ├── sections/       # 페이지 섹션 컴포넌트
│   │   │   ├── ui/             # 재사용 가능한 UI 컴포넌트
│   │   │   └── admin/          # 관리자 전용 컴포넌트
│   │   ├── lib/                # 유틸리티 함수 및 API
│   │   │   ├── api.ts          # API 클라이언트
│   │   │   ├── visitor.ts      # 방문자 추적 로직
│   │   │   └── siteSettings.ts # 사이트 설정 관리
│   │   ├── hooks/              # 커스텀 React 훅
│   │   └── types/              # TypeScript 타입 정의
│   ├── public/                 # 정적 자산
│   └── package.json
├── backend/                    # Strapi 백엔드 CMS
│   ├── src/
│   │   └── api/               # 콘텐츠 타입 및 API
│   │       ├── profile/       # 사용자 프로필 데이터
│   │       ├── skill/         # 기술 스택
│   │       ├── project/       # 포트폴리오 프로젝트
│   │       ├── company/       # 업무 경험
│   │       ├── education/     # 학력 배경
│   │       ├── career-detail/ # 상세 경력 정보
│   │       ├── visitor/       # 방문자 분석 데이터
│   │       └── site-setting/  # 글로벌 사이트 구성
│   ├── config/                # Strapi 구성
│   └── package.json
├── DEPLOYMENT.md              # 배포 가이드
├── VISITOR_TRACKING.md        # 분석 문서
└── README.md                  # 이 파일
```

### 🎯 **구현된 기능 및 역량**

#### **✅ 핵심 페이지 및 네비게이션**
- **홈페이지** (`/`) - 프로필 쇼케이스, 기술 스택 표시, 프로젝트 포트폴리오
- **이력서 페이지** (`/resume`) - PDF 다운로드 기능이 있는 종합 이력서
- **경력 상세** (`/career-detail`) - PDF 내보내기가 있는 상세 경력 정보
- **프로젝트 상세** (`/portfolio/[slug]`) - 개별 프로젝트 케이스 스터디 및 기술적 세부사항
- **관리자 대시보드** (`/admin/visitors`) - 종합적인 방문자 분석 및 사이트 관리

#### **✅ 고급 UI/UX 기능**
- **적응형 테마 시스템** - 시스템 환경설정 감지 및 수동 토글이 있는 완전한 다크/라이트 모드
- **반응형 디자인** - 모바일 우선 접근 방식으로 태블릿 및 데스크톱에 완벽 최적화
- **부드러운 애니메이션** - Framer Motion 기반 마이크로 인터랙션 및 페이지 전환
- **인터랙티브 배경** - Three.js 및 Vanta.js 기반 동적 시각 효과
- **타이포그래피 애니메이션** - 동적 타이핑 효과 및 텍스트 공개 애니메이션
- **접근성 준수** - 스크린 리더 지원이 있는 WCAG 2.1 AA 표준

#### **✅ 콘텐츠 관리 시스템**
- **Strapi 관리자 패널** - 커스텀 컨트롤러 및 미들웨어가 있는 완전한 헤드리스 CMS
- **이미지 관리** - 자동 최적화 및 변환이 있는 Cloudinary 통합
- **리치 콘텐츠 지원** - 구문 강조가 있는 마크다운, HTML 렌더링
- **SEO 최적화** - 메타 태그, Open Graph, Twitter 카드, 구조화된 데이터
- **API 생성** - 커스텀 분석 확장이 있는 자동 REST API 엔드포인트
- **콘텐츠 버전 관리** - 내장 콘텐츠 히스토리 및 수정 관리

#### **✅ 성능 및 보안**
- **PDF 생성** - 이력서 및 경력 문서를 위한 클라이언트 사이드 PDF 생성
- **코드 하이라이팅** - highlight.js를 사용한 기술 콘텐츠 구문 강조
- **XSS 보호** - 모든 사용자 생성 콘텐츠에 대한 DOMPurify 살균
- **성능 최적화** - Next.js 이미지 최적화, 캐싱 전략, 코드 분할
- **방문자 분석** - 종합적인 대시보드가 있는 실시간 방문자 추적 ([문서](./VISITOR_TRACKING.md))
- **보안 헤더** - CORS, CSP 및 기타 보안 모범 사례 구현

## 🎛️ Site Settings (사이트 설정)

> **📖 이중 언어 안내**: 이 섹션은 한국어와 영어로 작성되었습니다. 한국어 버전을 먼저 확인하신 후, 필요시 영어 버전을 참고하세요.  
> **📖 Bilingual Guide**: This section is available in both Korean and English. Please check the Korean version first, then refer to the English version if needed.


### 개요
사이트 설정 시스템은 Strapi Admin Panel을 통해 중앙 집중식 구성 관리를 제공합니다. 모든 설정은 코드 변경이나 서버 재시작 없이 동적으로 적용됩니다.

### 사용 가능한 설정

#### **🔐 adminPassword (관리자 패스워드)**
- **설명**: 방문자 분석 대시보드 관리자 인증 패스워드
- **타입**: String (평문, 6-50자)
- **기본값**: 초기 설정 시 지정
- **용도**: `/admin/visitors` 페이지 접근 시 인증에 사용
- **보안**: Strapi Admin에서 평문으로 확인 가능 (UI 제한으로 인함)

#### **📊 enableVisitorTracking (방문자 추적 활성화)**
- **설명**: 방문자 데이터 수집 및 분석 활성화/비활성화
- **타입**: Boolean
- **기본값**: `true` (활성화)
- **효과**: `false`로 설정 시 모든 방문자 추적 및 데이터 수집 중단
- **적용**: 실시간으로 적용되어 즉시 추적 중단/재개

#### **🏷️ siteName (사이트 이름)**
- **설명**: 브라우저 탭과 메타 태그에 표시되는 사이트 제목
- **타입**: String (최대 100자)
- **기본값**: "Developer Portfolio"
- **용도**: SEO, 브라우저 탭 제목, 소셜 미디어 공유 시 표시

#### **📝 siteDescription (사이트 설명)**
- **설명**: 검색 엔진용 SEO 메타 설명
- **타입**: Text (최대 500자)
- **기본값**: "Personal portfolio website"
- **용도**: Google 검색 결과, 소셜 미디어 공유 시 설명 텍스트

#### **🌐 siteUsed (사이트 사용 여부)**
- **설명**: 사이트 접근 제어 (`true` = 접근 허용, `false` = 접근 차단)
- **타입**: Boolean
- **기본값**: `true` (접근 허용)
- **효과**: `false`로 설정 시 모든 방문자에게 유지보수 화면 표시
- **용도**: 사이트 점검, 업데이트 시 임시 차단

#### **👥 maxVisitorsPerDay (일일 최대 방문자 수)**
- **설명**: 트래픽 제어를 위한 일일 방문자 수 제한
- **타입**: Integer (100 - 1,000,000)
- **기본값**: 10,000
- **용도**: 서버 부하 관리, 트래픽 모니터링

### 설정 방법

1. **Strapi Admin 접속**
   ```
   http://localhost:1337/admin
   ```

2. **설정으로 이동**
   - **Content Manager** → **Site Settings**로 이동

3. **값 업데이트**
   - 원하는 설정 값을 수정
   - **Save**를 클릭하여 변경사항 적용

4. **즉시 적용**
   - 서버 재시작 없이 즉시 적용
   - 다음 페이지 로드 시 프론트엔드에 반영

### 주의사항
- **adminPassword**: 평문으로 저장되므로 Strapi Admin 접근 권한 관리 중요
- **siteUsed**: `false` 설정 시 관리자도 접근 불가하므로 주의
- **enableVisitorTracking**: 개인정보 보호 정책에 따라 설정

### 🔄 향후 확장 계획
- 🔄 블로그 시스템 (데이터 모델 준비됨)
- 🔄 다국어 지원 (i18n)
- 🔄 검색 기능
- 🔄 댓글 시스템
- 🔄 분석 도구 연동

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone <repository-url>
cd portfolio
```

### 2. 백엔드 설정

```bash
cd backend
npm install
npm run develop
```

브라우저에서 [http://localhost:1337/admin](http://localhost:1337/admin)을 열어 관리자 계정을 생성하세요.

### 3. 프론트엔드 설정

```bash
cd frontend
npm install
```

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 백엔드 API 연결 (중앙 선택 로직)
NEXT_PUBLIC_STRAPI_API_URL_PRIMARY=http://localhost:1337
```

### 🔐 **프로덕션 환경 변수 (Vercel)**

**⚠️ 중요**: 프로덕션 배포 시 Vercel 대시보드에 환경 변수를 반드시 설정해야 합니다.

#### **필수 변수 (프론트엔드)**
```env
# Primary backend URL (required in production)
NEXT_PUBLIC_STRAPI_API_URL_PRIMARY=https://your-backend-url.render.com

# Optional: Vercel Preview/Dev specific URL
NEXT_PUBLIC_STRAPI_URL=https://your-preview-backend.example.com

# Optional: API token when calling Strapi from Vercel
# STRAPI_API_TOKEN=vercel_strapi_api_token
```

#### **보안 설정**
1. **Vercel 대시보드** → **프로젝트** → **Settings** → **Environment Variables**
2. **관리자 비밀번호**: Strapi Admin의 `Site Settings`에서 설정/관리
3. **미리보기/테스트**: 환경에 맞는 백엔드 URL 사용
4. **비밀값 하드코딩 금지**

📖 **[배포 가이드 자세히 보기](./DEPLOYMENT.md)** - Vercel/Render 설정 및 환경 변수 안내

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 🌐 배포 아키텍처

본 프로젝트는 안정성과 고가용성을 위해 메인(A)과 개발/백업(B)으로 구성된 이중화 구조를 가집니다.
이 구조는 무료 호스팅 플랜(Render 등)의 제약 조건(월 750시간, 15분 비활성 시 슬립 모드)을 극복하기 위해 설계되었습니다.

- **A 사이트 (메인):** 실제 사용자가 접속하는 메인 사이트입니다. (GitHub A 계정, Vercel A 계정, Render A 계정)
  - 운영 환경(`Production`)만 단독으로 운영하여 월 사용 시간을 720시간(24시간 x 30일) 내로 유지합니다.
  - UptimeRobot과 같은 모니터링 툴로 14분마다 서버를 호출하여 15분 슬립 모드를 방지하고 24/7 가용성을 확보합니다.

- **B 사이트 (개발 및 백업):** 개발 및 메인 사이트(A) 장애 시를 대비한 백업 사이트입니다. (GitHub B 계정, Vercel B 계정, Render B 계정)
  - 개발 환경(`Preview/dev`)과 운영 환경(`Production`)을 함께 운영합니다.
  - 메인(A) 사이트의 백업 역할을 수행하며, 개발 및 테스트 용도로 주로 사용됩니다.

### Frontend (Vercel)
- **A-프론트엔드 (메인):** `Production` 환경만 운영합니다.
- **B-프론트엔드 (개발/백업):** `Production`과 `Preview(dev)` 환경을 운영합니다.

### Backend (Render)
- **A-백엔드 (메인):** `Production` 환경만 운영합니다.
- **B-백엔드 (개발/백업):** `Production`과 `Preview(dev)` 환경을 운영합니다.

### 🧩 인프라 개요 (요약)

- **Frontend**: Vercel (Next.js 자동 배포)
- **Backend**: Render (Strapi CMS)
- **Database**: Neon (PostgreSQL, 서버리스)
- **Image CDN/Storage**: Cloudinary
- **Auto-Heal Trigger**: GitHub Actions (Puppeteer를 이용한 강제 기상)
- **Wake-up Trigger(옵션)**: cron-job.org (주기적 호출로 서버 기상)
- **Wake-up Monitoring(옵션)**: UptimeRobot (14분 주기 헬스 체크)

Neon 사용 시 `DATABASE_URL`은 Render 환경 변수에 설정합니다. 예시: `postgres://<user>:<password>@<neon-host>/<db>?sslmode=require`.

### 💓 헬스 체크 / 웨이크업 설정

Render 무료 플랜의 서버 다운 및 휴면 상태에 대응하기 위해, GitHub Actions와 전용 헬스 체크 엔드포인트를 사용합니다.


- **헬스 전용 엔드포인트**: `GET | HEAD /<health-check-endpoint>`
  - 예: `https://<render-app>.onrender.com/<health-check-endpoint>`
  - GET: `200` + `{ ok: true }`
  - HEAD: `200` (본문 없음)
- **GitHub Actions 설정**
  - 역할: 서버 다운 및 휴면 시 Puppeteer(헤드리스 브라우저)를 이용해 강제로 서버를 재시작시키는 핵심 트리거입니다.
  - 저장소: server-wakeup-bot
  - Method: GET /git-wakeupbot
  - Schedule: 15분 간격
  - 용도: 강제 기상(프리 플랜 환경에서 안정적인 기상 보장)
- **cron-job.org 설정**
  - Method: GET /cron-job
  - Schedule: 10~14분 간격
  - 용도: 보조 웨이크업(프리 플랜 환경에서 안정적인 기상 보장)
- **UptimeRobot 설정(선택)**
  - Monitor Type: HTTP(s)
  - Method: HEAD /uptimerobot
  - URL: 위 헬스 엔드포인트
  - Interval: 14분 (Render Free의 15분 슬립 방지)

## 🔄 고가용성 및 배포 자동화

### 1. Git 저장소 자동 동기화 (B → A)

개발 효율성과 배포 안정성을 위해 개발용 메인 저장소(B)와 배포 전용 저장소(A)를 분리하여 운영합니다.

- **작동 방식:** B 저장소의 `main` 브랜치에 코드가 푸시되면, GitHub Actions가 SSH 배포 키(Deploy Key)를 사용하여 A 저장소로 모든 내용을 자동으로 미러링합니다.
- **장점:** 개발자는 B 저장소에만 집중할 수 있으며, 배포는 A 저장소를 통해 이루어지므로 메인 저장소의 권한 노출 위험이 없습니다.

### 2. 서버사이드 Failover (장애 조치)

메인 백엔드 서버(A-운영)가 예기치 않은 문제로 중단될 경우를 대비하여, 서비스 연속성을 보장하는 서버사이드 Failover 기능이 구현되어 있습니다.

- **작동 방식:**
  1. 메인 프론트엔드(A-운영)는 데이터를 요청할 때 먼저 메인 백엔드(A-운영)에 접속을 시도합니다.
  2. 만약 이 요청이 실패하면, `lib/api.ts`에 구현된 로직이 자동으로 백업 백엔드(B-운영)에 동일한 요청을 다시 보냅니다.
- **적용 범위:** 이 기능은 Vercel 환경 변수(`FAILOVER_MODE_ENABLED`)에 의해 제어되며, 오직 **A-운영 환경(메인)에서만 활성화**됩니다. 개발, 로컬, 백업(B) 환경에는 영향을 주지 않습니다.

## 🔧 환경 변수 가이드

### Vercel (A-프론트엔드 - 메인)

- `NEXT_PUBLIC_STRAPI_API_URL_PRIMARY`: 메인으로 사용할 백엔드 주소
  - Production 값: A-운영 백엔드 URL
- `FAILOVER_MODE_ENABLED`: Failover 기능 활성화 스위치
  - Production 값: `true`
- `(선택) NEXT_PUBLIC_STRAPI_API_URL_SECONDARY`: 장애 시 사용할 백업 백엔드 주소
  - 사용 조건: `FAILOVER_MODE_ENABLED='true'` 이고, PRIMARY 요청이 실패할 때만 자동 대체 요청에 사용됨
  - 권장 값(Production): B-운영 백엔드 URL
- `STRAPI_API_TOKEN`: 각 환경에 맞는 API 토큰
  - Production 값: A-운영 백엔드 토큰

### Vercel (B-프론트엔드 - 개발/백업)

- `NEXT_PUBLIC_STRAPI_API_URL_PRIMARY`: 메인으로 사용할 백엔드 주소
  - Production 값: B-운영 백엔드 URL (백업 역할)
  - Preview(dev) 값: B-개발 백엔드 URL
- `NEXT_PUBLIC_STRAPI_API_URL_SECONDARY`: (설정 안함)
- `FAILOVER_MODE_ENABLED`: (설정 안함 또는 `false`)
- `STRAPI_API_TOKEN`:
  - Production 값: B-운영 백엔드 토큰
  - Preview(dev) 값: B-개발 백엔드 토큰

### Render (A-백엔드 - 메인)
- `DATABASE_URL`, `JWT_SECRET`, `ADMIN_JWT_SECRET`, `CLOUDINARY_URL` 등 운영 환경에 맞게 설정합니다.

### Render (B-백엔드 - 개발/백업)
- `DATABASE_URL`, `JWT_SECRET`, `ADMIN_JWT_SECRET`, `CLOUDINARY_URL` 등을 각 환경(운영/개발)에 맞게 설정합니다.

## 📊 데이터 모델

### Profile (프로필)
- 이름, 직책, 이메일, 전화번호, 위치
- 자기소개 (Rich Text)
- 프로필 이미지, 소셜 링크, 이력서 파일
- 헤드라인, 메인 바이오

### Skill (기술)
- 기술명, 카테고리, 숙련도 (1-5)
- 아이콘, 설명, 정렬 순서, 노출 여부

### Project (프로젝트)
- 제목, 슬러그, 설명 (간단/상세)
- 썸네일, 이미지들, 사용 기술
- 프로젝트 타입, 상태, 기간
- GitHub/라이브 URL, 메인 페이지 노출 여부
- 회사 연동
- 대표 프로젝트 정렬 순서

### Company (회사)
- 회사명, 로고, 설명
- 위치, 웹사이트, 산업 분야

### Education (학력)
- 학교명, 전공, 학위
- 기간, GPA, 설명

### CareerDetail (경력 상세)
- 프로젝트별 상세 경력 정보
- 기술 스택, 역할, 성과

### OtherExperience (기타 경험)
- 기타 활동, 수상, 자격증 등

### BlogPost/BlogCategory (블로그)
- 블로그 포스트 및 카테고리 (백엔드만 준비됨 & 오픈되지 않음)

### socialLinks 입력 안내

**socialLinks 필드는 다양한 소셜 미디어 링크를 JSON 형식으로 입력할 수 있습니다.**

#### 지원하는 소셜 미디어 키 목록
- github: GitHub
- x: X(Twitter)
- linkedin: LinkedIn
- instagram: Instagram
- facebook: Facebook
- youtube: YouTube
- blog: Blogger/개인 블로그
- velog: Velog
- tistory: Tistory
- notion: Notion
- medium: Medium
- website: 개인 웹사이트

#### 입력 예시
```json
{
  "github": "https://github.com/yourid",
  "x": "https://x.com/yourid",
  "linkedin": "https://www.linkedin.com/in/yourid",
  "instagram": "https://instagram.com/yourid",
  "facebook": "https://facebook.com/yourid",
  "youtube": "https://youtube.com/@yourid",
  "blog": "https://yourblog.com",
  "velog": "https://velog.io/@yourid",
  "tistory": "https://yourid.tistory.com",
  "notion": "https://notion.so/yourid",
  "medium": "https://medium.com/@yourid",
  "website": "https://yourwebsite.com"
}
```

- 원하는 소셜만 입력해도 되고, 모두 입력해도 됩니다.
- 각 키에 해당하는 URL만 입력하면 아이콘이 자동으로 표시됩니다.
- 이메일은 별도 필드로 입력하면 이메일 아이콘이 함께 표시됩니다.
- Strapi Admin에서는 JSON 타입 필드에 Description(설명) 안내문구를 직접 넣을 수 없으니, 이 README를 참고해 입력해 주세요.

### Profile 노출여부 관련 필드 안내

Profile(프로필)에는 아래와 같이 어드민에서 각종 정보의 노출 여부를 제어할 수 있는 Boolean 필드가 있습니다.

- showProfileImage: 프로필 이미지를 화면에 노출할지 여부 (true/false)
- showPhone: 전화번호를 화면에 노출할지 여부 (true/false)
- resumeDownloadEnabled: 이력서 PDF 다운로드 버튼 노출 여부 (true/false)
- careerDetailDownloadEnabled: 경력기술서 PDF 다운로드 버튼 노출 여부 (true/false)

이 필드들은 Strapi Admin에서 체크박스(스위치)로 설정할 수 있으며,
각 값에 따라 실제 사이트에서 해당 정보가 노출/비노출됩니다.

### 데이터 노출여부 및 관리 팁 안내

#### Skill(기술)
- isPublic: **홈 화면(메인)과 이력서에서** 해당 기술을 노출할지 여부 (true/false)
  - false로 설정하면 홈 화면(메인), 이력서나 이력서 PDF 등에는 포함될 수 없습니다.
- visible: **홈 화면(메인)에서** 해당 기술을 노출할지 여부 (true/false)
  - false로 설정해도 이력서나 이력서 PDF 등에는 포함될 수 있습니다.
- order: 기술의 정렬 순서(숫자가 작을수록 먼저 노출)

#### Project(프로젝트)
- visible: **이력서에서** 해당 프로젝트를 노출할지 여부 (true/false)
  - false로 설정해도 프로젝트 상세 페이지 등에는 접근이 가능할 수 있습니다.
- featured: **홈 화면(메인)에서** 프로젝트로 노출할지 여부 (true/false)
- order: **이력서 내에서** 프로젝트의 정렬 순서
- featuredOrder: **홈 화면(메인)에서** 대표 프로젝트의 정렬 순서

#### Company(회사)
- order: 회사의 정렬 순서

#### CareerDetail(경력 상세)
- order: 경력 상세의 정렬 순서
- project: 연결된 프로젝트가 있을 경우, 프로젝트 상세에서 함께 노출

#### Education(학력)
- order: 학력의 정렬 순서

#### 공통 안내
- 모든 `order` 및 `featuredOrder` 필드는 숫자가 작을수록 먼저 노출(오름차순)됩니다.
- visible, show~ 등 Boolean 필드는 false로 설정 시 프론트엔드에서 해당 항목이 숨겨집니다.
- 관리자는 각 항목의 노출여부와 순서를 주기적으로 점검해 주세요.

## 🌐 배포

### Frontend (Vercel)
1. GitHub 저장소를 Vercel에 연결
2. 환경 변수 설정:
   - `NEXT_PUBLIC_STRAPI_URL`: Strapi 백엔드 URL
   - `NEXT_PUBLIC_SITE_URL`: 프론트엔드 URL

### Backend (Render)
1. GitHub 저장소를 Render에 연결
2. 환경 변수 설정:
   - `DATABASE_URL`: PostgreSQL 연결 문자열
   - `JWT_SECRET`: JWT 시크릿 키
   - `ADMIN_JWT_SECRET`: 관리자 JWT 시크릿 키
   - `CLOUDINARY_URL`: Cloudinary 설정

## 🔧 개발 가이드

### 새 기능 추가
1. 백엔드: Strapi Admin Panel에서 Content Type 생성
2. 프론트엔드: TypeScript 타입 정의 및 컴포넌트 생성
3. API 연동: `src/lib/api.ts`에 함수 추가

### 스타일링
- Tailwind CSS 사용
- 컴포넌트별 스타일링
- 반응형 디자인 고려
- 다크 모드 지원

### 성능 최적화
- Next.js Image 컴포넌트 사용
- 정적 생성 (SSG) 활용
- API 응답 캐싱
- 코드 스플리팅

### 애니메이션 추가
- Framer Motion 사용
- Three.js/Vanta 배경 효과
- CSS 애니메이션

## 📝 라이센스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 연락처

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.
daniel.han.developer@gmail.com
---

*이 프로젝트는 완전한 포트폴리오 시스템으로 구현되었으며, 지속적인 개선과 확장을 통해 더욱 발전시킬 예정입니다.*

### 무료 서버 환경 안내 및 사용자 알림 팁

본 프로젝트는 무료 서버(Vercel, Render 등) 환경에서 운영될 수 있습니다. 이 경우, 서버 슬립/웨이크업 등으로 인해 **첫 접속 시 반응속도가 느릴 수 있습니다.**

#### 사용자에게 안내하는 방법 예시

- **로딩 스피너/로더 + 안내 메시지**
  - 예시: `서버를 깨우는 중입니다. 무료 서버 환경으로 인해 첫 접속 시 최대 1분 정도 소요될 수 있습니다. 잠시만 기다려 주세요!`
- **상단/하단 배너 안내**
  - 예시: `⚡️ 안내: 본 사이트는 무료 서버 환경에서 운영되어 첫 접속 시 로딩이 느릴 수 있습니다.`
- **FAQ/소개 페이지 안내**
  - 예시: `무료 서버 환경으로 인해 첫 접속 시 최대 1분 정도 소요될 수 있습니다.`

**Tip:**
- 로딩 컴포넌트, 레이아웃(Header/Footer), FAQ/소개 등 다양한 위치에 안내 메시지를 추가하면 사용자 경험이 향상됩니다.
- 실제 운영 시, 안내 메시지를 통해 사용자의 혼란과 이탈을 줄일 수 있습니다.

---

<a name="english-version"></a>
## 🇺🇸 English Version

### Overview
The site settings system provides centralized configuration management through Strapi Admin Panel. All settings are dynamically applied without requiring code changes or server restarts, enabling real-time site management.

### Available Settings

#### **🔐 adminPassword (Administrator Password)**
- **Description**: Admin authentication password for visitor analytics dashboard access
- **Type**: String (Plain text, 6-50 characters)
- **Default**: Set during initial setup
- **Usage**: Authentication for `/admin/visitors` page access
- **Security**: Visible as plain text in Strapi Admin (due to UI limitations)
- **Best Practice**: Use strong passwords and restrict Strapi Admin access

#### **📊 enableVisitorTracking (Visitor Tracking Toggle)**
- **Description**: Enable or disable visitor data collection and analytics system
- **Type**: Boolean
- **Default**: `true` (enabled)
- **Effect**: When set to `false`, immediately stops all visitor tracking and data collection
- **Application**: Applied in real-time without server restart
- **Privacy**: Respects user privacy preferences and GDPR compliance

#### **🏷️ siteName (Site Title)**
- **Description**: Site title displayed in browser tabs, meta tags, and social media shares
- **Type**: String (maximum 100 characters)
- **Default**: "Developer Portfolio"
- **Usage**: SEO optimization, browser tab titles, social media previews
- **Impact**: Affects search engine rankings and user experience

#### **📝 siteDescription (Site Meta Description)**
- **Description**: SEO meta description for search engines and social media
- **Type**: Text (maximum 500 characters)
- **Default**: "Personal portfolio website"
- **Usage**: Google search results, social media share descriptions
- **SEO**: Critical for search engine optimization and click-through rates

#### **🌐 siteUsed (Site Accessibility Control)**
- **Description**: Master switch for site accessibility (`true` = accessible, `false` = blocked)
- **Type**: Boolean
- **Default**: `true` (accessible)
- **Effect**: When `false`, displays maintenance screen to all visitors
- **Use Cases**: Site maintenance, updates, emergency blocking
- **Warning**: Blocks admin access as well when disabled

#### **👥 maxVisitorsPerDay (Daily Visitor Limit)**
- **Description**: Daily visitor limit for traffic control and server load management
- **Type**: Integer (range: 100 - 1,000,000)
- **Default**: 10,000
- **Purpose**: Server load management, traffic monitoring, resource optimization
- **Implementation**: Used for analytics and potential rate limiting

### Configuration Guide

1. **Access Strapi Admin Panel**
   ```
   http://localhost:1337/admin
   ```

2. **Navigate to Settings**
   - Go to **Content Manager** → **Site Settings**
   - Select the single Site Settings entry

3. **Update Configuration Values**
   - Modify any setting values as needed
   - Use the built-in validation for data types
   - Click **Save** to apply changes immediately

4. **Real-time Application**
   - Changes are applied immediately without server restart
   - Frontend reflects new settings on next page load or API call
   - No deployment required for configuration changes

### Advanced Configuration

#### **Environment-Specific Settings**
- **Development**: Use test values for safe development
- **Production**: Implement strong security measures
- **Staging**: Mirror production settings for accurate testing

#### **Security Considerations**
- **Password Management**: Use password managers for strong passwords
- **Access Control**: Limit Strapi Admin access to authorized personnel
- **Regular Updates**: Change passwords periodically (every 3-6 months)
- **Monitoring**: Track failed login attempts and unusual access patterns

#### **Performance Optimization**
- **Visitor Tracking**: Monitor impact on server performance
- **Cache Management**: Settings are cached for optimal performance
- **Database Optimization**: Regular cleanup of old visitor data recommended

A **comprehensive full-stack developer portfolio website** showcasing advanced web development practices with **Next.js 15**, **Strapi CMS**, and a **custom-built visitor analytics system**. This project demonstrates enterprise-level architecture, performance optimization, user experience design, and modern development workflows.

### 🎯 **Core Features & Capabilities**

#### 📊 **Enterprise-Grade Visitor Analytics (Only Admin Visitors Page)**
- **Tabs**: Overview, Sessions, Pages, Realtime, Map. Segment tabs (All/General/Owner) are shown on top of every main tab consistently.
- **Period Selection**: Quick buttons (1d/7d/30d) and custom range. Selected period banner shows `YYYY-MM-DD ~ YYYY-MM-DD (N days)`.
- **Segment Separation**: Owner vs General visits are strictly separated by the __Owner IP allowlist (ownerIpAllowlist)__. Both backend and frontend rely on the same rule.
- **Owner IP Allowlist**: Manage owner IPs (and CIDR) in Strapi Site Settings. Up to 5 are prioritized for owner tagging; additional entries are still accepted for management.
- **Realtime/Sessions/Pages Analytics**: Visitor timelines, pageview aggregation, and browser/OS/device stats. Clear empty states when no data.
- **Map Visualization**: OpenStreetMap with `pigeon-maps` (React 19 compatible). Only visits with geo info are rendered in the Map tab.
- **IP/Proxy Handling**: Real client IP extracted from headers (e.g., X-Forwarded-For) to mitigate 127.0.0.1 in proxy setups.
- **Endpoint Access**: Visitor collection and stats endpoints are public (auth: false) to prevent 403 in local/production.
- **Resilience/Failover**: Frontend `frontend/src/lib/api.ts` validates URLs, applies timeout and optional retries, and fail-fast behavior in production.
- **Ops Tips**:
  - Stop tracking: set `enableVisitorTracking=false` in Site Settings.
  - Maintenance mode: set `siteUsed=false` to block access for all (including admin) — use with caution.
  - Admin auth: `/admin/visitors` uses `adminPassword` from Site Settings (stored as plain text by Strapi UI limitation; use strong passwords).
  - Data quality: For missing mobile records or proxy environments, verify IP/forwarded header configuration first.
  - Map performance: Initial load may be slow depending on free tile/CDN/network conditions.
  - Docs: see [VISITOR_TRACKING.md](./VISITOR_TRACKING.md).
  - Owner auto-allowlist: Append some information to the visit URL to auto-add the current IP to `ownerIpAllowlist` and record this visit as owner. Do not expose this publicly to avoid abuse.

#### 📄 **Advanced Content Management System**
- **Dynamic PDF Generation** for resumes and career details using html2pdf.js with custom styling
- **Rich Text Rendering Engine** supporting markdown, HTML, and custom components
- **Intelligent Image Optimization** via Cloudinary with automatic format selection and lazy loading
- **Comprehensive SEO Optimization** with meta tags, Open Graph, Twitter Cards, and structured data
- **Content Versioning & History** through Strapi's headless CMS architecture
- **Multi-language Content Support** with internationalization capabilities
- **Content Scheduling** for timed publication and updates

#### 🎨 **Modern UI/UX Design System**
- **Adaptive Dark/Light Mode** with system preference detection and manual toggle
- **Fully Responsive Design** optimized for mobile-first, tablet, and desktop experiences
- **Micro-interactions & Animations** powered by Framer Motion with performance optimization
- **Interactive 3D Backgrounds** using Three.js and Vanta effects with GPU acceleration
- **Dynamic Typing Animations** for engaging text presentation with customizable speeds
- **Comprehensive Accessibility** following WCAG 2.1 AA guidelines with screen reader support
- **Custom Design System** with consistent spacing, typography, and color schemes

#### ⚡ **Performance & Security Excellence**
- **Next.js 15 App Router** with advanced server-side rendering and static site generation
- **Optimized Image Pipeline** with Next.js Image component, WebP conversion, and progressive loading
- **Multi-layer Caching Strategies** for optimal loading performance and reduced server load
- **Advanced XSS Protection** using DOMPurify sanitization with custom configuration
- **Secure API Architecture** with proper authentication, rate limiting, and input validation
- **Intelligent Code Splitting** for minimal bundle sizes and faster initial page loads
- **Performance Monitoring** with Core Web Vitals tracking and real-time alerts

### 🛠️ **Technical Architecture & Stack**

#### **Frontend Technology Stack**
- **Framework**: Next.js 15 with App Router architecture and React Server Components
- **Language**: TypeScript with strict type checking and advanced type inference
- **Styling**: Tailwind CSS with custom design system and CSS-in-JS integration
- **Animation**: Framer Motion with performance-optimized animations and gesture handling
- **3D Graphics**: Three.js with Vanta.js for interactive backgrounds and WebGL rendering
- **State Management**: React hooks with custom context providers and optimistic updates
- **Code Quality**: ESLint, Prettier, Husky, and lint-staged for consistent code standards
- **Testing**: Jest and React Testing Library for comprehensive test coverage

#### **Backend Technology Stack**
- **CMS**: Strapi 5.16 headless CMS with custom controllers and middleware
- **Database**: PostgreSQL (production) with connection pooling / SQLite (development)
- **Image Storage**: Cloudinary with automatic optimization, transformation, and CDN delivery
- **API Architecture**: RESTful endpoints with custom visitor analytics API and GraphQL support
- **Authentication**: JWT-based admin authentication with refresh token rotation
- **Deployment**: Render with automated CI/CD pipeline and environment management
- **Monitoring**: Comprehensive logging, error tracking, and performance monitoring

#### **Analytics & Monitoring Infrastructure**
- **Custom Analytics Engine**: Built-in visitor tracking system with real-time processing
- **Live Data Streaming**: Real-time visitor monitoring and session analysis with WebSocket connections
- **Performance Metrics**: Core Web Vitals tracking, lighthouse scores, and custom performance indicators
- **Error Monitoring**: Comprehensive error logging, reporting, and alerting system
- **Security Monitoring**: Intrusion detection, rate limiting, and suspicious activity alerts

### 🌟 **Professional Development Showcase**

This portfolio demonstrates expertise in:
- **Full-stack Development** - Comprehensive knowledge of modern JavaScript ecosystem and best practices
- **System Architecture** - Scalable, maintainable code structure with microservices principles
- **UI/UX Design** - User-centered design approach with accessibility and performance considerations
- **Performance Optimization** - Real-world implementation of advanced optimization techniques
- **Security Implementation** - Industry-standard security practices and vulnerability prevention
- **DevOps & Deployment** - Modern CI/CD workflows and cloud infrastructure management
- **Documentation & Communication** - Comprehensive technical documentation and knowledge sharing

### 🚀 **Production Deployment & Infrastructure**
- **Frontend Hosting**: Vercel with automatic deployments, edge functions, and global CDN
- **Backend Hosting**: Render with PostgreSQL database, automatic scaling, and health monitoring
- **Image CDN**: Cloudinary for optimized image delivery with global edge locations
- **Domain & SSL**: Custom domain with automatic SSL certificate management and renewal
- **Monitoring**: Real-time uptime monitoring, performance tracking, and alert systems
- **Backup Strategy**: Automated database backups with point-in-time recovery capabilities

### 🧩 Infrastructure Overview (Summary)

- **Frontend**: Vercel (automatic Next.js deployments)
- **Backend**: Render (Strapi CMS)
- **Database**: Neon (PostgreSQL, serverless)
- **Image CDN/Storage**: Cloudinary
- **Auto-Heal Trigger**: GitHub Actions (Forced wake-up using Puppeteer)
- **Wake-up Trigger (optional)**: cron-job.org (periodic GET to wake server)
- **Wake-up Monitoring (optional)**: UptimeRobot (HEAD request every ~14 min)

For Neon, set `DATABASE_URL` in Render environment variables. Example: `postgres://<user>:<password>@<neon-host>/<db>?sslmode=require`.

### 💓 Health Check / Wake-up Configuration

To handle server crashes and spin-downs on Render's free tier, this project uses GitHub Actions and dedicated health check endpoints.

- **Health Endpoint**: `GET | HEAD /<health-check-endpoint>`
  - Example: `https://<render-app>.onrender.com/<health-check-endpoint>`
  - GET: `200` + `{ ok: true }`
  - HEAD: `200` (no body)

- **GitHub Actions Configuration**
  - Role: The core trigger that force-restarts the server using Puppeteer (a headless browser) in case of a crash or spin-down.
  - Repository: server-wakeup-bot
  - Method: GET /git-wakeupbot
  - Schedule: 15-minute interval
  - Purpose: Provides a robust, forced wake-up to ensure stability in a free-tier environment.
- **cron-job.org (optional)**
  - Method: GET /cron-job
  - Schedule: every 10–14 minutes
  - Purpose: auxiliary wake-up to ensure stable uptime on free tiers
- **UptimeRobot (optional)**
  - Monitor Type: HTTP(s)
  - Method: HEAD /uptimerobot
  - URL: Health endpoint above
  - Interval: 14 minutes (avoids Render Free 15-min sleep)

### 📁 **Project Structure & Organization**

```
portfolio/
├── frontend/                    # Next.js Frontend Application
│   ├── src/
│   │   ├── app/                # Next.js App Router Pages
│   │   │   ├── career-detail/  # Career Details Page
│   │   │   ├── portfolio/      # Project Detail Pages
│   │   │   ├── resume/         # Resume Page
│   │   │   └── admin/          # Admin Dashboard
│   │   │       └── visitors/   # Visitor Analytics Dashboard
│   │   ├── components/         # React Components
│   │   │   ├── layout/         # Layout Components
│   │   │   ├── sections/       # Page Section Components
│   │   │   ├── ui/             # Reusable UI Components
│   │   │   └── admin/          # Admin-specific Components
│   │   ├── lib/                # Utility Functions & APIs
│   │   │   ├── api.ts          # API Client
│   │   │   ├── visitor.ts      # Visitor Tracking Logic
│   │   │   └── siteSettings.ts # Site Settings Management
│   │   ├── hooks/              # Custom React Hooks
│   │   └── types/              # TypeScript Type Definitions
│   ├── public/                 # Static Assets
│   └── package.json
├── backend/                    # Strapi Backend CMS
│   ├── src/
│   │   └── api/               # Content Types & APIs
│   │       ├── profile/       # User Profile Data
│   │       ├── skill/         # Technical Skills
│   │       ├── project/       # Portfolio Projects
│   │       ├── company/       # Work Experience
│   │       ├── education/     # Educational Background
│   │       ├── career-detail/ # Detailed Career Information
│   │       ├── visitor/       # Visitor Analytics Data
│   │       └── site-setting/  # Global Site Configuration
│   ├── config/                # Strapi Configuration
│   └── package.json
├── DEPLOYMENT.md              # Deployment Guide
├── VISITOR_TRACKING.md        # Analytics Documentation
└── README.md                  # This File
```

### 🎯 **Implemented Features & Capabilities**

#### **✅ Core Pages & Navigation**
- **Homepage** (`/`) - Profile showcase, skills display, and project portfolio
- **Resume Page** (`/resume`) - Comprehensive resume with PDF download functionality
- **Career Details** (`/career-detail`) - Detailed career information with PDF export
- **Project Details** (`/portfolio/[slug]`) - Individual project case studies and technical details
- **Admin Dashboard** (`/admin/visitors`) - Comprehensive visitor analytics and site management

#### **✅ Advanced UI/UX Features**
- **Adaptive Theme System** - Complete dark/light mode with system preference detection
- **Responsive Design** - Mobile-first approach with perfect tablet and desktop optimization
- **Smooth Animations** - Framer Motion-powered micro-interactions and page transitions
- **Interactive Backgrounds** - Three.js and Vanta.js powered dynamic visual effects
- **Typography Animations** - Dynamic typing effects and text reveal animations
- **Accessibility Compliance** - WCAG 2.1 AA standards with screen reader support

#### **✅ Content Management System**
- **Strapi Admin Panel** - Complete headless CMS with custom controllers and middleware
- **Image Management** - Cloudinary integration with automatic optimization and transformation
- **Rich Content Support** - Markdown, HTML rendering with syntax highlighting
- **SEO Optimization** - Meta tags, Open Graph, Twitter Cards, and structured data
- **API Generation** - Automatic REST API endpoints with custom analytics extensions
- **Content Versioning** - Built-in content history and revision management

#### **✅ Performance & Security**
- **PDF Generation** - Client-side PDF creation for resumes and career documents
- **Code Highlighting** - Syntax highlighting for technical content with highlight.js
- **XSS Protection** - DOMPurify sanitization for all user-generated content
- **Performance Optimization** - Next.js Image optimization, caching strategies, and code splitting
- **Visitor Analytics** - Real-time visitor tracking with comprehensive dashboard ([Documentation](./VISITOR_TRACKING.md))
- **Security Headers** - CORS, CSP, and other security best practices implementation

### 🎛️ **Site Settings Configuration**

The site settings system provides centralized configuration management through Strapi Admin Panel. All settings are dynamically applied without requiring code changes or server restarts, enabling real-time site management.

#### **Available Settings**

##### **🔐 adminPassword (Administrator Password)**
- **Description**: Admin authentication password for visitor analytics dashboard access
- **Type**: String (Plain text, 6-50 characters)
- **Default**: Set during initial setup
- **Usage**: Authentication for `/admin/visitors` page access
- **Security**: Visible as plain text in Strapi Admin (due to UI limitations)
- **Best Practice**: Use strong passwords and restrict Strapi Admin access

##### **📊 enableVisitorTracking (Visitor Tracking Toggle)**
- **Description**: Enable or disable visitor data collection and analytics system
- **Type**: Boolean
- **Default**: `true` (enabled)
- **Effect**: When set to `false`, immediately stops all visitor tracking and data collection
- **Application**: Applied in real-time without server restart
- **Privacy**: Respects user privacy preferences and GDPR compliance

##### **🏷️ siteName (Site Title)**
- **Description**: Site title displayed in browser tabs, meta tags, and social media shares
- **Type**: String (maximum 100 characters)
- **Default**: "Developer Portfolio"
- **Usage**: SEO optimization, browser tab titles, social media previews
- **Impact**: Affects search engine rankings and user experience

##### **📝 siteDescription (Site Meta Description)**
- **Description**: SEO meta description for search engines and social media
- **Type**: Text (maximum 500 characters)
- **Default**: "Personal portfolio website"
- **Usage**: Google search results, social media share descriptions
- **SEO**: Critical for search engine optimization and click-through rates

##### **🌐 siteUsed (Site Accessibility Control)**
- **Description**: Master switch for site accessibility (`true` = accessible, `false` = blocked)
- **Type**: Boolean
- **Default**: `true` (accessible)
- **Effect**: When `false`, displays maintenance screen to all visitors
- **Use Cases**: Site maintenance, updates, emergency blocking
- **Warning**: Blocks admin access as well when disabled

##### **👥 maxVisitorsPerDay (Daily Visitor Limit)**
- **Description**: Daily visitor limit for traffic control and server load management
- **Type**: Integer (range: 100 - 1,000,000)
- **Default**: 10,000
- **Purpose**: Server load management, traffic monitoring, resource optimization
- **Implementation**: Used for analytics and potential rate limiting

#### **Configuration Guide**

1. **Access Strapi Admin Panel**
   ```
   http://localhost:1337/admin
   ```

2. **Navigate to Settings**
   - Go to **Content Manager** → **Site Settings**

3. **Update Values**
   - Modify desired setting values
   - Click **Save** to apply changes

4. **Real-time Application**
   - Settings apply immediately without server restart
   - Frontend reflects changes on next page load

#### **Important Notes**
- **adminPassword**: Stored as plain text but masked in admin UI
- **siteUsed**: When `false`, blocks all access including admin
- **enableVisitorTracking**: Consider privacy policies when configuring

### 🚀 **Getting Started**

#### **Prerequisites**
- Node.js 18+ and npm
- Git for version control
- Code editor (VS Code recommended)

#### **Installation & Setup**

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/portfolio.git
   cd portfolio
   ```

2. **Backend Setup (Strapi)**
   ```bash
   cd backend
   npm install
   npm run develop
   ```

3. **Frontend Setup (Next.js)**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Environment Configuration**
   
   **Frontend (.env.local):**
   ```env
   # Primary backend URL (local)
   NEXT_PUBLIC_STRAPI_API_URL_PRIMARY=http://localhost:1337
   # Optional: Vercel Preview/Dev specific URL
   # NEXT_PUBLIC_STRAPI_URL=https://your-preview-backend.example.com
   # Optional: Secondary backend for failover
   # NEXT_PUBLIC_STRAPI_API_URL_SECONDARY=https://your-backup-backend.example.com
   ```

   **Backend (.env):**
   ```env
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   ADMIN_JWT_SECRET=your_admin_jwt_secret
   CLOUDINARY_URL=your_cloudinary_url
   ```

#### **Production Environment Variables (Vercel)**

**⚠️ IMPORTANT**: For production deployment, you must set environment variables in Vercel Dashboard:

```env
# Primary backend URL (required in production)
NEXT_PUBLIC_STRAPI_API_URL_PRIMARY=https://your-backend-url.render.com

# Optional: Vercel Preview/Dev specific URL
NEXT_PUBLIC_STRAPI_URL=https://your-preview-backend.example.com

# Optional: API token when calling Strapi from Vercel
# STRAPI_API_TOKEN=vercel_strapi_api_token
```

#### **Security Setup**
1. **Vercel Dashboard** → **Project** → **Settings** → **Environment Variables**
2. **Production**: Set strong password for production environment
3. **Preview/Test**: Set different password for preview deployments
4. **Never use hardcoded passwords** - the app will show an error if not set

📖 **[Detailed Deployment Guide](./DEPLOYMENT.md)** - Complete setup instructions for Vercel, Render, and environment variables

### 🌐 **Deployment Architecture**

This project features a dual-architecture setup (Main A and Development/Backup B) designed for stability and high availability. This structure overcomes the limitations of free hosting plans (Render, etc.) such as the 750-hour monthly limit and 15-minute inactivity sleep mode.

- **Site A (Main):** The primary site accessed by actual users (GitHub A account, Vercel A account, Render A account)
  - Operates only the production environment to keep monthly usage under 720 hours (24 hours x 30 days)
  - Uses monitoring tools like UptimeRobot to ping the server every 14 minutes, preventing 15-minute sleep mode and ensuring 24/7 availability

- **Site B (Development & Backup):** Development and backup site for when Main Site A fails (GitHub B account, Vercel B account, Render B account)
  - Operates both development (`Preview/dev`) and production (`Production`) environments
  - Serves as backup for Main Site A and is primarily used for development and testing

#### **Frontend (Vercel)**
- **A-Frontend (Main):** Operates only `Production` environment
- **B-Frontend (Development/Backup):** Operates both `Production` and `Preview(dev)` environments

#### **Backend (Render)**
- **A-Backend (Main):** Operates only `Production` environment
- **B-Backend (Development/Backup):** Operates both `Production` and `Preview(dev)` environments

### 🔧 **Development Guide**

#### **Adding New Features**
1. Backend: Create Content Type in Strapi Admin Panel
2. Frontend: Define TypeScript types and create components
3. API Integration: Add functions to `src/lib/api.ts`

#### **Styling Guidelines**
- Use Tailwind CSS for consistent styling
- Component-based styling approach
- Consider responsive design principles
- Support dark mode theming

#### **Performance Optimization**
- Utilize Next.js Image component for optimized images
- Leverage Static Site Generation (SSG)
- Implement API response caching
- Apply code splitting strategies

#### **Animation Implementation**
- Use Framer Motion for smooth animations
- Implement Three.js/Vanta background effects
- Apply CSS animations where appropriate

### 📝 **License**

MIT License

### 🤝 **Contributing**

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📞 **Contact**

For project inquiries, please create an issue.
daniel.han.developer@gmail.com

---

*This project is implemented as a complete portfolio system and will continue to evolve through ongoing improvements and expansions.*

### **Free Server Environment Notice & User Tips**

This project can be operated in free server environments (Vercel, Render, etc.). In such cases, **the initial connection may be slow due to server sleep/wake-up cycles.**

#### **User Notification Examples**

- **Loading Spinner/Loader + Notification Message**
  - Example: `Waking up the server. Due to the free server environment, initial connection may take up to 1 minute. Please wait!`
- **Top/Bottom Banner Notice**
  - Example: `⚡️ Notice: This site runs on a free server environment and may load slowly on first visit.`
- **FAQ/About Page Notice**
  - Example: `Due to the free server environment, initial connection may take up to 1 minute.`

**Tips:**
- Adding notification messages in various locations (loading components, layout Header/Footer, FAQ/About pages) improves user experience
- In actual operation, notification messages can reduce user confusion and abandonment rates 
