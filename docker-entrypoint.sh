#!/bin/sh
set -e

# Create a runtime config file that the React app reads
cat > /usr/share/nginx/html/config.js << EOF
window.__RUNTIME_CONFIG__ = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL:-/api/v1}",
};
EOF

echo "Runtime config injected:"
cat /usr/share/nginx/html/config.js

exec "$@"
