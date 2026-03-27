# 💻 Development & Operations Guide

### 🌟 **Professional Development Showcase**

This portfolio demonstrates expertise in:
- **Full-stack Development** - Comprehensive knowledge of modern JavaScript ecosystem and best practices
- **System Architecture** - Scalable, maintainable code structure with microservices principles
- **UI/UX Design** - User-centered design approach with accessibility and performance considerations
- **Performance Optimization** - Real-world implementation of advanced optimization techniques
- **Security Implementation** - Industry-standard security practices and vulnerability prevention
- **DevOps & Deployment** - Modern CI/CD workflows and cloud infrastructure management
- **Documentation & Communication** - Comprehensive technical documentation and knowledge sharing

### 🚀 **Production Deployment & Infrastructure**
- **Frontend Hosting**: Vercel with automatic deployments, edge functions, and global CDN
- **Backend Hosting**: Render with PostgreSQL database, automatic scaling, and health monitoring
- **Image CDN**: Cloudinary for optimized image delivery with global edge locations
- **Domain & SSL**: Custom domain with automatic SSL certificate management and renewal
- **Monitoring**: Real-time uptime monitoring, performance tracking, and alert systems
- **Backup Strategy**: Automated database backups with point-in-time recovery capabilities

### 🧩 Infrastructure Overview (Summary)

- **Frontend**: Vercel (automatic Next.js deployments)
- **Backend**: Render (Strapi CMS)
- **Database**: Neon (PostgreSQL, serverless)
- **Image CDN/Storage**: Cloudinary
- **Auto-Heal & Wake-up System**:
    - **1st Line Defense (Intelligent)**: An embedded `Memory Monitor` proactively restarts the server if the memory threshold is exceeded.
    - **2nd Line Defense (Failsafe)**: A GitHub Actions bot (`server-wakeup-bot`) checks the server every 10 minutes and force-restarts it if unresponsive.
      - ***Auto-Heal Trigger***: GitHub Actions (Forced wake-up using Puppeteer)
      - ***Wake-up Trigger (optional)***: cron-job.org (periodic GET to wake server)
      - ***Wake-up Monitoring (optional)***: UptimeRobot (HEAD request every ~14 min)
    - **Real-time Alerting**: `Slack` integration provides instant notifications for high memory events and server downtime.



For Neon, set `DATABASE_URL` in Render environment variables. Example: `postgres://<user>:<password>@<neon-host>/<db>?sslmode=require`.

### 💓 Health Check / Wake-up Configuration

To handle server crashes and spin-downs on Render's free tier, this project uses GitHub Actions and dedicated health check endpoints.

- **1. Intelligent Self-Heal (Memory Monitor)**
    - **Role**: The Strapi application checks its own memory usage every 5 minutes. If it exceeds a set threshold (450MB), it **proactively** restarts itself. This is the first line of defense against crashes from traffic spikes.
    - **Alerting**: Sends a "Memory usage high" notification to `Slack` upon restarting.
    - **Implementation**: `backend/src/config/memory-monitor.ts`

- **2. Auto-Heal Bot (GitHub Actions)**
    - **Role**: A failsafe for situations where the server becomes unresponsive for any reason (including a failed memory monitor). Every 10 minutes, a Puppeteer headless browser accesses the server to force a wake-up.
    - **Alerting**: Sends a "Server Down Detected" notification to `Slack` if the server is unreachable.
    - **Repository**: `server-wakeup-bot`

- **3. Dedicated Health Check Endpoints**
    - Custom routes registered to clearly distinguish the role of each monitoring tool.
    - **GitHub Actions Bot**: `GET /git-wakeupbot`
    - **UptimeRobot (Optional)**: `GET /uptimerobot`
    - **Manual Restart**: `GET /restart-server?secret=<SECRET_KEY>`

### 📁 **Project Structure & Organization**

