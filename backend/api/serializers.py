from rest_framework import serializers
from .models import City, Station, Operator, Bus, Route, Trip


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ["id", "name"]


class StationSerializer(serializers.ModelSerializer):
    city = CitySerializer(read_only=True)

    class Meta:
        model = Station
        fields = ["id", "name", "city"]


class OperatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Operator
        fields = ["id", "name"]


class BusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bus
        fields = ["id", "plate_number", "seat_layout"]


class RouteSerializer(serializers.ModelSerializer):
    origin = StationSerializer(read_only=True)
    destination = StationSerializer(read_only=True)

    class Meta:
        model = Route
        fields = ["id", "origin", "destination", "distance_km"]


class TripSerializer(serializers.ModelSerializer):
    route = RouteSerializer(read_only=True)
    operator = OperatorSerializer(read_only=True)
    bus = BusSerializer(read_only=True)

    class Meta:
        model = Trip
        fields = [
            "id",
            "route",
            "operator",
            "bus",
            "depart_at",
            "arrive_at",
            "base_price",
            "status",
        ]


