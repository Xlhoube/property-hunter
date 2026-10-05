import { Property } from '@/types/property';

export interface NotificationPayload {
  channel: 'telegram' | 'discord' | 'email' | 'in_app';
  destination: string; // Chat ID do Telegram, URL do Webhook do Discord, ou Email
  property: Property;
  alertReason?: 'new_opportunity' | 'price_drop' | 'manual_test';
}



export interface NotificationResult {
  success: boolean;
  channel: string;
  destination: string;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

/**
 * Envia notificação formatada para Discord Webhook
 */
export async function sendDiscordNotification(
  webhookUrl: string,
  property: Property,
  reason: 'new_opportunity' | 'price_drop' | 'manual_test' = 'new_opportunity'
): Promise<NotificationResult> {
  const isDrop = reason === 'price_drop' || property.price_change_type === 'drop';
  const isGood = property.opportunity_rating === 'good';

  // Cores em decimal: Verde Esmeralda (1096065), Laranja/Âmbar (16096779), Vermelho (15682884)
  const embedColor = isDrop ? 15682884 : isGood ? 1096065 : 16096779;
  const tagTitle = isDrop
    ? `📉 DESCIDA DE PREÇO: -${property.price_change_pct || 0}%`
    : isGood
    ? '🟢 GRANDE OPORTUNIDADE (Abaixo da Média)'
    : '🏠 NOVO IMÓVEL DETECTADO';

  const embed = {
    title: `${tagTitle} — ${property.title}`,
    url: property.original_url,
    description: property.description ? property.description.slice(0, 180) + '...' : undefined,
    color: embedColor,
    fields: [
      {
        name: '💰 Preço Actual',
        value: `**${property.price.toLocaleString('pt-PT')} €**${
          property.previous_price
            ? ` *(era ${property.previous_price.toLocaleString('pt-PT')} €)*`
            : ''
        }`,
        inline: true,
      },
      {
        name: '📐 Área & €/m²',
        value: `${property.area_m2} m² • **${property.price_m2.toLocaleString('pt-PT')} €/m²**`,
        inline: true,
      },
      {
        name: '📊 Desvio de Mercado',
        value: `${property.price_deviation_pct > 0 ? '+' : ''}${property.price_deviation_pct}% vs média (${property.zone_avg_price_m2} €/m²)`,
        inline: true,
      },
      {
        name: '📍 Localização',
        value: `${property.freguesia}, ${property.concelho} (${property.district})`,
        inline: true,
      },
      {
        name: '🏷️ Tipologia & Estado',
        value: `${property.typology} • ${property.condition}`,
        inline: true,
      },
      {
        name: '🌐 Portal de Origem',
        value: `[Ver no ${property.source_portal}](${property.original_url})`,
        inline: true,
      },
    ],
    image: property.cover_image ? { url: property.cover_image } : undefined,
    footer: {
      text: 'Property Hunter • Prospecção Imobiliária em Portugal',
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Property Hunter Bot',
        avatar_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=128&q=80',
        content: `🚨 **Alerta de Oportunidade Imobiliária em ${property.concelho}**`,
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        channel: 'discord',
        destination: webhookUrl,
        error: `HTTP ${response.status}: ${errText}`,
      };
    }

    return {
      success: true,
      channel: 'discord',
      destination: webhookUrl,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      channel: 'discord',
      destination: webhookUrl,
      error: errorMsg,
    };
  }
}

/**
 * Envia notificação formatada para Telegram (Bot API)
 */
export async function sendTelegramNotification(
  chatIdOrWebhook: string,
  property: Property,
  reason: 'new_opportunity' | 'price_drop' | 'manual_test' = 'new_opportunity'
): Promise<NotificationResult> {
  const isDrop = reason === 'price_drop' || property.price_change_type === 'drop';
  const isGood = property.opportunity_rating === 'good';

  const badge = isDrop
    ? `📉 <b>DESCIDA DE PREÇO: -${property.price_change_pct || 0}%</b>`
    : isGood
    ? '🟢 <b>OPORTUNIDADE ABAIXO DA MÉDIA</b>'
    : '🏠 <b>NOVO IMÓVEL DETECTADO</b>';

  const messageText = `
${badge}

<b>${property.title}</b>

💰 <b>Preço:</b> ${property.price.toLocaleString('pt-PT')} € ${
    property.previous_price
      ? `<i>(antes: ${property.previous_price.toLocaleString('pt-PT')} €)</i>`
      : ''
  }
📐 <b>Área:</b> ${property.area_m2} m² (${property.price_m2.toLocaleString('pt-PT')} €/m²)
📊 <b>Desvio vs Média da Zona:</b> <code>${property.price_deviation_pct > 0 ? '+' : ''}${property.price_deviation_pct}%</code>
📍 <b>Zona:</b> ${property.freguesia}, ${property.concelho}
🏷️ <b>Tipologia:</b> ${property.typology} (${property.condition})

🔗 <a href="${property.original_url}">Abrir anúncio no ${property.source_portal}</a>
`.trim();

  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  // Se o utilizador passou uma URL completa de webhook Telegram
  if (chatIdOrWebhook.startsWith('http')) {
    try {
      const response = await fetch(chatIdOrWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: messageText,
          parse_mode: 'HTML',
        }),
      });

      return {
        success: response.ok,
        channel: 'telegram',
        destination: chatIdOrWebhook,
      };
    } catch (err: unknown) {
      return {
        success: false,
        channel: 'telegram',
        destination: chatIdOrWebhook,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  // Se temos um TELEGRAM_BOT_TOKEN no ambiente, enviamos via API oficial
  if (botToken) {
    try {
      const apiUrl = property.cover_image
        ? `https://api.telegram.org/bot${botToken}/sendPhoto`
        : `https://api.telegram.org/bot${botToken}/sendMessage`;

      const payload = property.cover_image
        ? {
            chat_id: chatIdOrWebhook,
            photo: property.cover_image,
            caption: messageText,
            parse_mode: 'HTML',
          }
        : {
            chat_id: chatIdOrWebhook,
            text: messageText,
            parse_mode: 'HTML',
          };

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      return {
        success: data.ok === true,
        channel: 'telegram',
        destination: chatIdOrWebhook,
        messageId: data?.result?.message_id?.toString(),
        error: data.ok ? undefined : data.description,
      };
    } catch (err: unknown) {
      return {
        success: false,
        channel: 'telegram',
        destination: chatIdOrWebhook,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  // Modo Simulação se não houver Token configurado
  console.log(`[Simulação Telegram] Mensagem para ${chatIdOrWebhook}:\n${messageText}`);
  return {
    success: true,
    channel: 'telegram',
    destination: chatIdOrWebhook,
    simulated: true,
  };
}

/**
 * Despachante Universal de Notificações
 */
export async function dispatchPropertyNotification(
  payload: NotificationPayload
): Promise<NotificationResult> {
  const { channel, destination, property, alertReason } = payload;

  if (channel === 'discord') {
    return sendDiscordNotification(destination, property, alertReason);
  }

  if (channel === 'telegram') {
    return sendTelegramNotification(destination, property, alertReason);
  }

  // Fallback para email
  console.log(`[Simulação Email] Envio de alerta para ${destination} do imóvel: ${property.title}`);
  return {
    success: true,
    channel: 'email',
    destination,
    simulated: true,
  };
}
