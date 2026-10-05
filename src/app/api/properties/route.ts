import { NextResponse } from 'next/server';
import { fetchProperties } from '@/lib/appwrite';
import { PropertyFilterParams } from '@/types/property';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const filters: PropertyFilterParams = {
    searchQuery: searchParams.get('q') || undefined,
    concelho: searchParams.get('concelho') || undefined,
    opportunity: (searchParams.get('opportunity') as any) || undefined,
    priceChangeOnly: searchParams.get('priceChangeOnly') === 'true',
    sortBy: (searchParams.get('sortBy') as any) || undefined,
  };

  const properties = await fetchProperties(filters);

  return NextResponse.json({
    success: true,
    total: properties.length,
    properties,
  });
}
