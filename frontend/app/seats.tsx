import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SeatGrid, SeatCell } from '@/components/seat-grid';
import { useI18n } from '@/i18n';
import { LangSwitch } from '@/components/lang-switch';
import { Api } from '@/lib/api';
import { useRouter } from 'expo-router';

// Demo layout approximating 2+2 with 11 rows + back row (5 seats)
function buildDemoLayout(): SeatCell[][] {
  const rows: SeatCell[][] = [];
  let n = 1;
  for (let i = 0; i < 10; i += 1) {
    rows.push([
      { code: String(n++) },
      { code: String(n++) },
      { code: null },
      { code: String(n++) },
      { code: String(n++) },
    ]);
  }
  // middle rows reserve some seats
  rows[1][0].status = 'reserved'; // 3
  rows[2][4].status = 'reserved'; // 8
  rows[5][1].status = 'reserved'; // 22

  // back row with 4 seats + aisle filler (5th keeps grid): 41-45
  rows.push([
    { code: String(n++) },
    { code: String(n++) },
    { code: String(n++) }, // center back
    { code: String(n++) },
    { code: String(n++) },
  ]);
  return rows;
}

export default function SeatsScreen() {
  const params = useLocalSearchParams<{ tripId?: string }>();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [layout, setLayout] = useState<SeatCell[][]>(buildDemoLayout());
  const maxSelect = 4;
  const { t } = useI18n();
  const router = useRouter();

  // Load layout from backend if tripId is provided
  useEffect(() => {
    const id = params?.tripId ? Number(params.tripId) : null;
    if (!id) return;
    Api.tripSeats(id)
      .then((res) => {
        // backend returns cells with keys { code, status? } or null codes for aisle
        const serverLayout = (res.layout || []) as any[];
        const mapped: SeatCell[][] = serverLayout.map((row: any[]) =>
          row.map((cell: any) => ({ code: cell?.code ?? null, status: cell?.status }))
        );
        setLayout(mapped);
      })
      .catch(() => {
        // keep demo layout on failure
      });
  }, [params?.tripId]);

  const toggle = (code: string) => {
    // find status: if reserved/disabled, ignore
    const flat = layout.flat();
    const seat = flat.find((c) => c.code === code);
    if (!seat || seat.status === 'reserved' || seat.status === 'disabled') return;

    const next = new Set(selected);
    if (next.has(code)) {
      next.delete(code);
    } else {
      if (next.size >= maxSelect) {
        Alert.alert('Limit', t('seats.limit', { n: maxSelect }));
        return;
      }
      next.add(code);
    }
    setSelected(next);
  };

  const onProceed = () => {
    if (!selected.size) {
      Alert.alert('Select', t('seats.pickOne'));
      return;
    }
    const s = Array.from(selected).sort((a,b)=>Number(a)-Number(b)).join(', ');
    if (params?.tripId) {
      router.push({ pathname: '/checkout', params: { tripId: String(params.tripId), seats: s } });
    } else {
      Alert.alert('Confirm', `Selected seats: ${s}`);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.topBar}>
        <ThemedText type="title">{t('seats.title')}</ThemedText>
        <LangSwitch />
      </View>
      <View style={styles.gridWrap}>
        <SeatGrid layout={layout} selected={selected} onToggle={toggle} />
      </View>

      <View style={styles.legend}>
        <Legend color="#fff" border="#cbd5e1" label={t('seats.legend.available')} />
        <Legend color="#e0f2fe" border="#38bdf8" label={t('seats.legend.selected')} />
        <Legend color="#e5e7eb" border="#9ca3af" label={t('seats.legend.reserved')} />
      </View>

      <View style={styles.footer}>
        <ThemedText>
          Сонгосон: {Array.from(selected).sort((a,b)=>Number(a)-Number(b)).join(', ') || '—'}
        </ThemedText>
        <Pressable onPress={onProceed} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}>
          <ThemedText type="defaultSemiBold">{t('seats.continue')}</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

function Legend({ color, border, label }: { color: string; border: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: color, borderColor: border }]} />
      <ThemedText>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gridWrap: { alignItems: 'center' },
  legend: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendSwatch: { width: 28, height: 20, borderWidth: 1, borderRadius: 6 },
  footer: {
    marginTop: 'auto',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
  },
  cta: {
    backgroundColor: '#e0f2fe',
    borderWidth: 1,
    borderColor: '#38bdf8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
});


