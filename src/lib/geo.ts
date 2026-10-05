import { Property } from '@/types/property';

// Coordenadas de referência de concelhos em Portugal Continental e Ilhas
export const CONCELHO_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Lisboa': { lat: 38.7223, lng: -9.1393 },
  'Sintra': { lat: 38.8029, lng: -9.3817 },
  'Cascais': { lat: 38.6979, lng: -9.4215 },
  'Oeiras': { lat: 38.6969, lng: -9.3146 },
  'Amadora': { lat: 38.7538, lng: -9.2308 },
  'Odivelas': { lat: 38.7954, lng: -9.1852 },
  'Loures': { lat: 38.8315, lng: -9.1678 },
  'Almada': { lat: 38.6804, lng: -9.1585 },
  'Seixal': { lat: 38.6416, lng: -9.1029 },
  'Setúbal': { lat: 38.5244, lng: -8.8882 },
  'Porto': { lat: 41.1579, lng: -8.6291 },
  'Matosinhos': { lat: 41.1824, lng: -8.6896 },
  'Vila Nova de Gaia': { lat: 41.1333, lng: -8.6167 },
  'Maia': { lat: 41.2333, lng: -8.6167 },
  'Gondomar': { lat: 41.1444, lng: -8.5317 },
  'Braga': { lat: 41.5454, lng: -8.4265 },
  'Guimarães': { lat: 41.4425, lng: -8.2918 },
  'Coimbra': { lat: 40.2033, lng: -8.4103 },
  'Aveiro': { lat: 40.6405, lng: -8.6538 },
  'Leiria': { lat: 39.7436, lng: -8.8071 },
  'Faro': { lat: 37.0194, lng: -7.9322 },
  'Portimão': { lat: 37.1386, lng: -8.5378 },
  'Loulé': { lat: 37.1381, lng: -8.0232 },
  'Funchal': { lat: 32.6500, lng: -16.9086 },
  'Ponta Delgada': { lat: 37.7412, lng: -25.6756 },
  'Évora': { lat: 38.5714, lng: -7.9070 },
  'Viseu': { lat: 40.6566, lng: -7.9125 },
  'Viana do Castelo': { lat: 41.6938, lng: -8.8329 },
  'Santarém': { lat: 39.2369, lng: -8.6855 },
  'Vila Franca de Xira': { lat: 38.9553, lng: -8.9896 },
  'Mafra': { lat: 38.9370, lng: -9.3275 },
};

/**
 * Fórmula de Haversine para calcular distância esférica entre dois pontos na Terra em quilómetros.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Arredonda a 1 casa decimal
}

/**
 * Obtém as coordenadas mais precisas de um imóvel (coordenada direta ou coordenada central do concelho).
 */
export function getPropertyCoordinates(property: Property): { lat: number; lng: number } | null {
  if (typeof property.latitude === 'number' && typeof property.longitude === 'number') {
    return { lat: property.latitude, lng: property.longitude };
  }

  // Fallback para coordenadas do concelho
  const concelhoCoord = CONCELHO_COORDINATES[property.concelho];
  if (concelhoCoord) {
    return concelhoCoord;
  }

  // Tentar encontrar por correspondência aproximada
  const key = Object.keys(CONCELHO_COORDINATES).find(
    (k) => k.toLowerCase() === property.concelho.toLowerCase()
  );
  if (key) {
    return CONCELHO_COORDINATES[key];
  }

  return null;
}

/**
 * Filtra e enriquece imóveis calculando a distância relativa ao utilizador.
 */
export function filterAndAttachDistance(
  properties: Property[],
  userLat: number,
  userLng: number,
  radiusKm?: number | null
): Property[] {
  const enriched = properties.map((prop) => {
    const coords = getPropertyCoordinates(prop);
    if (!coords) {
      return { ...prop, distance_km: undefined };
    }
    const distance = calculateDistanceKm(userLat, userLng, coords.lat, coords.lng);
    return { ...prop, distance_km: distance };
  });

  if (radiusKm && radiusKm > 0) {
    return enriched.filter((prop) => typeof prop.distance_km === 'number' && prop.distance_km <= radiusKm);
  }

  return enriched;
}
