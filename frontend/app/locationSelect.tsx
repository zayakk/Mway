import { useEffect, useState, useMemo } from 'react';
import { Pressable, StyleSheet, TextInput, View, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Api, City, Station } from '@/lib/api';
import { BrandColors } from '@/constants/theme';

export default function LocationSelectScreen() {
  const rawParams = useLocalSearchParams<{
    type: string;
    cityId?: string | string[];
    originId?: string | string[];
    originCityId?: string | string[];
    destId?: string | string[];
    destCityId?: string | string[];
  }>();

  const { type } = rawParams;
  const router = useRouter();

  // Safe parsing of cityId (could be string | string[])
  const initialCityId = rawParams.cityId
    ? Number(Array.isArray(rawParams.cityId) ? rawParams.cityId[0] : rawParams.cityId)
    : null;

  const [cities, setCities] = useState<City[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<number | null>(initialCityId);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingStations, setLoadingStations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cities
  useEffect(() => {
    setLoadingCities(true);
    setError(null);
    Api.cities()
      .then(setCities)
      .catch(() => setError('Хотуудыг ачааллахад алдаа гарлаа'))
      .finally(() => setLoadingCities(false));
  }, []);

  // Load stations when city selected
  useEffect(() => {
    if (selectedCity) {
      setLoadingStations(true);
      setError(null);
      Api.stations(selectedCity)
        .then(setStations)
        .catch(() => setError('Буудлуудыг ачааллахад алдаа гарлаа'))
        .finally(() => setLoadingStations(false));
    } else {
      setStations([]);
    }
  }, [selectedCity]);

  // Filter with search
  const filteredCities = useMemo(() => {
    return cities.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cities, searchQuery]);

  const filteredStations = useMemo(() => {
    return stations.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stations, searchQuery]);

  // Get current city name for header
  const currentCityName = selectedCity
    ? cities.find(c => c.id === selectedCity)?.name
    : null;

  const handleSelect = (id: number, isCity: boolean = false) => {
    if (isCity) {
      setSelectedCity(id);
      setSearchQuery(''); // Clear search when entering city
    } else {
      // Normalize all params safely
      const originId = Array.isArray(rawParams.originId) ? rawParams.originId[0] : rawParams.originId;
      const originCityId = Array.isArray(rawParams.originCityId) ? rawParams.originCityId[0] : rawParams.originCityId;
      const destId = Array.isArray(rawParams.destId) ? rawParams.destId[0] : rawParams.destId;
      const destCityId = Array.isArray(rawParams.destCityId) ? rawParams.destCityId[0] : rawParams.destCityId;

      const params: Record<string, string> = {};

      if (type === 'origin') {
        params.originId = String(id);
        if (selectedCity) params.originCityId = String(selectedCity);
        if (destId) params.destId = destId;
        if (destCityId) params.destCityId = destCityId;
      } else {
        params.destId = String(id);
        if (selectedCity) params.destCityId = String(selectedCity);
        if (originId) params.originId = originId;
        if (originCityId) params.originCityId = originCityId;
      }

      // FIX: Та энд '/' биш '/search' руу буцах ёстой байсан
      router.replace({ pathname: '/', params });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backIcon}>‹</ThemedText>
        </Pressable>
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>
            {currentCityName || (type === 'origin' ? 'Явах хот, буудал' : 'Очих хот, буудал')}
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {type === 'origin'
              ? 'Явж буй газраа сонгоод суудлаа баталгаажуул'
              : 'Очих газраа тодорхойлж төгс аяллаа төлөвлөөрэй'}
          </ThemedText>
        </View>
      </View>

      <View style={styles.card}>
        <ThemedText style={styles.cardLabel}>
          {selectedCity ? `“${currentCityName}” хотын буудлууд` : type === 'origin' ? 'Хаанаас хайх вэ?' : 'Хаашаа хайх вэ?'}
        </ThemedText>
        <View style={styles.searchInputWrapper}>
          <ThemedText style={styles.searchIcon}>Search</ThemedText>
          <TextInput
            style={styles.searchInput}
            placeholder={selectedCity ? 'Буудлын нэр' : 'Хот / Аймаг / Буудлын нэр'}
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <ThemedText style={{ fontSize: 18 }}>×</ThemedText>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {error ? (
          <ThemedText style={{ color: 'red', textAlign: 'center', padding: 20 }}>{error}</ThemedText>
        ) : loadingCities ? (
          <ActivityIndicator size="large" color={BrandColors.primary} style={{ marginTop: 40 }} />
        ) : !selectedCity ? (
          filteredCities.length === 0 ? (
            <ThemedText style={styles.emptyText}>Хот олдсонгүй</ThemedText>
          ) : (
            filteredCities.map((city) => (
              <Pressable
                key={city.id}
                style={styles.listItem}
                onPress={() => handleSelect(city.id, true)}
              >
                <View style={styles.listTextGroup}>
                  <ThemedText style={styles.listItemTitle}>{city.name}</ThemedText>
                  <ThemedText style={styles.listItemHint}>Хот сонгоод буудлын жагсаалт руу орно</ThemedText>
                </View>
                <View style={styles.listItemBadge}>
                  <ThemedText style={styles.listItemBadgeText}>Хот</ThemedText>
                </View>
              </Pressable>
            ))
          )
        ) : loadingStations ? (
          <ActivityIndicator size="large" color={BrandColors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <Pressable
              style={styles.listItem}
              onPress={() => {
                setSelectedCity(null);
                setSearchQuery(''); // Clear search on back
              }}
            >
              <View style={styles.listTextGroup}>
                <ThemedText style={styles.listItemTitle}>Хотын жагсаалт руу буцах</ThemedText>
                <ThemedText style={styles.listItemHint}>Өөр хот сонгох</ThemedText>
              </View>
            </Pressable>

            {filteredStations.length === 0 ? (
              <ThemedText style={styles.emptyText}>Буудал олдсонгүй</ThemedText>
            ) : (
              filteredStations.map((station) => (
                <Pressable
                  key={station.id}
                  style={styles.listItem}
                  onPress={() => handleSelect(station.id, false)}
                >
                  <View style={styles.listTextGroup}>
                    <ThemedText style={styles.listItemTitle}>{station.name}</ThemedText>
                    <ThemedText style={styles.listItemHint}>Сонгоход хайлт руу буцна</ThemedText>
                  </View>
                  <View style={styles.listItemBadge}>
                    <ThemedText style={styles.listItemBadgeText}>Буудал</ThemedText>
                  </View>
                </Pressable>
              ))
            )}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.primary,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  backIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerContent: { flex: 1 },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  card: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: { fontSize: 20 },
  searchInput: { flex: 1, fontSize: 16, color: '#111827' },
  list: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  listContent: { padding: 24, paddingBottom: 40 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f4',
  },
  listTextGroup: { flex: 1, gap: 4 },
  listItemTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  listItemHint: { fontSize: 13, color: '#9ca3af' },
  listItemBadge: {
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  listItemBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 40,
  },
});