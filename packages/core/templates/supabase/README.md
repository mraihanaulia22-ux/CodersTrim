# __CT_PROJECT_NAME__ (Supabase Backend)

Cloud Backend-as-a-Service configuration with PostgreSQL schemas and Row Level Security (RLS).

## 🚀 Getting Started

### 1. Local Development (Supabase CLI)
```bash
# Start local Supabase Docker stack
npx supabase start

# Apply database migrations
npx supabase db reset
```

### 2. Connect to Frontend or Mobile
Copy your `API URL` and `anon key` to your client `.env` file:
```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=your-anon-key-here
```
