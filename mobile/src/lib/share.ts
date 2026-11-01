import { useEffect, useSyncExternalStore } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { clearShared, getShared, onShare, type SharedFile } from '../../modules/share-intent';

/**
 * Share → OurTube: a video shared from another app (Gallery, Files, Google Photos, Immich…) waits here until the
 * Upload screen takes it. It stays until the upload starts or another file is picked, so signing in first, or
 * switching servers, doesn't lose it. The file is read where it is (a content:// address), never copied.
 */
export type Incoming = { file: SharedFile; skipped: number };

let incoming: Incoming | null = null;
const listeners = new Set<() => void>();
const set = (next: Incoming | null) => {
  incoming = next;
  for (const l of listeners) l();
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** The shared video waiting for the Upload screen, if any. */
export function useIncomingVideo(): Incoming | null {
  return useSyncExternalStore(subscribe, () => incoming);
}

/** The upload started, or the person picked another file: the shared one is done with. */
export function dropIncomingVideo() {
  if (incoming) set(null);
}

/** Reads a new share, if there is one. True when a video is now waiting. */
function take(): boolean {
  const shared = getShared();
  if (!shared) return false;
  clearShared();
  const videos = shared.files.filter((f) => (f.type || shared.type || '').startsWith('video/'));
  if (!shared.files.length) {
    // A link (Immich's Share link, say) or other text: there's no video to upload, so say how to send one.
    const text = (shared.text || '').trim();
    if (/https?:\/\/\S+/.test(text)) {
      Alert.alert('That’s a link, not the video', 'OurTube needs the video file itself. Share the video instead of a link to it: in Immich, use Share, not Share link.');
    } else {
      Alert.alert('Nothing to upload', 'The app you shared from didn’t pass a video along. Try sharing the video itself, or pick it in Upload.');
    }
    return false;
  }
  if (!videos.length) {
    const name = shared.files[0].name;
    Alert.alert('That isn’t a video', `${name ? `"${name}" isn’t` : 'What you shared isn’t'} a video file, so it can’t be uploaded. OurTube takes videos only.`);
    return false;
  }
  const file = videos.find((f) => f.readable);
  if (!file) {
    Alert.alert('Couldn’t read the video', 'OurTube wasn’t allowed to open the shared file. Try sharing it again, or pick it in Upload.');
    return false;
  }
  set({ file, skipped: videos.length - 1 });
  return true;
}

/**
 * For the root layout: picks up a share the app was opened with or one that arrives while it runs, and opens
 * Upload once there's a server to upload to.
 */
export function useShareTarget(ready: boolean) {
  const waiting = useIncomingVideo();
  useEffect(() => {
    take();
    const sub = onShare(() => {
      // A second share replaces one that wasn't uploaded yet.
      if (take()) router.navigate('/upload');
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (ready && waiting) router.navigate('/upload');
    // Only when it first arrives or the app becomes ready, not on every change of the waiting share.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, !!waiting]);
}
