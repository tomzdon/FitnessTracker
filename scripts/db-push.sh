#!/bin/bash

# Get the Supabase database URL from environment secret
SUPABASE_DB_URL=$(printenv SUPABASE_DATABASE_URL)

# Remove any quotes from the URL
CLEAN_URL=$(echo $SUPABASE_DB_URL | sed 's/^["'"'"']//;s/["'"'"']$//')

echo "Using database URL: ${CLEAN_URL/postgres*:*@/postgres***:***@}"

# Set it as DATABASE_URL for the migration
DATABASE_URL="$CLEAN_URL" npx drizzle-kit push

# Print result
echo "Migration completed with Supabase database"