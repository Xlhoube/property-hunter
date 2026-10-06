import { PropertySource, NewSourceInput } from '@/types/source';

// Base comum para fontes nativas pausadas por defeito
const NATIVE_DEFAULTS = {
  enabled: false,
  status: 'paused' as const,
  totalScrapedCount: 0,
  isCustom: false,
  createdAt: '2026-10-01T00:00:00.000Z',
};

// Catálogo de fontes de mercado em Portugal, agrupado por categoria
const INITIAL_SOURCES: PropertySource[] = [
  // 1. Portais Agregadores
  {
    id: 'src_idealista',
    name: 'Idealista Portugal',
    slug: 'idealista',
    baseUrl: 'https://www.idealista.pt',
    searchUrlPattern: 'https://www.idealista.pt/comprar-casas/{concelho}/',
    enabled: true,
    type: 'scraper',
    category: 'portal',
    intervalHours: 12,
    status: 'active',
    totalScrapedCount: 142,
    lastScrapeAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    description: 'Líder em tráfego e volume de pesquisa em Portugal, com estimativa de preços e forte procura internacional.',
    iconColor: 'bg-lime-500 text-lime-950 dark:bg-lime-400 dark:text-lime-950',
    isCustom: false,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'src_imovirtual',
    name: 'Imovirtual',
    slug: 'imovirtual',
    baseUrl: 'https://www.imovirtual.com',
    searchUrlPattern: 'https://www.imovirtual.com/pt/resultados/comprar/apartamento/{concelho}',
    enabled: true,
    type: 'scraper',
    category: 'portal',
    intervalHours: 12,
    status: 'active',
    totalScrapedCount: 289,
    lastScrapeAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    description: 'Grupo OLX, base massiva de imóveis com visibilidade cruzada no OLX e bons filtros de comparação.',
    iconColor: 'bg-emerald-600 text-white dark:bg-emerald-500',
    isCustom: false,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'src_supercasa',
    name: 'SuperCasa',
    slug: 'supercasa',
    baseUrl: 'https://supercasa.pt',
    searchUrlPattern: 'https://supercasa.pt/comprar-casas/{concelho}',
    type: 'html',
    category: 'portal',
    intervalHours: 12,
    description: 'Integrado com CRMs imobiliários, garante actualização muito rápida de novas oportunidades.',
    iconColor: 'bg-purple-600 text-white dark:bg-purple-500',
    ...NATIVE_DEFAULTS,
  },
  {
    id: 'src_casasapo',
    name: 'CasaSAPO',
    slug: 'casasapo',
    baseUrl: 'https://casa.sapo.pt',
    searchUrlPattern: 'https://casa.sapo.pt/comprar-apartamentos/{concelho}/',
    enabled: true,
    type: 'html',
    category: 'portal',
    intervalHours: 12,
    status: 'active',
    totalScrapedCount: 97,
    lastScrapeAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    description: 'Um dos portais mais antigos, útil para histórico de anúncios e cobertura fora dos grandes centros.',
    iconColor: 'bg-blue-600 text-white dark:bg-blue-500',
    isCustom: false,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'src_bpi_expresso',
    name: 'BPI Expresso Imobiliário',
    slug: 'bpi-expresso',
    baseUrl: 'https://bpiexpressoimobiliario.pt',
    searchUrlPattern: 'https://bpiexpressoimobiliario.pt/comprar/casas/{concelho}',
    type: 'html',
    category: 'portal',
    intervalHours: 24,
    description: 'Parceria Expresso + BPI, ideal para imóveis de média/alta gama e activos da banca.',
    iconColor: 'bg-orange-600 text-white dark:bg-orange-500',
    ...NATIVE_DEFAULTS,
  },

  // 2. Redes de Mediação
  {
    id: 'src_remax',
    name: 'RE/MAX Portugal',
    slug: 'remax',
    baseUrl: 'https://www.remax.pt',
    searchUrlPattern: 'https://www.remax.pt/comprar/{concelho}',
    type: 'api',
    category: 'rede',
    intervalHours: 24,
    description: 'Rede com maior quota de mercado e maior número de agências e consultores no país.',
    iconColor: 'bg-red-600 text-white dark:bg-red-500',
    ...NATIVE_DEFAULTS,
  },
  {
    id: 'src_century21',
    name: 'Century 21 Portugal',
    slug: 'century21',
    baseUrl: 'https://www.century21.pt',
    searchUrlPattern: 'https://www.century21.pt/comprar/?q={concelho}',
    type: 'html',
    category: 'rede',
    intervalHours: 24,
    description: 'Rede global com forte presença nacional e ferramentas de acompanhamento ao cliente.',
    iconColor: 'bg-yellow-500 text-yellow-950 dark:bg-yellow-400',
    ...NATIVE_DEFAULTS,
  },
  {
    id: 'src_kw',
    name: 'Keller Williams (KW)',
    slug: 'kw',
    baseUrl: 'https://www.kwportugal.pt',
    searchUrlPattern: 'https://www.kwportugal.pt/imoveis?localizacao={concelho}',
    type: 'html',
    category: 'rede',
    intervalHours: 24,
    description: 'Modelo de agenciamento colaborativo em crescimento exponencial em Portugal.',
    iconColor: 'bg-rose-700 text-white dark:bg-rose-600',
    ...NATIVE_DEFAULTS,
  },
  {
    id: 'src_era',
    name: 'ERA Portugal',
    slug: 'era',
    baseUrl: 'https://www.era.pt',
    searchUrlPattern: 'https://www.era.pt/imoveis/comprar/{concelho}',
    type: 'api',
    category: 'rede',
    intervalHours: 24,
    description: 'Marca muito enraizada, dezenas de agências e divulgação standardizada de imóveis.',
    iconColor: 'bg-rose-600 text-white dark:bg-rose-500',
    ...NATIVE_DEFAULTS,
  },

  // 3. Classificados
  {
    id: 'src_olx',
    name: 'OLX Imóveis',
    slug: 'olx',
    baseUrl: 'https://www.olx.pt',
    searchUrlPattern: 'https://www.olx.pt/imoveis/casas-moradias-para-arrendar-vender/{concelho}/',
    type: 'html',
    category: 'classificados',
    intervalHours: 12,
    description: 'Muito usado por particulares que querem vender sem comissões de agência.',
    iconColor: 'bg-teal-600 text-white dark:bg-teal-500',
    ...NATIVE_DEFAULTS,
  },
  {
    id: 'src_custojusto',
    name: 'CustoJusto Imobiliário',
    slug: 'custojusto',
    baseUrl: 'https://www.custojusto.pt',
    searchUrlPattern: 'https://www.custojusto.pt/{concelho}/imobiliario',
    type: 'html',
    category: 'classificados',
    intervalHours: 12,
    description: 'Classificados com elevada percentagem de imóveis anunciados directamente por particulares.',
    iconColor: 'bg-amber-600 text-white dark:bg-amber-500',
    ...NATIVE_DEFAULTS,
  },

  // 4. Dados de Mercado, Leilões e Oportunidades Especiais
  {
    id: 'src_casafari',
    name: 'CASAFARI',
    slug: 'casafari',
    baseUrl: 'https://www.casafari.com',
    searchUrlPattern: 'https://www.casafari.com/pt/',
    type: 'api',
    category: 'dados',
    intervalHours: 24,
    description: 'Proptech de cruzamento de dados: histórico de preços e detecção de oportunidades abaixo da média (requer conta).',
    iconColor: 'bg-sky-600 text-white dark:bg-sky-500',
    ...NATIVE_DEFAULTS,
  },
  {
    id: 'src_financas',
    name: 'Portal das Finanças (Vendas)',
    slug: 'financas-vendas',
    baseUrl: 'https://www.e-financas.gov.pt/vendas/',
    searchUrlPattern: 'https://www.e-financas.gov.pt/vendas/consultaVendas.action',
    type: 'html',
    category: 'dados',
    intervalHours: 24,
    description: 'Leilões e vendas directas de imóveis penhorados pela Autoridade Tributária.',
    iconColor: 'bg-green-700 text-white dark:bg-green-600',
    ...NATIVE_DEFAULTS,
  },
  {
    id: 'src_eleiloes',
    name: 'e-Leilões',
    slug: 'e-leiloes',
    baseUrl: 'https://www.e-leiloes.pt',
    searchUrlPattern: 'https://www.e-leiloes.pt/pesquisa?tipo=1&texto={concelho}',
    type: 'html',
    category: 'dados',
    intervalHours: 24,
    description: 'Plataforma oficial da Ordem dos Solicitadores para leilões de imóveis em processos judiciais.',
    iconColor: 'bg-indigo-700 text-white dark:bg-indigo-600',
    ...NATIVE_DEFAULTS,
  },
  {
    id: 'src_citius',
    name: 'Portal Citius (Anúncios)',
    slug: 'citius',
    baseUrl: 'https://www.citius.mj.pt',
    searchUrlPattern: 'https://www.citius.mj.pt/portal/consultas/ConsultasVenda.aspx',
    type: 'html',
    category: 'dados',
    intervalHours: 24,
    description: 'Ministério da Justiça: anúncios de venda de bens em processos de insolvência e execução.',
    iconColor: 'bg-slate-700 text-white dark:bg-slate-600',
    ...NATIVE_DEFAULTS,
  },
];

