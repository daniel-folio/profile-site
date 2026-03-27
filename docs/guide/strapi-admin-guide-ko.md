# 📋 Strapi 어드민 데이터 입력 가이드

> 이 문서를 Strapi 어드민 탭 옆에 열어두고 데이터를 입력할 때 참고하세요.

---

## 📌 공통 규칙: order 필드

이 포트폴리오에는 **order 필드가 2종류** 존재합니다.

| order 종류 | 해당 컬렉션 | 설명 |
|---|---|---|
| **`order`** | Project, Skill, Education, Company, OtherExperience, CareerDetail | 각 목록 내 기본 표시 순서 |
| **`featuredOrder`** | Project | `featured=TRUE`인 프로젝트끼리의 홈화면 Featured 섹션 순서 |

> `order`가 **낮을수록 앞(위)에 표시**됩니다. 비워두면 가장 나중에 표시됩니다.

---

## 👤 Profile (프로필) — 단일 항목

| 필드명 | 표시 위치 | 역할 |
|---|---|---|
| `name` | 홈·이력서 | 이름 |
| `title` | 홈·이력서 | 직함 (예: Data Engineer) |
| `headline` | 홈화면 Hero | 한 줄 소개 문구 |
| `mainBio` | 홈화면 About | 메인 화면용 자기소개 |
| `resumeBio` | 이력서 소개 | 이력서 '소개(Introduce)' 섹션 |
| `profileImage` | 이력서 | 프로필 사진 파일 |
| `showProfileImage` | 이력서 | `FALSE` = 이력서에서 사진 숨김 |
| `showPhone` | 이력서 | `FALSE` = 이력서에서 전화번호 숨김 |
| `resumeDownloadEnabled` | 이력서 | `TRUE` = 이력서 PDF 다운로드 버튼 표시 |
| `careerDetailDownloadEnabled` | 경력기술서 | `TRUE` = 경력기술서 PDF 다운로드 버튼 표시 |
| `socialLinks` | 홈·이력서 | GitHub/LinkedIn 등 소셜 링크 (JSON 형식) |

---

## 🗂️ 21. Skill (기술 스택)

### 노출 관련 필드

| 필드명 | 역할 |
|---|---|
| `visible` | `FALSE` → 홈·이력서 **어디에도** 표시 안 됨 |
| `isPublic` | `FALSE` → **이력서(Resume)에서만** 숨김. 홈화면은 계속 표시 |

```
visible=TRUE,  isPublic=TRUE  → 홈 ✅  이력서 ✅
visible=TRUE,  isPublic=FALSE → 홈 ✅  이력서 ❌
visible=FALSE, (any)          → 홈 ❌  이력서 ❌
```

### 순서 관련 필드

| 필드명 | 역할 |
|---|---|
| `order` | 같은 카테고리 내 표시 순서 (낮을수록 앞) |

> 카테고리 간 순서는 `frontend/src/lib/skillCategories.ts`에서 관리합니다.

### 전체 필드 요약

| 필드명 | 역할 |
|---|---|
| `name` | 기술 이름 (예: Python, React) |
| `category` | 그룹 분류 (`skillCategories.ts`에서 목록 관리) |
| `proficiency` | 숙련도 1~5 (현재 화면 미표시, 내부 관리용) |
| `icon` | 홈화면 스킬 카드 로고 이미지 |
| `description` | 메모 (화면 미표시) |

---

## 🗂️ 22. Project (프로젝트)

### 노출 및 분류 관련 필드

| 필드명 | 역할 |
|---|---|
| `visible` | `FALSE` → 홈·이력서 **어디에도** 표시 안 됨 (임시 숨김용) |
| `isBasicShow` | `FALSE` → 이력서 화면에서 기본으로 숨겨지며, 하단 **'더보기' 버튼**을 눌러야 펼쳐져 보임 |
| `featured` | `TRUE` → 홈화면 상단 **Featured Projects** 섹션에 추가 노출 |
| `Company` | **선택 시** 이력서 상 해당 경력(회사) 하위에 종속되어 표시됨. |
| `teamType` | `Company`가 비어있을 때 작동. `Team` 또는 `Personal` 값을 지정하여 이력서 **팀 프로젝트**와 **개인 프로젝트** 섹션으로 자동 분류 분리 |

### 순서 관련 필드 2가지

| 필드명 | 적용 화면 | 적용 위치 | 역할 |
|---|---|---|---|
| `order` | **이력서** | 경력·개인 프로젝트 목록 | 이력서 표시 순서 (낮을수록 위) |
| `featuredOrder` | **홈화면만** | 홈 상단 대표 카드 구역 | `featured=TRUE`인 항목끼리의 대표 카드 순서 |

> **홈화면 프로젝트 섹션 구조:**
> ```
> 홈화면(/)
> ├── 🌟 대표 프로젝트 (큰 카드, 상단) ← featured=TRUE + featuredOrder 로 제어
> └── 📋 전체 프로젝트 목록 (작은 카드) ← 모든 프로젝트가 order 순서로 표시
> ```
> `featured`, `featuredOrder`는 **이력서에 전혀 영향을 주지 않습니다.**

### 전체 필드 요약

