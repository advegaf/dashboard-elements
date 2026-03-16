-- ============================================================
-- LEDGR: Initial Schema Migration
-- ============================================================

-- ── Enums ──────────────────────────────────────────────────

CREATE TYPE staff_role AS ENUM ('owner', 'manager', 'staff');
CREATE TYPE member_status AS ENUM ('active', 'frozen', 'cancelled', 'past_due');
CREATE TYPE plan_interval AS ENUM ('month', 'year', 'day', 'class_pack');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'trialing');
CREATE TYPE payment_status AS ENUM ('succeeded', 'failed', 'refunded', 'pending');
CREATE TYPE access_result AS ENUM ('granted', 'denied_payment', 'denied_frozen', 'denied_cancelled', 'denied_unknown');
CREATE TYPE credential_type AS ENUM ('barcode', 'qr', 'nfc');
CREATE TYPE webhook_status AS ENUM ('pending', 'processed', 'failed');
CREATE TYPE migration_status AS ENUM ('pending', 'link_sent', 'payment_collected', 'completed', 'failed');

-- ── MEM-XXX ID generation ──────────────────────────────────

CREATE SEQUENCE member_id_seq START WITH 1;

CREATE OR REPLACE FUNCTION generate_member_id() RETURNS text AS $$
BEGIN
  RETURN 'MEM-' || LPAD(nextval('member_id_seq')::text, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- ── updated_at trigger function ────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── 1. gyms ────────────────────────────────────────────────

CREATE TABLE gyms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  timezone text NOT NULL DEFAULT 'America/Chicago',
  stripe_account_id text,
  scanner_api_key text,
  grace_period_days int NOT NULL DEFAULT 30,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER gyms_updated_at
  BEFORE UPDATE ON gyms
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 2. profiles ────────────────────────────────────────────

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  gym_id uuid NOT NULL REFERENCES gyms(id),
  role staff_role NOT NULL DEFAULT 'staff',
  full_name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 3. members ─────────────────────────────────────────────

CREATE TABLE members (
  id text PRIMARY KEY DEFAULT generate_member_id(),
  gym_id uuid NOT NULL REFERENCES gyms(id),
  full_name text NOT NULL,
  email text,
  phone text,
  avatar_url text,
  status member_status NOT NULL DEFAULT 'active',
  stripe_customer_id text,
  barcode text,
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_visit_at timestamptz,
  total_visits int NOT NULL DEFAULT 0,
  notes text,
  emergency_contact text,
  -- UI compat columns (populated by Stripe integration in Week 3+)
  billing_status text DEFAULT 'Pending',
  next_payment text,
  payment_method text,
  revenue int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 4. membership_plans ────────────────────────────────────

CREATE TABLE membership_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES gyms(id),
  name text NOT NULL,
  price_cents int NOT NULL,
  interval plan_interval NOT NULL,
  stripe_product_id text,
  stripe_price_id text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── 5. subscriptions ───────────────────────────────────────

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id text NOT NULL REFERENCES members(id),
  plan_id uuid NOT NULL REFERENCES membership_plans(id),
  gym_id uuid NOT NULL REFERENCES gyms(id),
  status subscription_status NOT NULL DEFAULT 'active',
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── 6. payment_events ──────────────────────────────────────

CREATE TABLE payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id text NOT NULL REFERENCES members(id),
  gym_id uuid NOT NULL REFERENCES gyms(id),
  stripe_event_id text UNIQUE,
  amount_cents int NOT NULL,
  status payment_status NOT NULL,
  event_type text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── 7. access_credentials ──────────────────────────────────

CREATE TABLE access_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id text NOT NULL REFERENCES members(id),
  credential_type credential_type NOT NULL,
  credential_value text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── 8. access_events ───────────────────────────────────────

CREATE TABLE access_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id text NOT NULL REFERENCES members(id),
  gym_id uuid NOT NULL REFERENCES gyms(id),
  credential_id uuid REFERENCES access_credentials(id),
  door_id text NOT NULL DEFAULT 'main',
  result access_result NOT NULL,
  scanned_at timestamptz NOT NULL DEFAULT now()
);

-- ── 9. webhook_events ──────────────────────────────────────

CREATE TABLE webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  status webhook_status NOT NULL DEFAULT 'pending',
  error_message text,
  payload jsonb NOT NULL,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── 10. migration_tracking ─────────────────────────────────

CREATE TABLE migration_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id text NOT NULL REFERENCES members(id),
  abc_member_id text,
  status migration_status NOT NULL DEFAULT 'pending',
  payment_link_url text,
  payment_link_sent_at timestamptz,
  payment_collected_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ────────────────────────────────────────────────

CREATE INDEX idx_members_gym_id ON members(gym_id);
CREATE INDEX idx_members_gym_status ON members(gym_id, status);
CREATE INDEX idx_members_barcode ON members(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_subscriptions_member_id ON subscriptions(member_id);
CREATE INDEX idx_access_events_gym_scanned ON access_events(gym_id, scanned_at DESC);
CREATE INDEX idx_access_credentials_member ON access_credentials(member_id);
