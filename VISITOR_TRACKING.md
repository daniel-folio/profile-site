# Visitor Tracking System | 방문자 추적 시스템

> **📖 이중 언어 안내**: 이 문서는 한국어와 영어로 작성되었습니다. 한국어 버전을 먼저 확인하신 후, 필요시 영어 버전을 참고하세요.  
> **📖 Bilingual Guide**: This document is available in both Korean and English. Please check the Korean version first, then refer to the English version if needed.

---

## 🇰🇷 한국어 버전

이 포트폴리오 사이트에는 방문자 카운팅 및 IP 기록 기능이 포함되어 있습니다.

### 🎯 주요 기능

#### ✅ 방문자 정보 수집
- **IP 주소**: 방문자의 IP 주소 (프록시 환경 고려)
- **User-Agent**: 브라우저 및 디바이스 정보
- **Referrer**: 유입 경로
- **페이지**: 방문한 페이지 경로
- **방문 시간**: 정확한 방문 시각
- **세션 ID**: 고유 세션 식별자

#### 📊 통계 기능
- **총 방문수**: 전체 페이지뷰 수
- **고유 방문자**: IP 기준 중복 제거된 방문자 수
- **페이지별 통계**: 각 페이지의 방문 현황
- **일별 통계**: 날짜별 방문 추이
- **기간별 조회**: 1일, 7일, 30일 단위 통계
- **사용자 정의 기간**: 시작일~종료일 직접 선택 가능
- **실시간 방문자**: 최근 방문자 목록 및 IP별 그룹화
- **세션 분석**: 사용자별 방문 경로 및 행동 패턴
- **브라우저/OS 통계**: 방문자 환경 분석
- **빈 데이터 상태**: 데이터 없을 때 사용자 친화적 UI

#### 🔒 개인정보 보호
- **중복 방문 필터링**: 같은 IP에서 1시간 이내 재방문 시 중복 기록 방지
- **경로 정규화**: 개인정보가 포함될 수 있는 쿼리 파라미터 제거
- **데이터 보존 정책**: 오래된 데이터 자동 정리 기능
- **GDPR 준수**: EU 개인정보 보호 규정 고려

### 📊 고급 대시보드 기능

#### 1. **스마트 기간 선택**
```tsx
// 버튼과 날짜 입력 필드 자동 동기화
[1일] [7일] [30일] [시작일 ____] ~ [종료일 ____] [적용] [새로고침]
```

#### 2. **다중 탭 분석**
- **개요**: 전체 통계, 차트, 핵심 지표
- **페이지 분석**: 페이지별 상세 방문 현황
- **세션 분석**: 사용자별 방문 경로 및 행동 패턴
- **실시간**: 최근 방문자 목록 (IP별 아코디언 그룹화)

#### 3. **빈 데이터 상태 UI**
```tsx
// 데이터가 없을 때 자동으로 표시되는 사용자 친화적 UI
<EmptyState 
  icon="chart" 
  title="방문자 데이터가 없습니다"
  description="선택한 기간에 방문 기록이 없습니다."
  actions={[
    { label: "7일 기간으로 보기", onClick: () => setPeriod('7d') },
    { label: "30일 기간으로 보기", onClick: () => setPeriod('30d') }
  ]}
/>
```

### 🔧 커스텀 통계 조회
```tsx
import { useVisitorStats } from '@/hooks/useVisitorTracking';

function CustomStats() {
  // 기본 기간 조회
  const { stats, loading, error } = useVisitorStats('7d');
  
  // 사용자 정의 기간 조회
  const customStats = useVisitorStats('custom', {
    startDate: '2025-08-01',
    endDate: '2025-08-16'
  });
  
  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>오류: {error}</div>;
  
  return (
    <div>
      <h3>기본 통계 (7일)</h3>
      <p>총 방문수: {stats?.totalVisitors}</p>
      <p>고유 방문자: {stats?.uniqueVisitors}</p>
      <p>평균 페이지뷰: {stats?.avgPageViews}</p>
      
      <h3>브라우저별 통계</h3>
      {stats?.browserStats?.map(browser => (
        <div key={browser.name}>
          {browser.name}: {browser.count}회 ({browser.percentage}%)
        </div>
      ))}
      
      <h3>페이지별 통계</h3>
      {stats?.pageStats?.map(page => (
        <div key={page.page}>
          {page.page}: {page.visits}회 방문, {page.unique_visitors}명
        </div>
      ))}
    </div>
  );
}
```