```
portfolio/
├── frontend/                    # Next.js Frontend Application
│   ├── src/
│   │   ├── app/                # Next.js App Router Pages
│   │   │   ├── career-detail/  # Career Details Page
│   │   │   ├── portfolio/      # Project Detail Pages
│   │   │   ├── resume/         # Resume Page
│   │   │   └── admin/          # Admin Dashboard
│   │   │       └── visitors/   # Visitor Analytics Dashboard
│   │   ├── components/         # React Components
│   │   │   ├── layout/         # Layout Components
│   │   │   ├── sections/       # Page Section Components
│   │   │   ├── ui/             # Reusable UI Components
│   │   │   └── admin/          # Admin-specific Components
│   │   ├── lib/                # Utility Functions & APIs
│   │   │   ├── api.ts          # API Client
│   │   │   ├── visitor.ts      # Visitor Tracking Logic
│   │   │   └── siteSettings.ts # Site Settings Management
│   │   ├── hooks/              # Custom React Hooks
│   │   └── types/              # TypeScript Type Definitions
│   ├── public/                 # Static Assets
│   └── package.json
├── backend/                    # Strapi Backend CMS
│   ├── src/
│   │   └── api/               # Content Types & APIs
│   │       ├── profile/       # User Profile Data
│   │       ├── skill/         # Technical Skills
│   │       ├── project/       # Portfolio Projects
│   │       ├── company/       # Work Experience
│   │       ├── education/     # Educational Background
│   │       ├── career-detail/ # Detailed Career Information
│   │       ├── visitor/       # Visitor Analytics Data
│   │       └── site-setting/  # Global Site Configuration
│   ├── config/                # Strapi Configuration
│   └── package.json
├── DEPLOYMENT.md              # Deployment Guide
├── VISITOR_TRACKING.md        # Analytics Documentation
└── README.md                  # This File
```

### 🎯 **Implemented Features & Capabilities**

#### **✅ Core Pages & Navigation**
- **Homepage** (`/`) - Profile showcase, skills display, and project portfolio
- **Resume Page** (`/resume`) - Comprehensive resume with PDF download functionality
- **Career Details** (`/career-detail`) - Detailed career information with PDF export
- **Project Details** (`/portfolio/[slug]`) - Individual project case studies and technical details
- **Admin Dashboard** (`/admin/visitors`) - Comprehensive visitor analytics and site management

#### **✅ Advanced UI/UX Features**
- **Adaptive Theme System** - Complete dark/light mode with system preference detection
- **Responsive Design** - Mobile-first approach with perfect tablet and desktop optimization
- **Smooth Animations** - Framer Motion-powered micro-interactions and page transitions
- **Interactive Backgrounds** - Three.js and Vanta.js powered dynamic visual effects
- **Typography Animations** - Dynamic typing effects and text reveal animations
- **Accessibility Compliance** - WCAG 2.1 AA standards with screen reader support

#### **✅ Content Management System**
- **Strapi Admin Panel** - Complete headless CMS with custom controllers and middleware
- **Image Management** - Cloudinary integration with automatic optimization and transformation
- **Rich Content Support** - Markdown, HTML rendering with syntax highlighting
- **SEO Optimization** - Meta tags, Open Graph, Twitter Cards, and structured data
- **API Generation** - Automatic REST API endpoints with custom analytics extensions
- **Content Versioning** - Built-in content history and revision management

#### **✅ Performance & Security**
- **PDF Generation** - Client-side PDF creation for resumes and career documents
- **Code Highlighting** - Syntax highlighting for technical content with highlight.js
- **XSS Protection** - DOMPurify sanitization for all user-generated content
- **Performance Optimization** - Next.js Image optimization, caching strategies, and code splitting
- **Visitor Analytics** - Real-time visitor tracking with comprehensive dashboard ([Documentation](./VISITOR_TRACKING.md))
- **Security Headers** - CORS, CSP, and other security best practices implementation
- **Selective Exposure (Show More)** - Items can be folded using `isBasicShow` with smooth animations
- **Intelligent Categorization** - Automatic grouping of Team/Personal projects using `teamType`


### 🎛️ **Site Settings Configuration**

The site settings system provides centralized configuration management through Strapi Admin Panel. All settings are dynamically applied without requiring code changes or server restarts, enabling real-time site management.

#### **Available Settings**

##### **🔐 adminPassword (Administrator Password)**
- **Description**: Admin authentication password for visitor analytics dashboard access
- **Type**: String (Plain text, 6-50 characters)
- **Default**: Set during initial setup
- **Usage**: Authentication for `/admin/visitors` page access
- **Security**: Visible as plain text in Strapi Admin (due to UI limitations)
- **Best Practice**: Use strong passwords and restrict Strapi Admin access

