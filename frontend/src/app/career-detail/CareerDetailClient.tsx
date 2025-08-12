"use client";
import { useEffect, useMemo, useState } from 'react';
import React from 'react';
import { Company } from '@/types/company';
import { Project } from '@/types/project';
import { CareerDetail } from '@/types/career-detail';
import { Profile } from '@/types/profile';
import { RichTextRenderer } from '@/components/ui/RichTextRenderer';
import { Button } from '@/components/ui/Button';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import CareerDetailPdfDownloadButton from '@/components/CareerDetailPdfDownloadButton';

export default function CareerDetailClient({ companies, projects, careerDetails, profile }: {
  companies: Company[];
  projects: Project[];
  careerDetails: CareerDetail[];
  profile: Profile | null;
}) {
  const userName = profile?.name;
  const showDownload = !!profile?.careerDetailDownloadEnabled;

  const [expandedDetails, setExpandedDetails] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedDetails(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const {
    companiesWithDetails,
    projectsWithDetailsByCompany,
    careerDetailsByProject,
  } = useMemo(() => {
    const sortOrderAndDate = (a: any, b: any) => {
      if (a.order != null && b.order != null && a.order !== b.order) return a.order - b.order;
      if (a.order != null && b.order == null) return -1;
      if (a.order == null && b.order != null) return 1;
      const aDate = a.endDate || a.startDate || '';
      const bDate = b.endDate || b.startDate || '';
      if (aDate !== bDate) return bDate.localeCompare(aDate);
      return (b.id || 0) - (a.id || 0);
    };

    // 1. 프로젝트 ID별로 경력 기술서를 그룹화하고 정렬합니다.
    const careerDetailsByProject = new Map<number, CareerDetail[]>();
    careerDetails.forEach(cd => {
      if (cd.project != null) {
        if (!careerDetailsByProject.has(cd.project)) {
          careerDetailsByProject.set(cd.project, []);
        }
        careerDetailsByProject.get(cd.project)!.push(cd);
      }
    });
    for (const details of careerDetailsByProject.values()) {
      details.sort(sortOrderAndDate);
    }

    // 2. 경력 기술서가 있는 프로젝트만 필터링합니다.
    const projectsWithDetails = projects.filter(proj => careerDetailsByProject.has(proj.id));

    // 3. 필터링된 프로젝트를 회사 ID별로 그룹화하고 정렬합니다.
    const projectsWithDetailsByCompany = new Map<number, Project[]>();
    projectsWithDetails.forEach(proj => {
      if (proj.company != null) {
        if (!projectsWithDetailsByCompany.has(proj.company)) {
          projectsWithDetailsByCompany.set(proj.company, []);
        }
        projectsWithDetailsByCompany.get(proj.company)!.push(proj);
      }
    });
    for (const projs of projectsWithDetailsByCompany.values()) {
      projs.sort(sortOrderAndDate);
    }

    // 4. 경력 기술서가 있는 프로젝트를 가진 회사만 필터링하고 정렬합니다.
    const companiesWithDetails = companies
      .filter(comp => projectsWithDetailsByCompany.has(comp.id))
      .sort(sortOrderAndDate);

    return { companiesWithDetails, projectsWithDetailsByCompany, careerDetailsByProject };
  }, [companies, projects, careerDetails]);
  
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

  return (
    <>
      <main className="max-w-6xl mx-auto pt-24 md:pt-32 pb-12 px-4">
        <div className="bg-white/80 dark:bg-black/80 rounded-xl p-8 flex flex-col gap-8">
          <div className="flex items-center justify-between mb-4 flex-nowrap gap-4">
            <h1 className="text-3xl font-bold truncate min-w-0">경력기술서</h1>
            {showDownload && <div className="whitespace-nowrap"> <CareerDetailPdfDownloadButton /> </div>}
          </div>
          {/* 경력기술서 상세 리스트 - 회사/프로젝트/경력기술서 계층 구조 */}
          {companiesWithDetails.length > 0 ? (
            <div className="flex flex-col gap-12">
              {companiesWithDetails.map((company) => {
                const companyProjects = projectsWithDetailsByCompany.get(company.id) || [];
                return (
                  <section key={company.id} className="mb-8">
                    <h2 className="text-xl font-bold mb-2">{company.company}</h2>
                    {companyProjects.map((proj) => {
                      const projectCareerDetails = careerDetailsByProject.get(proj.id) || [];
                      return (
                        <div key={proj.id} className="ml-6 mb-6">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-lg">{proj.title}</span>
                            <span className="ml-2 text-xs text-gray-600">{proj.startDate} ~ {proj.endDate || '현재'}</span>
                          </div>
                          {projectCareerDetails.map((cd) => {
                            const isExpanded = !!expandedDetails[cd.id];
                            return (
                              <div key={cd.id} id={`cd-${cd.id}`} className="ml-6 mt-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4 pb-2">
                                {/* 항상 보이는 부분 */}
                                <div className="space-y-1">
                                  {cd.results && (
                                    <div>
                                      <strong>성과 : </strong>
                                      <RichTextRenderer text={cd.results} className="ml-4 !text-[14px]" />
                                    </div>
                                  )}
                                  {cd.responsibilities && (
                                    <div>
                                      <strong>주요 업무 : </strong>
                                      <RichTextRenderer text={cd.responsibilities} className="ml-4 !text-[14px]" />
                                    </div>
                                  )}
                                  {Array.isArray(proj.skills) && proj.skills.length > 0 && (
                                    <div className="flex items-center flex-wrap gap-1">
                                      <strong>환경 : </strong>
                                      <div className="ml-2 flex flex-wrap gap-1">
                                        {proj.skills.map((t: any, i: number) => (
                                          <span key={t.id || t.name || i} className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded text-[12px] font-semibold border border-sky-200">{t.name}</span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* 펼쳤을 때 보이는 부분 (애니메이션 적용) */}
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                                      className="overflow-hidden"
                                    >
                                      <div className="space-y-1 pt-2">
                                        {cd.challenges && (<div><strong>과제 : </strong><RichTextRenderer text={cd.challenges} className="ml-4 !text-[14px]" /></div>)}
                                        {cd.solutions && (<div><strong>해결 : </strong><RichTextRenderer text={cd.solutions} className="ml-4 !text-[14px]" /></div>)}
                                        {cd.lessonsLearned && (<div><strong>배운점 : </strong><RichTextRenderer text={cd.lessonsLearned} className="ml-4 !text-[14px]" /></div>)}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* 접기/펼치기 버튼 */}
                                <div className="mt-2 flex justify-end">
                                  <Button variant="ghost" size="sm" onClick={() => toggleExpand(cd.id)} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center" aria-expanded={isExpanded}>
                                    {isExpanded ? '간략히 보기' : '자세히 보기'}
                                    {isExpanded ? <FaChevronUp className="ml-2 h-3 w-3" /> : <FaChevronDown className="ml-2 h-3 w-3" />}
                                  </Button>
                                  </div>
                                </div>
                            );
                          })}
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
        {companiesWithDetails.map((company) => {
          const companyProjects = projectsWithDetailsByCompany.get(company.id) || [];
          return (
            <section key={company.id} style={{ marginBottom: 32 }}>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{company.company}</div>
              {companyProjects.map((proj) => {
                const projectCareerDetails = careerDetailsByProject.get(proj.id) || [];
                return (
                  <div key={proj.id} style={{ marginLeft: 24, marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{proj.title} <span style={{ fontSize: 13, color: '#444', marginLeft: 8 }}>{proj.startDate} ~ {proj.endDate || '현재'}</span></div>
                    {projectCareerDetails.map((cd) => (
                      <div key={cd.id} id={`cd-${cd.id}-print`} style={{ marginLeft: 24, marginTop: 8, borderLeft: '2px solid #eee', paddingLeft: 12, paddingBottom: 8 }}>
                        {cd.results && (
                          <div style={{ marginBottom: 4 }}><strong>성과 : </strong>
                            <RichTextRenderer text={cd.results} className="print-richtext" />
                          </div>
                        )}
                        {cd.responsibilities && (
                          <div style={{ marginBottom: 4 }}>
                            <strong>주요 업무 : </strong>
                            <RichTextRenderer text={cd.responsibilities} className="print-richtext" />
                          </div>
                        )}
                        {Array.isArray(proj.skills) && proj.skills.length > 0 && (
                          <div style={{ marginBottom: 4 }}><strong>환경 : </strong>
                            <span style={{ marginLeft: 8, fontSize: 14, fontWeight: 400 }}>
                              {proj.skills.map((t: any) => t.name).join(', ')}
                            </span>
                          </div>
                        )}
                        {cd.challenges && (
                          <div style={{ marginBottom: 4 }}><strong>과제 : </strong>
                            <RichTextRenderer text={cd.challenges} className="print-richtext" />
                          </div>
                        )}
                        {cd.solutions && (
                          <div style={{ marginBottom: 4 }}><strong>해결 : </strong>
                            <RichTextRenderer text={cd.solutions} className="print-richtext" />
                          </div>
                        )}
                        {cd.lessonsLearned && (
                          <div style={{ marginBottom: 4 }}><strong>배운점 : </strong>
                            <RichTextRenderer text={cd.lessonsLearned} className="print-richtext" />
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