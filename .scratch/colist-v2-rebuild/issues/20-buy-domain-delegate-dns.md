# Delegate colist.heloineto.com to Route 53

Type: task
Status: open

## Question

Colist has no custom domain (only `*.vercel.app`). v2 needs a stable origin for Caddy TLS, cookies and SSE. Decided 2026-08-29: **no purchase** — use a subdomain of the user's existing `heloineto.com` (GoDaddy DNS, `ns49/50.domaincontrol.com`; apex → Vercel, untouched). Single host `colist.heloineto.com` serves web + `/api/*` through Caddy (same-origin, no CORS/`api.` host). Buying `colist.com.br` is deferred to go-public (see Out of scope on the map).

Checklist (HITL):
1. Create a Route 53 hosted zone `colist.heloineto.com` — Terraform once [AWS and Terraform architecture](12-aws-terraform-architecture.md) lands, or by hand now and `terraform import` later.
2. At GoDaddy DNS for `heloineto.com`, add an `NS` record, name `colist`, values = the zone's four name servers.
3. Verify: `dig NS colist.heloineto.com` returns the Route 53 servers.
4. Google Cloud console (Auth Platform → Clients → colist-web): add origin `https://colist.heloineto.com` and redirect `https://colist.heloineto.com/api/auth/callback/google`; Branding → authorized domain `heloineto.com` (from [Google OAuth credentials](19-google-oauth-credentials.md)).

Resolution records: hosted zone id, whether it's Terraform-managed or pending import, Google console entries done.
