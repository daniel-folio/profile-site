'use client';

import React, { useState, useEffect } from 'react';

interface LightboxImageDef {
  src: string;
  alt: string;
}

export default function LightboxModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<LightboxImageDef[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && Array.isArray(customEvent.detail.images)) {
        setImages(customEvent.detail.images);
        setCurrentIndex(customEvent.detail.startIndex || 0);
        setIsOpen(true);
      }
    };

    window.addEventListener('open-lightbox', handleOpen);
    return () => window.removeEventListener('open-lightbox', handleOpen);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') setIsOpen(false);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  const handleNext = () => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md"
      onClick={() => setIsOpen(false)}
    >
      <div className="relative w-full h-full flex items-center justify-center max-w-[100vw]">
        {/* Close Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
          className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50 p-3 text-white/70 hover:text-white bg-black/40 hover:bg-black/80 rounded-full transition-colors"
          aria-label="닫기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        {/* Prev Button */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-2 sm:left-8 z-50 p-3 text-white/70 hover:text-white bg-black/40 hover:bg-black/80 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        )}

        {/* Image Display */}
        <div className="w-[85vw] h-[85vh] flex items-center justify-center relative select-none">
            <img 
              src={currentImage.src} 
              alt={currentImage.alt} 
              className="max-w-full max-h-full object-contain pointer-events-auto rounded shadow-2xl transition-all duration-300"
              onClick={(e) => e.stopPropagation()} 
            />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-2 sm:right-8 z-50 p-3 text-white/70 hover:text-white bg-black/40 hover:bg-black/80 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        )}
        
        {/* Count Indicator */}
        {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 bg-black/40 px-4 py-2 rounded-full text-sm font-mono tracking-wider">
                {currentIndex + 1} / {images.length}
            </div>
        )}
      </div>
    </div>
  );
}
