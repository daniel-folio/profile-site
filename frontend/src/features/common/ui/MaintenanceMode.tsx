'use client';

import { useEffect, useState } from 'react';
import { getSiteSettings } from '@/features/common/api/siteSettings';

interface SiteAccessProps {
  children: React.ReactNode;
  initialSiteUsed?: boolean;
}

export function MaintenanceMode({ children, initialSiteUsed }: SiteAccessProps) {
  const [isSiteBlocked, setIsSiteBlocked] = useState<boolean>(
    initialSiteUsed !== undefined ? !initialSiteUsed : false
  );
  const [loading, setLoading] = useState<boolean>(initialSiteUsed === undefined);

  useEffect(() => {
    // initialSiteUsed가 서버에서 제공된 경우 추가 블로킹 패칭 없이 바로 적용
    if (initialSiteUsed !== undefined) {
      setIsSiteBlocked(!initialSiteUsed);
      setLoading(false);
      return;
    }

    const checkSiteAccess = async () => {
      try {
        const settings = await getSiteSettings();
        setIsSiteBlocked(!settings.siteUsed);
      } catch (error) {
        console.error('Failed to check site access:', error);
        setIsSiteBlocked(false);
      } finally {
        setLoading(false);
      }
    };

    checkSiteAccess();
  }, [initialSiteUsed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (isSiteBlocked) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6 p-8">
          <div className="text-6xl mb-6">🔧</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            사이트 점검 중
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 whitespace-nowrap">
            더 나은 서비스를 위해 시스템 점검을 진행하고 있습니다.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            잠시 후 다시 방문해 주세요.
          </p>
          <div className="mt-8">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
