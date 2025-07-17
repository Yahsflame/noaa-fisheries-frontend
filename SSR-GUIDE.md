# Server-Side Rendering (SSR) Guide

This guide explains how Server-Side Rendering works in the NOAA Fisheries Frontend application and how to verify it's working correctly.

## What is SSR and Why We Use It

### Server-Side Rendering Benefits
- **SEO Optimization**: Search engines see fully rendered content with data
- **Faster Initial Load**: Content appears immediately without loading spinners
- **Better Performance**: Reduced client-server round trips
- **Improved User Experience**: Instant navigation with pre-rendered pages
- **Social Media Sharing**: Rich previews with actual content

### SSR vs SPA Comparison

| Aspect | SSR (Our Implementation) | SPA (Previous Implementation) |
|--------|-------------------------|------------------------------|
| Initial Load | Content pre-rendered with data | Loading spinner, then content |
| SEO | Fully indexed content | Limited indexing of loading states |
| Performance | Faster perceived load time | Slower initial load |
| Server Load | Higher (renders on server) | Lower (client-side only) |
| Complexity | More complex setup | Simpler architecture |

## How SSR Works in Our Application

### 1. Server-Side Data Fetching

We use SolidStart's `cache` functions with the `"use server"` directive:

```javascript
// Server-side cached data fetching
export const getRegionsData = cache(async () => {
  "use server";
  console.log("[SSR] Fetching regions on server...");
  
  const fishData = await getAllFishData();
  const apiService = new ApiService();
  return apiService.calculateRegionStats(fishData);
}, "regionsData");
```

### 2. Component-Level SSR

Components use `createAsync` to consume server-side data:

```javascript
export default function Home() {
  // This data is fetched on the server and pre-rendered
  const regions = createAsync(() => getRegionsData());
  
  return (
    <Show when={regions()} fallback={<div>Loading...</div>}>
      {/* This content is rendered on the server */}
      <For each={regions()}>
        {(region) => <RegionCard region={region} />}
      </For>
    </Show>
  );
}
```

### 3. Cache Strategy

Our SSR implementation uses intelligent caching:

- **Data Layer**: `cache()` functions prevent duplicate API calls
- **Cross-Request Sharing**: Multiple users share cached data
- **Smart Invalidation**: Cache keys ensure data freshness
- **Performance**: Reduces backend load and improves response times

## Verifying SSR is Working

### Automated Verification

Run our SSR verification script:

```bash
# Start the development server first
npm run dev

# In another terminal, run verification
npm run verify-ssr
```

The script will:
- Check if the server is running
- Fetch multiple routes
- Analyze HTML content for SSR indicators
- Provide a detailed report

### Manual Verification Methods

#### 1. View Page Source
Right-click on any page → "View Page Source"

**SSR Working ✅:**
```html
<div class="region-card">
  <h3>Pacific Islands</h3>
  <div class="region-stats">
    <span>145.2 cal</span>
  </div>
</div>
```

**SSR Not Working ❌:**
```html
<div class="loading">Loading regions...</div>
```

#### 2. Network Tab Analysis
Open browser dev tools → Network tab → Reload page

**SSR Working ✅:**
- Initial HTML response contains rendered content
- Minimal additional API calls from client

**SSR Not Working ❌:**
- Initial HTML is mostly empty
- Multiple API calls after page load
- Loading states visible during hydration

#### 3. Disable JavaScript
Disable JavaScript in browser → Reload page

**SSR Working ✅:**
- Page content is still visible
- Only interactive features are missing

**SSR Not Working ❌:**
- Page is blank or shows only loading states

#### 4. Server Logs
Check development console for SSR logs:

```bash
# Look for these log messages
[SSR] Fetching all fish data on server...
[SSR] Successfully fetched 147 fish records
[SSR] Processing regions data on server...
[SSR] Processed 6 regions
```

### 5. Curl Test
Test from command line:

```bash
curl -s http://localhost:3000/ | grep -i "region-card"
```

