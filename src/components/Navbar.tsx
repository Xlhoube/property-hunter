'use client';

import React from 'react';
import { Target, RefreshCw, Bell } from 'lucide-react';

interface NavbarProps {
  onTriggerScrape: () => void;
  isScraping: boolean;
  onOpenAlertModal: () => void;
  lastScrapedTime: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onTriggerScrape,
  isScraping,
  onOpenAlertModal,
  lastScrapedTime,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
            <Target className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Property Hunter
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                Portugal
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Prospecção e Oportunidades por m²
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden text-right text-xs text-slate-500 md:block">
            <span className="text-slate-400">Última ronda:</span>{' '}
            <span className="font-medium text-slate-700">{lastScrapedTime}</span>
          </div>

          <button
            onClick={onTriggerScrape}
            disabled={isScraping}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-60 cursor-pointer"
            title="Executar prospeção nos portais imediatamente (intervalo programado: 12h)"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isScraping ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="hidden sm:inline">
              {isScraping ? 'A recolher...' : 'Executar Ronda'}
            </span>
          </button>

          <button
            onClick={onOpenAlertModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Bell className="h-3.5 w-3.5 text-amber-300" />
            <span>Criar Alerta</span>
          </button>
        </div>
      </div>
    </header>
  );
};
