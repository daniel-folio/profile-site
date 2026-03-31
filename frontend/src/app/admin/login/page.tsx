'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { validateAdminPassword } from '@/features/common/api/siteSettings';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 이미 인증된 경우 바로 이동
  useEffect(() => {
    if (sessionStorage.getItem('admin_authenticated') === 'true') {
      const redirect = searchParams.get('redirect') || '/admin/visitors';
      router.replace(redirect);
    }
  }, []);

  // URL 패스워드 파라미터 처리 (기존 호환성)
  useEffect(() => {
    const urlPassword = searchParams.get('password');
    if (urlPassword) {
      handleLoginWithPassword(urlPassword);
      // URL에서 패스워드 제거
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLoginWithPassword = async (pw: string) => {
    try {
      const isValid = await validateAdminPassword(pw);
      if (isValid) {
        sessionStorage.setItem('admin_authenticated', 'true');
        const redirect = searchParams.get('redirect') || '/admin/visitors';
        router.replace(redirect);
      }
    } catch (e) {
      console.error('URL password validation failed:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('패스워드를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const isValid = await validateAdminPassword(password);
      if (isValid) {
        sessionStorage.setItem('admin_authenticated', 'true');
        const redirect = searchParams.get('redirect') || '/admin/visitors';
        router.replace(redirect);
      } else {
        setError('올바르지 않은 패스워드입니다.');
      }
    } catch (err) {
      setError('패스워드 검증 중 오류가 발생했습니다. Strapi 서버 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* 로고 / 제목 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg shadow-blue-500/25">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
          <p className="mt-2 text-sm text-gray-400">관리자 인증이 필요합니다</p>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-gray-300 mb-2">
                패스워드
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  className="w-full px-4 py-3 pr-12 bg-gray-900/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition text-sm"
                  placeholder="관리자 패스워드를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-500 hover:text-gray-300 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-500 hover:text-gray-300 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-blue-500/25"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  검증 중...
                </span>
              ) : (
                '로그인'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
