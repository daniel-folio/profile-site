import { Hero } from "@/components/sections/Hero";
import { Skills } from "@/components/sections/Skills";
import { Projects } from "@/components/sections/Projects";
import { getProfile } from "@/lib/api";
import { getSkills } from "@/lib/api";
import { getProjects } from "@/lib/api";

export const revalidate = 0; // 이 페이지를 항상 동적으로 렌더링하도록 설정 (SSR)

export default async function Home() {
  const profile = await getProfile();
  const skills = await getSkills();
  const projects = await getProjects(true);

  return (
    <div className="container mx-auto px-4">
      <div className="space-y-24 md:space-y-32">
        <section id="hero" className="py-16 md:py-24">
          <Hero profile={profile.data} />
        </section>
        <section id="skills" className="py-16 md:py-24 bg-transparent">
          <Skills skills={skills.data} />
        </section>
        <section id="projects" className="py-16 md:py-24 bg-transparent">
          <Projects projects={projects.data} />
        </section>
      </div>
    </div>
  );
}
