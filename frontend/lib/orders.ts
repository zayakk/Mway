import AsyncStorage from '@react-native-async-storage/async-storage';

export type StoredBooking = {
  id: string | number;
  trip: number;
  seats: string[];
  total: number;
  status: string;
  createdAt: string;
  payload?: any;
};

const KEY = 'mway.bookings.v1';

export async function listBookings(): Promise<StoredBooking[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export async function saveBooking(b: Omit<StoredBooking, 'createdAt'>): Promise<void> {
  const existing = await listBookings();
  const next: StoredBooking[] = [
    {
      ...b,
      createdAt: new Date().toISOString(),
    },
    ...existing,
  ];
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}


