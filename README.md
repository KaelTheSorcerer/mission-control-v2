# Mission Control v2.0

## Deployment

### Vercel
1. Connect GitHub repo to Vercel
2. Framework preset: Next.js
3. Build command: `npm run build`
4. Output directory: (leave default)

### Railway
1. Connect GitHub repo to Railway
2. Uses Dockerfile for deployment
3. Health check: `/api/agents`

### Environment Variables
None required for basic operation.

### Database
Uses JSON file storage (auto-created at runtime).

## Development
```bash
npm install
npm run dev
```

## Production
```bash
npm run build
npm start
```
