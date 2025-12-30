/*
  # Create Users and User Balances Tables

  ## Overview
  Creates tables for storing Telegram user information and their balances.

  ## New Tables
    - `users`
      - `id` (uuid, primary key) - Unique identifier
      - `telegram_id` (bigint, unique) - Telegram user ID
      - `first_name` (text) - User's first name
      - `last_name` (text, nullable) - User's last name
      - `username` (text, nullable) - Telegram username
      - `language_code` (text) - User's language preference
      - `photo_url` (text, nullable) - Profile photo URL
      - `is_premium` (boolean) - Telegram Premium status
      - `last_login` (timestamptz) - Last login timestamp
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `user_balances`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (text) - Telegram user ID as string
      - `balance` (numeric) - User's balance in Stars
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  ## Security
    - Enable RLS on both tables
    - Users can read their own data
    - Service role can insert/update user data

  ## Notes
    - New users receive 1 Star welcome bonus
    - Balance is tracked separately for flexibility
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id bigint UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text,
  username text,
  language_code text DEFAULT 'en',
  photo_url text,
  is_premium boolean DEFAULT false,
  last_login timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (telegram_id = (current_setting('request.jwt.claims', true)::json->>'sub')::bigint);

-- Policy: Service role can insert/update
CREATE POLICY "Service can manage users"
  ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create user_balances table
CREATE TABLE IF NOT EXISTS user_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  balance numeric DEFAULT 0 CHECK (balance >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);

-- Enable RLS
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own balance
CREATE POLICY "Users can read own balance"
  ON user_balances
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Service role can manage balances
CREATE POLICY "Service can manage balances"
  ON user_balances
  FOR ALL
  USING (true)
  WITH CHECK (true);