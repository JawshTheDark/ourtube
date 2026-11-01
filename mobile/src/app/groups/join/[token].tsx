import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/Text';
import { Button, Empty, Icon, Loading, toast } from '@/components/ui';
import { forgetGroups } from '@/lib/groups';
import { hostOf } from '@/lib/format';
import { readable } from '@/lib/layout';
import { useLinkedApi } from '@/lib/scope';
import { useSession } from '@/lib/session';
import { colors } from '@/lib/theme';

type Invite = { group: { id: string; name: string; owner: { display_name: string }; members: number }; member: boolean };

/**
 * A group's join link (the website's /groups/join/:token): who made the group, and a button to join. Joining needs a
 * sign-in on the group's server, so a link from another server first offers to switch to it.
 */
export default function JoinGroup() {
  const { token, server } = useLocalSearchParams<{ token: string; server?: string }>();
  const session = useSession();
  const { api, foreign } = useLinkedApi(server);
  const [data, setData] = useState<Invite | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const signedIn = !!session.user && !foreign;

  useEffect(() => {
    if (!signedIn) return;
    setError(null);
    api
      .get<Invite>(`/groups/invite/${encodeURIComponent(token)}`)
      .then(setData)
      .catch((e) => setError(e.status === 404 && /Not found/i.test(e.message) ? 'Groups need OurTube 1.24 or newer on this server.' : e.message));
  }, [api, token, signedIn]);

  const switchHere = async () => {
    if (!foreign) return;
    try {
      await session.addServer(foreign);
      await session.switchServer(foreign);
    } catch (e: any) {
      toast(e.message);
    }
  };
  const join = async () => {
    setBusy(true);
    try {
      const r = await api.post<{ group: { id: string } }>(`/groups/invite/${encodeURIComponent(token)}/join`);
      forgetGroups();
      router.replace(`/groups/${encodeURIComponent(r.group.id)}` as any);
    } catch (e: any) {
      toast(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (foreign) {
    return (
      <Empty icon="groups" title={`This group is on ${hostOf(foreign)}`}>
        <Text style={{ color: colors.text2, textAlign: 'center' }}>{`You're using ${hostOf(session.server)}. Switch to ${hostOf(foreign)} and sign in there to join.`}</Text>
        <View style={{ marginTop: 12 }}>
          <Button title={`Switch to ${hostOf(foreign)}`} kind="accent" onPress={switchHere} />
        </View>
      </Empty>
    );
  }
  if (!session.user) {
    return (
      <Empty icon="groups" title="Sign in to join the group">
        <Text style={{ color: colors.text2, textAlign: 'center' }}>{`Sign in to ${hostOf(session.server)}, or make an account there, then open the link again.`}</Text>
        <View style={{ marginTop: 12 }}>
          <Button title="Sign in" kind="primary" onPress={() => router.push('/login')} />
        </View>
      </Empty>
    );
  }
  if (error) return <Empty icon="link-off" title={error} />;
  if (!data) return <Loading />;
  const g = data.group;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={[{ padding: 24, gap: 14, alignItems: 'center' }, readable]}>
      <View style={s.icon}>
        <Icon name="groups" size={40} color={colors.text} />
      </View>
      <Text style={s.name}>{g.name}</Text>
      <Text style={{ color: colors.text2, textAlign: 'center', lineHeight: 20 }}>
        {`${g.owner.display_name} invited you. ${g.members} ${g.members === 1 ? 'person is' : 'people are'} in it, and only they see the videos shared with it.`}
      </Text>
      {data.member ? (
        <Button title="You're in: open the group" kind="accent" onPress={() => router.replace(`/groups/${encodeURIComponent(g.id)}` as any)} />
      ) : (
        <Button title={`Join ${g.name}`} kind="accent" busy={busy} onPress={join} />
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  icon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  name: { color: colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center' },
});
