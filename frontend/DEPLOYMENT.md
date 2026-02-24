# Deployment Guide

Complete guide for deploying the Rubik's Cube Solver Dashboard to production.

## Pre-Deployment Checklist

### Code Quality
- [ ] `npm run lint` - All linting errors fixed
- [ ] `npm run build` - Build completes without errors
- [ ] All TypeScript errors resolved
- [ ] No console warnings in development build
- [ ] Environment variables configured

### Testing
- [ ] Manual testing completed
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness verified
- [ ] All features tested with backend

### Performance
- [ ] Bundle size analyzed: `npm run build -- --analyze`
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 3s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Time to Interactive < 3.5s

## Building for Production

### 1. Optimize Build

Create `.env.production`:
```env
VITE_API_BASE_URL=https://api.example.com/api
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
```

### 2. Build Command

```bash
npm run build
```

**Output:**
- `dist/index.html` - Main HTML file
- `dist/assets/` - JavaScript, CSS, images
- File size: ~500KB (gzipped: ~150KB recommended)

### 3. Verify Build

```bash
npm run preview
# Open http://localhost:4173
```

## Deployment Options

### Option A: Static Hosting (Recommended)

Best for: GitHub Pages, Vercel, Netlify, CloudFlare Pages

#### Vercel (Easiest)
```bash
npm install -g vercel
vercel login
vercel
```

- Automatically builds & deploys
- Preview deployments for PRs
- Custom domains supported
- HTTPS automatic

#### Netlify
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir dist
```

#### GitHub Pages
```bash
npm install --save-dev gh-pages
# Update package.json
```
```json
{
  "homepage": "https://username.github.io/rubic_cube",
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}
```

### Option B: Docker Container

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build & deploy:
```bash
docker build -t rubiks-dashboard .
docker run -p 80:80 rubiks-dashboard
```

### Option C: Node.js Server

Use `vite-express` for server-side rendering:

```bash
npm install vite-express
```

```tsx
// server.ts
import express from 'express'
import { createServer as createViteServer } from 'vite'

const app = express()
const vite = await createViteServer({ server: { middlewareMode: true } })

app.use(vite.middlewares)
app.listen(3000)
```

### Option D: AWS S3 + CloudFront

1. Build application
2. Upload `dist/` to S3 bucket
3. Create CloudFront distribution
4. Point domain to CloudFront
5. Invalidate cache on deployments

```bash
aws s3 sync dist/ s3://my-bucket/
aws cloudfront create-invalidation --distribution-id E123ABC --paths "/*"
```

## Environment Configuration

### Production Variables

```env
# Backend API
VITE_API_BASE_URL=https://api.example.com/api
VITE_API_TIMEOUT=10000

# Features
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_CRASH_REPORTING=true

# UI
VITE_THEME=dark
VITE_LANGUAGE=en
```

### Securing Sensitive Data

- Never commit `.env` files
- Use CI/CD secrets management
- Rotate API keys regularly
- Implement CORS properly on backend
- Use HTTPS only in production

## Backend Integration

### CORS Configuration (Java/Spring)

```java
@Configuration
@EnableWebMvc
public class CorsConfig implements WebMvcConfigurer {
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
      .allowedOrigins("https://yourdomain.com")
      .allowedMethods("GET", "POST", "PUT", "DELETE")
      .allowedHeaders("*")
      .allowCredentials(true)
      .maxAge(3600);
  }
}
```

### API Rate Limiting

```java
@RestController
@RequestMapping("/api")
@RateLimiter(limit = 60, windowMs = 60000) // 60 req/min
public class CubeController {
  @PostMapping("/solve")
  public ResponseEntity<SolveResponse> solve(@RequestBody CubeRequest request) {
    // Implementation
  }
}
```

## Monitoring & Analytics

### Application Performance Monitoring (APM)

Install APM client:
```bash
npm install vitals
```

```tsx
// src/main.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)
```

### Error Tracking

Setup Sentry:
```bash
npm install @sentry/react @sentry/tracing
```

```tsx
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
})

