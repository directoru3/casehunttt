/*
  # Items and Cases Management System

  ## New Tables
  
  ### `items`
  Stores all game items with their properties
  - `id` (uuid, primary key)
  - `name` (text) - Item name
  - `image_url` (text) - URL to item image
  - `rarity` (text) - Rarity level (common, uncommon, rare, mythical, legendary)
  - `price` (numeric) - Item base price in Stars
  - `description` (text, optional) - Item description
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `cases`
  Stores case information
  - `id` (uuid, primary key)
  - `name` (text) - Case name
  - `image_url` (text) - Case image URL
  - `price` (numeric) - Price to open case in Stars
  - `description` (text, optional)
  - `is_active` (boolean) - Whether case is available
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `case_items`
  Links items to cases with drop rates
  - `id` (uuid, primary key)
  - `case_id` (uuid) - References cases
  - `item_id` (uuid) - References items
  - `drop_rate` (numeric) - Percentage chance to drop (0-100)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Public read access for active items and cases
  - Admin-only write access
*/

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL,
  rarity text NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'mythical', 'legendary')),
  price numeric NOT NULL DEFAULT 0 CHECK (price >= 0),
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL,
  price numeric NOT NULL DEFAULT 0 CHECK (price >= 0),
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create case_items junction table
CREATE TABLE IF NOT EXISTS case_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  drop_rate numeric NOT NULL CHECK (drop_rate >= 0 AND drop_rate <= 100),
  created_at timestamptz DEFAULT now(),
  UNIQUE(case_id, item_id)
);

-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_items ENABLE ROW LEVEL SECURITY;

-- Items policies: Anyone can read, authenticated users can read
CREATE POLICY "Public can view items"
  ON items FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage items"
  ON items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Cases policies
CREATE POLICY "Public can view active cases"
  ON cases FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Service role can manage cases"
  ON cases FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Case items policies
CREATE POLICY "Public can view case items"
  ON case_items FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage case items"
  ON case_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_rarity ON items(rarity);
CREATE INDEX IF NOT EXISTS idx_cases_active ON cases(is_active);
CREATE INDEX IF NOT EXISTS idx_case_items_case_id ON case_items(case_id);
CREATE INDEX IF NOT EXISTS idx_case_items_item_id ON case_items(item_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_items_updated_at'
  ) THEN
    CREATE TRIGGER update_items_updated_at
      BEFORE UPDATE ON items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_cases_updated_at'
  ) THEN
    CREATE TRIGGER update_cases_updated_at
      BEFORE UPDATE ON cases
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;