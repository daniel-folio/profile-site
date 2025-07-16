import { getProfile, getCompanies, getEducations, getSkills, getProjects, getCareerDetails, getOtherExperiences } from '@/lib/api';
import { Company } from '@/types/company';
import { Education } from '@/types/education';
import { Skill } from '@/types/skill';
import { Project } from '@/types/project';
import { Profile } from '@/types/profile';
import { CareerDetail } from '@/types/career-detail';
import { OtherExperience } from '@/types/other-experience';
import ResumePageClient from './ResumePageClient';

export default async function ResumePage() {
  const [profileRes, companiesRes, educationsRes, skillsRes, projectsRes, careerDetailsResRaw, otherExperiencesRes]: any[] = await Promise.all([
    getProfile(undefined, { next: { revalidate: 3600 } }),
    getCompanies({ next: { revalidate: 3600 } }),
    getEducations({ next: { revalidate: 3600 } }),
    getSkills({ next: { revalidate: 3600 } }),
    getProjects(undefined, { next: { revalidate: 3600 } }),
    getCareerDetails({ next: { revalidate: 3600 } }),
    getOtherExperiences({ next: { revalidate: 3600 } }),
  ]);
  let profile: Profile | null = null;
  if (profileRes?.data) {
    const data = Array.isArray(profileRes.data) ? profileRes.data[0] : profileRes.data;
    if (data) {
      profile = data.attributes ? { ...data.attributes, id: data.id } : data;
    }
  }
  const companies: Company[] = Array.isArray(companiesRes?.data)
    ? companiesRes.data.map((item: any) => item.attributes ?? item)
    : [];
  const educations: Education[] = Array.isArray(educationsRes?.data)
    ? educationsRes.data.map((item: any) => item.attributes ?? item)
    : [];
  const skills: Skill[] = (skillsRes.data || []).filter((skill: Skill) => skill.visible !== false);
  const projects: Project[] = Array.isArray(projectsRes?.data)
    ? projectsRes.data.map((item: any) => {
        const attrs = item.attributes ?? item;
        return {
          ...attrs,
          id: item.id,
          company: attrs.company?.id ?? null,
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
        project: attrs.project?.id ?? null,
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
  return (
    <ResumePageClient
      profile={profile}
      companies={companies}
      educations={educations}
      skills={skills}
      projects={projects}
      careerDetails={careerDetails}
      otherExperiences={otherExperiences}
    />
  );
} 