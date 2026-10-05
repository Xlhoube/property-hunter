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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 my-6">
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Monitorizados</span>
          <Building2 className="h-4 w-4 text-slate-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">{total}</span>
          <span className="text-xs text-slate-500">imóveis ativos</span>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-800">Bom Preço (€/m²)</span>
          <Flame className="h-4 w-4 text-emerald-600" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-emerald-900">{goodDeals}</span>
          <span className="text-xs font-medium text-emerald-700">&gt;10% abaixo da zona</span>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">Baixas de Preço</span>
          <TrendingDown className="h-4 w-4 text-emerald-600" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">{priceDrops}</span>
          <span className="text-xs font-medium text-emerald-600">com desconto ativo</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Média Amostra</span>
          <CheckCircle2 className="h-4 w-4 text-slate-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">{avgM2.toLocaleString('pt-PT')}€</span>
          <span className="text-xs text-slate-500">por m²</span>
        </div>
      </div>
    </div>
  );
};
