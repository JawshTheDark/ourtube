import { requireOptionalNativeModule, type EventSubscription } from 'expo';

/** One file from another app's share sheet. `uri` is usually content://; it is read in place, never copied. */
export type SharedFile = {
  uri: string;
  name: string | null;
  size: number | null;
  type: string | null;
  lastModified: number | null;
  readable: boolean;
  error: string | null;
};

export type Shared = { type: string | null; files: SharedFile[]; text: string | null };

type Native = {
  getShared(): Shared | null;
  clear(): void;
  addListener(event: 'onShare', listener: () => void): EventSubscription;
};

// Missing on platforms without the native side (the app is Android-only, but type-checks and tools load this).
const native = requireOptionalNativeModule<Native>('ShareIntent');

/** The share the app was opened with, or the latest one that arrived while it ran; null when there's none. */
export function getShared(): Shared | null {
  return native?.getShared() ?? null;
}

/** Marks the current share as handled, so it isn't picked up again. */
export function clearShared() {
  native?.clear();
}

/** Calls `listener` when something is shared to the app while it is running. */
export function onShare(listener: () => void): { remove: () => void } {
  return native?.addListener('onShare', listener) ?? { remove() {} };
}
