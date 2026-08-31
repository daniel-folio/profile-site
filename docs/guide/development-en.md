# 💻 Development & Operations Guide

### 🌟 **Professional Development Showcase**

This portfolio demonstrates expertise in:
- **Full-stack Development** - Comprehensive knowledge of modern JavaScript/TypeScript ecosystem and best practices
- **System Architecture** - Scalable, maintainable code structure adhering to microservices principles
- **UI/UX Design** - User-centered design approach with accessibility (WCAG) and performance considerations
- **Performance Optimization** - Real-world implementation of advanced rendering optimization techniques
- **Security Implementation** - Industry-standard security practices, sanitization, and vulnerability prevention
- **DevOps & Deployment** - Automated CI/CD workflows and multi-cloud dual redundant infrastructure management
- **Documentation & Communication** - Comprehensive technical documentation and architecture knowledge sharing

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd portfolio
```

### 2. Backend Setup (Strapi CMS)

```bash
cd backend
npm install
npm run develop
```

Open [http://localhost:1337/admin](http://localhost:1337/admin) in your browser to create an administrator account.

### 3. Frontend Setup (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Create a `.env.local` file and add the following:

```env
# Primary backend URL (local)
NEXT_PUBLIC_STRAPI_API_URL_PRIMARY=http://localhost:1337
```

Open [http://localhost:3000](http://localhost:3000) in your browser to verify.

---

## 🔐 Production Environment Variables (Vercel)

**⚠️ IMPORTANT**: For production deployment, environment variables must be configured in Vercel Dashboard:

```env
# Primary backend URL (required in production)
NEXT_PUBLIC_STRAPI_API_URL_PRIMARY=https://your-backend-url.render.com

# Optional: Vercel Preview/Dev specific URL
NEXT_PUBLIC_STRAPI_URL=https://your-preview-backend.example.com

# Optional: API token when calling Strapi from Vercel
# STRAPI_API_TOKEN=vercel_strapi_api_token
```

### Security Setup Rules
1. **Vercel Dashboard** → **Project** → **Settings** → **Environment Variables**
2. **Administrator Password**: Manage via Strapi Admin `Site Settings`
3. **Preview/Test**: Use environment-specific backend URLs
4. **Never hardcode secrets**: Do not put secret keys directly in repository code.

📖 **[Detailed Deployment Guide](./DEPLOYMENT.md)** - Complete setup instructions for Vercel, Render, and environment variables

---

## 🌐 Deployment Architecture

This project features a dual-architecture setup (Main A and Development/Backup B) designed for stability and high availability. This structure overcomes limitations of free hosting plans (Render, etc.) such as the 750-hour monthly limit and 15-minute inactivity sleep mode.

- **Site A (Main):** The primary site accessed by actual users (GitHub A account, Vercel A account, Render A account)
  - Operates only the production environment to keep monthly usage under 720 hours (24 hours x 30 days)
  - Uses monitoring tools like UptimeRobot to ping the server every 14 minutes, preventing 15-minute sleep mode and ensuring 24/7 availability

- **Site B (Development & Backup):** Development and backup site for when Main Site A fails (GitHub B account, Vercel B account, Render B account)
  - Operates both development (`Preview/dev`) and production (`Production`) environments
  - Serves as backup for Main Site A and is primarily used for development and testing

### Frontend (Vercel)
- **A-Frontend (Main):** Operates only `Production` environment
- **B-Frontend (Development/Backup):** Operates both `Production` and `Preview(dev)` environments

### Backend (Render)
- **A-Backend (Main):** Operates only `Production` environment
- **B-Backend (Development/Backup):** Operates both `Production` and `Preview(dev)` environments

### 🧩 Infrastructure Overview (Summary)

- **Frontend**: Vercel (Automatic Next.js deployments)
- **Backend**: Render (Strapi CMS)
- **Database**: Neon (PostgreSQL, Serverless)
- **Image CDN/Storage**: Cloudinary
- **Auto-Heal & Wake-up System**:
    - **1st Line Defense (Intelligent)**: Embedded `Memory Monitor` proactively restarts the server if memory threshold (450MB) is exceeded.
    - **2nd Line Defense (Failsafe)**: A GitHub Actions bot (`server-wakeup-bot`) checks the server every 10 minutes and force-restarts if unresponsive.
      - ***Auto-Heal Trigger***: GitHub Actions (Forced wake-up using Puppeteer)
      - ***Wake-up Trigger (optional)***: cron-job.org (periodic GET to wake server)
      - ***Wake-up Monitoring (optional)***: UptimeRobot (HEAD request every ~14 min)
    - **Real-time Alerting**: `Slack` integration provides instant notifications for high memory events and server downtime.

For Neon, set `DATABASE_URL` in Render environment variables. Example: `postgres://<user>:<password>@<neon-host>/<db>?sslmode=require`.

