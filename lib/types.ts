export type Wish = {
  id: string;
  name: string;
  relation: string | null;
  message: string;
  photo_urls: string[];
  created_at: string;
};

export const LIMITS = {
  name: 50,
  relation: 50,
  message: 500,
  photos: 3,
} as const;
