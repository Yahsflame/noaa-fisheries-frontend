# NOAA Fisheries Frontend

A high-performance SolidStart application with full Server-Side Rendering (SSR) for visualizing NOAA fisheries regional data with advanced image prefetching and dark mode support.

## Project Approach

This application takes a **performance-first approach** with true server-side rendering, intelligent image prefetching, lazy loading, and optimized user experience patterns. Built with SolidStart for full SSR capabilities and Solid.js for fine-grained reactivity.

### Key Principles
- **True SSR**: Data fetched on server, pages pre-rendered with content for SEO and performance
- **Progressive Enhancement**: Critical content loads first, enhancements load progressively
- **Smart Prefetching**: Predictive image loading based on user behavior patterns
- **Accessibility**: Full keyboard navigation, screen reader support, and WCAG compliance
- **Performance**: Sub-second load times with server-side caching and aggressive optimization
- **Responsive**: Mobile-first design that works across all devices

## Directory Structure

```
noaa-fisheries-frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── FishCard/        # Individual fish display cards
│   │   │   ├── FishCard.jsx
│   │   │   └── FishCard.css
│   │   ├── FishModal/       # Modal for detailed fish view
│   │   │   ├── FishModal.jsx
│   │   │   └── FishModal.css
│   │   ├── FishImage/       # Optimized image component
│   │   │   ├── FishImage.jsx
│   │   │   └── FishImage.css
│   │   ├── ImageSlider/     # Gallery slider component
│   │   │   ├── ImageSlider.jsx
│   │   │   └── ImageSlider.css
│   │   ├── Navbar/          # Navigation component
│   │   │   ├── Navbar.jsx
│   │   │   └── Navbar.css
│   │   ├── ThemeToggle/     # Dark/light mode toggle
│   │   │   ├── ThemeToggle.jsx
│   │   │   └── ThemeToggle.css
│   │   ├── FishName/        # Fish name display
│   │   ├── FishDescription/ # Fish description
│   │   ├── FishCardSkeleton/ # Loading skeleton
│   │   └── ErrorBoundary/   # Error handling
│   ├── contexts/            # Global state management
│   │   ├── ThemeContext.jsx # Dark/light mode state
│   ├── hooks/               # Custom hooks
│   │   ├── useCardVisibility.js # Enhanced visibility for prefetching
│   │   ├── useLazyLoad.js # Assists with Lazy loading of images
│   │   └── index.js         # Hook exports
│   ├── routes/              # File-based routing
│   │   ├── index.jsx        # Home page with regions
│   │   ├── about.jsx        # About page
│   │   ├── region/          # Region detail pages
│   │   │   └── [regionId].jsx
│   │   └── [...404].jsx     # 404 error page
│   ├── services/            # External service integrations
│   │   └── api.js           # NOAA API service
│   ├── utils/               # Utility functions
│   │   ├── textUtils.js     # Text processing utilities
│   │   └── imagePrefetch.js # Advanced image prefetching
│   ├── constants/           # Application constants
│   │   └── index.js         # Breakpoints, pagination settings
│   ├── app.jsx              # Main application component
│   └── app.css              # Global styles and CSS variables
└── public/                  # Static assets
    └── [static files]
```

## Global Context & State Management

### Theme Context (`src/contexts/ThemeContext.jsx`)
Manages dark/light mode throughout the application:
- **State**: `theme` signal with 'light' or 'dark' values
- **Persistence**: Automatically saves preference to localStorage
- **System Integration**: Respects user's OS preference on first visit
- **CSS Variables**: Updates CSS custom properties for seamless theming

### Global CSS Variables (`src/app.css`)
Comprehensive design system with light/dark mode support:

```css
:root {
  /* Colors */
  --color-primary: #1976d2;
  --color-text: #333;
  --color-background: #ffffff;
  --color-surface: #f8f9fa;
  --color-border: #e0e0e0;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;

  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s ease;
}

[data-theme="dark"] {
  --color-text: #e0e0e0;
  --color-background: #121212;
  --color-surface: #1e1e1e;
  --color-border: #333;
}
```

## Advanced Image Prefetching Strategy

My intelligent prefetching system optimizes perceived performance through predictive loading:

### Phase 1: Home Page Prefetching
When users visit the home page:
```javascript
// Prefetch first 3 fish images from ALL regions
// Staggered loading: 200ms between regions
// Priority: High for first 3 regions, low for remaining
```

### Phase 2: Region Page Load Strategy
When a region page loads:
```javascript
// Cards 1-3: Prefetch ALL ImageGallery images immediately
//   - Card 1: High priority
//   - Cards 2-3: Low priority
//   - Full galleries loaded for instant modal opening

// Cards 4-6: Prefetch ONLY first image (500ms delay)
//   - Balances performance with bandwidth
//   - Ready for initial card display

// Cards 7+: No prefetching until scroll
//   - Saves bandwidth for off-screen content
```

### Phase 3: Scroll-Based Prefetching
As users scroll and cards come into view:
```javascript
// useCardVisibility hook (100px threshold)
// When cards 4-6 become visible:
//   - Prefetch remaining gallery images
//   - Enable smooth slider navigation

// When cards 7+ become visible:
//   - Prefetch remaining gallery images
//   - Progressive enhancement pattern
```

### Technical Implementation
```javascript
// Utility Functions (src/utils/imagePrefetch.js)
prefetchFirstImages(fishArray, count, priority)    // Basic prefetching
prefetchFullGallery(fish, priority)                // Complete gallery
prefetchRegionImages(fishArray)                    // Region page strategy
prefetchRemainingGallery(fish)                     // Scroll-triggered loading

// Smart Caching
- Duplicate URL prevention
- Memory cleanup after 10 seconds
- Link element management
- Priority-based loading queues
```

