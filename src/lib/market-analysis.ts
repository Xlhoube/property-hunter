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
