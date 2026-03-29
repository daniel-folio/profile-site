/**
 * 프로젝트 카테고리 중앙 관리 파일 (Single Source of Truth)
 *
 * 이 파일을 수정하면 다음의 모든 곳에 자동으로 반영됩니다:
 *  - V1/V2 홈화면 프로젝트 필터 탭
 *  - V1/V2 이력서 프로젝트 카테고리 표시
 *  - 백엔드 Strapi schema.json (npm run dev/build 실행 시 자동 동기화)
 *
 * 항목 추가/삭제/순서 변경 모두 이 배열에서만 하면 됩니다.
 */
export const PROJECT_CATEGORY_ORDER = [
  'Ai',
  'Web',
  'API',
  'Mobile',
  'Desktop',
  'Library',
  'Other',
] as const;

export type ProjectCategory = typeof PROJECT_CATEGORY_ORDER[number];
