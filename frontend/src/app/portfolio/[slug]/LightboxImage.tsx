'use client';

import React from 'react';
import Image from 'next/image';

interface LightboxImageDef {
  src: string;
  alt: string;
}

interface LightboxImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  galleryImages?: LightboxImageDef[];
  indexInGallery?: number;
}

export default function LightboxImage({ 
    src, 
    alt, 
    width, 
    height, 
    priority = false, 
    className = '', 
    containerClassName = '',
    containerStyle = {},
    galleryImages = [],
    indexInGallery = 0
}: LightboxImageProps) {

  const handleOpenLightbox = () => {
    // Determine the images to show in the gallery mode
    let imagesToSend: LightboxImageDef[] = [];
    let startIndex = 0;

    if (galleryImages.length > 0) {
      imagesToSend = galleryImages;
      startIndex = indexInGallery;
    } else {
      // Single image fallback
      imagesToSend = [{ src, alt }];
      startIndex = 0;
    }

    const event = new CustomEvent('open-lightbox', {
      detail: {
        images: imagesToSend,
        startIndex: startIndex
      }
    });
    window.dispatchEvent(event);
  };

  return (
    <div 
      className={`cursor-zoom-in overflow-hidden ${containerClassName}`} 
      style={containerStyle}
      onClick={handleOpenLightbox}
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
  );
}
