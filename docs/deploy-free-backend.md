# Free Backend Deployment

Use this path when Render asks for a card. The backend can run as a Docker app on Hugging Face Spaces without adding a card.

## Target Architecture

- Frontend: Vercel (`https://clinicnext-tqti.vercel.app`)
- Backend: Hugging Face Spaces Docker
- Database: Supabase PostgreSQL

## Hugging Face Spaces Setup

1. Create a Hugging Face account.
2. Create a new Space.
3. Select **Docker** as the Space SDK.
4. Connect/import this GitHub repository, or upload the root `Dockerfile` and backend files.
5. Set the Space visibility to Public or Private as preferred.

## Required Secrets

Set these as Space secrets, not regular files:

```text
ConnectionStrings__DefaultConnection=Host=aws-1-ap-southeast-2.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.rjirxnacevujayhjsrli;Password=<SUPABASE_DB_PASSWORD>;SSL Mode=Require;Trust Server Certificate=true
Jwt__Key=<STRONG_RANDOM_SECRET_AT_LEAST_32_CHARS>
Jwt__Issuer=ClinicNext
Jwt__Audience=ClinicNext.Client
AllowedOrigins=https://clinicnext-tqti.vercel.app
Database__MigrateOnStartup=true
SeedAdmin__Email=admin@clinicnext.local
SeedAdmin__Password=<INITIAL_ADMIN_PASSWORD>
SeedAdmin__Name=Clinic Admin
```

## Notes

- The app listens on `PORT`, defaulting to `7860` in Docker.
- The health endpoint is `/health`.
- Supabase direct host may fail on IPv4-only platforms. Use the Supabase Session Pooler host.
- After deployment, rotate any token/password that was shared during setup.

## Frontend Environment After Backend Is Live

Update Vercel environment variables:

```text
VITE_API_BASE_URL=https://<your-space-subdomain>.hf.space/api/v1
VITE_USE_DUMMY_API=false
VITE_BYPASS_LOGIN=false
```

Then redeploy the frontend.
