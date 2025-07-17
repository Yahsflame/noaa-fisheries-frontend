# NOAA Fisheries Frontend (SolidStart)

A SolidStart application for visualizing NOAA fisheries regional data, including fish nutritional information across different regions.

## Features

- **Server-Side Rendering**: Built with SolidStart for optimal performance
- **File-based Routing**: Automatic routing based on file structure
- **Home Page**: Overview of all NOAA fisheries regions with average calories and fat per serving
- **Region Pages**: Detailed view of each region with fish species and nutritional data
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional design with hover effects and transitions
- **Reactive**: Built with Solid.js for fine-grained reactivity

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx         # Navigation bar with region links
│   └── FishCard.jsx       # Individual fish display component
├── routes/
│   ├── index.jsx          # Home page showing all regions
│   ├── about.jsx          # About page
│   ├── region/
│   │   └── [regionId].jsx # Dynamic region detail pages
│   └── [...404].jsx       # 404 error page
├── services/
│   └── api.js             # API service for server communication
├── app.jsx                # Main app component with layout
└── app.css                # Global styles
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your API key
# VITE_API_KEY=abrradiology
```

3. Make sure your backend server is running on port 5001

4. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Start production server:
```bash
npm start
```

## API Integration

The frontend fetches data from your backend server on `http://localhost:5001` and expects:

### Backend Endpoint:
- `GET /gofish?apikey={API_KEY}` - Returns array of fish objects with the structure you provided

### Data Processing:
The frontend automatically:
- Groups fish by `NOAAFisheriesRegion` field
- Calculates average calories and fat per region
- Creates dynamic routes for each region

### Expected Fish Object Structure:
```json
{
  "SpeciesName": "Crimson Jobfish",
  "ScientificName": "Pristipomoides filamentosus",
  "NOAAFisheriesRegion": "Pacific Islands",
  "Calories": "100",
  "FatTotal": "1.34 g",
  "Protein": "20.5",
  "ImageGallery": [
    {
      "src": "image-url",
      "alt": "image description",
      "title": "image title"
    }
  ],
  "SpeciesIllustrationPhoto": {
    "src": "image-url",
    "alt": "image description"
  },
  "Biology": "HTML string with biology info",
  "Taste": "HTML string with taste info",
  "Texture": "HTML string with texture info",
  "HealthBenefits": "HTML string with health benefits"
}
```

## Routing Structure

SolidStart uses file-based routing:

- `/` - Home page (src/routes/index.jsx)
- `/about` - About page (src/routes/about.jsx)
- `/region/[regionId]` - Dynamic region pages (src/routes/region/[regionId].jsx)

Examples:
- `/region/pacific-islands` - Pacific Islands region page
- `/region/alaska` - Alaska region page
- `/region/new-england` - New England region page

Region names are automatically converted to URL-friendly format (lowercase, hyphens for spaces).

## SolidStart Features

### File-based Routing
- Automatic routing based on file structure in `src/routes/`
- Dynamic routes using `[param]` syntax
- Catch-all routes using `[...404]` syntax

### Server-Side Rendering
- Pages are pre-rendered on the server for better SEO and performance
- Automatic hydration on the client side

### Solid.js Reactivity
- `createSignal()` for reactive state
- `createEffect()` for side effects
- `Show` component for conditional rendering
- `For` component for efficient list rendering

### Performance Benefits
- No virtual DOM overhead
- Fine-grained reactivity
- Smaller bundle sizes
- Better SEO with SSR

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run version  # Show version information
```

## Styling

The application uses scoped CSS with the `style jsx` approach:
- Styles are co-located with components
- Automatic scoping prevents style conflicts
- Responsive design with mobile-first approach

## Customization

### Environment Variables
Configure the application by editing the `.env` file:

```bash
# API Key for accessing the fish data endpoint
VITE_API_KEY=your_api_key_here

# Optional: Backend API URL (defaults to http://localhost:5001)
VITE_API_BASE_URL=http://localhost:5001
```

**Important**: Never commit the `.env` file to version control. Use `.env.example` as a template.

### Adding New Routes
Create new `.jsx` files in the `src/routes/` directory. SolidStart will automatically create routes based on the file structure.

### Styling
Modify the inline styles in each component or update the global styles in `src/app.css`.

## Key Differences from Standard React

1. **File Extensions**: Uses `.jsx` for better Solid.js support
2. **Hooks**: Uses `createSignal` instead of `useState`
3. **Effects**: Uses `createEffect` instead of `useEffect`
4. **JSX**: Uses `class` instead of `className`
5. **Routing**: File-based routing instead of component-based
6. **Performance**: Better runtime performance with fine-grained reactivity

## Troubleshooting

### Common Issues

1. **API Connection**: Ensure your backend server is running on port 5001 and serving data at `/gofish` endpoint with the correct API key
2. **Environment Variables**: Make sure you've created a `.env` file with the correct `VITE_API_KEY`
3. **CORS**: If you encounter CORS issues, configure your backend to allow requests from the frontend
4. **Build Issues**: Make sure Node.js version is 22 or higher as specified in package.json

### Development Tips

1. Use browser dev tools to inspect network requests
2. Check console for any JavaScript errors
3. Verify that the API returns data in the expected format
4. Test responsive design on different screen sizes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Copy `.env.example` to `.env` and configure your API key
4. Make your changes
5. Test thoroughly
6. Submit a pull request (do not include your `.env` file)

## License

This project is for educational and demonstration purposes.