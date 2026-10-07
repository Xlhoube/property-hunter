import React, { useState } from 'react';
import { Search, ArrowUpDown, TrendingDown, Download, LocateFixed, MapPin, X, SlidersHorizontal, ChevronDown, RefreshCw } from 'lucide-react';
import { PropertyFilterParams, PropertyTypology } from '@/types/property';

interface FilterBarProps {
  filters: PropertyFilterParams;
  onChange: (newFilters: PropertyFilterParams) => void;
  availableConcelhos: string[];
  onExportCSV?: () => void;
  totalCount?: number;
  onTriggerScrape?: () => void;
  isScraping?: boolean;
}

const TYPOLOGIES: PropertyTypology[] = ['T0', 'T1', 'T2', 'T3', 'T4+', 'Moradia', 'Bi-Familiar'];

const RADIUS_OPTIONS: { label: string; value: number | null }[] = [
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
  { label: '100 km', value: 100 },
  { label: 'Todo o País', value: null },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  availableConcelhos,
  onExportCSV,
  totalCount,
  onTriggerScrape,
  isScraping,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleTypologyToggle = (typ: PropertyTypology) => {
    const current = filters.typologies || [];
    const next = current.includes(typ)
      ? current.filter((t) => t !== typ)
      : [...current, typ];
    onChange({ ...filters, typologies: next });
  };

  const handleRadiusChange = (radius: number | null) => {
    onChange({
      ...filters,
      radiusKm: radius,
    });
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

          const detected = data.success && data.concelho ? data.concelho : 'A tua localização';
          setDetectedLocation(detected);

          // Ao ativar geolocalização, definir userLocation e o concelho detetado
          onChange({
            ...filters,
            userLocation: { lat, lng },
            radiusKm: filters.radiusKm !== undefined ? filters.radiusKm : 25,
            concelho: 'Todos',
            searchQuery: '',
            sortBy: 'distance_asc',
          });
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
    onChange({
      ...filters,
      userLocation: null,
      radiusKm: null,
      concelho: 'Todos',
      searchQuery: '',
      sortBy: filters.sortBy === 'distance_asc' ? 'newest' : filters.sortBy,
    });
  };

  const isLocationActive = Boolean(filters.userLocation);
  const currentRadius = filters.radiusKm;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-xs mb-4 sm:mb-6 dark:bg-slate-900 dark:border-slate-800 transition-colors">
      {/* Barra de Pesquisa e Seletores Principais */}
      <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-12 md:gap-4">
        {/* Input de Pesquisa com Botão de Localização Integrado */}
        <div className="md:col-span-6 flex gap-2">
          {/* Input de Pesquisa com Botão de Localização Integrado */}
          <div className="relative flex-1 min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Pesquisar freguesia, concelho..."
              value={filters.searchQuery || ''}
              onChange={(e) => {
                onChange({ ...filters, searchQuery: e.target.value });
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-28 sm:pr-40 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-800 dark:focus:border-slate-600 dark:focus:ring-slate-700 transition-all"
            />

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLocating}
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer disabled:opacity-60 ${
                isLocationActive
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 shadow-xs dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Detetar a minha localização e pesquisar num raio"
            >
              <LocateFixed className={`h-3.5 w-3.5 ${isLocationActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'} ${isLocating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isLocating ? 'A localizar...' : isLocationActive ? 'Localização ativa' : 'A minha localização'}
              </span>
              <span className="sm:hidden font-medium">
                {isLocating ? 'A obter...' : isLocationActive ? 'Ativo' : 'Perto'}
              </span>
            </button>
          </div>

          {/* Botão Executar Ronda (Movido do Header) */}
          {onTriggerScrape && (
            <button
              type="button"
              onClick={onTriggerScrape}
              disabled={isScraping}
              className="hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-60 cursor-pointer"
              title="Executar prospeção nos portais imediatamente"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-slate-500 dark:text-slate-400 ${isScraping ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{isScraping ? 'A recolher...' : 'Executar Ronda'}</span>
            </button>
          )}
        </div>

        {/* Seletores: em mobile ficam lado a lado em 2 colunas para poupar altura */}
        <div className="grid grid-cols-2 gap-2 md:col-span-6 md:grid-cols-2 md:gap-4">
          <div>
            <select
              value={filters.concelho || 'Todos'}
              onChange={(e) => {
                onChange({ ...filters, concelho: e.target.value });
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-2.5 sm:px-3 text-xs sm:text-sm text-slate-700 focus:border-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:focus:bg-slate-800 dark:focus:border-slate-600 dark:focus:ring-slate-700 cursor-pointer transition-colors truncate"
            >
              <option value="Todos">Todos os Concelhos</option>
              {availableConcelhos.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={filters.sortBy || 'newest'}
              onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-2.5 sm:pl-3 pr-7 sm:pr-8 text-xs sm:text-sm text-slate-700 focus:border-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:focus:bg-slate-800 dark:focus:border-slate-600 dark:focus:ring-slate-700 cursor-pointer transition-colors truncate"
            >
              <option value="newest">Mais Recentes</option>
              {isLocationActive && (
                <option value="distance_asc">📍 Mais Próximos</option>
              )}
              <option value="opportunity_best">Maior Desconto (€/m²)</option>
              <option value="price_asc">Menor Preço (€)</option>
              <option value="price_desc">Maior Preço (€)</option>
              <option value="price_m2_asc">Menor Preço por m²</option>
            </select>
            <ArrowUpDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          </div>
        </div>
      </div>

      {/* Caixa de Raio e Localização Ativa */}
      {(isLocationActive || detectedLocation || locationError) && (
        <div className="mt-3 rounded-xl border border-emerald-200/90 bg-emerald-50/70 p-2.5 sm:p-3 shadow-2xs dark:border-emerald-800/70 dark:bg-emerald-950/40 transition-colors">
          {locationError ? (
            <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
              <span>{locationError}</span>
              <button
                type="button"
                onClick={() => setLocationError(null)}
                className="text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200 cursor-pointer p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">
                    <strong>{detectedLocation || 'Localização Detetada'}</strong>
                    {currentRadius ? (
                      <span className="ml-1 text-emerald-700 dark:text-emerald-300">({currentRadius} km)</span>
                    ) : (
                      <span className="ml-1 text-emerald-700 dark:text-emerald-300">(sem limite)</span>
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleClearDetectedLocation}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-rose-700 font-semibold px-2 py-0.5 rounded-md bg-white/80 border border-slate-200 cursor-pointer transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:text-rose-400 shrink-0 ml-2"
                  title="Desativar filtro por raio e localização"
                >
                  <X className="h-3 w-3" />
                  <span>Limpar</span>
                </button>
              </div>

              {/* Botões de Raio com scroll horizontal suave no telemóvel */}
              <div className="flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 shrink-0 mr-0.5">
                  Raio:
                </span>
                {RADIUS_OPTIONS.map((opt) => {
                  const isCurrent = currentRadius === opt.value;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleRadiusChange(opt.value)}
                      className={`px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                        isCurrent
                          ? 'bg-emerald-700 text-white shadow-2xs dark:bg-emerald-600'
                          : 'bg-white/80 border border-emerald-200 text-emerald-800 hover:bg-white dark:bg-slate-800 dark:border-emerald-800/80 dark:text-emerald-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtros Avançados Expansíveis (Preço e Área) */}
      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-t border-slate-100 pt-3 sm:pt-4 dark:border-slate-800 transition-colors">
        {/* Tipologias com deslizamento horizontal suave no telemóvel */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1 sm:mx-0 sm:px-0">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Tipologia:
          </span>
          {TYPOLOGIES.map((typ) => {
            const isSelected = filters.typologies?.includes(typ);
            return (
              <button
                key={typ}
                onClick={() => handleTypologyToggle(typ)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs dark:bg-emerald-600 dark:text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {typ}
              </button>
            );
          })}
        </div>

        {/* Acções e Exportação */}
        <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
          <button
            onClick={() => onChange({ ...filters, priceChangeOnly: !filters.priceChangeOnly })}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
              filters.priceChangeOnly
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <TrendingDown className="h-3.5 w-3.5" />
            <span>Baixa de Preço</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
              showAdvancedFilters || Boolean(filters.minPrice || filters.maxPrice || filters.minArea || filters.maxArea)
                ? 'bg-slate-900 text-white shadow-xs dark:bg-emerald-600 dark:text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
            title="Definir limites de preço e área útil"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filtros</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
          </button>

          <select
            value={filters.opportunity || 'Todas'}
            onChange={(e) => onChange({ ...filters, opportunity: e.target.value as any })}
            className="rounded-lg border border-slate-200 bg-white py-1 px-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer transition-colors max-w-[155px] sm:max-w-none truncate"
          >
            <option value="Todas">Todas Avaliações</option>
            <option value="good">🟢 Bom Preço (&gt;10% abaixo)</option>
            <option value="fair">🟡 Dentro do Preço (±10%)</option>
            <option value="bad">🔴 Acima do Mercado</option>
          </select>

          {onExportCSV && (
            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white py-1 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer ml-auto dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
              title="Descarregar dossiê em formato CSV para Excel com todas as métricas"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Exportar {totalCount ? `(${totalCount})` : ''}</span>
            </button>
          )}
        </div>
      </div>

      {/* Painel Expansível de Intervalos Numéricos (Preço e Área) */}
      {showAdvancedFilters && (
        <div className="mt-3.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4 dark:border-slate-800 dark:bg-slate-800/40 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Intervalos de Valor e Dimensão
            </span>
            {(filters.minPrice || filters.maxPrice || filters.minArea || filters.maxArea) && (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...filters,
                    minPrice: undefined,
                    maxPrice: undefined,
                    minArea: undefined,
                    maxArea: undefined,
                  })
                }
                className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer self-start sm:self-auto"
              >
                Limpar intervalos
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            {/* Preço Mínimo */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Preço Mínimo (€)
              </label>
              <input
                type="number"
                placeholder="Ex: 150 000"
                value={filters.minPrice ?? ''}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    minPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
              />
            </div>

            {/* Preço Máximo */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Preço Máximo (€)
              </label>
              <input
                type="number"
                placeholder="Ex: 350 000"
                value={filters.maxPrice ?? ''}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    maxPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
              />
            </div>

            {/* Área Mínima */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Área Mínima (m²)
              </label>
              <input
                type="number"
                placeholder="Ex: 70"
                value={filters.minArea ?? ''}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    minArea: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
              />
            </div>

            {/* Área Máxima */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Área Máxima (m²)
              </label>
              <input
                type="number"
                placeholder="Ex: 200"
                value={filters.maxArea ?? ''}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    maxArea: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
