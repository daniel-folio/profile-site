export interface Company {
  id: number;
  company: string;
  position: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance';
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  location?: string;
  companyLogo?: { url: string } | null;
  description?: string;
  achievements?: string[];
  skills?: { data: { id: number; attributes: { name: string } }[] };
  projects?: { data: { id: number; attributes: { title: string } }[] };
  order?: number;
}

export interface CompanyResponse {
  data: {
    id: number;
    attributes: Company;
  }[];
} 