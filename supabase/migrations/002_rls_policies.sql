-- ============================================================
-- LEDGR: Row Level Security Policies
-- ============================================================

-- ── Helper: get the current user's gym_id ──────────────────

CREATE OR REPLACE FUNCTION auth_gym_id() RETURNS uuid AS $$
  SELECT gym_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Enable RLS on all tables ───────────────────────────────

ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_tracking ENABLE ROW LEVEL SECURITY;

-- ── gyms ───────────────────────────────────────────────────

CREATE POLICY "gyms_select_own" ON gyms
  FOR SELECT USING (id = auth_gym_id());

CREATE POLICY "gyms_update_owner" ON gyms
  FOR UPDATE USING (
    id = auth_gym_id()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- ── profiles ───────────────────────────────────────────────

CREATE POLICY "profiles_select_own_gym" ON profiles
  FOR SELECT USING (gym_id = auth_gym_id());

CREATE POLICY "profiles_insert_owner" ON profiles
  FOR INSERT WITH CHECK (
    gym_id = auth_gym_id()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- ── members ────────────────────────────────────────────────

CREATE POLICY "members_select_own_gym" ON members
  FOR SELECT USING (gym_id = auth_gym_id());

CREATE POLICY "members_insert_own_gym" ON members
  FOR INSERT WITH CHECK (gym_id = auth_gym_id());

CREATE POLICY "members_update_own_gym" ON members
  FOR UPDATE USING (gym_id = auth_gym_id());

CREATE POLICY "members_delete_own_gym" ON members
  FOR DELETE USING (gym_id = auth_gym_id());

-- ── membership_plans ───────────────────────────────────────

CREATE POLICY "plans_select_own_gym" ON membership_plans
  FOR SELECT USING (gym_id = auth_gym_id());

CREATE POLICY "plans_insert_owner" ON membership_plans
  FOR INSERT WITH CHECK (
    gym_id = auth_gym_id()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "plans_update_owner" ON membership_plans
  FOR UPDATE USING (
    gym_id = auth_gym_id()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- ── subscriptions ──────────────────────────────────────────

CREATE POLICY "subscriptions_select_own_gym" ON subscriptions
  FOR SELECT USING (gym_id = auth_gym_id());

CREATE POLICY "subscriptions_insert_own_gym" ON subscriptions
  FOR INSERT WITH CHECK (gym_id = auth_gym_id());

CREATE POLICY "subscriptions_update_own_gym" ON subscriptions
  FOR UPDATE USING (gym_id = auth_gym_id());

-- ── payment_events (read-only for staff, inserted by webhooks) ─

CREATE POLICY "payments_select_own_gym" ON payment_events
  FOR SELECT USING (gym_id = auth_gym_id());

-- ── access_credentials ─────────────────────────────────────

CREATE POLICY "credentials_select_own_gym" ON access_credentials
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM members WHERE id = access_credentials.member_id AND gym_id = auth_gym_id())
  );

CREATE POLICY "credentials_insert_own_gym" ON access_credentials
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM members WHERE id = access_credentials.member_id AND gym_id = auth_gym_id())
  );

CREATE POLICY "credentials_update_own_gym" ON access_credentials
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM members WHERE id = access_credentials.member_id AND gym_id = auth_gym_id())
  );

CREATE POLICY "credentials_delete_own_gym" ON access_credentials
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM members WHERE id = access_credentials.member_id AND gym_id = auth_gym_id())
  );

-- ── access_events ──────────────────────────────────────────

CREATE POLICY "access_events_select_own_gym" ON access_events
  FOR SELECT USING (gym_id = auth_gym_id());

CREATE POLICY "access_events_insert_own_gym" ON access_events
  FOR INSERT WITH CHECK (gym_id = auth_gym_id());

-- ── webhook_events (service role only — no RLS policies) ───

-- No policies: only the service_role key can read/write webhook_events

-- ── migration_tracking ─────────────────────────────────────

CREATE POLICY "migration_select_own_gym" ON migration_tracking
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM members WHERE id = migration_tracking.member_id AND gym_id = auth_gym_id())
  );

CREATE POLICY "migration_insert_owner" ON migration_tracking
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM members WHERE id = migration_tracking.member_id AND gym_id = auth_gym_id())
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "migration_update_own_gym" ON migration_tracking
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM members WHERE id = migration_tracking.member_id AND gym_id = auth_gym_id())
  );
