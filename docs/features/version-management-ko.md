# 🎨 디자인 버전 관리 시스템 (Design Version Management)

포트폴리오 웹사이트는 끊임없이 변하는 디자인 요구사항과 취향에 맞게 **다양한 테마와 UI 버전을 안전하게 유지하고 전환할 수 있는 '버전 스위칭 (Version Switching)' 아키텍처**를 가지고 있습니다.

이 문서는 프론트엔드와 백엔드가 어떻게 동적으로 디자인 버전을 전환하는지, 그리고 새로운 버전을 개발할 때 어떠한 구조를 가져야 하는지 설명합니다.

---

## 1. 아키텍처 개요 (Architecture Overview)

* **프론트엔드 (Next.js 15)**: 각 테마 설정에 종속되지 않도록 컴포넌트들을 `v1`, `v2`, `common` 등으로 명확히 분리하여 유지보수합니다.
* **백엔드 (Strapi CMS)**: `Site Settings` (사이트 설정) 컬렉션에 서버 사이드 구성값을 등록하여, 관리자가 UI 클릭 한 번으로 서비스 중단 없이 실시간 버전 전환을 할 수 있도록 합니다.

## 2. 프론트엔드 폴더 구조 (Directory Structure)

디자인 컴포넌트는 오직 자신이 해당하는 버전 폴더에만 격리되어 존재합니다. 공용 컴포넌트만 `common`에 둡니다.

```plaintext
frontend/src/
├── app/                  # Next.js App Router (모든 라우팅 제어)
│   ├── page.tsx          # 동적 버전 분배기 (Controller)
│   ├── resume/page.tsx   
│   └── career-detail/page.tsx 
│
└── components/           # UI 컴포넌트들
    ├── common/           # 버전 관계 없이 언제나 사용되는 버튼/검색/유틸 컴포넌트
    ├── v1/               # 첫 번째 버전 (클래식/라이트 위주) 디자인 컴포넌트
    │   ├── layout/       # v1 전용 Header, Footer
    │   ├── pages/        # v1 전용 조립된 단일 페이지 (HomePageClientV1 등)
    │   └── sections/     # v1 전용 섹션들 (Hero, Skills, Projects)
    │
    └── v2/               # 두 번째 버전 (모던/다크/파티클 위주) 디자인 컴포넌트
        ├── layout/       
        ├── pages/        
        ├── sections/     
        └── styles/       # v2 전용 css 시스템 (globals-v2.css)
```

## 3. 작동 원리 (How it works)

메인 라우터인 `app/page.tsx` 등은 일반적인 페이지 마크업(HTML)을 직접 가지지 않습니다. 오직 백엔드 환경 설정에 접근해 데이터를 로드하고 버전 지시자를 가져오는 **"순수한 컨트롤러"**로써 동작합니다.

### 분배기 역할 (Controller Pattern)
```tsx
// frontend/src/app/page.tsx 예시
import { getSiteSettings } from '@/lib/siteSettings';
import HomePageClientV1 from '@/components/v1/pages/HomePageClientV1';
import HomePageClientV2 from '@/components/v2/pages/HomePageClientV2';

export default async function Home() {
  const settings = await getSiteSettings();
  const isV2 = settings.portfolioVersion === 'v2';

  if (isV2) {
    return <HomePageClientV2 profile={...} />;
  }
  
  return <HomePageClientV1 profile={...} />;
}
```
서버사이드에서 버전을 감지하고 조건부로 클라이언트 렌더링 파일 묶음을 바꿔치기합니다.

## 4. 백엔드 설정 방법 (Configuration via Strapi)

라이브 서버를 중단하거나 코드를 재배포할 필요 없이 환경을 변경합니다.

1. Strapi 관리자 패널(`http://localhost:1337/admin`)에 로그인합니다.
2. 좌측 메뉴에서 **Content Manager** -> **Site Settings** (단일 타입)에 들어갑니다.
3. **`Portfolio Version`** 필드를 찾아 원하는 버전 문자열을 입력합니다.
   * `v1` 입력 시: 클래식 디자인 송출
   * `v2` 입력 시: 모던 파티클 디자인 송출
4. 저장(Save) 후, 프론트엔드 브라우저를 새로고침하면 전체 레이아웃과 CSS가 즉각 변경됩니다.

## 5. 지속 가능한 디자인 확장 가이드

미래에 **`v3`** 등의 새로운 디자인을 추가하고 싶다면 기존 V1/V2 코드를 수정하거나 덮어쓰지 마세요.
1. `src/components/v3/` 폴더를 새로 만듭니다.
2. `v3` 폴더 내부에 `pages`, `layout`, `sections`를 만들고 새로운 CSS와 구성을 구축합니다.
3. `app/` 라우트 페이지 파일들(`page.tsx` 등)의 if/else 분기문에 `portfolioVersion === 'v3'` 조건을 하나만 추가해줍니다.
4. 언제든지 특정 컴포넌트 디자인이 질리거나 마음에 들지 않아도 손상 없이 다른 버전으로 "롤백" 가능합니다.
