# 🛠️ Technical Architecture

### 🛠️ Technical Architecture & Stack

#### **Frontend Technology Stack**
- **Framework**: Next.js 15 (App Router Architecture)
- **Language**: TypeScript (Type safety and developer experience)
- **Styling**: Tailwind CSS (Custom design system)
- **Animation**: Framer Motion (Smooth transitions)
- **3D Graphics**: Three.js and Vanta.js (Interactive backgrounds)
- **State Management**: React hooks (Custom context providers)
- **Code Quality**: ESLint, Prettier, Husky (Consistent code standards)

#### **Backend Technology Stack**
- **CMS**: Strapi 5.16 (Headless CMS with custom controllers)
- **Database**: PostgreSQL (Production) / SQLite (Development)
- **Image Storage**: Cloudinary (Automatic optimization)
- **API**: RESTful endpoints (Custom visitor analytics API)
- **Authentication**: JWT-based admin authentication
- **Deployment**: Render (Automated CI/CD pipeline)

#### **Analytics & Monitoring**
- **Custom Analytics**: Built-in visitor tracking system
- **Real-time Data**: Real-time visitor monitoring and session analysis
- **Performance Metrics**: Core Web Vitals tracking
- **Error Monitoring**: Comprehensive error logging and reporting

### 🌟 **Project Highlights**

This portfolio demonstrates expertise in:
- **Full-stack Development** - Modern JavaScript ecosystem expertise
- **System Architecture** - Scalable and maintainable code structure
- **UI/UX Design** - Meticulous attention to user experience
- **Performance Optimization** - Knowledge through real-world implementation
- **Security Best Practices** - Proper data handling and protection
- **Documentation Skills** - Comprehensive technical documentation

### 🚀 **Live Demo & Deployment**
- **Frontend**: Automated deployment on Vercel
- **Backend**: Hosted on Render with PostgreSQL database
- **CDN**: Cloudinary for optimized image delivery

### 📁 **Project Structure**

> See [folder-structure-ko.md](./folder-structure-ko.md) for the detailed frontend structure guide.

```
portfolio/
├── frontend/                    # Next.js Frontend Application
│   ├── src/
│   │   ├── app/                # Next.js App Router Pages
│   │   │   ├── career-detail/  # Career Details Page
│   │   │   ├── portfolio/      # Project Detail Pages
│   │   │   ├── resume/         # Resume Page
│   │   │   └── admin/          # Admin Dashboard
│   │   │       ├── login/      # Admin Auth Login
│   │   │       ├── visitors/   # Visitor Analytics Dashboard
│   │   │       └── logs/       # System Error Logs Monitoring
│   │   └── features/           # Feature-Driven Domain Layer
│   │       ├── admin/          # Admin-only (API, Components, Types)
│   │       ├── public/         # Public user-facing (v1/v2/v3 themes, PDF)
│   │       └── common/         # Shared (API helpers, UI, Utils, Types)
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
│   │       ├── app-log/       # System Error Logs
│   │       └── site-setting/  # Global Site Configuration
│   ├── config/                # Strapi Configuration
│   └── package.json
├── docs/                      # Project Documentation
│   ├── architecture/          # Tech Architecture & Folder Structure Guide
│   ├── data-model/            # Data Model Schemas
│   ├── features/              # Feature Documentation
│   └── guide/                 # Development Guides
└── README.md                  # Project README
```

### 🎯 **Implemented Features & Capabilities**

#### **✅ Core Pages & Navigation**
- **Homepage** (`/`) - Profile showcase, skills display, and project portfolio
- **Resume Page** (`/resume`) - Comprehensive resume with PDF download functionality
- **Career Details** (`/career-detail`) - Detailed career information with PDF export
- **Project Details** (`/portfolio/[slug]`) - Individual project case studies and technical details
- **Admin Dashboard** (`/admin/*`) - Comprehensive visitor analytics, real-time log monitoring, and auth management

#### **✅ Advanced UI/UX Features**
- **Adaptive Theme System** - Complete dark/light mode with system preference detection and manual toggle
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
