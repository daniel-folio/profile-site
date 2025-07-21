"use client";
import { FaBolt } from "react-icons/fa6";
import Player from "lottie-react";
import developerAnimation from "@/../public/lottie/developer.json";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-white">
      <div className="flex items-center gap-2 mb-4 px-6 py-3 rounded-xl shadow-lg bg-yellow-50/90 dark:bg-yellow-900/80 border border-yellow-200 dark:border-yellow-700">
        <FaBolt className="text-yellow-500 animate-pulse" size={22} />
        <span className="font-semibold text-yellow-900 dark:text-yellow-100 text-base">
          안내: 본 사이트는 무료 서버 환경에서 운영되어 첫 접속 시 로딩이 느릴 수 있습니다.
        </span>
      </div>
      <div className="relative flex items-center justify-center mb-2">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <div className="absolute">
          <FaBolt className="text-yellow-400 animate-ping" size={24} />
        </div>
      </div>
      <div className="w-40 h-40 mb-2 flex items-center justify-center">
        <Player
          key="developer-lottie"
          autoplay
          loop
          animationData={developerAnimation}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <div className="text-gray-700 dark:text-gray-200 text-sm font-medium tracking-wide">
        잠시만 기다려 주세요...
      </div>
    </div>
  );
} 