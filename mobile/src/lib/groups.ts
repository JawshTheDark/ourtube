import { useEffect, useState } from 'react';
import type { Api } from './api';
import { useSession } from './session';
import type { Group } from './types';

// The groups you're in, per server and sign-in: loaded once, forgotten after making, joining or leaving one.
const cache = new Map<string, Group[]>();
const keyOf = (api: Api, userId: string | undefined) => `${api.base}|${userId || ''}`;

/** Loads your groups. A server older than 1.24 has none (its /api/groups is a 404). */
export async function loadGroups(api: Api): Promise<Group[]> {
  try {
    return (await api.get<{ groups: Group[] }>('/groups')).groups;
  } catch (e: any) {
    if (e.status === 404) return [];
    throw e;
  }
}

/** Your groups on the current server, or null while loading (empty when signed out or on an older server). */
export function useMyGroups(): Group[] | null {
  const { api, user } = useSession();
  const key = keyOf(api, user?.id);
  const [groups, setGroups] = useState<Group[] | null>(() => cache.get(key) ?? null);
  useEffect(() => {
    if (!user) return setGroups([]);
    const hit = cache.get(key);
    if (hit) return setGroups(hit);
    let dead = false;
    loadGroups(api)
      .then((g) => {
        cache.set(key, g);
        if (!dead) setGroups(g);
      })
      .catch(() => !dead && setGroups([]));
    return () => {
      dead = true;
    };
  }, [api, user, key]);
  return groups;
}

/** After making, renaming, joining, leaving or deleting a group. */
export function forgetGroups() {
  cache.clear();
}
