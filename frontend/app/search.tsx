import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Api, City, Station } from '@/lib/api';

export default function SearchScreen() {
  const router = useRouter();
  const rawParams = useLocalSearchParams<{ originId?: string | string[]; destId?: string | string[]; originCityId?: string | string[]; destCityId?: string | string[] }>();
  
  // Normalize params (expo-router can return arrays)
  const params = {
    originId: Array.isArray(rawParams.originId) ? rawParams.originId[0] : rawParams.originId,
    destId: Array.isArray(rawParams.destId) ? rawParams.destId[0] : rawParams.destId,
    originCityId: Array.isArray(rawParams.originCityId) ? rawParams.originCityId[0] : rawParams.originCityId,
    destCityId: Array.isArray(rawParams.destCityId) ? rawParams.destCityId[0] : rawParams.destCityId,
  };
  
  const [cities, setCities] = useState<City[]>([]);
  const [originCity, setOriginCity] = useState<number | null>(null);
  const [destCity, setDestCity] = useState<number | null>(null);
  const [originStations, setOriginStations] = useState<Station[]>([]);
  const [destStations, setDestStations] = useState<Station[]>([]);
  const [origin, setOrigin] = useState<number | null>(null);
  const [destination, setDestination] = useState<number | null>(null);
  const [originStationData, setOriginStationData] = useState<Station | null>(null);
  const [destStationData, setDestStationData] = useState<Station | null>(null);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    Api.cities()
      .then(setCities)
      .catch((e) => Alert.alert('Error', e.message));
  }, []);

  // Update from URL params when location is selected
  useEffect(() => {
    if (params.originCityId) {
      const cityId = Number(params.originCityId);
      if (cityId && !isNaN(cityId)) {
        setOriginCity(cityId);
      }
    }
    if (params.destCityId) {
      const cityId = Number(params.destCityId);
      if (cityId && !isNaN(cityId)) {
        setDestCity(cityId);
      }
    }
  }, [params.originCityId, params.destCityId]);

  useEffect(() => {
    if (originCity) {
      Api.stations(originCity)
        .then((stations) => {
          setOriginStations(stations);
          // Set origin station if provided in params
          if (params.originId) {
            const stationId = Number(params.originId);
            const station = stations.find(s => s.id === stationId);
            if (station) {
              setOrigin(stationId);
              setOriginStationData(station);
              // Ensure city is set from station
              if (station.city && station.city.id !== originCity) {
                setOriginCity(station.city.id);
              }
            }
          } else if (origin && !originStationData) {
            // If we have a station ID but no station data, find it
            const station = stations.find(s => s.id === origin);
            if (station) {
              setOriginStationData(station);
            }
          }
        })
        .catch(() => {});
    } else {
      // Only clear if params don't have originCityId
      if (!params.originCityId) {
        setOriginStations([]);
        setOrigin(null);
        setOriginStationData(null);
      }
    }
  }, [originCity, params.originId, params.originCityId, origin]);

  useEffect(() => {
    if (destCity) {
      Api.stations(destCity)
        .then((stations) => {
          setDestStations(stations);
          // Set destination station if provided in params
          if (params.destId) {
            const stationId = Number(params.destId);
            const station = stations.find(s => s.id === stationId);
            if (station) {
              setDestination(stationId);
              setDestStationData(station);
              // Ensure city is set from station
              if (station.city && station.city.id !== destCity) {
                setDestCity(station.city.id);
              }
            } else {
              // If station not found, try to use city ID as fallback
              if (stationId === destCity) {
                setDestination(null); // Will use city ID in submit
                setDestStationData(null);
              }
            }
          } else if (destination && !destStationData) {
            // If we have a station ID but no station data, find it
            const station = stations.find(s => s.id === destination);
            if (station) {
              setDestStationData(station);
            }
          }
        })
        .catch(() => {});
    } else {
      // Only clear if params don't have destCityId
      if (!params.destCityId) {
        setDestStations([]);
        setDestStationData(null);
        setDestination(null);
      }
    }
  }, [destCity, params.destId, params.destCityId, destination]);

  const getCityName = (cityId: number | null) => {
    if (!cityId) return '';
    return cities.find(c => c.id === cityId)?.name || '';
  };

  const getStationName = (stationId: number | null, stations: Station[]) => {
    if (!stationId) return '';
    return stations.find(s => s.id === stationId)?.name || '';
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const days = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];
      const months = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', 
                      '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'];
      return `${d.getDate()} ${months[d.getMonth()]} ${days[d.getDay()]}`;
    } catch {
      return dateStr;
    }
  };

  const submit = () => {
    // Backend expects CITY IDs, not station IDs
    // If station is selected, use its city ID; otherwise use the city ID directly
    const originCityId = originStationData?.city?.id || originCity;
    const destCityId = destStationData?.city?.id || destCity;
    
    if (!originCityId || !destCityId || !date) {
      Alert.alert('Шаардлагатай', 'Хаанаас, хаашаа, огноо сонгоно уу.');
      return;
    }
    if (originCityId === destCityId) {
      Alert.alert('Алдаа', 'Хаанаас болон хаашаа ижил байж болохгүй.');
      return;
    }
    router.push({ 
      pathname: '/searchResults', 
      params: { 
        origin: String(originCityId), 
        destination: String(destCityId), 
        date 
      } 
    });
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backIcon}>‹</ThemedText>
        </Pressable>
        <ThemedText style={styles.headerTitle}>Автобус</ThemedText>
      </View>

      {/* Search Card */}
      <View style={styles.searchCard}>
        {/* From */}
        <Pressable 
          style={styles.inputField}
          onPress={() => {
            // Preserve current selection in URL when navigating
            const currentParams: any = {};
            if (origin) currentParams.originId = String(origin);
            if (originCity) currentParams.originCityId = String(originCity);
            if (destination) currentParams.destId = String(destination);
            if (destCity) currentParams.destCityId = String(destCity);
            router.push({ 
              pathname: '/locationSelect', 
              params: { 
                type: 'origin', 
                cityId: originCity ? String(originCity) : '',
                ...currentParams
              } 
            });
          }}
        >
          <View style={styles.inputIcon}>🏢</View>
          <View style={styles.inputContent}>
            <ThemedText style={styles.inputLabel}>Хаанаас</ThemedText>
            <ThemedText style={styles.inputValue}>
              {origin ? getStationName(origin, originStations) : getCityName(originCity) || 'Сонгох'}
            </ThemedText>
          </View>
        </Pressable>

        {/* To */}
        <Pressable 
          style={styles.inputField}
          onPress={() => {
            // Preserve current selection in URL when navigating
            const currentParams: any = {};
            if (origin) currentParams.originId = String(origin);
            if (originCity) currentParams.originCityId = String(originCity);
            if (destination) currentParams.destId = String(destination);
            if (destCity) currentParams.destCityId = String(destCity);
            router.push({ 
              pathname: '/locationSelect', 
              params: { 
                type: 'destination', 
                cityId: destCity ? String(destCity) : '',
                ...currentParams
              } 
            });
          }}
        >
          <View style={styles.inputIcon}>📍</View>
          <View style={styles.inputContent}>
            <ThemedText style={styles.inputLabel}>Хаашаа</ThemedText>
            <ThemedText style={styles.inputValue}>
              {destination ? getStationName(destination, destStations) : getCityName(destCity) || 'Сонгох'}
            </ThemedText>
          </View>
        </Pressable>

        {/* Date */}
        <Pressable 
          style={styles.inputField}
          onPress={() => {
            // TODO: Open date picker
            Alert.alert('Date Picker', 'Date picker will be implemented');
          }}
        >
          <View style={styles.inputIcon}>📅</View>
          <View style={styles.inputContent}>
            <ThemedText style={styles.inputLabel}>Огноо</ThemedText>
            <ThemedText style={styles.inputValue}>{formatDate(date)}</ThemedText>
          </View>
        </Pressable>

        {/* Search Button */}
        <Pressable 
          onPress={submit} 
          style={[styles.searchButton, (!(origin || originCity) || !(destination || destCity) || !date) && styles.searchButtonDisabled]}
          disabled={!(origin || originCity) || !(destination || destCity) || !date}
        >
          <ThemedText style={styles.searchIcon}>🔍</ThemedText>
          <ThemedText style={styles.searchButtonText}>Хайх</ThemedText>
        </Pressable>
      </View>

      {/* Help Section */}
      <View style={styles.helpSection}>
        <ThemedText style={styles.helpTitle}>Танд тусалъя</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.helpCards}>
          <View style={styles.helpCard}>
            <View style={styles.helpIcon}>❓</View>
            <ThemedText style={styles.helpQuestion}>
              Онлайн захиалгын үйлчилгээ нь ямар нэмэлт шимтгэл байгаа эсэх?
            </ThemedText>
            <ThemedText style={styles.helpAnswer}>Байхгүй.</ThemedText>
          </View>
          <View style={styles.helpCard}>
            <View style={styles.helpIcon}>❓</View>
            <ThemedText style={styles.helpQuestion}>
              Захиалгаа хэрхэн цуцлах вэ?
            </ThemedText>
            <ThemedText style={styles.helpAnswer}>Захиалгын түүхээс цуцлана уу.</ThemedText>
          </View>
        </ScrollView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2937',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#1f2937',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputIcon: {
    fontSize: 20,
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  inputValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f97316',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginTop: 8,
  },
  searchButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  searchIcon: {
    fontSize: 20,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  helpSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  helpCards: {
    gap: 12,
  },
  helpCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: 300,
    marginRight: 12,
  },
  helpIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  helpQuestion: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  helpAnswer: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
});
