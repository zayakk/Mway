from django.db import models
from django.contrib.auth.models import User


class City(models.Model):
    name = models.CharField(max_length=100)
    region = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, default='Mongolia')

    def __str__(self):
        return self.name


class Route(models.Model):
    origin_city = models.ForeignKey('City', related_name='routes_from', on_delete=models.CASCADE)
    destination_city = models.ForeignKey('City', related_name='routes_to', on_delete=models.CASCADE)
    distance_km = models.DecimalField(max_digits=6, decimal_places=2)
    duration_hours = models.DecimalField(max_digits=4, decimal_places=2)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.origin_city} → {self.destination_city}"


class Bus(models.Model):
    operator_name = models.CharField(max_length=100)
    bus_number = models.CharField(max_length=50, unique=True)
    bus_type = models.CharField(max_length=50)  # VIP / Express / etc
    total_seats = models.PositiveIntegerField()
    amenities = models.TextField(blank=True, null=True)
    insurance_company = models.CharField(max_length=100, default='Нэйшнл эженси', blank=True)
    insurance_fee = models.DecimalField(max_digits=10, decimal_places=2, default=1600.00)
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'active'),
            ('inactive', 'inactive'),
            ('maintenance', 'maintenance'),
        ],
        default='active',
    )

    def __str__(self):
        return f"{self.bus_number} - {self.operator_name}"


class Seat(models.Model):
    bus = models.ForeignKey('Bus', on_delete=models.CASCADE, related_name='seats')
    seat_number = models.CharField(max_length=10)  # A1, B3 etc
    seat_type = models.CharField(
        max_length=10,
        choices=[
            ('window', 'window'),
            ('aisle', 'aisle'),
            ('middle', 'middle'),
        ],
        default='window',
    )

    def __str__(self):
        return f"{self.bus.bus_number} - {self.seat_number}"


class Trip(models.Model):
    route = models.ForeignKey('Route', on_delete=models.CASCADE)
    bus = models.ForeignKey('Bus', on_delete=models.CASCADE)
    departure_datetime = models.DateTimeField()
    arrival_datetime = models.DateTimeField()
    base_fare = models.DecimalField(max_digits=10, decimal_places=2)
    available_seats = models.PositiveIntegerField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('scheduled', 'scheduled'),
            ('on_route', 'on_route'),
            ('completed', 'completed'),
            ('cancelled', 'cancelled'),
        ],
        default='scheduled',
    )

    def __str__(self):
        return f"{self.route} @ {self.departure_datetime}"


class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    trip = models.ForeignKey('Trip', on_delete=models.CASCADE)
    booking_date = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'pending'),
            ('paid', 'paid'),
            ('failed', 'failed'),
            ('refunded', 'refunded'),
        ],
        default='pending',
    )
    booking_status = models.CharField(
        max_length=20,
        choices=[
            ('confirmed', 'confirmed'),
            ('cancelled', 'cancelled'),
        ],
        default='confirmed',
    )

    def __str__(self):
        return f"Booking #{self.id} by {self.user}"


class BookingSeat(models.Model):
    booking = models.ForeignKey('Booking', on_delete=models.CASCADE, related_name='seats')
    seat = models.ForeignKey('Seat', on_delete=models.CASCADE)
    trip = models.ForeignKey('Trip', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.booking} - {self.seat.seat_number}"


class SeatLock(models.Model):
    """
    Temporary lock for a seat on a specific trip.
    Prevents double-selection during checkout. Expires automatically.
    """
    trip = models.ForeignKey('Trip', on_delete=models.CASCADE, related_name='seat_locks')
    seat = models.ForeignKey('Seat', on_delete=models.CASCADE, related_name='seat_locks')
    token = models.CharField(max_length=64, db_index=True)  # client token/session id
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        unique_together = ('trip', 'seat')
        indexes = [
            models.Index(fields=['trip', 'seat']),
            models.Index(fields=['expires_at']),
        ]

    def __str__(self):
        return f"Lock {self.trip_id}-{self.seat_id} until {self.expires_at}"


class Payment(models.Model):
    booking = models.OneToOneField('Booking', on_delete=models.CASCADE)
    payment_method = models.CharField(
        max_length=20,
        choices=[
            ('card', 'card'),
            ('cash', 'cash'),
            ('mobile', 'mobile_pay'),
            ('paypal', 'paypal'),
        ],
        default='cash',
    )
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    payment_date = models.DateTimeField(auto_now_add=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=[
            ('success', 'success'),
            ('failed', 'failed'),
            ('pending', 'pending'),
        ],
        default='pending',
    )

    def __str__(self):
        return f"Payment for Booking {self.booking.id}"

