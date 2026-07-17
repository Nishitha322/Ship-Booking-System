from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Passenger URLs
    path('passengers/', views.passenger_list_or_add, name='passenger_list_or_add'),
    path('passengers/add/', views.passenger_list_or_add, name='passenger_add'),
    path('passengers/update/<int:id>/', views.passenger_detail, name='passenger_update'),
    path('passengers/delete/<int:id>/', views.passenger_detail, name='passenger_delete'),
    path('passengers/login/', views.passenger_login, name='passenger_login'),
    
    # Ship URLs
    path('ships/', views.ship_list_or_add, name='ship_list_or_add'),
    path('ships/add/', views.ship_list_or_add, name='ship_add'),
    path('ships/update/<int:id>/', views.ship_detail, name='ship_update'),
    path('ships/delete/<int:id>/', views.ship_detail, name='ship_delete'),
    
    # Schedule URLs
    path('schedules/', views.schedule_list_or_add, name='schedule_list_or_add'),
    path('schedules/add/', views.schedule_list_or_add, name='schedule_add'),
    path('schedules/update/<int:id>/', views.schedule_detail, name='schedule_update'),
    path('schedules/delete/<int:id>/', views.schedule_detail, name='schedule_delete'),
    
    # Booking URLs
    path('bookings/', views.booking_list_or_add, name='booking_list_or_add'),
    path('bookings/add/', views.booking_list_or_add, name='booking_add'),
    path('bookings/update/<int:id>/', views.booking_detail, name='booking_update'),
    path('bookings/delete/<int:id>/', views.booking_detail, name='booking_delete'),
    
    # Payment URLs
    path('payments/', views.payment_list_or_add, name='payment_list_or_add'),
    path('payments/add/', views.payment_list_or_add, name='payment_add'),
    path('payments/update/<int:id>/', views.payment_detail, name='payment_update'),
    path('payments/delete/<int:id>/', views.payment_detail, name='payment_delete'),
]