### Performance Benefits
- **Modal Opening**: Instant display (images pre-cached from cards)
- **Slider Navigation**: Smooth transitions (gallery pre-loaded)
- **Perceived Speed**: First 3 cards load instantly
- **Bandwidth Efficient**: Only loads what users are likely to see
- **Server Friendly**: Staggered requests prevent overwhelming backend

## Server-Side Rendering (SSR) Implementation

### How SSR Works in This Project
My application uses SolidStart's `cache` and `createAsync` for true server-side rendering:

```javascript
// Server-side cached data fetching
export const getRegionsData = cache(async () => {
  "use server";
  const fishData = await getAllFishData();
  return apiService.calculateRegionStats(fishData);
}, "regionsData");

// Component using SSR data
export default function Home() {
  const regions = createAsync(() => getRegionsData());
  return <Show when={regions()}>{/* Content rendered on server */}</Show>;
}
```

### SSR Benefits
- **SEO Optimized**: Search engines see fully rendered content
- **Faster Initial Load**: Content appears immediately, no loading spinners
- **Better Performance**: Reduced client-server round trips
- **Improved UX**: Instant navigation with pre-rendered pages

### Server-Side Caching Strategy
- **Data Layer**: `cache()` functions prevent duplicate API calls
- **Region Data**: Cached across all requests for the same region
- **Fish Data**: Shared cache for base fish dataset
- **Smart Invalidation**: Cache keys ensure data freshness

## API Integration

### Backend Requirements
- **Endpoint**: `GET /gofish?apikey={API_KEY}`
- **Port**: 5001 (configurable via `VITE_API_BASE_URL`)
- **Server Access**: Must be accessible from both server and client
- **Response**: Array of fish objects with complete data structure

### Expected Fish Data Structure
```javascript
{
  "SpeciesName": "Crimson Jobfish",
  "ScientificName": "Pristipomoides filamentosus",
  "NOAAFisheriesRegion": "Pacific Islands",
  "Calories": "100",
  "FatTotal": "1.34 g",
  "Protein": "20.5",
  "Cholesterol": "55",
  "Sodium": "60",
  "ImageGallery": [
    {
      "src": "https://example.com/image1.jpg",
      "alt": "Fish swimming in ocean",
      "title": "Crimson Jobfish in natural habitat"
    }
  ],
  "SpeciesIllustrationPhoto": {
    "src": "https://example.com/illustration.jpg",
    "alt": "Scientific illustration of Crimson Jobfish"
  },
  "Biology": "<p>HTML content about biology</p>",
  "Taste": "<p>HTML content about taste profile</p>",
  "Texture": "<p>HTML content about texture</p>",
  "Harvest": "<p>HTML content about harvest methods</p>",
  "HealthBenefits": "<p>HTML content about health benefits</p>",
  "Quote": "<p>Sustainability quote</p>",
  "Bycatch": "<p>Bycatch information</p>"
}
```

## Performance Optimizations

### Server-Side Rendering
- **Pre-rendered Content**: Pages load with data, no client-side fetching delays
- **Cached API Calls**: Server-side caching prevents redundant backend requests
- **Hydration Optimization**: Minimal client-side JavaScript for interactivity
- **SEO Benefits**: Fully indexed content with proper meta tags

### Image Loading
- **DNS Prefetching**: Pre-resolve image domain DNS (server-rendered in head)
- **Preconnect**: Establish early HTTPS connections
- **fetchpriority**: Browser-native priority hints
- **loading="eager/lazy"**: Strategic loading attributes
- **decoding="async"**: Non-blocking image decoding

### Lazy Loading
- **Intersection Observer**: 200px threshold for images, 100px for cards
- **Progressive Loading**: Critical content first, enhancements follow
- **Skeleton States**: Prevent layout shifts during loading

### CSS Performance
- **Hardware Acceleration**: `transform: translateZ(0)` for smooth animations
- **will-change**: Strategic performance hints for animations
- **Reduced Motion**: Respects user accessibility preferences

## Installation & Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with API key:
# VITE_API_KEY=api_key_here
# VITE_API_BASE_URL=http://localhost:5001
```

3. **Development**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run verify-ssr   # Verify SSR is working correctly
```

## SSR Verification

### Quick SSR Check
```bash
# 1. Start development server
npm run dev

# 2. In another terminal, verify SSR
npm run verify-ssr
```

### Manual Verification
1. **View Page Source**: Right-click → "View Page Source" - should show rendered content, not loading states
2. **Disable JavaScript**: Page should still show content (only interactions disabled)
3. **Network Tab**: Initial HTML response should contain rendered data
4. **Server Logs**: Look for `[SSR]` prefixed messages in development console

### SSR vs SPA Indicators
- **SSR Working ✅**: Content visible in page source, minimal client-side API calls
- **SPA Mode ❌**: Loading states in page source, multiple API calls after page load

## Key Features

### Production Build
```bash
npm run build
# Generates optimized SSR application in .output/ directory
# Includes server-side rendering capabilities for production
```

### Environment Variables (Production)
```bash
VITE_API_KEY=production_api_key
VITE_API_BASE_URL=https://api.example.com
# Note: API must be accessible from both server and client environments
```

### Performance Monitoring
- Server-side rendering logs for SSR analysis
- Built-in performance markers for prefetching analysis
- Debug mode available in development
- Cache statistics available via `getPrefetchStats()`
- SSR data fetching logs with `[SSR]` prefix in development
