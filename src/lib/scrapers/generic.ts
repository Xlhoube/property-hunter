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

  // O scraper genérico de momento não produz dados falsos para evitar confusões na UI com imagens genéricas e localizações erradas.
  console.log(`[Scraper Genérico] Fonte ${source.name} não tem scraper implementado. A ignorar.`);
  return [];
}
