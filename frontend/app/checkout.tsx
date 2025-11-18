import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Api, Trip } from '@/lib/api';
import { saveBooking } from '@/lib/orders';

export default function Checkout() {
  const { tripId, seats } = useLocalSearchParams<{ tripId: string; seats: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const selectedSeats = useMemo(() => (seats ? String(seats).split(',').filter(Boolean) : []), [seats]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tripId) Api.trip(Number(tripId)).then(setTrip).catch((e) => Alert.alert('Алдаа', e.message));
  }, [tripId]);

  const total = useMemo(() => {
    const unit = trip ? Number(trip.base_price) : 0;
    const insuranceFee = trip?.bus?.insurance_fee ? Number(trip.bus.insurance_fee) : 0;
    return (unit * selectedSeats.length) + (insuranceFee * selectedSeats.length);
  }, [trip, selectedSeats]);

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

  const onPay = async () => {
    if (!tripId || !selectedSeats.length) {
      Alert.alert('Алдаа', 'Аялал эсвэл суудал сонгогдоогүй байна.');
      return;
    }
    if (!name || !phone) {
      Alert.alert('Шаардлагатай', 'Зорчигчийн нэр болон утасны дугаар оруулна уу.');
      return;
    }
    try {
      setLoading(true);
      const result = await Api.book({ trip: Number(tripId), seats: selectedSeats, passenger: { name, phone } });
      // persist to local history
      try {
        await saveBooking({
          id: result?.id ?? `${tripId}-${Date.now()}`,
          trip: Number(tripId),
          seats: selectedSeats,
          total,
          status: result?.status ?? 'confirmed',
          payload: result,
        });
      } catch {}
      router.replace({ pathname: '/confirmation', params: { booking: JSON.stringify(result) } });
    } catch (e: any) {
      Alert.alert('Алдаа', e?.message ?? 'Захиалга амжилтгүй боллоо');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backIcon}>‹</ThemedText>
        </Pressable>
        <ThemedText style={styles.headerTitle}>Төлбөр төлөх</ThemedText>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Trip Info Card */}
        {trip && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <ThemedText style={styles.cardTitle}>Аялалын мэдээлэл</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Зорчигч:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {trip.route.origin.city.name} → {trip.route.destination.city.name}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Огноо:</ThemedText>
              <ThemedText style={styles.infoValue}>{formatDate(trip.depart_at)}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Цаг:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {formatTime(trip.depart_at)} - {formatTime(trip.arrive_at)}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Автобус:</ThemedText>
              <ThemedText style={styles.infoValue}>{trip.bus?.plate_number || 'N/A'}</ThemedText>
            </View>
          </View>
        )}

        {/* Seats & Pricing Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Суудал болон үнэ</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Сонгосон суудал:</ThemedText>
            <ThemedText style={styles.infoValue}>{selectedSeats.join(', ') || '—'}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Нэг суудлын үнэ:</ThemedText>
            <ThemedText style={styles.infoValue}>{trip?.base_price || '0'} MNT</ThemedText>
          </View>
          {trip?.bus?.insurance_fee && (
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Даатгалын шимтгэл:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {parseFloat(trip.bus.insurance_fee).toLocaleString()} MNT
              </ThemedText>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <ThemedText style={styles.totalLabel}>Нийт дүн:</ThemedText>
            <ThemedText style={styles.totalValue}>{total.toLocaleString()} MNT</ThemedText>
          </View>
        </View>

        {/* Passenger Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Зорчигчийн мэдээлэл</ThemedText>
          </View>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Нэр</ThemedText>
            <View style={styles.inputWrapper}>
              <TextInput
                nativeID="checkout-name"
                style={styles.input}
                placeholder="Зорчигчийн нэр оруулна уу"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Утасны дугаар</ThemedText>
            <View style={styles.inputWrapper}>
              <TextInput
                nativeID="checkout-phone"
                style={styles.input}
                placeholder="Утасны дугаар оруулна уу"
                placeholderTextColor="#94a3b8"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <Pressable
          onPress={onPay}
          style={({ pressed }) => [
            styles.payButton,
            pressed && styles.payButtonPressed,
            loading && styles.payButtonDisabled
          ]}
          disabled={loading}
        >
          <ThemedText style={styles.payButtonText}>
            {loading ? 'Боловсруулж байна...' : 'Баталгаажуулах'}
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#111827',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f97316',
  },
  inputGroup: {
    gap: 8,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  inputWrapper: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  payButton: {
    backgroundColor: '#f97316',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});


