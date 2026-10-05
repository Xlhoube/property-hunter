import { NextResponse } from 'next/server';
import { runHourlyScraper } from '@/lib/scraper-service';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }
  }

  try {
    const result = await runHourlyScraper();
    return NextResponse.json({
      success: true,
      message: 'Prospeccao horaria concluida com sucesso.',
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Erro durante a prospeccao horaria',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
