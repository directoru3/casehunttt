/*
  # Update Secret Codes for One-Time Use

  1. Changes
    - Change max_uses_per_user to 1 (one-time use)
    - Update existing code to have limit of 1
    - Add unique constraint to prevent multiple uses

  2. Security
    - Maintain RLS policies
    - Add unique constraint on (user_id, code) combination
*/

UPDATE secret_codes
SET max_uses_per_user = 1
WHERE code = 'FREEGIFT2024';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'secret_code_uses_user_code_unique'
  ) THEN
    ALTER TABLE secret_code_uses
    ADD CONSTRAINT secret_code_uses_user_code_unique UNIQUE (user_id, code);
  END IF;
END $$;

COMMENT ON TABLE secret_code_uses IS 'Tracks secret code usage. Each user can use each code only once due to unique constraint.';
