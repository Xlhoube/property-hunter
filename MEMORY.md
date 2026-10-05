# MEMORY.md - Property Hunter (Casas a Venda)

## Contexto e Objectivo
O **Property Hunter / Alerta Imobiliário** é uma aplicação web concebida para o mercado imobiliário em Portugal, destinada a automatizar a prospecção de imóveis em múltiplos portais (Idealista, Imovirtual, CustoJusto, CasaSAPO, etc.).
A plataforma cruza continuamente os imóveis com referências de preço médio por metro quadrado (€/m²) por freguesia/concelho, monitoriza o histórico de oscilação de valores (subidas/descidas) e destaca oportunidades com uma interface minimalista e de leitura rápida (*at a glance*).

---

## Ficha Técnica do Projecto
- **Nome:** Property Hunter (Casas a Venda)
- **Versão Actual:** v0.3.0
- **Data de Início:** 2026-10-05
- **Nível de Risco:** 2 (Perco algum tempo / Gestão de dados de prospecção)
- **Ritmo de Trabalho:** Protótipo Rápido (Resultados imediatos com interface limpa e iterativa)
- **Ambiente de Deploy:** Vercel (Frontend & Cron Jobs) + Appwrite (Database, Collections & Auth)

---

## Stack Escolhida e Justificação
- **Frontend & Backend (Fullstack):** Next.js 16 (App Router) + React 19 + TypeScript
  - *Justificação:* Renderização rápida, rotas de API nativas para webhooks/crons e ecossistema moderno.
- **Design System & Estilos:** Tailwind CSS + Lucide Icons
  - *Justificação:* Design limpo, muito espaço em branco (*whitespace*), tipografia legível e paleta funcional (neutros com destaques em verde/vermelho estritamente para métricas financeiras).
- **Base de Dados & Backend as a Service (BaaS):** Appwrite com fallback resiliente em memória
  - *Colecções implementadas:*
    - `properties`: Dados dos imóveis (título, preço, área, €/m², tipologia, condição, freguesia, concelho, link original inviolável, data de recolha).
    - `price_history`: Registo histórico temporal de alterações de preço por imóvel.
    - `market_zones`: Tabela de referência de preço médio por metro quadrado por zona geográfica (Lisboa, Porto, Cascais, Braga, Coimbra, Faro).
    - `user_alerts`: Critérios de pesquisa de utilizadores para disparo de alertas (email, telegram, discord).
- **Motor de Prospecção & Ingestão:** Módulos Node.js acionados via GitHub Actions e Vercel Cron Jobs (`0 * * * *` e `0 8 * * *`).
- **Scrapers Nativos:** Imovirtual (extracção estruturada `__NEXT_DATA__`), CasaSAPO (HTML parsing resiliente com cheerio) e Idealista (suporte a gateway anti-bloqueio).
- **Notificações:** Despachante universal multicanal com suporte a Telegram Bot API e Discord Webhook com mensagens ricas, fotos e botões de clique rápido.

---

## Histórico de Decisões (ADR)
- **ADR-001 (2026-10-05):** Início do projecto com arquitectura Next.js (App Router) + Tailwind CSS + Appwrite para gestão NoSQL/relacional dos imóveis e Vercel Cron para automação horária.
- **ADR-002 (2026-10-05):** Adopção de sistema de classificação visual de oportunidade em três níveis baseados no desvio percentual face à média da zona: Bom Preço (verde <-10%), Dentro do Preço (amarelo/neutro ±10%) e Mau Preço (vermelho/alerta >+10%).
- **ADR-003 (2026-10-05):** Implementação de camada de persistência híbrida com fallback em memória. Permite execução imediata local com 10 imóveis realistas e 12 zonas de Portugal sem bloqueio de arranque antes da introdução das chaves Appwrite.
- **ADR-004 (2026-10-05):** Validação de testes no ecrã e aprovação do ambiente local em http://localhost:3005 pelo utilizador, confirmando o carregamento dos cartões de imóveis, histórico de preços e filtros interactivos.
- **ADR-005 (2026-10-05):** Implementação do despachante universal de notificações multicanal (Telegram Bot API e Discord Webhooks) integrado no motor de prospecção e no modal de subscrição de alertas com botão de teste imediato.
- **ADR-006 (2026-10-05):** Adopção do "Modo Simples" no modal de alertas. Elimina atrito técnico para o utilizador comum através de convite directo para o servidor oficial Discord da plataforma e botão directo para o bot do Telegram, mantendo opção de Webhook apenas para administradores/avançados.
- **ADR-007 (2026-10-05):** Resolução da limitação de agendamentos no plano gratuito da Vercel (Hobby). O ficheiro `vercel.json` foi ajustado para execução diária (`0 8 * * *`), e foi criado o workflow `.github/workflows/hourly-scrape.yml` no GitHub Actions para garantir prospecção horária autónoma (`0 * * * *`) e disparos manuais sob demanda sem qualquer custo adicional.
- **ADR-008 (2026-10-05):** Implementação da suite de crawlers reais para os portais imobiliários portugueses em `src/lib/scrapers/` (Imovirtual com extracção estruturada via `__NEXT_DATA__`, CasaSAPO com parsing de cards e características com `cheerio`, e Idealista com suporte a proxy anti-bloqueio). Integração no serviço horário com deduplicação, cálculo automático de €/m² e disparo de alertas.

---

## O que já funciona (v0.2.0)
- Dashboard principal com métricas de prospecção agregadas (imóveis monitorizados, abaixo da média, baixas de preço, última ronda).
- Cartões de imóveis com leitura visual instantânea (*at a glance*): preço, preço/m², desvio face à média da freguesia, diferença face ao preço inicial e botão directo para o portal original.
- Barra de filtros reactiva: pesquisa por texto, concelho, tipologia (T0 a T4+), apenas descidas de preço e ordenações (mais recente, maior desconto, menor preço/m²).
- Modal de histórico de preços com linha temporal e variações registadas.
- Modal de configuração e teste de alertas com "Modo Simples" sem atrito: convite com 1 clique para servidor Discord oficial e botão directo para Telegram.
- Botão "Testar Envio" no modal de alertas com diagnóstico e feedback instantâneo.
- Execução manual e agendada do serviço de prospecção horária (`/api/cron/scrape`) com disparo automático de alertas para utilizadores subscritos.
- Rota de teste dedicada `/api/alerts/test` com modo de simulação e suporte a credenciais reais.
- Ambiente de testes local validado e funcional em `http://localhost:3005`.


---

## Próximos Passos
1. Inserir chaves reais no `.env.local` (`TELEGRAM_BOT_TOKEN`, `APPWRITE_API_KEY`).
2. Adicionar scrapers reais por portal imobiliário (Idealista, Imovirtual, CasaSAPO) com respeito pelas políticas de robots.txt e normalização de dados.
3. Exportação de listagens e dossiês de oportunidade para formato CSV / PDF para apresentação a investidores.
