import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Api, City, Station } from '@/lib/api';
import { useI18n } from '@/i18n';
import { CITY_GROUPS } from '@/constants/cities';

export function HomeQuickSearch() {
  const router = useRouter();
  const { t } = useI18n();
  const [cities, setCities] = useState<City[]>([]);
  const [originCity, setOriginCity] = useState<number | null>(null);
  const [destCity, setDestCity] = useState<number | null>(null);
  const [originStations, setOriginStations] = useState<Station[]>([]);
  const [destStations, setDestStations] = useState<Station[]>([]);
  const [origin, setOrigin] = useState<number | null>(null);
  const [destination, setDestination] = useState<number | null>(null);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));

  useEffect(() => { Api.cities().then(setCities); }, []);
  useEffect(() => { if (originCity) Api.stations(originCity).then(setOriginStations); }, [originCity]);
  useEffect(() => { if (destCity) Api.stations(destCity).then(setDestStations); }, [destCity]);

  const submit = () => {
    if (!origin || !destination || !date) return;
    router.push({ pathname: '/searchResults', params: { origin: String(origin), destination: String(destination), date } });
  };

  return (
    <ThemedView style={styles.card}>
      <ThemedText type="title">{t('home.title') || 'Intercity Bus'}</ThemedText>
      <ThemedText>{t('home.subtitle') || 'Find and book seats'}</ThemedText>

      <ThemedText style={styles.label}>{t('home.fromCity') || 'From city'}</ThemedText>
      <SectionedCityPills groups={CITY_GROUPS} valueId={originCity} onSelectByName={(name) => {
        const match = cities.find(c => c.name.toLowerCase() === name.toLowerCase());
        setOriginCity(match ? match.id : null);
      }} />
      <ThemedText style={styles.label}>{t('home.fromStation') || 'From station'}</ThemedText>
      <Pills data={originStations} value={origin} onChange={setOrigin} />

      <ThemedText style={styles.label}>{t('home.toCity') || 'To city'}</ThemedText>
      <SectionedCityPills groups={CITY_GROUPS} valueId={destCity} onSelectByName={(name) => {
        const match = cities.find(c => c.name.toLowerCase() === name.toLowerCase());
        setDestCity(match ? match.id : null);
      }} />
      <ThemedText style={styles.label}>{t('home.toStation') || 'To station'}</ThemedText>
      <Pills data={destStations} value={destination} onChange={setDestination} />

      <ThemedText style={styles.label}>{t('home.date') || 'Date (YYYY-MM-DD)'}</ThemedText>
      <TextInput value={date} onChangeText={setDate} style={styles.input} />

      <Pressable onPress={submit} style={styles.cta}>
        <ThemedText type="defaultSemiBold">{t('home.search') || 'Search'}</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

function Pills<T extends { id: number; name: string }>({ data, value, onChange }: { data: T[]; value: number | null; onChange: (id: number | null) => void }) {
  return (
    <View style={styles.pills}>
      {data.map((d) => (
        <Pressable key={d.id} onPress={() => onChange(d.id)} style={[styles.pill, value === d.id && styles.pillActive]}>
          <ThemedText>{d.name}</ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

function SectionedCityPills({ groups, valueId, onSelectByName }: { groups: { title: string; cities: { name: string }[] }[]; valueId: number | null; onSelectByName: (name: string) => void }) {
  return (
    <View style={{ gap: 6 }}>
      {groups.map((g) => (
        <View key={g.title}>
          <ThemedText type="subtitle">{g.title}</ThemedText>
          <View style={styles.pills}>
            {g.cities.map((c) => (
              <Pressable key={c.name} onPress={() => onSelectByName(c.name)} style={styles.pill}>
                <ThemedText>{c.name}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff', padding: 14, borderRadius: 12 },
  label: { marginTop: 4 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  cta: { marginTop: 8, alignItems: 'center', paddingVertical: 12, borderRadius: 10, backgroundColor: '#e0f2fe', borderWidth: 1, borderColor: '#38bdf8' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#fff' },
  pillActive: { backgroundColor: '#e0f2fe', borderColor: '#38bdf8' },
});


