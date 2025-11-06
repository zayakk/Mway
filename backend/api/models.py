from django.db import models


class City(models.Model):
    name = models.CharField(max_length=120, unique=True)

    def __str__(self) -> str:
        return self.name


class Station(models.Model):
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='stations')
    name = models.CharField(max_length=160)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    class Meta:
        unique_together = ('city', 'name')

    def __str__(self) -> str:
        return f"{self.name} ({self.city.name})"


class Operator(models.Model):
    name = models.CharField(max_length=160, unique=True)

    def __str__(self) -> str:
        return self.name


class Bus(models.Model):
    operator = models.ForeignKey(Operator, on_delete=models.CASCADE, related_name='buses')
    plate_number = models.CharField(max_length=40)
    seat_layout = models.JSONField(default=dict, blank=True)  # e.g., { "schema": "2+2", "rows": 12 }

    class Meta:
        unique_together = ('operator', 'plate_number')

    def __str__(self) -> str:
        return f"{self.plate_number} / {self.operator.name}"


class Route(models.Model):
    origin = models.ForeignKey(Station, on_delete=models.PROTECT, related_name='route_origins')
    destination = models.ForeignKey(Station, on_delete=models.PROTECT, related_name='route_destinations')
    distance_km = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('origin', 'destination')

    def __str__(self) -> str:
        return f"{self.origin} → {self.destination}"


class Trip(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='trips')
    operator = models.ForeignKey(Operator, on_delete=models.PROTECT, related_name='trips')
    bus = models.ForeignKey(Bus, on_delete=models.PROTECT, related_name='trips')
    depart_at = models.DateTimeField()
    arrive_at = models.DateTimeField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default='SCHEDULED')

    def __str__(self) -> str:
        return f"{self.route} @ {self.depart_at}"

