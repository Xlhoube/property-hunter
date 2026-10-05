'use client';

import React from 'react';
import { X, History, Calendar, ExternalLink } from 'lucide-react';
import { Property } from '@/types/property';
import { formatCurrency } from '@/lib/market-analysis';

interface PriceHistoryModalProps {
  property: Property | null;
  onClose: () => void;
}

export const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({
  property,
  onClose,
}) => {
  if (!property) return null;

  const history = property.price_history || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <History className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Histórico de Preço
              </h3>
              <p className="text-xs text-slate-500">
                {property.freguesia}, {property.concelho}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
          <p className="font-semibold text-slate-900 line-clamp-1">{property.title}</p>
          <div className="mt-1 flex items-center justify-between">
            <span>Preço Atual: <strong className="text-slate-900">{formatCurrency(property.price)}</strong></span>
            <span>Média da Zona: <strong>{property.zone_avg_price_m2}€/m²</strong></span>
          </div>
        </div>

        <div className="my-4 max-h-60 overflow-y-auto pr-1">
          {history.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">
              Sem alterações registadas desde a primeira recolha.
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((record, index) => {
                const date = new Date(record.recorded_at).toLocaleDateString('pt-PT', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const isCurrent = index === history.length - 1;

                return (
                  <div
                    key={record.id || index}
                    className={`flex items-center justify-between rounded-xl p-3 border text-xs transition-colors ${
                      isCurrent
                        ? 'border-emerald-200 bg-emerald-50/50 font-semibold text-slate-900'
                        : 'border-slate-100 bg-white text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{date}</span>
                      {isCurrent && (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] text-emerald-800">
                          Atual
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">
                        {formatCurrency(record.price)}
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal">
                        {record.price_m2} €/m²
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <a
            href={property.original_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
          >
            <span>Abrir anúncio oficial</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </a>

          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
