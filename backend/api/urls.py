from django.urls import path
from .views import hello, search_trips, list_cities, list_stations, trip_seat_map, trip_detail, book

urlpatterns = [
    path("hello/", hello, name="hello"),
    path("cities/", list_cities, name="list_cities"),
    path("stations/", list_stations, name="list_stations"),
    path("search/", search_trips, name="search_trips"),
    path("trips/<int:trip_id>/seats/", trip_seat_map, name="trip_seat_map"),
    path("trips/<int:trip_id>/", trip_detail, name="trip_detail"),
    path("book/", book, name="book"),
]