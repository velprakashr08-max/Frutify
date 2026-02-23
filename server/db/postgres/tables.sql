-- ============================================================
--  Frutify — PostgreSQL DDL
--  Run: psql -U frutify_user -d frutify -f tables.sql
-- ============================================================

-- 0. Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";     -- case-insensitive text (for email)


-- 1. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100),
  email       CITEXT      UNIQUE,
  phone       VARCHAR(15) UNIQUE NOT NULL,
  role        VARCHAR(20) NOT NULL DEFAULT 'customer'
                CHECK (role IN ('customer','admin','manager','warehouse','delivery')),
  avatar_url  TEXT,
  is_verified BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);


-- 2. ADDRESSES  (1 user → many addresses, fully normalized)
-- ============================================================
CREATE TABLE IF NOT EXISTS addresses (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label      VARCHAR(50) NOT NULL DEFAULT 'Home'
               CHECK (label IN ('Home','Work','Other')),
  line1      TEXT        NOT NULL,
  line2      TEXT,
  city       VARCHAR(100),
  state      VARCHAR(100),
  pincode    VARCHAR(10),
  is_default BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one default address per user (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_addresses_one_default
  ON addresses(user_id) WHERE is_default = true;

CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);


-- 3. COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(30) UNIQUE NOT NULL,
  discount_type VARCHAR(10) NOT NULL CHECK (discount_type IN ('percent','flat')),
  value         NUMERIC(6,2) NOT NULL CHECK (value > 0),
  min_order     NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_uses      INT  NOT NULL DEFAULT 100,
  used_count    INT  NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);


-- 4. ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id),
  address_id      UUID        NOT NULL REFERENCES addresses(id),
  coupon_id       UUID        REFERENCES coupons(id),
  status          VARCHAR(30) NOT NULL DEFAULT 'pending'
                    CHECK (status IN (
                      'pending','confirmed','packed',
                      'shipped','delivered','cancelled','refunded'
                    )),
  total_amount    NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  stripe_pi_id    TEXT UNIQUE,          -- Stripe PaymentIntent ID
  idempotency_key TEXT UNIQUE NOT NULL, -- client UUID, prevents duplicate orders
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);


-- 5. ORDER ITEMS  (junction table — order ↔ product)
--    product data is DENORMALIZED here intentionally:
--    snapshot at order time so product edits don't break history
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  TEXT        NOT NULL,   -- MongoDB _id (cross-DB foreign key by convention)
  name        TEXT        NOT NULL,   -- snapshot
  image_url   TEXT,                   -- snapshot
  price       NUMERIC(10,2) NOT NULL, -- snapshot (price at purchase time)
  quantity    INT         NOT NULL CHECK (quantity > 0),
  unit        VARCHAR(20)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);


-- 6. PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID        NOT NULL REFERENCES orders(id),
  stripe_pi_id    TEXT        UNIQUE NOT NULL,
  amount          NUMERIC(10,2) NOT NULL,
  currency        VARCHAR(5)  NOT NULL DEFAULT 'inr',
  status          VARCHAR(30) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','succeeded','failed','refunded')),
  stripe_receipt  TEXT,
  failure_reason  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status   ON payments(status);


-- 7. OTP_LOGS  (audit table — track OTP requests, not OTP values)
--    Actual OTP values live in Redis (TTL 5 min)
-- ============================================================
CREATE TABLE IF NOT EXISTS otp_logs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  phone      VARCHAR(15) NOT NULL,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_logs_phone ON otp_logs(phone);


-- 8. REFRESH_TOKEN_BLACKLIST  (for logout / token revocation)
-- ============================================================
CREATE TABLE IF NOT EXISTS token_blacklist (
  jti        TEXT        PRIMARY KEY,  -- JWT ID claim
  expires_at TIMESTAMPTZ NOT NULL
);

-- Auto-clean expired tokens periodically (can also use pg_cron)


-- ============================================================
--  Trigger: auto-update updated_at on row change
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
--  Sample seed: one admin user (change phone before running)
-- ============================================================
-- INSERT INTO users (name, phone, role, is_verified)
-- VALUES ('Admin', '9999999999', 'admin', true);





