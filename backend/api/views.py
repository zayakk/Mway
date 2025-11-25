from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from django.utils.dateparse import parse_date
from django.db import transaction
from django.db.models import Q
from .models import Trip, Route, City, Seat, Bus, BookingSeat, SeatLock
from .serializers import TripSerializer, CitySerializer, TripSearchSerializer, TripDetailSerializer
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated


def _generate_username_from_email(email: str) -> str:
    base = (email.split("@")[0] or "user").replace("+", "").replace(".", "")
    candidate = base or "user"
    suffix = 1
    while User.objects.filter(username=candidate).exists():
        candidate = f"{base}{suffix}"
        suffix += 1
    return candidate


def serialize_user(user: User) -> dict:
    profile_name = getattr(getattr(user, "profile", None), "full_name", "") or user.first_name or user.username
    return {
        "id": user.id,
        "name": profile_name,
        "email": user.email,
    }
from accounts.models import Profile

@api_view(["GET"])
def hello(request):
    return Response({"message": "Hello from Django API"})

@api_view(["GET"])
def list_cities(request):
    qs = City.objects.order_by("name")
    return Response(CitySerializer(qs, many=True).data)

@api_view(["GET"])
def list_stations(request):
    """
    Compatibility endpoint: returns pseudo-stations derived from cities.
    Each city exposes a single 'Central Bus Station' entry.
    """
    city_id = request.query_params.get("city")
    cities = City.objects.all().order_by("name")
    if city_id:
        try:
            cities = cities.filter(id=int(city_id))
        except ValueError:
            return Response({"detail": "city must be integer"}, status=400)
    results = [
        {
            "id": c.id,
            "name": f"{c.name} station",
            "city": CitySerializer(c).data,
        }
        for c in cities
    ]
    return Response(results)

@api_view(["GET"])
def search_trips(request):
    """
    Query params:
      - origin: origin city id
      - destination: destination city id
      - date: YYYY-MM-DD (local date filter by departure date)
    """
    origin = request.query_params.get("origin")
    destination = request.query_params.get("destination")
    date_str = request.query_params.get("date")

    if not origin or not destination or not date_str:
        return Response({"detail": "origin, destination, and date are required"}, status=400)

    try:
        origin_id = int(origin)
        destination_id = int(destination)
    except ValueError:
        return Response({"detail": "origin and destination must be integers"}, status=400)

    travel_date = parse_date(date_str)
    if not travel_date:
        return Response({"detail": "Invalid date"}, status=400)

    qs = (
        Trip.objects.select_related("route", "route__origin_city", "route__destination_city", "bus")
        .filter(
            route__origin_city_id=origin_id,
            route__destination_city_id=destination_id,
            departure_datetime__date=travel_date,
        )
        .order_by("departure_datetime")
    )
    data = TripSearchSerializer(qs, many=True).data
    return Response({"results": data, "count": len(data)})

@api_view(["GET"])
def trip_seat_map(request, trip_id: int):
    """Return a very simple seat map for a trip. Placeholder for MVP."""
    try:
        trip = Trip.objects.select_related("bus").get(id=trip_id)
    except Trip.DoesNotExist:
        return Response({"detail": "Trip not found"}, status=404)

    # If seats are defined for the bus, build layout from them (simple single-column grouping by number)
    seat_qs = Seat.objects.filter(bus=trip.bus).order_by("seat_number")
    if seat_qs.exists():
        row = []
        layout = []
        for s in seat_qs:
            row.append({"code": s.seat_number})
            if len(row) == 2:
                layout.append([row[0], {"code": None}, row[1], {"code": None}, {"code": None}])
                row = []
        if row:
            layout.append([row[0], {"code": None}, {"code": None}, {"code": None}, {"code": None}])
    else:
        # Fallback demo layout
        layout = []
        n = 1
        for _ in range(10):
            layout.append([
                {"code": str(n)}, {"code": str(n+1)}, {"code": None}, {"code": str(n+2)}, {"code": str(n+3)}
            ])
            n += 4
        back = [{"code": str(n+i)} for i in range(5)]
        layout.append(back)

    return Response({
        "trip": trip.id,
        "bus": trip.bus.bus_number,
        "schema": {"schema": "2+2"},
        "layout": layout,
        "locked": list(SeatLock.objects.filter(trip=trip, expires_at__gt=timezone.now()).values_list("seat__seat_number", flat=True)),
        "booked": list(BookingSeat.objects.filter(trip=trip).values_list("seat__seat_number", flat=True)),
    })

@api_view(["GET"])
def trip_detail(request, trip_id: int):
    try:
        trip = Trip.objects.select_related("route", "route__origin_city", "route__destination_city", "bus").get(id=trip_id)
    except Trip.DoesNotExist:
        return Response({"detail": "Trip not found"}, status=404)
    return Response(TripDetailSerializer(trip).data)

