import React from 'react';

interface GithubBlogIconProps {
  size?: number;
  className?: string;
}

export function GithubBlogIcon({ size = 24, className }: GithubBlogIconProps) {
  return (
    <span
      className={`inline-flex items-center justify-center flex-shrink-0 align-middle ${className || ''}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/github-pages-logo.png"
        alt="GitHub Pages"
        width={size}
        height={size}
        className="w-full h-full object-contain opacity-75 hover:opacity-100 dark:invert transition-all duration-300"
      />
    </span>
  );
}
