import { getProfile, getCompanies, getEducations, getSkills, getProjects, getCareerDetails, getOtherExperiences } from '@/lib/api';
import { Company } from '@/types/company';
import { Education } from '@/types/education';
import { Skill } from '@/types/skill';
import { Project } from '@/types/project';
import { Profile } from '@/types/profile';
import { CareerDetail } from '@/types/career-detail';
import { OtherExperience } from '@/types/other-experience';
import Link from 'next/link';
import { RichTextRenderer } from '@/components/ui/RichTextRenderer';

// 회사 경력 개월 수 계산 함수
function getMonthDiff(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sy, sm] = start.split('-').map(Number);
  const [ey, em] = end.split('-').map(Number);
  return (ey - sy) * 12 + (em - sm) + 1;
}

// 'N년 M개월' 또는 'N개월'로 표기하는 함수
function getPeriodText(months: number): string {
  const years = Math.floor(months / 12);
  const remainMonths = months % 12;
  let result = '';
  if (years > 0) result += `${years}년`;
  if (remainMonths > 0) result += ` ${remainMonths}개월`;
  return result.trim();
}

export default async function ResumePage() {
  const [profileRes, companiesRes, educationsRes, skillsRes, projectsRes, careerDetailsResRaw, otherExperiencesRes]: any[] = await Promise.all([
    getProfile(),
    getCompanies(),
    getEducations(),
    getSkills(),
    getProjects(),
    getCareerDetails(),
    getOtherExperiences(),
  ]);
  const profile: Profile | null = profileRes?.data ?? null;
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
  // visible=true만, 시작일 내림차순 정렬, 카테고리별 분리
  const visibleExperiences = otherExperiences.filter(a => a.visible);
  const sortedExperiences = [...visibleExperiences].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const classExperiences = sortedExperiences.filter(a => a.category === 'Class');
  const etcExperiences = sortedExperiences.filter(a => a.category === 'ETC');

  // Only include companies with at least one project
  const filteredCompanies = companies.filter(company => {
    return projects.some(proj => proj.company === company.id);
  });
  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    if (a.order != null && b.order != null && a.order !== b.order) return b.order - a.order;
    if (a.order != null && b.order == null) return -1;
    if (a.order == null && b.order != null) return 1;
    // 기간 비교 (endDate, startDate)
    const aDate = a.endDate || a.startDate || '';
    const bDate = b.endDate || b.startDate || '';
    if (aDate !== bDate) return bDate.localeCompare(aDate);
    // id 비교
    return (b.id || 0) - (a.id || 0);
  });

  // 프로젝트 정렬 (회사별)
  const getSortedProjects = (companyId: number) => {
    return projects.filter((proj) => proj.company === companyId).sort((a, b) => {
      if (a.order != null && b.order != null && a.order !== b.order) return b.order - a.order;
      if (a.order != null && b.order == null) return -1;
      if (a.order == null && b.order != null) return 1;
      const aDate = a.endDate || a.startDate || '';
      const bDate = b.endDate || b.startDate || '';
      if (aDate !== bDate) return bDate.localeCompare(aDate);
      return (b.id || 0) - (a.id || 0);
    });
  };

  // 경력기술서 정렬 (프로젝트별)
  const getSortedCareerDetails = (projectId: number) => {
    return careerDetails.filter((cd) => {
      if (typeof cd.project === 'object' && cd.project !== null && 'id' in cd.project) {
        return cd.project.id === projectId;
      }
      return cd.project === projectId;
    }).sort((a, b) => {
      if (a.order != null && b.order != null && a.order !== b.order) return b.order - a.order;
      if (a.order != null && b.order == null) return -1;
      if (a.order == null && b.order != null) return 1;
      const aDate = a.endDate || a.startDate || '';
      const bDate = b.endDate || b.startDate || '';
      if (aDate !== bDate) return bDate.localeCompare(aDate);
      return (b.id || 0) - (a.id || 0);
    });
  };

  const CATEGORY_ORDER = ["Backend", "Frontend", "Database", "Tools", "Server", "Other"];
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <main className="max-w-6xl mx-auto pt-24 md:pt-32 pb-12 px-4">
      <div className="bg-white/80 dark:bg-black/50 rounded-xl p-8 flex flex-col gap-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">이력서 (Resume)</h1>

        {/* 프로필 요약 */}
        {profile ? (
          <section className="mb-0">
            <div className="flex items-center gap-4">
              {profile.showProfileImage !== false && profile.profileImage?.url && (
                <img src={profile.profileImage.url} alt={profile.name} className="w-32 h-40 object-contain bg-white border" style={{ aspectRatio: '3/4' }} />
              )}
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{profile.name}</div>
                <div className="text-gray-700 dark:text-gray-100">{profile.title}</div>
                <div className="text-sm text-gray-600 dark:text-gray-200">{profile.email} {profile.showPhone !== false && profile.phone && <>| {profile.phone}</>}</div>
                <div className="text-sm text-gray-600 dark:text-gray-200">{profile.location}</div>
              </div>
            </div>
            {profile.resumeBio && (
              <RichTextRenderer text={profile.resumeBio} className="mt-2 text-gray-900 dark:text-gray-100 prose dark:prose-invert max-w-none" />
            )}
          </section>
        ) : (
          <div className="text-gray-500 mb-8">프로필 정보가 없습니다.</div>
        )}

        <hr className='my-8 border border-gray-500/40 dark:border-gray-300/20' />

        {/* 경력 */}
        <section className="mb-0">
          <h2 className="text-xl font-semibold mb-4 text-orange-500 dark:text-orange-300">경력 (Company)</h2>
          {sortedCompanies.length > 0 ? (
            <ul className="space-y-4">
              {sortedCompanies.map((comp, idx) => {
                // 회사에 속한 프로젝트들
                const companyProjects = getSortedProjects(comp.id);
                // 회사 재직 기간/개월수
                const start = comp.startDate;
                const end = comp.endDate || '현재';
                const months = getMonthDiff(comp.startDate, comp.endDate || new Date().toISOString().slice(0, 7));
                // 회사 설명
                const companyDesc = comp.description;
                return (
                  <li key={idx} className="pb-4 ml-8">
                    {/* 회사명+직책, 기간, 개월수 */}
                    <div className="flex items-center gap-2 mb-1">
                      {comp.companyLogo?.url ? (
                        <img src={comp.companyLogo.url} alt={comp.company + ' 로고'} className="w-8 h-8 rounded bg-white object-contain border" />
                      ) : (
                        <img src="/placeholder.svg" alt="로고 없음" className="w-8 h-8 rounded bg-white object-contain border" />
                      )}
                      <span className="font-bold text-lg text-gray-900 dark:text-white">{comp.company}</span>
                      {comp.position && <span className="ml-1 text-base text-gray-700 dark:text-gray-200">- {comp.position}</span>}
                    </div>
                    <div className="text-xs text-gray-500 ml-10">
                      {start} ~ {end}
                      {months && <span> ({getPeriodText(months)})</span>}
                    </div>
                    {/* 회사 설명 */}
                    {companyDesc && <div className="text-sm text-gray-700 dark:text-gray-300 ml-10 mb-1">{companyDesc}</div>}
                    {/* 프로젝트 리스트 */}
                    {companyProjects.length > 0 ? (
                      <ul className="ml-10 mt-2 space-y-2">
                        {companyProjects.map((proj) => {
                          // 해당 프로젝트에 연결된 경력기술서
                          const matchedCareerDetails = getSortedCareerDetails(proj.id);
                          const hasCareerDetail = matchedCareerDetails.length > 0;
                          const careerHref = hasCareerDetail ? `/career-detail#cd-${matchedCareerDetails[0].id}` : undefined;
                          return (
                            <li key={proj.id}>
                              <div className="flex items-center gap-2">
                                <span className="text-black dark:text-white text-lg font-bold">●</span>
                                {hasCareerDetail ? (
                                  <Link href={careerHref!} className="font-semibold text-base text-blue-700 dark:text-blue-300 underline">
                                    {proj.title}
                                  </Link>
                                ) : (
                                  <span className="font-semibold text-base text-gray-900 dark:text-white">{proj.title}</span>
                                )}
                                <span className="ml-2 text-xs text-gray-500">
                                  {proj.startDate}{proj.endDate ? ` ~ ${proj.endDate}` : proj.startDate ? ' ~ 현재' : ''}
                                </span>
                              </div>
                              {/* 기간, 요약, 스킬을 같은 들여쓰기에서 block으로 배치 */}
                              {(proj.shortDescription || (Array.isArray(proj.technologies?.data) && proj.technologies.data.length > 0)) && (
                                <div className="ml-10">
                                  {proj.shortDescription && (
                                    <RichTextRenderer text={proj.shortDescription} className="text-sm text-gray-700 dark:text-gray-200" />
                                  )}
                                  {Array.isArray(proj.technologies?.data) && proj.technologies.data.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {proj.technologies.data.map((tech) => (
                                        <span key={tech.id} className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded px-2 py-1 text-xs">
                                          {tech.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {/* 회사별 스킬 하단에 명확하게 표시 */}
                                  {Array.isArray(comp.skills) && comp.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4 mb-2">
                                      {comp.skills.map((skill) => (
                                        <span key={skill.id} className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded px-2 py-1 text-xs">
                                          {skill.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="text-gray-400 ml-10">등록된 프로젝트가 없습니다.</div>
                    )}
                    
                    
                    {/* 하위 항목 구분선 */}
                    {idx < sortedCompanies.length - 1 && <hr className="my-4 border border-gray-400/20 dark:border-gray-300/10" />}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-gray-500 ml-8">경력 정보가 없습니다.</div>
          )}
        </section>

        {projects.filter((proj) => proj.company == null && proj.visible !== false).length > 0 && (
          <>
            <hr className='my-8 border border-gray-500/40 dark:border-gray-300/20' />
            <section className="mb-0">
              <h2 className="text-xl font-semibold mb-4 text-orange-500 dark:text-orange-300">
                개인 프로젝트 (Personal Project)
              </h2>
              <ul className="space-y-4">
                {projects.filter((proj) => proj.company == null && proj.visible !== false).map((proj, idx, arr) => {
                  const matchedCareerDetail = careerDetails.find(cd => {
                    if (typeof cd.project === 'object' && cd.project !== null && 'id' in cd.project) {
                      return cd.project.id === proj.id;
                    }
                    return cd.project === proj.id;
                  });
                  return (
                    <li key={proj.id} className="ml-8">
                      <div className="font-semibold text-base text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <span className="text-black dark:text-white text-lg font-bold">●</span>
                        {proj.title}
                        <span className="ml-2 text-xs text-gray-500">
                          {proj.startDate}{proj.endDate ? ` ~ ${proj.endDate}` : proj.startDate ? ' ~ 현재' : ''}
                        </span>
                      </div>
                      {proj.shortDescription && (
                        <RichTextRenderer text={proj.shortDescription} className="mt-1 text-gray-700 dark:text-gray-200 ml-2" />
                      )}
                      {Array.isArray(proj.technologies?.data) && proj.technologies.data.length > 0 && (
                        <div className={`flex flex-wrap gap-2 ml-8${proj.shortDescription ? ' mt-1' : ''}`}>
                          {proj.technologies.data.map((tech) => (
                            <span key={tech.id} className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded px-2 py-1 text-xs">
                              {tech.name}
                            </span>
                          ))}
                        </div>
                      )}
                      {matchedCareerDetail && (
                        <div className="ml-8 mt-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                          <Link href={`/career-detail#cd-${matchedCareerDetail.id}`} className="text-blue-700 dark:text-blue-300 underline font-semibold">
                            경력기술서 바로가기
                          </Link>
                        </div>
                      )}
                      {idx < arr.length - 1 && <hr className="my-4 border border-gray-400/20 dark:border-gray-300/10" />}
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}

        {skills && skills.length > 0 && (
          <>
            <hr className='my-8 border border-gray-500/40 dark:border-gray-300/20' />
            <section className="mb-0">
              <h2 className="text-xl font-semibold mb-4 text-orange-500 dark:text-orange-300">
                기술 스택 (Skills)
              </h2>
              <div className="space-y-1">
                <ul className="ml-8">
                  {CATEGORY_ORDER.filter(category => skillsByCategory[category]).map((category) => (
                    <li key={category} className="grid grid-cols-[max-content_1fr] items-start mb-2">
                      <span className="font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap pr-2">
                        {category} :
                      </span>
                      <div className="flex flex-wrap gap-2 min-w-0">
                        {skillsByCategory[category]
                          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                          .map((skill) => (
                            <span
                              key={skill.id}
                              className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded px-3 py-1 text-sm"
                            >
                              {skill.name}
                            </span>
                          ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </>
        )}

        <hr className='my-8 border border-gray-500/40 dark:border-gray-300/20' />
        {/* 학력 - 학위 완전 제거, 학과만 띄어쓰기로 */}
        <section className="mb-0">
          <h2 className="text-xl font-semibold mb-4 text-orange-500 dark:text-orange-300">학력 (Education)</h2>
          {educations.length > 0 ? (
            <ul className="space-y-2">
              {educations.map((edu, idx) => (
                <li key={idx} className="pb-2 flex items-start gap-3 ml-8">
                  {edu.logo?.url ? (
                    <img src={edu.logo.url} alt={edu.institution + ' 로고'} className="w-8 h-8 rounded bg-white object-contain border mt-1" />
                  ) : (
                    <img src="/placeholder.svg" alt="로고 없음" className="w-8 h-8 rounded bg-white object-contain border mt-1" />
                  )}
                  <div className="flex flex-col justify-center">
                    <div className="font-bold text-gray-900 dark:text-white">{edu.institution}{edu.field && ` ${edu.field}`}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">{edu.startDate} ~ {edu.endDate || '현재'}</div>
                    {edu.description && (
                      <RichTextRenderer text={edu.description} className="mt-1 text-gray-700 dark:text-gray-200" />
                    )}
                  </div>
                  {/* 하위 항목 구분선 */}
                  {idx < educations.length - 1 && <hr className="my-4 border border-gray-400/20 dark:border-gray-300/10 col-span-2 w-full" />}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 ml-8">학력 정보가 없습니다.</div>
          )}
        </section>

        {/* 기타경험 (Other Experience) - 학력 아래 */}
        {(classExperiences.length > 0 || etcExperiences.length > 0) && (
          <>
            <hr className='my-8 border border-gray-500/40 dark:border-gray-300/20' />
            <section className="mb-0">
              <h2 className="text-xl font-semibold mb-4 text-orange-500 dark:text-orange-300">기타경험 (Other Experience)</h2>
              {classExperiences.length > 0 && (
                <div className="mb-4 ml-8">
                  <div className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">Class.</div>
                  <ul className="list-disc ml-6 space-y-1 text-gray-900 dark:text-gray-100">
                    {classExperiences.map(act => (
                      <li key={act.id}>
                        {act.title}
                        {act.startDate && (
                          <span className="text-xs text-gray-500 ml-2">
                            {act.startDate}{act.endDate ? ` ~ ${act.endDate}` : ''}
                          </span>
                        )}
                        {act.description && (
                          <div className="text-sm text-gray-700 dark:text-gray-200">{act.description}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Class와 ETC 사이 경계선: 둘 다 있을 때만 */}
              {classExperiences.length > 0 && etcExperiences.length > 0 && (
                <hr className='my-6 border border-gray-400/20 dark:border-gray-300/10' />
              )}
              {etcExperiences.length > 0 && (
                <div className="ml-8">
                  <div className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">ETC.</div>
                  <ul className="list-disc ml-6 space-y-1 text-gray-900 dark:text-gray-100">
                    {etcExperiences.map(act => (
                      <li key={act.id}>
                        {act.title}
                        {act.startDate && (
                          <span className="text-xs text-gray-500 ml-2">
                            {act.startDate}{act.endDate ? ` ~ ${act.endDate}` : ''}
                          </span>
                        )}
                        {act.description && (
                          <div className="text-sm text-gray-700 dark:text-gray-200">{act.description}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
} 