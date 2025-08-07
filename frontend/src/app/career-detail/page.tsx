import { getCompanies, getProjects, getCareerDetails, getProfile } from '@/lib/api';
import { Company } from '@/types/company';
import { Project } from '@/types/project';
import { Profile } from '@/types/profile';
import { CareerDetail } from '@/types/career-detail';
import { marked } from 'marked';
import { RichTextRenderer } from '@/components/ui/RichTextRenderer';
import CareerDetailPdfDownloadButton from '@/components/CareerDetailPdfDownloadButton';
import { useEffect } from 'react';
import CareerDetailClient from './CareerDetailClient';

// 이 페이지를 항상 동적으로 렌더링하여 캐시를 사용하지 않도록 설정합니다.
export const dynamic = 'force-dynamic';

export default async function CareerDetailPage() {
  const [companiesRes, projectsRes, careerDetailsRes, profileRes]: any[] = await Promise.all([
    getCompanies(undefined, { next: { revalidate: 3600 } }),
    getProjects(false, undefined, { next: { revalidate: 3600 } }),
    getCareerDetails(undefined, { next: { revalidate: 3600 } }),
    getProfile(undefined, { next: { revalidate: 3600 } }),
  ]);
  const companies: Company[] = Array.isArray(companiesRes?.data)
    ? companiesRes.data.map((item: any) => {
        const attrs = item.attributes ?? item;
        return { ...attrs, id: item.id };
      })
    : [];
  const projects: Project[] = Array.isArray(projectsRes?.data)
    ? projectsRes.data.map((item: any) => {
        const attrs = item.attributes ?? item;
        return {
          ...attrs,
          id: item.id,
          company: attrs.company?.data?.id ?? attrs.company?.id ?? null,
        };
      })
    : [];
  const careerDetails: CareerDetail[] = Array.isArray(careerDetailsRes?.data)
    ? careerDetailsRes.data.map((item: any) => {
        const attrs = item.attributes ?? item;
        return {
          ...attrs,
          id: item.id,
          project: attrs.project?.data?.id ?? attrs.project?.id ?? null,
        };
      })
    : [];
  let profile: Profile | null = null;
  if (profileRes?.data) {
    const data = Array.isArray(profileRes.data) ? profileRes.data[0] : profileRes.data;
    if (data) {
      profile = data.attributes ? { ...data.attributes, id: data.id } : data;
    }
  }
  return <CareerDetailClient companies={companies} projects={projects} careerDetails={careerDetails} profile={profile} />;
} 