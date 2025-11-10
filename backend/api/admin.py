from django.contrib import admin
from .models import City, Route, Bus, Seat, Trip, Booking, BookingSeat, Payment

@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)
    list_per_page = 50


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ("id", "origin_city", "destination_city", "distance_km", "duration_hours", "is_active")
    list_filter = ("is_active", "origin_city", "destination_city")
    search_fields = ("origin_city__name", "destination_city__name")
    list_per_page = 50


@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ("id", "bus_number", "operator_name", "bus_type", "total_seats", "status")
    list_filter = ("status", "bus_type", "operator_name")
    search_fields = ("bus_number", "operator_name")
    list_per_page = 50


@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = ("id", "bus", "seat_number", "seat_type")
    list_filter = ("seat_type", "bus")
    search_fields = ("seat_number", "bus__bus_number")
    list_per_page = 100


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ("id", "route", "bus", "departure_datetime", "arrival_datetime", "base_fare", "available_seats", "status")
    list_filter = ("status", "route__origin_city", "route__destination_city", "bus")
    search_fields = ("route__origin_city__name", "route__destination_city__name", "bus__bus_number")
    date_hierarchy = "departure_datetime"
    list_per_page = 50


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "trip", "booking_date", "total_amount", "payment_status", "booking_status")
    list_filter = ("payment_status", "booking_status", "trip")
    search_fields = ("user__username", "user__email")
    date_hierarchy = "booking_date"
    list_per_page = 50


@admin.register(BookingSeat)
class BookingSeatAdmin(admin.ModelAdmin):
    list_display = ("id", "booking", "trip", "seat")
    list_filter = ("trip", "seat__bus")
    search_fields = ("booking__id", "trip__id", "seat__seat_number", "seat__bus__bus_number")
    list_per_page = 100


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "booking", "payment_method", "amount", "status", "payment_date", "transaction_id")
    list_filter = ("payment_method", "status")
    search_fields = ("booking__id", "transaction_id")
    date_hierarchy = "payment_date"
    list_per_page = 50
