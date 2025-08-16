'use client';

import { useVisitorTracking } from '@/hooks/useVisitorTracking';

// 방문자 추적 컴포넌트
export function VisitorTracker() {
  useVisitorTracking();
  
  // UI를 렌더링하지 않는 추적 전용 컴포넌트
  return null;
}
