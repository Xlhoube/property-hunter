# MEMORY.md - Property Hunter (Casas a Venda)

## Contexto e Objectivo
O **Property Hunter / Alerta Imobiliário** é uma aplicação web concebida para o mercado imobiliário em Portugal, destinada a automatizar a prospecção de imóveis em múltiplos portais (Idealista, Imovirtual, CustoJusto, CasaSAPO, etc.).
A plataforma cruza continuamente os imóveis com referências de preço médio por metro quadrado (€/m²) por freguesia/concelho, monitoriza o histórico de oscilação de valores (subidas/descidas) e destaca oportunidades com uma interface minimalista e de leitura rápida (*at a glance*).

---

## Ficha Técnica do Projecto
- **Nome:** Property Hunter (Casas a Venda)
- **Versão Actual:** v0.8.0
- **Data de Início:** 2026-10-05
- **Nível de Risco:** 2 (Perco algum tempo / Gestão de dados de prospecção)
- **Ritmo de Trabalho:** Protótipo Rápido (Resultados imediatos com interface limpa e iterativa)
- **Ambiente de Deploy:** Vercel (Frontend & Cron Jobs) + Appwrite (Database, Collections & Auth)

---

## Stack Escolhida e Justificação
- **Frontend & Backend (Fullstack):** Next.js 16 (App Router) + React 19 + TypeScript
  - *Justificação:* Renderização rápida, rotas de API nativas para webhooks/crons e ecossistema moderno.
- **Design System & Estilos:** Tailwind CSS + Lucide Icons + Dark Mode Nativo + Mobile-First Design
  - *Justificação:* Design limpo, muito espaço em branco (*whitespace*), tipografia legível e paleta funcional com tema claro e escuro (slate-950, slate-900, slate-800 e esmeralda escuro). Otimizado para smartphones e ecrãs tácteis com áreas de toque confortáveis (≥38px/42px).
- **Base de Dados & Backend as a Service (BaaS):** Appwrite com fallback resiliente em memória
  - *Colecções implementadas:*
    - `properties`: Dados dos imóveis (título, preço, área, €/m², tipologia, condição, freguesia, concelho, link original inviolável, data de recolha).
    - `price_history`: Registo histórico temporal de alterações de preço por imóvel.
    - `market_zones`: Tabela de referência de preço médio por metro quadrado por zona geográfica (Lisboa, Porto, Cascais, Braga, Coimbra, Faro).
    - `user_alerts`: Critérios de pesquisa de utilizadores para disparo de alertas (email, telegram, discord).
- **Motor de Prospecção & Ingestão:** Módulos Node.js acionados via GitHub Actions a cada 12 horas (`0 8,20 * * *`) e Vercel Cron diária (`0 8 * * *`).
- **Scrapers Nativos:** Imovirtual (extracção estruturada `__NEXT_DATA__`), CasaSAPO (HTML parsing resiliente com cheerio) e Idealista (suporte a gateway anti-bloqueio).
- **Geocodificação & Proximidade:** Módulo geoespacial nativo (`src/lib/geo.ts`) com cálculo da distância esférica Haversine, suporte a coordenadas de referência de concelhos e endpoint híbrido (`/api/geocode/reverse`).
- **Exportação & Relatórios:** Utilitário nativo de exportação de dossiê de investimentos em formato CSV compatível com Excel europeu (delimitador `;` e codificação UTF-8 BOM), incluindo distância calculada quando ativa.
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
- **ADR-009 (2026-10-05):** Implementação do Modal de Prospeção em Tempo Real (`ScrapeProgressModal`) e Exportação de Dossiê Imobiliário CSV (`exportPropertiesToCSV`). O utilizador pode agora acionar a varredura sob demanda a partir da navbar com acompanhamento em direto dos 3 portais (novos anúncios, baixas de preço e alertas), bem como descarregar a qualquer momento a lista filtrada de oportunidades formatada para Excel europeu com caracteres em Português de Portugal.
- **ADR-010 (2026-10-05):** Ajuste da cadência de recolha automática para um intervalo de 12 horas (`cron: '0 8,20 * * *'`, executando às 08:00 e às 20:00 UTC) no GitHub Actions e indicação na interface. Esta medida protege o crawler contra bloqueios de IP/WAF por pedidos excessivos aos portais imobiliários, mantendo duas atualizações diárias abrangentes (manhã e noite) e a faculdade de disparo manual a qualquer momento.
- **ADR-011 (2026-10-05):** Implementação de Geolocalização Nativa com Reverse Geocoding Híbrido. Adicionado à barra de filtros o botão "A minha localização" que aciona a API de Geolocation do browser (`navigator.geolocation.getCurrentPosition`). A latitude e longitude são resolvidas no servidor através de `/api/geocode/reverse` usando Nominatim OpenStreetMap (com timeout de 3.5s) e com recurso a fallback matemático determinístico (matriz de distâncias Haversine sobre os 25 concelhos de referência de Portugal).
- **ADR-012 (2026-10-05):** Implementação de Procura por Raio Geográfico e Ordenação por Proximidade. Ao ativar a localização, a aplicação apresenta seletores rápidos de raio (5 km, 10 km, 25 km, 50 km, 100 km ou Todo o País) que filtram os imóveis em tempo real com base na fórmula de Haversine (`src/lib/geo.ts`). Os cartões de imóveis passam a exibir a distância exata em km (ex.: "a 7.1 km"), é adicionada a opção de ordenação "Mais Próximos de Mim", e a distância é incluída nos dossiês CSV exportados.
- **ADR-013 (2026-10-05):** Implementação de Modo Escuro Integral com Suporte a Tailwind CSS v4 e Zero FOUC. Criado `ThemeProvider` com contexto React e hook `useTheme()`, sincronização em `localStorage` (`property_hunter_theme`) e leitura das preferências de sistema (`prefers-color-scheme`). Configurada a directiva `@custom-variant dark (&:where(.dark, .dark *));` no Tailwind v4 para propagação da classe `.dark` no elemento raiz `<html>`, com script síncrono no `<head>` de `layout.tsx` para eliminar flashes brancos. Adaptados integralmente todos os componentes (Navbar, MarketStatBanner, FilterBar, PropertyCard, modais e rodapé) com paleta Slate escuro (`dark:bg-slate-950`, `dark:bg-slate-900`, `dark:border-slate-800`).
- **ADR-014 (2026-10-05):** Otimização Mobile-First e Menu Responsivo para Smartphones. Redesenhada a barra de navegação (`Navbar.tsx`) com gaveta móvel expansível via botão hambúrguer (`Menu`/`X`), integrando os atalhos de ronda nos portais, configuração de alertas e estado da última ronda em botões táteis largos (touch targets ≥40px). Otimizado o `MarketStatBanner.tsx` com disposição 2x2 sem cortes de texto, a `FilterBar.tsx` com grelha móvel em 2 colunas para seletores e carrosséis horizontais táteis (`no-scrollbar`) para raios e tipologias. Modais adaptados com altura máxima segura (`max-h-[92vh]`), cabeçalho e rodapé fixos e scroll interno suave.

