'use client';

import { LogViewer } from '@/features/admin/components/LogViewer';

// 관리자 시스템 로그 페이지
// 인증은 /admin/layout.tsx에서 공통 처리
export default function AdminLogsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          시스템 로그
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          서버 에러 및 경고 로그를 확인합니다
        </p>
      </div>

      <LogViewer />
    </div>
  );
}
