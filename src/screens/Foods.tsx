// "Can I eat this?": search a food and see whether today's fast allows it.

import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CHURCHES, getDayInfo } from '../calendar';
import {
  FOOD_ITEMS,
  FoodItemId,
  FoodNames,
  FoodStatus,
  getFoodStatus,
  groupFoodItems,
  searchFoods,
} from '../foods/lookup';
import { LANGUAGES, MESSAGES } from '../i18n';
import { useSettings } from '../settings/SettingsProvider';
import { AppTextInput } from '../ui/AppTextInput';
import { Badge, type BadgeTone, Card, ListRow, SectionHeader } from '../ui/kit';
import { SERIF, Theme, radius, space, type, useTheme, useThemedStyles } from '../ui/theme';
import { useToday } from '../ui/useToday';

const STATUS_TONE: Record<FoodStatus, BadgeTone> = {
  allowed: 'free',
  forbidden: 'fast',
  disputed: 'warning',
};

/** Food names in every language, so a food is found whichever language it is typed in. */
const ALL_NAMES: readonly FoodNames[] = LANGUAGES.map((language) => MESSAGES[language].foodItem);

export function Foods() {
  const { settings, messages: m } = useSettings();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
  const today = useToday();
  const [query, setQuery] = useState('');

  const info = getDayInfo(today, CHURCHES[settings.churchId], { greekFish: settings.greekFish });
  const searching = query.trim().length > 0;
  const matches = useMemo(() => searchFoods(query, ALL_NAMES), [query]);

  const statusLabel = (status: FoodStatus) =>
    status === 'allowed'
      ? m.foods.statusAllowed
      : status === 'forbidden'
        ? m.foods.statusForbidden
        : m.foods.statusDisputed;

  const renderList = (ids: FoodItemId[]) => (
    <Card padding="none">
      {ids.map((id, index) => (
        <ListRow
          key={id}
          divider={index > 0}
          title={m.foodItem[id]}
          subtitle={m.food[FOOD_ITEMS[id]]}
        />
      ))}
    </Card>
  );

  const groups = searching ? null : groupFoodItems(info.level, info.notes);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/today'))}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel={m.foods.back}
        >
          <Text style={styles.backText}>‹ {m.foods.back}</Text>
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingTop: space.sm,
          paddingBottom: insets.bottom + space.xl,
          paddingHorizontal: space.lg,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title} accessibilityRole="header">
          {m.foods.title}
        </Text>

        <Card style={styles.today} padding="md">
          <Text style={styles.todayLevel}>{m.foods.today(m.level[info.level].title)}</Text>
          <Text style={styles.todayDetail}>{m.level[info.level].detail}</Text>
          {info.notes.map((note) => (
            <Text key={note} style={styles.note}>
              {m.note[note]}
            </Text>
          ))}
        </Card>

        <AppTextInput
          value={query}
          onChangeText={setQuery}
          placeholder={m.foods.searchPlaceholder}
          placeholderTextColor={theme.muted}
          accessibilityLabel={m.foods.searchPlaceholder}
          returnKeyType="search"
          autoCorrect={false}
          style={styles.search}
        />

        {searching && matches.length === 0 && <Text style={styles.empty}>{m.foods.noResults}</Text>}

        {searching &&
          matches.map((id) => {
            const status = getFoodStatus(id, info.level, info.notes);
            const name = m.foodItem[id];
            const group = m.food[FOOD_ITEMS[id]];
            return (
              <Card
                key={id}
                padding="md"
                style={styles.result}
                accessible
                accessibilityLabel={`${name}, ${group}: ${statusLabel(status)}`}
              >
                <Text style={styles.resultName}>{name}</Text>
                <Text style={styles.resultGroup}>{group}</Text>
                <Badge label={statusLabel(status)} tone={STATUS_TONE[status]} style={styles.chip} />
              </Card>
            );
          })}

        {groups && groups.allowed.length > 0 && (
          <>
            <SectionHeader title={m.foods.sectionAllowed} spacing="xl" />
            {renderList(groups.allowed)}
          </>
        )}
        {groups && groups.avoided.length > 0 && (
          <>
            <SectionHeader title={m.foods.sectionAvoided} />
            {renderList(groups.avoided)}
          </>
        )}

        <Text style={styles.disclaimer}>{m.today.disclaimer}</Text>
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
    title: { fontFamily: SERIF, ...type.title1, color: t.ink },
    today: { marginTop: space.md },
    todayLevel: { fontFamily: SERIF, ...type.headline, color: t.ink },
    todayDetail: { ...type.label, color: t.muted, marginTop: space.xs },
    note: { ...type.label, color: t.muted, marginTop: space.sm },
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
    result: { marginTop: space.md },
    resultName: { fontFamily: SERIF, ...type.title3, color: t.ink },
    resultGroup: { ...type.label, color: t.muted, marginTop: space.xs },
    chip: { marginTop: space.smd },
    disclaimer: { ...type.caption, color: t.muted, marginTop: space.lg },
  });
}
