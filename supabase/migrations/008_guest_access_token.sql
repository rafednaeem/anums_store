-- Guest order access tokens.
-- Allows guests to securely view their order without an account.
-- A random UUID token is generated at order creation and returned
-- only to the guest. The token is verified server-side before
-- returning order data.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_access_token TEXT;
CREATE INDEX IF NOT EXISTS idx_orders_guest_access_token ON orders(guest_access_token);
