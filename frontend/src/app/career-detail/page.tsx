import { getCompanies, getProjects, getCareerDetails, getProfile } from '@/lib/api';
import { Company } from '@/types/company';
import { Project } from '@/types/project';
import { Profile } from '@/types/profile';
import { CareerDetail } from '@/types/career-detail';
import CareerDetailClientV1 from '@/components/v1/pages/CareerDetailClientV1';
import CareerDetailClientV2 from '@/components/v2/pages/CareerDetailClientV2';
import { getSiteSettings } from '@/lib/siteSettings';

// 이 페이지를 항상 동적으로 렌더링하여 캐시를 사용하지 않도록 강제합니다.
export const dynamic = 'force-dynamic';

// 버전-컴포넌트 맵: 하드코딩 제거 및 확장성 확보
const VERSION_COMPONENTS = {
  v1: CareerDetailClientV1,
  v2: CareerDetailClientV2,
  // v3: CareerDetailClientV3,
} as const;

export default async function CareerDetailPage() {
  // 모든 데이터를 캐시 없이 실시간으로 가져옵니다.
  const [companiesRes, projectsRes, careerDetailsRes, profileRes]: any[] = await Promise.all([
    getCompanies({ cache: 'no-store' }),
    getProjects(false, { cache: 'no-store' }),
    getCareerDetails({ cache: 'no-store' }),
    getProfile(undefined, { cache: 'no-store' }),
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

  // 백엔드 설정에서 포트폴리오 버전 확인
  const settings = await getSiteSettings();
  const version = settings.portfolioVersion || 'v1';
  
  // 버전 맵에서 컴포넌트 선택 (v1 폴백 포함)
  const PageComponent = VERSION_COMPONENTS[version as keyof typeof VERSION_COMPONENTS] ?? CareerDetailClientV1;

  return <PageComponent 
    companies={companies} 
    projects={projects} 
    careerDetails={careerDetails} 
    profile={profile} 
  />;
}