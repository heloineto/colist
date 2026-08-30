# Colist

# Ports

Local-dev only. Colist uses the `5xxx` range (voto-a-voto owns `4xxx`; both run on the same machine).

| Port      | Service                              |
| --------- | ------------------------------------ |
| 5000      | Next.js web app (`bun run dev`)      |
| 5001-5049 | Supabase (API 5001, DB 5002, Studio 5003, Inbucket 5004, Analytics 5007, Pooler 5009, shadow DB 5010) |
| 5050-5099 | Frontend services                    |
| 5100-5199 | Backend services (v2 API: 5100)      |
| 5200-5299 | Databases (v2 Postgres: 5200)        |
| 5300-5399 | Testing                              |
