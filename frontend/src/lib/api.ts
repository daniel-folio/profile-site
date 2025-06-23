import { ProfileResponse } from '@/types/profile';
import { SkillsResponse } from '@/types/skill';
import { ProjectsResponse, ProjectResponse } from '@/types/project';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export function getStrapiMedia(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }
  if (url.startsWith('http')) {
    return url;
  }
  return `${STRAPI_URL}${url}`;
}

// API 응답을 파싱하는 헬퍼 함수
function parseStrapiResponse<T>(response: any): T {
  return response;
}

// 에러 처리를 위한 헬퍼 함수
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return parseStrapiResponse<T>(data);
}

// Profile API
export async function getProfile(): Promise<ProfileResponse> {
  const response = await fetch(`${STRAPI_URL}/api/profile?populate=*`, { cache: 'no-store' });
  return handleApiResponse<ProfileResponse>(response);
}

// Skills API
export async function getSkills(): Promise<SkillsResponse> {
  const response = await fetch(`${STRAPI_URL}/api/skills?populate=*&sort=order:asc`, { cache: 'no-store' });
  return handleApiResponse<SkillsResponse>(response);
}

// Projects API
export async function getProjects(featured?: boolean): Promise<ProjectsResponse> {
  const filters = featured ? '&filters[featured][$eq]=true' : '';
  const response = await fetch(`${STRAPI_URL}/api/projects?populate=*&sort=order:asc${filters}`, { cache: 'no-store' });
  return handleApiResponse<ProjectsResponse>(response);
}

export async function getProjectBySlug(slug: string): Promise<ProjectResponse> {
  const response = await fetch(`${STRAPI_URL}/api/projects?filters[slug][$eq]=${slug}&populate=*`, { cache: 'no-store' });
  const projectResponse = await handleApiResponse<ProjectsResponse>(response);
  return {
    data: projectResponse.data[0],
  };
}

export async function getAllProjectSlugs(): Promise<string[]> {
  const response = await fetch(`${STRAPI_URL}/api/projects?fields=slug`, { cache: 'no-store' });
  const data = await handleApiResponse<{ data: { slug: string }[] }>(response);
  if (!data || !Array.isArray(data.data)) {
    console.error('Invalid data structure for project slugs:', data);
    return [];
  }
  return data.data.map((project: { slug: string }) => project.slug);
} 