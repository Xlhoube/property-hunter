'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Globe,
  Plus,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Trash2,
  Activity,
  Layers,
  Search,
  Check,
  AlertTriangle,
  RefreshCw,
  Sun,
  Moon,
  Target,
  Database,
  Radio,
  Info
} from 'lucide-react';
import { PropertySource, SourceType, SourceCategory, SOURCE_CATEGORY_LABELS } from '@/types/source';
import { useTheme } from '@/components/ThemeProvider';

export default function FontesPage() {
  const { isDark, toggleTheme } = useTheme();
  const [sources, setSources] = useState<PropertySource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'active' | 'paused' | 'custom'>('all');
  const [filterCategory, setFilterCategory] = useState<SourceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados do Modal de Adicionar Fonte
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBaseUrl, setNewBaseUrl] = useState('');
  const [newSearchPattern, setNewSearchPattern] = useState('');
  const [newType, setNewType] = useState<SourceType>('html');
  const [newInterval, setNewInterval] = useState<number>(12);
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Estados de Teste de Conexão em tempo real
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; text: string }>>({});

  // Carregar fontes da API
  const fetchSources = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sources');
      const data = await res.json();
      if (data.success && Array.isArray(data.sources)) {
        let savedPrefs: Record<string, boolean> = {};
        try {
          const stored = localStorage.getItem('ph_source_prefs');
          if (stored) savedPrefs = JSON.parse(stored);
        } catch (e) {}

        const mergedSources = data.sources.map((s: PropertySource) => {
          if (savedPrefs[s.id] !== undefined) {
            return { ...s, enabled: savedPrefs[s.id], status: savedPrefs[s.id] ? 'active' : 'paused' };
          }
          return s;
        });
        setSources(mergedSources);
      }
    } catch (err) {
      console.error('Erro ao carregar fontes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  // Alternar estado ativo / pausado
  const handleToggle = async (source: PropertySource) => {
    const updatedState = !source.enabled;
    // Atualização otimista na interface
    setSources((prev) =>
      prev.map((s) =>
        s.id === source.id
          ? { ...s, enabled: updatedState, status: updatedState ? 'active' : 'paused' }
          : s
      )
    );

    try {
      const stored = localStorage.getItem('ph_source_prefs');
      const prefs = stored ? JSON.parse(stored) : {};
      prefs[source.id] = updatedState;
      localStorage.setItem('ph_source_prefs', JSON.stringify(prefs));
    } catch (e) {}

    try {
      const res = await fetch('/api/sources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: source.id, enabled: updatedState }),
      });
      const data = await res.json();
      if (!data.success) {
        // Reverter se falhou
        fetchSources();
      }
    } catch {
      fetchSources();
    }
  };

  const handleToggleAll = async (targetState: boolean) => {
    // Atualização otimista
    setSources((prev) =>
      prev.map((s) => ({ ...s, enabled: targetState, status: targetState ? 'active' : 'paused' }))
    );

    try {
      const stored = localStorage.getItem('ph_source_prefs');
      const prefs = stored ? JSON.parse(stored) : {};
      sources.forEach((s) => {
        prefs[s.id] = targetState;
      });
      localStorage.setItem('ph_source_prefs', JSON.stringify(prefs));
    } catch (e) {}

    try {
      const promises = sources.map((source) =>
        fetch('/api/sources', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: source.id, enabled: targetState }),
        })
      );
      await Promise.allSettled(promises);
      fetchSources();
    } catch {
      fetchSources();
    }
  };

  // Testar ligação do portal em direto
  const handleTestConnection = async (source: PropertySource) => {
    setTestingId(source.id);
    try {
      const res = await fetch('/api/sources/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: source.baseUrl }),
      });
      const data = await res.json();
      setTestResults((prev) => ({
        ...prev,
        [source.id]: {
          success: data.success,
          text: data.statusText || (data.success ? 'Ligação OK' : 'Sem resposta'),
        },
      }));
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [source.id]: { success: false, text: 'Erro ao contactar portal' },
      }));
    } finally {
      setTestingId(null);
    }
  };

  // Eliminar fonte personalizada
  const handleDeleteSource = async (id: string, name: string) => {
    if (!window.confirm(`Tens a certeza de que queres eliminar a fonte "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/sources?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setSources((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert(data.error || 'Não foi possível eliminar a fonte.');
      }
    } catch {
      alert('Erro de comunicação ao tentar eliminar a fonte.');
    }
  };

  // Submeter nova fonte
  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newName.trim() || !newBaseUrl.trim()) {
      setFormError('Por favor preenche o nome e o endereço URL do portal.');
      return;
    }

    let formattedUrl = newBaseUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    try {
      new URL(formattedUrl);
    } catch {
      setFormError('O endereço introduzido não é um URL válido (exemplo: https://exemplo.pt).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          baseUrl: formattedUrl,
          searchUrlPattern:
            newSearchPattern.trim() || `${formattedUrl.replace(/\/$/, '')}/imoveis/{concelho}`,
          type: newType,
          intervalHours: Number(newInterval) || 12,
          description: newDescription.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.source) {
        setSources((prev) => [data.source, ...prev]);
        setIsAddModalOpen(false);
        // Limpar formulário
        setNewName('');
        setNewBaseUrl('');
        setNewSearchPattern('');
        setNewDescription('');
        setNewInterval(12);
      } else {
        setFormError(data.error || 'Falha ao guardar a nova fonte.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar o pedido.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtragem de fontes
  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      // Filtro de texto
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.baseUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Filtro de tipo
      if (filterType === 'active' && !s.enabled) return false;
      if (filterType === 'paused' && s.enabled) return false;
      if (filterType === 'custom' && !s.isCustom) return false;

      // Filtro por Categoria
      if (filterCategory !== 'all' && s.category !== filterCategory) return false;

      return true;
    });
  }, [sources, searchQuery, filterType, filterCategory]);

  const activeCount = sources.filter((s) => s.enabled).length;
  const customCount = sources.filter((s) => s.isCustom).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Barra de Navegação Superior */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Voltar aos Imóveis"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-800 text-white shadow-xs border border-slate-800 dark:border-slate-700">
                <Target className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                    Property Hunter
                  </span>
                  <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                    Fontes
                  </span>
                </div>
                <p className="hidden xs:block text-xs text-slate-500 dark:text-slate-400">
                  Gestão e Seleção de Portais Imobiliários
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Database className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden xs:inline">Ver Imóveis</span>
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={isDark ? 'Modo Claro' : 'Modo Escuro'}
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Fonte</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 space-y-6">
        {/* Banner de Estatísticas das Fontes */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-2xs transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Portais Totais</span>
              <Layers className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-1.5 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {sources.length}
            </div>
            <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              {customCount} personalizadas
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-2xs transition-colors">
            <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400">
              <span>Ativas na Ronda</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-1.5 text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {activeCount}
            </div>
            <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              de {sources.length} disponíveis
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-2xs transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Intervalo Ronda</span>
              <Clock className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-1.5 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              12 Horas
            </div>
            <div className="mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Seguro anti-bloqueio
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-2xs transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Modo Crawling</span>
              <Radio className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-1.5 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Híbrido
            </div>
            <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              HTML, JSON e Headers
            </div>
          </div>
        </div>

        {/* Barra de Filtros e Pesquisa de Fontes */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-2xs transition-colors">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar portal por nome ou domínio..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <button
              onClick={() => setFilterType('all')}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                filterType === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Todas ({sources.length})
            </button>
            <button
              onClick={() => setFilterType('active')}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                filterType === 'active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Ativas ({activeCount})
            </button>
            <button
              onClick={() => setFilterType('paused')}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                filterType === 'paused'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Pausadas ({sources.length - activeCount})
            </button>
            <button
              onClick={() => setFilterType('custom')}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                filterType === 'custom'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Personalizadas ({customCount})
            </button>
          </div>
        </div>

        {/* Ações em Lote e Categoria */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Barra de Filtro Rápido por Categoria de Mercado */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0 mr-1">
            Categoria:
          </span>
          <button
            onClick={() => setFilterCategory('all')}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              filterCategory === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Todas as Categorias
          </button>
          {(['portal', 'rede', 'classificados', 'dados'] as SourceCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                filterCategory === cat
                  ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {SOURCE_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
          
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleAll(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Ativar Todas</span>
          </button>
          <button
            onClick={() => handleToggleAll(false)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1.5 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>Desativar Todas</span>
          </button>
        </div>
        </div>

        {/* Lista de Cartões de Fontes */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <RefreshCw className="h-8 w-8 animate-spin mb-3 text-emerald-500" />
            <p className="text-sm font-medium">A carregar fontes de pesquisa...</p>
          </div>
        ) : filteredSources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-12 text-center">
            <Globe className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Nenhuma fonte encontrada
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Não existem portais com os filtros selecionados. Podes ajustar o filtro ou adicionar um novo portal.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Fonte</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSources.map((source) => {
              const testRes = testResults[source.id];
              const isTesting = testingId === source.id;

              return (
                <div
                  key={source.id}
                  className={`rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between ${
                    source.enabled
                      ? 'border-emerald-200/80 dark:border-emerald-900/60 bg-white dark:bg-slate-900 shadow-xs ring-1 ring-emerald-500/10'
                      : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 opacity-85'
                  }`}
                >
                  <div>
                    {/* Cabeçalho do Cartão */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl font-black text-sm shrink-0 shadow-2xs ${source.iconColor}`}
                        >
                          {source.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                              {source.name}
                            </h3>
                            {source.category && (
                              <span className="rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 text-[9px] font-semibold border border-slate-200 dark:border-slate-700">
                                {SOURCE_CATEGORY_LABELS[source.category]}
                              </span>
                            )}
                            {source.isCustom && (
                              <span className="rounded bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 text-[10px] font-semibold border border-purple-200/60 dark:border-purple-800/60">
                                Personalizada
                              </span>
                            )}
                          </div>
                          <a
                            href={source.baseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          >
                            <span className="truncate max-w-[150px]">{source.baseUrl.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                          </a>
                        </div>
                      </div>

                      {/* Botão Switch Ativar/Desativar */}
                      <button
                        type="button"
                        onClick={() => handleToggle(source)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          source.enabled
                            ? 'bg-emerald-600 dark:bg-emerald-500'
                            : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        title={source.enabled ? 'Desativar desta ronda' : 'Ativar nesta ronda'}
                        aria-pressed={source.enabled}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            source.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Descrição */}
                    <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {source.description}
                    </p>

                    {/* Detalhes Técnicos */}
                    <div className="mt-3.5 space-y-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 text-[11px] border border-slate-100 dark:border-slate-800 transition-colors">
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <span>Método:</span>
                        <span className="font-semibold uppercase text-slate-700 dark:text-slate-200">
                          {source.type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <span>Frequência:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          Cada {source.intervalHours}h
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <span>Estado:</span>
                        <span
                          className={`font-semibold inline-flex items-center gap-1 ${
                            source.enabled
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              source.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                          {source.enabled ? 'Ativo na Ronda' : 'Pausado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rodapé do Cartão com Ações */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTestConnection(source)}
                        disabled={isTesting}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-60"
                        title="Verificar se o portal está acessível a partir do servidor"
                      >
                        <Activity className={`h-3 w-3 ${isTesting ? 'animate-spin text-emerald-500' : 'text-slate-400'}`} />
                        <span>{isTesting ? 'A testar...' : 'Testar'}</span>
                      </button>

                      {testRes && (
                        <span
                          className={`text-[10px] font-semibold inline-flex items-center gap-1 ${
                            testRes.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                          }`}
                        >
                          {testRes.success ? (
                            <Check className="h-3 w-3 shrink-0" />
                          ) : (
                            <XCircle className="h-3 w-3 shrink-0" />
                          )}
                          <span className="truncate max-w-[110px]">{testRes.text}</span>
                        </span>
                      )}
                    </div>

                    {source.isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSource(source.id, source.name)}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Eliminar fonte personalizada"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Caixa de Informação & Boas Práticas */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 p-4 sm:p-5 flex items-start gap-3 transition-colors">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
            <h4 className="font-bold text-slate-900 dark:text-white">
              Boas práticas para fontes de prospeção em Portugal
            </h4>
            <p>
              Para assegurar que o Property Hunter não é bloqueado por mecanismos de proteção (Cloudflare/WAF) dos portais imobiliários, todas as pesquisas respeitam um intervalo programado de 12 horas com atrasos aleatórios entre pedidos. Fontes personalizadas devem apontar preferencialmente para páginas de listagem com paginação limpa ou feeds XML/RSS.
            </p>
          </div>
        </div>
      </main>

      {/* Modal Adicionar Nova Fonte */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 transition-colors flex flex-col max-h-[92vh] overflow-hidden">
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4 sm:p-5 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 shrink-0">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Adicionar Fonte de Pesquisa
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Regista um novo portal imobiliário ou agência
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Formulário com Scroll Suave */}
            <form onSubmit={handleCreateSource} className="p-4 sm:p-5 overflow-y-auto space-y-4">
              {formError && (
                <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Portal ou Imobiliária <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: SuperCasa, Century21, BPI Expresso"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Endereço URL Base <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: https://www.supercasa.pt"
                  value={newBaseUrl}
                  onChange={(e) => setNewBaseUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  Página principal do site da fonte imobiliária.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Padrão do URL de Pesquisa (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: https://exemplo.pt/comprar/{concelho}"
                  value={newSearchPattern}
                  onChange={(e) => setNewSearchPattern(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  Utiliza <code className="text-emerald-600 dark:text-emerald-400">{'{concelho}'}</code> onde o crawler deve injetar a localização.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Fonte
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as SourceType)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="html">Scraper HTML (Cheerio)</option>
                    <option value="scraper">Crawler Estruturado</option>
                    <option value="api">API REST / JSON</option>
                    <option value="rss">Feed RSS / XML</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Intervalo de Recolha
                  </label>
                  <select
                    value={newInterval}
                    onChange={(e) => setNewInterval(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                  >
                    <option value={12}>Cada 12 Horas (Recomendado)</option>
                    <option value={6}>Cada 6 Horas</option>
                    <option value={24}>Cada 24 Horas (Diário)</option>
                  </select>
                </div>
              </div>

              {/* Explicação do Tipo de Fonte Selecionado */}
              <div className="rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 p-3 flex gap-2.5 items-start">
                <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-[11.5px] leading-relaxed text-blue-700 dark:text-blue-300">
                  {newType === 'html' && (
                    <span><strong>Scraper HTML (Recomendado):</strong> Lê o código da página rapidamente para extrair dados visíveis. Ideal para a grande maioria dos portais e classificados comuns. É o método mais rápido e eficiente.</span>
                  )}
                  {newType === 'scraper' && (
                    <span><strong>Crawler Estruturado:</strong> Simula um browser real. Essencial para sites protegidos contra bots, que carregam anúncios dinamicamente ou que precisam de interações complexas. Mais lento.</span>
                  )}
                  {newType === 'api' && (
                    <span><strong>API REST / JSON:</strong> Conecta-se diretamente aos sistemas da fonte para extrair dados brutos e estruturados. É o método mais fiável, mas raro de encontrar aberto ao público.</span>
                  )}
                  {newType === 'rss' && (
                    <span><strong>Feed RSS / XML:</strong> Lê canais de distribuição oficiais. Ótimo para saber imediatamente quando um novo anúncio é publicado, embora ofereça menos detalhes.</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição ou Notas (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Breve resumo da fonte (ex: agência especializada no Algarve, anúncios de particulares)..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Botões do Rodapé do Modal */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'A registar...' : 'Guardar Fonte'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
