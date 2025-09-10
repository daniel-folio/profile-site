import { Hero } from "@/components/sections/Hero";
import { Skills } from "@/components/sections/Skills";
import { Projects } from "@/components/sections/Projects";
import { getProfile } from "@/lib/api";
import { getSkills } from "@/lib/api";
import { getProjects } from "@/lib/api";

export const revalidate = 0; // 이 페이지를 항상 동적으로 렌더링하도록 설정 (SSR)

export default async function Home() {
  const profile = await getProfile(undefined, { cache: 'no-store' });
  const skills = await getSkills({ cache: 'no-store' });
  const projects = await getProjects(true, { cache: 'no-store' });

  return (
    <div className="container mx-auto px-4">
      <div>
        <section id="hero" className="pt-16 md:pt-24 pb-16 md:pb-24 scroll-mt-[72px] md:scroll-mt-[80px]">
          <Hero profile={profile ? profile.data : null} />
        </section>
        <section id="skills" className="pt-0 md:pt-0 pb-16 md:pb-24 bg-transparent scroll-mt-[72px] md:scroll-mt-[80px]">
          <Skills skills={skills ? skills.data : null} />
        </section>
        <section id="projects" className="pt-0 md:pt-0 pb-16 md:pb-24 bg-transparent scroll-mt-[72px] md:scroll-mt-[80px]">
          <Projects projects={projects ? projects.data : null} />
        </section>
      </div>
    </div>
  );
}
