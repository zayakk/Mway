import { Fragment, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Seat, SeatStatus } from '@/components/seat';
import { ThemedText } from '@/components/themed-text';

export interface SeatCell {
  code: string | null; // null => aisle/empty
  status?: SeatStatus;
}

export interface SeatGridProps {
  layout: SeatCell[][]; // rows of 5 cells: L1, L2, AISLE(null), R1, R2 (last row can have 5)
  selected: Set<string>;
  onToggle: (code: string) => void;
}

export function SeatGrid({ layout, selected, onToggle }: SeatGridProps) {
  const normalized = useMemo(() => layout.map(row => row.map(cell => {
    if (!cell.code) return cell;
    const status: SeatStatus = cell.status ?? (selected.has(cell.code) ? 'selected' : 'available');
    return { ...cell, status };
  })), [layout, selected]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <ThemedText style={styles.header}>Жолооч</ThemedText>
        <ThemedText style={styles.header}>Урд хаалга</ThemedText>
      </View>
      <View style={styles.body}>
        {normalized.map((row, idx) => (
          <View key={idx} style={styles.row}>
            {row.map((cell, j) => (
              <Fragment key={j}>
                {cell.code === null ? (
                  <View style={styles.aisle} />
                ) : (
                  <Seat
                    code={cell.code}
                    status={cell.status as SeatStatus}
                    onPress={() => onToggle(cell.code!)}
                  />
                )}
              </Fragment>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
  header: { fontWeight: '600' },
  body: {
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  aisle: { width: 24 },
});


