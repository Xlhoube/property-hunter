export interface MarketZone {
  id: string;
  concelho: string;
  freguesia: string;
  district: string;
  avg_price_m2: number;
  min_price_m2: number;
  max_price_m2: number;
  total_listings: number;
  updated_at: string;
}

export interface UserAlert {
  id: string;
  user_email?: string;
  webhook_url?: string;
  channel: "email" | "telegram" | "discord" | "in_app";
  concelho: string;
  max_price?: number;
  typologies: string[];
  only_good_deals: boolean;
  is_active: boolean;
  created_at: string;
}
