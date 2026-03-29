'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface LightboxImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
}

export default function LightboxImage({ 
    src, 
    alt, 
    width, 
    height, 
    priority = false, 
    className = '', 
    containerClassName = '',
    containerStyle = {}
}: LightboxImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <div 
        className={`cursor-zoom-in overflow-hidden ${containerClassName}`} 
        style={containerStyle}
        onClick={() => setIsOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className={`w-full transition-transform duration-300 hover:scale-[1.02] ${className || 'h-auto object-contain'}`}
        />
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-12"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative w-full h-full flex items-center justify-center max-w-[95vw] max-h-[95vh]">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
              className="absolute top-2 right-2 sm:top-[-10px] sm:right-[-40px] z-50 p-2 text-white bg-black/40 hover:bg-black/80 rounded-full transition-colors"
              aria-label="닫기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <img 
              src={src} 
              alt={alt} 
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </>
  );
}
