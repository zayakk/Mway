import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Api, City, Station } from '@/lib/api';
import { BrandColors } from '@/constants/theme';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { FieldCard } from '@/components/ui/field-card';
import { PrimaryButton } from '@/components/ui/primary-button';

export default function MainScreen() {
  const router = useRouter();
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

  // Load cities
  useEffect(() => {
    Api.cities()
      .then(setCities)
      .catch(e => Alert.alert('Error', e.message));
  }, []);

  // Load saved selections from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = JSON.parse(localStorage.getItem('tripSelection') || '{}');
      if (saved.originCityId) setOriginCity(Number(saved.originCityId));
      if (saved.destCityId) setDestCity(Number(saved.destCityId));
      if (saved.originId) setOrigin(Number(saved.originId));
      if (saved.destId) setDestination(Number(saved.destId));
      if (saved.date) setDate(saved.date);
    }
  }, []);

  // Load stations for origin
  useEffect(() => {
    if (originCity) {
      Api.stations(originCity)
        .then(stations => {
          setOriginStations(stations);
          if (origin) {
            const st = stations.find(s => s.id === origin);
            if (st) setOriginStationData(st);
          }
        })
        .catch(() => {});
    }
  }, [originCity, origin]);

  // Load stations for destination
  useEffect(() => {
    if (destCity) {
      Api.stations(destCity)
        .then(stations => {
          setDestStations(stations);
          if (destination) {
            const st = stations.find(s => s.id === destination);
            if (st) setDestStationData(st);
          }
        })
        .catch(() => {});
    }
  }, [destCity, destination]);

  const getCityName = (id: number | null) => cities.find(c => c.id === id)?.name || '';
  const getStationName = (id: number | null, stations: Station[]) => stations.find(s => s.id === id)?.name || '';

  const formatDate = (d: string) => {
    try {
      const dateObj = new Date(d);
      const days = ['Ням','Даваа','Мягмар','Лхагва','Пүрэв','Баасан','Бямба'];
      const months = ['1-р сар','2-р сар','3-р сар','4-р сар','5-р сар','6-р сар',
                      '7-р сар','8-р сар','9-р сар','10-р сар','11-р сар','12-р сар'];
      return `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${days[dateObj.getDay()]}`;
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

  const isSearchDisabled = !((origin || originCity) && (destination || destCity));

  return (
    <Screen scrollable contentContainerStyle={styles.screenContent}>
      <ScreenHeader
        eyebrow="Trip planner"
        title="Автобусны хайлт"
        subtitle="Хот хоорондын аяллаа хэдхэн алхамаар эхлүүлээрэй."
      />

      <View style={styles.card}>
        <Section title="Аяллын мэдээлэл" subtitle="Чиглэл, суудал, огноогоо сонгоод хайлтыг эхлүүлээрэй.">
          <FieldCard
            label="Хаанаас"
            value={origin ? getStationName(origin, originStations) : getCityName(originCity) || ''}
            placeholder="Гарах хот/буудал"
            onPress={() => router.push({
              pathname: '/locationSelect',
              params: { type: 'origin', cityId: originCity ? String(originCity) : '' },
            })}
          />

          <FieldCard
            label="Хаашаа"
            value={destination ? getStationName(destination, destStations) : getCityName(destCity) || ''}
            placeholder="Очих хот/буудал"
            onPress={() => router.push({
              pathname: '/locationSelect',
              params: { type: 'destination', cityId: destCity ? String(destCity) : '' },
            })}
          />

          <FieldCard
            label="Огноо"
            value={formatDate(date)}
            placeholder="Огноо сонгох"
            onPress={() => Alert.alert('Огноо', 'Огноо сонгогч удахгүй нэмэгдэнэ.')}
          />

          <PrimaryButton onPress={submit} disabled={isSearchDisabled}>
            Хайх
          </PrimaryButton>
        </Section>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: { paddingBottom: 80 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
});
