'use client';

import { Profile } from "@/types/profile";
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { getStrapiMedia } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/Button";
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { useState } from "react";

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
      <section id="hero" className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          {/* 로딩 스피너나 스켈레톤 UI를 여기에 추가할 수 있습니다. */}
          <p className="text-lg text-gray-600 dark:text-gray-400">프로필 정보를 불러오는 중...</p>
        </div>
      </section>
    );
  }
  
  const { name, title, bio, socialLinks, profileImage, email, resumeFile } = profile;
  const profileImageUrl = profileImage?.url ? getStrapiMedia(profileImage.url) : null;
  const resumeUrl = resumeFile?.url ? getStrapiMedia(resumeFile.url) : null;

  return (
    <motion.section
      id="hero"
      className="
        flex flex-col md:flex-row-reverse items-start justify-center
        min-h-[calc(100vh-10rem)] px-4
        gap-y-8
        md:gap-x-8
        lg:gap-x-24
        xl:gap-x-[190px]
        py-12 md:py-24
      "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 프로필 이미지 */}
      <div className="mt-0 md:mt-0 flex-shrink-0 flex justify-center md:justify-end w-full md:w-auto">
        <div className="relative w-40 h-52 md:w-52 md:h-64 lg:w-64 lg:h-[20rem] flex items-center justify-center">
          {/* Gradient Border */}
          <div className="absolute inset-0 rounded-[40%] p-1 bg-gradient-to-br from-primary-gradient-start via-white/30 to-primary-gradient-end blur-sm z-0" />
          {/* 완전 불투명 흰색 + subtle pastel gradient */}
          <div className="relative w-full h-full rounded-[40%] bg-white overflow-hidden z-10 flex items-center justify-center">
            <div className="absolute inset-0 rounded-[40%] bg-gradient-to-br from-white via-pink-100 to-blue-100 opacity-80" />
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
      </div>
      {/* 텍스트 영역 */}
      <div className="text-center md:text-left w-full md:w-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white">
            <span className="block mb-2 text-lg lg:text-xl font-medium text-primary-gradient-start">안녕하세요,</span>
            {!isTitleDone ? (
              <TypeAnimation
                sequence={[
                  `${name} - ${title}`,
                  1000,
                  () => setIsTitleDone(true),
                ]}
                wrapper="span"
                speed={30}
              />
            ) : (
              <span>{`${name} - ${title}`}</span>
            )}
          </h1>
          <div className="max-w-xl mx-auto md:mx-0 text-lg text-gray-600 dark:text-gray-300 mb-8 min-h-[6rem]">
            {isTitleDone && !isBioDone ? (
              <TypeAnimation
                sequence={[
                  bio,
                  1000,
                  () => setIsBioDone(true),
                ]}
                wrapper="p"
                speed={50}
              />
            ) : null}
            {isBioDone && <p>{bio}</p>}
          </div>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Link href="/#projects">
              <Button size="lg" variant="gradient">
                내 프로젝트 보기
              </Button>
            </Link>
            {resumeUrl && (
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="secondary">이력서 다운로드</Button>
              </a>
            )}
          </div>
          {socialLinks && (
            <div className="flex justify-center md:justify-start gap-6 mt-8">
              {socialLinks.github && (
                <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" aria-label="Github" className="text-gray-600 hover:text-teal-600 transition-colors duration-300">
                  <FaGithub size={32} />
                </a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-600 hover:text-teal-600 transition-colors duration-300">
                  <FaLinkedin size={32} />
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} aria-label="Email" className="text-gray-600 hover:text-teal-600 transition-colors duration-300">
                  <FaEnvelope size={32} />
                </a>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
} 