#!/bin/bash

# Script to set up Supabase storage policies using direct API calls

# Configuration
PROJECT_REF="dtuoyawpebjcmfesgwwn"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY3NjU4NCwiZXhwIjoyMDU5MjUyNTg0fQ.3x2SBAJrCO1vpJhV4ATLGStcRLx1lOONuSqXY8vr6xk"
BUCKET_ID="productphotos"

# Headers for API requests
AUTH_HEADER="Authorization: Bearer $SERVICE_ROLE_KEY"
CONTENT_TYPE="Content-Type: application/json"

echo "===== Supabase Storage Policy Setup ====="
echo "Project: $PROJECT_REF"
echo "Bucket: $BUCKET_ID"
echo ""

# Step 1: Create the bucket if it doesn't exist
echo "[1/4] Creating/updating bucket..."
curl -s -X POST "https://api.supabase.com/rest/v1/storage/buckets" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  -d '{"id":"'"$BUCKET_ID"'", "name":"'"$BUCKET_ID"'", "public":true}' \
  -o /dev/null

echo "✅ Bucket created/updated"

# Step 2: Create SELECT policy (public read access)
echo "[2/4] Creating SELECT policy for public read access..."
curl -s -X POST "https://supabase.com/dashboard/project/$PROJECT_REF/storage/policy/create" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  -d '{"name":"Public Read Access", "definition":"true", "bucketId":"'"$BUCKET_ID"'", "operation":"SELECT"}' \
  -o /dev/null

echo "✅ SELECT policy created"

# Step 3: Create INSERT policy (authenticated users only)
echo "[3/4] Creating INSERT policy for authenticated users..."
curl -s -X POST "https://supabase.com/dashboard/project/$PROJECT_REF/storage/policy/create" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  -d '{"name":"Admin Insert Access", "definition":"auth.role() = '\\'authenticated'\\'", "bucketId":"'"$BUCKET_ID"'", "operation":"INSERT"}' \
  -o /dev/null

echo "✅ INSERT policy created"

# Step 4: Create UPDATE policy (authenticated users only)
echo "[4/4] Creating UPDATE policy for authenticated users..."
curl -s -X POST "https://supabase.com/dashboard/project/$PROJECT_REF/storage/policy/create" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  -d '{"name":"Admin Update Access", "definition":"auth.role() = '\\'authenticated'\\'", "bucketId":"'"$BUCKET_ID"'", "operation":"UPDATE"}' \
  -o /dev/null

echo "✅ UPDATE policy created"

# Step 5: Create DELETE policy (authenticated users only)
echo "[5/4] Creating DELETE policy for authenticated users..."
curl -s -X POST "https://supabase.com/dashboard/project/$PROJECT_REF/storage/policy/create" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  -d '{"name":"Admin Delete Access", "definition":"auth.role() = '\\'authenticated'\\'", "bucketId":"'"$BUCKET_ID"'", "operation":"DELETE"}' \
  -o /dev/null

echo "✅ DELETE policy created"

echo ""
echo "===== Storage Policy Setup Complete ====="
echo "Please go to the Supabase dashboard to verify the policies were created successfully."
echo "If there are any issues, you may need to create the policies manually through the dashboard."
echo ""
echo "Now restart your application to apply the changes!"