### 🚀 설치 및 설정

#### 1. 백엔드 설정 (Strapi)

방문자 추적 API가 자동으로 생성됩니다:
- `POST /api/visitors` - 방문자 정보 기록
- `GET /api/visitors/stats` - 방문자 통계 조회

#### 2. 프론트엔드 설정

환경 변수 설정 (`.env.local` 파일):
```bash
# Strapi Backend API URL
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337

# 방문자 추적 활성화/비활성화 (기본값: true)
NEXT_PUBLIC_ENABLE_VISITOR_TRACKING=true
```

#### 3. 관리자 대시보드 접근

방문자 분석 대시보드:
```
http://localhost:3000/admin/visitors
```

관리자 패스워드는 환경 변수로 설정:
```bash
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password
```

### 🛠️ API 사용법

#### 방문자 정보 기록
```javascript
import { recordVisitor } from '@/lib/visitor';

// 방문자 정보 기록
await recordVisitor({
  page: '/portfolio/my-project',
  sessionId: 'unique-session-id'
});
```

#### 방문자 통계 조회
```javascript
import { getVisitorStats } from '@/lib/visitor';

// 기본 기간 조회 (1일, 7일, 30일)
const stats7d = await getVisitorStats('7d');
const stats30d = await getVisitorStats('30d');
const stats1d = await getVisitorStats('1d');

// 사용자 정의 기간 조회
const customStats = await getVisitorStats('custom', {
  startDate: '2025-08-01',
  endDate: '2025-08-16'
});

console.log('7일 통계:', stats7d);
console.log('사용자 정의 통계:', customStats);

// 통계 데이터 구조
/*
{
  totalVisitors: 150,
  uniqueVisitors: 89,
  avgPageViews: 2.3,
  pageStats: [
    { page: "/", visits: 45, unique_visitors: 32 },
    { page: "/portfolio", visits: 28, unique_visitors: 21 }
  ],
  dailyStats: [
    { date: "2025-08-16", visits: 12, unique_visitors: 8 }
  ],
  browserStats: [
    { name: "Chrome", count: 67, percentage: 75.3 },
    { name: "Safari", count: 15, percentage: 16.9 }
  ],
  osStats: [
    { name: "macOS", count: 45, percentage: 50.6 },
    { name: "Windows", count: 32, percentage: 36.0 }
  ],
  sessionStats: [
    {
      sessionId: "abc123",
      ipAddress: "192.168.1.1",
      pageViews: 3,
      uniquePages: 2,
      duration: 180000,
      pages: ["/", "/portfolio", "/contact"]
    }
  ]
}
*/
```

### 🔧 고급 설정

#### 데이터 정리 (백엔드)
오래된 방문자 데이터 자동 정리:
```javascript
// 90일 이상 된 데이터 삭제
await strapi.service('api::visitor.visitor').cleanupOldVisitors(90);
```

#### 추적 비활성화
방문자 추적을 완전히 비활성화하려면:
```bash
NEXT_PUBLIC_ENABLE_VISITOR_TRACKING=false
```

### 📊 데이터베이스 스키마

```json
{
  "ipAddress": "string (최대 45자)",
  "userAgent": "text",
  "referrer": "string",
  "page": "string (필수)",
  "country": "string",
  "city": "string", 
  "visitedAt": "datetime (필수)",
  "sessionId": "string"
}
```

