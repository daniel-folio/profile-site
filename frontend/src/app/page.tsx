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
  const profile = await getProfile(undefined, { cache: 'no-store' });
  const skills = await getSkills({ cache: 'no-store' });
  const projects = await getProjects(true, { cache: 'no-store' });

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
