import { StrapiMediaResponse, StrapiMultipleMediaResponse } from './media';
import { Skill } from './skill';

export interface Project {
  id: number;
  title: string;
  slug: string;
  shortDescription?: string;
  fullDescription?: string;
  thumbnailImage?: StrapiMediaResponse;
  images?: StrapiMultipleMediaResponse;
  technologies?: {
    data: Skill[];
  };
  projectType: 'Web' | 'Mobile' | 'Desktop' | 'API' | 'Library' | 'Other';
  projectStatus: 'Completed' | 'In Progress' | 'Planned' | 'On Hold';
  startDate?: string;
  endDate?: string;
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
  order?: number;
  company?: number | null;
  visible?: boolean;
}

export interface ProjectsResponse {
  data: Project[];
}

export interface ProjectResponse {
  data: Project;
} 