If SSR is working, this should return HTML content with region cards.

## Troubleshooting SSR Issues

### Common Problems and Solutions

#### 1. Server Not Accessible
**Problem**: API calls fail on server-side
**Solution**: Ensure API_BASE_URL is accessible from server environment

```bash
# Test API accessibility from server
curl http://localhost:5001/gofish?apikey=your_key
```

#### 2. Environment Variables
**Problem**: Missing or incorrect environment variables
**Solution**: Check `.env` file and server environment

```bash
# Verify environment variables
echo $VITE_API_KEY
echo $VITE_API_BASE_URL
```

#### 3. Cache Issues
**Problem**: Stale data being served
**Solution**: Clear cache or restart development server

```bash
# Restart with fresh cache
npm run dev
```

#### 4. Bundle Issues
**Problem**: Server-side code running on client
**Solution**: Verify `"use server"` directives are present

```javascript
// Correct server function
export const getData = cache(async () => {
  "use server"; // This line is crucial
  return await fetchData();
}, "dataKey");
```

### Development vs Production

#### Development Environment
- SSR works with `npm run dev`
- Hot module replacement preserved
- Server logs visible in console

#### Production Environment
- Build with `npm run build`
- Start with `npm start`
- Server runs independently
- Logs may be different in production

## Best Practices for SSR

### 1. Server Function Guidelines
```javascript
// ✅ Good: Proper server function
export const getData = cache(async () => {
  "use server";
  // Server-only code here
  return await api.fetchData();
}, "uniqueKey");

// ❌ Bad: Missing "use server"
export const getData = cache(async () => {
  return await api.fetchData(); // Runs on client too
}, "uniqueKey");
```

### 2. Error Handling
```javascript
export const getData = cache(async () => {
  "use server";
  try {
    return await api.fetchData();
  } catch (error) {
    console.error("[SSR] Error:", error);
    return null; // Graceful fallback
  }
}, "dataKey");
```

### 3. Component Patterns
```javascript
// ✅ Good: Proper loading states
export default function Page() {
  const data = createAsync(() => getData());
  
  return (
    <Show when={data()} fallback={<SkeletonLoader />}>
      <Content data={data()} />
    </Show>
  );
}

// ❌ Bad: No fallback for loading state
export default function Page() {
  const data = createAsync(() => getData());
  return <Content data={data()} />; // Breaks during SSR
}
```

### 4. Client-Side Hydration
```javascript
// ✅ Good: Hydration-friendly code
export default function Interactive() {
  const [isClient, setIsClient] = createSignal(false);
  
  onMount(() => setIsClient(true));
  
  return (
    <div>
      <ServerContent />
      <Show when={isClient()}>
        <ClientOnlyFeature />
      </Show>
    </div>
  );
}
```

## Performance Monitoring

### Metrics to Track
- **Time to First Byte (TTFB)**: Server response time
- **First Contentful Paint (FCP)**: When content appears
- **Largest Contentful Paint (LCP)**: When main content loads
- **Cumulative Layout Shift (CLS)**: Layout stability

### SSR Performance Tips
1. **Cache Aggressively**: Use cache functions for all data fetching
2. **Minimize Server Work**: Keep server functions focused
3. **Optimize Database Queries**: Reduce API response times
4. **Use CDN**: Serve static assets from CDN
5. **Monitor Server Resources**: Watch CPU and memory usage

## Deployment Considerations

### Environment Setup
- Ensure API is accessible from production server
- Set proper environment variables
- Configure server timeouts appropriately

### Monitoring
- Set up logging for SSR functions
- Monitor server performance
- Track error rates for server-side rendering

### Scaling
- SSR adds server load
- Consider caching strategies
- Monitor memory usage for long-running processes

## Additional Resources

- [SolidStart SSR Documentation](https://start.solidjs.com/core-concepts/server-functions)
- [Server Functions Guide](https://start.solidjs.com/api/server)
- [Cache API Reference](https://start.solidjs.com/api/cache)