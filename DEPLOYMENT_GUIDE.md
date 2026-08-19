# 🚀 Nexa Cloud Deployment Guide (Vercel + Render / Railway)

This guide provides step-by-step instructions to deploy **Nexa** to production on cloud hosting platforms:
- **FastAPI REST Backend**: Render / Railway
- **React / Vite Frontend**: Vercel

---

## 1. Deploying Backend to Render (`render.com`)

### Option A: Render Blueprints (Automatic)
1. Push your repository to GitHub.
2. Log into [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Blueprint**.
3. Connect your GitHub repository `nexa`.
4. Render will automatically pick up `render.yaml` and configure the service:
   - **Root Directory**: `kb-agent`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn api:app --host 0.0.0.0 --port $PORT`
5. Set environment variables under **Environment**:
   - `GROQ_API_KEY`: `gsk_...` (or `GEMINI_API_KEY`: `AIza_...`)
   - `NEXA_ALLOWED_ORIGINS`: `https://your-nexa-app.vercel.app`
6. Click **Apply**. Render will build and deploy your backend REST API.
7. Copy your deployed Render URL (e.g. `https://nexa-api.onrender.com`).

---

## 2. Deploying Frontend to Vercel (`vercel.com`)

### Option A: Vercel Dashboard (GitHub Integration)
1. Log into [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** -> **Project**.
2. Import your GitHub repository `nexa`.
3. Set **Root Directory** to `frontend`.
4. Vercel will automatically detect **Vite** framework and settings from `frontend/vercel.json`.
5. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://nexa-api.onrender.com` (Your Render Backend URL)
6. Click **Deploy**.

### Option B: Vercel CLI
```bash
cd frontend
npm install -g vercel
vercel --prod
```

---

## 3. Post-Deployment Verification

1. **Verify Backend Health**:
   Visit `https://nexa-api.onrender.com/api/v1/health`  
   Expected JSON response:
   ```json
   {
     "status": "online",
     "version": "3.0.0",
     "provider": "GEMINI FLASH",
     "embedding_model": "all-MiniLM-L6-v2"
   }
   ```

2. **Verify CORS Connection**:
   Update `NEXA_ALLOWED_ORIGINS` in your Render backend settings to include your final Vercel domain (e.g. `https://nexa-frontend.vercel.app`).

3. **Open Production Application**:
   Open `https://your-nexa-app.vercel.app` in your browser. Perform a test query or upload a document to verify end-to-end cloud processing!
