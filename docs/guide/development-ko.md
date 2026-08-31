# 💻 개발 및 운영 가이드

### 🌟 **전문 개발 포트폴리오 개요**

본 프로젝트는 풀스택 웹 개발 및 시스템 아키텍처 모범 사례를 적용하여 구축되었습니다:
- **풀스택 개발** - 최신 모던 JavaScript / TypeScript 생태계 및 최적화 기법 적용
- **시스템 아키텍처** - 마이크로서비스 원칙을 준수하는 확장 가능하고 유지보수가 용이한 코드 구조
- **UI/UX 디자인** - 접근성(Accessibility) 및 성능을 고려한 사용자 중심 디자인
- **성능 최적화** - 실시간 대용량 데이터 렌더링, 정적 생성을 통한 사이트 속도 극대화
- **보안 모범 사례** - 산업 표준 보안 패러다임 및 취약점 방지 로직 적용
- **DevOps & 배포** - 자동화된 CI/CD 파이프라인 및 멀티 클라우드 이중화 인프라 관리
- **문서화 & 커뮤니케이션** - 명확하고 체계적인 기술 문서화 및 아키텍처 정보 공유

---

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone <repository-url>
cd portfolio
```

### 2. 백엔드 설정 (Strapi CMS)

```bash
cd backend
npm install
npm run develop
```

브라우저에서 [http://localhost:1337/admin](http://localhost:1337/admin)을 열어 관리자 계정을 생성하세요.

### 3. 프론트엔드 설정 (Next.js)

```bash
cd frontend
npm install
npm run dev
```

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 백엔드 API 연결 (중앙 선택 로직)
NEXT_PUBLIC_STRAPI_API_URL_PRIMARY=http://localhost:1337
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

---

## 🔐 프로덕션 환경 변수 (Vercel)

**⚠️ 중요**: 프로덕션 배포 시 Vercel 대시보드에 환경 변수를 반드시 설정해야 합니다.

```env
# Primary backend URL (required in production)
NEXT_PUBLIC_STRAPI_API_URL_PRIMARY=https://your-backend-url.render.com

# Optional: Vercel Preview/Dev specific URL
NEXT_PUBLIC_STRAPI_URL=https://your-preview-backend.example.com

# Optional: API token when calling Strapi from Vercel
# STRAPI_API_TOKEN=vercel_strapi_api_token
```

### 보안 설정 규칙
1. **Vercel 대시보드** → **프로젝트** → **Settings** → **Environment Variables**
2. **관리자 비밀번호**: Strapi Admin의 `Site Settings`에서 설정/관리
3. **미리보기/테스트**: 환경에 맞는 백엔드 URL 사용
4. **비밀값 하드코딩 금지**: 보안 비밀번호는 코드에 직접 작성하지 마세요.

📖 **[배포 가이드 자세히 보기](./DEPLOYMENT.md)** - Vercel/Render 설정 및 환경 변수 상세 안내

---

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
- **Auto-Heal & Wake-up System (서버 자동 복구 시스템)**
    - **1차 방어 (지능형)**: 내장된 메모리 모니터 (`Memory Monitor`)가 메모리 임계값 초과 시 서버를 선제적으로 재시작합니다.
    - **2차 방어 (최후의 보루)**: GitHub Actions (`server-wakeup-bot`)가 10분마다 서버 상태를 확인하고, 응답이 없을 경우 강제로 깨웁니다.
      - ***Auto-Heal Trigger***: GitHub Actions (Puppeteer를 이용한 강제 기상)
      - ***Wake-up Trigger(옵션)***: cron-job.org (주기적 호출로 서버 기상)
      - ***Wake-up Monitoring(옵션)***: UptimeRobot (14분 주기 헬스 체크)
    - **실시간 알림**: `Slack`을 통해 메모리 초과 및 서버 다운 이벤트에 대한 즉각적인 알림을 받습니다.

Neon 사용 시 `DATABASE_URL`은 Render 환경 변수에 설정합니다. 예시: `postgres://<user>:<password>@<neon-host>/<db>?sslmode=require`.

---

## 💓 헬스 체크 / 웨이크업 설정

Render 무료 플랜의 서버 다운 및 휴면 상태에 대응하기 위해, GitHub Actions와 전용 헬스 체크 엔드포인트를 사용합니다.

