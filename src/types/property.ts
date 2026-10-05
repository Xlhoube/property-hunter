export type PropertyTypology = "T0" | "T1" | "T2" | "T3" | "T4+" | "Moradia" | "Terreno";

export type PropertyCondition = "Novo" | "Usado" | "Para Recuperar" | "Em Construção";

export type OpportunityRating = "good" | "fair" | "bad";

export type PriceChangeType = "drop" | "rise" | "none";

export interface PriceHistoryRecord {
  id: string;
  property_id: string;
  price: number;
  price_m2: number;
  recorded_at: string;
}

export interface Property {
  id: string;
  source_id: string;
  source_portal: "Idealista" | "Imovirtual" | "CustoJusto" | "CasaSAPO" | "Outro";
  original_url: string; // Link inviolável para o portal de origem
  title: string;
  description: string;
  price: number;
  area_m2: number;
  price_m2: number;
  typology: PropertyTypology;
  condition: PropertyCondition;
  address?: string;
  freguesia: string;
  concelho: string;
  district: string;
  latitude?: number;
  longitude?: number;
  cover_image: string;
  gallery?: string[];
  
  // Análise de Mercado (€/m²)
  zone_avg_price_m2: number;
  price_deviation_pct: number; // Ex: -15.4% (15.4% abaixo da média)
  opportunity_rating: OpportunityRating; // 'good' (< -10%), 'fair' (-10% a +10%), 'bad' (> +10%)

  // Monitorização de Histórico e Variação de Preço
  previous_price?: number;
  price_change_type: PriceChangeType;
  price_change_amount?: number;
  price_change_pct?: number;
  price_history?: PriceHistoryRecord[];

  created_at: string;
  last_scraped_at: string;
  is_active: boolean;

  // Distância calculada em relação à localização do utilizador
  distance_km?: number;
}

export interface PropertyFilterParams {
  searchQuery?: string;
  concelho?: string;
  freguesia?: string;
  typologies?: PropertyTypology[];
  condition?: PropertyCondition | "Todas";
  opportunity?: OpportunityRating | "Todas";
  priceChangeOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  maxPriceM2?: number;
  sortBy?: "newest" | "opportunity_best" | "price_asc" | "price_desc" | "price_m2_asc" | "distance_asc";
  userLocation?: { lat: number; lng: number } | null;
  radiusKm?: number | null;
}
