export interface Article {
  id: string;
  title: string;
  tldr: string;
  source: string;
  url: string;
  publishedAt: string;
  category: string;
}

export type Category = 'world' | 'tech' | 'business' | 'politics';

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'world', label: 'World' },
  { id: 'tech', label: 'Tech & AI' },
  { id: 'business', label: 'Business' },
  { id: 'politics', label: 'Politics' },
];
