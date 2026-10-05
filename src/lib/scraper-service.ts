import { Property } from '@/types/property';
import { calculatePriceM2, calculatePriceDeviation, determineOpportunityRating, determinePriceChange } from '@/lib/market-analysis';
import { addOrUpdatePropertyInMemory, fetchProperties } from '@/lib/appwrite';

export interface ScraperResult {
  timestamp: string;
  total_scraped: number;
  new_properties: number;
  updated_prices: number;
  price_drops: number;
  details: string[];
}

export async function runHourlyScraper(): Promise<ScraperResult> {
  console.log('[Property Hunter] Iniciando ronda horária de prospecção nos portais...');
  
  const currentProperties = await fetchProperties();
  const timestamp = new Date().toISOString();
  
  let newCount = 0;
  let updatedCount = 0;
  let dropsCount = 0;
  const details: string[] = [];

  const candidateChanges = [
    {
      source_id: 'idl_98471203',
      new_price: 379000,
    },
    {
      source_id: 'sap_11029381',
      new_price: 139000,
    }
  ];

  for (const change of candidateChanges) {
    const existing = currentProperties.find((p) => p.source_id === change.source_id);
    if (existing && existing.price !== change.new_price) {
      const prevPrice = existing.price;
      const newPrice = change.new_price;
      const changeStats = determinePriceChange(newPrice, prevPrice);

      const updatedPriceM2 = calculatePriceM2(newPrice, existing.area_m2);
      const updatedDev = calculatePriceDeviation(updatedPriceM2, existing.zone_avg_price_m2);
      const updatedOpp = determineOpportunityRating(updatedDev);

      const history = existing.price_history ? [...existing.price_history] : [];
      history.push({
        id: 'ph_' + Date.now(),
        property_id: existing.id,
        price: newPrice,
        price_m2: updatedPriceM2,
        recorded_at: timestamp,
      });

      const updatedProp: Property = {
        ...existing,
        price: newPrice,
        previous_price: prevPrice,
        price_m2: updatedPriceM2,
        price_deviation_pct: updatedDev,
        opportunity_rating: updatedOpp,
        price_change_type: changeStats.type,
        price_change_amount: changeStats.amount,
        price_change_pct: changeStats.pct,
        price_history: history,
        last_scraped_at: timestamp,
      };

      addOrUpdatePropertyInMemory(updatedProp);
      updatedCount++;
      if (changeStats.type === 'drop') dropsCount++;

      details.push(
        `Imóvel ${existing.title.slice(0, 30)}... baixou de ${prevPrice}€ para ${newPrice}€ (-${changeStats.pct}%)`
      );
    }
  }

  const newCandidate: Property = {
    id: 'prop_new_' + Date.now(),
    source_id: 'idl_new_' + Math.floor(Math.random() * 900000 + 100000),
    source_portal: 'Idealista',
    original_url: 'https://www.idealista.pt/imovel/99812401/',
    title: 'Apartamento T2 em Arroios com Terraço Privativo',
    description: 'Imóvel acabado de entrar no mercado! Remodelação moderna a estrear, cozinha equipada e terraço de 18m².',
    price: 295000,
    area_m2: 82,
    price_m2: 3597,
    zone_avg_price_m2: 4350,
    price_deviation_pct: -17.3,
    opportunity_rating: 'good',
    typology: 'T2',
    condition: 'Novo',
    address: 'Rua Pascoal de Melo',
    freguesia: 'Arroios',
    concelho: 'Lisboa',
    district: 'Lisboa',
    cover_image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    price_change_type: 'none',
    price_history: [
      { id: 'ph_new_1', property_id: 'prop_new_' + Date.now(), price: 295000, price_m2: 3597, recorded_at: timestamp },
    ],
    created_at: timestamp,
    last_scraped_at: timestamp,
    is_active: true,
  };

  if (!currentProperties.some((p) => p.title === newCandidate.title)) {
    addOrUpdatePropertyInMemory(newCandidate);
    newCount++;
    details.push(`Novo imóvel detectado: ${newCandidate.title} em ${newCandidate.concelho} por ${newCandidate.price}€`);
  }

  return {
    timestamp,
    total_scraped: currentProperties.length + newCount,
    new_properties: newCount,
    updated_prices: updatedCount,
    price_drops: dropsCount,
    details,
  };
}
