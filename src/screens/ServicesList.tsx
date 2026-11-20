// The list of readable services, grouped in collapsible sections. Groups start closed (the list has
// 500+ services); searching opens every group that has a match. A "continue" row reopens the service
// read last. The list is a flat FlatList of header and service rows, so closed groups cost nothing.

import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ListRow as Row, buildRows, toggleKey } from '../liturgy/listModel';
import { LiturgyProgress, emptyProgress, hasProgress, percentRead } from '../liturgy/progress';
import { readProgress } from '../liturgy/progressStore';
import { getAvailableLiturgies } from '../liturgy/registry';
import {
  LITURGY_GROUPS,
  LITURGY_GROUP_OF,
  LITURGY_SUBGROUP_OF,
  LiturgyId,
} from '../liturgy/types';
import { useSettings } from '../settings/SettingsProvider';
import { AppTextInput } from '../ui/AppTextInput';
import { BookmarkRibbon } from '../ui/BookmarkRibbon';
import { Card, ListRow } from '../ui/kit';
import { SERIF, Theme, space, type, useThemedStyles } from '../ui/theme';

/** Groups whose services are split into named sub-lists. */
const SUBDIVIDED = ['molitvoslov'];

export function ServicesList() {
  const { messages: m } = useSettings();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());
  const [progress, setProgress] = useState<LiturgyProgress>(emptyProgress);
  const available = useMemo(() => getAvailableLiturgies(), []);
  const searching = query.trim() !== '';

  // Re-read the bookmark each time the list comes back into view (after reading).
  useFocusEffect(
    useCallback(() => {
      let live = true;
      readProgress().then((p) => live && setProgress(p));
      return () => {
        live = false;
      };
    }, []),
  );

  const rows = useMemo(
    () =>
      buildRows<LiturgyId>({
        ids: available,
        groups: LITURGY_GROUPS,
        groupOf: LITURGY_GROUP_OF,
        subgroupOf: LITURGY_SUBGROUP_OF,
        subdivided: SUBDIVIDED,
        nameOf: (id) => m.liturgy.names[id],
        query,
        expanded,
      }),
    [available, m, query, expanded],
  );

  const open = useCallback(
    (id: LiturgyId) => router.push({ pathname: '/liturgy/[id]', params: { id } }),
    [router],
  );
  const toggle = useCallback((key: string) => setExpanded((s) => toggleKey(s, key)), []);

  const last = progress.last && available.includes(progress.last.id) ? progress.last.id : null;
  const lastDetail = last ? progress.details[last] : undefined;
  const lastPercent = percentRead(lastDetail);
  const lastLines = [
    [lastPercent !== null ? m.liturgy.percentRead(lastPercent) : null, lastDetail?.snippet || null]
      .filter(Boolean)
      .join(' · '),
    lastDetail?.bookmark
      ? `${m.liturgy.bookmark}: ${lastDetail.bookmark.snippet}`.trimEnd()
      : '',
  ].filter(Boolean);

  function renderRow({ item, index }: { item: Row<LiturgyId>; index: number }) {
    if (item.kind === 'item') {
      const prev = rows[index - 1];
      const detail = progress.details[item.id];
      const marked = hasProgress(detail);
      const pct = marked ? percentRead(detail) : null;
      const mark = detail?.bookmark ? m.liturgy.bookmark : null;
      const spoken = [pct !== null ? m.liturgy.percentRead(pct) : null, mark].filter(Boolean).join(', ');
      return (
        <View style={styles.item}>
          {prev?.kind === 'item' && <View style={styles.hairline} />}
          <ListRow
            serif
            title={m.liturgy.names[item.id]}
            onPress={() => open(item.id)}
            accessibilityLabel={spoken ? `${m.liturgy.names[item.id]}, ${spoken}` : undefined}
            trailing={
              marked && (pct !== null || mark) ? (
                <View style={styles.marks}>
                  {mark && <BookmarkRibbon width={10} height={18} />}
                  {pct !== null && <Text style={styles.pct}>{pct}%</Text>}
                </View>
              ) : undefined
            }
          />
        </View>
      );
    }
    const isGroup = item.kind === 'group';
    const title = isGroup ? m.liturgy.groups[item.group as keyof typeof m.liturgy.groups] : item.title;
    return (
      <Pressable
        onPress={() => !searching && toggle(item.key)}
        disabled={searching}
        style={[styles.header, isGroup ? styles.groupHeader : styles.subHeader]}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${item.count}`}
        accessibilityState={{ expanded: item.open, disabled: searching }}
      >
        <Text style={styles.chevron}>{item.open ? '▾' : '▸'}</Text>
        <Text
          style={isGroup ? styles.groupTitle : styles.subTitle}
          numberOfLines={2}
          maxFontSizeMultiplier={1.4}
        >
          {title}
        </Text>
        <Text style={styles.count}>{item.count}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.top, { paddingTop: insets.top + space.lg }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel={m.prayers.title}
        >
          <Text style={styles.backText}>‹ {m.prayers.title}</Text>
        </Pressable>
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
      </View>
      <FlatList
        data={rows}
        keyExtractor={(row) => row.key}
        renderItem={renderRow}
        extraData={progress}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={16}
        windowSize={7}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          last && !searching ? (
            <Card
              padding="none"
              style={styles.resume}
              onPress={() => open(last)}
              accessibilityRole="button"
              accessibilityLabel={[m.liturgy.continueTitle, m.liturgy.names[last], ...lastLines].join(': ')}
            >
              <ListRow
                serif
                overline={m.liturgy.continueTitle}
                title={m.liturgy.names[last]}
                subtitle={lastLines.length > 0 ? lastLines.join('\n') : undefined}
                hideArrow={false}
              />
            </Card>
          ) : undefined
        }
        ListEmptyComponent={
          <Text style={styles.empty} accessibilityLiveRegion="polite">
            {m.liturgy.noResults}
          </Text>
        }
        contentContainerStyle={{
          paddingTop: space.sm,
          paddingBottom: insets.bottom + space.xl,
          paddingHorizontal: space.lg,
        }}
      />
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.background },
    top: { paddingHorizontal: space.lg },
    back: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
    backText: { ...type.body, color: t.accent },
    title: { fontFamily: SERIF, ...type.title1, color: t.ink, marginBottom: space.md },
    resume: { marginTop: space.sm, marginBottom: space.xs },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 48,
      paddingVertical: space.smd,
      gap: space.sm,
    },
    groupHeader: {
      marginTop: space.md,
      paddingHorizontal: space.md,
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.line,
      borderRadius: 16,
    },
    subHeader: { paddingLeft: space.lg, paddingRight: space.md },
    chevron: { ...type.body, color: t.accent, width: 18, textAlign: 'center' },
    groupTitle: { flex: 1, fontFamily: SERIF, ...type.headline, color: t.ink },
    subTitle: { flex: 1, ...type.label, color: t.muted },
    count: { ...type.label, color: t.muted },
    item: {
      marginLeft: space.md,
      backgroundColor: t.surface,
      borderLeftWidth: 2,
      borderColor: t.line,
    },
    marks: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    pct: { ...type.label, color: t.muted },
    hairline: { height: StyleSheet.hairlineWidth, backgroundColor: t.line },
    empty: { ...type.body, color: t.muted, marginTop: space.lg },
  });
}
