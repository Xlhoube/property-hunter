'use client';

import React, { useState } from 'react';
import { X, Bell, Check, Send } from 'lucide-react';
import { createAlert } from '@/lib/appwrite';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableConcelhos: string[];
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  availableConcelhos,
}) => {
  const [concelho, setConcelho] = useState(availableConcelhos[0] || 'Lisboa');
  const [channel, setChannel] = useState<'email' | 'telegram' | 'discord'>('email');
  const [contact, setContact] = useState('');
  const [onlyGoodDeals, setOnlyGoodDeals] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createAlert({
        concelho,
        channel,
        user_email: channel === 'email' ? contact : undefined,
        webhook_url: channel !== 'email' ? contact : undefined,
        typologies: ['T1', 'T2', 'T3'],
        only_good_deals: onlyGoodDeals,
        is_active: true,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Erro ao criar alerta:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Bell className="h-4 w-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Criar Alerta de Oportunidades
              </h3>
              <p className="text-xs text-slate-500">
                Recebe novos imóveis e descidas de preço em tempo real
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

        {isSuccess ? (
          <div className="my-8 flex flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
              <Check className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Alerta Criado com Sucesso!</h4>
            <p className="text-xs text-slate-500 mt-1">
              Vais receber notificações para o concelho de {concelho}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Concelho de Interesse
              </label>
              <select
                value={concelho}
                onChange={(e) => setConcelho(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-200"
              >
                {availableConcelhos.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Canal de Notificação
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['email', 'telegram', 'discord'] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChannel(ch)}
                    className={`rounded-lg py-2 text-center font-medium capitalize border transition-all cursor-pointer ${
                      channel === ch
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {channel === 'email' ? 'O teu Endereço de Email' : 'URL do Webhook (' + channel + ')'}
              </label>
              <input
                type={channel === 'email' ? 'email' : 'text'}
                required
                placeholder={channel === 'email' ? 'exemplo@email.com' : 'https://discord.com/api/webhooks/...'}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 border border-slate-100">
              <input
                type="checkbox"
                id="goodDealsOnly"
                checked={onlyGoodDeals}
                onChange={(e) => setOnlyGoodDeals(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="goodDealsOnly" className="cursor-pointer text-slate-700 font-medium select-none">
                Apenas notificar &quot;Bom Preço&quot; (&gt;10% abaixo da média de m²)
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? 'A guardar...' : 'Ativar Alerta'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
