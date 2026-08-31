import React from 'react';

interface GithubBlogIconProps {
  size?: number;
  className?: string;
}

export function GithubBlogIcon({ size = 24, className }: GithubBlogIconProps) {
  return (
    <span
      className={`inline-block flex-shrink-0 align-middle transition-colors duration-300 ${className || ''}`}
      style={{
        width: size,
        height: size,
        backgroundColor: 'currentColor',
        maskImage: 'url(/github-pages-logo.png)',
        WebkitMaskImage: 'url(/github-pages-logo.png)',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
      aria-label="GitHub Pages"
    />
  );
}