// Armazenamento em memória do servidor com persistência de sessão
let inMemorySources: PropertySource[] = [...INITIAL_SOURCES];

export async function getAllSources(): Promise<PropertySource[]> {
  return inMemorySources;
}

export async function getActiveSources(): Promise<PropertySource[]> {
  return inMemorySources.filter((s) => s.enabled);
}

export async function toggleSource(id: string, enabled: boolean): Promise<PropertySource | null> {
  const index = inMemorySources.findIndex((s) => s.id === id);
  if (index === -1) return null;

  inMemorySources[index] = {
    ...inMemorySources[index],
    enabled,
    status: enabled ? 'active' : 'paused',
  };

  return inMemorySources[index];
}

export async function updateSourceInterval(id: string, intervalHours: number): Promise<PropertySource | null> {
  const index = inMemorySources.findIndex((s) => s.id === id);
  if (index === -1) return null;

  inMemorySources[index] = {
    ...inMemorySources[index],
    intervalHours,
  };

  return inMemorySources[index];
}

export async function addCustomSource(input: NewSourceInput): Promise<PropertySource> {
  const slug = input.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  // Cores dinâmicas para fontes personalizadas
  const customColors = [
    'bg-indigo-600 text-white dark:bg-indigo-500',
    'bg-teal-600 text-white dark:bg-teal-500',
    'bg-violet-600 text-white dark:bg-violet-500',
    'bg-sky-600 text-white dark:bg-sky-500',
    'bg-pink-600 text-white dark:bg-pink-500',
  ];
  const color = customColors[Math.floor(Math.random() * customColors.length)];

  const newSource: PropertySource = {
    id: 'src_custom_' + Date.now(),
    name: input.name.trim(),
    slug: slug || 'fonte-personalizada',
    baseUrl: input.baseUrl.trim(),
    searchUrlPattern: input.searchUrlPattern.trim(),
    enabled: true,
    type: input.type,
    intervalHours: input.intervalHours || 12,
    status: 'active',
    totalScrapedCount: 0,
    description: input.description?.trim() || 'Fonte de pesquisa personalizada adicionada pelo utilizador.',
    iconColor: color,
    isCustom: true,
    createdAt: new Date().toISOString(),
  };

  inMemorySources = [newSource, ...inMemorySources];
  return newSource;
}

export async function deleteSource(id: string): Promise<boolean> {
  const source = inMemorySources.find((s) => s.id === id);
  if (!source) return false;

  // Apenas fontes personalizadas podem ser eliminadas permanentemente;
  // Fontes nativas são apenas desativadas (toggle)
  if (!source.isCustom) {
    source.enabled = false;
    source.status = 'paused';
    return true;
  }

  inMemorySources = inMemorySources.filter((s) => s.id !== id);
  return true;
}

export async function testSourceUrl(url: string): Promise<{ success: boolean; latencyMs: number; statusText: string }> {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 PropertyHunterBot/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const latencyMs = Date.now() - startTime;

    return {
      success: response.status < 400 || response.status === 403, // 403 ainda indica que o servidor existe e respondeu
      latencyMs,
      statusText: `HTTP ${response.status} (${latencyMs}ms)`,
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    const msg = err instanceof Error ? err.message : 'Falha na ligação';
    return {
      success: false,
      latencyMs,
      statusText: `Erro: ${msg}`,
    };
  }
}
