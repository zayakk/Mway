// // app/search.tsx
// import { useEffect, useState } from 'react';
// import { Alert, ScrollView, View, StyleSheet, Pressable } from 'react-native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { ThemedText } from '@/components/themed-text';
// import { Api, City, Station } from '@/lib/api';
// import { Screen, ScreenHeader, Section, FieldCard, PrimaryButton, IconBadge } from '@/components/ui';
// import { BrandColors } from '@/constants/colors'; // Make sure you have this

// export default function SearchScreen() {
//   const router = useRouter();
//   const rawParams = useLocalSearchParams<{
//     originId?: string | string[];
//     destId?: string | string[];
//     originCityId?: string | string[];
//     destCityId?: string | string[];
//   }>();

//   const params = {
//     originId: Array.isArray(rawParams.originId) ? rawParams.originId[0] : rawParams.originId,
//     destId: Array.isArray(rawParams.destId) ? rawParams.destId[0] : rawParams.destId,
//     originCityId: Array.isArray(rawParams.originCityId) ? rawParams.originCityId[0] : rawParams.originCityId,
//     destCityId: Array.isArray(rawParams.destCityId) ? rawParams.destCityId[0] : rawParams.destCityId,
//   };

//   const [cities, setCities] = useState<City[]>([]);
//   const [originCity, setOriginCity] = useState<number | null>(null);
//   const [destCity, setDestCity] = useState<number | null>(null);
//   const [originStations, setOriginStations] = useState<Station[]>([]);
//   const [destStations, setDestStations] = useState<Station[]>([]);
//   const [origin, setOrigin] = useState<number | null>(null);
//   const [destination, setDestination] = useState<number | null>(null);
//   const [originStationData, setOriginStationData] = useState<Station | null>(null);
//   const [destStationData, setDestStationData] = useState<Station | null>(null);
//   const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

//   useEffect(() => {
//     Api.cities().then(setCities).catch((e) => Alert.alert('Error', e.message));
//   }, []);

//   useEffect(() => {
//     if (params.originCityId) setOriginCity(Number(params.originCityId));
//     if (params.destCityId) setDestCity(Number(params.destCityId));
//   }, [params.originCityId, params.destCityId]);

//   useEffect(() => {
//     if (originCity) {
//       Api.stations(originCity)
//         .then((stations) => {
//           setOriginStations(stations);
//           if (params.originId) {
//             const stationId = Number(params.originId);
//             const station = stations.find((s) => s.id === stationId);
//             if (station) {
//               setOrigin(stationId);
//               setOriginStationData(station);
//               if (station.city?.id !== originCity) setOriginCity(station.city.id);
//             }
//           }
//         })
//         .catch(() => {});
//     } else if (!params.originCityId) {
//       setOriginStations([]);
//       setOrigin(null);
//       setOriginStationData(null);
//     }
//   }, [originCity, params.originId, params.originCityId]);

//   useEffect(() => {
//     if (destCity) {
//       Api.stations(destCity)
//         .then((stations) => {
//           setDestStations(stations);
//           if (params.destId) {
//             const stationId = Number(params.destId);
//             const station = stations.find((s) => s.id === stationId);
//             if (station) {
//               setDestination(stationId);
//               setDestStationData(station);
//               if (station.city?.id !== destCity) setDestCity(station.city.id);
//             }
//           }
//         })
//         .catch(() => {});
//     } else if (!params.destCityId) {
//       setDestStations([]);
//       setDestination(null);
//       setDestStationData(null);
//     }
//   }, [destCity, params.destId, params.destCityId]);

//   const getCityName = (cityId: number | null) => cities.find((c) => c.id === cityId)?.name || '';
//   const getStationName = (stationId: number | null, stations: Station[]) =>
//     stations.find((s) => s.id === stationId)?.name || '';

//   const formatDate = (dateStr: string) => {
//     try {
//       const d = new Date(dateStr);
//       const days = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];
//       const months = [
//         '1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар',
//         '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар',
//       ];
//       return `${d.getDate()} ${months[d.getMonth()]} ${days[d.getDay()]}`;
//     } catch {
//       return dateStr;
//     }
//   };

//   const submit = () => {
//     const originCityId = originStationData?.city?.id || originCity;
//     const destCityId = destStationData?.city?.id || destCity;

