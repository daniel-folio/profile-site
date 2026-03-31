'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// /admin 접근 시 기본 페이지(방문자 분석)로 리다이렉트
export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/visitors');
  }, [router]);

  return null;
}
