import { getCareerDetails } from '@/lib/api';
import { CareerDetail } from '@/types/career-detail';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import { RichTextRenderer } from '@/components/ui/RichTextRenderer';

interface CareerDetailPageProps {
  params: { id: string };
}

export default async function CareerDetailPage({ params }: CareerDetailPageProps) {
  const { id } = params;
  const detailsRes: any = await getCareerDetails();
  const detail: CareerDetail | undefined = detailsRes && Array.isArray(detailsRes.data)
    ? detailsRes.data.map((item: any) => item.attributes ?? item).find((cd: any) => String(cd.id) === id)
    : undefined;

  if (!detail) return notFound();

  return (
    <main className="max-w-2xl mx-auto pt-24 md:pt-32 pb-12 px-4">
      <h1 className="text-2xl font-bold mb-6">{detail.title}</h1>
      <div className="mb-2 text-gray-600">
        {detail.company?.company && <span>회사: {detail.company.company} </span>}
        {detail.project?.title && <span>프로젝트: {detail.project.title} </span>}
        {detail.period && <span>기간: {detail.period} </span>}
        {detail.teamSize && <span>팀 규모: {detail.teamSize} </span>}
      </div>
      <div className="mb-2">
        <strong>담당 역할:</strong> {detail.myRole}
      </div>
      {detail.responsibilities && detail.responsibilities.length > 0 && (
        <div className="mb-2">
          <strong>주요 업무:</strong>
          <ul className="list-disc ml-6">
            {detail.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}
      {detail.technologies && detail.technologies.length > 0 && (
        <div className="mb-2">
          <strong>사용 기술:</strong> {detail.technologies.map((t) => t.name).join(', ')}
        </div>
      )}
      {detail.challenges && (
        <div className="mb-2">
          <strong>주요 도전과제:</strong> <RichTextRenderer text={detail.challenges} />
        </div>
      )}
      {detail.solutions && (
        <div className="mb-2">
          <strong>해결 방안:</strong> <RichTextRenderer text={detail.solutions} />
        </div>
      )}
      {detail.results && (
        <div className="mb-2">
          <strong>성과/결과:</strong> <RichTextRenderer text={detail.results} />
        </div>
      )}
      {detail.lessonsLearned && (
        <div className="mb-2">
          <strong>배운 점/교훈:</strong> <RichTextRenderer text={detail.lessonsLearned} />
        </div>
      )}
      {detail.metrics && Object.keys(detail.metrics).length > 0 && (
        <div className="mb-2">
          <strong>주요 지표:</strong>
          <ul className="list-disc ml-6">
            {Object.entries(detail.metrics).map(([k, v], i) => (
              <li key={i}>{k}: {v}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
} 