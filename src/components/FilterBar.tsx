import React, { useState } from 'react';
import { Search, ArrowUpDown, TrendingDown, Download, LocateFixed, MapPin, X } from 'lucide-react';
import { PropertyFilterParams, PropertyTypology } from '@/types/property';

interface FilterBarProps {
  filters: PropertyFilterParams;
  onChange: (newFilters: PropertyFilterParams) => void;
  availableConcelhos: string[];
  onExportCSV?: () => void;
  totalCount?: number;
}

const TYPOLOGIES: PropertyTypology[] = ['T0', 'T1', 'T2', 'T3', 'T4+', 'Moradia'];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  availableConcelhos,
  onExportCSV,
  totalCount,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleTypologyToggle = (typ: PropertyTypology) => {
    const current = filters.typologies || [];
    const next = current.includes(typ)
      ? current.filter((t) => t !== typ)
      : [...current, typ];
    onChange({ ...filters, typologies: next });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('O teu navegador não suporta geolocalização.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
          const data = await res.json();

          if (res.ok && data.success && data.concelho) {
            const detected = data.concelho;
            setDetectedLocation(detected);

            // Procurar correspondência com a lista de concelhos disponíveis
            const matched = availableConcelhos.find(
              (c) => c.toLowerCase() === detected.toLowerCase() ||
                     detected.toLowerCase().includes(c.toLowerCase()) ||
                     c.toLowerCase().includes(detected.toLowerCase())
            );

            if (matched) {
              onChange({ ...filters, concelho: matched, searchQuery: '' });
            } else {
              // Se não estiver na lista de concelhos directos, preenche a pesquisa por texto
              onChange({ ...filters, concelho: 'Todos', searchQuery: detected });
            }
          } else {
            setLocationError('Não foi possível identificar o concelho para estas coordenadas.');
          }
        } catch (err: any) {
          setLocationError('Erro ao comunicar com o serviço de localização.');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Permissão de localização recusada no navegador.');
        } else if (error.code === error.TIMEOUT) {
          setLocationError('Tempo limite excedido ao obter a localização.');
        } else {
          setLocationError('Não foi possível determinar a localização atual.');
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleClearDetectedLocation = () => {
    setDetectedLocation(null);
    setLocationError(null);
    onChange({ ...filters, concelho: 'Todos', searchQuery: '' });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs mb-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:gap-4">
        <div className="relative md:col-span-6">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por freguesia, concelho ou palavra-chave..."
            value={filters.searchQuery || ''}
            onChange={(e) => {
              if (detectedLocation) setDetectedLocation(null);
              onChange({ ...filters, searchQuery: e.target.value });
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-36 sm:pr-40 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-100 transition-all"
          />

          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isLocating}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer disabled:opacity-60"
            title="Detetar a minha localização e filtrar imóveis mais próximos"
          >
            <LocateFixed className={`h-3.5 w-3.5 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isLocating ? 'A localizar...' : 'A minha localização'}
            </span>
            <span className="sm:hidden">
              {isLocating ? '...' : 'Perto'}
            </span>
          </button>
        </div>

        <div className="md:col-span-3">
          <select
            value={filters.concelho || 'Todos'}
            onChange={(e) => {
              if (detectedLocation) setDetectedLocation(null);
              onChange({ ...filters, concelho: e.target.value });
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-700 focus:border-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-100 cursor-pointer"
          >
            <option value="Todos">Todos os Concelhos</option>
            {availableConcelhos.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <div className="relative">
            <select
              value={filters.sortBy || 'newest'}
              onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-3 pr-8 text-sm text-slate-700 focus:border-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-100 cursor-pointer"
            >
              <option value="newest">Mais Recentes</option>
              <option value="opportunity_best">Maior Desconto (€/m²)</option>
              <option value="price_asc">Menor Preço (€)</option>
              <option value="price_desc">Maior Preço (€)</option>
              <option value="price_m2_asc">Menor Preço por m²</option>
            </select>
            <ArrowUpDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      {(detectedLocation || locationError) && (
        <div className="mt-3 flex items-center justify-between text-xs">
          {detectedLocation ? (
            <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 w-full px-3 py-2 rounded-xl shadow-2xs">
              <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>
                A filtrar imóveis na tua zona: <strong>{detectedLocation}</strong>
              </span>
              <button
                type="button"
                onClick={handleClearDetectedLocation}
                className="ml-auto inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
              >
                <X className="h-3 w-3" />
                <span>Limpar</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-800 bg-amber-50/90 border border-amber-200/80 w-full px-3 py-2 rounded-xl">
              <span>{locationError}</span>
              <button
                type="button"
                onClick={() => setLocationError(null)}
                className="ml-auto text-amber-700 hover:text-amber-900 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Tipologia:
          </span>
          {TYPOLOGIES.map((typ) => {
            const isSelected = filters.typologies?.includes(typ);
            return (
              <button
                key={typ}
                onClick={() => handleTypologyToggle(typ)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {typ}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onChange({ ...filters, priceChangeOnly: !filters.priceChangeOnly })}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
              filters.priceChangeOnly
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <TrendingDown className="h-3.5 w-3.5" />
            <span>Baixa de Preço</span>
          </button>

          <select
            value={filters.opportunity || 'Todas'}
            onChange={(e) => onChange({ ...filters, opportunity: e.target.value as any })}
            className="rounded-lg border border-slate-200 bg-white py-1 px-2.5 text-xs font-medium text-slate-700 cursor-pointer"
          >
            <option value="Todas">Todas as Avaliações</option>
            <option value="good">🟢 Apenas Bom Preço (&gt;10% abaixo)</option>
            <option value="fair">🟡 Dentro do Preço (±10%)</option>
            <option value="bad">🔴 Acima do Mercado</option>
          </select>

          {onExportCSV && (
            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white py-1 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer ml-auto sm:ml-0"
              title="Descarregar dossiê em formato CSV para Excel com todas as métricas"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" />
              <span>Exportar Dossiê {totalCount ? `(${totalCount})` : ''}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
