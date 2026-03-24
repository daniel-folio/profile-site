"use client";
import { useEffect, useMemo, useState } from 'react';
import React from 'react';
import { Company } from '@/types/company';
import { Project } from '@/types/project';
import { CareerDetail } from '@/types/career-detail';
import { Profile } from '@/types/profile';
import { RichTextRenderer } from '@/components/common/ui/RichTextRenderer';
import { Button } from '@/components/common/ui/Button';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import CareerDetailPdfDownloadButton from '@/components/common/CareerDetailPdfDownloadButton';

export default function CareerDetailClientV1({ companies, projects, careerDetails, profile }: {
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
    if (typeof window === 'undefined' || !window.location.hash) return;

    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let animationFrameId: number | null = null;
    let isMounted = true;

    const scrollToElement = (element: HTMLElement) => {
      if (!isMounted) return;

      const y = element.getBoundingClientRect().top + window.scrollY - 100; // 상단 여백 100px

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        window.scrollTo({ top: y, behavior: 'smooth' });
      });
    };

    const scrollToHash = () => {
      if (!isMounted) return;

      const targetId = window.location.hash.substring(1);
      if (!targetId) return;

      // 즉시 요소 확인
      const element = document.getElementById(targetId);
      if (element) {
        scrollToElement(element);
        return;
      }

      // 요소가 아직 로드되지 않은 경우, 일정 시간 동안 폴링
      let tries = 0;
      const maxTries = 10;
      const retryDelay = 100; // 100ms 간격으로 시도

      if (intervalId) clearInterval(intervalId);

      intervalId = setInterval(() => {
        if (!isMounted) {
          clearInterval(intervalId!);
          return;
        }

        const el = document.getElementById(targetId);
        if (el) {
          clearInterval(intervalId!);
          scrollToElement(el);
          return;
        }

        tries++;
        if (tries >= maxTries) {
          clearInterval(intervalId!);
        }
      }, retryDelay);

      // 최대 대기 시간 설정 (10초)
      timeoutId = setTimeout(() => {
        if (intervalId) clearInterval(intervalId);
        intervalId = null;
      }, 10000);
    };

    // 초기 스크롤 실행
    scrollToHash();

    // 클린업 함수
    return () => {
      isMounted = false;

      if (intervalId) {
        clearInterval(intervalId);
      }

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <>
      <main className="v2-subpage w-full mx-auto" style={{ maxWidth: 'var(--v2-max)', padding: '120px var(--v2-pad) 80px', fontFamily: 'var(--v2-sans)' }}>
        <div className="rounded-2xl p-6 sm:p-10 flex flex-col gap-8" style={{ background: 'var(--v2-bg-card)', border: '1px solid var(--v2-line)' }}>
          <div className="flex items-center justify-between mb-4 flex-nowrap gap-4 border-b pb-6" style={{ borderColor: 'var(--v2-line)' }}>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--v2-t-hi)' }}>경력기술서</h1>
            {showDownload && <div className="whitespace-nowrap"> <CareerDetailPdfDownloadButton /> </div>}
          </div>
          {/* 경력기술서 상세 리스트 - 회사/프로젝트/경력기술서 계층 구조 */}
          {companiesWithDetails.length > 0 ? (
            <div className="flex flex-col gap-14">
              {companiesWithDetails.map((company) => {
                const companyProjects = projectsWithDetailsByCompany.get(company.id) || [];
                return (
                  <section key={company.id}>
                    <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--v2-accent)' }}>{company.company}</h2>
                    <div className="flex flex-col gap-10 border-l-2 pl-4 sm:pl-6" style={{ borderColor: 'var(--v2-line)' }}>
                      {companyProjects.map((proj) => {
                        const projectCareerDetails = careerDetailsByProject.get(proj.id) || [];
                        return (
                          <div key={proj.id} className="relative">
                            {/* 타임라인 닷 */}
                            <div className="absolute w-2 h-2 rounded-full -left-[21px] sm:-left-[29px] top-[8px]" style={{ background: 'var(--v2-line-up)', border: '2px solid var(--v2-bg-card)' }} />
                            <div className="flex flex-wrap items-baseline gap-3 mb-4">
                              <span className="font-bold text-[18px]" style={{ color: 'var(--v2-t-hi)' }}>{proj.title}</span>
                              <span className="text-[14px]" style={{ color: 'var(--v2-t-sub)' }}>{proj.startDate} ~ {proj.endDate || '현재'}</span>
                            </div>
                            {projectCareerDetails.map((cd) => {
                              const isExpanded = !!expandedDetails[cd.id];
                              return (
                                <div key={cd.id} id={`cd-${cd.id}`} className="mb-6 rounded-xl p-5" style={{ background: 'var(--v2-bg-up)', border: '1px solid var(--v2-line-up)' }}>
                                  {/* 항상 보이는 부분 */}
                                  <div className="space-y-5">
                                    {cd.results && (
                                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                                        <strong className="min-w-[80px] shrink-0 text-[14px]" style={{ color: 'var(--v2-t-hi)' }}>성과</strong>
                                        <div className="text-[14px] prose max-w-none" style={{ color: 'var(--v2-t-body)' }}>
                                          <RichTextRenderer text={cd.results} />
                                        </div>
                                      </div>
                                    )}
                                    {cd.responsibilities && (
                                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                                        <strong className="min-w-[80px] shrink-0 text-[14px]" style={{ color: 'var(--v2-t-hi)' }}>주요 업무</strong>
                                        <div className="text-[14px] prose max-w-none" style={{ color: 'var(--v2-t-body)' }}>
                                          <RichTextRenderer text={cd.responsibilities as any} />
                                        </div>
                                      </div>
                                    )}
                                    {Array.isArray(proj.skills) && proj.skills.length > 0 && (
                                      <div className="flex flex-col sm:flex-row items-baseline gap-1 sm:gap-4">
                                        <strong className="min-w-[80px] shrink-0 text-[14px]" style={{ color: 'var(--v2-t-hi)' }}>환경</strong>
                                        <div className="flex flex-wrap gap-2">
                                          {proj.skills.map((t: any, i: number) => (
                                            <span key={t.id || t.name || i} className="text-[11px] px-2 py-1 rounded" style={{ background: 'var(--v2-bg-card)', color: 'var(--v2-t-sub)', border: '1px solid var(--v2-line-up)', fontFamily: 'var(--v2-mono)' }}>{t.name}</span>
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
                                        <div className="space-y-4 pt-5 mt-5 border-t" style={{ borderColor: 'var(--v2-line)' }}>
                                          {cd.challenges && (
                                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                                              <strong className="min-w-[80px] shrink-0 text-[14px]" style={{ color: 'var(--v2-accent)' }}>과제</strong>
                                              <div className="text-[14px] prose max-w-none" style={{ color: 'var(--v2-t-body)' }}>
                                                <RichTextRenderer text={cd.challenges} />
                                              </div>
                                            </div>
                                          )}
                                          {cd.solutions && (
                                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                                              <strong className="min-w-[80px] shrink-0 text-[14px]" style={{ color: '#2db864' }}>해결</strong>
                                              <div className="text-[14px] prose max-w-none" style={{ color: 'var(--v2-t-body)' }}>
                                                <RichTextRenderer text={cd.solutions} />
                                              </div>
                                            </div>
                                          )}
                                          {cd.lessonsLearned && (
                                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                                              <strong className="min-w-[80px] shrink-0 text-[14px]" style={{ color: '#3a8cc6' }}>배운점</strong>
                                              <div className="text-[14px] prose max-w-none" style={{ color: 'var(--v2-t-body)' }}>
                                                <RichTextRenderer text={cd.lessonsLearned} />
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>

                                  {/* 접기/펼치기 버튼 */}
                                  <div className="mt-4 flex justify-end">
                                    <Button variant="ghost" size="sm" onClick={() => toggleExpand(cd.id)} className="text-[13px] hover:bg-transparent px-2" style={{ color: 'var(--v2-t-sub)' }} aria-expanded={isExpanded} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--v2-accent)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--v2-t-sub)'}>
                                      {isExpanded ? '간략히 보기' : '자세히 보기'}
                                      {isExpanded ? <FaChevronUp className="ml-1 h-3 w-3" /> : <FaChevronDown className="ml-1 h-3 w-3" />}
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div style={{ color: 'var(--v2-t-sub)' }}>경력기술서 정보가 없습니다.</div>
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
                            <RichTextRenderer text={cd.responsibilities as any} className="print-richtext" />
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