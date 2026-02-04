# 🏥 Hospitals Feature - Environment Setup Guide

## Quick Start

### 1. Get Google Places API Key

#### Step-by-Step:

1. **Go to Google Cloud Console**
   - Visit https://console.cloud.google.com
   - Sign in with your Google account

2. **Create a new project**
   - Click on the project dropdown at the top
   - Click "New Project"
   - Name it: `NueraCare`
   - Click "Create"

3. **Enable APIs**
   - Go to "APIs & Services" > "Library"
   - Search for "Places API"
   - Click on it and press "Enable"
   - Search for "Maps Embed API"
   - Click on it and press "Enable"

4. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

5. **Restrict API Key (Optional but Recommended)**
   - Click on your API key
   - Under "Key restrictions" select "Android" or "iOS"
   - Add your app package name
   - Under "API restrictions" select "Restrict key" and choose "Places API"

### 2. Store API Key in Environment

#### Backend (.env file)

Create or update `backend/.env`:

```env
# Google Places API
GOOGLE_PLACES_API_KEY=YOUR_API_KEY_HERE

# Existing keys
GROQ_API_KEY=xxx
ASSEMBLYAI_API_KEY=xxx
```

#### Frontend (.env.local file)

Create or update `nueracare-expo-app/.env.local`:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
```

For production:
```env
EXPO_PUBLIC_API_URL=https://your-api-domain.com
```

### 3. Verify Setup

#### Test Backend Endpoint

```bash
cd backend
curl -X GET "http://localhost:8000/api/hospitals/health-check"
```

Expected response:
```json
{
  "status": "healthy",
  "service": "Google Places API",
  "message": "Hospital search service is operational"
}
```

#### Test Search Endpoint

```bash
curl -X GET "http://localhost:8000/api/hospitals/nearby?latitude=17.3850&longitude=78.4867&radius=5000&limit=20"
```

---

## 🔌 Hospitals API Endpoints

### Nearby Search
```
GET /api/hospitals/nearby
?latitude=17.3850&longitude=78.4867&radius=5000&limit=20
```

**Returns:** List of hospitals with ratings, distance, phone, address

### Top Hospitals
```
GET /api/hospitals/top
?latitude=17.3850&longitude=78.4867&limit=5
```

**Returns:** Top-rated hospitals in area

### Emergency Hospitals
```
GET /api/hospitals/emergency
?latitude=17.3850&longitude=78.4867&limit=10
```

**Returns:** Hospitals with 24/7 emergency services

### Search by Name
```
GET /api/hospitals/search
?query=Apollo&latitude=17.3850&longitude=78.4867
```

**Returns:** Hospitals matching the search query

---

## 🐛 Troubleshooting

### "GOOGLE_PLACES_API_KEY not set in environment variables"

**Solution:** 
- Create `backend/.env` file
- Add `GOOGLE_PLACES_API_KEY=your_key_here`
- Restart backend server

### "Quota exceeded" Error

**Solution:**
- Check Google Cloud Console billing settings
- Verify API is enabled
- Check API key restrictions

### Hospitals not loading in app

**Solution:**
1. Check backend is running: `http://localhost:8000/health`
2. Check API key is valid
3. Check location permissions in app
4. Check internet connection
5. View console logs for errors

### No results returned

**Solution:**
- Verify latitude/longitude are correct
- Increase search radius: `&radius=10000`
- Check if there are hospitals in that area
- Verify API key has Places API enabled

---

## 📊 Google Places API Pricing

**Nearby Search:** $0.032 per request
**Place Details:** $0.017 per request
**Text Search:** $0.032 per request

**Free tier:** $200/month credit (usually covers 5000-6000 requests)

### Cost Optimization Tips:
1. ✅ Cache results locally
2. ✅ Limit search radius
3. ✅ Limit results per request
4. ✅ Reuse place_id data
5. ✅ Only call API when necessary

---

## 🚀 Production Deployment

### Update API URL

Before deploying, update `EXPO_PUBLIC_API_URL` in:
- `.env.local` → production API domain
- `app.json` (if needed)

### Add Rate Limiting

Consider adding rate limiting to prevent abuse:
```python
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.get("/api/hospitals/nearby")
@limiter.limit("100/hour")
async def search_nearby_hospitals(...):
    ...
```

### Cache Results

Implement Redis caching for frequently searched locations:
```python
# Cache for 1 hour
cache.set(f"hospitals:{lat}:{lon}", results, expire=3600)
```

---

## ✨ Features Included

✅ Real hospital data from Google Places API
✅ Distance calculation (Haversine formula)
✅ Search by location and city
✅ Top hospitals carousel
✅ Specialty filters
✅ Hospital details modal
✅ Call and directions buttons
✅ Emergency hospitals search
✅ City selector
✅ Loading states
✅ Error handling
✅ Responsive design

---

## 🎯 Next Steps

1. Add API key to `.env`
2. Restart backend
3. Test in app
4. Customize specialty filters
5. Add hospital reviews
6. Integrate appointment booking

---

## 📞 Support

For Google Places API issues:
- Documentation: https://developers.google.com/maps/documentation/places/web-service
- Support: https://console.cloud.google.com/support

For NueraCare issues:
- Check console logs
- Verify `.env` files
- Check network tab in DevTools
- Review API response format
