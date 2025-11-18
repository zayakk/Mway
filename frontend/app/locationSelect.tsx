import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Api, City, Station } from '@/lib/api';
import { BrandColors } from '@/constants/theme';

export default function LocationSelectScreen() {
  const rawParams = useLocalSearchParams<{ 
    type: string; 
    cityId?: string;
    originId?: string | string[];
    originCityId?: string | string[];
    destId?: string | string[];
    destCityId?: string | string[];
  }>();
  const { type, cityId } = rawParams;
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<number | null>(cityId ? Number(cityId) : null);

  useEffect(() => {
    Api.cities().then(setCities).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedCity) {
      Api.stations(selectedCity).then(setStations).catch(() => {});
    } else {
      setStations([]);
    }
  }, [selectedCity]);

  const filteredCities = cities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStations = stations.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (id: number, name: string, isCity: boolean = false) => {
    if (isCity) {
      // If selecting a city, navigate to stations for that city
      setSelectedCity(id);
    } else {
      // If selecting a station, pass it back via URL params to search page
      // Preserve the other location's params if they exist
      const params: any = {};
      
      // Normalize params (expo-router can return arrays)
      const originId = Array.isArray(rawParams.originId) ? rawParams.originId[0] : rawParams.originId;
      const originCityId = Array.isArray(rawParams.originCityId) ? rawParams.originCityId[0] : rawParams.originCityId;
      const destId = Array.isArray(rawParams.destId) ? rawParams.destId[0] : rawParams.destId;
      const destCityId = Array.isArray(rawParams.destCityId) ? rawParams.destCityId[0] : rawParams.destCityId;
      
      // Preserve the opposite location's selection
      if (type === 'origin') {
        params.originId = String(id);
        if (selectedCity) params.originCityId = String(selectedCity);
        // Preserve destination if it exists
        if (destId) params.destId = String(destId);
        if (destCityId) params.destCityId = String(destCityId);
      } else {
        params.destId = String(id);
        if (selectedCity) params.destCityId = String(selectedCity);
        // Preserve origin if it exists
        if (originId) params.originId = String(originId);
        if (originCityId) params.originCityId = String(originCityId);
      }
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
            {type === 'origin' ? 'Явах хот, буудал' : 'Очих хот, буудал'}
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
          {type === 'origin' ? 'Хаанаас хайх вэ?' : 'Хаашаа хайх вэ?'}
        </ThemedText>
        <View style={styles.searchInputWrapper}>
          <ThemedText style={styles.searchIcon}>🚌</ThemedText>
          <TextInput
            style={styles.searchInput}
            placeholder={type === 'origin' ? 'Хот / Аймаг / Буудлын нэр' : 'Хот / Аймаг / Буудлын нэр'}
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {!selectedCity ? (
          // Show cities
          filteredCities.map((city) => (
            <Pressable
              key={city.id}
              style={styles.listItem}
              onPress={() => handleSelect(city.id, city.name, true)}
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
        ) : (
          // Show stations for selected city
          <>
            <Pressable
              style={styles.listItem}
              onPress={() => setSelectedCity(null)}
            >
              <View style={styles.listTextGroup}>
                <ThemedText style={styles.listItemTitle}>← Хотын жагсаалт руу буцах</ThemedText>
                <ThemedText style={styles.listItemHint}>Өөр хот сонгох бол энд дарна уу</ThemedText>
              </View>
            </Pressable>
            {filteredStations.map((station) => (
              <Pressable
                key={station.id}
                style={styles.listItem}
                onPress={() => handleSelect(station.id, station.name, false)}
              >
                <View style={styles.listTextGroup}>
                  <ThemedText style={styles.listItemTitle}>{station.name}</ThemedText>
                  <ThemedText style={styles.listItemHint}>Буудлыг сонгоход шууд хайлтад буцаана</ThemedText>
                </View>
                <View style={styles.listItemBadge}>
                  <ThemedText style={styles.listItemBadgeText}>Буудал</ThemedText>
                </View>
              </Pressable>
            ))}
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
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  headerContent: {
    flex: 1,
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
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    fontSize: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  list: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: 12,
  },
  listContent: {
    padding: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f4',
  },
  listTextGroup: {
    flex: 1,
    gap: 4,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  listItemHint: {
    fontSize: 13,
    color: '#9ca3af',
  },
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
});

