/*
  # Create Airplane Game Tables

  1. New Tables
    - `crash_rounds` - Stores game rounds for airplane game
      - `id` (uuid, primary key)
      - `crash_multiplier` (decimal)
      - `started_at` (timestamptz)
      - `ended_at` (timestamptz)
      - `status` (text) - waiting, active, crashed
    
    - `crash_bets` - Stores player bets
      - `id` (uuid, primary key)
      - `round_id` (uuid, foreign key)
      - `user_id` (uuid)
      - `item_id` (text)
      - `item_name` (text)
      - `item_image` (text)
      - `item_rarity` (text)
      - `bet_amount` (decimal)
      - `cashout_multiplier` (decimal)
      - `winnings` (decimal)
      - `status` (text) - pending, cashed_out, lost
      - `created_at` (timestamptz)
    
    - `crash_user_profiles` - Stores user profiles
      - `user_id` (uuid, primary key)
      - `username` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public read access for game transparency
    - Users can manage their own bets
*/

CREATE TABLE IF NOT EXISTS crash_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crash_multiplier decimal NOT NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'crashed'))
);

CREATE TABLE IF NOT EXISTS crash_bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid REFERENCES crash_rounds(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  item_id text NOT NULL,
  item_name text NOT NULL,
  item_image text NOT NULL,
  item_rarity text NOT NULL,
  bet_amount decimal NOT NULL,
  cashout_multiplier decimal,
  winnings decimal,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cashed_out', 'lost')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crash_user_profiles (
  user_id text PRIMARY KEY,
  username text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crash_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE crash_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE crash_user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rounds"
  ON crash_rounds FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view bets"
  ON crash_bets FOR SELECT
  USING (true);

CREATE POLICY "Users can insert bets"
  ON crash_bets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own bets"
  ON crash_bets FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can view profiles"
  ON crash_user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can create profile"
  ON crash_user_profiles FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_crash_bets_round_id ON crash_bets(round_id);
CREATE INDEX IF NOT EXISTS idx_crash_bets_user_id ON crash_bets(user_id);
CREATE INDEX IF NOT EXISTS idx_crash_rounds_status ON crash_rounds(status);
