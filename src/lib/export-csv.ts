import { Property } from '@/types/property';

/**
 * Utilitário de exportação de dados imobiliários para CSV compatível com Excel/Google Sheets.
 * Utiliza o prefixo UTF-8 BOM (\uFEFF) para garantir que caracteres com acentos (ex: freguesia, moradia, €)
 * sejam abertos sem problemas de codificação no Microsoft Excel em Portugal.
 */
export function exportPropertiesToCSV(properties: Property[], filenamePrefix = 'dossie-oportunidades-imoveis'): void {
  if (!properties || properties.length === 0) {
    alert('Não existem imóveis para exportar com os filtros selecionados.');
    return;
  }

  const headers = [
    'ID',
    'Título',
    'Concelho',
    'Freguesia',
    'Tipologia',
    'Preço (€)',
    'Preço Anterior (€)',
    'Variação de Preço (%)',
    'Área Bruta (m²)',
    'Preço por m² (€/m²)',
    'Desvio face à Freguesia (%)',
    'Distância Estimada (km)',
    'Avaliação de Mercado',
    'Estado / Condição',
    'Portal de Origem',
    'Data de Registo',
    'Link Original do Anúncio',
  ];

  const escapeCSV = (value: string | number | undefined | null): string => {
    if (value === undefined || value === null) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = properties.map((prop) => {
    const opportunityLabel =
      prop.opportunity_rating === 'good'
        ? 'Bom Preço (Oportunidade)'
        : prop.opportunity_rating === 'fair'
        ? 'Dentro da Média'
        : 'Acima do Mercado';

    return [
      escapeCSV(prop.id),
      escapeCSV(prop.title),
      escapeCSV(prop.concelho),
      escapeCSV(prop.freguesia || '-'),
      escapeCSV(prop.typology),
      escapeCSV(prop.price),
      escapeCSV(prop.previous_price || prop.price),
      escapeCSV(prop.price_change_pct ? `${prop.price_change_type === 'drop' ? '-' : '+'}${prop.price_change_pct}%` : 'Sem alteração'),
      escapeCSV(prop.area_m2),
      escapeCSV(prop.price_m2),
      escapeCSV(`${prop.price_deviation_pct > 0 ? '+' : ''}${prop.price_deviation_pct}%`),
      escapeCSV(typeof prop.distance_km === 'number' ? `${prop.distance_km} km` : '-'),
      escapeCSV(opportunityLabel),
      escapeCSV(prop.condition),
      escapeCSV(prop.source_portal.toUpperCase()),
      escapeCSV(new Date(prop.created_at).toLocaleDateString('pt-PT')),
      escapeCSV(prop.original_url),
    ].join(';');
  });

  // Delimitador ponto-e-vírgula (;) é o padrão regional oficial de Portugal / Europa para o Excel
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}-${dateStr}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
