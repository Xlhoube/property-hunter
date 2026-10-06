'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { MarketStatBanner } from '@/components/MarketStatBanner';
import { FilterBar } from '@/components/FilterBar';
import { PropertyCard } from '@/components/PropertyCard';
import { PriceHistoryModal } from '@/components/PriceHistoryModal';
import { AlertModal } from '@/components/AlertModal';
import { ScrapeProgressModal } from '@/components/ScrapeProgressModal';
import { Property, PropertyFilterParams } from '@/types/property';
import { fetchProperties } from '@/lib/appwrite';
import { exportPropertiesToCSV } from '@/lib/export-csv';
import { ScraperResult } from '@/lib/scraper-service';
import { Building, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScraping, setIsScraping] = useState(false);
  const [isScrapeModalOpen, setIsScrapeModalOpen] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<ScraperResult | null>(null);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  const [lastScrapedTime, setLastScrapedTime] = useState('há poucos minutos');
  const [selectedHistoryProperty, setSelectedHistoryProperty] = useState<Property | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const [filters, setFilters] = useState<PropertyFilterParams>({
    searchQuery: '',
    concelho: 'Todos',
    opportunity: 'Todas',
    typologies: [],
    priceChangeOnly: false,
    sortBy: 'newest',
  });

  const loadProperties = async (currentFilters: PropertyFilterParams) => {
    setIsLoading(true);
    try {
      const data = await fetchProperties(currentFilters);
      setProperties(data);
    } catch (err) {
      console.error('Erro ao carregar imoveis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProperties(filters);
  }, [filters]);

  const availableConcelhos = useMemo(() => {
    const list = Array.from(new Set(properties.map((p) => p.concelho))).filter(Boolean);
    return list.sort();
  }, [properties]);

  const handleTriggerScrape = async () => {
    setIsScraping(true);
    setIsScrapeModalOpen(true);
    setScrapeResult(null);
    setScrapeError(null);

    try {
      const targetConcelho = filters.concelho !== 'Todos' ? filters.concelho : undefined;
      const scrapePayload = { ...filters, concelho: targetConcelho };
      
      const res = await fetch('/api/cron/scrape', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scrapePayload)
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setLastScrapedTime('agora mesmo');
        setScrapeResult(json.data);
        await loadProperties(filters);
      } else {
        setScrapeError(json.error || 'Falha ao executar a prospeção nos portais');
      }
    } catch (err: any) {
      console.error('Erro na ronda horaria:', err);
      setScrapeError(err.message || 'Erro de comunicação com o servidor de prospeção');
    } finally {
      setIsScraping(false);
    }
  };

  const handleExportCSV = () => {
    let slug = 'portugal';
    if (filters.radiusKm && filters.userLocation) {
      slug = `raio-${filters.radiusKm}km`;
    } else if (filters.concelho && filters.concelho !== 'Todos') {
      slug = filters.concelho.toLowerCase();
    }
    exportPropertiesToCSV(properties, `oportunidades-${slug}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between transition-colors">
      <div>
        <Navbar
          onTriggerScrape={handleTriggerScrape}
          isScraping={isScraping}
          onOpenAlertModal={() => setIsAlertModalOpen(true)}
          lastScrapedTime={lastScrapedTime}
        />

        <main className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <MarketStatBanner properties={properties} />

          <FilterBar
            filters={filters}
            onChange={setFilters}
            availableConcelhos={availableConcelhos}
            onExportCSV={handleExportCSV}
            totalCount={properties.length}
          />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
              <RefreshCw className="h-8 w-8 animate-spin text-slate-500 dark:text-slate-400 mb-3" />
              <p className="text-sm font-medium">A analisar o mercado imobiliário...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center my-6 dark:border-slate-800 dark:bg-slate-900 transition-colors">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-3">
                <Building className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Nenhum imóvel encontrado</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Tenta alargar os critérios de pesquisa ou limpar os filtros para ver todas as opções disponíveis.
              </p>
              <button
                onClick={() =>
                  setFilters({
                    searchQuery: '',
                    concelho: 'Todos',
                    opportunity: 'Todas',
                    typologies: [],
                    priceChangeOnly: false,
                    minPrice: undefined,
                    maxPrice: undefined,
                    minArea: undefined,
                    maxArea: undefined,
                    sortBy: 'newest',
                    userLocation: null,
                    radiusKm: null,
                  })
                }
                className="mt-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onOpenHistory={setSelectedHistoryProperty}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-400 transition-colors">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Property Hunter — Inteligência Imobiliária em Portugal</p>
          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
            <span>Idealista</span>
            <span>·</span>
            <span>Imovirtual</span>
            <span>·</span>
            <span>CustoJusto</span>
            <span>·</span>
            <span>CasaSAPO</span>
          </div>
        </div>
      </footer>

      <PriceHistoryModal
        property={selectedHistoryProperty}
        onClose={() => setSelectedHistoryProperty(null)}
      />

      <AlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        availableConcelhos={availableConcelhos}
      />

      <ScrapeProgressModal
        isOpen={isScrapeModalOpen}
        onClose={() => setIsScrapeModalOpen(false)}
        isRunning={isScraping}
        result={scrapeResult}
        error={scrapeError}
        onTriggerScrapeAgain={handleTriggerScrape}
      />
    </div>
  );
}
