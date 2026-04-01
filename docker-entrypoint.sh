#!/bin/ash
# Docker entrypoint script for dynamic VITE_API_URL configuration
# This script replaces the VITE_API_URL in compiled JavaScript files at runtime
# allowing the image to be used with different backend URLs without rebuilding

set -e

# Default API URL if not provided
VITE_API_URL=${VITE_API_URL:-"http://localhost:3000"}

echo "[ENTRYPOINT] Configuring frontend with VITE_API_URL: $VITE_API_URL"

# Find and replace VITE_API_URL in all compiled JS/HTML files
# This searches for the compiled variable and replaces it with the provided URL
find /usr/share/nginx/html -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec \
  sed -i "s|http://localhost:3000|$VITE_API_URL|g" {} + 2>/dev/null || true

# Also handle other common base URLs that might be already set
find /usr/share/nginx/html -type f \( -name "*.js" -o -name "*.html" \) -exec \
  sed -i "s|http://backend:3000|$VITE_API_URL|g" {} + 2>/dev/null || true

echo "[ENTRYPOINT] Frontend configured successfully"
echo "[ENTRYPOINT] Starting nginx..."

# Execute the main command
exec "$@"
