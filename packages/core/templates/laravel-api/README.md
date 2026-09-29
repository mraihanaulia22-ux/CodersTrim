# __CT_PROJECT_NAME__

Headless PHP REST API built with Laravel 13, SQLite, and Sanctum.

## 🚀 Getting Started

### 1. Install dependencies
```bash
composer install
```

### 2. Configure environment
```bash
cp .env.example .env
php artisan key:generate
```

### 3. Run database migrations
```bash
php artisan migrate
```

### 4. Start local development server
```bash
php artisan serve
```
The API will run on [http://localhost:8000](http://localhost:8000).
Check health: [http://localhost:8000/api/health](http://localhost:8000/api/health).
