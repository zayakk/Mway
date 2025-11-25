import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Api, City, Station } from '@/lib/api';
import { BrandColors } from '@/constants/theme';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { FieldCard } from '@/components/ui/field-card';
import { PrimaryButton } from '@/components/ui/primary-button';

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
            value={origin ? getStationName(origin, originStations) : getCityName(originCity)}
            placeholder="Гарах хот/буудал"
            icon={<IconBadge icon="🏢" />}
            onPress={() => {
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
                  ...currentParams,
                },
              });
            }}
            accessibilityLabel="Хаанаас сонгох"
          />

          <FieldCard
            label="Хаашаа"
            value={destination ? getStationName(destination, destStations) : getCityName(destCity)}
            placeholder="Очих хот/буудал"
            icon={<IconBadge icon="📍" />}
            onPress={() => {
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
                  ...currentParams,
                },
              });
            }}
            accessibilityLabel="Хаашаа сонгох"
          />
          

          <FieldCard
            label="Огноо"
            value={formatDate(date)}
            placeholder="Огноо сонгох"
            icon={<IconBadge icon="📅" />}
            onPress={() => Alert.alert('Огноо', 'Огноо сонгогч удахгүй нэмэгдэнэ.')}
            accessibilityLabel="Аяллын огноо"
          />

          <PrimaryButton
            onPress={submit}
            disabled={!(origin || originCity) || !(destination || destCity) || !date}
            accessibilityLabel="Аяллыг хайх"
          >
            Хайх
          </PrimaryButton>
        </Section>
      </View>

      <Section title="Танд тусалъя" subtitle="Түгээмэл асуултын хариулт">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.helpCards}>
          {helpItems.map((item) => (
            <View key={item.question} style={styles.helpCard}>
              <IconBadge icon="❓" />
              <ThemedText style={styles.helpQuestion}>{item.question}</ThemedText>
              <ThemedText style={styles.helpAnswer}>{item.answer}</ThemedText>
            </View>
          ))}
        </ScrollView>
      </Section>
    </Screen>
  );
}

const helpItems = [
  {
    question: 'Онлайн захиалгын үйлчилгээ нэмэлт шимтгэл авдаг уу?',
    answer: 'Үгүй. Та зөвхөн тасалбарын үнийг төлнө.',
  },
  {
    question: 'Захиалгаа хэрхэн цуцлах вэ?',
    answer: 'Профайл > Захиалгын түүх хэсгээс цуцлах боломжтой.',
  },
];

function IconBadge({ icon }: { icon: string }) {
  return (
    <View style={styles.iconBadge}>
      <ThemedText style={styles.iconBadgeText}>{icon}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: 80,
  },
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
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: BrandColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeText: {
    fontSize: 22,
  },
  helpCards: {
    gap: 12,
    paddingRight: 12,
  },
  helpCard: {
    width: 280,
    borderRadius: 20,
    backgroundColor: '#fff',
    padding: 18,
    borderWidth: 1,
    borderColor: BrandColors.border,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    gap: 10,
  },
  helpQuestion: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '600', 
    lineHeight: 22,
  },
  helpAnswer: {
    fontSize: 14,
    color: '#475569',
  },
});
