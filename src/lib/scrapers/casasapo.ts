import * as cheerio from 'cheerio';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { ScrapedRawProperty, extractTypology, parsePrice, parseArea, getRandomUserAgent } from './types';
import { PropertyCondition } from '@/types/property';

const execFileAsync = promisify(execFile);

export async function scrapeCasaSapo(concelho = 'lisboa', maxItems = 20): Promise<ScrapedRawProperty[]> {
  const concelhoNormalized = concelho.toLowerCase().trim().replace(/\s+/g, '-');
  const url = `https://casa.sapo.pt/comprar-apartamentos/${concelhoNormalized}/`;

  console.log(`[Scraper CasaSAPO] A iniciar recolha para concelho "${concelho}" em ${url}`);

  let html = '';

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      next: { revalidate: 0 },
    });

    if (res.ok) {
      html = await res.text();
    }
  } catch (err) {
    console.warn('[Scraper CasaSAPO] Erro no fetch directo:', err);
  }

  // Fallback local com curl caso necessário
  if (!html || html.includes('Site Offline') || html.includes('tráfego fora do normal')) {
    try {
      if (typeof window === 'undefined') {
        const { stdout } = await execFileAsync('curl.exe', [
          '-s', '-L',
          '-A', getRandomUserAgent(),
          '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          '-H', 'Accept-Language: pt-PT,pt;q=0.9',
          '--compressed',
          url,
        ], { maxBuffer: 10 * 1024 * 1024 });

        if (stdout && stdout.length > 5000) {
          html = stdout;
        }
      }
    } catch {
      // Ignora erro se curl não existir no runtime
    }
  }

  if (!html || html.length < 1000) {
    console.warn('[Scraper CasaSAPO] Não foi possível obter o HTML da listagem.');
    return [];
  }

  const $ = cheerio.load(html);
  const results: ScrapedRawProperty[] = [];

  $('.property').each((i, el) => {
    if (results.length >= maxItems) return;
    const $el = $(el);

    const title = $el.find('[data-title]').first().attr('data-title') ||
                  $el.find('.property-info-title, h2, h3').first().text().trim() ||
                  `Apartamento em ${concelho}`;

    const priceRaw = $el.find('.property-price, .price, [class*="price"]').first().text().trim();
    const price = parsePrice(priceRaw);
    if (!price || price <= 1000) return;

    const relativeLink = $el.find('a[href*="/imovel/"], a.property-link, a').first().attr('href') || '';
    const original_url = relativeLink.startsWith('http')
      ? relativeLink
      : `https://casa.sapo.pt${relativeLink}`;

    const img = $el.find('img').first().attr('data-src') || $el.find('img').first().attr('src') || '';
    const features = $el.find('.property-features, .property-info-details, .property-features-item').text().replace(/\s+/g, ' ').trim();

    const area = parseArea(features);
    const typology = extractTypology(title + ' ' + features);

    let condition: PropertyCondition = 'Usado';
    if (features.toLowerCase().includes('novo')) condition = 'Novo';
    else if (features.toLowerCase().includes('recuperar') || features.toLowerCase().includes('ruína')) condition = 'Para Recuperar';
    else if (features.toLowerCase().includes('construção')) condition = 'Em Construção';

    const uid = $el.attr('id')?.replace('property_', '') || `sap_${i}_${Date.now()}`;
    const cover_image = img || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800';

    results.push({
      source_portal: 'CasaSAPO',
      source_id: `sap_${uid}`,
      title,
      price,
      area_m2: area || 75,
      typology,
      condition,
      freguesia: concelho,
      concelho,
      district: concelho,
      cover_image,
      gallery: [cover_image],
      original_url,
    });
  });

  console.log(`[Scraper CasaSAPO] Concluído com sucesso: ${results.length} imóveis extraídos.`);
  return results;
}
