from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils.dateparse import parse_date
from django.db.models import Q
from .models import Trip, Route, Station, City
from .serializers import TripSerializer, CitySerializer, StationSerializer

@api_view(["GET"])
def hello(request):
    return Response({"message": "Hello from Django API"})

@api_view(["GET"])
def list_cities(request):
    qs = City.objects.order_by("name")
    return Response(CitySerializer(qs, many=True).data)

@api_view(["GET"])
def list_stations(request):
    city_id = request.query_params.get("city")
    qs = Station.objects.select_related("city")
    if city_id:
        try:
            qs = qs.filter(city_id=int(city_id))
        except ValueError:
            return Response({"detail": "city must be integer"}, status=400)
    qs = qs.order_by("name")
    return Response(StationSerializer(qs, many=True).data)

@api_view(["GET"])
def search_trips(request):
    """
    Query params:
      - origin: station id
      - destination: station id
      - date: YYYY-MM-DD (local date filter by depart_at date)
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
        Trip.objects.select_related("route", "route__origin", "route__destination", "operator", "bus")
        .filter(
            route__origin_id=origin_id,
            route__destination_id=destination_id,
            depart_at__date=travel_date,
        )
        .order_by("depart_at")
    )
    data = TripSerializer(qs, many=True).data
    return Response({"results": data, "count": len(data)})

@api_view(["GET"])
def trip_seat_map(request, trip_id: int):
    """Return a very simple seat map for a trip. Placeholder for MVP."""
    try:
        trip = Trip.objects.select_related("bus").get(id=trip_id)
    except Trip.DoesNotExist:
        return Response({"detail": "Trip not found"}, status=404)

    # Demo layout: 2+2, 10 rows + back row 5 seats, with some reserved
    layout = []
    n = 1
    for _ in range(10):
        layout.append([
            {"code": str(n)}, {"code": str(n+1)}, {"code": None}, {"code": str(n+2)}, {"code": str(n+3)}
        ])
        n += 4
    back = [{"code": str(n+i)} for i in range(5)]
    layout.append(back)

    reserved = {"3", "8", "22"}
    for row in layout:
        for cell in row:
            if cell.get("code") in reserved:
                cell["status"] = "reserved"

    return Response({
        "trip": trip.id,
        "bus": trip.bus.plate_number,
        "schema": trip.bus.seat_layout or {"schema": "2+2"},
        "layout": layout,
    })

@api_view(["GET"])
def trip_detail(request, trip_id: int):
    try:
        trip = Trip.objects.select_related("route", "route__origin", "route__destination", "operator", "bus").get(id=trip_id)
    except Trip.DoesNotExist:
        return Response({"detail": "Trip not found"}, status=404)
    return Response(TripSerializer(trip).data)

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
    # Mock price calc: base_price * seat count
    try:
        unit = float(trip.base_price)
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

