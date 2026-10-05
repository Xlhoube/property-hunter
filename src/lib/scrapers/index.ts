import { Property } from '@/types/property';
import { ScrapedRawProperty } from './types';
import { scrapeImovirtual } from './imovirtual';
import { scrapeCasaSapo } from './casasapo';
import { scrapeIdealista } from './idealista';
import {
  calculatePriceM2,
  calculatePriceDeviation,
  determineOpportunityRating,
  findZoneAveragePriceM2,
} from '@/lib/market-analysis';
import { fetchMarketZones } from '@/lib/appwrite';

export interface MultiPortalScrapeReport {
  timestamp: string;
  concelhos_scanned: string[];
  total_raw_found: number;
  imovirtual_count: number;
  casasapo_count: number;
  idealista_count: number;
  normalized_properties: Property[];
  errors: string[];
}

export async function scrapeAllPortals(
  concelhos = ['Lisboa', 'Porto', 'Cascais', 'Braga'],
  maxItemsPerPortal = 25
): Promise<MultiPortalScrapeReport> {
  const timestamp = new Date().toISOString();
  const zones = await fetchMarketZones();

  let imovirtualCount = 0;
  let casasapoCount = 0;
  let idealistaCount = 0;
  const rawList: ScrapedRawProperty[] = [];
  const errors: string[] = [];

  for (const concelho of concelhos) {
    console.log(`[MultiPortal Scraper] A iniciar ronda integrada para concelho: ${concelho}`);

    const [imoRes, sapoRes, idlRes] = await Promise.allSettled([
      scrapeImovirtual(concelho, maxItemsPerPortal),
      scrapeCasaSapo(concelho, maxItemsPerPortal),
      scrapeIdealista(concelho, maxItemsPerPortal),
    ]);

    if (imoRes.status === 'fulfilled' && imoRes.value.length > 0) {
      imovirtualCount += imoRes.value.length;
      rawList.push(...imoRes.value);
    } else if (imoRes.status === 'rejected') {
      errors.push(`Imovirtual (${concelho}): ${String(imoRes.reason)}`);
    }

    if (sapoRes.status === 'fulfilled' && sapoRes.value.length > 0) {
      casasapoCount += sapoRes.value.length;
      rawList.push(...sapoRes.value);
    } else if (sapoRes.status === 'rejected') {
      errors.push(`CasaSAPO (${concelho}): ${String(sapoRes.reason)}`);
    }

    if (idlRes.status === 'fulfilled' && idlRes.value.length > 0) {
      idealistaCount += idlRes.value.length;
      rawList.push(...idlRes.value);
    } else if (idlRes.status === 'rejected') {
      errors.push(`Idealista (${concelho}): ${String(idlRes.reason)}`);
    }
  }

  // Deduplicação por original_url e normalização imobiliária
  const seenUrls = new Set<string>();
  const normalizedProperties: Property[] = [];

  for (const raw of rawList) {
    if (seenUrls.has(raw.original_url)) continue;
    seenUrls.add(raw.original_url);

    const priceM2 = calculatePriceM2(raw.price, raw.area_m2);
    const zoneAvgM2 = findZoneAveragePriceM2(raw.concelho, raw.freguesia, zones);
    const devPct = calculatePriceDeviation(priceM2, zoneAvgM2);
    const oppRating = determineOpportunityRating(devPct);

    const prop: Property = {
      id: raw.source_id,
      source_id: raw.source_id,
      source_portal: raw.source_portal,
      original_url: raw.original_url,
      title: raw.title,
      description: raw.description || `Imóvel angariado através de ${raw.source_portal} na zona de ${raw.concelho}.`,
      price: raw.price,
      previous_price: raw.price,
      area_m2: raw.area_m2,
      price_m2: priceM2,
      zone_avg_price_m2: zoneAvgM2,
      price_deviation_pct: devPct,
      opportunity_rating: oppRating,
      typology: raw.typology,
      condition: raw.condition,
      freguesia: raw.freguesia,
      concelho: raw.concelho,
      district: raw.district,
      cover_image: raw.cover_image,
      gallery: raw.gallery,
      created_at: timestamp,
      last_scraped_at: timestamp,
      price_change_type: 'none',
      price_change_amount: 0,
      price_change_pct: 0,
      is_active: true,
      price_history: [
        {
          id: `hist_${raw.source_id}_${Date.now()}`,
          property_id: raw.source_id,
          price: raw.price,
          price_m2: priceM2,
          recorded_at: timestamp,
        },
      ],
    };

    normalizedProperties.push(prop);
  }

  console.log(
    `[MultiPortal Scraper] Ronda concluída: ${normalizedProperties.length} imóveis únicos processados (Imovirtual: ${imovirtualCount}, CasaSAPO: ${casasapoCount}, Idealista: ${idealistaCount}).`
  );

  return {
    timestamp,
    concelhos_scanned: concelhos,
    total_raw_found: rawList.length,
    imovirtual_count: imovirtualCount,
    casasapo_count: casasapoCount,
    idealista_count: idealistaCount,
    normalized_properties: normalizedProperties,
    errors,
  };
}
