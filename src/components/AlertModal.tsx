'use client';

import React, { useState } from 'react';
import {
  X,
  Bell,
  Check,
  Send,
  RefreshCw,
  AlertCircle,
  Zap,
  ExternalLink,
  Users,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
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
  const [channel, setChannel] = useState<'discord' | 'telegram' | 'email'>('discord');
  const [contact, setContact] = useState('');
  const [onlyGoodDeals, setOnlyGoodDeals] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modo avançado (apenas se o utilizador quiser colar o seu próprio Webhook no Discord)
  const [showAdvancedWebhook, setShowAdvancedWebhook] = useState(false);

  // Estado para teste de notificação
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestNotification = async () => {
    if (!contact.trim()) {
      setTestResult({
        success: false,
        message: 'Preenche primeiro o teu contacto ou ID antes de testar.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/alerts/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          destination: contact.trim(),
          concelho,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || 'Notificação enviada com sucesso!',
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || data.message || 'Falha ao contactar o serviço.',
        });
      }
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Erro de rede ao testar alerta.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createAlert({
        concelho,
        channel,
        user_email: channel === 'email' ? contact.trim() : undefined,
        webhook_url: channel === 'discord' ? (contact.trim() || 'official_discord_server') : undefined,
        typologies: ['T1', 'T2', 'T3'],
        only_good_deals: onlyGoodDeals,
        is_active: true,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Erro ao criar alerta:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 transition-colors">
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-emerald-600">
              <Bell className="h-4 w-4 text-amber-300 dark:text-amber-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Criar Alerta de Oportunidades
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Recebe novos imóveis e descidas de preço em tempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="my-8 flex flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-3">
              <Check className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Alerta Criado com Sucesso!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              Vais receber notificações automáticas para as oportunidades de {concelho}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Concelho de Interesse
              </label>
              <select
                value={concelho}
                onChange={(e) => setConcelho(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800 cursor-pointer transition-colors"
              >
                {availableConcelhos.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Canal de Notificação
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  key="discord"
                  type="button"
                  onClick={() => {
                    setChannel('discord');
                    setTestResult(null);
                  }}
                  className={`rounded-xl py-2 px-3 text-center font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    channel === 'discord'
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>Discord</span>
                </button>

                <button
                  key="telegram"
                  type="button"
                  onClick={() => {
                    setChannel('telegram');
                    setTestResult(null);
                  }}
                  className={`rounded-xl py-2 px-3 text-center font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    channel === 'telegram'
                      ? 'border-sky-500 bg-sky-500 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>Telegram</span>
                </button>

                <button
                  key="email"
                  type="button"
                  onClick={() => {
                    setChannel('email');
                    setTestResult(null);
                  }}
                  className={`rounded-xl py-2 px-3 text-center font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    channel === 'email'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs dark:border-emerald-600 dark:bg-emerald-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>Email</span>
                </button>
              </div>
            </div>

            {/* SELEÇÃO DO CANAL: MODO SIMPLES DISCORD */}
            {channel === 'discord' && (
              <div className="space-y-3">
                {!showAdvancedWebhook ? (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 dark:border-indigo-900/60 dark:bg-indigo-950/40 p-3.5 text-slate-700 dark:text-slate-300 space-y-2.5 transition-colors">
                    <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold">
                      <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Comunidade Discord Property Hunter</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Não precisas de configurar nada! Entra no servidor oficial e recebe alertas organizados em canais automáticos por concelho (<code className="text-indigo-700 dark:text-indigo-300 font-semibold bg-white/70 dark:bg-slate-800 px-1 py-0.5 rounded">#{concelho.toLowerCase()}</code>).
                    </p>
                    <a
                      href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 px-3 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Entrar no Servidor Discord</span>
                    </a>

                    <div className="pt-1 text-center">
                      <button
                        type="button"
                        onClick={() => setShowAdvancedWebhook(true)}
                        className="text-[11px] text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 underline cursor-pointer inline-flex items-center gap-1"
                      >
                        <SlidersHorizontal className="h-3 w-3" />
                        <span>Sou administrador e quero ligar o meu próprio canal (Webhook)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60 p-3 transition-colors">
                    <div className="flex items-center justify-between">
                      <label className="block font-semibold text-slate-800 dark:text-slate-200">
                        URL do teu Webhook Discord
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAdvancedWebhook(false)}
                        className="text-[11px] text-indigo-600 hover:underline cursor-pointer dark:text-indigo-400"
                      >
                        Voltar ao modo simples
                      </button>
                    </div>
                    <input
                      type="url"
                      placeholder="https://discord.com/api/webhooks/..."
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 py-2 px-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-300 transition-colors"
                    />
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleTestNotification}
                        disabled={isTesting || !contact.trim()}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 disabled:opacity-40 cursor-pointer"
                      >
                        {isTesting ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                        <span>Testar Webhook</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SELEÇÃO DO CANAL: TELEGRAM */}
            {channel === 'telegram' && (
              <div className="rounded-xl border border-sky-100 bg-sky-50/60 dark:border-sky-900/60 dark:bg-sky-950/40 p-3.5 space-y-2.5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-900 dark:text-sky-300 font-bold">
                    <ShieldCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    <span>Alertas no Telemóvel (Telegram)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestNotification}
                    disabled={isTesting || !contact.trim()}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200 disabled:opacity-40 cursor-pointer"
                  >
                    {isTesting ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                    <span>Testar</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Para começares a receber, abre o bot no Telegram e clica em <b>Iniciar</b>. A seguir, indica o teu Chat ID ou contacto:
                </p>

                <div className="flex gap-2">
                  <a
                    href="https://t.me/OmeuPropertyHunterBot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-sky-600 hover:bg-sky-700 py-2 px-3 text-xs font-bold text-white shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Abrir Bot (@OmeuPropertyHunterBot)</span>
                  </a>
                  <input
                    type="text"
                    required
                    placeholder="O teu Chat ID (ex: 5004093342)"
                    value={contact}
                    onChange={(e) => {
                      setContact(e.target.value);
                      setTestResult(null);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 py-2 px-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-300 transition-colors"
                  />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  💡 Podes descobrir o teu Chat ID enviando /start para o bot <code>@userinfobot</code>.
                </p>
              </div>
            )}

            {/* SELEÇÃO DO CANAL: EMAIL */}
            {channel === 'email' && (
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  O teu Endereço de Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="exemplo@email.com"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 py-2.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-200 transition-colors"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Recebe relatórios consolidados sempre que surgirem descidas de preço em {concelho}.
                </p>
              </div>
            )}

            {testResult && (
              <div
                className={`flex items-start gap-2 rounded-xl p-2.5 text-[11px] ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800'
                }`}
              >
                {testResult.success ? (
                  <Check className="h-3.5 w-3.5 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-700 transition-colors">
              <input
                type="checkbox"
                id="goodDealsOnly"
                checked={onlyGoodDeals}
                onChange={(e) => setOnlyGoodDeals(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="goodDealsOnly" className="cursor-pointer text-slate-700 dark:text-slate-300 font-medium select-none">
                Apenas notificar &quot;Bom Preço&quot; (&gt;10% abaixo da média de m²)
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? 'A guardar...' : 'Activar Alerta'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
