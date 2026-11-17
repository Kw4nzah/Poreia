// The list of prayers, grouped.

import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PRAYER_GROUPS, PRAYER_IDS } from '../prayers';
import { searchPrayers } from '../prayers/search';
import { AppTextInput } from '../ui/AppTextInput';
import { useSettings } from '../settings/SettingsProvider';
import { Card, ListRow, SectionHeader } from '../ui/kit';
import { FadeIn } from '../ui/motion';
import { useTabBarSpace } from '../ui/tabBar';
import { SERIF, Theme, radius, space, useTheme, type } from '../ui/theme';

export function Prayers() {
  const { messages: m } = useSettings();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const tabSpace = useTabBarSpace();
  const styles = makeStyles(theme);
  const [query, setQuery] = useState('');
  const matches = useMemo(
    () => new Set(searchPrayers(query, PRAYER_IDS, m.prayers.text)),
    [query, m],
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + space.lg,
        paddingBottom: tabSpace,
        paddingHorizontal: space.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{m.prayers.title}</Text>

      <AppTextInput
        value={query}
        onChangeText={setQuery}
        placeholder={m.prayers.searchPlaceholder}
        placeholderTextColor={theme.muted}
        accessibilityLabel={m.prayers.searchPlaceholder}
        returnKeyType="search"
        autoCorrect={false}
        style={styles.search}
      />
      {matches.size === 0 && <Text style={styles.empty}>{m.prayers.noResults}</Text>}

      {PRAYER_GROUPS.map((group, groupIndex) => {
        const visible = group.prayers.filter((id) => matches.has(id));
        if (visible.length === 0) return null;
        return (
        <FadeIn key={group.id} index={groupIndex}>
          <SectionHeader title={m.prayers.group[group.id]} />
          <Card padding="none">
            {visible.map((id, index) => (
              <ListRow
                key={id}
                serif
                divider={index > 0}
                title={m.prayers.text[id].title}
                onPress={() => router.push({ pathname: '/prayer/[id]', params: { id } })}
              />
            ))}
          </Card>
        </FadeIn>
        );
      })}
    </ScrollView>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.background },
    title: { fontFamily: SERIF, ...type.title1, color: t.ink },
    search: {
      minHeight: 48,
      marginTop: space.md,
      paddingHorizontal: space.md,
      borderRadius: radius.field,
      borderWidth: 1,
      borderColor: t.line,
      backgroundColor: t.surface,
      color: t.ink,
      ...type.body,
    },
    empty: { ...type.body, color: t.muted, marginTop: space.lg },
  });
}
