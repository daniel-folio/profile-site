import { getProfile, getSkills, getProjects } from "@/lib/api";
import { getSiteSettings } from '@/lib/siteSettings';
import HomePageClientV1 from '@/components/v1/pages/HomePageClientV1';
import HomePageClientV2 from '@/components/v2/pages/HomePageClientV2';

export const revalidate = 0; // 이 페이지를 항상 동적으로 렌더링하도록 설정 (SSR)

export default async function Home() {
  const profile = await getProfile(undefined, { cache: 'no-store' });
  const skills = await getSkills({ cache: 'no-store' });
  const projects = await getProjects(true, { cache: 'no-store' });

  // 백엔드 설정에서 버전 확인
  const settings = await getSiteSettings();
  const isV2 = settings.portfolioVersion === 'v2';

  if (isV2) {
    return (
      <HomePageClientV2
        profile={profile ? profile.data : null}
        skills={skills ? skills.data : null}
        projects={projects ? projects.data : null}
      />
    );
  }

  return (
    <HomePageClientV1
      profile={profile ? profile.data : null}
      skills={skills ? skills.data : null}
      projects={projects ? projects.data : null}
    />
  );
}
