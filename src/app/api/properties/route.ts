import { NextResponse } from 'next/server';
import { fetchPropertiesServer } from '@/lib/server-appwrite';
import { PropertyFilterParams } from '@/types/property';

export async function POST(request: Request) {
  let filters: PropertyFilterParams = {};
  try {
    filters = await request.json();
  } catch (err) {}

  const properties = await fetchPropertiesServer(filters);

  return NextResponse.json({
    success: true,
    total: properties.length,
    properties,
  });
}
