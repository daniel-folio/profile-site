import { getCompanies, getProjects, getCareerDetails } from '@/lib/api';
import { Company } from '@/types/company';
import { Project } from '@/types/project';
import { CareerDetail } from '@/types/career-detail';
import { marked } from 'marked';
import { RichTextRenderer } from '@/components/ui/RichTextRenderer';

export default async function CareerDetailPage() {
  const [companiesRes, projectsRes, careerDetailsRes]: any[] = await Promise.all([
    getCompanies(),
    getProjects(),
    getCareerDetails(),
  ]);
  const companies: Company[] = Array.isArray(companiesRes?.data)
    ? companiesRes.data.map((item: any) => item.attributes ?? item)
    : [];
  const projects: Project[] = Array.isArray(projectsRes?.data)
    ? projectsRes.data.map((item: any) => {
        const attrs = item.attributes ?? item;
        return {
          ...attrs,
          id: item.id,
          company: attrs.company?.id ?? null,
        };
      })
    : [];
  const careerDetails: CareerDetail[] = Array.isArray(careerDetailsRes?.data)
    ? careerDetailsRes.data.map((item: any) => {
        const attrs = item.attributes ?? item;
        return {
          ...attrs,
          id: item.id,
          project: attrs.project?.id ?? null,
        };
      })
    : [];

  // 회사 정렬
  const sortedCompanies = [...companies].sort((a, b) => {
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

  return (
    <main className="max-w-6xl mx-auto pt-24 md:pt-32 pb-12 px-4">
      <div className="bg-white/80 dark:bg-black/50 rounded-xl p-8 flex flex-col gap-8">
        <h1 className="text-3xl font-bold mb-8">경력기술서</h1>
        {/* 회사별로 그룹화 */}
        {careerDetails.length > 0 ? (
          <ul className="space-y-8">
            {sortedCompanies.map((comp, idx) => {
              // 회사에 속한 프로젝트들
              const companyProjects = getSortedProjects(comp.id);
              return (
                <li key={idx} className="border-b pb-4">
                  {/* 회사명 */}
                  <div className="font-bold text-lg text-gray-900 dark:text-white mb-2">{comp.company}</div>
                  {/* 프로젝트 리스트 */}
                  {companyProjects.length > 0 ? (
                    companyProjects.map((proj) => {
                      // 해당 프로젝트에 연결된 경력기술서
                      const matchedCareerDetails = getSortedCareerDetails(proj.id);
                      return (
                        <div key={proj.id} className="ml-4 mb-4">
                          {/* 프로젝트명 + 기간 */}
                          <div className="font-semibold text-base text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            {proj.title}
                            <span className="ml-2 text-xs text-gray-500">
                              {proj.startDate} ~ {proj.endDate}
                            </span>
                          </div>
                          {/* 환경(스킬) 한 줄, 역할은 줄 바꿈하여 아래에 */}
                          {matchedCareerDetails.length > 0 && matchedCareerDetails.map(cd => (
                            <div key={cd.id} className="ml-8 mt-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                              {Array.isArray(proj.technologies) && proj.technologies.length > 0 && (
                                <div className="flex items-center flex-wrap gap-2 mb-1">
                                  <b className="text-gray-900 dark:text-white">환경:</b>
                                  {proj.technologies.map((skill) => (
                                    <span key={skill.id} className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded px-2 py-1 text-xs">
                                      {skill.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {cd.myRole && (
                                <div className="mb-1"><b className="text-gray-900 dark:text-white">역할:</b> {cd.myRole}</div>
                              )}
                              {cd.responsibilities && (
                                <div className="mb-1"><b>주요 업무:</b> <RichTextRenderer text={Array.isArray(cd.responsibilities) ? cd.responsibilities.join('\n') : cd.responsibilities} /></div>
                              )}
                              {cd.challenges && <div className="mb-1"><b>과제:</b> <RichTextRenderer text={cd.challenges} /></div>}
                              {cd.solutions && <div className="mb-1"><b>해결:</b> <RichTextRenderer text={cd.solutions} /></div>}
                              {cd.results && <div className="mb-1"><b>성과:</b> <RichTextRenderer text={cd.results} /></div>}
                              {cd.lessonsLearned && <div className="mb-1"><b>배운점:</b> <RichTextRenderer text={cd.lessonsLearned} /></div>}
                            </div>
                          ))}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-gray-400 ml-2">등록된 프로젝트가 없습니다.</div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-gray-500">경력기술서가 없습니다.</div>
        )}
      </div>
    </main>
  );
} 