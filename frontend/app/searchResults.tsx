import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, ScrollView, ActivityIndicator, Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Api, Trip } from '@/lib/api';

export default function SearchResults() {
  const { origin, destination, date } = useLocalSearchParams<{ origin: string; destination: string; date: string }>();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(date || new Date().toISOString().slice(0, 10));
  const [originName, setOriginName] = useState<string>('');
  const [destName, setDestName] = useState<string>('');

  // Generate next 7 days
  const getDateButtons = () => {
    const dates = [];
    const startDate = new Date(selectedDate);
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  };

  const dateButtons = getDateButtons();

  // Fetch origin and destination names from backend
  useEffect(() => {
    const fetchLocationNames = async () => {
      try {
        const [originStation, destStation] = await Promise.all([
          Api.stations().then(stations => stations.find(s => s.id === Number(origin))),
          Api.stations().then(stations => stations.find(s => s.id === Number(destination))),
        ]);
        if (originStation) {
          setOriginName(originStation.city.name);
        }
        if (destStation) {
          setDestName(destStation.city.name);
        }
      } catch (e) {
        // Ignore errors, will use trip data if available
      }
    };

    if (origin && destination) {
      fetchLocationNames();
    }
  }, [origin, destination]);

  useEffect(() => {
    if (origin && destination && selectedDate) {
      setLoading(true);
      setError(null);
      Api.search(Number(origin), Number(destination), selectedDate)
        .then((r) => {
          setTrips(r.results || []);
          // Update names from trip data if available
          if (r.results && r.results.length > 0) {
            if (!originName) setOriginName(r.results[0].route.origin.city.name);
            if (!destName) setDestName(r.results[0].route.destination.city.name);
          }
          setLoading(false);
        })
        .catch((e) => {
          setError(e.message || 'Failed to load trips');
          setLoading(false);
        });
    }
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
      const d = new Date(dateString);
      return d.toISOString().slice(0, 10);
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
          <ThemedText style={styles.routeText}>
            {originName || 'Origin'} - {destName || 'Destination'}
          </ThemedText>
          <ThemedText style={styles.dateRange}>
            {dateButtons[0]?.replace(/-/g, '.')} - {dateButtons[6]?.replace(/-/g, '.')}
          </ThemedText>
        </View>
      </View>

      {/* Date Selector */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.dateSelector}
        contentContainerStyle={styles.dateSelectorContent}
      >
        {dateButtons.map((dateStr) => {
          const { day, date } = formatDateButton(dateStr);
          const isSelected = dateStr === selectedDate;
          return (
            <Pressable
              key={dateStr}
              style={[styles.dateButton, isSelected && styles.dateButtonSelected]}
              onPress={() => setSelectedDate(dateStr)}
            >
              <ThemedText style={[styles.dateButtonDay, isSelected && styles.dateButtonDaySelected]}>
                {day}
              </ThemedText>
              <ThemedText style={[styles.dateButtonDate, isSelected && styles.dateButtonDateSelected]}>
                {date}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Results */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
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
              <ThemedText style={styles.emptyText}>
                Энэ өдөр зорчих автобус алга байна
              </ThemedText>
            </View>
          ) : (
            trips.map((trip) => {
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
                    <ThemedText style={styles.tripDuration}>
                      {duration.hours} Цаг {duration.minutes} Минут
                    </ThemedText>
                    <ThemedText style={styles.tripDistance}>
                      {trip.route.distance_km || 0} км
                    </ThemedText>
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
            })
          )}
        </ScrollView>
      )}
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
  headerContent: {
    flex: 1,
  },
  routeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  dateRange: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  dateSelector: {
    maxHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dateSelectorContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dateButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    minWidth: 80,
    alignItems: 'center',
    marginRight: 8,
  },
  dateButtonSelected: {
    backgroundColor: '#1f2937',
  },
  dateButtonDay: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  dateButtonDaySelected: {
    color: '#fff',
  },
  dateButtonDate: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '500',
  },
  dateButtonDateSelected: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  tripCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tripCardLeft: {
    alignItems: 'flex-start',
    marginRight: 16,
  },
  tripCardCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  tripCardRight: {
    alignItems: 'flex-end',
    marginLeft: 16,
  },
  tripTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  tripDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  tripBusIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  tripDuration: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  tripDistance: {
    fontSize: 14,
    color: '#6b7280',
  },
  tripPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  tripInsurance: {
    fontSize: 12,
    color: '#6b7280',
  },
});
