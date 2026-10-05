import { NextRequest, NextResponse } from 'next/server';
import { dispatchPropertyNotification } from '@/lib/notification-service';
import { INITIAL_PROPERTIES } from '@/lib/mock-data';
import { Property } from '@/types/property';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channel, destination, concelho } = body;

    if (!channel || !destination) {
      return NextResponse.json(
        { error: 'Faltam parâmetros obrigatórios: canal e destino.' },
        { status: 400 }
      );
    }

    // Seleciona um imóvel de exemplo ou o primeiro do concelho solicitado
    const sampleProperty: Property =
      INITIAL_PROPERTIES.find(
        (p: Property) =>
          !concelho || concelho === 'Todos' || p.concelho.toLowerCase() === concelho.toLowerCase()
      ) || INITIAL_PROPERTIES[0];

    const result = await dispatchPropertyNotification({
      channel,
      destination,
      property: sampleProperty,
      alertReason: 'manual_test',
    });

    return NextResponse.json({
      success: result.success,
      result,
      message: result.success
        ? result.simulated
          ? 'Alerta simulado com sucesso (adiciona TELEGRAM_BOT_TOKEN ao ficheiro .env.local para envio real na API).'
          : 'Notificação enviada com sucesso para o teu canal!'
        : `Erro ao enviar notificação: ${result.error}`,
    });
  } catch (err: unknown) {
    console.error('Erro na rota de teste de alerta:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
