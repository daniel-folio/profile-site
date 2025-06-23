# Portfolio Frontend

개발자 포트폴리오 웹사이트의 프론트엔드 애플리케이션입니다.

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Radix UI patterns
- **Backend**: Strapi (Headless CMS)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈페이지
│   └── portfolio/
│       └── [slug]/
│           └── page.tsx   # 프로젝트 상세 페이지
├── components/            # React 컴포넌트
│   ├── ui/               # 재사용 가능한 UI 컴포넌트
│   ├── layout/           # 레이아웃 컴포넌트
│   └── sections/         # 페이지 섹션 컴포넌트
├── lib/                  # 유틸리티 함수
│   ├── api.ts           # Strapi API 호출 함수
│   └── utils.ts         # 유틸리티 함수
└── types/               # TypeScript 타입 정의
```

## 주요 기능

### 홈페이지 (`/`)
- 프로필 정보 표시
- 기술 스택 카테고리별 그룹화
- 주요 프로젝트 목록

### 프로젝트 상세 페이지 (`/portfolio/[slug]`)
- 프로젝트 상세 정보
- 프로젝트 이미지 갤러리
- 사용 기술 표시
- GitHub 및 라이브 링크

## 컴포넌트

### UI 컴포넌트
- `Button`: 다양한 스타일의 버튼 컴포넌트
- `Card`: 카드 레이아웃 컴포넌트

### 섹션 컴포넌트
- `Hero`: 메인 히어로 섹션
- `Skills`: 기술 스택 표시
- `Projects`: 프로젝트 목록 표시

### 레이아웃 컴포넌트
- `Header`: 네비게이션 헤더
- `Footer`: 푸터

## API 연동

Strapi 백엔드와 REST API를 통해 데이터를 가져옵니다:

- `getProfile()`: 프로필 정보
- `getSkills()`: 기술 스택 목록
- `getProjects()`: 프로젝트 목록
- `getProjectBySlug()`: 특정 프로젝트 정보

## 배포

### Vercel 배포

1. GitHub 저장소를 Vercel에 연결
2. 환경 변수 설정:
   - `NEXT_PUBLIC_STRAPI_URL`: Strapi 백엔드 URL
   - `NEXT_PUBLIC_SITE_URL`: 프론트엔드 URL

### 빌드

```bash
npm run build
```

## 개발 가이드

### 새 컴포넌트 추가

1. `src/components/` 디렉토리에 적절한 위치에 컴포넌트 생성
2. TypeScript 타입 정의 추가
3. 필요한 경우 스타일링 (Tailwind CSS 사용)

### 새 페이지 추가

1. `src/app/` 디렉토리에 새 라우트 생성
2. `page.tsx` 파일 생성
3. 메타데이터 및 SEO 최적화

## 라이센스

MIT License