##### **📊 enableVisitorTracking (Visitor Tracking Toggle)**
- **Description**: Enable or disable visitor data collection and analytics system
- **Type**: Boolean
- **Default**: `true` (enabled)
- **Effect**: When set to `false`, immediately stops all visitor tracking and data collection
- **Application**: Applied in real-time without server restart
- **Privacy**: Respects user privacy preferences and GDPR compliance

##### **🏷️ siteName (Site Title)**
- **Description**: Site title displayed in browser tabs, meta tags, and social media shares
- **Type**: String (maximum 100 characters)
- **Default**: "Developer Portfolio"
- **Usage**: SEO optimization, browser tab titles, social media previews
- **Impact**: Affects search engine rankings and user experience

##### **📝 siteDescription (Site Meta Description)**
- **Description**: SEO meta description for search engines and social media
- **Type**: Text (maximum 500 characters)
- **Default**: "Personal portfolio website"
- **Usage**: Google search results, social media share descriptions
- **SEO**: Critical for search engine optimization and click-through rates

##### **🌐 siteUsed (Site Accessibility Control)**
- **Description**: Master switch for site accessibility (`true` = accessible, `false` = blocked)
- **Type**: Boolean
- **Default**: `true` (accessible)
- **Effect**: When `false`, displays maintenance screen to all visitors
- **Use Cases**: Site maintenance, updates, emergency blocking
- **Warning**: Blocks admin access as well when disabled

##### **👥 maxVisitorsPerDay (Daily Visitor Limit)**
- **Description**: Daily visitor limit for traffic control and server load management
- **Type**: Integer (range: 100 - 1,000,000)
- **Default**: 10,000
- **Purpose**: Server load management, traffic monitoring, resource optimization
- **Implementation**: Used for analytics and potential rate limiting

#### **Configuration Guide**

1. **Access Strapi Admin Panel**
   ```
   http://localhost:1337/admin
   ```

2. **Navigate to Settings**
   - Go to **Content Manager** → **Site Settings**

3. **Update Values**
   - Modify desired setting values
   - Click **Save** to apply changes

4. **Real-time Application**
   - Settings apply immediately without server restart
   - Frontend reflects changes on next page load

#### **Important Notes**
- **adminPassword**: Stored as plain text but masked in admin UI
- **siteUsed**: When `false`, blocks all access including admin
- **enableVisitorTracking**: Consider privacy policies when configuring
- **isBasicShow**: Controls default visibility on Resume for projects and companies
- **teamType**: Determines Team vs Personal section for projects on Resume


### 🚀 **Getting Started**

#### **Prerequisites**
- Node.js 18+ and npm
- Git for version control
- Code editor (VS Code recommended)

#### **Installation & Setup**

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/portfolio.git
   cd portfolio
   ```

2. **Backend Setup (Strapi)**
   ```bash
   cd backend
   npm install
   npm run develop
   ```

3. **Frontend Setup (Next.js)**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Environment Configuration**
   
   **Frontend (.env.local):**
   ```env
   # Primary backend URL (local)
   NEXT_PUBLIC_STRAPI_API_URL_PRIMARY=http://localhost:1337
   # Optional: Vercel Preview/Dev specific URL
   # NEXT_PUBLIC_STRAPI_URL=https://your-preview-backend.example.com
   # Optional: Secondary backend for failover
   # NEXT_PUBLIC_STRAPI_API_URL_SECONDARY=https://your-backup-backend.example.com
   ```

   **Backend (.env):**
   ```env
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   ADMIN_JWT_SECRET=your_admin_jwt_secret
   CLOUDINARY_URL=your_cloudinary_url
   ```

#### **Production Environment Variables (Vercel)**

**⚠️ IMPORTANT**: For production deployment, you must set environment variables in Vercel Dashboard:

```env
# Primary backend URL (required in production)
NEXT_PUBLIC_STRAPI_API_URL_PRIMARY=https://your-backend-url.render.com

# Optional: Vercel Preview/Dev specific URL
NEXT_PUBLIC_STRAPI_URL=https://your-preview-backend.example.com

