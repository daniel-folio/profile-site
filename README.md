# Developer Portfolio Website | 개발자 포트폴리오 웹사이트

**🌍 English** | [한국어](#korean)

## English Overview

A **full-stack developer portfolio website** showcasing modern web development practices with **Next.js 15**, **Strapi CMS**, and a custom-built **visitor analytics system**. This project demonstrates enterprise-level architecture, performance optimization, and user experience design.

### 🎯 Core Features

#### 📊 **Advanced Visitor Analytics System**
- **Real-time Dashboard** with multi-tab interface (Overview, Page Analysis, Session Tracking, Live Visitors)
- **Smart Date Selection** with quick period buttons (1d/7d/30d) and custom date range picker
- **Session Analysis** tracking user journey paths and behavior patterns
- **Browser/OS Statistics** with detailed visitor environment analytics
- **IP-based Grouping** with accordion UI for organized data presentation
- **Empty State Handling** with user-friendly fallback interfaces
- **Privacy-First Design** with GDPR compliance considerations
- [**📖 Detailed Documentation**](./VISITOR_TRACKING.md)

#### 📄 **Dynamic Content Management**
- **PDF Generation** for resumes and career details using html2pdf.js
- **Rich Text Rendering** with markdown and HTML support
- **Image Optimization** via Cloudinary integration
- **SEO Optimization** with meta tags and Open Graph configuration
- **Content Versioning** through Strapi's headless CMS architecture

#### 🎨 **Modern UI/UX Design**
- **Dark/Light Mode** with system preference detection
- **Responsive Design** optimized for mobile, tablet, and desktop
- **Smooth Animations** powered by Framer Motion
- **Interactive Backgrounds** using Three.js and Vanta effects
- **Typing Animations** for dynamic text presentation
- **Accessibility** following WCAG guidelines

#### ⚡ **Performance & Security**
- **Next.js App Router** with server-side rendering and static generation
- **Image Optimization** with Next.js Image component and lazy loading
- **Caching Strategies** for optimal loading performance
- **XSS Protection** using DOMPurify sanitization
- **Secure API Endpoints** with proper authentication and validation
- **Code Splitting** for minimal bundle sizes

### 🛠️ Technical Architecture

#### **Frontend Stack**
- **Framework**: Next.js 15 with App Router architecture
- **Language**: TypeScript for type safety and developer experience
- **Styling**: Tailwind CSS with custom design system
- **Animation**: Framer Motion for smooth transitions
- **3D Graphics**: Three.js with Vanta.js for interactive backgrounds
- **State Management**: React hooks with custom context providers
- **Code Quality**: ESLint, Prettier, and Husky for consistent code standards

#### **Backend Stack**
- **CMS**: Strapi 5.16 headless CMS with custom controllers
- **Database**: PostgreSQL (production) / SQLite (development)
- **Image Storage**: Cloudinary with automatic optimization
- **API**: RESTful endpoints with custom visitor analytics API
- **Authentication**: JWT-based admin authentication
- **Deployment**: Render with automated CI/CD pipeline

#### **Analytics & Monitoring**
- **Custom Analytics**: Built-in visitor tracking system
- **Real-time Data**: Live visitor monitoring and session analysis
- **Performance Metrics**: Core Web Vitals tracking
- **Error Monitoring**: Comprehensive error logging and reporting

### 🌟 **Project Highlights**

This portfolio demonstrates:
- **Full-stack Development** expertise with modern JavaScript ecosystem
- **System Architecture** skills with scalable, maintainable code structure
- **UI/UX Design** capabilities with attention to user experience
- **Performance Optimization** knowledge with real-world implementation
- **Security Best Practices** with proper data handling and protection
- **Documentation Skills** with comprehensive technical documentation

### 🚀 **Live Demo & Deployment**
- **Frontend**: Deployed on Vercel with automatic deployments
- **Backend**: Hosted on Render with PostgreSQL database
- **CDN**: Cloudinary for optimized image delivery
- **Domain**: Custom domain with SSL certificate

---

## Korean

<a name="korean"></a>

개인의 이력서, 포트폴리오, 경력기술서를 체계적으로 관리하고 전시할 수 있는 개인 웹사이트입니다.

## 🚀 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion, Three.js, Vanta
- **Deployment**: Vercel

### Backend
- **Framework**: Strapi 5.16 (Headless CMS)
- **Language**: TypeScript
- **Database**: SQLite (개발) / PostgreSQL (프로덕션)
- **Image Storage**: Cloudinary
- **Deployment**: Render

### 기타
- **Version Control**: GitHub
- **Package Manager**: npm

## 📁 프로젝트 구조

```
portfolio/
├── frontend/          # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/      # Next.js App Router
│   │   │   ├── career-detail/  # 경력기술서 페이지
│   │   │   ├── portfolio/      # 프로젝트 상세 페이지
│   │   │   └── resume/         # 이력서 페이지
│   │   ├── components/ # React 컴포넌트
│   │   │   ├── layout/     # 레이아웃 컴포넌트
│   │   │   ├── sections/   # 페이지 섹션 컴포넌트
│   │   │   └── ui/         # UI 컴포넌트
│   │   ├── lib/      # 유틸리티 함수
│   │   └── types/    # TypeScript 타입
│   └── README.md
├── backend/           # Strapi 백엔드
│   ├── src/
│   │   └── api/      # Content Types
│   │       ├── profile/         # 프로필
│   │       ├── skill/           # 기술 스택
│   │       ├── project/         # 프로젝트
│   │       ├── company/         # 회사 정보
│   │       ├── education/       # 학력 정보
│   │       ├── career-detail/   # 경력 상세
│   │       ├── other-experience/ # 기타 경험
│   │       └── blog-*/          # 블로그 시스템
│   └── README.md
└── README.md
```

## 🎯 주요 기능

### ✅ 완전히 구현된 기능들

#### **핵심 페이지**
- ✅ **홈페이지** (`/`): 프로필, 스킬, 프로젝트 목록 표시
- ✅ **이력서 페이지** (`/resume`): PDF 다운로드 기능 포함
- ✅ **경력기술서 페이지** (`/career-detail`): 상세 경력 정보 및 PDF 다운로드
- ✅ **프로젝트 상세 페이지** (`/portfolio/[slug]`): 개별 프로젝트의 상세 정보 표시

#### **UI/UX 기능**
- ✅ **다크 모드**: 완전한 다크/라이트 모드 지원
- ✅ **반응형 디자인**: 모바일/태블릿/데스크톱 완벽 대응
- ✅ **애니메이션**: Framer Motion을 사용한 부드러운 애니메이션
- ✅ **배경 효과**: Three.js 기반 Vanta 배경, ThreeShapes 배경
- ✅ **타이핑 애니메이션**: 텍스트 타이핑 효과

#### **콘텐츠 관리**
- ✅ **Strapi Admin Panel**: 완전한 헤드리스 CMS 시스템
- ✅ **이미지 관리**: Cloudinary 연동으로 이미지 최적화
- ✅ **Rich Text 지원**: 마크다운, HTML 렌더링
- ✅ **SEO 최적화**: 메타 태그, Open Graph 설정
- ✅ **API 제공**: REST API 엔드포인트 자동 생성

#### **고급 기능**
- ✅ **PDF 다운로드**: html2pdf.js를 사용한 이력서/경력기술서 PDF 생성
- ✅ **코드 하이라이팅**: highlight.js를 사용한 코드 블록 스타일링
- ✅ **보안**: DOMPurify를 사용한 XSS 방지
- ✅ **성능 최적화**: Next.js Image 컴포넌트, 캐싱 전략
- ✅ **방문자 분석**: 실시간 방문자 추적 및 통계 대시보드 ([상세 문서](./VISITOR_TRACKING.md))

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
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

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
- `NEXT_PUBLIC_STRAPI_API_URL_SECONDARY`: 장애 시 사용할 백업 백엔드 주소
  - Production 값: B-운영 백엔드 URL
- `FAILOVER_MODE_ENABLED`: Failover 기능 활성화 스위치
  - Production 값: `true`
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
