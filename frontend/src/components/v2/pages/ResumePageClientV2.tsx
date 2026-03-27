"use client";
import ResumePdfDownloadButton from "@/components/common/ResumePdfDownloadButton";
import ResumeContentWithDownload from "@/components/common/ResumeContentWithDownload";
import { RichTextRenderer } from "@/components/common/ui/RichTextRenderer";
import Link from "next/link";
import { Profile } from "@/types/profile";
import { Company } from "@/types/company";
import { Education } from "@/types/education";
import { Skill } from "@/types/skill";
import { Project } from "@/types/project";
import { CareerDetail } from "@/types/career-detail";
import { OtherExperience } from "@/types/other-experience";
import { useEffect, useState } from 'react';
import React from 'react';
import '../../../app/resume/resume-print.css';
import '../../../app/resume/resume-badge.css';
import { useTheme } from 'next-themes';
import { SKILL_CATEGORY_ORDER } from '@/lib/skillCategories';

function getMonthDiff(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sy, sm] = start.split('-').map(Number);
  const [ey, em] = end.split('-').map(Number);
  return (ey - sy) * 12 + (em - sm) + 1;
}
function getPeriodText(months: number): string {
  const years = Math.floor(months / 12);
  const remainMonths = months % 12;
  let result = '';
  if (years > 0) result += `${years}년`;
  if (remainMonths > 0) result += ` ${remainMonths}개월`;
  return result.trim();
}

