import { NextResponse } from 'next/server';

// Tabela de coordenadas de referência dos principais concelhos em Portugal para fallback offline imediato
const CONCELHO_COORDINATES: { name: string; lat: number; lng: number }[] = [
  { name: 'Lisboa', lat: 38.7223, lng: -9.1393 },
  { name: 'Sintra', lat: 38.8029, lng: -9.3817 },
  { name: 'Cascais', lat: 38.6979, lng: -9.4215 },
  { name: 'Oeiras', lat: 38.6969, lng: -9.3146 },
  { name: 'Amadora', lat: 38.7538, lng: -9.2308 },
  { name: 'Odivelas', lat: 38.7954, lng: -9.1852 },
  { name: 'Loures', lat: 38.8315, lng: -9.1678 },
  { name: 'Almada', lat: 38.6804, lng: -9.1585 },
  { name: 'Seixal', lat: 38.6416, lng: -9.1029 },
  { name: 'Setúbal', lat: 38.5244, lng: -8.8882 },
  { name: 'Porto', lat: 41.1579, lng: -8.6291 },
  { name: 'Matosinhos', lat: 41.1824, lng: -8.6896 },
  { name: 'Vila Nova de Gaia', lat: 41.1333, lng: -8.6167 },
  { name: 'Maia', lat: 41.2333, lng: -8.6167 },
  { name: 'Gondomar', lat: 41.1444, lng: -8.5317 },
  { name: 'Braga', lat: 41.5454, lng: -8.4265 },
  { name: 'Guimarães', lat: 41.4425, lng: -8.2918 },
  { name: 'Coimbra', lat: 40.2033, lng: -8.4103 },
  { name: 'Aveiro', lat: 40.6405, lng: -8.6538 },
  { name: 'Leiria', lat: 39.7436, lng: -8.8071 },
  { name: 'Faro', lat: 37.0194, lng: -7.9322 },
  { name: 'Portimão', lat: 37.1386, lng: -8.5378 },
  { name: 'Loulé', lat: 37.1381, lng: -8.0232 },
  { name: 'Funchal', lat: 32.6500, lng: -16.9086 },
  { name: 'Ponta Delgada', lat: 37.7412, lng: -25.6756 },
];

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
  return R * c;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || '');

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { success: false, error: 'Coordenadas lat e lng são obrigatórias.' },
      { status: 400 }
    );
  }

  // 1. Tentar reverse geocoding via OpenStreetMap Nominatim
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1`;
    const res = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'PropertyHunterPortugal/1.0 (antigravity-property-crawler)',
        'Accept-Language': 'pt-PT,pt;q=0.9',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      // Procurar o concelho / município na resposta
      const detectedConcelho =
        addr.municipality ||
        addr.city ||
        addr.town ||
        addr.county ||
        addr.village ||
        addr.city_district ||
        addr.state_district;

      if (detectedConcelho) {
        return NextResponse.json({
          success: true,
          concelho: detectedConcelho,
          freguesia: addr.suburb || addr.quarter || addr.neighbourhood || addr.village,
          display_name: data.display_name,
          source: 'nominatim',
        });
      }
    }
  } catch (err) {
    console.warn('[Geocode API] Falha na consulta Nominatim, a utilizar fallback por coordenadas:', err);
  }

  // 2. Fallback por proximidade matemática aos concelhos portugueses
  let closest = CONCELHO_COORDINATES[0];
  let minDistance = calculateDistanceKm(lat, lng, closest.lat, closest.lng);

  for (const item of CONCELHO_COORDINATES) {
    const d = calculateDistanceKm(lat, lng, item.lat, item.lng);
    if (d < minDistance) {
      minDistance = d;
      closest = item;
    }
  }

  return NextResponse.json({
    success: true,
    concelho: closest.name,
    distance_km: Math.round(minDistance * 10) / 10,
    source: 'proximity_fallback',
  });
}