@api_view(["POST"])
def book(request):
    payload = request.data or {}
    trip_id = payload.get("trip")
    seats = payload.get("seats") or []
    passenger = payload.get("passenger") or {}
    if not trip_id or not seats:
        return Response({"detail": "trip and seats are required"}, status=400)
    try:
        trip = Trip.objects.get(id=int(trip_id))
    except Exception:
        return Response({"detail": "Invalid trip"}, status=400)
    # Mock price calc: base_fare * seat count
    try:
        unit = float(trip.base_fare)
    except Exception:
        unit = 0.0
    total = unit * len(seats)
    booking = {
        "id": 1000 + int(trip.id),
        "trip": trip.id,
        "seats": seats,
        "passenger": passenger,
        "total": total,
        "currency": "MNT",
        "status": "CONFIRMED",
    }
    return Response(booking, status=201)

# Seat hold/lock endpoints

def cleanup_expired_locks():
    SeatLock.objects.filter(expires_at__lte=timezone.now()).delete()

@api_view(["POST"])
def hold_seats(request):
    """
    Body:
      - trip: id
      - seats: [seat_number] optional
      - auto_assign: int (optional) number of seats to assign automatically
      - token: client token string
      - ttl_seconds: optional (default 300)
    """
    cleanup_expired_locks()
    payload = request.data or {}
    trip_id = payload.get("trip")
    token = payload.get("token") or ""
    ttl = int(payload.get("ttl_seconds") or 300)
    if not trip_id or not token:
        return Response({"detail": "trip and token required"}, status=400)
    try:
        trip = Trip.objects.get(id=int(trip_id))
    except Trip.DoesNotExist:
        return Response({"detail": "Trip not found"}, status=404)

    requested = set(payload.get("seats") or [])
    auto_assign = int(payload.get("auto_assign") or 0)

    # Build availability set
    booked = set(BookingSeat.objects.filter(trip=trip).values_list("seat__seat_number", flat=True))
    locked = set(SeatLock.objects.filter(trip=trip, expires_at__gt=timezone.now()).exclude(token=token).values_list("seat__seat_number", flat=True))
    all_seats = list(Seat.objects.filter(bus=trip.bus).values_list("seat_number", flat=True))
    available = [s for s in all_seats if s not in booked and s not in locked]

    # Validate requested
    to_lock = []
    for s in requested:
        if s in available:
            to_lock.append(s)
        else:
            return Response({"detail": f"Seat {s} not available"}, status=409)

    # Auto-assign from available
    if auto_assign > 0:
        for s in available:
            if len(to_lock) >= len(requested) + auto_assign:
                break
            if s not in to_lock:
                to_lock.append(s)

    expires_at = timezone.now() + timedelta(seconds=ttl)
    created = []
    for seat_no in to_lock:
        seat = Seat.objects.get(bus=trip.bus, seat_number=seat_no)
        # Double-check race
        if SeatLock.objects.filter(trip=trip, seat=seat, expires_at__gt=timezone.now()).exists():
            return Response({"detail": f"Seat {seat_no} just got locked"}, status=409)
        SeatLock.objects.update_or_create(trip=trip, seat=seat, defaults={"token": token, "expires_at": expires_at})
        created.append(seat_no)

    return Response({"trip": trip.id, "locked": created, "expires_at": expires_at.isoformat()})


@api_view(["POST"])
def release_seats(request):
    """
    Body:
      - trip: id
      - seats: [seat_number]
      - token: client token string
    """
    payload = request.data or {}
    trip_id = payload.get("trip")
    token = payload.get("token") or ""
    seats = payload.get("seats") or []
    if not trip_id or not token or not seats:
        return Response({"detail": "trip, token, seats required"}, status=400)
    try:
        trip = Trip.objects.get(id=int(trip_id))
    except Trip.DoesNotExist:
        return Response({"detail": "Trip not found"}, status=404)
    SeatLock.objects.filter(trip=trip, seat__seat_number__in=seats, token=token).delete()
    return Response({"released": seats})

# Auth endpoints

@api_view(["POST"])
def auth_register(request):
    data = request.data or {}
    name = (data.get("name") or data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    if not name or not email or not password:
        return Response({"detail": "Нэр, имэйл, нууц үг шаардлагатай"}, status=400)
    if User.objects.filter(email__iexact=email).exists():
        return Response({"detail": "Энэ имэйлээр аль хэдийн бүртгэлтэй байна"}, status=409)
    username = _generate_username_from_email(email)
    with transaction.atomic():
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=name,
        )
        Profile.objects.create(user=user, full_name=name)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "user": serialize_user(user)}, status=201)

@api_view(["POST"])
def auth_login(request):
    data = request.data or {}
    identifier = (data.get("email") or data.get("username") or "").strip()
    password = data.get("password") or ""
    if not identifier or not password:
        return Response({"detail": "Имэйл/нэр болон нууц үг шаардлагатай"}, status=400)
    user = (
        User.objects.filter(Q(email__iexact=identifier) | Q(username__iexact=identifier))
        .select_related("profile")
        .first()
    )
    if not user or not user.check_password(password):
        return Response({"detail": "Имэйл эсвэл нууц үг буруу байна"}, status=401)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "user": serialize_user(user)})

@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def auth_me(request):
    user = request.user
    return Response(serialize_user(user))