---

## 💓 Health Check / Wake-up Configuration

To handle server crashes and spin-downs on Render's free tier, this project uses GitHub Actions and dedicated health check endpoints.

- **1. Intelligent Self-Heal (Memory Monitor)**
    - **Role**: Strapi application checks its own memory usage every 5 minutes. If it exceeds 450MB, it **proactively** restarts itself.
    - **Alerting**: Sends "Memory usage high" notification to `Slack`.
    - **Implementation**: `backend/src/config/memory-monitor.ts`

- **2. Auto-Heal Bot (GitHub Actions)**
    - **Role**: Failsafe when the server becomes unresponsive. Every 10 minutes, Puppeteer accesses the server to force wake-up.
    - **Alerting**: Sends "Server Down Detected" notification to `Slack` if unreachable.
    - **Repository**: `server-wakeup-bot`

- **3. Dedicated Health Check Endpoints**
    - Custom routes registered to distinguish monitoring tools.
    - **GitHub Actions Bot**: `GET /git-wakeupbot`
    - **UptimeRobot (Optional)**: `GET /uptimerobot`
    - **Manual Restart**: `GET /restart-server?secret=<SECRET_KEY>`

---

## 🔄 High Availability & Automated Failover

### 1. Automated Git Sync (B → A)

To balance development convenience and production safety, the main development repository (B) and deployment repository (A) are isolated.

- **Mechanism:** When code is pushed to `main` branch of repository B, GitHub Actions automatically mirrors all commits to repository A using SSH Deploy Keys.
- **Benefits:** Developers focus solely on repository B, while deployment occurs via repository A without exposing administrative write permissions.

### 2. Serverside Failover

In case the primary backend server (A-Production) suffers an outage, automated serverside failover logic maintains continuous service delivery.

- **Mechanism:**
  1. Main frontend (A-Production) attempts to query Main Backend (A-Production) first.
  2. If the request fails, `lib/api.ts` automatically re-routes identical API requests to Backup Backend (B-Production).
- **Scope:** Controlled via Vercel environment variable `FAILOVER_MODE_ENABLED`, activated **only in A-Production**.

---

## 🔧 Environment Variables Guide

### Vercel (A-Frontend - Main)

- `NEXT_PUBLIC_STRAPI_API_URL_PRIMARY`: Main backend URL
  - Production: A-Production Backend URL
- `FAILOVER_MODE_ENABLED`: Failover toggle switch
  - Production: `true`
- `(Optional) NEXT_PUBLIC_STRAPI_API_URL_SECONDARY`: Backup backend URL
  - Recommended (Production): B-Production Backend URL
- `STRAPI_API_TOKEN`: API Token matching environment
  - Production: A-Production Backend Token

### Vercel (B-Frontend - Dev/Backup)

- `NEXT_PUBLIC_STRAPI_API_URL_PRIMARY`: Primary backend URL
  - Production: B-Production Backend URL
  - Preview(dev): B-Development Backend URL
- `NEXT_PUBLIC_STRAPI_API_URL_SECONDARY`: (Not set)
- `FAILOVER_MODE_ENABLED`: (Not set or `false`)

### Render (A-Backend & B-Backend)
- Configure `DATABASE_URL`, `JWT_SECRET`, `ADMIN_JWT_SECRET`, `CLOUDINARY_URL` according to environment settings.

---

## 📁 Project Structure & Implemented Features

```
portfolio/
├── frontend/                    # Next.js Frontend Application
│   ├── src/
│   │   ├── app/                # Next.js App Router Pages
│   │   │   ├── career-detail/  # Career Details Page
│   │   │   ├── portfolio/      # Project Detail Pages
│   │   │   ├── resume/         # Resume Page
│   │   │   └── admin/          # Admin Visitor Dashboard
│   │   ├── features/           # Feature Modules & UI Components
│   │   ├── lib/                # API Client & Utility Functions
│   │   └── types/              # TypeScript Type Definitions
│   ├── public/                 # Static Assets
│   └── package.json
├── backend/                    # Strapi Backend CMS
│   ├── src/
│   │   └── api/               # Content Types & Custom Controllers
│   ├── config/                # Strapi Configuration
│   └── package.json
└── README.md
```

