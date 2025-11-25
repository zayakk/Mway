import { useEffect, useState, useMemo } from 'react';
import { Pressable, StyleSheet, ScrollView, ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Api, Trip, Station } from '@/lib/api';
import { BrandColors } from '@/constants/theme';

export default function SearchResults() {
  const { origin, destination, date } = useLocalSearchParams<{ origin: string; destination: string; date: string }>();
  const router = useRouter();

  const initialDate = date || new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [originName, setOriginName] = useState('');
  const [destName, setDestName] = useState('');

  // Memoize date buttons for 14 days
  const dateButtons = useMemo(() => {
    const dates: string[] = [];
    const startDate = new Date(initialDate);
    for (let i = 0; i < 14; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  }, [initialDate]);

  // Fetch trips and location names
  useEffect(() => {
    if (!origin || !destination || !selectedDate) return;

    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        // Fetch trips
        const res = await Api.search(Number(origin), Number(destination), selectedDate);
        const results = res.results || [];
        setTrips(results);

        // Set origin/dest names
        if (results.length) {
          setOriginName(results[0].route.origin.city.name);
          setDestName(results[0].route.destination.city.name);
        } else {
          // fallback: fetch station names
          const stations = await Api.stations();
          const originStation = stations.find((s: Station) => s.id === Number(origin));
          const destStation = stations.find((s: Station) => s.id === Number(destination));
          setOriginName(originStation?.city?.name || 'Origin');
          setDestName(destStation?.city?.name || 'Destination');
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load trips');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [origin, destination, selectedDate]);

  const formatTime = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return dateString;
    }
  };

  const formatDateOnly = (dateString: string) => {
    try {
      return new Date(dateString).toISOString().slice(0, 10);
    } catch {
      return dateString;
    }
  };

  const formatDateButton = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const days = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];
      return {
        day: days[d.getDay()],
        date: `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
      };
    } catch {
      return { day: '', date: dateStr };
    }
  };

  const calculateDuration = (depart: string, arrive: string) => {
    try {
      const dep = new Date(depart);
      const arr = new Date(arrive);
      const diff = arr.getTime() - dep.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return { hours, minutes };
    } catch {
      return { hours: 0, minutes: 0 };
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backIcon}>‹</ThemedText>
        </Pressable>
        <View style={styles.headerContent}>
          <ThemedText style={styles.routeText}>{originName} → {destName}</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Огноо сонгон аяллаа хараарай</ThemedText>
          <ThemedText style={styles.dateRange}>
            {dateButtons[0]?.replace(/-/g, '.')} - {dateButtons[dateButtons.length - 1]?.replace(/-/g, '.')}
          </ThemedText>
        </View>
      </View>

      {/* Content */}
      <View style={styles.contentWrapper}>
        {/* Date Selector */}
        <View style={styles.dateSelectorCard}>
          <ThemedText style={styles.dateSelectorLabel}>Аяллын өдөр</ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dateSelector}
            contentContainerStyle={styles.dateSelectorContent}
          >
            {dateButtons.map(dateStr => {
              const { day, date } = formatDateButton(dateStr);
              const isSelected = dateStr === selectedDate;
              return (
                <Pressable
                  key={dateStr}
                  style={[styles.dateButton, isSelected && styles.dateButtonSelected]}
                  onPress={() => setSelectedDate(dateStr)}
                >
                  <ThemedText style={[styles.dateButtonDay, isSelected && styles.dateButtonDaySelected]}>{day}</ThemedText>
                  <ThemedText style={[styles.dateButtonDate, isSelected && styles.dateButtonDateSelected]}>{date}</ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Trip Results */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={BrandColors.primary} />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <ThemedText style={styles.errorText}>⚠️ {error}</ThemedText>
          </View>
        ) : (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {trips.length === 0 ? (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyTitle}>Уучлаарай</ThemedText>
                <ThemedText style={styles.emptyText}>Энэ өдөр зорчих автобус алга байна</ThemedText>
              </View>
            ) : trips.map(trip => {
              const duration = calculateDuration(trip.depart_at, trip.arrive_at);
              return (
                <Pressable
                  key={trip.id}
                  style={styles.tripCard}
                  onPress={() => router.push({ pathname: '/seats', params: { tripId: String(trip.id) } })}
                >
                  <View style={styles.tripCardLeft}>
                    <ThemedText style={styles.tripTime}>{formatTime(trip.depart_at)}</ThemedText>
                    <ThemedText style={styles.tripDate}>{formatDateOnly(trip.depart_at)}</ThemedText>
                  </View>

                  <View style={styles.tripCardCenter}>
                    <ThemedText style={styles.tripBusIcon}>🚌</ThemedText>
                    <ThemedText style={styles.tripDuration}>{duration.hours} Цаг {duration.minutes} Минут</ThemedText>
                    <ThemedText style={styles.tripDistance}>{trip.route.distance_km || 0} км</ThemedText>
                  </View>

                  <View style={styles.tripCardRight}>
                    <ThemedText style={styles.tripTime}>{formatTime(trip.arrive_at)}</ThemedText>
                    <ThemedText style={styles.tripDate}>{formatDateOnly(trip.arrive_at)}</ThemedText>
                    <ThemedText style={styles.tripPrice}>{trip.base_price} MNT</ThemedText>
                    {trip.bus?.insurance_fee && (
                      <ThemedText style={styles.tripInsurance}>
                        Даатгал: {parseFloat(trip.bus.insurance_fee).toLocaleString()} MNT
                      </ThemedText>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.primary },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
  backButton: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 24, color: '#111827', fontWeight: 'bold' },
  headerContent: { flex: 1 },
  routeText: { fontSize: 22, fontWeight: '700', color: '#fff' },
  dateRange: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  contentWrapper: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 24 },
  dateSelectorCard: { paddingHorizontal: 20, marginBottom: 8 },
  dateSelectorLabel: { fontSize: 14, fontWeight: '600', color: '#0f172a', marginBottom: 10 },
  dateSelector: { maxHeight: 90 },
  dateSelectorContent: { paddingHorizontal: 4, paddingVertical: 6, gap: 10 },
  dateButton: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f1f5f9', minWidth: 80, alignItems: 'center', marginRight: 10 },
  dateButtonSelected: { backgroundColor: BrandColors.primary },
  dateButtonDay: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  dateButtonDaySelected: { color: '#fff' },
  dateButtonDate: { fontSize: 12, color: '#111827', fontWeight: '600' },
  dateButtonDateSelected: { color: '#fff' },
  scrollView: { flex: 1, marginTop: 8 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorText: { fontSize: 16, color: '#ef4444', textAlign: 'center' },
  emptyContainer: { padding: 48, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#111827', marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#6b7280', textAlign: 'center' },
  tripCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  tripCardLeft: { alignItems: 'flex-start', marginRight: 16 },
  tripCardCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', marginHorizontal: 16 },
  tripCardRight: { alignItems: 'flex-end', marginLeft: 16 },
  tripTime: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 4 },
  tripDate: { fontSize: 12, color: '#6b7280' },
  tripBusIcon: { fontSize: 24, marginBottom: 8 },
  tripDuration: { fontSize: 14, color: '#374151', marginBottom: 4 },
  tripDistance: { fontSize: 14, color: '#6b7280' },
  tripPrice: { fontSize: 16, fontWeight: '600', color: '#111827', marginTop: 8, marginBottom: 4 },
  tripInsurance: { fontSize: 12, color: '#6b7280' },
});
