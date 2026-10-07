import * as cheerio from 'cheerio';
import { ScrapedRawProperty, extractTypology, getRandomUserAgent } from './types';
import { PropertyCondition } from '@/types/property';

export async function scrapeCustoJusto(concelho = 'lisboa', maxItems = 25): Promise<ScrapedRawProperty[]> {
  const concelhoNormalized = concelho.toLowerCase().trim().replace(/\s+/g, '-');
  
  // Scrape both apartments and villas/houses to ensure full typology diversity
  const urls = [
    `https://www.custojusto.pt/${concelhoNormalized}/imobiliario/apartamentos-venda`,
    `https://www.custojusto.pt/${concelhoNormalized}/imobiliario/moradias-venda`,
  ];

  console.log(`[Scraper CustoJusto] A recolher imóveis para "${concelho}"...`);
  const results: ScrapedRawProperty[] = [];

  for (const url of urls) {
    if (results.length >= maxItems) break;

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
        console.warn(`[Scraper CustoJusto] HTTP ${res.status} em ${url}`);
        continue;
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      $('a[href*="/imobiliario/"]').each((i, el) => {
        if (results.length >= maxItems) return;
        const $a = $(el);
        const href = $a.attr('href') || '';
        if (!href.match(/-\d+($|\?)/)) return;

        // Container envolvente com dados de preço e características
        let container = $a.closest('div.tw-flex.tw-min-w-0').parent();
        if (!container.length || !container.text().includes('€')) {
          container = $a.parents().filter((_, p) => $(p).text().includes('€') && $(p).text().length < 600).first();
        }
        if (!container.length) return;

        const fullText = container.text().replace(/\s+/g, ' ').trim();
        const title = $a.find('h2, h3').text().trim() || $a.text().trim();
        if (!title || title.length < 5) return;

        // Filtrar publicidade, empréstimos e anúncios não residenciais
        const lowerTitle = title.toLowerCase();
        if (
          lowerTitle.includes('crédito') ||
          lowerTitle.includes('credito') ||
          lowerTitle.includes('empréstimo') ||
          lowerTitle.includes('trespasse') ||
          lowerTitle.includes('seguro')
        ) {
          return;
        }

        // Extracção do preço
        const priceMatch = fullText.match(/([\d\s.]+)\s*€/);
        if (!priceMatch) return;
        const priceRaw = priceMatch[1].replace(/\s/g, '').replace(/\./g, '');
        const price = parseInt(priceRaw, 10);
        if (!price || price < 10000) return;

        // Área
        const areaMatch = fullText.match(/(\d+)\s*m²/);
        const area = areaMatch ? parseInt(areaMatch[1], 10) : 85;

        // Tipologia
        const typology = extractTypology(title + ' ' + fullText);


        // Estado do imóvel
        let condition: PropertyCondition = 'Usado';
        if (fullText.toLowerCase().includes('novo')) condition = 'Novo';
        else if (fullText.toLowerCase().includes('recuperar') || fullText.toLowerCase().includes('ruína')) condition = 'Para Recuperar';
        else if (fullText.toLowerCase().includes('construção')) condition = 'Em Construção';

        // Imagem
        let img = container.find('img').attr('src') || container.find('img').attr('data-src') || '';
        if (img.startsWith('data:image')) {
          const otherSrc = container.find('img').attr('srcset');
          if (otherSrc) {
            const parts = otherSrc.split(',');
            img = parts[parts.length - 1].trim().split(' ')[0];
          }
        }
        if (!img || img.startsWith('data:') || img.includes('no-image')) {
          img = url.includes('moradia')
            ? 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800'
            : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800';
        }

        const idMatch = href.match(/-(\d+)($|\?)/);
        const source_id = idMatch ? `cj_${idMatch[1]}` : `cj_${i}_${Date.now()}`;
        const original_url = href.startsWith('http') ? href : `https://www.custojusto.pt${href}`;

        // Deduplicação na ronda
        if (!results.some((r) => r.original_url === original_url)) {
          results.push({
            source_portal: 'CustoJusto',
            source_id,
            title,
            price,
            area_m2: area,
            typology,
            condition,
            freguesia: concelho,
            concelho,
            district: concelho,
            cover_image: img,
            gallery: [img],
            original_url,
          });
        }
      });
    } catch (err: any) {
      console.warn(`[Scraper CustoJusto] Erro na ronda (${url}):`, err.message);
    }
  }

  console.log(`[Scraper CustoJusto] Concluído para ${concelho}: ${results.length} imóveis extraídos.`);
  return results;
}
