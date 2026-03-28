# 프론트엔드 폴더 구조 가이드

이 문서는 프론트엔드(Next.js)의 **기능 기반(Feature-Driven) 폴더 구조**를 설명합니다.

## 핵심 분리 규칙

모든 코드는 접근 권한과 역할에 따라 **3가지 도메인**으로 분류됩니다.

| 도메인 | 설명 | 예시 |
|---|---|---|
| `admin` | 관리자 전용 | 방문자 대시보드, 통계 차트 |
| `public` | 일반 사용자 화면 전용 | 이력서, 포트폴리오, 메인 페이지 |
| `common` | 양쪽 모두에서 사용 | API 헬퍼, 타입 정의, UI 컴포넌트 |

---

## 디렉토리 구조도

```text
frontend/src/
├── app/                                    [URL 라우팅 계층 - 페이지 껍데기]
│   ├── page.tsx                            # 메인 랜딩 페이지
│   ├── layout.tsx                          # 루트 레이아웃 (헤더/푸터)
│   ├── loading.tsx                         # 로딩 UI
│   ├── globals.css                         # 전역 CSS
│   ├── resume/                             # /resume 라우트
│   │   ├── page.tsx
│   │   ├── resume-print.css
│   │   └── resume-badge.css
│   ├── portfolio/                          # /portfolio 라우트
│   │   └── [slug]/page.tsx
│   ├── career-detail/                      # /career-detail 라우트
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   └── admin/                              # /admin 라우트 (관리자 전용)
│       └── visitors/page.tsx
│
└── features/                               [기능 집중 계층 - 비즈니스 로직]
    ├── admin/                              [관리자 전용 기능]
    │   ├── api/                            # 방문자 통계 fetch, 추적 훅
    │   │   ├── visitor.ts
    │   │   └── useVisitorTracking.ts
    │   ├── components/                     # 관리자 UI 컴포넌트
    │   │   ├── VisitorAnalyticsDashboard.tsx
    │   │   └── VisitorStats.tsx
    │   └── types/                          # 관리자 전용 타입 (필요시)
    │
    ├── public/                             [일반 사용자 전용 기능]
    │   ├── api/                            # 퍼블릭 데이터 fetch (필요시)
    │   ├── components/                     # 퍼블릭 UI 컴포넌트
    │   │   ├── v1/                         # 이력서 v1 테마
    │   │   │   ├── layout/ (Header, Footer, LayoutV1)
    │   │   │   ├── pages/  (HomePageClientV1, ResumePageClientV1)
    │   │   │   └── sections/ (Hero, Projects, Skills)
    │   │   ├── v2/                         # 이력서 v2 테마
    │   │   │   ├── layout/
    │   │   │   ├── pages/
    │   │   │   └── sections/
    │   │   ├── v3/                         # 이력서 v3 테마
    │   │   ├── CareerDetailPdfDownloadButton.tsx
    │   │   ├── ResumeContentWithDownload.tsx
    │   │   ├── ResumePdfDownloadButton.tsx
    │   │   └── VersionSwitcher.tsx
    │   └── types/                          # 퍼블릭 전용 DTO (필요시)
    │
    └── common/                             [공통 기능]
        ├── api/                            # Strapi API 헬퍼
        │   ├── api.ts                      # fetchAPI, getApiUrl, getStrapiMedia
        │   └── siteSettings.ts             # 사이트 설정 조회
        ├── ui/                             # 범용 UI 컴포넌트
        │   ├── Button.tsx
        │   ├── Card.tsx
        │   ├── InfoItem.tsx
        │   ├── RichTextRenderer.tsx
        │   ├── HashLink.tsx
        │   ├── HashScrollManager.tsx
        │   ├── ThemeProvider.tsx
        │   ├── MaintenanceMode.tsx
        │   └── VisitorTracker.tsx
        ├── utils/                          # 유틸리티 함수
        │   ├── utils.ts                    # getMonthDiff 등
        │   ├── projectCategories.ts
        │   ├── skillCategories.ts
        │   └── useActiveSection.ts         # 스크롤 감지 훅
        └── types/                          # 핵심 엔티티 타입
            ├── project.ts
            ├── company.ts
            ├── profile.ts
            ├── education.ts
            ├── skill.ts
            ├── media.ts
            ├── career-detail.ts
            └── other-experience.ts
```

---

## 백엔드(Strapi)와의 매핑 관계

Strapi는 프레임워크 특성상 `src/api/[collection-name]/` 평면 구조를 유지합니다.
프론트엔드의 `features/` 도메인이 어떤 백엔드 API와 대응되는지 아래 표를 참고하세요.

| 프론트엔드 도메인 | 백엔드 API |
|---|---|
| `features/admin/` | `api/visitor/`, `api/site-setting/` |
| `features/public/` | `api/project/`, `api/company/`, `api/education/`, `api/profile/`, `api/career-detail/`, `api/skill/` |
| `features/common/` | `api/site-setting/` (공유), 공통 유틸리티 |

---

## 새 기능 추가 가이드

새 기능(예: "블로그")을 추가할 때 따라야 할 규칙:

1. **라우트 추가**: `app/blog/page.tsx` 생성
2. **컴포넌트 추가**: `features/public/components/blog/` 폴더 생성 후 UI 구현
3. **타입 추가**: `features/common/types/blog.ts` 에 타입 정의
4. **API 연동**: 기존 `features/common/api/api.ts`의 `fetchAPI()`를 활용하여 데이터 패칭 함수 추가

---

## import 경로 규칙

모든 import는 `@/` 절대경로(alias)를 사용합니다.

```typescript
// ✅ 올바른 사용
import { fetchAPI } from '@/features/common/api/api';
import Button from '@/features/common/ui/Button';
import LayoutV1 from '@/features/public/components/v1/layout/LayoutV1';
import { VisitorAnalyticsDashboard } from '@/features/admin/components/VisitorAnalyticsDashboard';

// ❌ 지양해야 할 사용
import { fetchAPI } from '../../../lib/api';  // 상대경로 X
```
