import { NextResponse } from 'next/server';
import { fetchMarketZones } from '@/lib/appwrite';

export async function GET() {
  const zones = await fetchMarketZones();
  return NextResponse.json({
    success: true,
    total: zones.length,
    zones,
  });
}
