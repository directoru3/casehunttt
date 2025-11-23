-- Fix RLS policies for crash game
-- Allow anonymous users to create rounds and place bets

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view crash rounds" ON crash_rounds;
DROP POLICY IF EXISTS "Anyone can view crash bets" ON crash_bets;
DROP POLICY IF EXISTS "Users can insert own bets" ON crash_bets;
DROP POLICY IF EXISTS "Users can update own bets" ON crash_bets;
DROP POLICY IF EXISTS "Anyone can view user profiles" ON crash_user_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON crash_user_profiles;

-- Create permissive policies for crash_rounds
CREATE POLICY "Anyone can view crash rounds"
  ON crash_rounds FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create crash rounds"
  ON crash_rounds FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update crash rounds"
  ON crash_rounds FOR UPDATE
  USING (true);

-- Create permissive policies for crash_bets
CREATE POLICY "Anyone can view crash bets"
  ON crash_bets FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create crash bets"
  ON crash_bets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update crash bets"
  ON crash_bets FOR UPDATE
  USING (true);

-- Create permissive policies for crash_user_profiles
CREATE POLICY "Anyone can view user profiles"
  ON crash_user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create user profiles"
  ON crash_user_profiles FOR INSERT
  WITH CHECK (true);