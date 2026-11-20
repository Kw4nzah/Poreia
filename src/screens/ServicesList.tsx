// The list of readable services (liturgies, daily services, sacraments, canons), grouped.

import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAvailableLiturgies } from '../liturgy/registry';
import { LITURGY_GROUPS, LITURGY_GROUP_OF, LITURGY_SUBGROUP_OF } from '../liturgy/types';
import { useSettings } from '../settings/SettingsProvider';
import { AppTextInput } from '../ui/AppTextInput';
import { Card, Divider, ListRow, SectionHeader } from '../ui/kit';
import { SERIF, Theme, space, type, useThemedStyles } from '../ui/theme';

export function ServicesList() {
  const { messages: m } = useSettings();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
  const [query, setQuery] = useState('');
  const available = useMemo(() => getAvailableLiturgies(), []);
  const needle = query.trim().toLowerCase();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel={m.prayers.title}
        >
          <Text style={styles.backText}>‹ {m.prayers.title}</Text>
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingTop: space.sm,
          paddingBottom: insets.bottom + space.xl,
          paddingHorizontal: space.lg,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
          {m.liturgy.title}
        </Text>
        <AppTextInput
          value={query}
          onChangeText={setQuery}
          placeholder={m.prayers.searchPlaceholder}
          accessibilityLabel={m.prayers.searchPlaceholder}
          autoCorrect={false}
        />
        {LITURGY_GROUPS.flatMap((group) => {
          const ids = available.filter(
            (id) =>
              LITURGY_GROUP_OF[id] === group &&
              (needle === '' || m.liturgy.names[id].toLowerCase().includes(needle)),
          );
          if (ids.length === 0) return [];
          // The Molitvoslov prayers come in sub-lists named as on azbyka.ru.
          const sections: { heading: string; ids: typeof ids }[] = [];
          for (const id of ids) {
            const heading = group === 'molitvoslov' ? (LITURGY_SUBGROUP_OF[id] ?? '') : '';
            const last = sections[sections.length - 1];
            if (last && last.heading === heading) last.ids.push(id);
            else sections.push({ heading, ids: [id] });
          }
          return sections.map(({ heading, ids: rows }, index) => (
            <View key={`${group}-${index}`}>
              <SectionHeader
                title={
                  heading === '' ? m.liturgy.groups[group] : `${m.liturgy.groups[group]}: ${heading}`
                }
              />
              <Card padding="none">
                {rows.map((id, rowIndex) => (
                  <View key={id}>
                    {rowIndex > 0 && <Divider />}
                    <ListRow
                      serif
                      title={m.liturgy.names[id]}
                      onPress={() => router.push({ pathname: '/liturgy/[id]', params: { id } })}
                    />
                  </View>
                ))}
              </Card>
            </View>
          ));
        })}
      </ScrollView>
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.background },
    header: { paddingHorizontal: space.lg },
    back: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
    backText: { ...type.body, color: t.accent },
    title: { fontFamily: SERIF, ...type.title1, color: t.ink, marginBottom: space.md },
  });
}