### 🔐 보안 고려사항

1. **IP 주소 저장**: 개인정보 보호법에 따라 필요시 익명화 처리
2. **데이터 보존**: 정기적인 오래된 데이터 삭제 권장
3. **접근 제한**: 통계 대시보드는 관리자만 접근 가능하도록 설정
4. **GDPR 준수**: EU 사용자 대상 서비스 시 쿠키 동의 구현 권장

### 🚨 문제 해결

#### 방문자 추적이 작동하지 않는 경우
1. 환경 변수 `NEXT_PUBLIC_STRAPI_API_URL` 확인
2. Strapi 백엔드 서버 실행 상태 확인
3. 브라우저 개발자 도구에서 네트워크 요청 확인
4. 콘솔에서 오류 메시지 확인

#### 통계가 표시되지 않는 경우
1. 백엔드 API 엔드포인트 `/api/visitors/stats` 접근 가능 여부 확인
2. 데이터베이스에 방문자 데이터 존재 여부 확인
3. 권한 설정 확인 (Strapi 관리자 패널)

### 📝 라이센스 및 주의사항

이 방문자 추적 시스템은 포트폴리오 사이트의 분석 목적으로 개발되었습니다. 
상업적 사용 시 개인정보 보호 관련 법규를 준수해야 합니다.

---

## 🇺🇸 English Version

### English Overview

This portfolio website includes a comprehensive **visitor analytics system** with real-time tracking, advanced dashboard, and detailed statistics. Built with privacy-first approach and GDPR considerations.

#### 🚀 Key Features

- **📊 Advanced Analytics Dashboard** - Multi-tab interface with overview, page analysis, session tracking, and real-time visitors
- **📅 Smart Date Selection** - Quick period buttons (1d/7d/30d) + custom date range picker with auto-sync
- **🔍 Real-time Visitor Tracking** - Live visitor feed with IP-based accordion grouping
- **📈 Session Analysis** - User journey tracking with page paths and behavior patterns  
- **🌐 Browser/OS Statistics** - Detailed visitor environment analytics
- **🚫 Empty State Handling** - User-friendly UI when no data is available
- **🔒 Privacy-First** - IP anonymization, duplicate filtering, GDPR compliance ready

#### 🛠️ Technical Stack

- **Frontend**: React hooks, TypeScript, Tailwind CSS
- **Backend**: Strapi 5.16 with custom controllers
- **Database**: PostgreSQL with optimized queries
- **API**: RESTful endpoints with custom date range support

#### 📊 Dashboard Features

##### Smart Period Selection
```tsx
// Auto-sync between buttons and date inputs
[1d] [7d] [30d] [Start Date ____] ~ [End Date ____] [Apply] [Refresh]
```

##### Multi-Tab Analytics
- **Overview**: Total stats, charts, and key metrics
- **Page Analysis**: Detailed page-by-page visitor breakdown
- **Session Analysis**: User behavior patterns and journey paths
- **Real-time**: Live visitor feed with IP grouping

##### Empty State UI
```tsx
<EmptyState 
  icon="chart" 
  title="No visitor data available"
  description="No visits recorded for the selected period."
  actions={[
    { label: "View 7-day period", onClick: () => setPeriod('7d') },
    { label: "View 30-day period", onClick: () => setPeriod('30d') }
  ]}
/>
```

#### 🔧 API Usage

```javascript
import { getVisitorStats } from '@/lib/visitor';

// Basic period queries
const stats7d = await getVisitorStats('7d');
const stats30d = await getVisitorStats('30d');

// Custom date range
const customStats = await getVisitorStats('custom', {
  startDate: '2025-08-01',
  endDate: '2025-08-16'
});
```

#### 📈 Data Structure

