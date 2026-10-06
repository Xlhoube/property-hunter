import { NextResponse } from 'next/server';
import { runHourlyScraper } from '@/lib/scraper-service';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  // Se existir um cabeçalho de autorização (como o enviado pelo Vercel Cron), validamos.
  // Caso contrário, permitimos a execução manual (via botão da UI / POST) para não bloquear o utilizador.
  if (process.env.CRON_SECRET && authHeader) {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }
  }
  let targetConcelho: string | undefined = undefined;
  
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      if (body && body.concelho) targetConcelho = body.concelho;
    } catch (e) {}
  } else {
    const { searchParams } = new URL(request.url);
    targetConcelho = searchParams.get('concelho') || undefined;
  }

  try {
    const result = await runHourlyScraper(targetConcelho);
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
