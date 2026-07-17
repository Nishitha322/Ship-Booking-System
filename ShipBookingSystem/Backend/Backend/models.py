from django.db import models

class Passenger(models.Model):
    passenger_id = models.AutoField(primary_key=True)
    full_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    nationality = models.CharField(max_length=50)
    passport_number = models.CharField(max_length=50)
    password = models.CharField(max_length=128)

    def __str__(self):
        return self.full_name

class Ship(models.Model):
    ship_id = models.AutoField(primary_key=True)
    ship_name = models.CharField(max_length=100)
    ship_type = models.CharField(max_length=50)  # Cruise Ship, Ferry, etc.
    capacity = models.IntegerField()
    operator_name = models.CharField(max_length=100)
    status = models.CharField(max_length=20)      # Active, Maintenance, Inactive

    def __str__(self):
        return self.ship_name

class Schedule(models.Model):
    schedule_id = models.AutoField(primary_key=True)
    ship = models.ForeignKey(Ship, on_delete=models.CASCADE)
    source_port = models.CharField(max_length=100)
    destination_port = models.CharField(max_length=100)
    departure_date = models.DateField()
    departure_time = models.TimeField()
    arrival_date = models.DateField()
    arrival_time = models.TimeField()
    fare = models.FloatField()

    def __str__(self):
        return f"{self.ship.ship_name}: {self.source_port} to {self.destination_port}"

class Booking(models.Model):
    booking_id = models.AutoField(primary_key=True)
    passenger = models.ForeignKey(Passenger, on_delete=models.CASCADE)
    ship = models.ForeignKey(Ship, on_delete=models.CASCADE)
    cabin_type = models.CharField(max_length=50)  # Economy, Deluxe, Suite, etc.
    journey_date = models.DateField()
    source_port = models.CharField(max_length=100)
    destination_port = models.CharField(max_length=100)
    total_amount = models.FloatField()
    booking_status = models.CharField(max_length=20)  # Confirmed, Waiting, Cancelled

    def __str__(self):
        return f"Booking {self.booking_id}: {self.passenger.full_name} - {self.ship.ship_name}"

class Payment(models.Model):
    payment_id = models.AutoField(primary_key=True)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE)
    passenger = models.ForeignKey(Passenger, on_delete=models.CASCADE)
    amount = models.FloatField()
    payment_method = models.CharField(max_length=50)  # UPI, Credit Card, etc.
    payment_status = models.CharField(max_length=20)  # Success, Pending, Failed
    transaction_id = models.CharField(max_length=100)
    payment_date = models.DateField()

    def __str__(self):
        return f"Payment {self.payment_id}: {self.passenger.full_name} ({self.payment_status})"
