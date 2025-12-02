import { Fragment, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Seat, SeatStatus } from '@/components/seat';
import { ThemedText } from '@/components/themed-text';

export interface SeatCell {
  code: string | null; // null => aisle/empty
  status?: SeatStatus;
}

export interface SeatGridProps {
  layout: SeatCell[][]; // raw layout from backend or demo
  selected: Set<string>;
  onToggle: (code: string) => void;
}

export function SeatGrid({ layout, selected, onToggle }: SeatGridProps) {
  // Normalize status and flatten, then sort numerically and regroup into rows of 4
  const rows4 = useMemo(() => {
    const withStatus: SeatCell[] = layout
      .flat()
      .filter((cell) => cell && cell.code !== null)
      .map((cell) => {
        const code = String(cell.code);
        const status: SeatStatus = cell.status ?? (selected.has(code) ? 'selected' : 'available');
        return { code, status } as SeatCell;
      })
      .sort((a, b) => Number(a.code) - Number(b.code));

    const rows: SeatCell[][] = [];
    for (let i = 0; i < withStatus.length; i += 4) {
      rows.push(withStatus.slice(i, i + 4));
    }
    return rows;
  }, [layout, selected]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <ThemedText style={styles.header}>Жолооч</ThemedText>
        <ThemedText style={styles.header}>Урд хаалга</ThemedText>
      </View>
      <View style={styles.body}>
        {rows4.map((row, idx) => (
          <View key={idx} style={styles.row}>
            {row.map((cell, j) => (
              <Seat
                key={j}
                code={cell.code!}
                status={cell.status as SeatStatus}
                onPress={() => onToggle(cell.code!)}
              />
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
});


