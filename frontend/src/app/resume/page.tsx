import { getProfile, getCompanies, getEducations, getSkills, getProjects, getCareerDetails, getOtherExperiences } from '@/lib/api';
import { Company } from '@/types/company';
import { Education } from '@/types/education';
import { Skill } from '@/types/skill';
import { Project } from '@/types/project';
import { Profile } from '@/types/profile';
import { CareerDetail } from '@/types/career-detail';
import { OtherExperience } from '@/types/other-experience';
import ResumePageClientV1 from '@/components/v1/pages/ResumePageClientV1';
import ResumePageClientV2 from '@/components/v2/pages/ResumePageClientV2';
import { getSiteSettings } from '@/lib/siteSettings';

// 실시간 반영을 위해 동적 렌더링 강제
export const dynamic = 'force-dynamic';

// 버전-컴포넌트 맵: 확장성을 위해 도입
const VERSION_COMPONENTS = {
  v1: ResumePageClientV1,
  v2: ResumePageClientV2,
  // v3: ResumePageClientV3,
} as const;

export default async function ResumePage() {
  // 캐시 없이 실시간 데이터를 가져오도록 모든 fetch 옵션 수정
  const [profileRes, companiesRes, educationsRes, skillsRes, projectsRes, careerDetailsResRaw, otherExperiencesRes]: any[] = await Promise.all([
    getProfile(undefined, { cache: 'no-store' }),
    getCompanies({ cache: 'no-store' }),
    getEducations({ cache: 'no-store' }),
    getSkills({ cache: 'no-store' }),
    getProjects(undefined, { cache: 'no-store' }),
    getCareerDetails({ cache: 'no-store' }),
    getOtherExperiences({ cache: 'no-store' }),
  ]);

  let profile: Profile | null = null;
  if (profileRes?.data) {
    const data = Array.isArray(profileRes.data) ? profileRes.data[0] : profileRes.data;
    if (data) {
      profile = data.attributes ? { ...data.attributes, id: data.id } : data;
    }
  }

  const companies: Company[] = Array.isArray(companiesRes?.data)
    ? companiesRes.data.map((item: any) => {
        const attrs = item.attributes ?? item;
        return { ...attrs, id: item.id };
      })
    : [];

  const educations: Education[] = Array.isArray(educationsRes?.data)
    ? educationsRes.data.map((item: any) => {
        const attrs = item.attributes ?? item;
        return { ...attrs, id: item.id };
      })
    : [];

  const skills: Skill[] = (skillsRes.data || []);

  const projects: Project[] = Array.isArray(projectsRes?.data)
    ? projectsRes.data.map((item: any) => {
        const attrs = item.attributes ?? item;
        return {
          ...attrs,
          id: item.id,
          company: attrs.company?.data?.id ?? attrs.company?.id ?? null,
          isPersonal: !!attrs.isPersonal,
        };
      })
    : [];

  let careerDetails: CareerDetail[] = [];
  if (careerDetailsResRaw && Array.isArray(careerDetailsResRaw.data)) {
    careerDetails = careerDetailsResRaw.data.map((item: any) => {
      const attrs = item.attributes ?? item;
      return {
        ...attrs,
        id: item.id,
        project: attrs.project?.data?.id ?? attrs.project?.id ?? null,
      };
    });
  }

  let otherExperiences: OtherExperience[] = [];
  if (otherExperiencesRes && Array.isArray(otherExperiencesRes.data)) {
    otherExperiences = otherExperiencesRes.data.map((item: any) => {
      const attrs = item.attributes ?? item;
      return {
        ...attrs,
        id: item.id,
      };
    });
  }

  // 백엔드 설정에서 포트폴리오 버전 확인
  const settings = await getSiteSettings();
  const version = settings.portfolioVersion || 'v1';
  
  // 버전 맵에서 컴포넌트 선택 (v1 폴백 포함)
  const PageComponent = VERSION_COMPONENTS[version as keyof typeof VERSION_COMPONENTS] ?? ResumePageClientV1;
  
  return <PageComponent
    profile={profile}
    companies={companies}
    educations={educations}
    skills={skills}
    projects={projects}
    careerDetails={careerDetails}
    otherExperiences={otherExperiences}
  />;
}