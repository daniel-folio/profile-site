import { getCompanies, getProjects, getCareerDetails, getProfile } from '@/lib/api';
import { Company } from '@/types/company';
import { Project } from '@/types/project';
import { CareerDetail } from '@/types/career-detail';
import { marked } from 'marked';
import { RichTextRenderer } from '@/components/ui/RichTextRenderer';
import CareerDetailPdfDownloadButton from '@/components/CareerDetailPdfDownloadButton';
import { useEffect } from 'react';
import CareerDetailClient from './CareerDetailClient';

export default async function CareerDetailPage() {
  const [companiesRes, projectsRes, careerDetailsRes, profileRes]: any[] = await Promise.all([
    getCompanies({ cache: 'no-store' }),
    getProjects(undefined, { cache: 'no-store' }),
    getCareerDetails({ cache: 'no-store' }),
    getProfile(undefined, { cache: 'no-store' }),
  ]);
  const companies = Array.isArray(companiesRes?.data)
    ? companiesRes.data.map((item: any) => item.attributes ?? item)
    : [];
  const projects = Array.isArray(projectsRes?.data)
    ? projectsRes.data.map((item: any) => {
        const attrs = item.attributes ?? item;
        return {
          ...attrs,
          id: item.id,
          company: attrs.company?.id ?? null,
        };
      })
    : [];
  const careerDetails = Array.isArray(careerDetailsRes?.data)
    ? careerDetailsRes.data.map((item: any) => {
        const attrs = item.attributes ?? item;
        return {
          ...attrs,
          id: item.id,
          project: attrs.project?.id ?? null,
        };
      })
    : [];
  const profile = profileRes?.data ?? null;
  return <CareerDetailClient companies={companies} projects={projects} careerDetails={careerDetails} profile={profile} />;
} 