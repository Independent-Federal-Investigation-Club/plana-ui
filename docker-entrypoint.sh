#!/bin/sh
# Docker entrypoint script
# Generates runtime environment configuration for Next.js client-side code

set -e

# Directory where the config file will be created
CONFIG_DIR="/usr/src/app/public"
CONFIG_FILE="$CONFIG_DIR/__ENV_CONFIG__.js"

# Support both simple names and NEXT_PUBLIC_ prefixed names (for backward compatibility)
# Simple names take priority
PLANA_API_URL="${PLANA_API_URL:-${NEXT_PUBLIC_PLANA_API_URL:-}}"
PLANA_SITE_URL="${PLANA_SITE_URL:-${NEXT_PUBLIC_PLANA_SITE_URL:-}}"
DISCORD_BOT_ID="${DISCORD_BOT_ID:-${NEXT_PUBLIC_DISCORD_BOT_ID:-}}"

# Generate the runtime config file
# This allows environment variables to be injected at container startup
# instead of being baked in at build time
cat > "$CONFIG_FILE" << EOF
// Runtime environment configuration
// Generated at container startup - DO NOT EDIT MANUALLY
window.__ENV__ = {
  PLANA_API_URL: "${PLANA_API_URL}",
  PLANA_SITE_URL: "${PLANA_SITE_URL}",
  DISCORD_BOT_ID: "${DISCORD_BOT_ID}"
};
EOF

echo "Generated runtime config at $CONFIG_FILE"
echo "  PLANA_API_URL: ${PLANA_API_URL:-<not set>}"
echo "  PLANA_SITE_URL: ${PLANA_SITE_URL:-<not set>}"
echo "  DISCORD_BOT_ID: ${DISCORD_BOT_ID:-<not set>}"

# Execute the main command (Next.js server)
exec "$@"
