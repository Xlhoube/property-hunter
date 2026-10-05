import { PropertySource, NewSourceInput } from '@/types/source';

// Lista inicial de fontes de mercado em Portugal
const INITIAL_SOURCES: PropertySource[] = [
  {
    id: 'src_idealista',
    name: 'Idealista Portugal',
    slug: 'idealista',
    baseUrl: 'https://www.idealista.pt',
    searchUrlPattern: 'https://www.idealista.pt/comprar-casas/{concelho}/',
    enabled: true,
    type: 'scraper',
    intervalHours: 12,
    status: 'active',
    totalScrapedCount: 142,
    lastScrapeAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    description: 'Maior portal imobiliário em Portugal com cobertura nacional detalhada.',
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
    intervalHours: 12,
    status: 'active',
    totalScrapedCount: 289,
    lastScrapeAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    description: 'Portal de referência do grupo OLX com suporte a extração estruturada de dados.',
    iconColor: 'bg-emerald-600 text-white dark:bg-emerald-500',
    isCustom: false,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'src_casasapo',
    name: 'CasaSAPO',
    slug: 'casasapo',
    baseUrl: 'https://casa.sapo.pt',
    searchUrlPattern: 'https://casa.sapo.pt/comprar-apartamentos/{concelho}/',
    enabled: true,
    type: 'html',
    intervalHours: 12,
    status: 'active',
    totalScrapedCount: 97,
    lastScrapeAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    description: 'Pioneiro em Portugal com forte presença de agentes imobiliários e construtores.',
    iconColor: 'bg-blue-600 text-white dark:bg-blue-500',
    isCustom: false,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'src_supercasa',
    name: 'SuperCasa',
    slug: 'supercasa',
    baseUrl: 'https://supercasa.pt',
    searchUrlPattern: 'https://supercasa.pt/comprar-casas/{concelho}',
    enabled: false,
    type: 'html',
    intervalHours: 12,
    status: 'paused',
    totalScrapedCount: 0,
    description: 'Portal imobiliário com listagens profissionais e suporte a filtros de eficiência energética.',
    iconColor: 'bg-purple-600 text-white dark:bg-purple-500',
    isCustom: false,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'src_custojusto',
    name: 'CustoJusto Imobiliário',
    slug: 'custojusto',
    baseUrl: 'https://www.custojusto.pt',
    searchUrlPattern: 'https://www.custojusto.pt/{concelho}/imobiliario',
    enabled: false,
    type: 'html',
    intervalHours: 12,
    status: 'paused',
    totalScrapedCount: 0,
    description: 'Classificados com elevada percentagem de imóveis anunciados diretamente por particulares.',
    iconColor: 'bg-amber-600 text-white dark:bg-amber-500',
    isCustom: false,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'src_era',
    name: 'ERA Portugal',
    slug: 'era',
    baseUrl: 'https://www.era.pt',
    searchUrlPattern: 'https://www.era.pt/imoveis/comprar/{concelho}',
    enabled: false,
    type: 'api',
    intervalHours: 24,
    status: 'paused',
    totalScrapedCount: 0,
    description: 'Rede imobiliária com presença local em todos os concelhos de Portugal.',
    iconColor: 'bg-rose-600 text-white dark:bg-rose-500',
    isCustom: false,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'src_remax',
    name: 'Remax Portugal',
    slug: 'remax',
    baseUrl: 'https://www.remax.pt',
    searchUrlPattern: 'https://www.remax.pt/comprar/{concelho}',
    enabled: false,
    type: 'api',
    intervalHours: 24,
    status: 'paused',
    totalScrapedCount: 0,
    description: 'Maior rede de agências em Portugal com carteira alargada de angariações exclusivas.',
    iconColor: 'bg-red-600 text-white dark:bg-red-500',
    isCustom: false,
    createdAt: '2026-10-01T00:00:00.000Z',
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
