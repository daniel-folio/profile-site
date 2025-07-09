import { StrapiMediaResponse } from "./media";

export interface Skill {
  id: number;
  name: string;
  category: string;
  proficiency: number;
  description?: string;
  order: number;
  visible?: boolean;
  icon?: StrapiMediaResponse;
}

export interface SkillsResponse {
  data: Skill[];
} 