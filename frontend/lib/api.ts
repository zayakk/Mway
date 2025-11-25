export const API_BASE = 'http://127.0.0.1:8000/api';

type JsonMap = Record<string, any>;

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  const text = await res.text();
  let data: JsonMap | string | null = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const message =
      (typeof data === 'object' && data && typeof data.detail === 'string' && data.detail) ||
      (typeof data === 'string' && data) ||
      `HTTP ${res.status}`;
    throw new Error(message);
  }
  return (data as T) ?? ({} as T);
}

async function get<T>(path: string, headers?: HeadersInit): Promise<T> {
  return requestJson<T>(path, { method: 'GET', headers });
}

async function post<T>(path: string, body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Token ${token}`;
  }
  return requestJson<T>(path, {
    method: 'POST',
    headers,
    body: JSON.stringify(body ?? {}),
  });
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

export type UserSummary = { id: number; name: string; email: string };
export type AuthResponse = { token: string; user: UserSummary };

export const Api = {
  cities: () => get<City[]>(`/cities/`),
  stations: (city?: number) => get<Station[]>(city ? `/stations/?city=${city}` : `/stations/`),
  search: (origin: number, destination: number, date: string) =>
    get<{ results: Trip[]; count: number }>(`/search/?origin=${origin}&destination=${destination}&date=${date}`),
  tripSeats: (tripId: number) => get<{ trip: number; layout: any }>(`/trips/${tripId}/seats/`),
  trip: (tripId: number) => get<Trip>(`/trips/${tripId}/`),
  book: (payload: { trip: number; seats: string[]; passenger: { name: string; phone: string } }) =>
    post<Record<string, any>>(`/book/`, payload),
  auth: {
    register: (payload: { name: string; email: string; password: string }) =>
      post<AuthResponse>('/auth/register/', payload),
    login: (payload: { email: string; password: string }) => post<AuthResponse>('/auth/login/', payload),
    me: (token: string) => get<UserSummary>('/auth/me/', { Authorization: `Token ${token}` }),
  },
};


