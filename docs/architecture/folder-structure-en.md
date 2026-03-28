# Frontend Folder Structure Guide

This document explains the **Feature-Driven folder structure** of the frontend (Next.js).

## Core Separation Rules

All code is categorized into **3 domains** based on access permissions and roles.

| Domain | Description | Examples |
|---|---|---|
| `admin` | Admin only | Visitor dashboard, statistical charts |
| `public` | General user interface | Resume, portfolio, main landing page |
| `common` | Used in both areas | API helpers, type definitions, UI components |

---

## Directory Structure Overview

```text
frontend/src/
├── app/                                    [URL Routing Layer - Page Shells]
│   ├── page.tsx                            # Main landing page
│   ├── layout.tsx                          # Root layout (Header/Footer)
│   ├── loading.tsx                         # Loading UI
│   ├── globals.css                         # Global CSS
│   ├── resume/                             # /resume route
│   │   ├── page.tsx
│   │   ├── resume-print.css
│   │   └── resume-badge.css
│   ├── portfolio/                          # /portfolio route
│   │   └── [slug]/page.tsx
│   ├── career-detail/                      # /career-detail route
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   └── admin/                              # /admin route (Admin only)
│       └── visitors/page.tsx
│
└── features/                               [Feature Focus Layer - Business Logic]
    ├── admin/                              [Admin-only features]
    │   ├── api/                            # Visitor stats fetch, tracking hooks
    │   │   ├── visitor.ts
    │   │   └── useVisitorTracking.ts
    │   ├── components/                     # Admin UI components
    │   │   ├── VisitorAnalyticsDashboard.tsx
    │   │   └── VisitorStats.tsx
    │   └── types/                          # Admin specific types (if needed)
    │
    ├── public/                             [General user features]
    │   ├── api/                            # Public data fetching (if needed)
    │   ├── components/                     # Public UI components
    │   │   ├── v1/                         # Resume v1 theme
    │   │   │   ├── layout/       (Header, Footer, LayoutV1)
    │   │   │   ├── pages/        (HomePageClientV1, ResumePageClientV1)
    │   │   │   └── sections/     (Hero, Projects, Skills)
    │   │   ├── v2/                         # Resume v2 theme
    │   │   │   ├── layout/
    │   │   │   ├── pages/
    │   │   │   └── sections/
    │   │   ├── v3/                         # Resume v3 theme
    │   │   ├── CareerDetailPdfDownloadButton.tsx
    │   │   ├── ResumeContentWithDownload.tsx
    │   │   ├── ResumePdfDownloadButton.tsx
    │   │   └── VersionSwitcher.tsx
    │   └── types/                          # Public specific DTOs (if needed)
    │
    └── common/                             [Common features]
        ├── api/                            # Strapi API helpers
        │   ├── api.ts                      # fetchAPI, getApiUrl, getStrapiMedia
        │   └── siteSettings.ts             # Site settings query
        ├── ui/                             # Universal UI components
        │   ├── Button.tsx
        │   ├── Card.tsx
        │   ├── InfoItem.tsx
        │   ├── RichTextRenderer.tsx
        │   ├── HashLink.tsx
        │   ├── HashScrollManager.tsx
        │   ├── ThemeProvider.tsx
        │   ├── MaintenanceMode.tsx
        │   └── VisitorTracker.tsx
        ├── utils/                          # Utility functions
        │   ├── utils.ts                    # getMonthDiff, etc.
        │   ├── projectCategories.ts
        │   ├── skillCategories.ts
        │   └── useActiveSection.ts         # Scroll detection hook
        └── types/                          # Core entity types
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

## Mapping with Backend (Strapi)

Due to structural characteristics of the Strapi framework, backend APIs must maintain a flat `src/api/[collection-name]/` structure.
Refer to the table below to see how the frontend `features/` domains map to the backend APIs.

| Frontend Domain | Backend API |
|---|---|
| `features/admin/` | `api/visitor/`, `api/site-setting/` |
| `features/public/` | `api/project/`, `api/company/`, `api/education/`, `api/profile/`, `api/career-detail/`, `api/skill/` |
| `features/common/` | `api/site-setting/` (Shared), Common utilities |

---

## Guide for Adding New Features

Follow these rules when adding a new feature (e.g., "Blog"):

1. **Add Route**: Create `app/blog/page.tsx`
2. **Add Components**: Create UI in `features/public/components/blog/`
3. **Add Types**: Define types in `features/common/types/blog.ts`
4. **API Integration**: Add fetching functions using existing `features/common/api/api.ts`'s `fetchAPI()` logic.

---

## Import Path Rules

All imports must use the absolute path alias `@/`.

```typescript
// ✅ Correct usage
import { fetchAPI } from '@/features/common/api/api';
import Button from '@/features/common/ui/Button';
import LayoutV1 from '@/features/public/components/v1/layout/LayoutV1';
import { VisitorAnalyticsDashboard } from '@/features/admin/components/VisitorAnalyticsDashboard';

// ❌ Incorrect usage (Avoid)
import { fetchAPI } from '../../../lib/api';  // No relative paths
```
