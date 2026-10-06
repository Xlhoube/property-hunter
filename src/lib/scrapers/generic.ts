import { ScrapedRawProperty, getRandomUserAgent } from './types';
import { PropertySource } from '@/types/source';

export async function scrapeGenericSource(
  source: PropertySource,
  concelho: string,
  maxItems = 10
): Promise<ScrapedRawProperty[]> {
  const url = source.searchUrlPattern.replace('{concelho}', concelho.toLowerCase().replace(/\s+/g, '-'));
  console.log(`[Scraper Genérico] A iniciar recolha simulada para ${source.name} em ${concelho}...`);

  try {
    // Tenta pelo menos fazer fetch para simular o tráfego real
    await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
      },
      next: { revalidate: 0 },
    });
  } catch (err) {
    console.warn(`[Scraper Genérico] Erro ao consultar ${source.name}:`, err);
  }

  // Gera dados realistas simulados para fontes sem parser específico no protótipo
  return [
    {
      source_portal: source.name,
      source_id: `gen_${source.slug}_${concelho}_1`,
      title: `Apartamento Fantástico em ${concelho} (${source.name})`,
      price: 250000 + Math.floor(Math.random() * 150000),
      area_m2: 85 + Math.floor(Math.random() * 40),
      typology: 'T2',
      condition: 'Usado',
      freguesia: concelho,
      concelho: concelho,
      district: concelho,
      cover_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      gallery: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
      original_url: url,
    }
  ];
}
