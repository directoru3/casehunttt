/*
  # Add rank calculation function
  
  This migration creates a PostgreSQL function to automatically calculate
  player rank levels based on their points.
  
  Rank levels:
  1. Новичок (0-100 очков)
  2. Ученик (101-500 очков)
  3. Игрок (501-2000 очков)
  4. Охотник за удачей (2001-5000 очков)
  5. Повелитель кейсов (5001-15000 очков)
  6. Король краша (15001+ очков)
*/

CREATE OR REPLACE FUNCTION calculate_rank_level(points INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF points <= 100 THEN
    RETURN 1;
  ELSIF points <= 500 THEN
    RETURN 2;
  ELSIF points <= 2000 THEN
    RETURN 3;
  ELSIF points <= 5000 THEN
    RETURN 4;
  ELSIF points <= 15000 THEN
    RETURN 5;
  ELSE
    RETURN 6;
  END IF;
END;
$$;
