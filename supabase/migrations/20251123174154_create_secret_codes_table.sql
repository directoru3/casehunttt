/*
  # Secret Codes System

  1. New Tables
    - `secret_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique) - The secret code
      - `case_id` (text) - Associated case ID
      - `max_uses_per_user` (integer) - Maximum uses per user (default 100)
      - `is_active` (boolean) - Whether code is active
      - `created_at` (timestamptz)
    
    - `secret_code_uses`
      - `id` (uuid, primary key)
      - `user_id` (text) - User who used the code
      - `code` (text) - The secret code used
      - `used_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can read active codes
    - Users can read their own usage history
    - Service role can manage all data
*/

CREATE TABLE IF NOT EXISTS secret_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  case_id text NOT NULL,
  max_uses_per_user integer DEFAULT 100 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS secret_code_uses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  code text NOT NULL,
  used_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE secret_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE secret_code_uses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active codes"
  ON secret_codes
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Users can read own code usage"
  ON secret_code_uses
  FOR SELECT
  TO authenticated
  USING (user_id = (auth.jwt()->>'sub'));

CREATE POLICY "Service role can manage codes"
  ON secret_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage code uses"
  ON secret_code_uses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_secret_codes_code ON secret_codes(code);
CREATE INDEX IF NOT EXISTS idx_secret_codes_active ON secret_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_secret_code_uses_user ON secret_code_uses(user_id);
CREATE INDEX IF NOT EXISTS idx_secret_code_uses_code ON secret_code_uses(code);

INSERT INTO secret_codes (code, case_id, max_uses_per_user, is_active)
VALUES ('FREEGIFT2024', 'free-gift', 100, true)
ON CONFLICT (code) DO NOTHING;
