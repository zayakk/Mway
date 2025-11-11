import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

export type DropdownOption = { id: number; name: string };

export function Dropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: DropdownOption[];
  value: number | null;
  onChange: (id: number | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => options.find((o) => o.id === value)?.name ?? '—', [options, value]);
  const toggle = () => setOpen((o) => !o);
  const pick = (id: number) => {
    onChange(id);
    setOpen(false);
  };
  return (
    <View style={styles.wrap}>
      <ThemedText>{label}</ThemedText>
      <Pressable style={styles.input} onPress={toggle}>
        <ThemedText>{selected}</ThemedText>
      </Pressable>
      {open && (
        <View style={styles.menu}>
          {options.map((o) => (
            <Pressable key={o.id} style={styles.option} onPress={() => pick(o.id)}>
              <ThemedText>{o.name}</ThemedText>
            </Pressable>
          ))}
          {!options.length && <ThemedText>—</ThemedText>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },
  menu: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, backgroundColor: '#fff', overflow: 'hidden' },
  option: { paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
});