- **1. 지능형 자가 복구 (메모리 모니터)**
    - **역할**: Strapi 애플리케이션이 5분마다 스스로의 메모리 사용량을 체크하여, 설정된 임계값(450MB) 초과 시 **선제적으로** 자신을 재시작합니다. 갑작스러운 트래픽 증가로 인한 다운을 예방하는 1차 방어선입니다.
    - **알림**: 재시작 시 `Slack`으로 "Memory usage high" 알림을 보냅니다.
    - **구현**: `backend/src/config/memory-monitor.ts`

- **2. 자동 복구 봇 (GitHub Actions)**
    - **역할**: 메모리 모니터가 작동하지 못하는 등의 이유로 서버가 응답 불능 상태에 빠졌을 때를 대비한 최후의 보루입니다. 10분마다 Puppeteer(헤드리스 브라우저)를 이용해 서버에 접속하여 강제로 깨웁니다.
    - **알림**: 서버 접속 실패 시 `Slack`으로 "Server Down Detected" 알림을 보냅니다.
    - **저장소**: `server-wakeup-bot`

- **3. 전용 헬스 체크 엔드포인트**
    - 각 모니터링 도구의 역할을 명확히 구분하기 위해 등록된 커스텀 경로입니다.
    - **GitHub Actions Bot**: `GET /git-wakeupbot`
    - **UptimeRobot (선택)**: `GET /uptimerobot`
    - **수동 재시작**: `GET /restart-server?secret=<SECRET_KEY>`

---

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

---

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

---

## 📁 프로젝트 구조 및 구현 기능

```
portfolio/
├── frontend/                    # Next.js 프론트엔드 애플리케이션
│   ├── src/
│   │   ├── app/                # Next.js App Router 페이지
│   │   │   ├── career-detail/  # 경력 상세 페이지
│   │   │   ├── portfolio/      # 프로젝트 상세 페이지
│   │   │   ├── resume/         # 이력서 페이지
│   │   │   └── admin/          # 관리자 대시보드 (방문자 통계)
│   │   ├── features/           # 기능별 컴포넌트 및 로직
│   │   ├── lib/                # 유틸리티 및 API 클라이언트
│   │   └── types/              # TypeScript 타입 정의
│   ├── public/                 # 정적 에셋 (이미지 등)
│   └── package.json
├── backend/                    # Strapi 백엔드 CMS
│   ├── src/
│   │   └── api/               # 콘텐츠 타입 및 API
│   ├── config/                # Strapi 환경 설정
│   └── package.json
└── README.md
```

### 구현 기능 요약
- **홈페이지 (`/`)**: 프로필 소개, 기술 스택, 대표 프로젝트 및 최신 프로젝트 포트폴리오
- **이력서 페이지 (`/resume`)**: PDF 다운로드 기능이 포함된 이력서
- **경력 상세 페이지 (`/career-detail`)**: 상세 경력 정보 및 PDF 내보내기
- **방문자 분석 대시보드 (`/admin/visitors`)**: 실시간 방문자 수 및 통계 분석

---

## 🎛️ 사이트 설정 가이드 (Site Settings)

Strapi Admin Panel의 `Site Settings` 단일 컬렉션을 통해 사이트의 주요 동작을 코드 수정 없이 실시간 제어할 수 있습니다.

- **`adminPassword`**: 방문자 통계 대시보드 (`/admin/visitors`) 접속 비밀번호
- **`enableVisitorTracking`**: 방문자 데이터 수집 및 트래킹 시스템 활성화 여부 (`true`/`false`)
- **`siteName`**: 웹사이트 메타 타이틀 및 상단 브라우저 탭 이름
- **`siteDescription`**: 검색 엔진 SEO 및 소셜 미디어를 위한 사이트 메타 설명
- **`siteUsed`**: 전체 사이트 접근 스위치 (`false`로 설정 시 즉시 점검 화면 전환)
- **`maxVisitorsPerDay`**: 일일 트래픽 제어 및 과도한 요청 방지 제한 수치

---

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
- 회사 연동, 대표 프로젝트 정렬 순서

### Company (회사)
- 회사명, 로고, 설명, 위치, 웹사이트, 산업 분야

### Education (학력)
- 학교명, 전공, 학위, 기간, GPA, 설명

### CareerDetail (경력 상세)
- 프로젝트별 상세 경력 정보, 기술 스택, 역할, 성과

### OtherExperience (기타 경험)
- 기타 활동, 수료, 자격증 등

