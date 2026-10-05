import * as cheerio from 'cheerio';
import { ScrapedRawProperty, extractTypology, getRandomUserAgent } from './types';

interface ImovirtualItem {
  id: number | string;
  title: string;
  totalPrice?: {
    value: number;
    currency: string;
  };
  areaInSquareMeters?: number;
  slug?: string;
  location?: {
    reverseGeocoding?: {
      locations?: Array<{
        locationLevel: string;
        name: string;
        fullName: string;
      }>;
    };
  };
  images?: {
    large?: string;
    medium?: string;
    small?: string;
  };
}

export async function scrapeImovirtual(concelho = 'lisboa', maxItems = 20): Promise<ScrapedRawProperty[]> {
  const concelhoNormalized = concelho.toLowerCase().trim().replace(/\s+/g, '-');
  const url = `https://www.imovirtual.com/pt/resultados/comprar/apartamento/${concelhoNormalized}`;
  
  console.log(`[Scraper Imovirtual] A iniciar recolha para concelho "${concelho}" em ${url}`);

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8',
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.warn(`[Scraper Imovirtual] Resposta com código ${res.status}`);
      return [];
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const scriptContent = $('#__NEXT_DATA__').html();

    if (!scriptContent) {
      console.warn('[Scraper Imovirtual] Tag #__NEXT_DATA__ não encontrada.');
      return [];
    }

    const nextData = JSON.parse(scriptContent);
    const items: ImovirtualItem[] = nextData?.props?.pageProps?.data?.searchAds?.items || [];

    const results: ScrapedRawProperty[] = [];

    for (const item of items) {
      if (results.length >= maxItems) break;

      const price = item.totalPrice?.value || 0;
      const area = item.areaInSquareMeters || 70;
      if (!price || price <= 1000) continue;

      const title = item.title || 'Apartamento para Venda';
      const typology = extractTypology(title);

      const locs = item.location?.reverseGeocoding?.locations || [];
      const parishObj = locs.find((l) => l.locationLevel === 'parish');
      const councilObj = locs.find((l) => l.locationLevel === 'council');
      const districtObj = locs.find((l) => l.locationLevel === 'district');

      const freguesia = parishObj?.name || concelho;
      const concelhoFinal = councilObj?.name || concelho;
      const district = districtObj?.name || 'Portugal';

      const slug = item.slug || '';
      const original_url = slug.startsWith('http')
        ? slug
        : `https://www.imovirtual.com/pt/anuncio/${slug}`;

      const cover_image = item.images?.large || item.images?.medium || item.images?.small || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800';

      results.push({
        source_portal: 'Imovirtual',
        source_id: `imo_${item.id}`,
        title,
        price,
        area_m2: Math.round(area),
        typology,
        condition: 'Usado',
        freguesia,
        concelho: concelhoFinal,
        district,
        cover_image,
        gallery: [cover_image],
        original_url,
      });
    }

    console.log(`[Scraper Imovirtual] Concluído com sucesso: ${results.length} imóveis extraídos.`);
    return results;
  } catch (err) {
    console.error('[Scraper Imovirtual] Falha na execução:', err);
    return [];
  }
}
