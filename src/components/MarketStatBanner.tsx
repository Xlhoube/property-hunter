'use client';

import React from 'react';
import { TrendingDown, Flame, Building2, CheckCircle2 } from 'lucide-react';
import { Property } from '@/types/property';

interface MarketStatBannerProps {
  properties: Property[];
}

export const MarketStatBanner: React.FC<MarketStatBannerProps> = ({ properties }) => {
  const total = properties.length;
  const goodDeals = properties.filter((p) => p.opportunity_rating === 'good').length;
  const priceDrops = properties.filter((p) => p.price_change_type === 'drop').length;

  const validM2 = properties.filter((p) => p.price_m2 > 0);
  const avgM2 = validM2.length > 0 ? Math.round(validM2.reduce((acc, p) => acc + p.price_m2, 0) / validM2.length) : 0;

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-4 my-4 sm:my-6">
      <div className="rounded-xl border border-slate-200/80 bg-white p-3 sm:p-4 shadow-xs dark:bg-slate-900 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">Monitorizados</span>
          <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 dark:text-slate-500" />
        </div>
        <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{total}</span>
          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">imóveis ativos</span>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-3 sm:p-4 shadow-xs dark:bg-emerald-950/30 dark:border-emerald-800/60 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-emerald-800 dark:text-emerald-300">Bom Preço (€/m²)</span>
          <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100">{goodDeals}</span>
          <span className="text-[10px] sm:text-xs font-medium text-emerald-700 dark:text-emerald-300">&gt;10% abaixo</span>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-200/80 bg-white p-3 sm:p-4 shadow-xs dark:bg-slate-900 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-400">Baixas de Preço</span>
          <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{priceDrops}</span>
          <span className="text-[10px] sm:text-xs font-medium text-emerald-600 dark:text-emerald-400">com desconto</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white p-3 sm:p-4 shadow-xs dark:bg-slate-900 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">Média Amostra</span>
          <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 dark:text-slate-500" />
        </div>
        <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{avgM2.toLocaleString('pt-PT')}€</span>
          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">por m²</span>
        </div>
      </div>
    </div>
  );
};
