import os
import django
from datetime import datetime

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')
django.setup()

from Backend.models import Passenger, Ship, Schedule, Booking, Payment

def seed_database():
    print("Clearing database...")
    Payment.objects.all().delete()
    Booking.objects.all().delete()
    Schedule.objects.all().delete()
    Ship.objects.all().delete()
    Passenger.objects.all().delete()

    print("Seeding Passengers...")
    p1 = Passenger.objects.create(
        passenger_id=101,
        full_name="Rahul Sharma",
        email="rahul@gmail.com",
        phone="9876543210",
        nationality="Indian",
        passport_number="N1234567",
        password="rahul123"
    )
    p2 = Passenger.objects.create(
        passenger_id=102,
        full_name="Sarah Connor",
        email="sarah@gmail.com",
        phone="9876543211",
        nationality="American",
        passport_number="US987654",
        password="sarah123"
    )
    p3 = Passenger.objects.create(
        passenger_id=103,
        full_name="Aditya Patel",
        email="aditya@gmail.com",
        phone="9876543212",
        nationality="Indian",
        passport_number="IND78612",
        password="aditya123"
    )

    print("Seeding Ships...")
    s1 = Ship.objects.create(
        ship_id=201,
        ship_name="Ocean Paradise",
        ship_type="Cruise Ship",
        capacity=2000,
        operator_name="Royal Cruises",
        status="Active"
    )
    s2 = Ship.objects.create(
        ship_id=202,
        ship_name="Sea Express",
        ship_type="Ferry",
        capacity=300,
        operator_name="FerryFast Lines",
        status="Active"
    )
    s3 = Ship.objects.create(
        ship_id=203,
        ship_name="Blue Horizon",
        ship_type="Luxury Yacht",
        capacity=50,
        operator_name="Elite Sails",
        status="Active"
    )
    s4 = Ship.objects.create(
        ship_id=204,
        ship_name="Ganges Queen",
        ship_type="River Cruise",
        capacity=150,
        operator_name="Heritage Waterways",
        status="Maintenance"
    )

    print("Seeding Schedules...")
    sch1 = Schedule.objects.create(
        schedule_id=301,
        ship=s1,
        source_port="Chennai Port",
        destination_port="Port Blair",
        departure_date=datetime.strptime("2026-10-15", "%Y-%m-%d").date(),
        departure_time="08:00",
        arrival_date=datetime.strptime("2026-10-16", "%Y-%m-%d").date(),
        arrival_time="06:00",
        fare=8500
    )
    sch2 = Schedule.objects.create(
        schedule_id=302,
        ship=s2,
        source_port="Mumbai Port",
        destination_port="Goa Port",
        departure_date=datetime.strptime("2026-10-18", "%Y-%m-%d").date(),
        departure_time="10:00",
        arrival_date=datetime.strptime("2026-10-18", "%Y-%m-%d").date(),
        arrival_time="18:00",
        fare=2500
    )
    sch3 = Schedule.objects.create(
        schedule_id=303,
        ship=s3,
        source_port="Cochin Port",
        destination_port="Lakshadweep",
        departure_date=datetime.strptime("2026-10-20", "%Y-%m-%d").date(),
        departure_time="06:00",
        arrival_date=datetime.strptime("2026-10-21", "%Y-%m-%d").date(),
        arrival_time="09:00",
        fare=15000
    )
    sch4 = Schedule.objects.create(
        schedule_id=304,
        ship=s1,
        source_port="Port Blair",
        destination_port="Chennai Port",
        departure_date=datetime.strptime("2026-10-25", "%Y-%m-%d").date(),
        departure_time="14:00",
        arrival_date=datetime.strptime("2026-10-26", "%Y-%m-%d").date(),
        arrival_time="12:00",
        fare=8500
    )

    print("Seeding Bookings...")
    b1 = Booking.objects.create(
        booking_id=401,
        passenger=p1,
        ship=s1,
        cabin_type="Deluxe",
        journey_date=datetime.strptime("2026-10-15", "%Y-%m-%d").date(),
        source_port="Chennai Port",
        destination_port="Port Blair",
        total_amount=12000,
        booking_status="Confirmed"
    )
    b2 = Booking.objects.create(
        booking_id=402,
        passenger=p2,
        ship=s2,
        cabin_type="Economy",
        journey_date=datetime.strptime("2026-10-18", "%Y-%m-%d").date(),
        source_port="Mumbai Port",
        destination_port="Goa Port",
        total_amount=2500,
        booking_status="Confirmed"
    )
    b3 = Booking.objects.create(
        booking_id=403,
        passenger=p3,
        ship=s3,
        cabin_type="Suite",
        journey_date=datetime.strptime("2026-10-20", "%Y-%m-%d").date(),
        source_port="Cochin Port",
        destination_port="Lakshadweep",
        total_amount=20000,
        booking_status="Waiting"
    )

    print("Seeding Payments...")
    Payment.objects.create(
        payment_id=501,
        booking=b1,
        passenger=p1,
        amount=12000,
        payment_method="UPI",
        payment_status="Success",
        transaction_id="TXN789456123",
        payment_date=datetime.strptime("2026-09-20", "%Y-%m-%d").date()
    )
    Payment.objects.create(
        payment_id=502,
        booking=b2,
        passenger=p2,
        amount=2500,
        payment_method="Credit Card",
        payment_status="Success",
        transaction_id="TXN112233445",
        payment_date=datetime.strptime("2026-09-21", "%Y-%m-%d").date()
    )
    Payment.objects.create(
        payment_id=503,
        booking=b3,
        passenger=p3,
        amount=20000,
        payment_method="Net Banking",
        payment_status="Pending",
        transaction_id="TXN556677889",
        payment_date=datetime.strptime("2026-09-22", "%Y-%m-%d").date()
    )

    print("Database seeding completed successfully!")

if __name__ == '__main__':
    seed_database()
