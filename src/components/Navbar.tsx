'use client';

import React from 'react';
import { Target, RefreshCw, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

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
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-800 text-white shadow-sm border border-slate-800 dark:border-slate-700">
            <Target className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Property Hunter
              </span>
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                Portugal
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Prospecção e Oportunidades por m²
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden text-right text-xs text-slate-500 dark:text-slate-400 md:block">
            <span className="text-slate-400 dark:text-slate-500">Última ronda:</span>{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">{lastScrapedTime}</span>
          </div>

          {/* Botão de Alternância de Modo Escuro / Claro */}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
            title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            aria-label="Alternar tema"
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform rotate-0 scale-100 hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600 transition-transform hover:-rotate-12" />
            )}
          </button>

          <button
            onClick={onTriggerScrape}
            disabled={isScraping}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-60 cursor-pointer"
            title="Executar prospeção nos portais imediatamente (intervalo programado: 12h)"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 dark:text-slate-400 ${isScraping ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="hidden sm:inline">
              {isScraping ? 'A recolher...' : 'Executar Ronda'}
            </span>
          </button>

          <button
            onClick={onOpenAlertModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors cursor-pointer"
          >
            <Bell className="h-3.5 w-3.5 text-amber-300" />
            <span>Criar Alerta</span>
          </button>
        </div>
      </div>
    </header>
  );
};
