import { StrapiMedia } from './media';

export interface Profile {
  id: number;
  name: string;
  title: string;
  email: string;
  phone?: string;
  location?: string;
  bio: string;
  profileImage?: StrapiMedia;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    [key: string]: string | undefined;
  };
  resumeFile?: StrapiMedia;
  mainBio?: string;
  resumeBio?: string;
  headline?: string;
}

export interface ProfileResponse {
  data: Profile;
} 