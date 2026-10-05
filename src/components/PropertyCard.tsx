'use client';

import React from 'react';
import Image from 'next/image';
import { ExternalLink, TrendingDown, TrendingUp, History, MapPin, Maximize2 } from 'lucide-react';
import { Property } from '@/types/property';
import { formatCurrency } from '@/lib/market-analysis';

interface PropertyCardProps {
  property: Property;
  onOpenHistory: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onOpenHistory,
}) => {
  const isGoodDeal = property.opportunity_rating === 'good';
  const isBadDeal = property.opportunity_rating === 'bad';
  const hasPriceDrop = property.price_change_type === 'drop';
  const hasPriceRise = property.price_change_type === 'rise';

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all hover:border-slate-300 hover:shadow-md dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700">
      <div>
        <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <Image
            src={property.cover_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-103"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          <div className="absolute top-3 left-3 rounded-md bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-white tracking-wide">
            {property.source_portal}
          </div>

          <div className="absolute top-3 right-3">
            {isGoodDeal && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                <span>🟢 Bom Preço</span>
                <span className="text-[11px] font-medium opacity-90">({property.price_deviation_pct}%)</span>
              </span>
            )}
            {property.opportunity_rating === 'fair' && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/90 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold text-white shadow-xs">
                <span>🟡 Dentro do Preço</span>
              </span>
            )}
            {isBadDeal && (
              <span className="inline-flex items-center gap-1 rounded-md bg-rose-600/90 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold text-white shadow-xs">
                <span>🔴 Acima da Média</span>
                <span className="text-[11px] font-medium opacity-90">(+{property.price_deviation_pct}%)</span>
              </span>
            )}
          </div>

          {hasPriceDrop && (
            <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-md bg-emerald-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
              <TrendingDown className="h-3.5 w-3.5" />
              <span>Baixou {formatCurrency(property.price_change_amount || 0)} (-{property.price_change_pct}%)</span>
            </div>
          )}

          {hasPriceRise && (
            <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-md bg-rose-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Subiu {formatCurrency(property.price_change_amount || 0)} (+{property.price_change_pct}%)</span>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 gap-2">
            <div className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300 min-w-0">
              <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="truncate">{property.freguesia}, {property.concelho}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {typeof property.distance_km === 'number' && (
                <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800/80" title="Distância estimada em linha reta a partir do teu local">
                  a {property.distance_km} km
                </span>
              )}
              <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                {property.typology}
              </span>
            </div>
          </div>

          <h3 className="line-clamp-2 text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
            {property.title}
          </h3>

          <div className="mt-4 flex items-baseline justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {formatCurrency(property.price)}
                </span>
                {property.previous_price && property.previous_price !== property.price && (
                  <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                    {formatCurrency(property.previous_price)}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {property.price_m2.toLocaleString('pt-PT')} €/m²
                <span className="text-slate-400 dark:text-slate-600 mx-1">·</span>
                <span className="text-slate-400 dark:text-slate-500">Média zona: {property.zone_avg_price_m2.toLocaleString('pt-PT')}€</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
              <Maximize2 className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              <span>{property.area_m2} m²</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-3 sm:px-5">
        <button
          onClick={() => onOpenHistory(property)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          title="Ver histórico de alterações de preço"
        >
          <History className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          <span className="hidden sm:inline">Histórico</span>
        </button>

        <a
          href={property.original_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
        >
          <span>Ver no {property.source_portal}</span>
          <ExternalLink className="h-3.5 w-3.5 text-emerald-400 dark:text-emerald-200" />
        </a>
      </div>
    </div>
  );
};
