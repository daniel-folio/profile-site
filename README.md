# 개발자 포트폴리오 웹사이트

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
- 블로그 포스트 및 카테고리 (준비됨)

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
- visible: **홈 화면(메인)에서** 해당 기술을 노출할지 여부 (true/false)
  - false로 설정해도 관리 페이지(어드민)나 이력서 PDF 등에는 포함될 수 있습니다.
- order: 기술의 정렬 순서(숫자가 작을수록 먼저 노출)

#### Project(프로젝트)
- visible: **홈 화면(메인)에서** 해당 프로젝트를 노출할지 여부 (true/false)
  - false로 설정해도 프로젝트 상세 페이지 등에는 접근이 가능할 수 있습니다.
- featured: 메인/추천 프로젝트로 강조할지 여부 (true/false)
- order: 프로젝트의 정렬 순서

#### Company(회사)
- order: 회사의 정렬 순서

#### CareerDetail(경력 상세)
- order: 경력 상세의 정렬 순서
- project: 연결된 프로젝트가 있을 경우, 프로젝트 상세에서 함께 노출

#### Education(학력)
- order: 학력의 정렬 순서

#### 공통 안내
- 모든 order 필드는 숫자가 작을수록 먼저 노출(오름차순)
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

---

*이 프로젝트는 완전한 포트폴리오 시스템으로 구현되었으며, 지속적인 개선과 확장을 통해 더욱 발전시킬 예정입니다.*

## 무료 서버 환경 안내 및 사용자 알림 방법

본 프로젝트는 무료 서버(Vercel, Render 등) 환경에서 운영될 수 있습니다. 이 경우, 서버 슬립/웨이크업 등으로 인해 **첫 접속 시 반응속도가 느릴 수 있습니다.**

### 사용자에게 안내하는 방법

1. **로딩 스피너/로더 + 안내 메시지**
   - 예시: `서버를 깨우는 중입니다. 무료 서버 환경으로 인해 첫 접속 시 최대 1분 정도 소요될 수 있습니다. 잠시만 기다려 주세요!`
   - 로딩 컴포넌트에 안내 메시지를 함께 표시

2. **상단/하단 배너 안내**
   - 예시: `⚡️ 안내: 본 사이트는 무료 서버 환경에서 운영되어 첫 접속 시 로딩이 느릴 수 있습니다.`
   - 사이트 상단 또는 하단에 배너 형태로 안내

3. **FAQ/소개 페이지에 안내**
   - 예시: `무료 서버 환경으로 인해 첫 접속 시 최대 1분 정도 소요될 수 있습니다.`
   - FAQ, About, 소개 페이지 등에 안내 문구 추가

> **권장:** 로딩 중 안내 메시지 + 상단/하단 배너를 함께 적용하면 사용자 이탈을 줄이고 신뢰도를 높일 수 있습니다. 