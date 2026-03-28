export type OtherExperienceCategory = 'Class' | 'ETC';

export interface OtherExperience {
  id: number;
  title: string;
  category: OtherExperienceCategory;
  startDate: string;
  endDate?: string;
  visible: boolean;
  order?: number;
  description?: string;
}

export {};

export {}; 