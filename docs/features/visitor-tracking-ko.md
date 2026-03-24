# 📊 방문자 추적 시스템 (Visitor Tracking)

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
- **세그먼트 분리**: 오너 vs 일반을 __Owner IP 허용목록(ownerIpAllowlist)__ 기준으로 완전 분리 (백엔드/프론트 동일 규칙)
- **오너 IP 허용목록**: Strapi Site Settings에서 단일 IP 및 CIDR 대역 등록 지원 (예: `203.0.113.5`, `203.0.113.0/24`)
 - **오너 자동 등록 메모**: 자동 허용목록 등록 시 메모는 `countryCode/city, isp/asn, timezone, deviceType | YYYY-MM-DD HH:mm KST` 형식을 사용합니다. 민감한 파라미터는 기록하지 않습니다.

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
- **세그먼트 탭**: 모든 탭 상단에 세그먼트 탭(전체/일반/OWNER) 공통 노출, 선택값이 전체 대시보드에 적용
  - 표기: 탭 라벨은 'OWNER'로 표시됩니다 (예: 전체/일반/OWNER)

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

  // 세그먼트별 조회 (일반/오너/전체)
  const general = useVisitorStats('7d', undefined, 'general');
  const owner = useVisitorStats('7d', undefined, 'owner');
  const all = useVisitorStats('7d', undefined, 'all');
  
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
# Strapi Backend API URL (중앙 선택 로직 사용)
NEXT_PUBLIC_STRAPI_API_URL_PRIMARY=http://localhost:1337
```

#### 3. 관리자 대시보드 접근

방문자 분석 대시보드:
```
http://localhost:3000/admin/visitors
```

관리자 패스워드는 이제 Strapi Admin의 `Site Settings`에서 관리됩니다. 프론트엔드 환경변수는 사용하지 않습니다.

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

// 세그먼트별 조회 (일반/오너/전체)
const gen = await getVisitorStats('7d', undefined, 'general');
const own = await getVisitorStats('7d', undefined, 'owner');
const allSeg = await getVisitorStats('7d', undefined, 'all');

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
방문자 추적을 완전히 비활성화하려면 Strapi Admin의 `Site Settings`에서 `enableVisitorTracking`을 `false`로 설정하세요. 프론트엔드 환경변수는 더 이상 사용하지 않습니다.

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
