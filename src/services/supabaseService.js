import { supabase, hasSupabaseConfig } from '../supabase';

/**
 * Supabase service integration for KhetMitra.
 * Gracefully operates in offline/local mode if Supabase is unconfigured or unreachable.
 */

export async function checkSupabaseHealth() {
  if (!hasSupabaseConfig || !supabase) {
    return { ok: false, message: 'Supabase credentials not configured in .env.local' };
  }
  try {
    const { error } = await supabase.from('field_alerts').select('id').limit(1);
    if (error) {
      return { ok: false, message: error.message };
    }
    return { ok: true, message: 'Connected to Supabase PostgreSQL & Realtime' };
  } catch (err) {
    return { ok: false, message: err.message || 'Connection failed' };
  }
}

export async function fetchRemoteAlerts() {
  if (!hasSupabaseConfig || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('field_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      side: row.side,
      sensorId: row.sensor_id,
      animal: row.animal,
      threatLevel: row.threat_level,
      severity: row.severity,
      status: row.status,
      time: new Date(row.created_at),
      deterrentAction: row.deterrent_action,
      deterrentSuccess: row.deterrent_success,
      notes: row.notes,
    }));
  } catch (err) {
    console.warn('Failed to fetch remote alerts, using local state:', err);
    return null;
  }
}

export async function pushAlertToRemote(alert) {
  if (!hasSupabaseConfig || !supabase) return false;
  try {
    const { error } = await supabase.from('field_alerts').insert([
      {
        side: alert.side,
        sensor_id: alert.sensorId,
        animal: alert.animal,
        threat_level: alert.threatLevel || 'Medium',
        severity: alert.severity || 'medium',
        status: alert.status || 'New',
        deterrent_action: alert.deterrentAction,
        deterrent_success: alert.deterrentSuccess !== false,
        notes: alert.notes,
      },
    ]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Failed to push alert to Supabase:', err);
    return false;
  }
}

export async function updateRemoteAlertStatus(alertId, newStatus) {
  if (!hasSupabaseConfig || !supabase) return false;
  try {
    const { error } = await supabase
      .from('field_alerts')
      .update({ status: newStatus })
      .eq('id', alertId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Failed to update remote alert status:', err);
    return false;
  }
}

export function subscribeToRealtimeAlerts(onNewAlert, onUpdateAlert) {
  if (!hasSupabaseConfig || !supabase) return () => {};

  const channel = supabase
    .channel('public:field_alerts')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'field_alerts' },
      (payload) => {
        const row = payload.new;
        onNewAlert({
          id: row.id,
          side: row.side,
          sensorId: row.sensor_id,
          animal: row.animal,
          threatLevel: row.threat_level,
          severity: row.severity,
          status: row.status,
          time: new Date(row.created_at),
          deterrentAction: row.deterrent_action,
          deterrentSuccess: row.deterrent_success,
          notes: row.notes,
        });
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'field_alerts' },
      (payload) => {
        onUpdateAlert(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
