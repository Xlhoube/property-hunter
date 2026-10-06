'use client';

import React from 'react';
import { X, CheckCircle2, AlertTriangle, RefreshCw, ExternalLink, Sparkles, TrendingDown, Bell } from 'lucide-react';
import { ScraperResult } from '@/lib/scraper-service';

interface ScrapeProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRunning: boolean;
  result: ScraperResult | null;
  error?: string | null;
  onTriggerScrapeAgain: () => void;
}

export const ScrapeProgressModal: React.FC<ScrapeProgressModalProps> = ({
  isOpen,
  onClose,
  isRunning,
  result,
  error,
  onTriggerScrapeAgain,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-xs ${
              isRunning ? 'bg-indigo-600' : error ? 'bg-rose-600' : 'bg-emerald-600'
            }`}>
              <RefreshCw className={`h-5 w-5 ${isRunning ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isRunning
                  ? 'A recolher imóveis nos portais...'
                  : error
                  ? 'Erro na Prospecção'
                  : 'Prospecção em Tempo Real Concluída'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A executar rotinas de pesquisa configuradas...
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto space-y-5">
          {isRunning ? (
            <div className="py-8 text-center space-y-4">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/80">
                <RefreshCw className="h-8 w-8 animate-spin" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">A consultar múltiplos portais em simultâneo</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                  A extrair tipologias, cálculo de preço por metro quadrado e confronto com as médias de cada freguesia...
                </p>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 pt-2">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60">
                  <Sparkles className="h-3 w-3 mr-1.5" /> A contactar motores e APIs ativas...
                </span>
                <p className="text-[10px] text-slate-400 mt-2 max-w-xs text-center">
                  Nota: Todas as fontes ativas configuradas em "/fontes" serão processadas (incluindo fontes personalizadas).
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50/60 dark:border-rose-900/60 dark:bg-rose-950/40 p-4 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-xs">
              <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Ocorreu uma falha na ronda:</strong>
                <p className="mt-1 text-rose-700 dark:text-rose-300">{error}</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-4">
              {/* Cards de Métricas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/60 p-3 text-center transition-colors">
                  <div className="text-xl font-black text-slate-900 dark:text-white">{result.new_properties}</div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                    <Sparkles className="h-3 w-3 text-emerald-500 dark:text-emerald-400" /> Novos Imóveis
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/60 p-3 text-center transition-colors">
                  <div className="text-xl font-black text-emerald-700 dark:text-emerald-400">{result.price_drops}</div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                    <TrendingDown className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> Baixas Preço
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/60 p-3 text-center transition-colors">
                  <div className="text-xl font-black text-indigo-700 dark:text-indigo-400">{result.notifications_sent}</div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                    <Bell className="h-3 w-3 text-indigo-600 dark:text-indigo-400" /> Alertas
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/60 p-3 text-center transition-colors">
                  <div className="text-xl font-black text-slate-700 dark:text-slate-300">{result.total_scraped}</div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Total Base</div>
                </div>
              </div>

              {/* Registo de Oportunidades Encontradas */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Destaques da Prospeção
                </h4>
                {result.details && result.details.length > 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/50 p-3 max-h-56 overflow-y-auto space-y-2 text-xs">
                    {result.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-200">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{detail}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                    Todos os anúncios consultados já se encontram atualizados na base de dados.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/60 transition-colors">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Rondas automáticas programadas de 12 em 12 horas (08:00 e 20:00) para evitar bloqueios.
          </span>
          <div className="flex items-center gap-2">
            {!isRunning && (
              <button
                onClick={onTriggerScrapeAgain}
                className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Correr Novamente
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