| 필드명 | 표시 위치 | 역할 |
|---|---|---|
| `title` | 홈·이력서·상세 | 프로젝트 이름 |
| `slug` | URL | `/portfolio/slug`. title 입력 시 자동 생성 |
| `projectType` | 홈 필터 탭·이력서 | 분류 태그 (`projectCategories.ts`에서 관리) |
| `projectStatus` | 이력서·상세 | 진행 상태 |
| `startDate` | 이력서·상세 | `YYYY-MM` 형식 (예: `2024-03`) |
| `endDate` | 이력서·상세 | `YYYY-MM` 형식. **비워두면 '현재'로 표시** |
| `thumbnailImage` | 홈 카드 | 대표 썸네일 이미지 |
| `images` | 상세 페이지 | 스크린샷 갤러리 |
| `shortDescription` | 홈 카드·이력서 | 요약 설명 (1~3줄 권장) |
| `fullDescription` | 상세 페이지 | 전체 본문 설명 |
| `githubUrl` | 상세 페이지 | GitHub 버튼 링크. **비워두면 버튼 미표시** |
| `liveUrl` | 상세 페이지 | Live Demo 버튼 링크. **비워두면 버튼 미표시** |
| `teamType` | 이력서 | `Team`/`Personal`. 이력서 팀/개인 프로젝트 분류용 (회사 소속 시 무시됨) |
| `isBasicShow` | 이력서 | 체크 해제 시 이력서 화면에서 '더보기' 안에 숨겨짐 |
| `Company` | 이력서 | 회사 프로젝트면 연결. 비워두면 `teamType`에 따라 자동 분류 |
| `Technologies` | 이력서·상세 | 사용 기술 태그 |

---

## 🗂️ 20. Company (경력)

### 노출 및 순서 관련 필드

| 필드명 | 역할 |
|---|---|
| `isBasicShow` | `FALSE` → 이력서 화면에서 기본으로 숨겨지며, 하단 **'더보기' 버튼**을 눌러야 펼쳐져 보임 |
| `order` | 이력서 경력 목록 표시 순서 (낮을수록 위) |
| `startDate` / `endDate` | `order` 미입력 시 최신 날짜 우선 자동 정렬 |

### 전체 필드 요약

| 필드명 | 역할 |
|---|---|
| `company` | 회사명 |
| `position` | 직책 |
| `employmentType` | 고용 형태 (Full-time / Part-time / Contract / Freelance) |
| `startDate` / `endDate` | `YYYY-MM` 형식. endDate 비워두면 '현재' 표시 |
| `isCurrent` | `TRUE` = 현재 재직 중 표시 (endDate 대신 활용 가능) |
| `companyLogo` | 회사 로고 이미지 |
| `description` | 이력서 회사 소개 텍스트 |

---

## 🗂️ 10. Education (학력)

### 순서 관련 필드

| 필드명 | 역할 |
|---|---|
| `order` | 이력서 학력 목록 표시 순서 (낮을수록 위) |

### 전체 필드 요약

| 필드명 | 역할 |
|---|---|
| `institution` | 학교명 |
| `field` | 전공 |
| `degree` | 학위 |
| `startDate` / `endDate` | `YYYY-MM` 형식 |
| `logo` | 학교 로고 이미지 |

---

## 🗂️ 11. OtherExperience (기타 경험)

### 노출 관련 필드

| 필드명 | 역할 |
|---|---|
| `visible` | `FALSE` → 이력서 기타 경험 섹션에서 숨김 |

### 순서 관련 필드

| 필드명 | 역할 |
|---|---|
| `order` | 이력서 기타 경험 목록 순서 (낮을수록 위). 비워두면 날짜 내림차순 자동 정렬 |

### 전체 필드 요약

| 필드명 | 역할 |
|---|---|
| `title` | 활동/수료 제목 |
| `category` | `Class` = 교육·수료, `ETC` = 기타 활동 |
| `startDate` / `endDate` | `YYYY-MM` 형식. endDate 비워두면 '현재' 표시 |

---

## 🗂️ 23. CareerDetail (경력기술서)

### 순서 관련 필드

| 필드명 | 역할 |
|---|---|
| `order` | 경력기술서 페이지 내 항목 표시 순서 |

### 전체 필드 요약

| 필드명 | 역할 |
|---|---|
| `project` | 연결할 프로젝트 (필수) |
| `companyName` | 회사명 직접 입력 (Company 컬렉션과 별개) |
| `responsibilities` | 주요 업무 |
| `results` | 성과 |
| `challenges` / `solutions` | 과제 및 해결 방법 |
| `lessonsLearned` | 배운 점 |
| `teamSize` | 팀 규모 (명) |
| `myRole` | 본인 역할 |
| `metrics` | 수치 지표 |

---

## 🔧 카테고리 목록 변경 방법

Strapi 드롭다운 선택지(Enum)는 아래 파일에서 중앙 관리됩니다.

| 변경 대상 | 수정 파일 |
|---|---|
| 스킬 카테고리 | `frontend/src/lib/skillCategories.ts` |
| 프로젝트 타입 | `frontend/src/lib/projectCategories.ts` |

파일 수정 → `npm run dev`(백엔드) 실행 → Strapi 드롭다운 자동 반영
