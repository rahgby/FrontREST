export default interface NasaImagesAPIResponse {
  collection: Collection;
}

export interface Collection {
  version: string;
  href: string;
  items: Item[];
  metadata: Metadata;
  links: CollectionLink[];
}

export interface Item {
  href: string;
  data: Datum[];
  links?: ItemLink[];
}

export interface Datum {
  center: Center;
  title: string;
  nasa_id: string;
  media_type: MediaType;
  keywords: string[];
  date_created: Date;
  description: string;
  description_508?: string;
  secondary_creator?: string;
  location?: string;
  photographer?: string;
  album?: string[];
}

export enum Center {
  Arc = 'ARC',
  Gsfc = 'GSFC',
  Hq = 'HQ',
  Jpl = 'JPL',
  Jsc = 'JSC',
}

export enum MediaType {
  Audio = 'audio',
  Image = 'image',
  Video = 'video',
}

export interface ItemLink {
  href: string;
  rel: Rel;
  render?: MediaType;
}

export enum Rel {
  Captions = 'captions',
  Preview = 'preview',
}

export interface CollectionLink {
  rel: string;
  prompt: string;
  href: string;
}

export interface Metadata {
  total_hits: number;
}
