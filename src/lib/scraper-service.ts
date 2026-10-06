import { Property } from '@/types/property';
import { determinePriceChange } from '@/lib/market-analysis';
import { fetchActiveAlerts, addOrUpdatePropertyInMemory } from '@/lib/appwrite';
import { addOrUpdatePropertyServer, fetchPropertiesServer } from '@/lib/server-appwrite';
import { dispatchPropertyNotification } from '@/lib/notification-service';
import { scrapeAllPortals } from './scrapers';

export interface ScraperResult {
  timestamp: string;
  total_scraped: number;
  new_properties: number;
  updated_prices: number;
  price_drops: number;
  notifications_sent: number;
  details: string[];
}

export async function runHourlyScraper(filters?: any): Promise<ScraperResult> {
  const targetConcelho = filters?.concelho;
  console.log(`[Property Hunter] Iniciando ronda de prospecção nos portais. Alvo: ${targetConcelho || 'Default'}`);

  const currentProperties = await fetchPropertiesServer();
  const activeAlerts = await fetchActiveAlerts();
  const timestamp = new Date().toISOString();

  let newCount = 0;
  let updatedCount = 0;
  let dropsCount = 0;
  let notificationsSent = 0;
  const details: string[] = [];

  try {
    const concelhosToScrape = targetConcelho && targetConcelho !== 'Todos' ? [targetConcelho] : ['Lisboa', 'Porto', 'Cascais', 'Braga'];
    const portalReport = await scrapeAllPortals(concelhosToScrape, 15);
    
    // Filtro JS para evitar sobrecarga da DB com imóveis que o utilizador não quer
    let validProperties = portalReport.normalized_properties;
    if (filters) {
      if (filters.typologies && filters.typologies.length > 0) {
        validProperties = validProperties.filter(p => filters.typologies.includes(p.typology));
      }
      if (filters.minPrice && filters.minPrice > 0) {
        validProperties = validProperties.filter(p => p.price >= filters.minPrice);
      }
      if (filters.maxPrice && filters.maxPrice > 0) {
        validProperties = validProperties.filter(p => p.price <= filters.maxPrice);
      }
      if (filters.minArea && filters.minArea > 0) {
        validProperties = validProperties.filter(p => p.area_m2 >= filters.minArea);
      }
      if (filters.maxArea && filters.maxArea > 0) {
        validProperties = validProperties.filter(p => p.area_m2 <= filters.maxArea);
      }
    }
    
    console.log(`[Scraper Service] Crawlers concluídos: ${portalReport.normalized_properties.length} recolhidos. ${validProperties.length} correspondem aos filtros.`);

    for (const scraped of validProperties) {
      const existing = currentProperties.find(
        (p) => p.source_id === scraped.source_id || p.original_url === scraped.original_url
      );

      if (existing) {
        // Imóvel já existente: verificar se o preço alterou
        if (existing.price !== scraped.price) {
          const prevPrice = existing.price;
          const newPrice = scraped.price;
          const changeStats = determinePriceChange(newPrice, prevPrice);

          const history = existing.price_history ? [...existing.price_history] : [];
          history.push({
            id: 'ph_' + Date.now(),
            property_id: existing.id,
            price: newPrice,
            price_m2: scraped.price_m2,
            recorded_at: timestamp,
          });

          const updatedProp: Property = {
            ...existing,
            price: newPrice,
            previous_price: prevPrice,
            price_m2: scraped.price_m2,
            price_deviation_pct: scraped.price_deviation_pct,
            opportunity_rating: scraped.opportunity_rating,
            price_change_type: changeStats.type,
            price_change_amount: changeStats.amount,
            price_change_pct: changeStats.pct,
            price_history: history,
            last_scraped_at: timestamp,
          };

          addOrUpdatePropertyInMemory(updatedProp);
          await addOrUpdatePropertyServer(updatedProp);
          updatedCount++;
          if (changeStats.type === 'drop') {
            dropsCount++;
            details.push(
              `[Baixa de Preço] ${updatedProp.title.slice(0, 35)}... baixou de ${prevPrice}€ para ${newPrice}€ (-${changeStats.pct}%)`
            );
          } else if (changeStats.type === 'rise') {
            details.push(
              `[Subida de Preço] ${updatedProp.title.slice(0, 35)}... subiu de ${prevPrice}€ para ${newPrice}€ (+${changeStats.pct}%)`
            );
          } else {
            details.push(
              `[Preço Alterado] ${updatedProp.title.slice(0, 35)}... alterou de ${prevPrice}€ para ${newPrice}€`
            );
          }

          // Disparar notificações para alertas subscritos
          for (const alert of activeAlerts) {
            if (
              !alert.concelho ||
              alert.concelho === 'Todos' ||
              alert.concelho.toLowerCase() === updatedProp.concelho.toLowerCase()
            ) {
              const destination = alert.channel === 'email' ? alert.user_email : alert.webhook_url;
              if (destination) {
                await dispatchPropertyNotification({
                  channel: alert.channel,
                  destination,
                  property: updatedProp,
                  alertReason: 'price_drop',
                });
                notificationsSent++;
              }
            }
          }
        }
      } else {
        // Novo imóvel detectado no portal
        addOrUpdatePropertyInMemory(scraped);
        await addOrUpdatePropertyServer(scraped);
        newCount++;

        if (scraped.opportunity_rating === 'good') {
          details.push(
            `[Oportunidade] ${scraped.title.slice(0, 35)} em ${scraped.concelho}: ${scraped.price}€ (${scraped.price_deviation_pct}% abaixo da média)`
          );
        }

        // Disparar notificações para novos imóveis com Bom Preço
        for (const alert of activeAlerts) {
          if (
            !alert.concelho ||
            alert.concelho === 'Todos' ||
            alert.concelho.toLowerCase() === scraped.concelho.toLowerCase()
          ) {
            if (!alert.only_good_deals || scraped.opportunity_rating === 'good') {
              const destination = alert.channel === 'email' ? alert.user_email : alert.webhook_url;
              if (destination) {
                await dispatchPropertyNotification({
                  channel: alert.channel,
                  destination,
                  property: scraped,
                  alertReason: 'new_opportunity',
                });
                notificationsSent++;
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('[Scraper Service] Erro na execução dos crawlers reais:', err);
    details.push(`Erro na execução dos crawlers: ${String(err)}`);
  }

  return {
    timestamp,
    total_scraped: currentProperties.length + newCount,
    new_properties: newCount,
    updated_prices: updatedCount,
    price_drops: dropsCount,
    notifications_sent: notificationsSent,
    details,
  };
}
