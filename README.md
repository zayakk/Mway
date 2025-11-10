## Django + Expo Starter

This workspace contains:

- `backend` — Django REST backend (to be created after installing Python)
- `mobile` — Expo React Native app (already initialized)

### Prerequisites

- Node.js (installed)
- Python 3.11+ (install from the Microsoft Store or python.org)

### Backend (Django)

1) Open a terminal in `Mway/backend` and create a virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\activate
python -m pip install --upgrade pip
pip install django djangorestframework django-cors-headers
```

2) Initialize the project and an API app:

```powershell
django-admin startproject core .
python manage.py startapp api
```

3) In `core/settings.py`, add to `INSTALLED_APPS`:

```python
'rest_framework',
'corsheaders',
'api',
```

And add CORS middleware at the top of `MIDDLEWARE`:

```python
'corsheaders.middleware.CorsMiddleware',
```

Allow local Expo/web origins during development:

```python
CORS_ALLOW_ALL_ORIGINS = True  # dev only
```

4) Create a simple hello endpoint in `api/views.py`:

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["GET"])
def hello(request):
    return Response({"message": "Hello from Django API"})
```

And wire URLs:

`api/urls.py`
```python
from django.urls import path
from .views import hello

urlpatterns = [
    path("hello/", hello, name="hello"),
]
```

`core/urls.py`
```python
from django.urls import path, include

urlpatterns = [
    path("api/", include("api.urls")),
]
```

5) Run the server:

```powershell
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Mobile (Expo)

1) From `Mway/mobile`, start the app:

```powershell
npm start
```

2) The mobile app tries to fetch from `http://127.0.0.1:8000/api/hello/` on launch. If the backend isn't running, you'll see a friendly message. Once Django is running, it will show the API message.

3) For testing on a physical device, ensure your phone can reach your computer's IP. Replace the URL in `mobile/App.js` with your machine's LAN IP, e.g. `http://192.168.1.100:8000/api/hello/`.

### Notes

- Keep `CORS_ALLOW_ALL_ORIGINS = True` only for development. Lock it down for production.
- If `python` is not recognized, install Python and reopen the terminal.




