import { Client, Databases, Query, ID } from 'node-appwrite';
import { Property } from '@/types/property';

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
        await databases.createDocument(DATABASE_ID, COLL_PROPERTIES, property.id || ID.unique(), payload);
      }
    }
  } catch (err) {
    console.warn('Erro ao guardar imóvel na Appwrite (Server):', err);
  }
  return property;
}
