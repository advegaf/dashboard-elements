-- ============================================================
-- LEDGR: Auto-link auth users to seeded profiles
-- ============================================================
-- When a user signs in via magic link, Supabase Auth may create a
-- new auth.users row with a random UUID. If a profile was seeded
-- with a different UUID for the same email, this trigger re-links
-- the profile to the real auth UID.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET id = NEW.id
  WHERE email = NEW.email
    AND id != NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