```javascript
{
  totalVisitors: 150,
  uniqueVisitors: 89,
  avgPageViews: 2.3,
  browserStats: [
    { name: "Chrome", count: 67, percentage: 75.3 }
  ],
  sessionStats: [
    {
      sessionId: "abc123",
      ipAddress: "192.168.1.1",
      pageViews: 3,
      duration: 180000,
      pages: ["/", "/portfolio", "/contact"]
    }
  ]
}
```

#### 🔍 Advanced Features

##### **Real-time Analytics**
- **Live Visitor Feed**: Real-time visitor tracking with automatic updates
- **Session Monitoring**: Track user sessions and page navigation patterns
- **Geographic Insights**: Country and city-level visitor analytics
- **Device Analytics**: Comprehensive browser, OS, and device statistics

##### **Privacy & Compliance**
- **GDPR Ready**: Built-in privacy controls and data anonymization
- **Duplicate Filtering**: Smart deduplication prevents inflated statistics
- **Data Retention**: Configurable data cleanup and retention policies
- **IP Anonymization**: Optional IP address masking for enhanced privacy

##### **Performance Optimized**
- **Efficient Queries**: Optimized database queries for fast analytics
- **Caching Layer**: Built-in caching for improved dashboard performance
- **Batch Processing**: Efficient data processing for large visitor volumes
- **Resource Management**: Minimal impact on site performance

#### 🎛️ Dashboard Configuration

##### **Access Control**
- **Password Protection**: Secure admin dashboard with environment-based authentication
- **Role-based Access**: Configurable access levels for different users
- **Session Management**: Secure session handling with automatic timeouts
- **Audit Logging**: Track dashboard access and configuration changes

##### **Customization Options**
- **Theme Support**: Light/dark mode compatibility
- **Responsive Design**: Optimized for desktop, tablet, and mobile viewing
- **Export Functionality**: Export analytics data in multiple formats
- **Custom Date Ranges**: Flexible date selection with preset options

#### 🔧 Integration Guide

##### **Frontend Integration**
```javascript
import { useVisitorTracking } from '@/hooks/useVisitorTracking';

function MyComponent() {
  const { trackVisit, stats, loading } = useVisitorTracking();
  
  useEffect(() => {
    trackVisit('/my-page');
  }, []);
  
  return (
    <div>
      {loading ? 'Loading...' : `Total visits: ${stats.totalVisitors}`}
    </div>
  );
}
```

##### **Backend Configuration**
```javascript
// Strapi lifecycle hook for visitor data processing
module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    
    // Add geolocation data
    data.country = await getCountryFromIP(data.ipAddress);
    data.city = await getCityFromIP(data.ipAddress);
    
    // Normalize page paths
    data.page = normalizePath(data.page);
  }
};
```

#### 📊 Analytics Capabilities

##### **Statistical Analysis**
- **Trend Analysis**: Identify visitor patterns and growth trends
- **Conversion Tracking**: Monitor page-to-page conversion rates
- **Bounce Rate**: Calculate single-page session percentages
- **Return Visitor**: Track returning vs new visitor ratios

##### **Behavioral Insights**
- **Page Flow**: Visualize common user navigation paths
- **Session Duration**: Average time spent on site analysis
- **Popular Content**: Identify most visited pages and content
- **Traffic Sources**: Referrer analysis and traffic source attribution

##### **Technical Metrics**
- **Browser Compatibility**: Browser usage statistics for optimization
- **Device Analytics**: Mobile vs desktop usage patterns
- **Performance Impact**: Monitor tracking system performance
- **Error Monitoring**: Track and analyze tracking failures

#### 🚀 Deployment & Scaling

##### **Production Setup**
- **Environment Variables**: Secure configuration management
- **Database Optimization**: Indexing and query optimization
- **CDN Integration**: Global content delivery for analytics assets
- **Monitoring**: Health checks and performance monitoring

