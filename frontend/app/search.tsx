import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Api, City, Station } from '@/lib/api';
import { Dropdown } from '@/components/dropdown';

export default function SearchScreen() {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [originCity, setOriginCity] = useState<number | null>(null);
  const [destCity, setDestCity] = useState<number | null>(null);
  const [originStations, setOriginStations] = useState<Station[]>([]);
  const [destStations, setDestStations] = useState<Station[]>([]);
  const [origin, setOrigin] = useState<number | null>(null);
  const [destination, setDestination] = useState<number | null>(null);
  const [date, setDate] = useState<string>('2025-11-06');

  useEffect(() => {
    Api.cities().then(setCities).catch((e) => Alert.alert('Error', e.message));
  }, []);

  useEffect(() => {
    if (originCity) Api.stations(originCity).then(setOriginStations);
  }, [originCity]);

  useEffect(() => {
    if (destCity) Api.stations(destCity).then(setDestStations);
  }, [destCity]);

  const submit = () => {
    if (!origin || !destination || !date) {
      Alert.alert('Required', 'Please choose origin, destination, and date.');
      return;
    }
    router.push({ pathname: '/searchResults', params: { origin: String(origin), destination: String(destination), date } });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Search trips</ThemedText>

      <Dropdown label="From city" options={cities} value={originCity} onChange={setOriginCity} />
      <ThemedText>From station</ThemedText>
      <Picker data={originStations} value={origin} onChange={setOrigin} />

      <Dropdown label="To city" options={cities} value={destCity} onChange={setDestCity} />
      <ThemedText>To station</ThemedText>
      <Picker data={destStations} value={destination} onChange={setDestination} />

      <ThemedText>Date (YYYY-MM-DD)</ThemedText>
      <TextInput value={date} onChangeText={setDate} style={styles.input} />

      <Pressable onPress={submit} style={styles.button}>
        <ThemedText type="defaultSemiBold">Search</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

function Picker<T extends { id: number; name: string }>({ data, value, onChange }: { data: T[]; value: number | null; onChange: (id: number | null) => void }) {
  return (
    <View style={styles.picker}>
      {data.map((d) => (
        <Pressable key={d.id} onPress={() => onChange(d.id)} style={[styles.pill, value === d.id && styles.pillActive]}>
          <ThemedText>{d.name}</ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  button: { marginTop: 12, alignItems: 'center', paddingVertical: 12, borderRadius: 10, backgroundColor: '#e0f2fe', borderWidth: 1, borderColor: '#38bdf8' },
  picker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#fff' },
  pillActive: { backgroundColor: '#e0f2fe', borderColor: '#38bdf8' },
});


