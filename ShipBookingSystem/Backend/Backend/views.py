import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime
from .models import Passenger, Ship, Schedule, Booking, Payment

# Helper Serializers
def serialize_passenger(p):
    return {
        "passenger_id": p.passenger_id,
        "full_name": p.full_name,
        "email": p.email,
        "phone": p.phone,
        "nationality": p.nationality,
        "passport_number": p.passport_number,
        "password": p.password
    }

def serialize_ship(s):
    return {
        "ship_id": s.ship_id,
        "ship_name": s.ship_name,
        "ship_type": s.ship_type,
        "capacity": s.capacity,
        "operator_name": s.operator_name,
        "status": s.status
    }

def serialize_schedule(sch):
    return {
        "schedule_id": sch.schedule_id,
        "ship_name": sch.ship.ship_name,
        "source_port": sch.source_port,
        "destination_port": sch.destination_port,
        "departure_date": sch.departure_date.isoformat() if hasattr(sch.departure_date, "isoformat") else str(sch.departure_date),
        "departure_time": sch.departure_time.strftime("%H:%M") if hasattr(sch.departure_time, "strftime") else str(sch.departure_time),
        "arrival_date": sch.arrival_date.isoformat() if hasattr(sch.arrival_date, "isoformat") else str(sch.arrival_date),
        "arrival_time": sch.arrival_time.strftime("%H:%M") if hasattr(sch.arrival_time, "strftime") else str(sch.arrival_time),
        "fare": sch.fare
    }

def serialize_booking(b):
    return {
        "booking_id": b.booking_id,
        "passenger_name": b.passenger.full_name,
        "ship_name": b.ship.ship_name,
        "cabin_type": b.cabin_type,
        "journey_date": b.journey_date.isoformat() if hasattr(b.journey_date, "isoformat") else str(b.journey_date),
        "source_port": b.source_port,
        "destination_port": b.destination_port,
        "total_amount": b.total_amount,
        "booking_status": b.booking_status
    }

def serialize_payment(pay):
    return {
        "payment_id": pay.payment_id,
        "booking_id": pay.booking.booking_id,
        "passenger_name": pay.passenger.full_name,
        "amount": pay.amount,
        "payment_method": pay.payment_method,
        "payment_status": pay.payment_status,
        "transaction_id": pay.transaction_id,
        "payment_date": pay.payment_date.isoformat() if hasattr(pay.payment_date, "isoformat") else str(pay.payment_date)
    }

# =====================================================================
# PASSENGER VIEWS
# =====================================================================

