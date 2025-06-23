import React from 'react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 로고 및 소개 */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Portfolio</h3>
            <p className="text-gray-600 dark:text-gray-400">
              개발자로서의 성장 과정과 프로젝트들을 공유하는 개인 포트폴리오입니다.
            </p>
          </div>

          {/* 빠른 링크 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">빠른 링크</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  홈
                </Link>
              </li>
              <li>
                <Link href="/#skills" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  기술 스택
                </Link>
              </li>
              <li>
                <Link href="/#projects" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  프로젝트
                </Link>
              </li>
            </ul>
          </div>

          {/* 연락처 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">연락처</h4>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <p>이메일: daniel.han.developer@gmail.com</p>
              <p>위치: 서울, 대한민국</p>
            </div>
          </div>
        </div>

        {/* 저작권 */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; {currentYear} Portfolio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 