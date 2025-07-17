// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content="NOAA Fisheries regional data with nutritional information and sustainable seafood guidance" />
          <link rel="icon" href="/favicon.ico" />

          {/* DNS prefetching for faster image loading */}
          <link rel="dns-prefetch" href="//www.fishwatch.gov" />
          <link rel="dns-prefetch" href="//media.fisheries.noaa.gov" />
          <link rel="preconnect" href="//www.fishwatch.gov" crossorigin />
          <link rel="preconnect" href="//media.fisheries.noaa.gov" crossorigin />

          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
