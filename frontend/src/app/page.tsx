import { getProfile, getSkills, getProjects } from "@/lib/api";
import { getSiteSettings } from '@/lib/siteSettings';
import HomePageClientV1 from '@/components/v1/pages/HomePageClientV1';
import HomePageClientV2 from '@/components/v2/pages/HomePageClientV2';

export const revalidate = 0;

// 버전-컴포넌트 맵: 새 버전 추가 시 여기 한 줄만 추가하면 됩니다.
const VERSION_COMPONENTS = {
  v1: HomePageClientV1,
  v2: HomePageClientV2,
  // v3: HomePageClientV3,
} as const;

export default async function Home() {
  let profile: any = null;
  let skills: any = null;
  let projects: any = null;
  let fetchError = false;

  try {
    [profile, skills, projects] = await Promise.all([
      getProfile(undefined, { cache: 'no-store' }),
      getSkills({ cache: 'no-store' }),
      getProjects(true, { cache: 'no-store' }),
    ]);
  } catch (e) {
    console.error('[HomePage] Backend fetch failed:', e);
    fetchError = true;
  }

  if (fetchError || (!profile && !skills)) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', padding: '40px 20px', textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
          ⏳ 서버를 깨우는 중입니다
        </h1>
        <p style={{ fontSize: '16px', color: '#666', maxWidth: '480px', lineHeight: 1.6, marginBottom: '24px' }}>
          무료 서버 환경으로 인해 서버가 휴면 상태에 있을 수 있습니다.<br />
          잠시 후 새로고침(F5)을 해주시면 정상적으로 표시됩니다.
        </p>
        <a
          href="/"
          style={{
            padding: '12px 32px', fontSize: '15px', fontWeight: 600,
            border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer',
            background: '#f8f8f8', textDecoration: 'none', color: '#333',
          }}
        >
          🔄 새로고침
        </a>
      </div>
    );
  }

  const settings = await getSiteSettings();
  const version = settings.portfolioVersion || 'v1';
  // 버전 맵에 없는 값이 오면 v1으로 안전하게 폴백
  const PageComponent = VERSION_COMPONENTS[version as keyof typeof VERSION_COMPONENTS] ?? HomePageClientV1;

  return (
    <PageComponent
      profile={profile ? profile.data : null}
      skills={skills ? skills.data : null}
      projects={projects ? projects.data : null}
    />
  );
}
