// A closed field that opens a list of choices underneath it (no native picker needed).

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';
import { radius, space, useTheme, type } from './theme';

export interface DropdownOption<T extends string> {
  id: T;
  label: string;
}

export function Dropdown<T extends string>({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: T | '';
  options: readonly DropdownOption<T>[];
  placeholder: string;
  onChange: (value: T | '') => void;
}) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === value);

  return (
    <View>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={({ pressed }) => [
          styles.field,
          { borderColor: open ? t.accent : t.line, backgroundColor: t.surface },
          pressed && { opacity: 0.85 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={selected ? selected.label : placeholder}
        accessibilityState={{ expanded: open }}
      >
        <Text style={[styles.value, { color: selected ? t.ink : t.muted }]} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} color={t.muted} style={styles.arrow} />
      </Pressable>
      {open && (
        <View style={[styles.list, { borderColor: t.line, backgroundColor: t.surface }]}>
          {[{ id: '' as const, label: placeholder }, ...options].map((option, index) => {
            const active = option.id === value;
            return (
              <Pressable
                key={option.id || 'none'}
                onPress={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
                style={({ pressed }) => [
                  styles.row,
                  index > 0 && { borderTopWidth: 1, borderTopColor: t.line },
                  pressed && { opacity: 0.85 },
                ]}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: active }}
              >
                <Text
                  style={[
                    styles.rowText,
                    { color: active ? t.accent : option.id === '' ? t.muted : t.ink },
                    active && styles.rowActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
    borderRadius: radius.field,
    borderWidth: 1,
    marginTop: space.sm,
  },
  value: { flex: 1, ...type.body },
  arrow: { marginLeft: space.sm },
  list: {
    marginTop: space.xs,
    borderRadius: radius.field,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: { minHeight: 44, justifyContent: 'center', paddingHorizontal: space.md },
  rowText: { ...type.body },
  rowActive: { fontWeight: '600' },
});
