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
        fields = ["id", "operator_name", "bus_number", "bus_type", "total_seats", "amenities", "status"]


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
