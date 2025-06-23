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
      className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[calc(100vh-10rem)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-center md:justify-end md:order-last">
        <motion.div 
          className="relative w-64 h-80 md:w-80 md:h-96 lg:w-96 lg:h-[30rem]"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
        >
          {profileImageUrl && (
            <Image
              src={profileImageUrl}
              alt={profileImage?.alternativeText || 'Profile image'}
              fill
              sizes="(max-width: 768px) 16rem, (max-width: 1024px) 20rem, 24rem"
              className="rounded-full object-cover shadow-2xl"
              priority
            />
          )}
        </motion.div>
      </div>

      <div className="text-center md:text-left md:order-first px-4">
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