### BlogPost/BlogCategory (블로그)
- 블로그 포스트 및 카테고리 (백엔드만 준비됨)

---

## 🔗 socialLinks 입력 안내

**socialLinks 필드는 다양한 소셜 미디어 링크를 JSON 형식으로 입력할 수 있습니다.**

#### 지원하는 소셜 미디어 키 목록
- github: GitHub
- githubBlog (또는 github_blog, githubio): GitHub Blog (GitHub Pages)
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
  "githubBlog": "https://yourid.github.io",
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
- 입력된 순서 그대로 화면에 순서대로 노출됩니다.
- 이메일은 별도 필드로 입력하면 이메일 아이콘이 함께 표시됩니다.

---

## 📊 Profile 및 데이터 노출 여부 관리 팁

### Profile 노출여부 관련 필드
- **showProfileImage**: 프로필 이미지를 화면에 노출할지 여부 (`true`/`false`)
- **showPhone**: 전화번호를 화면에 노출할지 여부 (`true`/`false`)
- **resumeDownloadEnabled**: 이력서 PDF 다운로드 버튼 노출 여부 (`true`/`false`)
- **careerDetailDownloadEnabled**: 경력기술서 PDF 다운로드 버튼 노출 여부 (`true`/`false`)

### 데이터 노출여부 및 정렬 관리 팁

#### Skill(기술)
- **isPublic**: **홈 화면(메인)과 이력서에서** 해당 기술을 노출할지 여부 (`true`/`false`)
- **visible**: **홈 화면(메인)에서** 해당 기술을 노출할지 여부 (`true`/`false`)
- **order**: 기술의 정렬 순서(숫자가 작을수록 먼저 노출)

#### Project(프로젝트)
- **visible**: **이력서/홈 어디에도** 노출하지 않을지 여부 (임시 비활성용)
- **isBasicShow**: **이력서에서** 기본으로 노출할지 여부 (`false` 시 '더보기'에 숨겨짐)
- **teamType**: **이력서에서** 팀(Team) 또는 개인(Personal) 섹션으로 분류 (회사 연동 없을 때 적용)
- **featured**: **홈 화면(메인)에서** 대표 프로젝트로 노출할지 여부 (`true`/`false`)
- **order**: **이력서 내에서** 프로젝트의 정렬 순서
- **featuredOrder**: **홈 화면(메인)에서** 대표 프로젝트의 정렬 순서

#### Company(회사)
- **order**: 회사의 정렬 순서
- **isBasicShow**: **이력서에서** 기본으로 노출할지 여부 (`false` 시 '경력 더보기'에 숨겨짐)

#### CareerDetail(경력 상세)
- **order**: 경력 상세의 정렬 순서
- **project**: 연결된 프로젝트가 있을 경우, 프로젝트 상세에서 함께 노출

#### Education(학력)
- **order**: 학력의 정렬 순서

---

## 🌐 배포

### Frontend (Vercel)
1. GitHub 저장소를 Vercel에 연결
2. 환경 변수 설정 (`NEXT_PUBLIC_STRAPI_API_URL_PRIMARY` 등)

### Backend (Render)
1. GitHub 저장소를 Render에 연결
2. 환경 변수 설정 (`DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_URL` 등)

---

## 📝 라이선스 및 기여하기

### 라이선스
MIT License

### 기여하기
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 연락처
프로젝트 문의사항: daniel.han.developer@gmail.com

---

## 💡 무료 서버 환경 안내 및 사용자 알림 팁

본 프로젝트는 무료 서버(Vercel, Render 등) 환경에서 운영될 수 있습니다. 이 경우, 서버 슬립/웨이크업 등으로 인해 **첫 접속 시 반응속도가 느릴 수 있습니다.**

#### 사용자에게 안내하는 방법 예시
- **로딩 스피너/로더 + 안내 메시지**: `서버를 깨우는 중입니다. 무료 서버 환경으로 인해 첫 접속 시 최대 1분 정도 소요될 수 있습니다. 잠시만 기다려 주세요!`
- **상단/하단 배너 안내**: `⚡️ 안내: 본 사이트는 무료 서버 환경에서 운영되어 첫 접속 시 로딩이 느릴 수 있습니다.`
- **FAQ/소개 페이지 안내**: `무료 서버 환경으로 인해 첫 접속 시 최대 1분 정도 소요될 수 있습니다.`
