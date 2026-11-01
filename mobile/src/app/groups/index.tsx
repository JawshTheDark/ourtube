import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Input, s as fs } from '@/components/Form';
import { Text } from '@/components/Text';
import { Button, Empty, ErrorBox, Icon, Loading, toast } from '@/components/ui';
import { forgetGroups, loadGroups } from '@/lib/groups';
import { readable } from '@/lib/layout';
import { useSession } from '@/lib/session';
import { colors } from '@/lib/theme';
import type { Group } from '@/lib/types';

const people = (n: number) => `${n} ${n === 1 ? 'person' : 'people'}`;

/** Your groups (the website's /groups): families and circles of friends to share videos with. */
export default function Groups() {
  const { api, user } = useSession();
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(
    () =>
      loadGroups(api)
        .then((g) => {
          setGroups(g);
          setError(null);
        })
        .catch((e) => setError(e.message)),
    [api],
  );
  useFocusEffect(
    useCallback(() => {
      if (user) load();
    }, [user, load]),
  );
  if (!user) {
    return (
      <Empty icon="lock-outline" title="Sign in first">
        <View style={{ marginTop: 8 }}>
          <Button title="Sign in" kind="primary" onPress={() => router.push('/login')} />
        </View>
      </Empty>
    );
  }
  const create = async () => {
    setBusy(true);
    try {
      const r = await api.post<{ group: Group }>('/groups', { name: name.trim() });
      forgetGroups();
      setName('');
      router.push(`/groups/${encodeURIComponent(r.group.id)}` as any);
    } catch (e: any) {
      toast(e.status === 404 ? 'Groups need OurTube 1.24 or newer on this server.' : e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[{ padding: 12, gap: 10, paddingBottom: 32 }, readable]}
      data={groups || []}
      keyExtractor={(g) => g.id}
      ListHeaderComponent={
        <View style={{ gap: 10, paddingBottom: 4 }}>
          <Text style={fs.hint}>Share videos with just your family or a circle of friends. A video set to a group is only seen by the people in it: it stays off Home, search and the network.</Text>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Input value={name} onChangeText={setName} placeholder="Name a new group, like Family" maxLength={60} style={{ flex: 1 }} onSubmitEditing={() => name.trim() && create()} accessibilityLabel="Group name" />
            <Button title="Make a group" kind="accent" busy={busy} disabled={!name.trim()} onPress={create} />
          </View>
          {!!error && <ErrorBox message={error} onRetry={load} />}
        </View>
      }
      ListEmptyComponent={
        groups ? (
          <Empty icon="groups" title="No groups yet">
            Make one above, then add people or send them the join link.
          </Empty>
        ) : error ? undefined : (
          <Loading />
        )
      }
      renderItem={({ item: g }) => (
        <Pressable style={({ pressed }) => [s.row, pressed && { backgroundColor: colors.surface2 }]} onPress={() => router.push(`/groups/${encodeURIComponent(g.id)}` as any)} accessibilityRole="button">
          <View style={s.icon}>
            <Icon name="groups" size={24} color={colors.text} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={fs.itemTitle}>{g.name}</Text>
            <Text style={fs.hint}>{`${people(g.members)} · ${g.videos} ${g.videos === 1 ? 'video' : 'videos'}${g.is_owner ? '' : ` · made by ${g.owner.display_name}`}`}</Text>
          </View>
          <Icon name="chevron-right" size={22} color={colors.text2} />
        </Pressable>
      )}
    />
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.hairline },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
});
