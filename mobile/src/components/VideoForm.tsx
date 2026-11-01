import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { Text, TextInput } from './Text';
import { useMyGroups } from '@/lib/groups';
import { useSession } from '@/lib/session';
import { colors } from '@/lib/theme';
import type { Game, Visibility, VideoVisibility } from '@/lib/types';

export type VideoFields = {
  title: string;
  description: string;
  tags: string;
  game: string;
  visibility: VideoVisibility;
  group_id: string | null; // with visibility 'group': which of your groups may watch it
  allow_clips: boolean;
};

export const emptyFields: VideoFields = { title: '', description: '', tags: '', game: '', visibility: 'public', group_id: null, allow_clips: false };

const VIS: { key: Visibility; label: string; hint: string }[] = [
  { key: 'public', label: 'Public', hint: 'Everyone can find and watch it' },
  { key: 'unlisted', label: 'Unlisted', hint: 'Only people with the link' },
  { key: 'private', label: 'Private', hint: 'Only you' },
];

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={f.label}>{label}</Text>
      {children}
    </View>
  );
}

/** A game name with suggestions from the server's game list (videos and live streams use it). */
export function GameField({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  const { api, user } = useSession();
  const [games, setGames] = useState<Game[]>([]);
  const [focus, setFocus] = useState(false);
  useEffect(() => {
    api
      .get<{ games: Game[] }>('/games')
      .then((r) => setGames(r.games))
      .catch(() => {});
  }, [api]);
  const q = value.trim().toLowerCase();
  const matches = useMemo(
    () =>
      games
        .filter((g) => !q || g.name.toLowerCase().includes(q) || (g.short_name || '').toLowerCase().includes(q) || (g.aliases || []).some((a) => a.toLowerCase().includes(q)))
        .slice(0, 6),
    [games, q],
  );
  const exact = games.some((g) => g.name.toLowerCase() === q);
  return (
    <>
      <TextInput
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocus(true)}
        onBlur={() => setTimeout(() => setFocus(false), 150)}
        style={f.input}
        placeholder="Search the game list"
        placeholderTextColor={colors.text2}
      />
      {focus && !exact && matches.length > 0 && (
        <View style={f.suggest}>
          {matches.map((g) => (
            <Pressable key={g.id} onPress={() => onChange(g.name)} style={({ pressed }) => [f.suggestItem, pressed && { backgroundColor: colors.surface3 }]}>
              <Text style={{ color: colors.text }}>{g.name}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {!!q && !exact && !matches.length && !user?.is_moderator && <Text style={f.hint}>Not in this server’s game list. A moderator can add it.</Text>}
    </>
  );
}

/** Title, description, tags, game, visibility: shared by the upload and edit screens. */
export function VideoForm({ value, onChange }: { value: VideoFields; onChange: (v: VideoFields) => void }) {
  const set = <K extends keyof VideoFields>(k: K, v: VideoFields[K]) => onChange({ ...value, [k]: v });
  const groups = useMyGroups();
  // Public, unlisted, private, or only for one of your groups (OurTube 1.24).
  const choices = [
    ...VIS.map((x) => ({ key: x.key as string, label: x.label, hint: x.hint, on: value.visibility === x.key, pick: () => onChange({ ...value, visibility: x.key, group_id: null }) })),
    ...(groups || []).map((g) => ({
      key: `group:${g.id}`,
      label: `Only for ${g.name}`,
      hint: `The ${g.members} ${g.members === 1 ? 'person' : 'people'} in the group`,
      on: value.visibility === 'group' && value.group_id === g.id,
      pick: () => onChange({ ...value, visibility: 'group', group_id: g.id }),
    })),
  ];

  return (
    <View style={{ gap: 16 }}>
      <Field label="Title">
        <TextInput value={value.title} onChangeText={(t) => set('title', t)} style={f.input} placeholder="Give it a title" placeholderTextColor={colors.text2} maxLength={120} />
      </Field>
      <Field label="Description">
        <TextInput
          value={value.description}
          onChangeText={(t) => set('description', t)}
          style={[f.input, { minHeight: 90, textAlignVertical: 'top' }]}
          placeholder="Optional"
          placeholderTextColor={colors.text2}
          multiline
          maxLength={5000}
        />
      </Field>
      <Field label="Game">
        <GameField value={value.game} onChange={(g) => set('game', g)} />
      </Field>
      <Field label="Tags">
        <TextInput value={value.tags} onChangeText={(t) => set('tags', t)} style={f.input} placeholder="ace, clutch, funny" placeholderTextColor={colors.text2} autoCapitalize="none" />
      </Field>
      <Field label="Visibility">
        <View style={{ gap: 8 }}>
          {choices.map((x) => (
            <Pressable key={x.key} onPress={x.pick} style={[f.radio, x.on && f.radioOn]} accessibilityRole="radio" accessibilityState={{ checked: x.on }}>
              <View style={[f.dot, x.on && f.dotOn]} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '600' }}>{x.label}</Text>
                <Text style={f.hint}>{x.hint}</Text>
              </View>
            </Pressable>
          ))}
          {groups?.length === 0 && (
            <Text style={f.hint}>
              To share with just your family or friends,{' '}
              <Text style={{ color: colors.link }} onPress={() => router.push('/groups' as any)}>
                make a group
              </Text>
              .
            </Text>
          )}
        </View>
      </Field>
      <View style={f.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>Allow clipping</Text>
          <Text style={f.hint}>Others can cut their own clips from this one</Text>
        </View>
        <Switch value={value.allow_clips} onValueChange={(b) => set('allow_clips', b)} trackColor={{ true: colors.accent, false: colors.surface3 }} thumbColor="#fff" />
      </View>
    </View>
  );
}

export const f = StyleSheet.create({
  label: { color: colors.text2, fontSize: 13, fontWeight: '600' },
  input: { color: colors.text, fontSize: 15, backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.hairline, paddingHorizontal: 12, paddingVertical: 10 },
  hint: { color: colors.text2, fontSize: 12.5 },
  suggest: { backgroundColor: colors.surface2, borderRadius: 10, overflow: 'hidden' },
  suggestItem: { paddingHorizontal: 12, paddingVertical: 10 },
  radio: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.hairline },
  radioOn: { borderColor: colors.text },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.text2 },
  dotOn: { borderColor: colors.accent, backgroundColor: colors.accent },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
