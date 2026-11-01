import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Badge, Input, Section, s as fs } from '@/components/Form';
import { confirm, prompt } from '@/components/Prompt';
import { Text } from '@/components/Text';
import { VideoRow } from '@/components/VideoCard';
import { Avatar, Button, ErrorBox, IconButton, Loading, toast } from '@/components/ui';
import { forgetGroups } from '@/lib/groups';
import { readable } from '@/lib/layout';
import { useSession } from '@/lib/session';
import { colors } from '@/lib/theme';
import type { Group, Video } from '@/lib/types';

type Member = { id: string; username: string; display_name: string; avatar_url: string | null; is_owner: boolean; added_at: number };
type Data = { group: Group; members: Member[]; videos: Video[]; me: string };

/** One group (the website's /groups/:id): its videos, its people, and for its owner adding people and the join link. */
export default function GroupPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { api } = useSession();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const path = `/groups/${encodeURIComponent(id)}`;
  const load = useCallback(
    () =>
      api
        .get<Data>(path)
        .then((d) => {
          setData(d);
          setError(null);
        })
        .catch((e) => setError(e.message)),
    [api, path],
  );
  useEffect(() => {
    load();
  }, [load]);

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!data) return <Loading />;
  const g = data.group;
  const run = async (fn: () => Promise<unknown>, msg?: string) => {
    setBusy(true);
    try {
      await fn();
      if (msg) toast(msg);
      forgetGroups();
      await load();
      return true;
    } catch (e: any) {
      toast(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  };
  const link = g.invite_url ? `${api.base}${g.invite_url}` : null;
  const rename = async () => {
    const name = await prompt({ title: 'Rename the group', defaultValue: g.name, confirmLabel: 'Rename' });
    if (name?.trim()) run(() => api.patch(path, { name: name.trim() }), 'Renamed');
  };
  const remove = async () => {
    if (!(await confirm(`Delete ${g.name}?`, 'Its videos become private to whoever shared them.', { confirmLabel: 'Delete', destructive: true }))) return;
    try {
      await api.del(path);
      forgetGroups();
      router.back();
    } catch (e: any) {
      toast(e.message);
    }
  };
  const leave = async () => {
    if (!(await confirm(`Leave ${g.name}?`, 'Videos you shared with the group become private to you.', { confirmLabel: 'Leave', destructive: true }))) return;
    try {
      await api.del(`${path}/members/${encodeURIComponent(data.me)}`);
      forgetGroups();
      router.back();
    } catch (e: any) {
      toast(e.message);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={[{ padding: 12, gap: 14, paddingBottom: 40 }, readable]} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: g.name }} />
      <Text style={fs.hint}>{`${g.members} ${g.members === 1 ? 'person' : 'people'} · made by ${g.owner.display_name}`}</Text>
      <View style={{ gap: 6 }}>
        <Button title="Share a video" icon="file-upload" kind="accent" onPress={() => router.push('/upload')} style={{ alignSelf: 'flex-start' }} />
        <Text style={fs.hint}>Upload or edit a video and pick this group under Visibility. Only the people below can watch it.</Text>
      </View>

      <Section title="Videos">
        {data.videos.length ? (
          <View style={{ marginHorizontal: -12 }}>
            {data.videos.map((v) => (
              <VideoRow key={v.id} v={v} />
            ))}
          </View>
        ) : (
          <Text style={fs.hint}>Nothing shared yet. Videos set to this group show up here.</Text>
        )}
      </Section>

      <Section title="People">
        {data.members.map((m) => (
          <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 }}>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }} onPress={() => router.push(`/c/${encodeURIComponent(m.username)}`)} accessibilityRole="link">
              <Avatar uri={api.abs(m.avatar_url)} name={m.display_name} size={32} />
              <View style={{ flex: 1 }}>
                <Text style={fs.itemTitle} numberOfLines={1}>
                  {m.display_name}
                </Text>
                <Text style={fs.hint}>{`@${m.username}`}</Text>
              </View>
              {m.is_owner && <Badge text="Owner" />}
            </Pressable>
            {g.is_owner && !m.is_owner && (
              <IconButton
                name="close"
                label={`Remove ${m.display_name}`}
                onPress={async () =>
                  (await confirm(`Remove ${m.display_name} from ${g.name}?`, 'Videos they shared with the group become private.', { confirmLabel: 'Remove', destructive: true })) &&
                  run(() => api.del(`${path}/members/${encodeURIComponent(m.id)}`), 'Removed')
                }
              />
            )}
          </View>
        ))}
        {g.is_owner && (
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Input value={username} onChangeText={setUsername} placeholder="Their username here" autoCapitalize="none" autoCorrect={false} style={{ flex: 1 }} accessibilityLabel="Username" />
            <Button
              title="Add"
              disabled={busy || !username.trim()}
              onPress={async () => {
                if (await run(() => api.post(`${path}/members`, { username: username.trim() }), 'Added')) setUsername('');
              }}
            />
          </View>
        )}
      </Section>

      {g.is_owner ? (
        <>
          <Section title="Join link" hint="Anyone with the link can join after signing in (or making an account), so send it only to the people you mean. A new link stops the old one working.">
            {link ? (
              <>
                <Text style={[fs.input, { fontSize: 13 }]} selectable numberOfLines={2}>
                  {link}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  <Button title="Copy" kind="accent" small onPress={async () => (await Clipboard.setStringAsync(link)) && toast('Link copied')} />
                  <Button title="Share" icon="share" small onPress={() => Share.share({ message: link }).catch(() => {})} />
                  <Button title="New link" small disabled={busy} onPress={() => run(() => api.post(`${path}/invite`), 'New link made')} />
                  <Button title="Turn off" small kind="ghost" disabled={busy} onPress={() => run(() => api.del(`${path}/invite`), 'Link turned off')} />
                </View>
              </>
            ) : (
              <Button title="Make a join link" disabled={busy} onPress={() => run(() => api.post(`${path}/invite`))} style={{ alignSelf: 'flex-start' }} />
            )}
          </Section>
          <Section title="Settings">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Button title="Rename" small disabled={busy} onPress={rename} />
              <Button title="Delete group" small kind="danger" disabled={busy} onPress={remove} />
            </View>
          </Section>
        </>
      ) : (
        <Section title="Leave" hint="Videos you shared with the group become private to you.">
          <Button title="Leave this group" onPress={leave} style={{ alignSelf: 'flex-start' }} />
        </Section>
      )}
    </ScrollView>
  );
}
