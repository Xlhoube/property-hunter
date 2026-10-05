export type SourceType = 'scraper' | 'rss' | 'api' | 'html';
export type SourceStatus = 'active' | 'paused' | 'error';

export interface PropertySource {
  id: string;
  name: string;
  slug: string;
  baseUrl: string;
  searchUrlPattern: string;
  enabled: boolean;
  type: SourceType;
  intervalHours: number;
  lastScrapeAt?: string;
  status: SourceStatus;
  totalScrapedCount?: number;
  description: string;
  iconColor: string;
  isCustom: boolean;
  createdAt: string;
}

export interface NewSourceInput {
  name: string;
  baseUrl: string;
  searchUrlPattern: string;
  type: SourceType;
  intervalHours: number;
  description?: string;
}
