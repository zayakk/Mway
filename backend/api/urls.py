from django.urls import path
from .views import hello, search_trips, list_cities, list_stations, trip_seat_map, trip_detail, book, hold_seats, release_seats, auth_register, auth_login, auth_me

urlpatterns = [
    path("hello/", hello, name="hello"),
    path("cities/", list_cities, name="list_cities"),
    path("stations/", list_stations, name="list_stations"),
    path("search/", search_trips, name="search_trips"),
    path("trips/<int:trip_id>/seats/", trip_seat_map, name="trip_seat_map"),
    path("trips/<int:trip_id>/", trip_detail, name="trip_detail"),
    path("book/", book, name="book"),
    path("holds/", hold_seats, name="hold_seats"),
    path("holds/release/", release_seats, name="release_seats"),
    path("auth/register/", auth_register, name="auth_register"),
    path("auth/login/", auth_login, name="auth_login"),
    path("auth/me/", auth_me, name="auth_me"),
]