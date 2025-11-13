import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Api, City, Station } from '@/lib/api';

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
      router.replace({ pathname: '/search', params });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backIcon}>‹</ThemedText>
        </Pressable>
        <ThemedText style={styles.headerTitle}>
          {type === 'origin' ? 'Хаанаас' : 'Хаашаа'}
        </ThemedText>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <ThemedText style={styles.searchIcon}>🚌</ThemedText>
          <TextInput
            style={styles.searchInput}
            placeholder={type === 'origin' ? 'Хаанаас: Улс, Хот, Аймаг' : 'Хаашаа: Улс, Хот, Аймаг'}
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
              <ThemedText style={styles.listItemText}>{city.name}</ThemedText>
              <ThemedText style={styles.listItemArrow}>›</ThemedText>
            </Pressable>
          ))
        ) : (
          // Show stations for selected city
          <>
            <Pressable
              style={styles.listItem}
              onPress={() => setSelectedCity(null)}
            >
              <ThemedText style={styles.listItemText}>← Буцах</ThemedText>
            </Pressable>
            {filteredStations.map((station) => (
              <Pressable
                key={station.id}
                style={styles.listItem}
                onPress={() => handleSelect(station.id, station.name, false)}
              >
                <ThemedText style={styles.listItemText}>{station.name}</ThemedText>
                <ThemedText style={styles.listItemArrow}>›</ThemedText>
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
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
  },
  listContent: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  listItemText: {
    fontSize: 16,
    color: '#111827',
  },
  listItemArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
});