export default Sentry.withProfiler(App)
```

## Performance Optimization

### Image Optimization
```bash
npm install -D @squoosh/lib
```

### Gzip Compression
Server should auto-gzip with:
- `.js` → `.js.gz`
- `.css` → `.css.gz`

### CSS Purging
Tailwind automatically purges unused CSS in production.

### Bundle Analysis
```bash
npm install --save-dev rollup-plugin-visualizer
```

Update `vite.config.ts`:
```tsx
import { visualizer } from "rollup-plugin-visualizer"

export default {
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
    }),
  ],
}
```

## CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run lint
        run: npm run lint
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### GitLab CI Example

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

build:
  stage: build
  image: node:18
  script:
    - npm install
    - npm run build
  artifacts:
    paths:
      - dist/

deploy:
  stage: deploy
  image: node:18
  script:
    - npm install -g vercel
    - vercel --prod --token $VERCEL_TOKEN
  only:
    - main
```

## Security Considerations

### 1. Content Security Policy

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';">
```

### 2. Subresource Integrity (SRI)

```html
<script src="https://cdn.example.com/lib.js" 
        integrity="sha384-abc123..." 
        crossorigin="anonymous"></script>
```

### 3. Security Headers

Configure on server:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 4. API Authentication

Add token to requests:
```tsx
// src/utils/api.ts
const token = localStorage.getItem('auth_token')
this.api = axios.create({
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

## Maintenance

### Regular Tasks

```bash
# Weekly
npm outdated  # Check for updates
npm audit     # Check security vulnerabilities

# Monthly
npm update    # Update dependencies
npm run build # Verify build still works

# Quarterly
npm audit fix  # Fix vulnerabilities
Review error logs and analytics
```

### Database Backups
- Backup configuration files
- Keep deployment secrets secure
- Document deployment procedures

## Rollback Procedure

### If deployment fails:

1. **Immediate rollback**
   - On Vercel: Click "Rollback" on deployment
   - On Netlify: Revert to previous deployment
   - S3: Restore from previous version

2. **For manual deployments**
   ```bash
   git revert <commit-hash>
   npm run build
   npm run deploy
   ```

3. **Communication**
   - Notify stakeholders
   - Post status update
   - Document issue in postmortem

## Disaster Recovery

### Critical Failures

1. **Website down**
   - Check server status
   - Review error logs
   - Rollback to last working version
   - Investigate root cause

2. **Data loss**
   - Restore from backup
   - Verify data integrity
   - Notify users if affected

3. **Security breach**
   - Rotate all credentials immediately
   - Review access logs
   - Patch vulnerabilities
   - Notify affected users

## Post-Deployment Verification

### Smoke Tests

```bash
#!/bin/bash
# test-deployment.sh

echo "🧪 Testing deployment..."

# Check homepage loads
curl -I https://yourdomain.com | grep "200 OK"

# Check API connectivity
curl -I https://yourdomain.com/api/health

# Check performance
curl https://yourdomain.com -w "
  Total time: %{time_total}s\n
  TTFB: %{time_starttransfer}s\n"

echo "✅ Deployment tests passed"
```

### User Acceptance Testing (UAT)

- [ ] Homepage loads correctly
- [ ] Can input cube state
- [ ] Can solve cube successfully
- [ ] Playback works smoothly
- [ ] Responsive on mobile
- [ ] Performance acceptable
- [ ] No console errors

## Documentation

### Runbook
Create `RUNBOOK.md` with:
- How to deploy
- How to rollback
- How to monitor
- How to handle incidents

### Change Log
```markdown
## [1.0.0] - 2024-02-24
- Initial production release
- Features: cube visualization, solver integration
- Performance: < 2s FCP
```

## Support & Maintenance

### Scheduled Maintenance
- Announce 24 hours in advance
- Schedule during low-traffic hours
- Have rollback plan ready
- Monitor closely after restart

### User Support
- Document common issues
- Provide FAQ
- Setup support email
- Monitor error tracking

## Conclusion

Follow this guide for reliable, secure deployments. Always test thoroughly before going live!
