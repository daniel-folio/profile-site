# Developer Portfolio Website | 개발자 포트폴리오 웹사이트

> **🌍 Language Selection | 언어 선택:**
> - [🇰🇷 한국어 버전 (Korean)](#korean-version)
> - [🇺🇸 English Version](#english-version)

---

<a name="korean-version"></a>
## 🇰🇷 한국어 버전 (Korean Version)

개인의 이력서, 포트폴리오, 경력기술서를 체계적으로 관리하고 전시할 수 있는 개인 웹사이트입니다. **Next.js 15**, **Strapi CMS**, 그리고 **커스텀 방문자 분석 시스템**을 활용한 모던 웹 개발 사례를 보여줍니다.

### 📚 문서 가이드

모든 상세 가이드와 기술 문서는 `docs/` 폴더에 주제별로 명확하게 분리되어 있습니다. 필요한 문서를 아래 링크에서 확인하세요.

- ✨ [핵심 기능 및 프로젝트 하이라이트](./docs/features/core-features-ko.md)
- 📊 [방문자 분석 시스템](./docs/features/visitor-tracking-ko.md)
- 🎨 [디자인 버전 스위칭 및 다중 테마 관리](./docs/features/version-management-ko.md)
- 🛠️ [기술 스택 및 배포 아키텍처](./docs/architecture/tech-stack-ko.md)
- 🎛️ [Strapi DB 모델 및 사이트 설정 가이드](./docs/data-model/schema-ko.md)
- 💻 [개발 시작하기 및 로컬 환경 가이드](./docs/guide/development-ko.md)
- 🚀 [프로덕션 배포 가이드](./docs/guide/deployment-ko.md)

### 🚀 빠른 시작

1. **저장소 클론**
```bash
git clone <repository-url>
cd portfolio
```

2. **백엔드 설정 (Strapi)**
```bash
cd backend
npm install
npm run develop
```
브라우저에서 `http://localhost:1337/admin`에 접속하여 관리자 계정을 생성하세요.

3. **프론트엔드 설정 (Next.js)**
```bash
cd frontend
npm install
```
`.env.local` 파알 생성 후 백엔드 주소를 입력합니다:
```env
NEXT_PUBLIC_STRAPI_API_URL_PRIMARY=http://localhost:1337
```
```bash
npm run dev
```
브라우저에서 `http://localhost:3000`에 접속하여 웹사이트를 확인하세요.

---

<a name="english-version"></a>
## 🇺🇸 English Version

A **comprehensive full-stack developer portfolio website** showcasing advanced web development practices with **Next.js 15**, **Strapi CMS**, and a **custom-built visitor analytics system**.

### 📚 Documentation Guide

All detailed technical documentation is modularized under the `docs/` folder. Please refer to the relevant links below:

- ✨ [Core Features & Highlights](./docs/features/core-features-en.md)
- 📊 [Visitor Tracking System](./docs/features/visitor-tracking-en.md)
- 🎨 [Design Version Switching & Theme Management](./docs/features/version-management-en.md)
- 🛠️ [Technical Architecture & Setup](./docs/architecture/tech-stack-en.md)
- 🎛️ [Backend Data Model & Settings Guide](./docs/data-model/schema-en.md)
- 💻 [Development & Quick Start Guide](./docs/guide/development-en.md)
- 🚀 [Production Deployment Guide](./docs/guide/deployment-en.md)

### 🚀 Quick Start

1. **Clone Repository**
```bash
git clone <repository-url>
cd portfolio
```

2. **Backend Setup (Strapi)**
```bash
cd backend
npm install
npm run develop
```
Open `http://localhost:1337/admin` in your browser to create the admin account.

3. **Frontend Setup (Next.js)**
```bash
cd frontend
npm install
```
Create a `.env.local` file and add:
```env
NEXT_PUBLIC_STRAPI_API_URL_PRIMARY=http://localhost:1337
```
```bash
npm run dev
```
Open `http://localhost:3000` to view the website.

---

## 📝 라이센스 (License)
MIT License

## 📞 연락처 (Contact)
프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.
daniel.han.developer@gmail.com
