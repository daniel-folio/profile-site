import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind CSS 클래스 병합을 위한 유틸리티
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 날짜 포맷팅
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// 날짜 범위 포맷팅
export function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate) return '날짜 미정';
  
  const start = formatDate(startDate);
  if (!endDate) return `${start} - 현재`;
  
  const end = formatDate(endDate);
  return `${start} - ${end}`;
}

// 프로젝트 상태에 따른 색상 반환
export function getStatusColor(projectStatus: string): string {
  switch (projectStatus) {
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800';
    case 'Planned':
      return 'bg-yellow-100 text-yellow-800';
    case 'On Hold':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// 프로젝트 타입에 따른 아이콘 반환
export function getProjectTypeIcon(type: string): string {
  switch (type) {
    case 'Web':
      return '🌐';
    case 'Mobile':
      return '📱';
    case 'Desktop':
      return '💻';
    case 'API':
      return '🔌';
    case 'Library':
      return '📚';
    default:
      return '📦';
  }
}

// 숙련도에 따른 별점 표시
export function getProficiencyStars(proficiency: number): string {
  return '★'.repeat(proficiency) + '☆'.repeat(5 - proficiency);
}

// 이미지 URL 생성
export function getImageUrl(url?: string): string {
  if (!url) return '/images/placeholder.jpg';
  if (url.startsWith('http')) return url;
  return `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${url}`;
} 