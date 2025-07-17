#!/usr/bin/env node

/**
 * SSR Verification Script
 *
 * This script verifies that Server-Side Rendering is working correctly
 * by making HTTP requests to the running development server and checking
 * if the HTML contains rendered content (not just loading states).
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const SERVER_URL = 'http://localhost:3000';
const TIMEOUT = 10000; // 10 seconds

// ANSI color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${colors.bold}${colors.blue}=== ${message} ===${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Check if server is running
async function checkServerStatus() {
  try {
    const response = await fetch(`${SERVER_URL}/`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(TIMEOUT)
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Fetch and analyze HTML content
async function fetchAndAnalyzeHTML(url, description) {
  try {
    logInfo(`Fetching ${url}...`);
    const response = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT),
      headers: {
        'User-Agent': 'SSR-Verification-Script'
      }
    });

    if (!response.ok) {
      logError(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      return false;
    }

    const html = await response.text();

    // Check if HTML contains rendered content
    const hasContent = analyzeHTML(html, description);

    if (hasContent) {
      logSuccess(`${description} - SSR working correctly`);
      return true;
    } else {
      logError(`${description} - SSR not working (only loading states found)`);
      return false;
    }
  } catch (error) {
    logError(`Error fetching ${url}: ${error.message}`);
    return false;
  }
}

// Analyze HTML content for SSR indicators
function analyzeHTML(html, description) {
  const checks = {
    hasTitle: html.includes('<title>') && !html.includes('<title>NOAA Fisheries Regions</title>'),
    hasMetaDescription: html.includes('meta name="description"'),
    hasContent: !html.includes('Loading regions...') && !html.includes('Loading fish...'),
    hasRegionData: html.includes('region-card') || html.includes('fish-card'),
    hasStyles: html.includes('<style>') || html.includes('.css'),
    hasHydrationScript: html.includes('script'),
    notEmptyBody: html.includes('<body>') && html.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1]?.trim().length > 100
  };

  logInfo(`Analysis for ${description}:`);
  Object.entries(checks).forEach(([check, passed]) => {
    if (passed) {
      logSuccess(`  ${check}: ✓`);
    } else {
      logWarning(`  ${check}: ✗`);
    }
  });

  // At least 4 out of 7 checks should pass for good SSR
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;

  logInfo(`  Score: ${passedChecks}/${totalChecks} checks passed`);

  return passedChecks >= 4;
}

// Test specific routes
async function testRoutes() {
  const routes = [
    { url: '/', description: 'Home Page (Regions List)' },
    { url: '/region/pacific-islands', description: 'Pacific Islands Region' },
    { url: '/region/alaska', description: 'Alaska Region' },
    { url: '/about', description: 'About Page' }
  ];

  let passedTests = 0;
  const totalTests = routes.length;

  for (const route of routes) {
    logHeader(`Testing ${route.description}`);
    const passed = await fetchAndAnalyzeHTML(`${SERVER_URL}${route.url}`, route.description);
    if (passed) passedTests++;

    // Add delay between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return { passedTests, totalTests };
}

// Check environment configuration
function checkEnvironment() {
  logHeader('Environment Check');

  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const hasSSRDeps = packageJson.dependencies['@solidjs/start'] && packageJson.dependencies['solid-js'];

    if (hasSSRDeps) {
      logSuccess('SolidStart dependencies found');
    } else {
      logError('Missing SolidStart dependencies');
    }

    // Check if .env file exists
    try {
      const envFile = readFileSync('.env', 'utf8');
      if (envFile.includes('VITE_API_KEY')) {
        logSuccess('API key configured in .env');
      } else {
        logWarning('API key not found in .env file');
      }
    } catch {
      logWarning('.env file not found');
    }

    // Check app.config.js
    try {
      const appConfig = readFileSync('app.config.js', 'utf8');
      if (appConfig.includes('ssr: true')) {
        logSuccess('SSR enabled in app.config.js');
      } else {
        logWarning('SSR not explicitly enabled in app.config.js');
      }
    } catch {
      logWarning('app.config.js not found');
    }

    return hasSSRDeps;
  } catch (error) {
    logError(`Environment check failed: ${error.message}`);
    return false;
  }
}

// Main verification function
async function main() {
  logHeader('NOAA Fisheries SSR Verification');

  // Check environment
  const envOk = checkEnvironment();
  if (!envOk) {
    logError('Environment check failed. Please ensure you have the correct dependencies.');
    process.exit(1);
  }

  // Check if server is running
  logHeader('Server Status Check');
  const serverRunning = await checkServerStatus();

  if (!serverRunning) {
    logError(`Server is not running at ${SERVER_URL}`);
    logInfo('Please start the development server with: npm run dev');
    process.exit(1);
  }

  logSuccess('Server is running');

  // Test routes
  const { passedTests, totalTests } = await testRoutes();

  // Summary
  logHeader('Verification Summary');

  if (passedTests === totalTests) {
    logSuccess(`All ${totalTests} tests passed! SSR is working correctly.`);
    logInfo('Your application is properly server-side rendered.');
  } else if (passedTests > 0) {
    logWarning(`${passedTests}/${totalTests} tests passed. SSR is partially working.`);
    logInfo('Some routes may not be fully server-side rendered.');
  } else {
    logError(`0/${totalTests} tests passed. SSR is not working.`);
    logInfo('Your application appears to be running as a SPA.');
  }

  // Additional tips
  logHeader('Troubleshooting Tips');
  logInfo('1. Ensure your API server is running on port 5001');
  logInfo('2. Check that VITE_API_KEY is set in your .env file');
  logInfo('3. Verify server-side cache functions are working');
  logInfo('4. Check browser dev tools network tab for SSR vs client-side requests');
  logInfo('5. View page source to see if content is pre-rendered');

  process.exit(passedTests === totalTests ? 0 : 1);
}

// Handle process termination
process.on('SIGINT', () => {
  logWarning('\nVerification interrupted');
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logError(`Unhandled rejection: ${error.message}`);
  process.exit(1);
});

// Run the verification
main().catch(error => {
  logError(`Verification failed: ${error.message}`);
  process.exit(1);
});