##### **Scalability Considerations**
- **Database Sharding**: Handle high-volume visitor data
- **Caching Strategy**: Redis integration for improved performance
- **Load Balancing**: Distribute analytics processing load
- **Data Archiving**: Automated old data archival and cleanup
- **선택적 활성화**: 환경 변수로 추적 기능 ON/OFF 가능

#### 🚀 설치 및 설정

##### 1. 백엔드 설정 (Strapi)

방문자 추적 API가 자동으로 생성됩니다:
- `POST /api/visitors` - 방문자 정보 기록
- `GET /api/visitors/stats` - 방문자 통계 조회

##### 2. 프론트엔드 설정

환경 변수 설정 (`.env.local` 파일):
```bash
# Strapi Backend API URL
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337

# 방문자 추적 활성화/비활성화 (기본값: true)
NEXT_PUBLIC_ENABLE_VISITOR_TRACKING=true
```

### 3. 자동 추적 활성화

메인 레이아웃에 `<VisitorTracker />` 컴포넌트가 이미 추가되어 있어 자동으로 방문자 추적이 시작됩니다.

## 📈 통계 대시보드 사용법

### 🎛️ 고급 방문자 분석 대시보드
```tsx
import { VisitorAnalyticsDashboard } from '@/components/admin/VisitorAnalyticsDashboard';

function AdminPage() {
  return (
    <div>
      <h1>관리자 대시보드</h1>
      <VisitorAnalyticsDashboard />
    </div>
  );
}
```

### 📊 대시보드 주요 기능

#### 1. **스마트 기간 선택**
- **빠른 선택**: 1일, 7일, 30일 버튼
- **사용자 정의**: 시작일~종료일 직접 입력
- **자동 동기화**: 버튼 클릭 시 날짜 입력창 자동 업데이트
- **적용 버튼**: 사용자 정의 날짜 선택 후 명시적 적용
- **기간 표시**: 선택된 기간과 총 일수 표시

#### 2. **다중 탭 분석**
- **개요**: 전체 통계 및 차트
- **페이지 분석**: 페이지별 상세 방문 현황
- **세션 분석**: 사용자별 방문 경로 및 행동 패턴
- **실시간**: 최근 방문자 목록 (IP별 아코디언 그룹화)

#### 3. **빈 데이터 상태 UI**
```tsx
// 데이터가 없을 때 자동으로 표시되는 사용자 친화적 UI
<EmptyState 
  icon="chart" 
  title="방문자 데이터가 없습니다"
  description="선택한 기간에 방문 기록이 없습니다."
  actions={[
    { label: "7일 기간으로 보기", onClick: () => setPeriod('7d') },
    { label: "30일 기간으로 보기", onClick: () => setPeriod('30d') }
  ]}
/>
```

### 🔧 커스텀 통계 조회
```tsx
import { useVisitorStats } from '@/hooks/useVisitorTracking';

function CustomStats() {
  // 기본 기간 조회
  const { stats, loading, error } = useVisitorStats('7d');
  
  // 사용자 정의 기간 조회
  const customStats = useVisitorStats('custom', {
    startDate: '2025-08-01',
    endDate: '2025-08-16'
  });
  
  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>오류: {error}</div>;
  
  return (
    <div>
      <h3>기본 통계 (7일)</h3>
      <p>총 방문수: {stats?.totalVisitors}</p>
      <p>고유 방문자: {stats?.uniqueVisitors}</p>
      <p>평균 페이지뷰: {stats?.avgPageViews}</p>
      
      <h3>브라우저별 통계</h3>
      {stats?.browserStats?.map(browser => (
        <div key={browser.name}>
          {browser.name}: {browser.count}회 ({browser.percentage}%)
        </div>
      ))}
      
      <h3>페이지별 통계</h3>
      {stats?.pageStats?.map(page => (
        <div key={page.page}>
          {page.page}: {page.visits}회 방문, {page.unique_visitors}명
        </div>
      ))}
    </div>
  );
}
```