---

## O que já funciona (v0.8.0)
- **Otimização Mobile-First Integral:** Barra de navegação com menu hambúrguer responsivo para telemóveis, banners de métricas 2x2 perfeitamente enquadrados, filtros táteis com scroll horizontal nativo e modais com rolagem suave que não quebram em ecrãs estreitos (320px a 420px).
- **Modo Escuro (Dark Mode):** Alternador no cabeçalho com transição suave, persistência no navegador, deteção do sistema operativo e paleta Slate premium adaptada em todos os ecrãs e modais.
- Dashboard principal com métricas de prospecção agregadas (imóveis monitorizados, abaixo da média, baixas de preço, última ronda).
- Cartões de imóveis com leitura visual instantânea (*at a glance*): preço, preço/m², desvio face à média da freguesia, diferença face ao preço inicial e botão directo para o portal original.
- Barra de filtros reactiva: pesquisa por texto, concelho, tipologia (T0 a T4+), apenas descidas de preço e ordenações (mais recente, maior desconto, menor preço/m²).
- **Procura por Raio Geográfico:** Seleção de raio (5 km a 100 km) em redor da localização do utilizador, permitindo encontrar oportunidades em concelhos limítrofes.
- **Ordenação por Proximidade:** Opção "📍 Mais Próximos de Mim" e indicação visual de distância em km em cada cartão de imóvel.
- **Geolocalização "Obter a minha localização":** Deteção imediata da zona do utilizador com botão dedicado no campo de pesquisa e reverse geocoding híbrido.
- **Exportação de Dossiê em CSV:** Botão integrado na barra de filtros para descarregar a listagem filtrada de imóveis em formato Excel/Sheets com todas as métricas calculadas (€/m², desvios, distância em km, link original).
- **Prospeção em Tempo Real sob Demanda:** Botão "Ronda Horária" na barra superior que abre o `ScrapeProgressModal` com estado de recolha em direto, métricas (novos imóveis, descidas, alertas) e destaques de oportunidades.
- Suite de scrapers reais para Imovirtual, CasaSAPO e Idealista integrada.
- Modal de histórico de preços com linha temporal e variações registadas.
- Modal de configuração e teste de alertas com "Modo Simples" sem atrito: convite com 1 clique para servidor Discord oficial e botão directo para Telegram.
- Botão "Testar Envio" no modal de alertas com diagnóstico e feedback instantâneo.
- Execução manual e agendada do serviço de prospecção horária (`/api/cron/scrape`) com disparo automático de alertas para utilizadores subscritos.
- Rota de teste dedicada `/api/alerts/test` com modo de simulação e suporte a credenciais reais.
- Ambiente de testes local validado e funcional em `http://localhost:3005`.

---

## Próximos Passos
- Configuração do link de convite permanente do servidor oficial Discord no `.env.local` (`NEXT_PUBLIC_DISCORD_INVITE_URL`).
- Adicionar filtros avançados por intervalo de valores (ex: Preço Mín/Máx em € e Área Mín/Máx em m²).
- Conectar chaves da Appwrite quando o utilizador pretender persistência na cloud.

