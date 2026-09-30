"use client";

import { useEffect, useSyncExternalStore } from "react";

// The couple's saved vendor ids, fetched once per page load and shared by every heart on it.
// null until they arrive, or for anyone who is not a signed-in couple.
let ids: ReadonlySet<string> | null = null;
let loading = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function set(next: ReadonlySet<string>) {
  ids = next;
  listeners.forEach((listener) => listener());
}

function load() {
  if (loading) return;
  loading = true;
  fetch("/api/favorites")
    .then((response) => (response.ok ? (response.json() as Promise<{ ids: string[] }>) : Promise.reject()))
    .then((data) => set(new Set(data.ids)))
    // Hearts stay usable, only shown empty: waiting on a list that never comes would lock them.
    .catch(() => set(new Set()));
}

export function useFavoriteIds(enabled: boolean): ReadonlySet<string> | null {
  const value = useSyncExternalStore(
    subscribe,
    () => ids,
    () => null,
  );
  useEffect(() => {
    if (enabled) load();
  }, [enabled]);
  return enabled ? value : null;
}

export function markFavorite(vendorId: string, saved: boolean) {
  const next = new Set(ids);
  if (saved) next.add(vendorId);
  else next.delete(vendorId);
  set(next);
}
