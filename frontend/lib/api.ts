const API_BASE = 'http://127.0.0.1:8000/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export type City = { id: number; name: string };
export type Station = { id: number; name: string; city: City };
export type Trip = {
  id: number;
  depart_at: string;
  arrive_at: string;
  base_price: string;
  route: { origin: Station; destination: Station; distance_km: number };
  operator: { id: number; name: string };
  bus: { 
    id: number; 
    plate_number: string;
    bus_number?: string;
    bus_type?: string;
    operator_name?: string;
    total_seats?: number;
    amenities?: string;
    insurance_company?: string;
    insurance_fee?: string;
    status?: string;
  };
  available_seats?: number;
  status?: string;
};

export const Api = {
  cities: () => get<City[]>(`/cities/`),
  stations: (city?: number) => get<Station[]>(city ? `/stations/?city=${city}` : `/stations/`),
  search: (origin: number, destination: number, date: string) =>
    get<{ results: Trip[]; count: number }>(`/search/?origin=${origin}&destination=${destination}&date=${date}`),
  tripSeats: (tripId: number) => get<{ trip: number; layout: any }>(`/trips/${tripId}/seats/`),
  trip: (tripId: number) => get<Trip>(`/trips/${tripId}/`),
  book: async (payload: { trip: number; seats: string[]; passenger: { name: string; phone: string } }) => {
    const res = await fetch(`${API_BASE}/book/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};


