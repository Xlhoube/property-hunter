import { NextRequest, NextResponse } from 'next/server';
import { testSourceUrl } from '@/lib/source-service';

// POST /api/sources/test - Testar ligação a um URL de portal
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ success: false, error: 'O URL é obrigatório' }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ success: false, error: 'URL inválido' }, { status: 400 });
    }

    const result = await testSourceUrl(url);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao testar URL';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
