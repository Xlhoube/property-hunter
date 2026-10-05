'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Target, RefreshCw, Bell, Sun, Moon, Menu, X, Clock, Sparkles, Globe } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3 lg:px-8">
        {/* Logótipo e Marca */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-800 text-white shadow-sm border border-slate-800 dark:border-slate-700 shrink-0 group-hover:border-emerald-500/50 transition-colors">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Property Hunter
                </span>
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                  PT
                </span>
              </div>
              <p className="hidden xs:block text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate max-w-[170px] sm:max-w-none">
                Prospecção e Oportunidades por m²
              </p>
            </div>
          </Link>
        </div>

        {/* Controlos Principais */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <div className="hidden text-right text-xs text-slate-500 dark:text-slate-400 xl:block">
            <span className="text-slate-400 dark:text-slate-500">Última ronda:</span>{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">{lastScrapedTime}</span>
          </div>

          {/* Link para Fontes de Pesquisa Desktop */}
          <Link
            href="/fontes"
            className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Escolher e gerir portais e fontes de pesquisa"
          >
            <Globe className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Fontes</span>
          </Link>

          {/* Botão de Alternância de Modo Escuro / Claro */}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
            title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            aria-label="Alternar tema"
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600 transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* Botão Ronda Desktop */}
          <button
            onClick={onTriggerScrape}
            disabled={isScraping}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-60 cursor-pointer"
            title="Executar prospeção nos portais imediatamente (intervalo programado: 12h)"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 dark:text-slate-400 ${isScraping ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isScraping ? 'A recolher...' : 'Executar Ronda'}</span>
          </button>

          {/* Botão Criar Alerta */}
          <button
            onClick={onOpenAlertModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-emerald-600 px-2.5 sm:px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors cursor-pointer"
          >
            <Bell className="h-3.5 w-3.5 text-amber-300" />
            <span className="hidden xs:inline">Criar Alerta</span>
            <span className="xs:hidden">Alertas</span>
          </button>

          {/* Botão Hambúrguer Mobile */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            aria-label="Abrir menu de opções"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Menu Desdobrável Mobile */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3.5 shadow-lg animate-in slide-in-from-top-2 duration-150 transition-colors space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>Última ronda:</span>
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{lastScrapedTime}</span>
          </div>

          <div className="grid grid-cols-1 gap-2 pt-1">
            <Link
              href="/fontes"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Gerir Fontes de Pesquisa</span>
            </Link>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onTriggerScrape();
              }}
              disabled={isScraping}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 text-emerald-600 dark:text-emerald-400 ${isScraping ? 'animate-spin' : ''}`} />
              <span>{isScraping ? 'A recolher portais...' : 'Executar Ronda nos Portais (12h)'}</span>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenAlertModal();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors cursor-pointer"
            >
              <Bell className="h-4 w-4 text-amber-300" />
              <span>Configurar Alertas (Discord & Telegram)</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 dark:text-slate-500">
            <span>Portais: Idealista · Imovirtual · CasaSAPO</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <Sparkles className="h-3 w-3" />
              Auto 12h
            </span>
          </div>
        </div>
      )}
    </header>
  );
};

