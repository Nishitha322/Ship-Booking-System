# 🚢 AuraCruises — Ship Booking System

A full-stack, responsive Ship Booking System built using **Django (Function-Based Views)** on the backend and a premium **"Modern Maritime" Vanilla HTML5, CSS3, & JavaScript (Fetch API)** frontend.

---

## 📂 Project Directory Structure

```text
ShipBookingSystem/
│── Backend/
│     manage.py
│     db.sqlite3
│     db.py                   # Custom Database Seeder
│     Backend/
│       __init__.py
│       settings.py           # Allowed hosts, CORS, installed apps config
│       urls.py               # Routes for all 20+ APIs
│       views.py              # Function-based REST API handlers
│       models.py             # Django models (Passenger, Ship, Schedule, etc.)
│       middleware.py         # Custom CORS middleware
│
└── Frontend/
      index.html              # Home page with hero, search, & offers
      login.html              # Passenger Login
      register.html           # Passenger Profile Registration
      ships.html              # Ship Schedules listings & filter panel
      ship_details.html       # Voyage view, gallery, & cabins selector
      booking.html            # Pre-filled Passenger Verification form
      payment.html            # Checkout billing portal
      booking_history.html    # Passenger upcoming / cancelled logs
      passenger_dashboard.html# Passenger summary statistics & ledger
      admin_dashboard.html    # Admin panel (CRUD Modals for all models)
      style.css               # Shared Modern Maritime stylesheet
      script.js               # Global controller (Fetch API, auth, panel rendering)
```

---

## 🛠️ Installation & Setup Instructions

### 1. Prerequisite Checks
Make sure you have **Python 3.x** installed. You can check this by running:
```powershell
python --version
```

Make sure **Django** is installed:
```powershell
python -m django --version
```
*If Django is missing, install it via: `pip install django`*

### 2. Seeding the Database
The project comes with a standalone seeder `db.py` preloaded with the required testing data (Rahul Sharma, Ocean Paradise, etc.). To reset and seed the database, run:
```powershell
cd ShipBookingSystem/Backend
python db.py
```
*This clears any existing data and seeds fresh Passengers, Ships, Schedules, Bookings, and Payments.*

### 3. Launching the Backend Server
Start the Django development server:
```powershell
python manage.py runserver
```
The backend REST APIs will be live at `http://127.0.0.1:8000/`.

### 4. Running the Frontend
Since the frontend uses vanilla HTML/CSS/JS, you can open `Frontend/index.html` directly in any web browser.
Alternatively, to avoid CORS warnings or local file system locks, run a quick server using Python:
```powershell
cd ../Frontend
python -m http.server 3000
```
Open `http://localhost:3000` in your web browser.

---

## 🔗 REST API Endpoint List (20 CRUD APIs + 1 Auth)

The system exposes 20 function-based views (FBVs) to handle REST operations, plus a helper login endpoint. All endpoints accept and return JSON payloads.

### 👤 Passenger Module
*   `POST   /passengers/add/` — Registers a passenger profile.
*   `GET    /passengers/` — Lists all registered passengers.
*   `PUT    /passengers/update/<id>/` — Updates passenger details by ID.
*   `DELETE /passengers/delete/<id>/` — Removes a passenger by ID.
*   `POST   /passengers/login/` — Custom helper endpoint for client-side authentication.

### 🚢 Ship Module
*   `POST   /ships/add/` — Registers a new vessel.
*   `GET    /ships/` — Lists all vessels in the fleet.
*   `PUT    /ships/update/<id>/` — Updates ship attributes by ID.
*   `DELETE /ships/delete/<id>/` — Deletes a ship record by ID.

### 📅 Schedule Module
*   `POST   /schedules/add/` — Configures a departure schedule.
*   `GET    /schedules/` — Lists all scheduled itineraries.
*   `PUT    /schedules/update/<id>/` — Modifies schedule parameters by ID.
*   `DELETE /schedules/delete/<id>/` — Deletes a schedule by ID.

### 🎫 Booking Module
*   `POST   /bookings/add/` — Places a cabin booking.
*   `GET    /bookings/` — Lists all bookings in the system.
*   `PUT    /bookings/update/<id>/` — Modifies booking status/details by ID.
*   `DELETE /bookings/delete/<id>/` — Deletes a booking by ID.

### 💵 Payment Module
*   `POST   /payments/add/` — Submits a checkout payment transaction (auto-confirms the matching booking).
*   `GET    /payments/` — Audits payment transaction logs.
*   `PUT    /payments/update/<id>/` — Updates transaction parameters by ID.
*   `DELETE /payments/delete/<id>/` — Deletes a transaction log by ID.

---

## 📊 Database Schema details

### SQLite Database Backend
The default engine is configured in `settings.py` to use `db.sqlite3`.
*   To migrate database engines to **MySQL** or **PostgreSQL**, adjust the `'default'` block in `Backend/settings.py` under `DATABASES` to configure your connection strings.
*   To query the local database via terminal, use `sqlite3 db.sqlite3` inside `Backend/`.


<img width="1548" height="938" alt="WhatsApp Image 2026-07-17 at 4 10 10 PM (1)" src="https://github.com/user-attachments/assets/1ee78f81-7d5c-492e-8a03-ba3867c73a81" />
<img width="1570" height="943" alt="WhatsApp Image 2026-07-17 at 4 10 10 PM (2)" src="https://github.com/user-attachments/assets/cd587c78-ad47-4359-9a22-e7562764e925" />
<img width="1555" height="936" alt="WhatsApp Image 2026-07-17 at 4 10 10 PM" src="https://github.com/user-attachments/assets/51a6563c-3fa3-466c-b9cb-ca32c19962c9" />



