// Flat row model of the services list: group headers (collapsible, with counts), sub-list headers
// for the Molitvoslov, and service rows. A flat array feeds a FlatList so 500+ rows stay cheap:
// collapsed groups contribute only their header.

import { matchesNormalized, normalizeForSearch } from './search';

export type ListRow<Id extends string = string> =
  | { kind: 'group'; key: string; group: string; count: number; open: boolean }
  | { kind: 'subgroup'; key: string; group: string; title: string; count: number; open: boolean }
  | { kind: 'item'; key: string; id: Id };

export interface ListInput<Id extends string = string> {
  ids: readonly Id[];
  groups: readonly string[];
  groupOf: Readonly<Record<string, string | undefined>>;
  subgroupOf: Readonly<Partial<Record<string, string>>>;
  /** Groups whose items are split into collapsible sub-lists. */
  subdivided: readonly string[];
  nameOf: (id: Id) => string;
  query: string;
  /** Keys of the headers the user opened (see groupKey / subgroupKey). */
  expanded: ReadonlySet<string>;
}

export const groupKey = (group: string) => `g:${group}`;
export const subgroupKey = (group: string, title: string) => `s:${group}:${title}`;

/** The set with `key` removed if present, else added. Returns a new set. */
export function toggleKey(set: ReadonlySet<string>, key: string): Set<string> {
  const next = new Set(set);
  if (!next.delete(key)) next.add(key);
  return next;
}

/**
 * Rows to show. Everything is collapsed by default; a non-empty query opens every group that has a
 * match (and shows only matching services). Empty groups are omitted.
 */
export function buildRows<Id extends string>(input: ListInput<Id>): ListRow<Id>[] {
  const needle = normalizeForSearch(input.query);
  const searching = needle !== '';
  const rows: ListRow<Id>[] = [];
  for (const group of input.groups) {
    const ids = input.ids.filter(
      (id) =>
        input.groupOf[id] === group &&
        (!searching || matchesNormalized(normalizeForSearch(input.nameOf(id)), needle)),
    );
    if (ids.length === 0) continue;
    const gKey = groupKey(group);
    const open = searching || input.expanded.has(gKey);
    rows.push({ kind: 'group', key: gKey, group, count: ids.length, open });
    if (!open) continue;
    if (!input.subdivided.includes(group)) {
      for (const id of ids) rows.push({ kind: 'item', key: id, id });
      continue;
    }
    // Consecutive services with the same sub-list title form one sub-list; untitled ones stay flat.
    const subs: { title: string; ids: Id[] }[] = [];
    for (const id of ids) {
      const title = input.subgroupOf[id] ?? '';
      const last = subs[subs.length - 1];
      if (last && last.title === title) last.ids.push(id);
      else subs.push({ title, ids: [id] });
    }
    for (const sub of subs) {
      if (sub.title === '') {
        for (const id of sub.ids) rows.push({ kind: 'item', key: id, id });
        continue;
      }
      const sKey = subgroupKey(group, sub.title);
      const subOpen = searching || input.expanded.has(sKey);
      rows.push({
        kind: 'subgroup',
        key: sKey,
        group,
        title: sub.title,
        count: sub.ids.length,
        open: subOpen,
      });
      if (subOpen) for (const id of sub.ids) rows.push({ kind: 'item', key: id, id });
    }
  }
  return rows;
}
