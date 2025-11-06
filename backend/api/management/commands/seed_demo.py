from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from api.models import City, Station, Operator, Bus, Route, Trip


class Command(BaseCommand):
    help = "Seed demo cities, stations, operator, bus, route and trips"

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
        dk = cities.get("Дархан-Уул")  # Using Дархан-Уул as Darkhan equivalent
        er = cities.get("Орхон")  # Using Орхон as Erdenet equivalent

        # Create stations for major cities (similar to tapa.mn structure)
        # Ulaanbaatar stations
        ub_stations = [
            "Songinohairhan /Nomin/",
            "Драгон автобусны буудал",
            "Баянзүрх автобусны буудал",
            "Сонгинохайрхан /Номин/",
            "Төв автобусны буудал",
        ]
        ub_sta_list = []
        for st_name in ub_stations:
            sta, _ = Station.objects.get_or_create(city=ub, name=st_name)
            ub_sta_list.append(sta)
        ub_sta = ub_sta_list[0]  # Default to first one
        
        # Stations for other major cities
        stations_data = {
            "Дархан-Уул": ["Дархан автобусны буудал", "Дархан төв"],
            "Орхон": ["Эрдэнэт автобусны буудал", "Эрдэнэт төв"],
            "Архангай": ["Цэцэрлэг автобусны буудал"],
            "Хөвсгөл": ["Мөрөн автобусны буудал"],
            "Сэлэнгэ": ["Сүхбаатар автобусны буудал"],
            "Дорнод": ["Чойбалсан автобусны буудал"],
            "Хэнтий": ["Чингис автобусны буудал"],
            "Баян-Өлгий": ["Өлгий автобусны буудал"],
            "Говь-Алтай": ["Алтай автобусны буудал"],
            "Завхан": ["Улиастай автобусны буудал"],
            "Увс": ["Улаангом автобусны буудал"],
            "Ховд": ["Ховд автобусны буудал"],
            "Дорноговь": ["Сайншанд автобусны буудал"],
            "Дундговь": ["Мандалговь автобусны буудал"],
            "Өмнөговь": ["Даланзадгад автобусны буудал"],
            "Баянхонгор": ["Баянхонгор автобусны буудал"],
        }
        
        city_stations = {}
        for city_name, station_names in stations_data.items():
            city = cities.get(city_name)
            if city:
                city_stations[city_name] = []
                for st_name in station_names:
                    sta, _ = Station.objects.get_or_create(city=city, name=st_name)
                    city_stations[city_name].append(sta)
        
        dk_sta = city_stations.get("Дархан-Уул", [None])[0] if city_stations.get("Дархан-Уул") else None
        er_sta = city_stations.get("Орхон", [None])[0] if city_stations.get("Орхон") else None

        # Create operators (common Mongolian bus operators)
        operators_data = [
            "Ертөнц тур ХХК",
            "Эрдэнэ тур ХХК",
            "Драгон автобус",
            "Монгол автобус",
            "Хөвсгөл тур",
            "Баянзүрх автобус",
        ]
        operators = {}
        for op_name in operators_data:
            op, _ = Operator.objects.get_or_create(name=op_name)
            operators[op_name] = op
        
        op = operators["Ертөнц тур ХХК"]  # Default operator
        
        # Create buses
        buses_data = [
            {"plate": "02-06 УНМ", "operator": "Ертөнц тур ХХК"},
            {"plate": "01-23 АБВ", "operator": "Эрдэнэ тур ХХК"},
            {"plate": "03-45 ГДЕ", "operator": "Драгон автобус"},
        ]
        buses = []
        for bus_data in buses_data:
            bus_op = operators.get(bus_data["operator"], op)
            bus, _ = Bus.objects.get_or_create(
                operator=bus_op,
                plate_number=bus_data["plate"],
                defaults={"seat_layout": {"schema": "2+2", "rows": 12, "backRow": 5}},
            )
            buses.append(bus)
        bus = buses[0]  # Default bus

        # Create routes (popular routes from UB to major cities)
        routes = []
        route_data = [
            {"dest_city": "Дархан-Уул", "dest_station": 0, "distance": 220},
            {"dest_city": "Орхон", "dest_station": 0, "distance": 380},
            {"dest_city": "Архангай", "dest_station": 0, "distance": 450},
            {"dest_city": "Хөвсгөл", "dest_station": 0, "distance": 780},
            {"dest_city": "Дорнод", "dest_station": 0, "distance": 650},
            {"dest_city": "Хэнтий", "dest_station": 0, "distance": 330},
        ]
        
        for route_info in route_data:
            dest_city_name = route_info["dest_city"]
            if dest_city_name in city_stations and city_stations[dest_city_name]:
                dest_sta = city_stations[dest_city_name][route_info["dest_station"]]
                route, _ = Route.objects.get_or_create(
                    origin=ub_sta,
                    destination=dest_sta,
                    defaults={"distance_km": route_info["distance"]}
                )
                routes.append(route)
        
        r1 = routes[0] if routes else None  # UB -> Дархан-Уул
        r2 = routes[1] if len(routes) > 1 else None  # UB -> Орхон

        # Create trips for today
        today = timezone.localdate()
        base_times = [datetime(today.year, today.month, today.day, 8, 0),
                      datetime(today.year, today.month, today.day, 12, 0),
                      datetime(today.year, today.month, today.day, 18, 0)]

        # Create trips for multiple routes
        for route in routes[:3]:  # Create trips for first 3 routes
            for i, dt in enumerate(base_times):
                depart = timezone.make_aware(dt) + timedelta(hours=i)
                # Estimate travel time based on distance (rough: 1 hour per 100km)
                travel_hours = max(2, route.distance_km // 100)
                # Base price: roughly 100 MNT per km
                price = route.distance_km * 100
                
                Trip.objects.get_or_create(
                    route=route,
                    operator=op,
                    bus=bus,
                    depart_at=depart,
                    defaults={
                        "arrive_at": depart + timedelta(hours=travel_hours),
                        "base_price": price,
                        "status": "SCHEDULED",
                    },
                )

        self.stdout.write(self.style.SUCCESS("Demo data seeded."))
