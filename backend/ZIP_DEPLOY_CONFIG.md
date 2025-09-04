# Azure App Service Zip Deploy Configuration

## App Settings (One-time setup)

In Azure Portal → App Service → Configuration → Application settings:

```
PYTHONPATH = /home/site/wwwroot:/home/site/wwwroot/.python_packages/lib/site-packages:/home/site/wwwroot/.python_packages/lib/python3.11/site-packages

WEBSITES_CONTAINER_START_TIME_LIMIT = 180

WEBSITE_HEALTHCHECK_MAXPINGFAILURES = 10
```

## Startup Command

In Azure Portal → App Service → Configuration → General settings → Startup Command:

**Option A (Simple):**
```
python startup.py
```

**Option B (Gunicorn):**
```
gunicorn -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:${PORT} app.main:app
```

## Health Check

In Azure Portal → App Service → Configuration → Health check:

**Path:** `/api/health`

## Verification URLs

After deployment, test these endpoints:

- Root: `https://<your-site>.azurewebsites.net/`
- Health: `https://<your-site>.azurewebsites.net/api/health`
- Docs: `https://<your-site>.azurewebsites.net/docs`

## Current Setup

✅ `startup.py` - Enhanced with logging
✅ `web.config` - Updated with longer timeout
✅ `/api/health` endpoint - Ready for health checks
✅ `requirements.txt` - Includes uvicorn[standard] and gunicorn
✅ GitHub Action - Already configured for Zip Deploy

## Next Steps

1. Set the app settings above in Azure Portal
2. Set the startup command (Option A recommended)
3. Set the health check path
4. Commit and push to trigger deployment
5. Monitor logs in App Service → Log stream
