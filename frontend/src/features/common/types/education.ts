export interface Education {
  id: number;
  institution: string;
  degree?: string;
  field?: string;
  startDate: string;
  endDate?: string;
  grade?: string;
  description?: string;
  logo?: { url: string } | null;
  activities?: string[];
  order?: number;
}

export interface EducationResponse {
  data: {
    id: number;
    attributes: Education;
  }[];
} 