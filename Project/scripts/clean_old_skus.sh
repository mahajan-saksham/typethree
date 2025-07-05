#!/bin/bash

# Script to remove old product SKU data using Supabase CLI
cd "$(dirname "$0")"/.. 

# Check if we have data in the new products table
echo "Checking for products in the new table..."
NPRODUCTS=$(psql "${DATABASE_URL}" -c "SELECT COUNT(*) FROM products;" -t | tr -d '[:space:]')

echo "Found ${NPRODUCTS} products in the new table."

# If we have products, ask for confirmation before deleting old data
if [ "${NPRODUCTS}" -gt 0 ]; then
  echo "WARNING: This will DELETE all data from the product_skus table."
  echo "Are you sure you want to continue? (y/n)"
  read -r CONFIRM
  
  if [ "${CONFIRM}" = "y" ]; then
    echo "Deleting old SKU data..."
    psql "${DATABASE_URL}" -c "DELETE FROM product_skus;"
    echo "Old SKU data deleted successfully."
  else
    echo "Operation cancelled."
  fi
else
  echo "No products found in the new table. Migration may not have been completed."
  echo "Aborting operation."
fi
