"use client";
import ResumePdfDownloadButton from "@/components/ResumePdfDownloadButton";
import ResumeContentWithDownload from "@/components/ResumeContentWithDownload";
import { RichTextRenderer } from "@/components/ui/RichTextRenderer";
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
import './resume-print.css';
import './resume-badge.css';

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

export default function ResumePageClient({
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
  // 기존 resume/page.tsx의 데이터 가공 및 렌더링 로직 복사
  const visibleExperiences = otherExperiences.filter(a => a.visible);
  const sortedExperiences = [...visibleExperiences].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const classExperiences = sortedExperiences.filter(a => a.category === 'Class');
  const etcExperiences = sortedExperiences.filter(a => a.category === 'ETC');
  const filteredCompanies = companies.filter(company => {
    return projects.some(proj => proj.company === company.id);
  });
  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    if (a.order != null && b.order != null && a.order !== b.order) return b.order - a.order;
    if (a.order != null && b.order == null) return -1;
    if (a.order == null && b.order != null) return 1;
    const aDate = a.endDate || a.startDate || '';
    const bDate = b.endDate || b.startDate || '';
    if (aDate !== bDate) return bDate.localeCompare(aDate);
    return (b.id || 0) - (a.id || 0);
  });
  const getSortedProjects = (companyId: number) => {
    return projects.filter((proj) => proj.company === companyId && proj.visible !== false).sort((a, b) => {
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
  const CATEGORY_ORDER = ["Backend", "Frontend", "Database", "Tools", "Server", "Other"];
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);
  const showDownload = !!profile?.resumeDownloadEnabled;

  console.log('프로젝트 전체 리스트', projects.map(proj => ({ title: proj.title, company: proj.company, visible: proj.visible, skills: proj.skills })));

  // 출력용 프로필 사진 Base64 변환
  const [profileImageBase64, setProfileImageBase64] = useState<string | null>(null);
  const [profileImageReady, setProfileImageReady] = useState(false);
  useEffect(() => {
    console.log('Base64 변환 useEffect 실행', profile);
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
            console.log('Base64 변환 성공:', reader.result);
          };
          reader.readAsDataURL(blob);
        } catch (e) {
          setProfileImageBase64(null);
          setProfileImageReady(true);
          console.error('Base64 변환 실패:', e);
        }
      } else {
        setProfileImageBase64(null);
        setProfileImageReady(true);
      }
    }
    fetchAndConvertProfileImage();
  }, [profile?.showProfileImage, profile?.profileImage?.url]);

  return (
    <>
      {/* 화면용 이력서 */}
      <main id="resume-content" className="max-w-6xl mx-auto pt-24 md:pt-32 pb-12 px-4">
        <div className="bg-white/80 dark:bg-black/80 rounded-xl p-8 flex flex-col gap-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">이력서 (Resume)</h1>
            {showDownload && <ResumePdfDownloadButton />}
          </div>
          {/* 프로필 정보: 사진+이름+연락처 등 */}
          {profile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
              {/* 출력용: Base64 우선, 없으면 기존 URL */}
              {profile.showProfileImage === true && (profileImageBase64 || profile.profileImage?.url) && (
                <img
                  src={profileImageBase64 || profile.profileImage?.url}
                  alt={profile.name}
                  style={{ width: 96, height: 120, objectFit: 'contain', background: '#fff', border: '1px solid #eee', borderRadius: 8, marginRight: 16 }}
                  onLoad={() => { console.log('출력용 img onLoad:', profileImageBase64); }}
                />
              )}
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{profile.name}</div>
                <div className="text-gray-900 dark:text-gray-100">{profile.title}</div>
                <div className="text-gray-900 dark:text-gray-100 text-[14px]">{profile.email} {profile.showPhone === true && profile.phone && <>| {profile.phone}</>}</div>
                <div className="text-gray-900 dark:text-gray-100 text-[14px]">{profile.location}</div>
              </div>
            </div>
          )}
          {/* 소개 (Introduce) 세션: 구분선 아래, 자기소개만 */}
          {profile?.resumeBio && (
            <>
              <hr style={{ margin: '32px 0', border: '1px solid #aaa', width: '100%' }} />
              <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: '#FF8000', marginBottom: 12 }}>소개 (Introduce)</h2>
                <div style={{ marginLeft: 32, marginTop: 8 }} className="text-gray-900 dark:text-gray-100 prose max-w-none">
                  <RichTextRenderer text={profile.resumeBio} className="mt-2 prose max-w-none dark:prose-invert" />
                </div>
              </section>
            </>
          )}

          {/* 경력 */}
          <section className="mb-0">
            {sortedCompanies.length > 0 ? (
              <>
                <hr style={{ margin: '32px 0', border: '1px solid #aaa', width: '100%' }} />
                <section style={{ marginBottom: 32 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 600, color: '#FF8000', marginBottom: 12 }}>경력1 (Company)</h2>
                  <ul className="space-y-4">
                    {sortedCompanies.map((comp, idx) => {
                      const companyProjects = getSortedProjects(comp.id);
                      const start = comp.startDate;
                      const end = comp.endDate || '현재';
                      const months = getMonthDiff(comp.startDate, comp.endDate || new Date().toISOString().slice(0, 7));
                      const companyDesc = comp.description;
                      return (
                        <li key={idx} className="pb-4 ml-8">
                          <div className="flex items-center gap-2 mb-1">
                            {comp.companyLogo?.url && (
                              <img src={comp.companyLogo.url} alt={comp.company + ' 로고'} className="w-8 h-8 rounded bg-white object-contain border" />
                            )}
                            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{comp.company}</span>
                            {comp.position && <span className="ml-1 text-base text-gray-700 dark:text-gray-200">- {comp.position}</span>}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-300 ml-10">
                            {start} ~ {end}
                            {months && <span> ({getPeriodText(months)})</span>}
                          </div>
                          {companyDesc && <div className="text-sm text-gray-700 dark:text-gray-300 ml-10 mb-1">{companyDesc}</div>}
                          {companyProjects.length > 0 && (
                            <ul style={{ marginLeft: 24, marginTop: 4 }}>
                              {companyProjects.map((proj, idx) => {
                                console.log('프로젝트', proj);
                                const matchedCareerDetails = getSortedCareerDetails(proj.id);
                                const hasCareerDetail = matchedCareerDetails.length > 0;
                                const careerHref = hasCareerDetail ? `/career-detail#cd-${matchedCareerDetails[0].id}` : undefined;
                                return (
                                  <React.Fragment key={proj.id}>
                                    <li style={{ marginBottom: 6 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span className="font-bold text-[15px] text-gray-900 dark:text-gray-100">●</span>
                                        {hasCareerDetail ? (
                                          <Link
                                            href={careerHref!}
                                            className="font-bold text-[15px] text-gray-900 dark:text-white hover:text-sky-500 dark:hover:text-sky-500 transition-colors cursor-pointer"
                                            style={{ textDecoration: 'none' }}
                                          >
                                            {proj.title}
                                          </Link>
                                        ) : (
                                          <span className="font-bold text-[15px] text-gray-900 dark:text-white">{proj.title}</span>
                                        )}
                                        <span className="ml-2 text-[12px] text-gray-600 dark:text-gray-200">{proj.startDate}{proj.endDate ? ` ~ ${proj.endDate}` : proj.startDate ? ' ~ 현재' : ''}</span>
                                      </div>
                                      {/* 웹용 프로젝트 설명 */}
                                      {proj.shortDescription && (
                                        <div className="mt-1 text-gray-700 dark:text-gray-100 text-[14px] ml-6 prose dark:prose-invert">
                                          <RichTextRenderer text={proj.shortDescription} className="prose-project-desc text-gray-700 dark:text-gray-100" />
                                        </div>
                                      )}
                                      {/* 스킬: 프린트에서는 뱃지 없이 텍스트만 */}
                                      {Array.isArray(proj.skills) && proj.skills.length > 0 && (
                                        <div style={{ marginLeft: 24, marginTop: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                          <span className="font-medium text-gray-900 dark:text-gray-100 mr-2">skill :</span>
                                          {(Array.isArray(proj.skills) ? proj.skills : []).map((skill: any, i: number) => (
                                            <span key={skill.id || skill.name || i} className="resume-skill-badge bg-sky-100 text-sky-700 px-2 py-0.5 rounded text-[13px] font-semibold border border-sky-200">{skill.name}</span>
                                          ))}
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
                                margin: '20px 0',
                                border: '1px solid #ddd',
                                width: '100%'
                              }}
                            />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              </>
            ) : (
              <div className="text-gray-500 ml-8">경력 정보가 없습니다.</div>
            )}
          </section>
          {/* 개인 프로젝트 (Personal Project) */}
          {projects.filter((proj) => proj.company == null && proj.visible !== false).length > 0 && (
            <>
              <hr style={{ margin: '32px 0', border: '1px solid #aaa', width: '100%' }} />
              <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: '#FF8000', marginBottom: 12 }}>개인 프로젝트 (Personal Project)</h2>
                <ul style={{ marginLeft: 32 }}>
                  {projects.filter((proj) => proj.company == null && proj.visible !== false).map((proj, idx, arr) => {
                    const matchedCareerDetail = careerDetails.find(cd => {
                      if (typeof cd.project === 'object' && cd.project !== null && 'id' in cd.project) {
                        return cd.project.id === proj.id;
                      }
                      return cd.project === proj.id;
                    });
                    return (
                      <li key={proj.id} style={{ marginBottom: 12 }}>
                        <div className="font-bold text-[15px] text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <span className="font-bold text-[15px] text-gray-900 dark:text-gray-100">●</span> <span className="font-bold text-[15px] text-gray-900 dark:text-gray-100">{proj.title}</span>
                          <span className="ml-2 text-[12px] text-gray-600 dark:text-gray-200">{proj.startDate}{proj.endDate ? ` ~ ${proj.endDate}` : proj.startDate ? ' ~ 현재' : ''}</span>
                        </div>
                        {proj.shortDescription && (
                          <div className="text-gray-900 dark:text-gray-100 text-[14px] ml-6 prose dark:prose-invert">
                            <RichTextRenderer text={proj.shortDescription} className="prose-project-desc text-gray-900 dark:text-gray-100" />
                          </div>
                        )}
                        {matchedCareerDetail && (
                          <div style={{ marginLeft: 24, marginTop: 8, borderLeft: '2px solid #eee', paddingLeft: 12 }}>
                            <span style={{ fontWeight: 600, color: '#111' }}>경력기술서 있음</span>
                          </div>
                        )}
                        {idx < arr.length - 1 && <hr style={{ margin: '12px 0', border: '0.5px solid #ddd', width: '100%' }} />}
                      </li>
                    );
                  })}
                </ul>
              </section>
            </>
          )}
          {/* Skills (기술스택) 섹션 위에만 조건부 <hr> */}
          {skills.length > 0 && (
            <>
              <hr style={{ margin: '32px 0', border: '1px solid #aaa', width: '100%' }} />
              <section className="mb-0">
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#FF8000' }}>기술스택 (Skills)</h2>
                <div className="space-y-1">
                  <ul className="ml-8">
                    {CATEGORY_ORDER.filter(category => skillsByCategory[category]).map((category) => (
                      <li key={category} className="mb-2">
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                          {`${category} : `}
                        </span>
                        <span className="text-gray-900 dark:text-gray-100">
                          {skillsByCategory[category]
                            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                            .map((skill, i, arr) => (
                              <span key={skill.id}>
                                {skill.name}{i < arr.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </>
          )}
          {/* 학력 (Education) 섹션 위에만 조건부 <hr> */}
          {educations.length > 0 && (
            <>
              <hr style={{ margin: '32px 0', border: '1px solid #aaa', width: '100%' }} />
              <section className="mb-0">
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#FF8000' }}>학력 (Education)</h2>
                <ul className="space-y-2">
                  {educations.map((edu, idx) => {
                    const liClass = edu.logo?.url ? "pb-2 flex items-start gap-3 ml-8" : "pb-2";
                    return (
                      <li key={idx} className={liClass}>
                        {edu.logo?.url && (
                          <img src={edu.logo.url} alt={edu.institution + ' 로고'} className="w-8 h-8 rounded bg-white object-contain border mt-1" />
                        )}
                        <div className="flex flex-col justify-center">
                          <div className="font-bold text-gray-900 dark:text-gray-100">{edu.institution}{edu.field && ` ${edu.field}`}</div>
                          <div className="text-sm text-gray-700 dark:text-gray-200">{edu.startDate} ~ {edu.endDate || '현재'}</div>
                          {edu.description && (
                            <div className="text-gray-700 dark:text-gray-200">
                              <RichTextRenderer text={edu.description} className="mt-1 text-gray-700 dark:text-gray-200" />
                            </div>
                          )}
                        </div>
                        {idx < educations.length - 1 && <hr style={{ margin: '12px 0', border: '0.5px solid #ddd', width: '100%' }} />}
                      </li>
                    );
                  })}
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
                            <div className="font-bold text-[17px] text-gray-900 dark:text-gray-100 mb-2">Class.</div>
                            <ul style={{ marginLeft: 16, padding: 0, listStyle: 'none' }}>
                              {categoryExps[0].map((exp, idx) => (
                                <li key={exp.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, marginLeft: 16 }}>
                                  <span className="font-bold text-[15px] text-gray-900 dark:text-gray-100">{exp.title}</span>
                                  <span className="ml-4 text-[12px] text-gray-600 dark:text-gray-200">{exp.startDate} ~ {exp.endDate || '현재'}</span>
                                  {exp.description && (
                                    <div className="text-gray-900 dark:text-gray-100 text-[13px] mt-1 ml-6 prose dark:prose-invert">
                                      <RichTextRenderer text={exp.description} className="prose dark:prose-invert" />
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
                            <div className="font-bold text-[17px] text-gray-900 dark:text-gray-100 mb-2">ETC.</div>
                            <ul style={{ marginLeft: 16, padding: 0, listStyle: 'none' }}>
                              {categoryExps[1].map((exp, idx) => (
                                <li key={exp.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, marginLeft: 16 }}>
                                  <span className="font-bold text-[15px] text-gray-900 dark:text-gray-100">{exp.title}</span>
                                  <span className="ml-4 text-[12px] text-gray-600 dark:text-gray-200">{exp.startDate} ~ {exp.endDate || '현재'}</span>
                                  {exp.description && (
                                    <div className="text-gray-900 dark:text-gray-100 text-[13px] mt-1 ml-6 prose dark:prose-invert">
                                      <RichTextRenderer text={exp.description} className="prose dark:prose-invert" />
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
                style={{ width: 96, height: 120, objectFit: 'contain', background: '#fff', border: '1px solid #eee', borderRadius: 8, marginRight: 16 }}
                onLoad={() => { console.log('출력용 img onLoad:', profileImageBase64); }}
              />
            )}
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{profile.name}</div>
              <div className="text-gray-900 dark:text-gray-100">{profile.title}</div>
              <div className="text-gray-900 dark:text-gray-100 text-[14px]">{profile.email} {profile.showPhone === true && profile.phone && <>| {profile.phone}</>}</div>
              <div className="text-gray-900 dark:text-gray-100 text-[14px]">{profile.location}</div>
            </div>
          </div>
        )}
        {/* 소개 (Introduce) 세션: 구분선 아래, 자기소개만 */}
        {profile?.resumeBio && (
          <>
            <hr style={{ margin: '32px 0', border: '1px solid #aaa', width: '100%' }} />
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#FF8000', marginBottom: 12 }}>소개 (Introduce)</h2>
              <div style={{ marginLeft: 32, color: '#222', marginTop: 8 }} className="text-gray-900 dark:text-gray-100 prose max-w-none">
                <RichTextRenderer text={profile.resumeBio} className="mt-2 prose max-w-none dark:prose-invert" />
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
                            console.log('프로젝트', proj);
                            const matchedCareerDetails = getSortedCareerDetails(proj.id);
                            const hasCareerDetail = matchedCareerDetails.length > 0;
                            const careerHref = hasCareerDetail ? `/career-detail#cd-${matchedCareerDetails[0].id}` : undefined;
                            return (
                              <React.Fragment key={proj.id}>
                                <li style={{ marginBottom: 6 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span className="font-bold text-[15px] text-gray-900 dark:text-gray-100">●</span>
                                    {hasCareerDetail ? (
                                      <Link
                                        href={careerHref!}
                                        className="font-bold text-[15px] text-gray-900 dark:text-white hover:text-sky-500 dark:hover:text-sky-500 transition-colors cursor-pointer"
                                        style={{ textDecoration: 'none' }}
                                      >
                                        {proj.title}
                                      </Link>
                                    ) : (
                                      <span className="font-bold text-[15px] text-gray-900 dark:text-white">{proj.title}</span>
                                    )}
                                    <span className="ml-2 text-[12px] text-gray-600 dark:text-gray-200">{proj.startDate}{proj.endDate ? ` ~ ${proj.endDate}` : proj.startDate ? ' ~ 현재' : ''}</span>
                                  </div>
                                  {/* 웹용 프로젝트 설명 */}
                                  {proj.shortDescription && (
                                    <div style={{ color: '#222', fontSize: 14, marginLeft: 24, marginTop: 2 }} className="prose dark:prose-invert">
                                      <RichTextRenderer text={proj.shortDescription} className="mt-1 prose-project-desc text-gray-700 dark:text-gray-200" />
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
                    if (typeof cd.project === 'object' && cd.project !== null && 'id' in cd.project) {
                      return cd.project.id === proj.id;
                    }
                    return cd.project === proj.id;
                  });
                  return (
                    <li key={proj.id} style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#111', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#111', fontWeight: 700 }}>●</span> <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{proj.title}</span>
                        <span style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>{proj.startDate}{proj.endDate ? ` ~ ${proj.endDate}` : proj.startDate ? ' ~ 현재' : ''}</span>
                      </div>
                      {proj.shortDescription && (
                        <div style={{ color: '#222', fontSize: 14, marginLeft: 24, marginTop: 2 }} className="prose dark:prose-invert">
                          <RichTextRenderer text={proj.shortDescription} className="mt-1 prose-project-desc" />
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
        {skills.length > 0 && (
          <>
            <hr style={{ margin: '32px 0', border: '1px solid #aaa', width: '100%' }} />
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#FF8000', marginBottom: 12 }}>기술스택 (Skills)</h2>
              <ul style={{ marginLeft: 32 }}>
                {CATEGORY_ORDER.filter(category => skillsByCategory[category]).map((category) => (
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
                                <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{exp.title}</span>
                                <span style={{ marginLeft: 16, fontSize: 12, color: '#666' }}>{exp.startDate} ~ {exp.endDate || '현재'}</span>
                                {exp.description && (
                                  <div style={{ color: '#222', fontSize: 13, marginTop: 2, marginLeft: 24 }} className="prose dark:prose-invert">
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
                                <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{exp.title}</span>
                                <span style={{ marginLeft: 16, fontSize: 12, color: '#666' }}>{exp.startDate} ~ {exp.endDate || '현재'}</span>
                                {exp.description && (
                                  <div style={{ color: '#222', fontSize: 13, marginTop: 2, marginLeft: 24 }} className="prose dark:prose-invert">
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