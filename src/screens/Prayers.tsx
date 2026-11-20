// The list of prayers, grouped.

import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAvailableLiturgies } from '../liturgy/registry';
import { PRAYER_GROUPS, PRAYER_IDS, PrayerId } from '../prayers';
import { toggleFavoritePrayer } from '../prayers/favorites';
import { searchPrayers } from '../prayers/search';
import { AppTextInput } from '../ui/AppTextInput';
import { useSettings } from '../settings/SettingsProvider';
import { FavoriteStar } from '../ui/FavoriteStar';
import { Card, Divider, ListRow, SectionHeader } from '../ui/kit';
import { FadeIn } from '../ui/motion';
import { useScrollTop } from '../ui/scrollTop';
import { useTabBarSpace } from '../ui/tabBar';
import { SERIF, Theme, radius, space, useTheme, type, useThemedStyles } from '../ui/theme';

export function Prayers() {
  const { settings, messages: m, update } = useSettings();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const tabSpace = useTabBarSpace();
  const scrollProps = useScrollTop('prayers');
  const styles = useThemedStyles(makeStyles);
  const [query, setQuery] = useState('');
  const matches = useMemo(
    () => new Set(searchPrayers(query, PRAYER_IDS, m.prayers.text)),
    [query, m],
  );

  // Empty until a liturgy text is installed, which keeps the entry hidden.
  const liturgies = useMemo(() => getAvailableLiturgies(), []);

  const favorites = settings.favoritePrayers;
  const favoriteList = favorites.filter((id) => matches.has(id));
  // Hidden while searching; the parser already dropped a bookmark whose prayer no longer exists.
  const resume = query.trim() === '' ? settings.lastPrayer : null;

  function open(id: PrayerId, resumeReading = false) {
    router.push({
      pathname: '/prayer/[id]',
      params: resumeReading ? { id, resume: '1' } : { id },
    });
  }

  function renderRow(id: PrayerId, index: number) {
    return (
      <View key={id}>
        {index > 0 && <Divider />}
        <View style={styles.rowWithStar}>
          <View style={styles.rowMain}>
            <ListRow serif hideArrow title={m.prayers.text[id].title} onPress={() => open(id)} />
          </View>
          <FavoriteStar
            selected={favorites.includes(id)}
            label={`${m.prayers.favorite}: ${m.prayers.text[id].title}`}
            onPress={() => update({ favoritePrayers: toggleFavoritePrayer(favorites, id) })}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      {...scrollProps}
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + space.lg,
        paddingBottom: tabSpace,
        paddingHorizontal: space.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
        {m.prayers.title}
      </Text>

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
      {matches.size === 0 && (
        <Text style={styles.empty} accessibilityLiveRegion="polite">
          {m.prayers.noResults}
        </Text>
      )}

      {resume && (
        <FadeIn index={0}>
          <SectionHeader title={m.prayers.continueReading} />
          <Card padding="none">
            <ListRow
              serif
              title={m.prayers.text[resume.id].title}
              accessibilityLabel={`${m.prayers.continueReading}: ${m.prayers.text[resume.id].title}`}
              onPress={() => open(resume.id, true)}
            />
          </Card>
        </FadeIn>
      )}

      {favoriteList.length > 0 && (
        <FadeIn index={1}>
          <SectionHeader title={m.prayers.favorites} />
          <Card padding="none">{favoriteList.map((id, index) => renderRow(id, index))}</Card>
        </FadeIn>
      )}

      {liturgies.length > 0 && query.trim() === '' && (
        <FadeIn index={2}>
          <SectionHeader title={m.liturgy.title} />
          <Card padding="none">
            <ListRow
              serif
              title={m.liturgy.title}
              onPress={() => router.push('/liturgy')}
            />
          </Card>
        </FadeIn>
      )}

      {PRAYER_GROUPS.map((group, groupIndex) => {
        const visible = group.prayers.filter((id) => matches.has(id));
        if (visible.length === 0) return null;
        return (
          <FadeIn key={group.id} index={groupIndex + 2}>
            <SectionHeader title={m.prayers.group[group.id]} />
            <Card padding="none">{visible.map((id, index) => renderRow(id, index))}</Card>
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
      borderColor: t.outline,
      backgroundColor: t.surface,
      color: t.ink,
      ...type.body,
    },
    rowWithStar: { flexDirection: 'row', alignItems: 'center', paddingRight: space.xs },
    rowMain: { flex: 1 },
    empty: { ...type.body, color: t.muted, marginTop: space.lg },
  });
}
