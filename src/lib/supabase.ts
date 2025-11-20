import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Case {
  id: string;
  name: string;
  image_url: string;
  price: number;
  category: 'free' | 'new' | 'low' | 'high';
}

export interface Item {
  id: string;
  name: string;
  image_url: string;
  rarity: string;
  price: number;
}

export interface User {
  id: string;
  user_id: string;
  balance: number;
  created_at?: string;
}

export interface UserInventory {
  id: string;
  user_id: string;
  item_id: string;
  acquired_at?: string;
  item?: Item;
}

export interface CaseItem {
  id: string;
  case_id: string;
  item_id: string;
  drop_chance: number;
  item?: Item;
}
