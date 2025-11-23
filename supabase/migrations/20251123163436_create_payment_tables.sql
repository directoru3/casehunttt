/*
  # Payment System Tables

  1. New Tables
    - `user_balances`
      - `id` (uuid, primary key)
      - `user_id` (text, unique)
      - `balance` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `pending_payments`
      - `id` (uuid, primary key)
      - `payload_id` (text, unique)
      - `user_id` (text)
      - `stars_amount` (integer)
      - `coins_amount` (numeric)
      - `status` (text)
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (text)
      - `type` (text)
      - `amount` (numeric)
      - `stars_amount` (integer)
      - `status` (text)
      - `payload_id` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read their own data
    - Service role can manage all data
*/

-- Create user_balances table
CREATE TABLE IF NOT EXISTS user_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  balance numeric DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own balance"
  ON user_balances
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage balances"
  ON user_balances
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create pending_payments table
CREATE TABLE IF NOT EXISTS pending_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payload_id text UNIQUE NOT NULL,
  user_id text NOT NULL,
  stars_amount integer NOT NULL,
  coins_amount numeric NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz
);

ALTER TABLE pending_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payments"
  ON pending_payments
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage payments"
  ON pending_payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  type text NOT NULL,
  amount numeric NOT NULL,
  stars_amount integer,
  status text NOT NULL,
  payload_id text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage transactions"
  ON transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_payments_user_id ON pending_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_payments_payload_id ON pending_payments(payload_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
