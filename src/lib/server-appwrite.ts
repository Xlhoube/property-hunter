import { Client, Databases, Query, ID } from 'node-appwrite';
import { Property, PropertyFilterParams } from '@/types/property';
import { filterAndAttachDistance } from '@/lib/geo';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'property-hunter';
const apiKey = process.env.APPWRITE_API_KEY || '';

const client = new Client();
if (projectId && projectId !== 'property-hunter') {
  client.setEndpoint(endpoint).setProject(projectId);
  if (apiKey) {
    client.setKey(apiKey);
  }
}

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'property_hunter_db';
const COLL_PROPERTIES = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROPERTIES || 'properties';

export async function addOrUpdatePropertyServer(property: Property): Promise<Property> {
  try {
    if (projectId && projectId !== 'property-hunter' && apiKey) {
      const existing = await databases.listDocuments(DATABASE_ID, COLL_PROPERTIES, [
        Query.equal('source_id', property.source_id),
        Query.limit(1)
      ]);
      
      const payload: any = { ...property };
      delete payload.price_history;
      delete payload.id;
      delete payload.distance_km;
      delete payload.gallery;
      
      if (existing && existing.documents.length > 0) {
        await databases.updateDocument(DATABASE_ID, COLL_PROPERTIES, existing.documents[0].$id, payload);
      } else {
        await databases.createDocument(DATABASE_ID, COLL_PROPERTIES, ID.unique(), payload);
      }
    }
  } catch (err) {
    console.warn('Erro ao guardar imóvel na Appwrite (Server):', err);
  }
  return property;
}

export async function fetchPropertiesServer(filters?: PropertyFilterParams): Promise<Property[]> {
  let result: Property[] = [];
  try {
    if (projectId && projectId !== 'property-hunter' && apiKey) {
      const queries: any[] = [Query.limit(100), Query.orderDesc('last_scraped_at')];

      // Filtros exatos que a Cloud suporta via Queries
      if (filters?.concelho && filters.concelho !== 'Todos') {
        queries.push(Query.equal('concelho', filters.concelho));
      }
      if (filters?.condition && filters.condition !== 'Todas') {
        queries.push(Query.equal('condition', filters.condition));
      }
      if (filters?.opportunity && filters.opportunity !== 'Todas') {
        queries.push(Query.equal('opportunity_rating', filters.opportunity));
      }

      const response = await databases.listDocuments(DATABASE_ID, COLL_PROPERTIES, queries);
      if (response) {
        result = response.documents as unknown as Property[];
      }
    }
  } catch (err) {
    console.warn('Erro ao ler propriedades na Appwrite (Server):', err);
  }

  // Filtragem local (Textual, Arrays, Preços e Áreas) que não puderam ser enviados via Appwrite Query
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

  if (filters?.typologies && filters.typologies.length > 0) {
    result = result.filter((p) => filters.typologies!.includes(p.typology));
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

  // Ordenação final
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
