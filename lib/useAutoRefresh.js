'use client';
import { useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';

// Calls onChange whenever one of the tables changes (Supabase Realtime).
// Safety nets in case Realtime isn't enabled or the connection drops:
// it also refreshes every `pollMs` and whenever the tab becomes visible again.
export function useAutoRefresh(tables, onChange, pollMs = 30000) {
  const cb = useRef(onChange);
  cb.current = onChange;
  const key = tables.join(',');

  useEffect(() => {
    let timer;
    const trigger = () => { clearTimeout(timer); timer = setTimeout(() => cb.current(), 400); }; // merge bursts of events
    let channel = supabase.channel(`auto-${key}-${Math.random().toString(36).slice(2, 8)}`);
    key.split(',').forEach((table) => {
      channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, trigger);
    });
    channel.subscribe();

    const poll = setInterval(() => { if (!document.hidden) cb.current(); }, pollMs);
    const onVisible = () => { if (!document.hidden) cb.current(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearTimeout(timer); clearInterval(poll);
      document.removeEventListener('visibilitychange', onVisible);
      supabase.removeChannel(channel);
    };
  }, [key, pollMs]);
}
