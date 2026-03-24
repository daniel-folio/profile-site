# 🎨 Design Version Management

This portfolio website utilizes a **Version Switching Architecture**, enabling seamless transitions between diverse UI themes and design versions safely without altering core logic.

This documentation outlines how the frontend and backend dynamically orchestrate design versions, and explains the folder structures required when expanding the app further.

---

## 1. Architecture Overview

* **Frontend (Next.js 15)**: UI components are strictly isolated into highly self-contained directories (`v1`, `v2`, `common`) to avoid unmanageable CSS and element overlap.
* **Backend (Strapi CMS)**: Remote configurations are provided by the `Site Settings` collection, allowing administrators to hot-swap between design architectures globally with zero continuous-deployment wait time.

## 2. Frontend Directory Structure

Each design ecosystem lives only in its explicitly assigned version folder.

```plaintext
frontend/src/
├── app/                  # Next.js App Router (Routing Controllers)
│   ├── page.tsx          # Dynamic Route Dispatcher
│   ├── resume/page.tsx   
│   └── career-detail/page.tsx 
│
└── components/           # Segmented UI Components
    ├── common/           # Layout-agnostic elements (Buttons, Inputs, Utility wrappers)
    ├── v1/               # Version 1 elements (Classic / Light-mode oriented)
    │   ├── layout/       # v1-specific Header & Footer
    │   ├── pages/        # Fully assembled v1 page layouts (e.g. HomePageClientV1)
    │   └── sections/     # v1-specific content blocks (Hero, Skills, Projects)
    │
    └── v2/               # Version 2 elements (Modern / Dark / Particle-motion oriented)
        ├── layout/       
        ├── pages/        
        ├── sections/     
        └── styles/       # Dedicated CSS scoped only to V2 (globals-v2.css)
```

## 3. How it Works (Controller Pattern)

Main route files (e.g., `app/page.tsx`) do practically zero UI rendering. They act as "Pure Controllers" fetching API data and determining which client-side UI chunk block to assign.

```tsx
// Inside frontend/src/app/page.tsx
import { getSiteSettings } from '@/lib/siteSettings';
import HomePageClientV1 from '@/components/v1/pages/HomePageClientV1';
import HomePageClientV2 from '@/components/v2/pages/HomePageClientV2';

export default async function Home() {
  const settings = await getSiteSettings();
  const isV2 = settings.portfolioVersion === 'v2'; // Read from server dynamically

  if (isV2) {
    return <HomePageClientV2 profile={...} />;
  }
  
  return <HomePageClientV1 profile={...} />;
}
```

## 4. Backend Configuration via Strapi

You can toggle the whole site's look without redeploying code.

1. Log into the Strapi Admin Panel (`http://localhost:1337/admin`).
2. Navigate to **Content Manager** -> **Site Settings** (Single Type).
3. Find the **`Portfolio Version`** field and enter your desired version key.
   * `v1` : Triggers the Classic UI.
   * `v2` : Triggers the Modern Particle UI.
4. Click **Save**. Refresh the frontend website to see an instant layout mutation.

## 5. Extensions & Future Scalability 

If you decide to develop a **`v3`** or an entirely new avant-garde layout, **do not overwrite existing V1/V2 code**.
1. Create a pristine `src/components/v3/` directory structure.
2. Build new `pages`, `layout`, and `styles` isolated in the V3 boundary.
3. Go to the `app/` controller routes and add an `else if (portfolioVersion === 'v3')` condition.
4. This ensures previous layouts remain robust. No regressions occur, and a safe "rollback" mechanism is effectively guaranteed at all times.