export default function ResumePageClientV2({
  profile,
  companies,
  educations,
  skills,
  projects,
  careerDetails,
  otherExperiences,
}: {
  profile: Profile | null;
  companies: Company[];
  educations: Education[];
  skills: Skill[];
  projects: Project[];
  careerDetails: CareerDetail[];
  otherExperiences: OtherExperience[];
}) {
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    setIsMobile(window.innerWidth <= 640);
  }, []);
  // 기존 resume/page.tsx의 데이터 가공 및 렌더링 로직 복사
  const visibleExperiences = otherExperiences.filter(a => a.visible);
  const sortedExperiences = [...visibleExperiences].sort((a, b) => {
    if (a.order != null && b.order != null && a.order !== b.order) return a.order - b.order;
    if (a.order != null && b.order == null) return -1;
    if (a.order == null && b.order != null) return 1;
    // order가 둘 다 없으면 startDate 내림차순(최신순)
    if (a.startDate && b.startDate) return b.startDate.localeCompare(a.startDate);
    if (a.startDate) return -1;
    if (b.startDate) return 1;
    return 0;
  });
  const classExperiences = sortedExperiences.filter(a => a.category === 'Class');
  const etcExperiences = sortedExperiences.filter(a => a.category === 'ETC');
  const filteredCompanies = companies.filter(company => {
    return projects.some(proj => proj.company === company.id);
  });
  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    if (a.order != null && b.order != null && a.order !== b.order) return a.order - b.order;
    if (a.order != null && b.order == null) return -1;
    if (a.order == null && b.order != null) return 1;
    const aDate = a.endDate || a.startDate || '';
    const bDate = b.endDate || b.startDate || '';
    if (aDate !== bDate) return bDate.localeCompare(aDate);
    return (b.id || 0) - (a.id || 0);
  });
  const getSortedProjects = (companyId: number) => {
    return projects.filter((proj) => proj.company === companyId && proj.visible !== false).sort((a, b) => {
      if (a.order != null && b.order != null && a.order !== b.order) return a.order - b.order;
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
      if (typeof cd.project === 'object' && cd.project !== null && 'id' in (cd.project as any)) {
        return (cd.project as any).id === projectId;
      }
      return cd.project === projectId;
    }).sort((a, b) => {
      if (a.order != null && b.order != null && a.order !== b.order) return a.order - b.order;
      if (a.order != null && b.order == null) return -1;
      if (a.order == null && b.order != null) return 1;
      const aDate = a.endDate || a.startDate || '';
      const bDate = b.endDate || b.startDate || '';
      if (aDate !== bDate) return bDate.localeCompare(aDate);
      return (b.id || 0) - (a.id || 0);
    });
  };
  // CATEGORY_ORDER is imported from @/lib/skillCategories
  // isPublic이 false가 아닌 스킬만 필터링하여 이력서에 노출합니다.
  const publicSkills = skills.filter(skill => skill.isPublic !== false);
  const skillsByCategory = publicSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);
  const showDownload = !!profile?.resumeDownloadEnabled;

  // 출력용 프로필 사진 Base64 변환
  const [profileImageBase64, setProfileImageBase64] = useState<string | null>(null);
  const [profileImageReady, setProfileImageReady] = useState(false);
  useEffect(() => {
    async function fetchAndConvertProfileImage() {
      setProfileImageReady(false);
      if (profile?.showProfileImage && profile.profileImage?.url) {
        try {
          const res = await fetch(profile.profileImage.url);
          const blob = await res.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            setProfileImageBase64(reader.result as string);
            setProfileImageReady(true);
          };
          reader.readAsDataURL(blob);
        } catch (e) {
          setProfileImageBase64(null);
          setProfileImageReady(true);
        }
      } else {
        setProfileImageBase64(null);
        setProfileImageReady(true);
      }
    }
    fetchAndConvertProfileImage();
  }, [profile?.showProfileImage, profile?.profileImage?.url]);

  // Strapi 5에서 회사 없음은 null/undefined/{} 등 다양하게 올 수 있어 방어 처리
  const isPersonalProject = (proj: any) =>
    !proj.company || (typeof proj.company === 'object' && !('id' in proj.company));

  return (
    <>
      {/* 화면용 이력서 */}
      <main id="resume-content" className="v2-subpage w-full mx-auto" style={{ maxWidth: 'var(--v2-max)', padding: '120px var(--v2-pad) 80px', fontFamily: 'var(--v2-sans)' }}>
        <div className="rounded-2xl p-6 sm:p-10 flex flex-col gap-8" style={{ background: 'var(--v2-bg-card)', border: '1px solid var(--v2-line)' }}>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--v2-t-hi)' }}>
              <span className="hidden sm:inline">이력서 (Resume)</span>
              <span className="inline sm:hidden">이력서</span>
            </h1>
            {showDownload && <ResumePdfDownloadButton />}
          </div>
          {/* 프로필 정보: 사진+이름+연락처 등 */}
          {profile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 8 }}>
              {/* 출력용 Base64 코드 제외하고 원래 url 사용 (화면용이므로) */}
              {profile.showProfileImage === true && profile.profileImage?.url && (
                <img
                  src={profile.profileImage.url}
                  alt={profile.name}
                  style={{ width: 100, height: 125, objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--v2-line-up)' }}
                />
              )}
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--v2-t-hi)', marginBottom: 4 }}>{profile.name}</div>
                <div style={{ color: 'var(--v2-t-body)', marginBottom: 2 }}>{profile.title}</div>
                <div style={{ color: 'var(--v2-t-sub)', fontSize: '14px' }}>{profile.email} {profile.showPhone === true && profile.phone && <>| {profile.phone}</>}</div>
                <div style={{ color: 'var(--v2-t-sub)', fontSize: '14px' }}>{profile.location}</div>
              </div>
            </div>
          )}
          {/* 소개 (Introduce) */}
          {profile?.resumeBio && (
            <>
              <div style={{ borderTop: '1px solid var(--v2-line)', margin: '16px 0' }} />
              <section>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--v2-accent)', marginBottom: 16 }}>소개 (Introduce)</h2>
                <div style={{ color: 'var(--v2-t-body)', fontSize: '15px', lineHeight: 1.7 }}>
                  <RichTextRenderer text={profile.resumeBio} />
                </div>
              </section>
            </>
          )}

          {/* 경력 */}
          <section>
            {sortedCompanies.length > 0 ? (
              <>
                <div style={{ borderTop: '1px solid var(--v2-line)', margin: '16px 0 32px' }} />
                <section>
                  <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--v2-accent)', marginBottom: 24 }}>경력 (Company)</h2>
                  <div className="space-y-12">
                    {sortedCompanies.map((comp, idx) => {
                      const companyProjects = getSortedProjects(comp.id);
                      const start = comp.startDate;
                      const end = comp.endDate || '현재';
                      const months = getMonthDiff(comp.startDate, comp.endDate || new Date().toISOString().slice(0, 7));
                      const companyDesc = comp.description;
                      return (
                        <div key={idx} className="relative">
                          <div className="flex items-center gap-3 mb-2">
                            {comp.companyLogo?.url && (
                              <img src={comp.companyLogo.url} alt={comp.company} className="w-10 h-10 rounded-md object-contain border p-1" style={{ borderColor: '#e5e5e5', background: '#fff' }} />
                            )}
                            <div>
                              <div className="font-bold text-lg" style={{ color: 'var(--v2-t-hi)' }}>
                                {comp.company}
                                {comp.position && <span style={{ color: 'var(--v2-t-sub)', fontWeight: 400, marginLeft: 8, fontSize: '15px' }}>{comp.position}</span>}
                              </div>
                              <div className="text-sm mt-1" style={{ color: 'var(--v2-t-sub)' }}>
                                {start} ~ {end} {months && <span>({getPeriodText(months)})</span>}
                              </div>
                            </div>
                          </div>

                          {companyDesc && <div className="text-[15px] mt-4 mb-4" style={{ color: 'var(--v2-t-body)' }}>{companyDesc}</div>}

                          {companyProjects.length > 0 && (
                            <div className="mt-6 flex flex-col gap-6 pl-3 sm:pl-4 border-l-2" style={{ borderColor: 'var(--v2-line)' }}>
                              {companyProjects.map((proj, idx) => {
                                const matchedCareerDetails = getSortedCareerDetails(proj.id);
                                const hasCareerDetail = matchedCareerDetails.length > 0;
                                const careerHref = hasCareerDetail ? `/career-detail#cd-${matchedCareerDetails[0].id}` : undefined;
                                return (
                                  <div key={proj.id} className="relative">
                                    <div className="absolute w-2 h-2 rounded-full -left-[17px] sm:-left-[21px] top-[6px]" style={{ background: 'var(--v2-line-up)', border: '2px solid var(--v2-bg-card)' }} />
                                    <div className="flex flex-wrap items-baseline gap-3 mb-1">
                                      {hasCareerDetail ? (
                                        <Link href={careerHref!} className="font-bold text-[16px] transition-colors hover:text-[var(--v2-accent)]" style={{ color: 'var(--v2-t-hi)' }}>
                                          {proj.title} <span className="text-[14px] text-[var(--v2-accent)] ml-1">↗</span>
                                        </Link>
                                      ) : (
                                        <span className="font-bold text-[16px]" style={{ color: 'var(--v2-t-hi)' }}>{proj.title}</span>
                                      )}
                                      <span className="text-[13px]" style={{ color: 'var(--v2-t-sub)' }}>{proj.startDate}{proj.endDate ? ` ~ ${proj.endDate}` : proj.startDate ? ' ~ 현재' : ''}</span>
                                    </div>

                                    {proj.shortDescription && (
                                      <div className="mt-2 text-[14px]" style={{ color: 'var(--v2-t-body)' }}>
                                        <RichTextRenderer text={proj.shortDescription} />
                                      </div>
                                    )}

                                    {Array.isArray(proj.skills) && proj.skills.length > 0 && (
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        {(Array.isArray(proj.skills) ? proj.skills : []).map((skill: any, i: number) => (
                                          <span key={skill.id || skill.name || i} className="text-[11px] px-2 py-1 rounded" style={{ background: 'var(--v2-bg-up)', color: 'var(--v2-t-sub)', border: '1px solid var(--v2-line-up)', fontFamily: 'var(--v2-mono)' }}>
                                            {skill.name}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
            ) : null}
          </section>

          {/* 개인 프로젝트 */}
          {projects.filter((proj) => isPersonalProject(proj) && proj.visible !== false).length > 0 && (
            <>
              <div style={{ borderTop: '1px solid var(--v2-line)', margin: '16px 0' }} />
              <section>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--v2-accent)', marginBottom: 24 }}>개인 프로젝트 (Personal Project)</h2>
                <div className="flex flex-col gap-8 pl-3 sm:pl-4 border-l-2" style={{ borderColor: 'var(--v2-line)' }}>
                  {projects.filter((proj) => isPersonalProject(proj) && proj.visible !== false).map((proj, idx) => {
                    const matchedCareerDetail = careerDetails.find(cd => {
                      if (typeof cd.project === 'object' && cd.project !== null && 'id' in (cd.project as any)) {
                        return (cd.project as any).id === proj.id;
                      }
                      return cd.project === proj.id;
                    });
                    const careerHref = matchedCareerDetail ? `/career-detail#cd-${matchedCareerDetail.id}` : undefined;

                    return (
                      <div key={proj.id} className="relative">
                        <div className="absolute w-2 h-2 rounded-full -left-[17px] sm:-left-[21px] top-[6px]" style={{ background: 'var(--v2-line-up)', border: '2px solid var(--v2-bg-card)' }} />
                        <div className="flex flex-wrap items-baseline gap-3 mb-1">
                          {matchedCareerDetail ? (
                            <Link href={careerHref!} className="font-bold text-[16px] transition-colors hover:text-[var(--v2-accent)]" style={{ color: 'var(--v2-t-hi)' }}>
                              {proj.title} <span className="text-[14px] text-[var(--v2-accent)] ml-1">↗</span>
                            </Link>
                          ) : (
                            <span className="font-bold text-[16px]" style={{ color: 'var(--v2-t-hi)' }}>{proj.title}</span>
                          )}
                          <span className="text-[13px]" style={{ color: 'var(--v2-t-sub)' }}>{proj.startDate}{proj.endDate ? ` ~ ${proj.endDate}` : proj.startDate ? ' ~ 현재' : ''}</span>
                        </div>

                        {proj.shortDescription && (
                          <div className="mt-2 text-[14px]" style={{ color: 'var(--v2-t-body)' }}>
                            <RichTextRenderer text={proj.shortDescription} />
                          </div>
                        )}

                        {Array.isArray(proj.skills) && proj.skills.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(Array.isArray(proj.skills) ? proj.skills : []).map((skill: any, i: number) => (
                              <span key={skill.id || skill.name || i} className="text-[11px] px-2 py-1 rounded" style={{ background: 'var(--v2-bg-up)', color: 'var(--v2-t-sub)', border: '1px solid var(--v2-line-up)', fontFamily: 'var(--v2-mono)' }}>
                                {skill.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {/* Skills */}
          {publicSkills.length > 0 && (
            <>
              <div style={{ borderTop: '1px solid var(--v2-line)', margin: '16px 0' }} />
              <section>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--v2-accent)', marginBottom: 20 }}>기술스택 (Skills)</h2>
                <div className="space-y-4">
                  {SKILL_CATEGORY_ORDER.filter(category => skillsByCategory[category]).map((category) => (
                    <div key={category} className="flex flex-col sm:flex-row gap-2 sm:gap-6">
                      <span className="font-bold min-w-[120px]" style={{ color: 'var(--v2-t-hi)' }}>
                        {category}
                      </span>
                      <div className="flex flex-wrap gap-x-2 gap-y-1" style={{ color: 'var(--v2-t-body)' }}>
                        {skillsByCategory[category]
                          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                          .map((skill, i, arr) => (
                            <span key={skill.id}>
                              {skill.name}{i < arr.length - 1 ? <span style={{ color: 'var(--v2-line-up)' }}>, </span> : ''}
                            </span>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Education */}
          {educations.length > 0 && (
            <>
              <div style={{ borderTop: '1px solid var(--v2-line)', margin: '16px 0' }} />
              <section>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--v2-accent)', marginBottom: 20 }}>학력 (Education)</h2>
                <div className="space-y-8">
                  {educations.map((edu, idx) => (
                    <div key={idx} className="flex gap-4">
                      {edu.logo?.url && (
                        <img src={edu.logo.url} alt={edu.institution} className="w-10 h-10 rounded-md object-contain border p-1" style={{ borderColor: '#e5e5e5', background: '#fff' }} />
                      )}
                      <div>
                        <div className="font-bold text-[16px]" style={{ color: 'var(--v2-t-hi)' }}>{edu.institution}{edu.field && ` ${edu.field}`}</div>
                        <div className="text-[14px] mt-1" style={{ color: 'var(--v2-t-sub)' }}>{edu.startDate} ~ {edu.endDate || '현재'}</div>
                        {edu.description && (
                          <div className="mt-2 text-[14px]" style={{ color: 'var(--v2-t-body)' }}>
                            <RichTextRenderer text={edu.description} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Other Experience */}
          {sortedExperiences.length > 0 && (
            <>
              <div style={{ borderTop: '1px solid var(--v2-line)', margin: '16px 0' }} />
              <section>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--v2-accent)', marginBottom: 20 }}>기타 경험 (Other Experience)</h2>
                <div className="space-y-10">
                  {(() => {
                    const categories = ['Class', 'ETC'];
                    const categoryExps = categories.map(category => sortedExperiences.filter(exp => exp.category === category));
                    return (
                      <>
                        {categoryExps[0].length > 0 && (
                          <div>
                            <div className="font-bold text-[16px] mb-4" style={{ color: 'var(--v2-t-hi)' }}>Class</div>
                            <div className="flex flex-col gap-6 pl-3 sm:pl-4 border-l-2" style={{ borderColor: 'var(--v2-line)' }}>
                              {categoryExps[0].map((exp) => (
                                <div key={exp.id} className="relative">
                                  <div className="absolute w-2 h-2 rounded-full -left-[17px] sm:-left-[21px] top-[6px]" style={{ background: 'var(--v2-line-up)', border: '2px solid var(--v2-bg-card)' }} />
                                  <div className="flex flex-wrap items-baseline gap-3">
                                    <span className="font-bold text-[15px]" style={{ color: 'var(--v2-t-hi)' }}>{exp.title}</span>
                                    <span className="text-[13px]" style={{ color: 'var(--v2-t-sub)' }}>{exp.startDate} ~ {exp.endDate || '현재'}</span>
                                  </div>
                                  {exp.description && (
                                    <div className="mt-2 text-[14px]" style={{ color: 'var(--v2-t-body)' }}>
                                      <RichTextRenderer text={exp.description} />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {categoryExps[1].length > 0 && (
                          <div>
                            <div className="font-bold text-[16px] mb-4" style={{ color: 'var(--v2-t-hi)' }}>ETC</div>
                            <div className="flex flex-col gap-6 pl-3 sm:pl-4 border-l-2" style={{ borderColor: 'var(--v2-line)' }}>
                              {categoryExps[1].map((exp) => (
                                <div key={exp.id} className="relative">
                                  <div className="absolute w-2 h-2 rounded-full -left-[17px] sm:-left-[21px] top-[6px]" style={{ background: 'var(--v2-line-up)', border: '2px solid var(--v2-bg-card)' }} />
                                  <div className="flex flex-wrap items-baseline gap-3">
                                    <span className="font-bold text-[15px]" style={{ color: 'var(--v2-t-hi)' }}>{exp.title}</span>
                                    <span className="text-[13px]" style={{ color: 'var(--v2-t-sub)' }}>{exp.startDate} ~ {exp.endDate || '현재'}</span>
                                  </div>
                                  {exp.description && (
                                    <div className="mt-2 text-[14px]" style={{ color: 'var(--v2-t-body)' }}>
                                      <RichTextRenderer text={exp.description} />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
      {/* 출력 전용 이력서: 화면에는 렌더링하지 않고, PDF/출력용으로만 사용 */}
      <div id="resume-print" style={{ display: 'none', background: '#fff', color: '#111', margin: 20, padding: 20, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', fontWeight: 500, textRendering: 'optimizeLegibility' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>이력서 (Resume)</h1>
        {/* 프로필 정보: 사진+이름+연락처 등 */}
        {profile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            {/* 출력용: Base64 우선, 없으면 기존 URL */}
            {profile.showProfileImage === true && (profileImageBase64 || profile.profileImage?.url) && (
              <img
                src={profileImageBase64 || profile.profileImage?.url}
                alt={profile.name}
                style={{ width: 96, height: 120, objectFit: 'cover', background: '#fff', border: '1px solid #eee', borderRadius: '50%', marginRight: 16 }}
                onLoad={() => { /*console.log('출력용 img onLoad:', profileImageBase64);*/ }}
              />
            )}
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{profile.name}</div>
              <div style={{ color: '#222' }}>{profile.title}</div>
              <div style={{ color: '#222', fontSize: 14 }}>{profile.email} {profile.showPhone === true && profile.phone && <>| {profile.phone}</>}</div>
              <div style={{ color: '#222', fontSize: 14 }}>{profile.location}</div>
            </div>
          </div>
        )}
        {/* 소개 (Introduce) 세션: 구분선 아래, 자기소개만 */}
        {profile?.resumeBio && (
          <>
            <hr style={{ margin: '32px 0', border: '1px solid #aaa', width: '100%' }} />
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#FF8000', marginBottom: 12 }}>소개 (Introduce)</h2>
              <div style={{ marginLeft: 32, color: '#222', marginTop: 8 }}>
                <RichTextRenderer text={profile.resumeBio} className="mt-2 text-gray-900 prose max-w-none" />
              </div>
            </section>
          </>
        )}
        {/* 경력 (Company) */}
        {sortedCompanies.length > 0 && (
          <>
            <hr style={{ margin: '32px 0', border: '1px solid #aaa', width: '100%' }} />
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#FF8000', marginBottom: 12 }}>경력 (Company)</h2>
              <ul style={{ marginLeft: 32 }}>
                {sortedCompanies.map((comp, idx) => {
                  const companyProjects = getSortedProjects(comp.id);
                  const start = comp.startDate;
                  const end = comp.endDate || '현재';
                  const months = getMonthDiff(comp.startDate, comp.endDate || new Date().toISOString().slice(0, 7));
                  const companyDesc = comp.description;
                  return (
                    <li key={idx} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>{comp.company}</span>
                        {comp.position && <span style={{ marginLeft: 4, fontSize: 15, color: '#444' }}>- {comp.position}</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginLeft: 24 }}>
                        {start} ~ {end}
                        {months && <span> ({getPeriodText(months)})</span>}
                      </div>
                      {companyDesc && <div style={{ fontSize: 13, color: '#444', marginLeft: 24, marginBottom: 4 }}>{companyDesc}</div>}
                      {companyProjects.length > 0 && (
                        <ul style={{ marginLeft: 24, marginTop: 4 }}>
                          {companyProjects.map((proj, idx) => {
                            const matchedCareerDetails = getSortedCareerDetails(proj.id);
                            const hasCareerDetail = matchedCareerDetails.length > 0;
                            const careerHref = hasCareerDetail ? `/career-detail#cd-${matchedCareerDetails[0].id}` : undefined;
                            return (
                              <React.Fragment key={proj.id}>
                                <li style={{ marginBottom: 6 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontWeight: 700, fontSize: 7, color: '#111', marginRight: 6, verticalAlign: 'middle', lineHeight: 1 }}>●</span>
                                    {hasCareerDetail ? (
                                      <Link href={careerHref!} className="font-bold text-[15px]" style={{ textDecoration: 'none', cursor: 'pointer', color: '#000' }}>
                                        {proj.title}
                                      </Link>
                                    ) : (
                                      <span className="font-bold text-[15px]" style={{ color: '#000' }}>{proj.title}</span>
                                    )}
                                    <span style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>
                                      {proj.startDate}{proj.endDate ? ` ~ ${proj.endDate}` : proj.startDate ? ' ~ 현재' : ''}
                                    </span>
                                  </div>
                                  {/* 웹용 프로젝트 설명 */}
                                  {proj.shortDescription && (
                                    <div style={{ color: '#222', fontSize: 14, marginLeft: 24, marginTop: 2 }}>
                                      <RichTextRenderer text={proj.shortDescription} className="mt-1 prose-project-desc" />
                                    </div>
                                  )}
                                  {/* 스킬: 프린트에서는 뱃지 없이 텍스트만 */}
                                  {Array.isArray(proj.skills) && proj.skills.length > 0 && (
                                    <div style={{ marginLeft: 24, marginTop: 4 }}>
                                      <span style={{ fontWeight: 500, color: '#111', marginLeft: 0 }}>skill : </span>
                                      <span style={{ color: '#111', fontSize: 12 }}>
                                        {(Array.isArray(proj.skills) ? proj.skills : []).map((skill: any, i: number, arr: any[]) => `${skill.name}${i < arr.length - 1 ? ', ' : ''}`)}
                                      </span>
                                    </div>
                                  )}
                                </li>
                                {idx < companyProjects.length - 1 && <hr style={{ margin: '12px 0', border: '0.5px solid #ddd', width: '100%' }} />}
                              </React.Fragment>
                            );
                          })}
                        </ul>
                      )}
                      {/* 회사와 회사 사이에 얇은 구분선 추가 (마지막 회사 제외) */}
                      {idx < sortedCompanies.length - 1 && (
                        <hr
                          style={{
                            marginTop: 24,
                            marginBottom: 0,
                            border: '0.5px solid #ddd',
                            width: '100%',
                          }}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}
        {/* 개인 프로젝트 (Personal Project) */}
        {projects.filter((proj) => proj.company == null && proj.visible !== false).length > 0 && (
          <>
            <hr style={{ margin: '32px 0', border: '1px solid #aaa', width: '100%' }} />
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#FF8000', marginBottom: 12 }}>개인 프로젝트 (Personal Project)</h2>
              <ul style={{ marginLeft: 32 }}>
                {projects.filter((proj) => proj.company == null && proj.visible !== false).map((proj, idx, arr) => {
                  const matchedCareerDetail = careerDetails.find(cd => {
                    if (typeof cd.project === 'object' && cd.project !== null && 'id' in (cd.project as any)) {
                      return (cd.project as any).id === proj.id;
                    }
                    return cd.project === proj.id;
                  });
                  return (
                    <li key={proj.id} style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#111', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 7, color: '#111', marginRight: 6, verticalAlign: 'middle', lineHeight: 1 }}>●</span> <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{proj.title}</span>
                        <span style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>{proj.startDate}{proj.endDate ? ` ~ ${proj.endDate}` : proj.startDate ? ' ~ 현재' : ''}</span>
                      </div>
                      {proj.shortDescription && (
                        <div style={{ color: '#222', fontSize: 14, marginLeft: 24, marginTop: 2 }}>
                          <RichTextRenderer text={proj.shortDescription} className="mt-1 prose-project-desc" />
                        </div>
                      )}
                      {/* 스킬: 프린트에서는 뱃지 없이 텍스트만 */}
                      {Array.isArray(proj.skills) && proj.skills.length > 0 && (
                        <div style={{ marginLeft: 24, marginTop: 4 }}>
                          <span style={{ fontWeight: 500, color: '#111', marginLeft: 0 }}>skill : </span>
                          <span style={{ color: '#111', fontSize: 12 }}>
                            {(Array.isArray(proj.skills) ? proj.skills : []).map((skill: any, i: number, arr: any[]) => `${skill.name}${i < arr.length - 1 ? ', ' : ''}`)}
                          </span>
                        </div>
                      )}
                      {matchedCareerDetail && (
                        <div style={{ marginLeft: 24, marginTop: 8, borderLeft: '2px solid #eee', paddingLeft: 12 }}>
                          <span style={{ fontWeight: 600, color: '#111' }}>경력기술서 있음</span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}
        {/* 기술스택 (Skills) */}
        {publicSkills.length > 0 && (
          <>
            <hr style={{ margin: '32px 0', border: '1px solid #aaa', width: '100%' }} />
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#FF8000', marginBottom: 12 }}>기술스택 (Skills)</h2>
              <ul style={{ marginLeft: 32 }}>
                {SKILL_CATEGORY_ORDER.filter(category => skillsByCategory[category]).map((category) => (
                  <li key={category} style={{ marginBottom: 8 }}>
                    <span style={{ fontWeight: 700 }}>{`${category} : `}</span>
                    <span>
                      {skillsByCategory[category]
                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                        .map((skill, i, arr) => (
                          <span key={skill.id}>{skill.name}{i < arr.length - 1 ? ', ' : ''}</span>
                        ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
        {/* 학력 (Education) */}
        {educations.length > 0 && (
          <>
            <hr style={{ margin: '32px 0', border: '1px solid #aaa', width: '100%' }} />
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#FF8000', marginBottom: 12 }}>학력 (Education)</h2>
              <ul style={{ marginLeft: 32 }}>
                {educations.map((edu, idx) => (
                  <li key={idx} style={{ marginBottom: 12 }}>
                    {/* 학교 로고 이미지는 출력용에서 제외 */}
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{edu.institution}{edu.field && ` ${edu.field}`}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{edu.startDate} ~ {edu.endDate || '현재'}</div>
                    {edu.description && (
                      <div style={{ color: '#222', fontSize: 13, marginTop: 2 }}>
                        <RichTextRenderer text={edu.description} className="mt-1" />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
        {/* 기타 경험 (Other Experience) */}
        {visibleExperiences.length > 0 && (
          <>
            <hr style={{ margin: '32px 0', border: '1px solid #aaa', width: '100%' }} />
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#FF8000', marginBottom: 12 }}>기타 경험 (Other Experience)</h2>
              <ul style={{ marginLeft: 0 }}>
                {(() => {
                  const categories = ['Class', 'ETC'];
                  const categoryExps = categories.map(category => visibleExperiences.filter(exp => exp.category === category));
                  const bothExist = categoryExps.every(exps => exps.length > 0);
                  return (
                    <>
                      {categoryExps[0].length > 0 && (
                        <li style={{ marginBottom: 24, marginLeft: 32 }}>
                          <div style={{ fontWeight: 700, fontSize: 17, color: '#111', marginBottom: 8 }}>Class.</div>
                          <ul style={{ marginLeft: 16, padding: 0, listStyle: 'none' }}>
                            {categoryExps[0].map((exp, idx) => (
                              <li key={exp.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, marginLeft: 16 }}>
                                <span style={{ fontWeight: 700, fontSize: 7, color: '#111', marginRight: 6, verticalAlign: 'middle', lineHeight: 1 }}>●</span>
                                <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{exp.title}</span>
                                <span style={{ marginLeft: 16, fontSize: 12, color: '#666' }}>{exp.startDate} ~ {exp.endDate || '현재'}</span>
                                {exp.description && (
                                  <div style={{ color: '#222', fontSize: 13, marginTop: 2, marginLeft: 24 }}>
                                    <RichTextRenderer text={exp.description} />
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </li>
                      )}
                      {bothExist && (
                        <hr style={{ margin: '20px 0', border: '1px solid #ddd', width: 'calc(100% - 32px)', marginLeft: 32 }} />
                      )}
                      {categoryExps[1].length > 0 && (
                        <li style={{ marginBottom: 24, marginLeft: 32 }}>
                          <div style={{ fontWeight: 700, fontSize: 17, color: '#111', marginBottom: 8 }}>ETC.</div>
                          <ul style={{ marginLeft: 16, padding: 0, listStyle: 'none' }}>
                            {categoryExps[1].map((exp, idx) => (
                              <li key={exp.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, marginLeft: 16 }}>
                                <span style={{ fontWeight: 700, fontSize: 7, color: '#111', marginRight: 6, verticalAlign: 'middle', lineHeight: 1 }}>●</span>
                                <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{exp.title}</span>
                                <span style={{ marginLeft: 16, fontSize: 12, color: '#666' }}>{exp.startDate} ~ {exp.endDate || '현재'}</span>
                                {exp.description && (
                                  <div style={{ color: '#222', fontSize: 13, marginTop: 2, marginLeft: 24 }}>
                                    <RichTextRenderer text={exp.description} />
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </li>
                      )}
                    </>
                  );
                })()}
              </ul>
            </section>
          </>
        )}
      </div>
    </>
  );
}