//     if (!originCityId || !destCityId || !date) {
//       Alert.alert('Шаардлагатай', 'Хаанаас, хаашаа, огноо сонгоно уу.');
//       return;
//     }
//     if (originCityId === destCityId) {
//       Alert.alert('Алдаа', 'Хаанаас болон хаашаа ижил байж болохгүй.');
//       return;
//     }

//     router.push({
//       pathname: '/searchResults',
//       params: { origin: String(originCityId), destination: String(destCityId), date },
//     });
//   };

//   return (
//     <Screen scrollable contentContainerStyle={styles.screenContent}>
//       <ScreenHeader
//         eyebrow="Trip planner"
//         title="Автобусны хайлт"
//         subtitle="Хот хоорондын аяллаа хэдхэн алхамаар эхлүүлээрэй."
//       />

//       <View style={styles.card}>
//         <Section title="Аяллын мэдээлэл" subtitle="Чиглэл, суудал, огноогоо сонгоод хайлтыг эхлүүлээрэй.">
//           <FieldCard
//             label="Хаанаас"
//             value={origin ? getStationName(origin, originStations) : getCityName(originCity)}
//             placeholder="Гарах хот/буудал"
//             icon={<IconBadge icon="🏢" />}
//             onPress={() =>
//               router.push({
//                 pathname: '/locationSelect',
//                 params: {
//                   type: 'origin',
//                   cityId: originCity ? String(originCity) : '',
//                   originId: origin ? String(origin) : undefined,
//                   destId: destination ? String(destination) : undefined,
//                   destCityId: destCity ? String(destCity) : undefined,
//                 },
//               })
//             }
//           />

//           <FieldCard
//             label="Хаашаа"
//             value={destination ? getStationName(destination, destStations) : getCityName(destCity)}
//             placeholder="Очих хот/буудал"
//             icon={<IconBadge icon="📍" />}
//             onPress={() =>
//               router.push({
//                 pathname: '/locationSelect',
//                 params: {
//                   type: 'destination',
//                   cityId: destCity ? String(destCity) : '',
//                   originId: origin ? String(origin) : undefined,
//                   originCityId: originCity ? String(originCity) : undefined,
//                   destId: destination ? String(destination) : undefined,
//                 },
//               })
//             }
//           />

//           <FieldCard
//             label="Огноо"
//             value={formatDate(date)}
//             placeholder="Огноо сонгох"
//             icon={<IconBadge icon="📅" />}
//             onPress={() => Alert.alert('Огноо', 'Огноо сонгогч удахгүй нэмэгдэнэ.')}
//           />

//           <PrimaryButton onPress={submit} disabled={!(origin || originCity) || !(destination || destCity) || !date}>
//             Хайх
//           </PrimaryButton>
//         </Section>
//       </View>

//       <Section title="Танд тусалъя" subtitle="Түгээмэл асуултын хариулт">
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.helpCards}>
//           <View style={styles.helpCard}>
//             <IconBadge icon="❓" />
//             <ThemedText style={styles.helpQuestion}>Онлайн захиалгын үйлчилгээ нэмэлт шимтгэл авдаг уу?</ThemedText>
//             <ThemedText style={styles.helpAnswer}>Үгүй. Зөвхөн тасалбарын үнийг төлнө.</ThemedText>
//           </View>
//           <View style={styles.helpCard}>
//             <IconBadge icon="❓" />
//             <ThemedText style={styles.helpQuestion}>Захиалгаа хэрхэн цуцлах вэ?</ThemedText>
//             <ThemedText style={styles.helpAnswer}>Профайл → Захиалгын түүх хэсгээс цуцлах боломжтой.</ThemedText>
//           </View>
//         </ScrollView>
//       </Section>
//     </Screen>
//   );
// }

// const styles = StyleSheet.create({
//   screenContent: { paddingBottom: 32 },
//   card: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: -20, borderRadius: 16, padding: 20, gap: 12 },
//   helpCards: { paddingHorizontal: 16 },
//   helpCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: 300, marginRight: 12 },
//   helpQuestion: { fontSize: 14, color: '#374151', marginBottom: 8, lineHeight: 20 },
//   helpAnswer: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
// });
