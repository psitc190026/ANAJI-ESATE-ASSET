// =====================================================
// Church Asset Manager settings: edit these values.
// =====================================================
window.CONFIG = {
  // Supabase → Project Settings → Data API (Project URL)
  SUPABASE_URL: "PASTE_YOUR_PROJECT_URL_HERE",

  // Supabase → Project Settings → API Keys (the "anon public" or "publishable" key).
  // This key is safe to publish: the database only lets signed-in admins in.
  SUPABASE_ANON_KEY: "PASTE_YOUR_ANON_KEY_HERE",

  // Shown in the app and on printed reports
  CHURCH_NAME: "Our Church",

  // Currency code for costs and values (e.g. GHS, USD, NGN, GBP)
  CURRENCY: "GHS",

  // Warn about maintenance this many days before it is due
  REMINDER_DAYS: 14
};
