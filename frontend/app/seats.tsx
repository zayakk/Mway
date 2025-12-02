import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { SeatGrid, SeatCell } from '@/components/seat-grid';
import { Api, Trip } from '@/lib/api';
import { Screen, ScreenHeader } from '@/components/ui/screen';

function buildDemoLayout(): SeatCell[][] {
  const rows: SeatCell[][] = [];
  let n = 1;
  // 6 rows of 4 seats: 1-24
  for (let i = 0; i < 6; i += 1) {
    rows.push([
      { code: String(n++), status: 'available' },
      { code: String(n++), status: 'available' },
      { code: String(n++), status: 'available' },
      { code: String(n++), status: 'available' },
    ]);
  }
  // Example: mark seat 9 as reserved in the demo
  rows[2][0].status = 'reserved';
  return rows;
}

export default function SeatsScreen() {
  const params = useLocalSearchParams<{ tripId?: string }>();
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [layout, setLayout] = useState<SeatCell[][]>(buildDemoLayout());
  const [trip, setTrip] = useState<Trip | null>(null);
  const maxSelect = 4;
  const [clientToken] = useState(() => `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`);

  const tripId = params?.tripId ? Number(params.tripId) : null;

  useEffect(() => {
    if (!tripId) return;

    Api.trip(tripId)
      .then(setTrip)
      .catch(() => {});

    Api.tripSeats(tripId)
      .then((res: any) => {
        const serverLayout = (res.layout || []) as any[];
        const booked = new Set<string>((res.booked || []).map(String));
        const locked = new Set<string>((res.locked || []).map(String));

        const mapped: SeatCell[][] = serverLayout.map((row: any[]) =>
          row
            .filter((cell: any) => cell && cell.code != null)
            .map((cell: any) => {
              const code = String(cell.code);
              const status: 'available' | 'reserved' =
                booked.has(code) || locked.has(code) ? 'reserved' : 'available';
              return { code, status } as SeatCell;
            })
        );

        if (mapped.length > 0) {
          setLayout(mapped);
        }
      })

      .catch(() => {});
  }, [tripId]);

  const toggle = async (code: string) => {
    if (!tripId) return;
    const flat = layout.flat();
    const seat = flat.find((c) => c.code === code);
    if (!seat || seat.status === 'reserved') return;

    const next = new Set(selected);

    // Deselect: release the seat lock
    if (next.has(code)) {
      try {
        await Api.releaseHolds({ trip: tripId, seats: [code], token: clientToken });
      } catch {
        // ignore release errors, let user continue
      }
      next.delete(code);
      setSelected(next);
      return;
    }

    // Select: respect max limit, then attempt to hold via API
    if (next.size >= maxSelect) {
      Alert.alert('Хязгаар', `Хамгийн ихдээ ${maxSelect} суудал сонгох боломжтой`);
      return;
    }

    try {
      await Api.holds({ trip: tripId, seats: [code], token: clientToken });
      next.add(code);
      setSelected(next);
    } catch (e: any) {
      Alert.alert('Алдаа', e?.message || 'Суудлыг түгжихэд алдаа гарлаа');
    }
  };

  // On unmount, release all selected seats for this token
  useEffect(() => {
    return () => {
      if (!tripId) return;
      const seats = Array.from(selected);
      if (!seats.length) return;
      Api.releaseHolds({ trip: tripId, seats, token: clientToken }).catch(() => {});
    };
  }, [tripId, selected, clientToken]);

  const onProceed = () => {
    if (!selected.size) {
      Alert.alert('Сонгох', 'Хамгийн багадаа нэг суудал сонгоно уу');
      return;
    }
    const s = Array.from(selected).sort((a, b) => Number(a) - Number(b)).join(', ');
    if (params?.tripId) {
      router.push({ pathname: '/checkout', params: { tripId: String(params.tripId), seats: s } });
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return dateStr;
    }
  };

  const availableCount = layout.flat().filter((c) => c.code && c.status === 'available').length;
  const seatCount = selected.size;
  const basePrice = trip?.base_price ? Number(trip.base_price) : 0;
  const totalPrice = seatCount * basePrice;
  const selectedList = Array.from(selected)
    .sort((a, b) => Number(a) - Number(b))
    .join(', ');

  const headerSubtitle = trip
    ? `${trip.route.origin.city.name} → ${trip.route.destination.city.name} · ${formatDate(trip.depart_at)}`
    : undefined;

  return (
    <Screen scrollable>
      <ScreenHeader
        eyebrow="Trip"
        title="Суудал сонгох"
        subtitle={headerSubtitle}
      />

      <View style={styles.contentWrapper}>
        {/* Bus Details Card */}
        <View style={styles.busDetailsCard}>
          <View style={styles.busHeader}>
            <ThemedText style={styles.busIcon}>🚌</ThemedText>
            <ThemedText style={styles.busNumber}>
              {trip?.bus?.plate_number || 'N/A'} УКМ
            </ThemedText>
          </View>

          <View style={styles.busInfo}>
            <View style={styles.busInfoRow}>
              <ThemedText style={styles.busInfoLabel}>Аж ахуй нэгж:</ThemedText>
              <ThemedText style={styles.busInfoValue}>
                {trip?.operator?.name || trip?.bus?.operator_name || 'N/A'}
              </ThemedText>
            </View>
            {trip?.bus?.insurance_company && (
              <View style={styles.busInfoRow}>
                <ThemedText style={styles.busInfoLabel}>Даатгал:</ThemedText>
                <ThemedText style={styles.busInfoValue}>
                  {trip.bus.insurance_company}
                </ThemedText>
              </View>
            )}
            {trip?.bus?.insurance_fee && (
              <View style={styles.busInfoRow}>
                <ThemedText style={styles.busInfoLabel}>Даатгалын шимтгэл:</ThemedText>
                <ThemedText style={styles.busInfoValue}>
                  {parseFloat(trip.bus.insurance_fee).toLocaleString()} MNT
                </ThemedText>
              </View>
            )}
            <View style={styles.busInfoRow}>
              <ThemedText style={styles.busInfoLabel}>Марк загвар:</ThemedText>
              <ThemedText style={styles.busInfoValue}>
                {trip?.bus?.bus_type || 'N/A'}
              </ThemedText>
            </View>
            {trip?.bus?.total_seats && (
              <View style={styles.busInfoRow}>
                <ThemedText style={styles.busInfoLabel}>Нийт суудал:</ThemedText>
                <ThemedText style={styles.busInfoValue}>
                  {trip.bus.total_seats}
                </ThemedText>
              </View>
            )}
            {trip?.available_seats !== undefined && (
              <View style={styles.busInfoRow}>
                <ThemedText style={styles.busInfoLabel}>Боломжтой суудал:</ThemedText>
                <ThemedText style={styles.busInfoValue}>
                  {trip.available_seats}
                </ThemedText>
              </View>
            )}
            {trip?.bus?.amenities && (
              <View style={styles.busInfoRow}>
                <ThemedText style={styles.busInfoLabel}>Тоног төхөөрөмж:</ThemedText>
                <ThemedText style={styles.busInfoValue}>
                  {trip.bus.amenities}
                </ThemedText>
              </View>
            )}
            {trip && (
              <>
                <View style={styles.busInfoDivider} />
                <View style={styles.busInfoRow}>
                  <ThemedText style={styles.busInfoLabel}>Хөдөлгөөн:</ThemedText>
                  <ThemedText style={styles.busInfoValue}>
                    {formatTime(trip.depart_at)} - {formatTime(trip.arrive_at)}
                  </ThemedText>
                </View>
                <View style={styles.busInfoRow}>
                  <ThemedText style={styles.busInfoLabel}>Зорчигч:</ThemedText>
                  <ThemedText style={styles.busInfoValue}>
                    {trip.route?.origin?.name || trip.route?.origin?.city?.name} → {trip.route?.destination?.name || trip.route?.destination?.city?.name}
                  </ThemedText>
                </View>
                <View style={styles.busInfoRow}>
                  <ThemedText style={styles.busInfoLabel}>Зай:</ThemedText>
                  <ThemedText style={styles.busInfoValue}>
                    {trip.route?.distance_km || 0} км
                  </ThemedText>
                </View>
                <View style={styles.busInfoRow}>
                  <ThemedText style={styles.busInfoLabel}>Үнэ:</ThemedText>
                  <ThemedText style={styles.busInfoValue}>
                    {trip.base_price} MNT
                  </ThemedText>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Seat Selection Title */}
        <ThemedText style={styles.seatTitle}>Суудал сонгох</ThemedText>
        <ThemedText style={styles.seatSubtitle}>
          Нэг захиалга дээр хамгийн ихдээ {maxSelect} суудал сонгох боломжтой.
        </ThemedText>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendCircle, styles.legendAvailable]} />
            <ThemedText style={styles.legendText}>
              Боломжтой - {availableCount}
            </ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendCircle, styles.legendSelected]} />
            <ThemedText style={styles.legendText}>Таны сонголт</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendCircle, styles.legendUnavailable]} />
            <ThemedText style={styles.legendText}>Захиалсан / түгжсэн</ThemedText>
          </View>
        </View>

        {/* Seat Grid */}
        <View style={styles.gridContainer}>
          <SeatGrid layout={layout} selected={selected} onToggle={toggle} />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={styles.selectedText}>
            Сонгосон: {seatCount || '0'} суудал
            {selectedList ? ` (${selectedList})` : ''}
            {basePrice > 0
              ? `\nНийт үнэ: ${totalPrice.toLocaleString()} MNT`
              : ''}
          </ThemedText>
          <Pressable
            onPress={onProceed}
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.continueButtonPressed,
              selected.size === 0 && styles.continueButtonDisabled,
            ]}
            disabled={selected.size === 0}
          >
            <ThemedText style={styles.continueButtonText}>Үргэлжлүүлэх</ThemedText>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  contentWrapper: {
    paddingVertical: 8,
    gap: 24,
  },
  busDetailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  busHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  busIcon: {
    fontSize: 24,
  },
  busNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  busInfo: {
    gap: 12,
  },
  busInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  busInfoLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  busInfoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  busInfoDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  seatTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  seatSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 16,
  },
  legend: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  legendAvailable: {
    backgroundColor: '#fff',
    borderColor: '#cbd5e1',
  },
  legendSelected: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  legendUnavailable: {
    backgroundColor: '#e5e7eb',
    borderColor: '#9ca3af',
  },
  legendText: {
    fontSize: 14,
    color: '#374151',
  },
  gridContainer: {
    marginBottom: 24,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  selectedText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  continueButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  continueButtonDisabled: {
    backgroundColor: '#e5e7eb',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});