import * as cheerio from 'cheerio';
import { ScrapedRawProperty, getRandomUserAgent, parsePrice, parseArea, extractTypology } from './types';
import { PropertySource } from '@/types/source';

export async function scrapeGenericSource(
  source: PropertySource,
  concelho: string,
  maxItems = 10
): Promise<ScrapedRawProperty[]> {
  const url = source.searchUrlPattern.replace('{concelho}', concelho.toLowerCase().replace(/\s+/g, '-'));
  console.log(`[Scraper Genérico] A iniciar tentativa real para ${source.name} em ${url}`);

  let res;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    res = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      signal: controller.signal,
      next: { revalidate: 0 },
    });
    clearTimeout(timeout);
  } catch (err: any) {
    console.error(`[Scraper Genérico] Falha de ligação a ${source.name}:`, err.message);
    throw new Error(`Falha de ligação: ${err.message}`);
  }

  if (!res.ok) {
    console.warn(`[Scraper Genérico] ${source.name} rejeitou o pedido com HTTP ${res.status}`);
    throw new Error(`Acesso bloqueado ou página não encontrada (HTTP ${res.status})`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  const results: ScrapedRawProperty[] = [];

  // Heurística: procurar elementos que parecem cartões de anúncio (têm links e preços)
  // Tags prováveis: article, .card, .property, div[class*="item"], div[class*="ad"]
  const cardSelectors = ['article', '.card', '.property', '[class*="item"]', '[class*="listing"]', '[class*="ad"]', 'a[href*="/imovel/"]', 'a[href*="/anuncio/"]'];
  
  let cards = $(cardSelectors.join(', '));
  
  // Limpar os elementos redundantes (ex: artigos dentro de listagens)
  if (cards.length > 50) cards = cards.slice(0, 50);

  cards.each((i, el) => {
    if (results.length >= maxItems) return;
    const $el = $(el);

    const text = $el.text().replace(/\s+/g, ' ').trim();
    if (!text.includes('€')) return; // Se não tem símbolo de euro, não é um cartão de imóvel

    const priceRaw = $el.find('[class*="price"], [class*="valor"], b, strong').text().trim() || text;
    const price = parsePrice(priceRaw);
    if (!price || price < 5000) return; // Ignorar rendas ou valores muito baixos

    const title = $el.find('h1, h2, h3, h4, [class*="title"]').first().text().trim() || `Imóvel em ${concelho}`;
    const typology = extractTypology(title + ' ' + text);
    const area = parseArea(text);

    let original_url = $el.find('a').first().attr('href') || $el.attr('href') || url;
    if (!original_url.startsWith('http')) {
      if (original_url.startsWith('/')) {
        original_url = new URL(original_url, source.baseUrl).href;
      } else {
        original_url = source.baseUrl; // Fallback
      }
    }

    const img = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src') || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800';

    results.push({
      source_portal: source.name,
      source_id: `gen_${source.slug}_${i}_${Date.now()}`,
      title,
      price,
      area_m2: area || 75,
      typology,
      condition: text.toLowerCase().includes('novo') ? 'Novo' : 'Usado',
      freguesia: concelho,
      concelho,
      district: concelho,
      cover_image: img,
      gallery: [img],
      original_url,
    });
  });

  if (results.length === 0) {
    console.warn(`[Scraper Genérico] Não foi possível decifrar o layout HTML de ${source.name}.`);
    throw new Error('Layout HTML desconhecido. O scraper genérico não conseguiu encontrar preços/anúncios na página.');
  }

  console.log(`[Scraper Genérico] Sucesso em ${source.name}! Extraídos ${results.length} imóveis heurísticos.`);
  return results;
}
