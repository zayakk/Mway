from django.contrib import admin
from .models import City, Station, Operator, Bus, Route, Trip


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "city")
    list_filter = ("city",)
    search_fields = ("name",)


@admin.register(Operator)
class OperatorAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ("id", "plate_number", "operator")
    list_filter = ("operator",)
    search_fields = ("plate_number",)


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ("id", "origin", "destination", "distance_km")
    list_filter = ("origin__city", "destination__city")
    search_fields = ("origin__name", "destination__name")


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ("id", "route", "operator", "bus", "depart_at", "base_price", "status")
    list_filter = ("operator", "route__origin__city", "route__destination__city")
    date_hierarchy = "depart_at"