@csrf_exempt
def passenger_list_or_add(request):
    if request.method == 'GET':
        passengers = Passenger.objects.all()
        return JsonResponse([serialize_passenger(p) for p in passengers], safe=False)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            p = Passenger.objects.create(
                full_name=data.get('full_name'),
                email=data.get('email'),
                phone=data.get('phone', ''),
                nationality=data.get('nationality', ''),
                passport_number=data.get('passport_number', ''),
                password=data.get('password')
            )
            return JsonResponse(serialize_passenger(p), status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def passenger_detail(request, id):
    try:
        p = Passenger.objects.get(pk=id)
    except Passenger.DoesNotExist:
        return JsonResponse({"error": "Passenger not found"}, status=404)

    if request.method == 'GET':
        return JsonResponse(serialize_passenger(p))
    
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            p.full_name = data.get('full_name', p.full_name)
            p.email = data.get('email', p.email)
            p.phone = data.get('phone', p.phone)
            p.nationality = data.get('nationality', p.nationality)
            p.passport_number = data.get('passport_number', p.passport_number)
            if 'password' in data:
                p.password = data.get('password')
            p.save()
            return JsonResponse(serialize_passenger(p))
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
            
    elif request.method == 'DELETE':
        p.delete()
        return JsonResponse({"message": "Passenger deleted successfully"}, status=200)

    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def passenger_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            p = Passenger.objects.filter(email=email, password=password).first()
            if p:
                return JsonResponse({"status": "success", "passenger": serialize_passenger(p)})
            else:
                return JsonResponse({"status": "failed", "error": "Invalid email or password"}, status=401)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Method not allowed"}, status=405)

# =====================================================================
# SHIP VIEWS
# =====================================================================

@csrf_exempt
def ship_list_or_add(request):
    if request.method == 'GET':
        ships = Ship.objects.all()
        return JsonResponse([serialize_ship(s) for s in ships], safe=False)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            s = Ship.objects.create(
                ship_name=data.get('ship_name'),
                ship_type=data.get('ship_type'),
                capacity=int(data.get('capacity', 0)),
                operator_name=data.get('operator_name', ''),
                status=data.get('status', 'Active')
            )
            return JsonResponse(serialize_ship(s), status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def ship_detail(request, id):
    try:
        s = Ship.objects.get(pk=id)
    except Ship.DoesNotExist:
        return JsonResponse({"error": "Ship not found"}, status=404)

    if request.method == 'GET':
        return JsonResponse(serialize_ship(s))
    
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            s.ship_name = data.get('ship_name', s.ship_name)
            s.ship_type = data.get('ship_type', s.ship_type)
            s.capacity = int(data.get('capacity', s.capacity))
            s.operator_name = data.get('operator_name', s.operator_name)
            s.status = data.get('status', s.status)
            s.save()
            return JsonResponse(serialize_ship(s))
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
            
    elif request.method == 'DELETE':
        s.delete()
        return JsonResponse({"message": "Ship deleted successfully"}, status=200)

    return JsonResponse({"error": "Method not allowed"}, status=405)

# =====================================================================
# SCHEDULE VIEWS
# =====================================================================

@csrf_exempt
def schedule_list_or_add(request):
    if request.method == 'GET':
        schedules = Schedule.objects.all()
        return JsonResponse([serialize_schedule(sch) for sch in schedules], safe=False)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            ship_name = data.get('ship_name')
            ship = Ship.objects.filter(ship_name=ship_name).first()
            if not ship:
                ship = Ship.objects.create(
                    ship_name=ship_name,
                    ship_type="Cruise Ship",
                    capacity=1000,
                    operator_name="Royal Cruises",
                    status="Active"
                )
            
            dep_date = datetime.strptime(data.get('departure_date'), "%Y-%m-%d").date()
            arr_date = datetime.strptime(data.get('arrival_date'), "%Y-%m-%d").date()
            
            sch = Schedule.objects.create(
                ship=ship,
                source_port=data.get('source_port'),
                destination_port=data.get('destination_port'),
                departure_date=dep_date,
                departure_time=data.get('departure_time'),
                arrival_date=arr_date,
                arrival_time=data.get('arrival_time'),
                fare=float(data.get('fare', 0))
            )
            return JsonResponse(serialize_schedule(sch), status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def schedule_detail(request, id):
    try:
        sch = Schedule.objects.get(pk=id)
    except Schedule.DoesNotExist:
        return JsonResponse({"error": "Schedule not found"}, status=404)

    if request.method == 'GET':
        return JsonResponse(serialize_schedule(sch))
    
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            if 'ship_name' in data:
                ship_name = data.get('ship_name')
                ship = Ship.objects.filter(ship_name=ship_name).first()
                if ship:
                    sch.ship = ship
            
            sch.source_port = data.get('source_port', sch.source_port)
            sch.destination_port = data.get('destination_port', sch.destination_port)
            if 'departure_date' in data:
                sch.departure_date = datetime.strptime(data.get('departure_date'), "%Y-%m-%d").date()
            if 'departure_time' in data:
                sch.departure_time = data.get('departure_time')
            if 'arrival_date' in data:
                sch.arrival_date = datetime.strptime(data.get('arrival_date'), "%Y-%m-%d").date()
            if 'arrival_time' in data:
                sch.arrival_time = data.get('arrival_time')
            if 'fare' in data:
                sch.fare = float(data.get('fare'))
            sch.save()
            return JsonResponse(serialize_schedule(sch))
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
            
    elif request.method == 'DELETE':
        sch.delete()
        return JsonResponse({"message": "Schedule deleted successfully"}, status=200)

    return JsonResponse({"error": "Method not allowed"}, status=405)

# =====================================================================
# BOOKING VIEWS
# =====================================================================

@csrf_exempt
def booking_list_or_add(request):
    if request.method == 'GET':
        bookings = Booking.objects.all()
        return JsonResponse([serialize_booking(b) for b in bookings], safe=False)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            p_name = data.get('passenger_name')
            passenger = Passenger.objects.filter(full_name=p_name).first()
            if not passenger:
                passenger = Passenger.objects.create(
                    full_name=p_name,
                    email=f"{p_name.lower().replace(' ', '')}@example.com",
                    phone="9999999999",
                    nationality="Indian",
                    passport_number="P1234567",
                    password="password123"
                )
            
            s_name = data.get('ship_name')
            ship = Ship.objects.filter(ship_name=s_name).first()
            if not ship:
                ship = Ship.objects.create(
                    ship_name=s_name,
                    ship_type="Cruise Ship",
                    capacity=1000,
                    operator_name="Royal Cruises",
                    status="Active"
                )
            
            j_date = datetime.strptime(data.get('journey_date'), "%Y-%m-%d").date()
            
            b = Booking.objects.create(
                passenger=passenger,
                ship=ship,
                cabin_type=data.get('cabin_type'),
                journey_date=j_date,
                source_port=data.get('source_port'),
                destination_port=data.get('destination_port'),
                total_amount=float(data.get('total_amount', 0)),
                booking_status=data.get('booking_status', 'Waiting')
            )
            return JsonResponse(serialize_booking(b), status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def booking_detail(request, id):
    try:
        b = Booking.objects.get(pk=id)
    except Booking.DoesNotExist:
        return JsonResponse({"error": "Booking not found"}, status=404)

    if request.method == 'GET':
        return JsonResponse(serialize_booking(b))
    
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            if 'passenger_name' in data:
                p_name = data.get('passenger_name')
                passenger = Passenger.objects.filter(full_name=p_name).first()
                if passenger:
                    b.passenger = passenger
            if 'ship_name' in data:
                s_name = data.get('ship_name')
                ship = Ship.objects.filter(ship_name=s_name).first()
                if ship:
                    b.ship = ship
            
            b.cabin_type = data.get('cabin_type', b.cabin_type)
            if 'journey_date' in data:
                b.journey_date = datetime.strptime(data.get('journey_date'), "%Y-%m-%d").date()
            b.source_port = data.get('source_port', b.source_port)
            b.destination_port = data.get('destination_port', b.destination_port)
            if 'total_amount' in data:
                b.total_amount = float(data.get('total_amount'))
            b.booking_status = data.get('booking_status', b.booking_status)
            b.save()
            return JsonResponse(serialize_booking(b))
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
            
    elif request.method == 'DELETE':
        b.delete()
        return JsonResponse({"message": "Booking deleted successfully"}, status=200)

    return JsonResponse({"error": "Method not allowed"}, status=405)

# =====================================================================
# PAYMENT VIEWS
# =====================================================================

@csrf_exempt
def payment_list_or_add(request):
    if request.method == 'GET':
        payments = Payment.objects.all()
        return JsonResponse([serialize_payment(p) for p in payments], safe=False)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            booking_id = int(data.get('booking_id'))
            booking = Booking.objects.get(pk=booking_id)
            
            p_name = data.get('passenger_name')
            passenger = Passenger.objects.filter(full_name=p_name).first()
            if not passenger:
                passenger = booking.passenger
            
            p_date = datetime.today().date()
            if 'payment_date' in data:
                p_date = datetime.strptime(data.get('payment_date'), "%Y-%m-%d").date()
                
            pay = Payment.objects.create(
                booking=booking,
                passenger=passenger,
                amount=float(data.get('amount', booking.total_amount)),
                payment_method=data.get('payment_method'),
                payment_status=data.get('payment_status', 'Success'),
                transaction_id=data.get('transaction_id', 'TXN' + str(datetime.now().timestamp()).replace('.', '')),
                payment_date=p_date
            )
            
            # Auto update booking status to confirmed if payment success
            if pay.payment_status == 'Success':
                booking.booking_status = 'Confirmed'
                booking.save()
            elif pay.payment_status == 'Failed':
                booking.booking_status = 'Cancelled'
                booking.save()
                
            return JsonResponse(serialize_payment(pay), status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def payment_detail(request, id):
    try:
        pay = Payment.objects.get(pk=id)
    except Payment.DoesNotExist:
        return JsonResponse({"error": "Payment not found"}, status=404)

    if request.method == 'GET':
        return JsonResponse(serialize_payment(pay))
    
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            if 'booking_id' in data:
                booking_id = int(data.get('booking_id'))
                pay.booking = Booking.objects.get(pk=booking_id)
            if 'passenger_name' in data:
                p_name = data.get('passenger_name')
                passenger = Passenger.objects.filter(full_name=p_name).first()
                if passenger:
                    pay.passenger = passenger
            
            pay.amount = float(data.get('amount', pay.amount))
            pay.payment_method = data.get('payment_method', pay.payment_method)
            pay.payment_status = data.get('payment_status', pay.payment_status)
            pay.transaction_id = data.get('transaction_id', pay.transaction_id)
            if 'payment_date' in data:
                pay.payment_date = datetime.strptime(data.get('payment_date'), "%Y-%m-%d").date()
            pay.save()
            return JsonResponse(serialize_payment(pay))
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
            
    elif request.method == 'DELETE':
        pay.delete()
        return JsonResponse({"message": "Payment deleted successfully"}, status=200)

    return JsonResponse({"error": "Method not allowed"}, status=405)
