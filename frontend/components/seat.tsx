import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

export type SeatStatus = 'available' | 'selected' | 'reserved' | 'disabled';

export interface SeatProps {
  code: string; // display label like "1", "2"
  status: SeatStatus;
  onPress?: () => void;
}

export function Seat({ code, status, onPress }: SeatProps) {
  const base = [styles.seat];
  if (status === 'available') base.push(styles.available);
  if (status === 'selected') base.push(styles.selected);
  if (status === 'reserved') base.push(styles.reserved);
  if (status === 'disabled') base.push(styles.disabled);

  const content = (
    <View style={base}>
      <ThemedText style={styles.label}>{code}</ThemedText>
    </View>
  );
  if (status === 'reserved' || status === 'disabled') return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}> 
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  seat: {
    width: 56,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  available: { backgroundColor: '#fff', borderColor: '#cbd5e1' },
  selected: { backgroundColor: '#e0f2fe', borderColor: '#38bdf8' },
  reserved: { backgroundColor: '#e5e7eb', borderColor: '#9ca3af' },
  disabled: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
  pressed: { opacity: 0.8 },
  label: { fontWeight: '600' },
});


