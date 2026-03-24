# 🎛️ 백엔드 데이터 모델 및 설정

## 🎛️ Site Settings (사이트 설정)

> **📖 이중 언어 안내**: 이 섹션은 한국어와 영어로 작성되었습니다. 한국어 버전을 먼저 확인하신 후, 필요시 영어 버전을 참고하세요.  
> **📖 Bilingual Guide**: This section is available in both Korean and English. Please check the Korean version first, then refer to the English version if needed.


### 개요
사이트 설정 시스템은 Strapi Admin Panel을 통해 중앙 집중식 구성 관리를 제공합니다. 모든 설정은 코드 변경이나 서버 재시작 없이 동적으로 적용됩니다.

### 사용 가능한 설정

#### **🔐 adminPassword (관리자 패스워드)**
- **설명**: 방문자 분석 대시보드 관리자 인증 패스워드
- **타입**: String (평문, 6-50자)
- **기본값**: 초기 설정 시 지정
- **용도**: `/admin/visitors` 페이지 접근 시 인증에 사용
- **보안**: Strapi Admin에서 평문으로 확인 가능 (UI 제한으로 인함)

#### **📊 enableVisitorTracking (방문자 추적 활성화)**
- **설명**: 방문자 데이터 수집 및 분석 활성화/비활성화
- **타입**: Boolean
- **기본값**: `true` (활성화)
- **효과**: `false`로 설정 시 모든 방문자 추적 및 데이터 수집 중단
- **적용**: 실시간으로 적용되어 즉시 추적 중단/재개

#### **🏷️ siteName (사이트 이름)**
- **설명**: 브라우저 탭과 메타 태그에 표시되는 사이트 제목
- **타입**: String (최대 100자)
- **기본값**: "Developer Portfolio"
- **용도**: SEO, 브라우저 탭 제목, 소셜 미디어 공유 시 표시

#### **📝 siteDescription (사이트 설명)**
- **설명**: 검색 엔진용 SEO 메타 설명
- **타입**: Text (최대 500자)
- **기본값**: "Personal portfolio website"
- **용도**: Google 검색 결과, 소셜 미디어 공유 시 설명 텍스트

#### **🌐 siteUsed (사이트 사용 여부)**
- **설명**: 사이트 접근 제어 (`true` = 접근 허용, `false` = 접근 차단)
- **타입**: Boolean
- **기본값**: `true` (접근 허용)
- **효과**: `false`로 설정 시 모든 방문자에게 유지보수 화면 표시
- **용도**: 사이트 점검, 업데이트 시 임시 차단

#### **👥 maxVisitorsPerDay (일일 최대 방문자 수)**
- **설명**: 트래픽 제어를 위한 일일 방문자 수 제한
- **타입**: Integer (100 - 1,000,000)
- **기본값**: 10,000
- **용도**: 서버 부하 관리, 트래픽 모니터링

### 설정 방법

1. **Strapi Admin 접속**
   ```
   http://localhost:1337/admin
   ```

2. **설정으로 이동**
   - **Content Manager** → **Site Settings**로 이동

3. **값 업데이트**
   - 원하는 설정 값을 수정
   - **Save**를 클릭하여 변경사항 적용

4. **즉시 적용**
   - 서버 재시작 없이 즉시 적용
   - 다음 페이지 로드 시 프론트엔드에 반영

### 주의사항
- **adminPassword**: 평문으로 저장되므로 Strapi Admin 접근 권한 관리 중요
- **siteUsed**: `false` 설정 시 관리자도 접근 불가하므로 주의
- **enableVisitorTracking**: 개인정보 보호 정책에 따라 설정

### 🔄 향후 확장 계획
- 🔄 블로그 시스템 (데이터 모델 준비됨)
- 🔄 다국어 지원 (i18n)
- 🔄 검색 기능
- 🔄 댓글 시스템
- 🔄 분석 도구 연동
