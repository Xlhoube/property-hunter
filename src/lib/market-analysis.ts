import { OpportunityRating, PriceChangeType } from '@/types/property';

export function calculatePriceM2(price: number, areaM2: number): number {
  if (!areaM2 || areaM2 <= 0) return 0;
  return Math.round(price / areaM2);
}

export function calculatePriceDeviation(priceM2: number, zoneAvgPriceM2: number): number {
  if (!zoneAvgPriceM2 || zoneAvgPriceM2 <= 0 || !priceM2) return 0;
  const deviation = ((priceM2 - zoneAvgPriceM2) / zoneAvgPriceM2) * 100;
  return Math.round(deviation * 10) / 10;
}

export function determineOpportunityRating(deviationPct: number): OpportunityRating {
  if (deviationPct <= -10) {
    return 'good'; // >10% abaixo da média de mercado
  }
  if (deviationPct >= 10) {
    return 'bad'; // >10% acima da média de mercado
  }
  return 'fair'; // Alinhado com a média local (-10% a +10%)
}

export function determinePriceChange(currentPrice: number, previousPrice?: number): {
  type: PriceChangeType;
  amount: number;
  pct: number;
} {
  if (!previousPrice || previousPrice === currentPrice) {
    return { type: 'none', amount: 0, pct: 0 };
  }

  const amount = Math.abs(currentPrice - previousPrice);
  const pct = Math.round((amount / previousPrice) * 1000) / 10;

  if (currentPrice < previousPrice) {
    return {
      type: 'drop',
      amount,
      pct,
    };
  } else {
    return {
      type: 'rise',
      amount,
      pct,
    };
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function findZoneAveragePriceM2(
  concelho: string,
  freguesia: string,
  zones: Array<{ concelho: string; freguesia: string; avg_price_m2: number }>
): number {
  const normConcelho = concelho.toLowerCase().trim();
  const normFreguesia = freguesia.toLowerCase().trim();

  // 1º Tentar correspondência exacta de freguesia e concelho
  const exact = zones.find(
    (z) => z.concelho.toLowerCase() === normConcelho && z.freguesia.toLowerCase() === normFreguesia
  );
  if (exact) return exact.avg_price_m2;

  // 2º Tentar média pelo concelho
  const byConcelho = zones.filter((z) => z.concelho.toLowerCase() === normConcelho);
  if (byConcelho.length > 0) {
    const sum = byConcelho.reduce((acc, curr) => acc + curr.avg_price_m2, 0);
    return Math.round(sum / byConcelho.length);
  }

  // Fallbacks por concelho conhecido
  if (normConcelho.includes('lisboa')) return 4400;
  if (normConcelho.includes('cascais')) return 4900;
  if (normConcelho.includes('porto')) return 3200;
  if (normConcelho.includes('braga')) return 1950;
  if (normConcelho.includes('coimbra')) return 2100;
  if (normConcelho.includes('faro')) return 3100;

  return 2500;
}
