'use client';

import { useState, useEffect } from 'react';
import { useVisitorStats } from '@/hooks/useVisitorTracking';
import { VisitorAnalyticsDashboard } from '@/components/admin/VisitorAnalyticsDashboard';

// 관리자 방문자 분석 페이지
export default function AdminVisitorsPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // URL에서 패스워드 확인 (보안상 권장하지 않지만 기존 호환성을 위해 유지)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlPassword = urlParams.get('password');
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    
    // 환경변수가 설정되지 않은 경우 에러 표시
    if (!adminPassword) {
      setError('관리자 패스워드가 설정되지 않았습니다. 환경변수를 확인해주세요.');
      return;
    }
    
    if (urlPassword === adminPassword) {
      setIsAuthorized(true);
      // URL에서 패스워드 제거
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // 패스워드 인증 처리
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    
    // 환경변수가 설정되지 않은 경우 에러 표시
    if (!adminPassword) {
      setError('관리자 패스워드가 설정되지 않았습니다. 환경변수를 확인해주세요.');
      return;
    }
    
    if (password === adminPassword) {
      setIsAuthorized(true);
      setError('');
      // 로그인 성공 시 세션 스토리지에 인증 상태 저장
      sessionStorage.setItem('admin_authenticated', 'true');
    } else {
      setError('올바르지 않은 패스워드입니다.');
    }
  };

  // 페이지 로드 시 세션 스토리지에서 인증 상태 확인
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('admin_authenticated');
    if (isAuthenticated === 'true') {
      setIsAuthorized(true);
    }
  }, []);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              관리자 인증
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              방문자 분석 대시보드에 접근하려면 패스워드를 입력하세요
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleAuth}>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                패스워드
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="관리자 패스워드"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
              >
                로그인
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    setIsAuthorized(false);
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              방문자 분석 대시보드
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              실시간 방문자 통계 및 상세 분석
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
          >
            로그아웃
          </button>
        </div>
        
        <VisitorAnalyticsDashboard />
      </div>
    </div>
  );
}
