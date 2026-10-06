import { NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';

export async function GET() {
  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
      .setKey(process.env.APPWRITE_API_KEY || '');

    const databases = new Databases(client);

    const res = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'property_hunter_db',
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROPERTIES || 'properties',
      [Query.limit(10)]
    );

    return NextResponse.json({ success: true, total: res.total, docs: res.documents.length });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, stack: err.stack });
  }
}
