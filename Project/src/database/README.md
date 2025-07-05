# Type 3 Solar Platform Database Migrations

## Product SKUs Management

The Product SKU management system requires a new database table to be created in Supabase. 

### Table Setup Instructions

1. Navigate to your Supabase dashboard
2. Go to the SQL Editor section
3. Create a new query
4. Copy and paste the contents from `create_product_skus_table.sql` into the SQL editor
5. Run the query to create the product_skus table and insert sample data

### Table Structure

The `product_skus` table includes the following fields:

- `id`: UUID (Primary Key)
- `name`: Text - Product name
- `sku`: Text - Unique SKU code
- `category`: Text - Product category (panels, inverters, batteries, etc.)
- `price`: Decimal - Price in INR
- `capacity_kw`: Decimal - Capacity in kilowatts (for applicable products)
- `description`: Text - Product description
- `specifications`: JSONB - Technical specifications as JSON
- `inventory_count`: Integer - Current inventory count
- `created_at`: Timestamp - Creation date
- `updated_at`: Timestamp - Last update date

### Sample Data

The SQL script includes sample products for these categories:
- Solar Panels
- Inverters
- Batteries 
- Mounting Hardware
- Complete System Packages

These can be modified or expanded as needed.
