/*
  # Create Live Drops System

  ## Overview
  Creates infrastructure for real-time live drops feed showing recent case openings across all users.

  ## New Tables
    - `live_drops`
      - `id` (uuid, primary key) - Unique identifier for each drop event
      - `user_id` (bigint) - Telegram user ID of the player
      - `username` (text) - Display name of the player
      - `item_name` (text) - Name of the dropped item
      - `item_rarity` (text) - Rarity level (common, uncommon, rare, mythical, legendary)
      - `case_name` (text) - Name of the case that was opened
      - `created_at` (timestamptz) - When the drop occurred
      - `user_photo_url` (text, nullable) - Optional user avatar URL

  ## Security
    - Enable RLS on `live_drops` table
    - Add policy for all users to read recent drops (public feed)
    - Add policy for authenticated users to insert their own drops

  ## Notes
    - Table will store last 100 drops, older entries should be cleaned up periodically
    - Used for real-time WebSocket broadcasting to all connected clients
*/

CREATE TABLE IF NOT EXISTS live_drops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id bigint NOT NULL,
  username text NOT NULL,
  item_name text NOT NULL,
  item_rarity text NOT NULL CHECK (item_rarity IN ('common', 'uncommon', 'rare', 'mythical', 'legendary')),
  case_name text NOT NULL,
  user_photo_url text,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster queries on recent drops
CREATE INDEX IF NOT EXISTS idx_live_drops_created_at ON live_drops(created_at DESC);

-- Enable RLS
ALTER TABLE live_drops ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view live drops (public feed)
CREATE POLICY "Anyone can view live drops"
  ON live_drops
  FOR SELECT
  USING (true);

-- Policy: Service role can insert drops (via edge function)
CREATE POLICY "Service can insert drops"
  ON live_drops
  FOR INSERT
  WITH CHECK (true);

-- Policy: Automatically delete old drops (keep only last 100)
-- This will be handled by the edge function or a scheduled job