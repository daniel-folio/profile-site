# ✨ Core Features & Highlights

### 🎯 **Core Features & Capabilities**

#### 📊 **Enterprise-Grade Visitor Analytics (Only Admin Visitors Page)**
- **Tabs**: Overview, Sessions, Pages, Realtime, Map. Segment tabs (All/General/Owner) are shown on top of every main tab consistently.
- **Period Selection**: Quick buttons (1d/7d/30d) and custom range. Selected period banner shows `YYYY-MM-DD ~ YYYY-MM-DD (N days)`.
- **Segment Separation**: Owner vs General visits are strictly separated by the __Owner IP allowlist (ownerIpAllowlist)__. Both backend and frontend rely on the same rule.
- **Owner IP Allowlist**: Manage owner IPs (and CIDR) in Strapi Site Settings. Up to 5 are prioritized for owner tagging; additional entries are still accepted for management.
- **Realtime/Sessions/Pages Analytics**: Visitor timelines, pageview aggregation, and browser/OS/device stats. Clear empty states when no data.
- **Map Visualization**: OpenStreetMap with `pigeon-maps` (React 19 compatible). Only visits with geo info are rendered in the Map tab.
- **IP/Proxy Handling**: Real client IP extracted from headers (e.g., X-Forwarded-For) to mitigate 127.0.0.1 in proxy setups.
- **Endpoint Access**: Visitor collection and stats endpoints are public (auth: false) to prevent 403 in local/production.
- **Resilience/Failover**: Frontend `frontend/src/lib/api.ts` validates URLs, applies timeout and optional retries, and fail-fast behavior in production.
- **Ops Tips**:
  - Stop tracking: set `enableVisitorTracking=false` in Site Settings.
  - Maintenance mode: set `siteUsed=false` to block access for all (including admin) — use with caution.
  - Admin auth: `/admin/visitors` uses `adminPassword` from Site Settings (stored as plain text by Strapi UI limitation; use strong passwords).
  - Data quality: For missing mobile records or proxy environments, verify IP/forwarded header configuration first.
  - Map performance: Initial load may be slow depending on free tile/CDN/network conditions.
  - Docs: see [VISITOR_TRACKING.md](./VISITOR_TRACKING.md).
  - Owner auto-allowlist: Append some information to the visit URL to auto-add the current IP to `ownerIpAllowlist` and record this visit as owner. Do not expose this publicly to avoid abuse.

#### 📄 **Advanced Content Management System**
- **Dynamic PDF Generation** for resumes and career details using html2pdf.js with custom styling
- **Rich Text Rendering Engine** supporting markdown, HTML, and custom components
- **Intelligent Image Optimization** via Cloudinary with automatic format selection and lazy loading
- **Comprehensive SEO Optimization** with meta tags, Open Graph, Twitter Cards, and structured data
- **Content Versioning & History** through Strapi's headless CMS architecture
- **Multi-language Content Support** with internationalization capabilities
- **Content Scheduling** for timed publication and updates

#### 🎨 **Modern UI/UX Design System**
- **Adaptive Dark/Light Mode** with system preference detection and manual toggle
- **Fully Responsive Design** optimized for mobile-first, tablet, and desktop experiences
- **Micro-interactions & Animations** powered by Framer Motion with performance optimization
- **Interactive 3D Backgrounds** using Three.js and Vanta effects with GPU acceleration
- **Dynamic Typing Animations** for engaging text presentation with customizable speeds
- **Comprehensive Accessibility** following WCAG 2.1 AA guidelines with screen reader support
- **Custom Design System** with consistent spacing, typography, and color schemes

#### ⚡ **Performance & Security Excellence**
- **Next.js 15 App Router** with advanced server-side rendering and static site generation
- **Optimized Image Pipeline** with Next.js Image component, WebP conversion, and progressive loading
- **Multi-layer Caching Strategies** for optimal loading performance and reduced server load
- **Advanced XSS Protection** using DOMPurify sanitization with custom configuration
- **Secure API Architecture** with proper authentication, rate limiting, and input validation
- **Intelligent Code Splitting** for minimal bundle sizes and faster initial page loads
- **Performance Monitoring** with Core Web Vitals tracking and real-time alerts
