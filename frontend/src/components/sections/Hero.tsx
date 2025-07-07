'use client';

import { Profile } from "@/types/profile";
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { getStrapiMedia } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/Button";
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { useState, useEffect } from "react";
import { marked } from 'marked';
import { RichTextRenderer } from '@/components/ui/RichTextRenderer';

const VantaBackground = dynamic(() => import('@/components/layout/VantaBackground'), {
  ssr: false,
});

interface HeroProps {
  profile: Profile | null;
}

export function Hero({ profile }: HeroProps) {
  const [isTitleDone, setIsTitleDone] = useState(false);
  const [isBioDone, setIsBioDone] = useState(false);

  if (!profile) {
    return (
      <section id="hero" className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-16">
        <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mx-auto text-gray-400 dark:text-gray-500 mb-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">등록된 프로필 정보가 없습니다.</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">아직 프로필이 등록되지 않았습니다.<br />관리자 페이지에서 프로필을 등록해 주세요.</p>
      </section>
    );
  }
  
  const { name, title, mainBio, socialLinks, profileImage, email, resumeFile } = profile;
  const profileImageUrl = profileImage?.url ? getStrapiMedia(profileImage.url) : null;
  const resumeUrl = resumeFile?.url ? getStrapiMedia(resumeFile.url) : null;

  // 애니메이션 variants
  const fadeUpVariant = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
  };

  return (
    <motion.section
      id="hero"
      className="flex flex-col md:flex-row-reverse items-center justify-center px-4 pt-0 pb-8 md:pb-16 gap-y-8 md:gap-x-8 lg:gap-x-24 xl:gap-x-[190px] mt-6"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.25 } },
      }}
    >
      {/* 우측: 프로필 이미지 */}
      <motion.div
        className="mt-0 md:mt-0 flex-shrink-0 flex justify-center md:justify-end w-full md:w-auto"
        variants={fadeUpVariant}
      >
        <div className="relative w-40 h-52 md:w-52 md:h-64 lg:w-64 lg:h-[20rem] flex items-center justify-center">
          {/* Gradient Border */}
          <div className="absolute inset-0 rounded-[40%] p-1 bg-gradient-to-br from-primary-gradient-start via-white/30 to-primary-gradient-end blur-sm z-0" />
          {/* 완전 불투명 흰색 + subtle pastel gradient */}
          <div className="relative w-full h-full rounded-[40%] bg-white dark:bg-gray-800 overflow-hidden z-10 flex items-center justify-center">
            <div className="absolute inset-0 rounded-[40%] bg-gradient-to-br from-white via-pink-100 to-blue-100 opacity-80 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900" />
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt={profileImage?.alternativeText || 'Profile image'}
                fill
                sizes="(max-width: 768px) 10rem, (max-width: 1024px) 13rem, 16rem"
                className="rounded-[40%] object-cover relative z-10"
                priority
              />
            ) : (
              <Image
                src="/placeholder.svg"
                alt="Profile placeholder"
                fill
                sizes="(max-width: 768px) 10rem, (max-width: 1024px) 13rem, 16rem"
                className="rounded-[40%] object-cover relative z-10"
                priority
              />
            )}
          </div>
        </div>
      </motion.div>
      {/* 좌측: 텍스트 */}
      <motion.div
        className="z-10 text-left max-w-2xl w-full"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.25 } },
        }}
      >
        <motion.div variants={fadeUpVariant}>
          <span className="text-xs tracking-widest text-blue-500 dark:text-blue-400 font-bold">BACKEND DEVELOPER</span>
        </motion.div>
        <motion.h1 variants={fadeUpVariant} className="text-4xl lg:text-5xl font-extrabold mt-2 leading-tight text-gray-900 dark:text-white">
          안녕하세요,<br />
          저는 <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">{name}</span>입니다
        </motion.h1>
        <motion.div variants={fadeUpVariant} className="mt-4 text-xl font-semibold text-gray-800 dark:text-white/80">
          {title}
        </motion.div>
        {/* 자기소개 */}
        {mainBio && (
          <RichTextRenderer text={mainBio} className="mt-6 text-lg text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none" />
        )}
        <motion.div variants={fadeUpVariant} className="flex gap-4 mt-8 flex-wrap">
          <Link href="/#projects">
            <Button size="lg" variant="gradient" className="shadow-lg shadow-blue-400/30 hover:scale-105 transition-transform">
              내 프로젝트 보기
            </Button>
          </Link>
          {resumeUrl && (
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="secondary" className="shadow-lg shadow-purple-400/30 hover:scale-105 transition-transform">이력서 다운로드</Button>
            </a>
          )}
        </motion.div>
        {socialLinks && (
          <motion.div variants={fadeUpVariant} className="flex gap-6 mt-8">
            {socialLinks.github && (
              <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" aria-label="Github" className="text-gray-500 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300">
                <FaGithub size={32} />
              </a>
            )}
            {socialLinks.linkedin && (
              <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-500 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300">
                <FaLinkedin size={32} />
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} aria-label="Email" className="text-gray-500 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300">
                <FaEnvelope size={32} />
              </a>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.section>
  );
} 