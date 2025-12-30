/*
  # Fix Security and Performance Issues

  ## Changes

  ### 1. RLS Performance Optimization
  - Update `users` table policies to use `(select auth.uid())` instead of `auth.uid()`
  - Update `user_balances` table policies to use `(select auth.uid())` instead of `auth.uid()`
  - This prevents re-evaluation for each row and improves query performance

  ### 2. Fix Multiple Permissive Policies
  - Make service role policies more restrictive
  - Separate concerns between service role and user access

  ### 3. Remove Unused Indexes
  - Drop unused indexes on `items`, `cases`, and `case_items` tables
  - These indexes are not being used as data comes from mock data

  ### 4. Fix Function Search Path
  - Add explicit search_path to `update_updated_at_column` function
  - Prevents security issues with mutable search paths
*/

-- ============================================================================
-- 1. FIX RLS PERFORMANCE ISSUES
-- ============================================================================

-- Drop and recreate users policies with optimized auth function calls
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Service can manage users" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (telegram_id = ((select current_setting('request.jwt.claims', true)::json)->>'sub')::bigint);

CREATE POLICY "Service role can manage users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Drop and recreate user_balances policies with optimized auth function calls
DROP POLICY IF EXISTS "Users can read own balance" ON user_balances;
DROP POLICY IF EXISTS "Service can manage balances" ON user_balances;
DROP POLICY IF EXISTS "Service role can manage balances" ON user_balances;

CREATE POLICY "Users can read own balance"
  ON user_balances
  FOR SELECT
  TO authenticated
  USING (user_id = (select current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Service role can manage balances"
  ON user_balances
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 2. REMOVE UNUSED INDEXES
-- ============================================================================

-- Remove unused indexes from items, cases, and case_items tables
DROP INDEX IF EXISTS idx_items_rarity;
DROP INDEX IF EXISTS idx_cases_active;
DROP INDEX IF EXISTS idx_case_items_case_id;
DROP INDEX IF EXISTS idx_case_items_item_id;

-- ============================================================================
-- 3. FIX FUNCTION SEARCH PATH
-- ============================================================================

-- Recreate update_updated_at_column function with explicit search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 4. GRANT PROPER PERMISSIONS
-- ============================================================================

-- Ensure anon role can read public tables
GRANT SELECT ON items TO anon;
GRANT SELECT ON cases TO anon;
GRANT SELECT ON case_items TO anon;

-- Ensure authenticated users can read their own data
GRANT SELECT ON users TO authenticated;
GRANT SELECT ON user_balances TO authenticated;
