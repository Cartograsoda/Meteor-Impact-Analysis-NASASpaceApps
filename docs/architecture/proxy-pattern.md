# Proxy Pattern for API Management

## What Is the Proxy Pattern?

The Proxy Pattern is a structural design pattern where an intermediary object (the proxy) controls access to another object (the real subject). In our case:

```
Frontend → Backend Proxy → NASA API
```

## Why We Need It

### 1. CORS (Cross-Origin Resource Sharing)
Browsers enforce the Same-Origin Policy: JavaScript on `localhost:5500` cannot directly request `api.nasa.gov`. NASA's API doesn't include our origin in its `Access-Control-Allow-Origin` header.

**Without proxy:**
```
Browser: "I want data from api.nasa.gov"
Browser Security: "Blocked. CORS policy violation."
```

**With proxy:**
```
Browser: "I want data from localhost:8080/api/neo/feed"
Our Backend: "Let me fetch that from NASA..."
Our Backend: "Here's the data with proper CORS headers."
```

### 2. API Key Protection
NASA API requires an API key. Embedding it in frontend JavaScript exposes it to anyone viewing page source.

```
// BAD: Key visible in browser DevTools
fetch(`https://api.nasa.gov/neo/rest/v1/feed?api_key=EXPOSED_KEY`)

// GOOD: Key stays on server
fetch(`http://localhost:8080/api/neo/feed`)
```

### 3. Response Caching
NASA's NeoWS data for a specific date doesn't change. We cache responses to:
- Avoid hitting rate limits (40 requests/hour for demo keys)
- Reduce latency for repeated queries
- Decrease NASA server load

```
private final Map<String, CachedResponse> cache = new ConcurrentHashMap<>();

public NeoData fetchNeoData(LocalDate date) {
    String cacheKey = date.toString();
    if (cache.containsKey(cacheKey) && !isExpired(cache.get(cacheKey))) {
        return cache.get(cacheKey).data;
    }
    // Fetch from NASA, then cache
}
```

### 4. Data Normalization
NASA returns distances in multiple units (astronomical units, lunar distances, kilometers, miles). Our proxy normalizes everything to kilometers, simplifying frontend code.

## Implementation in Our Backend

```
@Service
public class NasaProxyService {
    // Encapsulates:
    // - HTTP client for NASA API
    // - Response parsing and normalization
    // - In-memory cache with TTL
    // - Error handling and retry logic
}
```

The frontend remains blissfully ignorant of NASA API quirks, rate limits, or authentication.

