# Running with Docker

## Start everything (API, Web, Postgres, Redis, Stripe webhook forwarding)

From the project root:

```bash
npm run docker:up
```

Or:

```bash
docker compose up --build
```

- **API:** http://localhost:4000  
- **Web:** http://localhost:3000  
- **Stripe:** The `stripe` service runs `stripe listen --forward-to http://api:4000/webhooks/stripe`.  
  - Set `STRIPE_SECRET_KEY` in a `.env` file at the project root so the Stripe CLI can connect.  
  - After the first start, check the `stripe` container logs for the webhook signing secret (e.g. `whsec_...`), then set `STRIPE_WEBHOOK_SECRET` in `.env` and restart the api service:  
    `docker compose restart api`

## Stop

```bash
npm run docker:down
```

## Stripe only on the host (without Docker Stripe service)

If you run the API locally (not in Docker) and want to forward webhooks with the Stripe CLI on your machine:

```bash
npm run stripe:listen
```

This runs: `stripe listen --forward-to localhost:4000/webhooks/stripe`

## Environment

Create a `.env` file at the project root for Docker Compose. Example:

```env
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
BASE_URL=http://localhost:3000
```
