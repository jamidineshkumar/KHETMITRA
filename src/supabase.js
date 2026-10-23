import { createClient } from '@supabase/supabase-js';

// These are public client settings. Never place a Supabase secret/service_role key here.
const url =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://hmkbukpudlvyihgntaju.supabase.co';
const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_Z123MyTX2ozwuTTJnQZU2A_Yd4PS-0T';

export const hasSupabaseConfig = Boolean(url && key);

export const supabase = hasSupabaseConfig ? createClient(url, key) : null;
