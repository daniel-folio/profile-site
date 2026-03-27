# 📋 Strapi Admin Data Entry Guide

> Keep this document open next to your Strapi Admin tab for reference when entering data.

---

## 📌 Common Rule: order field

There are **2 types of order fields** in this portfolio.

| Order Type | Collection | Description |
|---|---|---|
| **`order`** | Project, Skill, Education, Company, OtherExperience, CareerDetail | Default display order within each list |
| **`featuredOrder`** | Project | Order in the Home screen's Featured section among `featured=TRUE` projects |

> **Lower numbers** appear first (at the top). If left blank, items appear at the end.

---

## 👤 Profile — Single Type

| Field | Location | Role |
|---|---|---|
| `name` | Home/Resume | Full Name |
| `title` | Home/Resume | Job Title (e.g., Data Engineer) |
| `headline` | Home Hero | Hero section intro text |
| `mainBio` | Home About | Main bio for the home screen |
| `resumeBio` | Resume Bio | 'Introduce' section on the resume |
| `profileImage` | Resume | Profile picture file |
| `showProfileImage` | Resume | `FALSE` = Hide photo on resume |
| `showPhone` | Resume | `FALSE` = Hide phone number on resume |
| `resumeDownloadEnabled` | Resume | `TRUE` = Show PDF download button |
| `careerDetailDownloadEnabled` | Career Detail | `TRUE` = Show PDF download button |
| `socialLinks` | Home/Resume | GitHub/LinkedIn social links (JSON format) |

---

## 🗂️ 21. Skill

### Visibility Fields

| Field | Role |
|---|---|
| `visible` | `FALSE` → Hidden **everywhere** (Home & Resume) |
| `isPublic` | `FALSE` → Hidden **only on Resume**. Still visible on Home screen. |

```
visible=TRUE,  isPublic=TRUE  → Home ✅  Resume ✅
visible=TRUE,  isPublic=FALSE → Home ✅  Resume ❌
visible=FALSE, (any)          → Home ❌  Resume ❌
```

### Order Field

| Field | Role |
|---|---|
| `order` | Display order within the same category (lower = first) |

> Category order is managed in `frontend/src/lib/skillCategories.ts`.

---

## 🗂️ 22. Project

### Visibility & Categorization Fields

| Field | Role |
|---|---|
| `visible` | `FALSE` → Hidden **everywhere** (Home & Resume) |
| `isBasicShow` | `FALSE` → Hidden by default on Resume; revealed when **'Show More'** is clicked. |
| `featured` | `TRUE` → Also displayed in the top **Featured Projects** section on Home. |
| `Company` | **If selected**, the project appears under that specific work experience on the Resume. |
| `teamType` | Works when `Company` is empty. Set to `Team` or `Personal` to auto-categorize in the Resume. |

### Order Fields (2 types)

| Field | Screen | Location | Role |
|---|---|---|---|
| `order` | **Resume** | Career/Project list | Display order on the resume (lower = top) |
| `featuredOrder` | **Home Only** | Top Featured area | Order among featured projects on the home screen |

> **Home screen Project section structure:**
> ```
> Home Screen (/)
> ├── 🌟 Featured Projects (Large cards, Top) ← Controlled by featured=TRUE + featuredOrder
> └── 📋 All Projects (Small cards) ← All projects displayed by order
> ```
> `featured` and `featuredOrder` **do not affect the Resume.**

---

## 🗂️ 20. Company (Work Experience)

### Visibility & Order Fields

| Field | Role |
|---|---|
| `isBasicShow` | `FALSE` → Hidden by default on Resume; revealed when **'Show More'** is clicked. |
| `order` | Display order on the resume career list (lower = top) |
| `startDate` / `endDate` | Auto-sorts by newest date if `order` is missing |

---

## 🗂️ 21. CareerDetail (In-depth Experience)

| Field | Role |
|---|---|
| `project` | Connected project (Required) |
| `companyName` | Direct company name input (Separate from Company collection) |
| `responsibilities` | Key responsibilities |
| `results` | Key results/achievements |
| `challenges` / `solutions` | Challenges faced and solutions implemented |
| `lessonsLearned` | Key takeaways/lessons learned |
| `teamSize` | Size of the project team |
| `myRole` | Your specific role in the project |
| `metrics` | Quantifiable metrics/KPIs |

---

## 🔧 How to Modify Category Lists

Dropdown options (Enums) in Strapi are managed centrally in these files:

| Target | File |
|---|---|
| Skill Categories | `frontend/src/lib/skillCategories.ts` |
| Project Types | `frontend/src/lib/projectCategories.ts` |

Edit the file → `npm run dev` (Backend) → Strapi dropdowns update automatically.
