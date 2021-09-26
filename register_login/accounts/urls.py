from django.urls import path

from . import views

urlpatterns = [
    path('', views.loginUser, name = 'index'),
    path('home/', views.home, name = 'home'),
    path('register/', views.registerUser, name = 'register'),
    path('logout/', views.logoutUser, name = 'logout'),

]