-- The payments table is missing the updated_at column in the live database,
-- but the trigger update_payments_updated_at tries to set it on every UPDATE.
-- This causes: "Could not find the 'updated_at' column of 'payments' in the schema cache"
-- Fix: drop the trigger (it references a nonexistent column).

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
