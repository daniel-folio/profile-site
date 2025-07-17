"use client";
import { useEffect } from 'react';
import { Company } from '@/types/company';
import { Project } from '@/types/project';
import { CareerDetail } from '@/types/career-detail';
import { Profile } from '@/types/profile';
import { RichTextRenderer } from '@/components/ui/RichTextRenderer';
import CareerDetailPdfDownloadButton from '@/components/CareerDetailPdfDownloadButton';

export default function CareerDetailClient({ companies, projects, careerDetails, profile }: {
  companies: Company[];
  projects: Project[];
  careerDetails: CareerDetail[];
  profile: Profile | null;
}) {
  const userName = profile?.name;
  const showDownload = !!profile?.careerDetailDownloadEnabled;

  // 회사/프로젝트/경력기술서 정렬 함수 등 기존 코드 복사...
  // ... (생략: 기존 page.tsx의 정렬 함수, 렌더링 JSX 전체)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const scrollToHash = () => {
        const el = document.getElementById(window.location.hash.substring(1));
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 100; // 상단 여백 100px
          window.scrollTo({ top: y, behavior: 'smooth' });
        } else {
          let tries = 0;
          const interval = setInterval(() => {
            const el2 = document.getElementById(window.location.hash.substring(1));
            if (el2) {
              const y = el2.getBoundingClientRect().top + window.scrollY - 100;
              window.scrollTo({ top: y, behavior: 'smooth' });
              clearInterval(interval);
            }
            tries++;
            if (tries > 10) clearInterval(interval);
          }, 100);
        }
      };
      scrollToHash();
    }
  }, []);

  // 정렬 함수
  const getSortedCompanies = () => {
    return [...companies].sort((a, b) => {
      if (a.order != null && b.order != null && a.order !== b.order) return b.order - a.order;
      if (a.order != null && b.order == null) return -1;
      if (a.order == null && b.order != null) return 1;
      const aDate = a.endDate || a.startDate || '';
      const bDate = b.endDate || b.startDate || '';
      if (aDate !== bDate) return bDate.localeCompare(aDate);
      return (b.id || 0) - (a.id || 0);
    });
  };
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
    <>
      <main className="max-w-6xl mx-auto pt-24 md:pt-32 pb-12 px-4">
        <div className="bg-white/80 dark:bg-black/80 rounded-xl p-8 flex flex-col gap-8">
          <div className="flex items-center justify-between mb-4 flex-nowrap gap-4">
            <h1 className="text-3xl font-bold truncate min-w-0">경력기술서</h1>
            {showDownload && <div className="whitespace-nowrap"> <CareerDetailPdfDownloadButton /> </div>}
          </div>
          {/* 경력기술서 상세 리스트 - 회사/프로젝트/경력기술서 계층 구조 */}
          {getSortedCompanies().length > 0 ? (
            <div className="flex flex-col gap-12">
              {getSortedCompanies().map((company) => {
                const companyProjects = getSortedProjects(company.id);
                if (companyProjects.length === 0) return null;
                return (
                  <section key={company.id} className="mb-8">
                    <h2 className="text-xl font-bold mb-2">{company.company}</h2>
                    {companyProjects.map((proj) => {
                      const projectCareerDetails = getSortedCareerDetails(proj.id);
                      if (projectCareerDetails.length === 0) return null;
                      return (
                        <div key={proj.id} className="ml-6 mb-6">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-lg">{proj.title}</span>
                            <span className="ml-2 text-xs text-gray-600">{proj.startDate} ~ {proj.endDate || '현재'}</span>
                          </div>
                          {projectCareerDetails.map((cd) => (
                            <div key={cd.id} id={`cd-${cd.id}`} className="ml-6 mt-2 border-l-2 border-gray-200 pl-4 pb-4">
                              {((cd.myRole && (Array.isArray(cd.responsibilities) ? cd.responsibilities.length > 0 : cd.responsibilities)) || (Array.isArray(cd.responsibilities) ? cd.responsibilities.length > 0 : cd.responsibilities)) && (
                                <div className="mb-1"><strong>주요 업무 : </strong> {
                                  Array.isArray(cd.responsibilities) ? (
                                    <ul className="ml-4 !text-[14px] list-disc">
                                      {cd.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                                    </ul>
                                  ) : (
                                    (cd.responsibilities ?? '').split('\n').map((line: string, idx: number) => (
                                      <div key={idx} className="ml-4 !text-[14px]">{line}</div>
                                    ))
                                  )
                                }</div>
                              )}
                              {/* 환경 뱃지 - cd 상세 내부에서만 출력 */}
                              {Array.isArray(proj.technologies) && proj.technologies.length > 0 && (
                                <div className="mb-1 flex items-center flex-wrap gap-1">
                                  <strong>환경 : </strong>
                                  <div className="ml-2 flex flex-wrap gap-1">
                                    {proj.technologies.map((t: any, i: number) => (
                                      <span key={t.id || t.name || i} className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded text-[12px] font-semibold border border-sky-200">{t.name}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {cd.challenges && (
                                <div className="mb-1">
                                  <strong>과제 : </strong>
                                  <RichTextRenderer text={cd.challenges} className="ml-4 !text-[14px]" />
                                </div>
                              )}
                              {cd.solutions && (
                                <div className="mb-1">
                                  <strong>해결 : </strong>
                                  <RichTextRenderer text={cd.solutions} className="ml-4 !text-[14px]" />
                                </div>
                              )}
                              {cd.results && (
                                <div className="mb-1">
                                  <strong>성과 : </strong>
                                  <RichTextRenderer text={cd.results} className="ml-4 !text-[14px]" />
                                </div>
                              )}
                              {cd.lessonsLearned && (
                                <div className="mb-1">
                                  <strong>배운점 : </strong>
                                  <RichTextRenderer text={cd.lessonsLearned} className="ml-4 !text-[14px]" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-500">경력기술서 정보가 없습니다.</div>
          )}
        </div>
      </main>
      {/* 출력용 경력기술서: 화면에는 렌더링하지 않고, PDF/출력용으로만 사용 */}
      <div id="career-detail-print" style={{ display: 'none', background: '#fff', color: '#111', margin: 20, padding: 20, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', fontWeight: 500, textRendering: 'optimizeLegibility' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>{userName ? `${userName}의 경력기술서` : '경력기술서'}</h1>
        {getSortedCompanies().map((company) => {
          const companyProjects = getSortedProjects(company.id);
          if (companyProjects.length === 0) return null;
          return (
            <section key={company.id} style={{ marginBottom: 32 }}>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{company.company}</div>
              {companyProjects.map((proj) => {
                const projectCareerDetails = getSortedCareerDetails(proj.id);
                if (projectCareerDetails.length === 0) return null;
                return (
                  <div key={proj.id} style={{ marginLeft: 24, marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{proj.title} <span style={{ fontSize: 13, color: '#444', marginLeft: 8 }}>{proj.startDate} ~ {proj.endDate || '현재'}</span></div>
                    {projectCareerDetails.map((cd) => (
                      <div key={cd.id} id={`cd-${cd.id}`} style={{ marginLeft: 24, marginTop: 8, borderLeft: '2px solid #eee', paddingLeft: 12, paddingBottom: 8 }}>
                        {((cd.myRole && (Array.isArray(cd.responsibilities) ? cd.responsibilities.length > 0 : cd.responsibilities)) || (Array.isArray(cd.responsibilities) ? cd.responsibilities.length > 0 : cd.responsibilities)) && (
                          <div style={{ marginBottom: 4 }}><strong>주요 업무 : </strong>
                            {
                              Array.isArray(cd.responsibilities) ? (
                                <ul style={{ marginLeft: 16, fontSize: 14, fontWeight: 400 }}>
                                  {cd.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                              ) : (
                                (cd.responsibilities ?? '').split('\n').map((line: string, idx: number) => (
                                  <div key={idx} style={{ marginLeft: 16, fontSize: 14, fontWeight: 400 }}>{line}</div>
                                ))
                              )
                            }
                          </div>
                        )}
                        {/* 환경 뱃지 - cd 상세 내부에서만 출력 */}
                        {Array.isArray(proj.technologies) && proj.technologies.length > 0 && (
                          <div style={{ marginBottom: 4 }}><strong>환경 : </strong>
                            <span style={{ marginLeft: 16, fontSize: 14, fontWeight: 400, display: 'inline-block', textIndent: 0, whiteSpace: 'pre-line' }}>
                              {proj.technologies.map((t: any) => t.name).join(', ')}
                            </span>
                          </div>
                        )}
                        {cd.challenges && (
                          <div style={{ marginBottom: 4 }}><strong>과제 : </strong>
                            {
                              Array.isArray(cd.challenges) ? (
                                <ul style={{ marginLeft: 16, fontSize: 14, fontWeight: 400 }}>
                                  {cd.challenges.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                              ) : (
                                (cd.challenges ?? '').split('\n').map((line: string, idx: number) => (
                                  <div key={idx} style={{ marginLeft: 16, fontSize: 14, fontWeight: 400 }}>{line}</div>
                                ))
                              )
                            }
                          </div>
                        )}
                        {cd.solutions && (
                          <div style={{ marginBottom: 4 }}><strong>해결 : </strong>
                            {
                              Array.isArray(cd.solutions) ? (
                                <ul style={{ marginLeft: 16, fontSize: 14, fontWeight: 400 }}>
                                  {cd.solutions.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                              ) : (
                                (cd.solutions ?? '').split('\n').map((line: string, idx: number) => (
                                  <div key={idx} style={{ marginLeft: 16, fontSize: 14, fontWeight: 400 }}>{line}</div>
                                ))
                              )
                            }
                          </div>
                        )}
                        {cd.results && (
                          <div style={{ marginBottom: 4 }}><strong>성과 : </strong>
                            {
                              Array.isArray(cd.results) ? (
                                <ul style={{ marginLeft: 16, fontSize: 14, fontWeight: 400 }}>
                                  {cd.results.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                              ) : (
                                (cd.results ?? '').split('\n').map((line: string, idx: number) => (
                                  <div key={idx} style={{ marginLeft: 16, fontSize: 14, fontWeight: 400 }}>{line}</div>
                                ))
                              )
                            }
                          </div>
                        )}
                        {cd.lessonsLearned && (
                          <div style={{ marginBottom: 4 }}><strong>배운점 : </strong>
                            {
                              Array.isArray(cd.lessonsLearned) ? (
                                <ul style={{ marginLeft: 16, fontSize: 14, fontWeight: 400 }}>
                                  {cd.lessonsLearned.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                              ) : (
                                (cd.lessonsLearned ?? '').split('\n').map((line: string, idx: number) => (
                                  <div key={idx} style={{ marginLeft: 16, fontSize: 14, fontWeight: 400 }}>{line}</div>
                                ))
                              )
                            }
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
    </>
  );
} 