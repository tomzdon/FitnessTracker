#!/bin/bash

# Get the Supabase database URL from environment secret
SUPABASE_DB_URL=$(printenv SUPABASE_DATABASE_URL)

# Set it as DATABASE_URL for the migration
DATABASE_URL="$SUPABASE_DB_URL" npx drizzle-kit push

# Print result
echo "Migration completed with Supabase database"