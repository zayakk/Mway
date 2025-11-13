# Mway - Bus Booking System

Django REST API backend + Expo React Native frontend

## 🚀 Quick Start

### Prerequisites
- Node.js (installed)
- Python 3.11+ (install from the Microsoft Store or python.org)

### Fast Setup (First Time)

**Backend:**
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install django djangorestframework django-cors-headers
.\.venv\Scripts\python.exe manage.py migrate
```

**Frontend:**
```powershell
cd frontend
npm install
```

### Start Development Servers

**Terminal 1 - Backend:**
```powershell
cd backend
.\.venv\Scripts\python.exe manage.py runserver
```
Backend runs at: `http://127.0.0.1:8000/`

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
```
Then press:
- `w` for web browser
- `a` for Android emulator
- `i` for iOS simulator
- Scan QR code with Expo Go app

---

## 📚 Detailed Setup (Reference)

### Backend (Django)

The backend is already configured with:
- Django 5.2.8
- Django REST Framework
- django-cors-headers
- SQLite database

**Virtual Environment:**
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install django djangorestframework django-cors-headers
```

**Run Migrations:**
```powershell
python manage.py migrate
```

**Start Server:**
```powershell
python manage.py runserver
```

### Frontend (Expo)

**Install Dependencies:**
```powershell
cd frontend
npm install
```

**Start Development Server:**
```powershell
npm start
```

### API Endpoints

- `http://127.0.0.1:8000/api/hello/` - Test endpoint
- `http://127.0.0.1:8000/api/cities/` - List cities
- `http://127.0.0.1:8000/api/stations/` - List stations
- `http://127.0.0.1:8000/api/search/` - Search trips
- `http://127.0.0.1:8000/api/trips/<id>/` - Trip details
- `http://127.0.0.1:8000/api/trips/<id>/seats/` - Trip seat map
- `http://127.0.0.1:8000/api/book/` - Book tickets
- `http://127.0.0.1:8000/api/holds/` - Hold seats
- `http://127.0.0.1:8000/api/auth/register/` - User registration
- `http://127.0.0.1:8000/api/auth/login/` - User login
- `http://127.0.0.1:8000/api/auth/me/` - Get current user
- `http://127.0.0.1:8000/admin/` - Django admin panel

### Notes

- Keep `CORS_ALLOW_ALL_ORIGINS = True` only for development. Lock it down for production.
- If `python` is not recognized, install Python and reopen the terminal.
- For testing on a physical device, ensure your phone can reach your computer's IP address.
