export interface StrapiMedia {
  id: number;
  url: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  name: string;
}

export type StrapiMediaResponse = {
  data: {
    id: number;
    attributes: StrapiMedia;
  } | null;
} | StrapiMedia;

export type StrapiMultipleMediaResponse = {
  data: {
    id: number;
    attributes: StrapiMedia;
  }[];
} | StrapiMedia[]; 