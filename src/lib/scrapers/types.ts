import { PropertyTypology, PropertyCondition } from '@/types/property';

export interface ScrapedRawProperty {
  source_portal: 'Idealista' | 'Imovirtual' | 'CasaSAPO';
  source_id: string;
  title: string;
  price: number;
  area_m2: number;
  typology: PropertyTypology;
  condition: PropertyCondition;
  freguesia: string;
  concelho: string;
  district: string;
  cover_image: string;
  gallery?: string[];
  original_url: string;
  description?: string;
}

export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
];

export function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export function extractTypology(text: string): PropertyTypology {
  const match = text.match(/\bT([0-9])(?:\+([0-9]))?\b/i);
  if (!match) {
    if (text.toLowerCase().includes('moradia')) return 'Moradia';
    if (text.toLowerCase().includes('terreno')) return 'Terreno';
    return 'T2';
  }
  const num = parseInt(match[1], 10);
  if (num === 0) return 'T0';
  if (num === 1) return 'T1';
  if (num === 2) return 'T2';
  if (num === 3) return 'T3';
  return 'T4+';
}

export function parsePrice(priceText: string): number {
  const cleaned = priceText.replace(/[^0-9]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

export function parseArea(areaText: string): number {
  const match = areaText.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:m²|m2)/i);
  if (match) {
    return Math.round(parseFloat(match[1]));
  }
  const digits = areaText.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 80;
}