# Optional: API token when calling Strapi from Vercel
# STRAPI_API_TOKEN=vercel_strapi_api_token
```

#### **Security Setup**
1. **Vercel Dashboard** → **Project** → **Settings** → **Environment Variables**
2. **Production**: Set strong password for production environment
3. **Preview/Test**: Set different password for preview deployments
4. **Never use hardcoded passwords** - the app will show an error if not set

📖 **[Detailed Deployment Guide](./DEPLOYMENT.md)** - Complete setup instructions for Vercel, Render, and environment variables

### 🌐 **Deployment Architecture**

This project features a dual-architecture setup (Main A and Development/Backup B) designed for stability and high availability. This structure overcomes the limitations of free hosting plans (Render, etc.) such as the 750-hour monthly limit and 15-minute inactivity sleep mode.

- **Site A (Main):** The primary site accessed by actual users (GitHub A account, Vercel A account, Render A account)
  - Operates only the production environment to keep monthly usage under 720 hours (24 hours x 30 days)
  - Uses monitoring tools like UptimeRobot to ping the server every 14 minutes, preventing 15-minute sleep mode and ensuring 24/7 availability

- **Site B (Development & Backup):** Development and backup site for when Main Site A fails (GitHub B account, Vercel B account, Render B account)
  - Operates both development (`Preview/dev`) and production (`Production`) environments
  - Serves as backup for Main Site A and is primarily used for development and testing

#### **Frontend (Vercel)**
- **A-Frontend (Main):** Operates only `Production` environment
- **B-Frontend (Development/Backup):** Operates both `Production` and `Preview(dev)` environments

#### **Backend (Render)**
- **A-Backend (Main):** Operates only `Production` environment
- **B-Backend (Development/Backup):** Operates both `Production` and `Preview(dev)` environments

### 📊 Data Visibility & Management Tips

#### Skill
- **`isPublic`**: Whether to show the skill on the **Resume and Resume PDF** (`true`/`false`).
  - If `false`, it's hidden from the resume but still visible on the Home screen.
- **`visible`**: Whether to show the skill on the **Home screen** (`true`/`false`).
  - If `false`, it's hidden from the Home screen but still visible on the Resume.
- **`order`**: Display order within its category (lower = first).

#### Project
- **`visible`**: Global toggle to hide the project **everywhere** (temporary disabling).
- **`isBasicShow`**: Default visibility on **Resume** (`false` folds it into 'Show More').
- **`teamType`**: Categorizes the project into **Team** vs **Personal** section on Resume (applied when not linked to a Company).
- **`featured`**: Whether to show as a large card in the **Featured section** on Home.
- **`order`**: Display order on the **Resume** project lists.
- **`featuredOrder`**: Display order in the **Featured section** on Home.

#### Company (Career)
- **`order`**: Display order on the **Resume** career list.
- **`isBasicShow`**: Default visibility on **Resume** (`false` folds it into 'Show More').


#### **Adding New Features**
1. Backend: Create Content Type in Strapi Admin Panel
2. Frontend: Define TypeScript types and create components
3. API Integration: Add functions to `src/lib/api.ts`

#### **Styling Guidelines**
- Use Tailwind CSS for consistent styling
- Component-based styling approach
- Consider responsive design principles
- Support dark mode theming

#### **Performance Optimization**
- Utilize Next.js Image component for optimized images
- Leverage Static Site Generation (SSG)
- Implement API response caching
- Apply code splitting strategies

#### **Animation Implementation**
- Use Framer Motion for smooth animations
- Implement Three.js/Vanta background effects
- Apply CSS animations where appropriate

### 📝 **License**

MIT License

### 🤝 **Contributing**

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📞 **Contact**

For project inquiries, please create an issue.
daniel.han.developer@gmail.com

---

*This project is implemented as a complete portfolio system and will continue to evolve through ongoing improvements and expansions.*

### **Free Server Environment Notice & User Tips**

This project can be operated in free server environments (Vercel, Render, etc.). In such cases, **the initial connection may be slow due to server sleep/wake-up cycles.**

#### **User Notification Examples**

- **Loading Spinner/Loader + Notification Message**
  - Example: `Waking up the server. Due to the free server environment, initial connection may take up to 1 minute. Please wait!`
- **Top/Bottom Banner Notice**
  - Example: `⚡️ Notice: This site runs on a free server environment and may load slowly on first visit.`
- **FAQ/About Page Notice**
  - Example: `Due to the free server environment, initial connection may take up to 1 minute.`

**Tips:**
- Adding notification messages in various locations (loading components, layout Header/Footer, FAQ/About pages) improves user experience
- In actual operation, notification messages can reduce user confusion and abandonment rates