### Key Features Summary
- **Homepage (`/`)**: Profile bio, skills grid, featured case studies, and full project portfolio
- **Resume Page (`/resume`)**: Full interactive resume with client-side PDF download
- **Career Details (`/career-detail`)**: Granular project-by-project career breakdown with PDF export
- **Visitor Analytics Dashboard (`/admin/visitors`)**: Real-time traffic analytics and visitor tracking

---

## 🎛️ Site Settings Configuration

Centralized configuration management through Strapi Admin Panel single collection `Site Settings`.

- **`adminPassword`**: Password required for accessing Visitor Analytics Dashboard (`/admin/visitors`)
- **`enableVisitorTracking`**: Master switch to enable/disable visitor tracking (`true`/`false`)
- **`siteName`**: Website title for browser tab and SEO meta title
- **`siteDescription`**: Meta description for search engines and social media previews
- **`siteUsed`**: Global accessibility toggle (`false` displays instant maintenance screen)
- **`maxVisitorsPerDay`**: Daily traffic limit to prevent server overload

---

## 📊 Data Models

### Profile
- Name, title, email, phone, location
- Rich Text bio, profile image, social links, resume file
- Headline, main bio

### Skill
- Name, category, proficiency (1-5)
- Icon, description, display order, visibility flags

### Project
- Title, slug, short & full descriptions
- Thumbnail, screenshot gallery, technologies used
- Project type, status, date range, URLs, company link, featured order

### Company
- Company name, logo, description, location, website, industry

### Education
- Institution, field of study, degree, date range, GPA, description

### CareerDetail
- Project-specific experience details, role, responsibilities, solutions, metrics

### OtherExperience
- Extra activities, certifications, courses

### BlogPost / BlogCategory
- Blog post & category schemas (backend prepared)

---

## 🔗 socialLinks Configuration Guide

**The `socialLinks` field allows entering various social media links in JSON format.**

#### Supported Social Media Keys
- github: GitHub
- githubBlog (or github_blog, githubio): GitHub Blog (GitHub Pages)
- x: X (Twitter)
- linkedin: LinkedIn
- instagram: Instagram
- facebook: Facebook
- youtube: YouTube
- blog: Blogger / Personal Blog
- velog: Velog
- tistory: Tistory
- notion: Notion
- medium: Medium
- website: Personal Website

#### Input Example
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

- Icons are rendered in the exact order keys are written in JSON.
- Email is entered in Profile's dedicated `email` field.

---

## 📊 Data Visibility & Management Tips

### Profile Visibility Fields
- **showProfileImage**: Toggle profile image on screen (`true`/`false`)
- **showPhone**: Toggle phone number display (`true`/`false`)
- **resumeDownloadEnabled**: Toggle Resume PDF download button (`true`/`false`)
- **careerDetailDownloadEnabled**: Toggle Career Detail PDF download button (`true`/`false`)

### Skill Visibility & Order
- **`isPublic`**: Show skill on **Resume & Resume PDF** (`true`/`false`).
- **`visible`**: Show skill on **Home screen** (`true`/`false`).
- **`order`**: Display order within category (lower = first).

### Project Visibility & Order
- **`visible`**: Global toggle to hide project everywhere.
- **`isBasicShow`**: Default visibility on Resume (`false` folds into 'Show More').
- **`teamType`**: Categorizes project into Team vs Personal section on Resume.
- **`featured`**: Highlight project in Featured section on Home.
- **`order`**: Display order on Resume.
- **`featuredOrder`**: Display order in Featured section on Home.

### Company & CareerDetail
- **`order`**: Display order on Resume.
- **`isBasicShow`**: Fold company into 'Show More' on Resume if `false`.

---

## 🌐 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Configure environment variables (`NEXT_PUBLIC_STRAPI_API_URL_PRIMARY`, etc.)

### Backend (Render)
1. Connect GitHub repository to Render
2. Configure environment variables (`DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_URL`, etc.)

---

## 📝 License & Contributing

### License
MIT License

### Contributing
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contact
Project Inquiries: daniel.han.developer@gmail.com

---

## 💡 Free Server Environment Notice & User Tips

This project can operate in free server environments (Vercel, Render, etc.). **Initial connections may experience cold-start delays up to 1 minute.**

#### User Notification Examples
- **Loading Spinner + Notice**: `Waking up the server. Due to free tier hosting, initial connection may take up to 1 minute. Please wait!`
- **Top/Bottom Banner Notice**: `⚡️ Notice: Running on a free server environment. Initial load may take up to 1 minute.`
- **FAQ / About Notice**: `Initial connection may take up to 1 minute due to server sleep cycles.`
