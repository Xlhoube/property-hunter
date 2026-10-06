import { Client, Databases, Query, ID } from 'appwrite';
import { Property, PropertyFilterParams } from '@/types/property';
import { MarketZone, UserAlert } from '@/types/market';
import { INITIAL_PROPERTIES, INITIAL_MARKET_ZONES } from '@/lib/mock-data';
import { filterAndAttachDistance } from '@/lib/geo';

const client = new Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'property-hunter';

if (projectId && projectId !== 'property-hunter') {
  client.setEndpoint(endpoint).setProject(projectId);
}

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'property_hunter_db';
const COLL_PROPERTIES = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROPERTIES || 'properties';
const COLL_MARKET_ZONES = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_MARKET_ZONES || 'market_zones';
const COLL_PRICE_HISTORY = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PRICE_HISTORY || 'price_history';
const COLL_USER_ALERTS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_ALERTS || 'user_alerts';

let memoryProperties: Property[] = [...INITIAL_PROPERTIES];
let memoryZones: MarketZone[] = [...INITIAL_MARKET_ZONES];
let memoryAlerts: UserAlert[] = [];

export async function fetchProperties(filters?: PropertyFilterParams): Promise<Property[]> {
  try {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID && process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID !== 'property-hunter') {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters || {})
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.properties) {
          return json.properties;
        }
      }
    }
  } catch (err) {
    console.warn('API de propriedades nao disponivel. A recorrer ao motor local:', err);
  }

  let result = [...memoryProperties];

  if (filters?.searchQuery) {
    const q = filters.searchQuery.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.freguesia.toLowerCase().includes(q) ||
        p.concelho.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  if (filters?.concelho && filters.concelho !== 'Todos') {
    result = result.filter((p) => p.concelho.toLowerCase() === filters.concelho?.toLowerCase());
  }

  if (filters?.typologies && filters.typologies.length > 0) {
    result = result.filter((p) => filters.typologies!.includes(p.typology));
  }

  if (filters?.condition && filters.condition !== 'Todas') {
    result = result.filter((p) => p.condition === filters.condition);
  }

  if (filters?.opportunity && filters.opportunity !== 'Todas') {
    result = result.filter((p) => p.opportunity_rating === filters.opportunity);
  }

  if (filters?.priceChangeOnly) {
    result = result.filter((p) => p.price_change_type === 'drop');
  }

  if (filters?.minPrice) {
    result = result.filter((p) => p.price >= filters.minPrice!);
  }

  if (filters?.maxPrice) {
    result = result.filter((p) => p.price <= filters.maxPrice!);
  }

  if (filters?.minArea) {
    result = result.filter((p) => p.area_m2 >= filters.minArea!);
  }

  if (filters?.maxArea) {
    result = result.filter((p) => p.area_m2 <= filters.maxArea!);
  }

  if (filters?.maxPriceM2) {
    result = result.filter((p) => p.price_m2 <= filters.maxPriceM2!);
  }

  // Filtragem e enriquecimento por raio de distância geográfica
  if (filters?.userLocation && typeof filters.userLocation.lat === 'number' && typeof filters.userLocation.lng === 'number') {
    result = filterAndAttachDistance(
      result,
      filters.userLocation.lat,
      filters.userLocation.lng,
      filters.radiusKm
    );
  }

  switch (filters?.sortBy) {
    case 'distance_asc':
      result.sort((a, b) => (a.distance_km ?? 999999) - (b.distance_km ?? 999999));
      break;
    case 'opportunity_best':
      result.sort((a, b) => a.price_deviation_pct - b.price_deviation_pct);
      break;
    case 'price_asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'price_m2_asc':
      result.sort((a, b) => a.price_m2 - b.price_m2);
      break;
    case 'newest':
    default:
      result.sort((a, b) => new Date(b.last_scraped_at).getTime() - new Date(a.last_scraped_at).getTime());
      break;
  }

  return result;
}

export async function fetchMarketZones(): Promise<MarketZone[]> {
  try {
    if (process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID && process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID !== 'property-hunter') {
      const response = await databases.listDocuments(DATABASE_ID, COLL_MARKET_ZONES, [Query.limit(100)]);
      if (response) {
        return response.documents as unknown as MarketZone[];
      }
    }
  } catch (err) {
    console.warn('Appwrite market zones fallback:', err);
  }
  return memoryZones;
}

export async function createAlert(alertData: Omit<UserAlert, 'id' | 'created_at'>): Promise<UserAlert> {
  const newAlert: UserAlert = {
    ...alertData,
    id: 'alt_' + Date.now(),
    created_at: new Date().toISOString(),
  };

  try {
    if (process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID && process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID !== 'property-hunter') {
      const res = await databases.createDocument(DATABASE_ID, COLL_USER_ALERTS, ID.unique(), newAlert);
      return res as unknown as UserAlert;
    }
  } catch (err) {
    console.warn('Appwrite create alert fallback:', err);
  }

  memoryAlerts.push(newAlert);
  return newAlert;
}

export async function fetchActiveAlerts(): Promise<UserAlert[]> {
  try {
    if (process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID && process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID !== 'property-hunter') {
      const response = await databases.listDocuments(DATABASE_ID, COLL_USER_ALERTS, [
        Query.equal('is_active', true),
        Query.limit(100),
      ]);
      if (response) {
        return response.documents as unknown as UserAlert[];
      }
    }
  } catch (err) {
    console.warn('Appwrite fetchActiveAlerts fallback:', err);
  }
  return memoryAlerts.filter((a) => a.is_active);
}

export function addOrUpdatePropertyInMemory(property: Property): Property {
  const idx = memoryProperties.findIndex((p) => p.source_id === property.source_id || p.id === property.id);
  if (idx >= 0) {
    memoryProperties[idx] = property;
  } else {
    memoryProperties.unshift(property);
  }
  return property;
}

export { client, databases };

