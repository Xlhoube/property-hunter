export type SourceType = 'scraper' | 'rss' | 'api' | 'html';
export type SourceStatus = 'active' | 'paused' | 'error';
export type SourceCategory = 'portal' | 'rede' | 'classificados' | 'dados';

export const SOURCE_CATEGORY_LABELS: Record<SourceCategory, string> = {
  portal: 'Portais Agregadores',
  rede: 'Redes de Mediação',
  classificados: 'Classificados',
  dados: 'Dados, Leilões e Oportunidades',
};

export interface PropertySource {
  id: string;
  name: string;
  slug: string;
  baseUrl: string;
  searchUrlPattern: string;
  enabled: boolean;
  type: SourceType;
  category?: SourceCategory;
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
