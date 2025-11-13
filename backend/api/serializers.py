from rest_framework import serializers
from .models import City, Route, Bus, Seat, Trip, Booking, BookingSeat, Payment


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ["id", "name", "region", "country"]


class RouteSerializer(serializers.ModelSerializer):
    origin_city = CitySerializer(read_only=True)
    destination_city = CitySerializer(read_only=True)

    class Meta:
        model = Route
        fields = ["id", "origin_city", "destination_city", "distance_km", "duration_hours", "is_active"]


class BusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bus
        fields = ["id", "operator_name", "bus_number", "bus_type", "total_seats", "amenities", "insurance_company", "insurance_fee", "status"]


class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ["id", "seat_number", "seat_type"]


class TripSerializer(serializers.ModelSerializer):
    route = RouteSerializer(read_only=True)
    bus = BusSerializer(read_only=True)

    class Meta:
        model = Trip
        fields = [
            "id",
            "route",
            "bus",
            "departure_datetime",
            "arrival_datetime",
            "base_fare",
            "available_seats",
            "status",
        ]


class TripDetailSerializer(serializers.ModelSerializer):
    """Serializer for trip detail endpoint matching frontend expectations"""
    depart_at = serializers.DateTimeField(source='departure_datetime', read_only=True)
    arrive_at = serializers.DateTimeField(source='arrival_datetime', read_only=True)
    base_price = serializers.DecimalField(source='base_fare', max_digits=10, decimal_places=2, read_only=True)
    route = serializers.SerializerMethodField()
    operator = serializers.SerializerMethodField()
    bus = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = [
            "id",
            "depart_at",
            "arrive_at",
            "base_price",
            "route",
            "operator",
            "bus",
            "available_seats",
            "status",
        ]

    def get_route(self, obj):
        """Transform route to match frontend format with origin/destination stations"""
        origin_city = obj.route.origin_city
        dest_city = obj.route.destination_city
        return {
            "origin": {
                "id": origin_city.id,
                "name": f"{origin_city.name} station",
                "city": CitySerializer(origin_city).data
            },
            "destination": {
                "id": dest_city.id,
                "name": f"{dest_city.name} station",
                "city": CitySerializer(dest_city).data
            },
            "distance_km": float(obj.route.distance_km) if obj.route.distance_km else 0,
        }

    def get_operator(self, obj):
        """Extract operator info from bus"""
        return {
            "id": obj.bus.id,
            "name": obj.bus.operator_name,
        }

    def get_bus(self, obj):
        """Return bus info with all fields"""
        return {
            "id": obj.bus.id,
            "plate_number": obj.bus.bus_number,
            "bus_number": obj.bus.bus_number,
            "bus_type": obj.bus.bus_type,
            "operator_name": obj.bus.operator_name,
            "total_seats": obj.bus.total_seats,
            "amenities": obj.bus.amenities,
            "insurance_company": obj.bus.insurance_company,
            "insurance_fee": str(obj.bus.insurance_fee),
            "status": obj.bus.status,
        }


class StationSerializer(serializers.Serializer):
    """Pseudo-station serializer for frontend compatibility"""
    id = serializers.IntegerField()
    name = serializers.CharField()
    city = CitySerializer()


class TripSearchSerializer(serializers.ModelSerializer):
    """Custom serializer for search endpoint matching frontend expectations"""
    depart_at = serializers.DateTimeField(source='departure_datetime', read_only=True)
    arrive_at = serializers.DateTimeField(source='arrival_datetime', read_only=True)
    base_price = serializers.DecimalField(source='base_fare', max_digits=10, decimal_places=2, read_only=True)
    route = serializers.SerializerMethodField()
    operator = serializers.SerializerMethodField()
    bus = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = [
            "id",
            "depart_at",
            "arrive_at",
            "base_price",
            "route",
            "operator",
            "bus",
        ]

    def get_route(self, obj):
        """Transform route to match frontend format with origin/destination stations"""
        origin_city = obj.route.origin_city
        dest_city = obj.route.destination_city
        return {
            "origin": {
                "id": origin_city.id,
                "name": f"{origin_city.name} station",
                "city": CitySerializer(origin_city).data
            },
            "destination": {
                "id": dest_city.id,
                "name": f"{dest_city.name} station",
                "city": CitySerializer(dest_city).data
            },
            "distance_km": float(obj.route.distance_km) if obj.route.distance_km else 0,
        }

    def get_operator(self, obj):
        """Extract operator info from bus"""
        return {
            "id": obj.bus.id,
            "name": obj.bus.operator_name,
        }

    def get_bus(self, obj):
        """Return simplified bus info"""
        return {
            "id": obj.bus.id,
            "plate_number": obj.bus.bus_number,
            "insurance_company": obj.bus.insurance_company,
            "insurance_fee": str(obj.bus.insurance_fee),
        }


class BookingSeatSerializer(serializers.ModelSerializer):
    seat = SeatSerializer(read_only=True)

    class Meta:
        model = BookingSeat
        fields = ["id", "seat", "trip"]


class BookingSerializer(serializers.ModelSerializer):
    seats = BookingSeatSerializer(many=True, read_only=True)
    trip = TripSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "user",
            "trip",
            "booking_date",
            "total_amount",
            "payment_status",
            "booking_status",
            "seats",
        ]
        read_only_fields = ["booking_date"]


class PaymentSerializer(serializers.ModelSerializer):
    booking = BookingSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = ["id", "booking", "payment_method", "transaction_id", "payment_date", "amount", "status"]
