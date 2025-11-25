// app/search.tsx
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Api, City, Station } from '@/lib/api';
import { BrandColors } from '@/constants/theme';

export default function SearchScreen() {
  const router = useRouter();
  const rawParams = useLocalSearchParams<{
    originId?: string | string[];
    destId?: string | string[];
    originCityId?: string | string[];
    destCityId?: string | string[];
  }>();

  // Normalize params
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
    Api.cities().then(setCities).catch(e => Alert.alert('Error', e.message));
  }, []);

  // Sync city from URL
  useEffect(() => {
    if (params.originCityId) setOriginCity(Number(params.originCityId));
    if (params.destCityId) setDestCity(Number(params.destCityId));
  }, [params.originCityId, params.destCityId]);

  // Load origin stations
  useEffect(() => {
    if (originCity) {
      Api.stations(originCity).then(stations => {
        setOriginStations(stations);
        if (params.originId) {
          const id = Number(params.originId);
          const station = stations.find(s => s.id === id);
          if (station) {
            setOrigin(id);
            setOriginStationData(station);
            if (station.city?.id !== originCity) setOriginCity(station.city.id);
          }
        }
      }).catch(() => {});
    } else if (!params.originCityId) {
      setOriginStations([]);
      setOrigin(null);
      setOriginStationData(null);
    }
  }, [originCity, params.originId, params.originCityId]);

  // Load destination stations
  useEffect(() => {
    if (destCity) {
      Api.stations(destCity).then(stations => {
        setDestStations(stations);
        if (params.destId) {
          const id = Number(params.destId);
          const station = stations.find(s => s.id === id);
          if (station) {
            setDestination(id);
            setDestStationData(station);
            if (station.city?.id !== destCity) setDestCity(station.city.id);
          }
        }
      }).catch(() => {});
    } else if (!params.destCityId) {
      setDestStations([]);
      setDestination(null);
      setDestStationData(null);
    }
  }, [destCity, params.destId, params.destCityId]);

  const getCityName = (id: number | null) => cities.find(c => c.id === id)?.name || '';
  const getStationName = (id: number | null, stations: Station[]) => stations.find(s => s.id === id)?.name || '';

  const formatDate = (d: string) => {
    try {
      const date = new Date(d);
      const days = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];
      const months = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар',
                      '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'];
      return `${date.getDate()} ${months[date.getMonth()]} ${days[date.getDay()]}`;
    } catch {
      return d;
    }
  };

  const submit = () => {
    const originCityId = originStationData?.city?.id || originCity;
    const destCityId = destStationData?.city?.id || destCity;

    if (!originCityId || !destCityId) {
      Alert.alert('Шаардлагатай', 'Хаанаас, хаашаа сонгоно уу.');
      return;
    }
    if (originCityId === destCityId) {
      Alert.alert('Алдаа', 'Хаанаас болон хаашаа ижил байж болохгүй.');
      return;
    }

    router.push({
      pathname: '/searchResults',
      params: { origin: String(originCityId), destination: String(destCityId), date },
    });
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.push('/')} style={styles.backButton}>
          <ThemedText style={styles.backIcon}>‹</ThemedText>
        </Pressable>
        <ThemedText style={styles.headerTitle}>Автобус</ThemedText>
      </View>

      {/* Search Card */}
      <View style={styles.searchCard}>
        {/* From */}
        <Pressable
          style={styles.inputField}
          onPress={() => router.push({
            pathname: '/locationSelect',
            params: {
              type: 'origin',
              cityId: originCity ? String(originCity) : '',
              originId: origin ? String(origin) : undefined,
              destId: destination ? String(destination) : undefined,
              destCityId: destCity ? String(destCity) : undefined,
            },
          })}
        >
          <ThemedText style={styles.inputIcon}>Building</ThemedText>
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
          onPress={() => router.push({
            pathname: '/locationSelect',
            params: {
              type: 'destination',
              cityId: destCity ? String(destCity) : '',
              originId: origin ? String(origin) : undefined,
              originCityId: originCity ? String(originCity) : undefined,
              destId: destination ? String(destination) : undefined,
            },
          })}
        >
          <ThemedText style={styles.inputIcon}>Pin</ThemedText>
          <View style={styles.inputContent}>
            <ThemedText style={styles.inputLabel}>Хаашаа</ThemedText>
            <ThemedText style={styles.inputValue}>
              {destination ? getStationName(destination, destStations) : getCityName(destCity) || 'Сонгох'}
            </ThemedText>
          </View>
        </Pressable>

        {/* Date */}
        <Pressable style={styles.inputField} onPress={() => Alert.alert('Огноо', 'Тун удахгүй нэмэгдэнэ')}>
          <ThemedText style={styles.inputIcon}>Calendar</ThemedText>
          <View style={styles.inputContent}>
            <ThemedText style={styles.inputLabel}>Огноо</ThemedText>
            <ThemedText style={styles.inputValue}>{formatDate(date)}</ThemedText>
          </View>
        </Pressable>

        {/* Search Button */}
        <Pressable
          onPress={submit}
          style={[styles.searchButton, (!originCity && !origin || !destCity && !destination) && styles.searchButtonDisabled]}
          disabled={!originCity && !origin || !destCity && !destination}
        >
          <ThemedText style={styles.searchIcon}>Search</ThemedText>
          <ThemedText style={styles.searchButtonText}>Хайх</ThemedText>
        </Pressable>
      </View>

      {/* Help Section */}
      <View style={styles.helpSection}>
        <ThemedText style={styles.helpTitle}>Танд тусалъя</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.helpCard}>
            <View style={styles.helpIcon}><ThemedText>Question</ThemedText></View>
            <ThemedText style={styles.helpQuestion}>Онлайн захиалгын үйлчилгээ нэмэлт шимтгэл авдаг уу?</ThemedText>
            <ThemedText style={styles.helpAnswer}>Үгүй. Зөвхөн тасалбарын үнийг төлнө.</ThemedText>
          </View>
          <View style={styles.helpCard}>
            <View style={styles.helpIcon}><ThemedText>Question</ThemedText></View>
            <ThemedText style={styles.helpQuestion}>Захиалгаа хэрхэн цуцлах вэ?</ThemedText>
            <ThemedText style={styles.helpAnswer}>Профайл → Захиалгын түүх хэсгээс цуцлах боломжтой.</ThemedText>
          </View>
        </ScrollView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.primary },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 28, color: BrandColors.primary, fontWeight: 'bold' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  searchCard: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: -20, borderRadius: 16, padding: 20, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  inputField: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, gap: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  inputIcon: { fontSize: 20 },
  inputContent: { flex: 1 },
  inputLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  inputValue: { fontSize: 16, color: '#111827', fontWeight: '500' },
  searchButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: BrandColors.onPrimary, borderRadius: 12, padding: 16, gap: 8, marginTop: 8, borderWidth: 2, borderColor: BrandColors.primary },
  searchButtonDisabled: { backgroundColor: '#e2e8f0', borderColor: '#e2e8f0' },
  searchIcon: { fontSize: 20, color: BrandColors.primary },
  searchButtonText: { color: BrandColors.primary, fontSize: 18, fontWeight: '600' },
  helpSection: { marginTop: 32, paddingHorizontal: 16 },
  helpTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 12 },
  helpCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: 300, marginRight: 12 },
  helpIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  helpQuestion: { fontSize: 14, color: '#374151', marginBottom: 8, lineHeight: 20 },
  helpAnswer: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
});