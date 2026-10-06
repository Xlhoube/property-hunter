import { Property } from '@/types/property';

/**
 * Resolve o URL canónico e funcional para abrir a página do imóvel ou a pesquisa correspondente
 * no portal imobiliário oficial (Idealista, Imovirtual, Casa SAPO, CustoJusto, etc.).
 *
 * Evita erros 404 e bloqueios de IDs fictícios de teste, garantindo que o utilizador
 * visualiza sempre imóveis reais no portal correspondente.
 */
export function getSafePortalUrl(property: Property): string {
  if (!property) return 'https://www.idealista.pt';

  const portal = (property.source_portal || '').toLowerCase();
  const concelho = encodeURIComponent(
    property.concelho?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-') || 'portugal'
  );
  const freguesia = encodeURIComponent(
    property.freguesia?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-') || ''
  );
  const tipologia = property.typology?.toLowerCase() || '';

  // Se já for um URL real e não um id mock fictício inventado (/imovel/98471203/):
  const isMockUrl =
    property.original_url &&
    (property.original_url.includes('98471203') ||
      property.original_url.includes('88123910') ||
      property.original_url.includes('49019234') ||
      property.original_url.includes('55102931') ||
      property.original_url.includes('11029381') ||
      property.original_url.includes('77491029') ||
      property.original_url.includes('22910482') ||
      property.original_url.includes('99018231') ||
      property.original_url.includes('33019284') ||
      property.original_url.includes('12093847'));

  if (property.original_url && !isMockUrl) {
    return property.original_url;
  }

  // Mapeamento de rotas de pesquisa reais por portal
  if (portal.includes('idealista')) {
    const topoPath = freguesia ? `${concelho}/${freguesia}` : concelho;
    const tipoFiltro = tipologia.startsWith('t') ? `com-${tipologia}/` : '';
    return `https://www.idealista.pt/comprar-casas/${topoPath}/${tipoFiltro}`;
  }

  if (portal.includes('imovirtual')) {
    const tipo = tipologia.includes('moradia') ? 'moradia' : 'apartamento';
    return `https://www.imovirtual.com/pt/anuncios/comprar/${tipo}/${concelho}`;
  }

  if (portal.includes('sapo')) {
    const tipo = tipologia.includes('moradia') ? 'comprar-moradias' : 'comprar-apartamentos';
    return `https://casa.sapo.pt/${tipo}/${concelho}/`;
  }

  if (portal.includes('custojusto')) {
    return `https://www.custojusto.pt/${concelho}/imobiliario`;
  }

  return property.original_url || `https://www.idealista.pt/comprar-casas/${concelho}/`;
}
