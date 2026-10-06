import * as cheerio from 'cheerio';
import { ScrapedRawProperty, extractTypology, parsePrice, parseArea, getRandomUserAgent } from './types';

export async function scrapeIdealista(concelho = 'lisboa', maxItems = 20): Promise<ScrapedRawProperty[]> {
  const concelhoNormalized = concelho.toLowerCase().trim().replace(/\s+/g, '-');
  const targetUrl = `https://www.idealista.pt/comprar-casas/${concelhoNormalized}/`;

  console.log(`[Scraper Idealista] A iniciar tentativa para concelho "${concelho}"`);

  const proxyKey = process.env.SCRAPER_API_KEY;
  const proxyUrl = process.env.SCRAPER_PROXY_URL;

  let requestUrl = targetUrl;
  const headers: Record<string, string> = {
    'User-Agent': getRandomUserAgent(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'pt-PT,pt;q=0.9,en-US;q=0.8',
  };

  if (proxyKey) {
    requestUrl = `http://api.scraperapi.com?api_key=${proxyKey}&url=${encodeURIComponent(targetUrl)}&country_code=pt`;
  } else if (proxyUrl) {
    requestUrl = `${proxyUrl}?url=${encodeURIComponent(targetUrl)}`;
  }

  try {
    const res = await fetch(requestUrl, {
      headers,
      next: { revalidate: 0 },
    });

    if (res.status === 403) {
      console.warn(
        '[Scraper Idealista] Protecção Cloudflare do Idealista activa (403). Para activar extracção do Idealista sem bloqueios, podes configurar SCRAPER_API_KEY no .env.local. A continuar com os restantes portais...'
      );
      return [];
    }

    if (!res.ok) {
      console.warn(`[Scraper Idealista] Resposta inesperada com código ${res.status}`);
      return [];
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const results: ScrapedRawProperty[] = [];

    $('article.item, .item-multimedia-container').each((i, el) => {
      if (results.length >= maxItems) return;
      const $el = $(el);

      const title = $el.find('a.item-link').text().trim() ||
                    $el.find('.item-description, h2, h3').text().trim() ||
                    `Imóvel em ${concelho}`;

      const priceRaw = $el.find('.item-price, .price-row').first().text().trim();
      const price = parsePrice(priceRaw);
      if (!price || price <= 1000) return;

      const link = $el.find('a.item-link').attr('href') || '';
      const safeConcelhoSlug = concelho.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
      const original_url = link.startsWith('http')
        ? link
        : (link ? `https://www.idealista.pt${link}` : `https://www.idealista.pt/comprar-casas/${safeConcelhoSlug}/`);

      const img = $el.find('img').first().attr('data-ondemand-img') ||
                  $el.find('img').first().attr('src') || '';

      const detailsText = $el.find('.item-detail-char, .item-details').text().replace(/\s+/g, ' ').trim();
      const area = parseArea(detailsText);
      const typology = extractTypology(title + ' ' + detailsText);

      const id = $el.attr('data-adid') || `idl_${i}_${Date.now()}`;
      const cover_image = img || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';

      results.push({
        source_portal: 'Idealista',
        source_id: `idl_${id}`,
        title,
        price,
        area_m2: area || 80,
        typology,
        condition: 'Usado',
        freguesia: concelho,
        concelho,
        district: concelho,
        cover_image,
        gallery: [cover_image],
        original_url,
      });
    });

    console.log(`[Scraper Idealista] Concluído: ${results.length} imóveis extraídos.`);
    return results;
  } catch (err) {
    console.warn('[Scraper Idealista] Erro na tentativa de prospecção:', err);
    return [];
  }
}