#### 🛠️ API 사용법

##### 방문자 정보 기록
```javascript
import { recordVisitor } from '@/lib/visitor';

// 방문자 정보 기록
await recordVisitor({
  page: '/portfolio/my-project',
  sessionId: 'unique-session-id'
});
```

##### 방문자 통계 조회
```javascript
import { getVisitorStats } from '@/lib/visitor';

// 기본 기간 조회 (1일, 7일, 30일)
const stats7d = await getVisitorStats('7d');
const stats30d = await getVisitorStats('30d');
const stats1d = await getVisitorStats('1d');

// 사용자 정의 기간 조회
const customStats = await getVisitorStats('custom', {
  startDate: '2025-08-01',
  endDate: '2025-08-16'
});

console.log('7일 통계:', stats7d);
console.log('사용자 정의 통계:', customStats);

// 통계 데이터 구조
/*
{
  totalVisitors: 150,
  uniqueVisitors: 89,
  avgPageViews: 2.3,
  pageStats: [
    { page: "/", visits: 45, unique_visitors: 32 },
    { page: "/portfolio", visits: 28, unique_visitors: 21 }
  ],
  dailyStats: [
    { date: "2025-08-16", visits: 12, unique_visitors: 8 }
  ],
  browserStats: [
    { name: "Chrome", count: 67, percentage: 75.3 },
    { name: "Safari", count: 15, percentage: 16.9 }
  ],
  osStats: [
    { name: "macOS", count: 45, percentage: 50.6 },
    { name: "Windows", count: 32, percentage: 36.0 }
  ],
  sessionStats: [
    {
      sessionId: "abc123",
      ipAddress: "192.168.1.1",
      pageViews: 3,
      uniquePages: 2,
      duration: 180000,
      pages: ["/", "/portfolio", "/contact"]
    }
  ]
}
*/
```

#### 🔧 고급 설정

##### 데이터 정리 (백엔드)
오래된 방문자 데이터 자동 정리:
```javascript
// 90일 이상 된 데이터 삭제
await strapi.service('api::visitor.visitor').cleanupOldVisitors(90);
```

##### 추적 비활성화
방문자 추적을 완전히 비활성화하려면:
```bash
NEXT_PUBLIC_ENABLE_VISITOR_TRACKING=false
```

#### 📊 데이터베이스 스키마

```json
{
  "ipAddress": "string (최대 45자)",
  "userAgent": "text",
  "referrer": "string",
  "page": "string (필수)",
  "country": "string",
  "city": "string", 
  "visitedAt": "datetime (필수)",
  "sessionId": "string"
}
```

#### 🔐 보안 고려사항

1. **IP 주소 저장**: 개인정보 보호법에 따라 필요시 익명화 처리
2. **데이터 보존**: 정기적인 오래된 데이터 삭제 권장
3. **접근 제한**: 통계 대시보드는 관리자만 접근 가능하도록 설정
4. **GDPR 준수**: EU 사용자 대상 서비스 시 쿠키 동의 구현 권장

#### 🚨 문제 해결

##### 방문자 추적이 작동하지 않는 경우
1. 환경 변수 `NEXT_PUBLIC_STRAPI_API_URL` 확인
2. Strapi 백엔드 서버 실행 상태 확인
3. 브라우저 개발자 도구에서 네트워크 요청 확인
4. 콘솔에서 오류 메시지 확인

##### 통계가 표시되지 않는 경우
1. 백엔드 API 엔드포인트 `/api/visitors/stats` 접근 가능 여부 확인
2. 데이터베이스에 방문자 데이터 존재 여부 확인
3. 권한 설정 확인 (Strapi 관리자 패널)

#### 📝 라이센스 및 주의사항

이 방문자 추적 시스템은 포트폴리오 사이트의 분석 목적으로 개발되었습니다. 
상업적 사용 시 개인정보 보호 관련 법규를 준수해야 합니다.
