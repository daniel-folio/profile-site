export interface CareerDetail {
  id: number;
  title: string;
  company?: number;
  project: number | null;
  period?: string;
  teamSize?: string;
  myRole?: string;
  responsibilities?: string[];
  technologies?: { id: number; name: string }[];
  challenges?: string;
  solutions?: string;
  results?: string;
  lessonsLearned?: string;
  metrics?: Record<string, string | number>;
  order?: number;
  startDate?: string;
  endDate?: string;
}

export interface CareerDetailResponse {
  data: {
    id: number;
    attributes: CareerDetail;
  }[];
} 