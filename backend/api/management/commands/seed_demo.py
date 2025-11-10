from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from api.models import City, Route, Bus, Seat, Trip


class Command(BaseCommand):
    help = "Seed demo cities, routes, buses, seats and trips"

    def handle(self, *args, **options):
        # Seed all regional cities
        city_names = [
            # Төвийн бүс
            "Улаанбаатар",
            "Багануур",
            "Багахангай",
            "Төв",
            # Баруун бүс
            "Баян-Өлгий",
            "Говь-Алтай",
            "Завхан",
            "Увс",
            "Ховд",
            # Зүүн бүс
            "Дорнод",
            "Сүхбаатар",
            "Хэнтий",
            # Хангайн бүс
            "Архангай",
            "Булган",
            "Өвөрхангай",
            "Дархан-Уул",
            "Орхон",
            "Сэлэнгэ",
            "Баянхонгор",
            "Хөвсгөл",
            # Говийн бүс
            "Говьсүмбэр",
            "Дорноговь",
            "Дундговь",
            "Өмнөговь",
            # Олон улс
            "ОХУ",
            "БНХАУ",
            "БНКазУ",
        ]
        cities = {}
        for name in city_names:
            city, _ = City.objects.get_or_create(name=name)
            cities[name] = city

        ub = cities["Улаанбаатар"]
        # Some major cities
        major = [
            "Дархан-Уул",
            "Орхон",
            "Архангай",
            "Хөвсгөл",
            "Дорнод",
            "Хэнтий",
        ]

        # Create one demo bus with seats
        bus, _ = Bus.objects.get_or_create(
            bus_number="02-06 УНМ",
            defaults={
                "operator_name": "Ертөнц тур ХХК",
                "bus_type": "Express",
                "total_seats": 45,
                "amenities": "AC, WiFi",
                "status": "active",
            },
        )
        if not bus.seats.exists():
            # Generate 45 seats (1..45) window/aisle alternating
            for i in range(1, 46):
                Seat.objects.get_or_create(
                    bus=bus,
                    seat_number=str(i),
                    defaults={"seat_type": "window" if i % 2 else "aisle"},
                )

        # Create routes UB -> major cities
        routes = []
        distances = {
            "Дархан-Уул": 220,
            "Орхон": 380,
            "Архангай": 450,
            "Хөвсгөл": 780,
            "Дорнод": 650,
            "Хэнтий": 330,
        }
        for name in major:
            dest = cities.get(name)
            if not dest:
                continue
            route, _ = Route.objects.get_or_create(
                origin_city=ub,
                destination_city=dest,
                defaults={
                    "distance_km": distances.get(name, 300),
                    "duration_hours": max(2, distances.get(name, 300) // 100),
                    "is_active": True,
                },
            )
            routes.append(route)

        # Create trips for today
        today = timezone.localdate()
        base_times = [
            datetime(today.year, today.month, today.day, 8, 0),
            datetime(today.year, today.month, today.day, 12, 0),
            datetime(today.year, today.month, today.day, 18, 0),
        ]

        # Create trips for multiple routes
        for route in routes[:3]:
            for i, dt in enumerate(base_times):
                depart = timezone.make_aware(dt) + timedelta(hours=i)
                travel_hours = int(route.duration_hours)
                price = int(route.distance_km) * 100
                Trip.objects.get_or_create(
                    route=route,
                    bus=bus,
                    departure_datetime=depart,
                    defaults={
                        "arrival_datetime": depart + timedelta(hours=travel_hours),
                        "base_fare": price,
                        "available_seats": bus.total_seats,
                        "status": "scheduled",
                    },
                )

        self.stdout.write(self.style.SUCCESS("Demo data seeded."))
