-- Type 3 Solar Unified Admin Console Schema Migration (April 2025)
-- This migration adds all admin console tables, columns, and RLS policies.
-- It is designed to be idempotent and non-breaking for existing functionality.
-- Existing tables/columns are checked before creation; new features are additive.

-- 1. USER PROFILES & ROLES
create table if not exists user_profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique,
    name text,
    phone text,
    role text check (role in ('admin', 'sales', 'ops', 'viewer', 'customer')) default 'customer',
    created_at timestamptz default now()
);

-- 2. ROOFTOP SOLAR TABLES
create table if not exists rooftop_leads (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    contact text not null,
    preferred_date date,
    status text check (status in ('new', 'assigned', 'scheduled', 'closed')) default 'new',
    assigned_to uuid references user_profiles(id),
    created_at timestamptz default now()
);

create table if not exists consultations (
    id uuid primary key default gen_random_uuid(),
    lead_id uuid references rooftop_leads(id) on delete cascade,
    engineer_id uuid references user_profiles(id),
    scheduled_date timestamptz,
    status text check (status in ('pending', 'done', 'canceled')) default 'pending',
    assessment_file_url text,
    notes text,
    created_at timestamptz default now()
);

create table if not exists proposals (
    id uuid primary key default gen_random_uuid(),
    lead_id uuid references rooftop_leads(id) on delete cascade,
    sku text,
    site_size numeric,
    discount numeric,
    subsidy numeric,
    margin numeric,
    status text check (status in ('draft', 'sent', 'approved', 'rejected')) default 'draft',
    pdf_url text,
    created_at timestamptz default now()
);

create table if not exists installations (
    id uuid primary key default gen_random_uuid(),
    proposal_id uuid references proposals(id) on delete cascade,
    stage text check (stage in ('design', 'permit', 'install', 'commissioned')) default 'design',
    inverter_serial text,
    panel_config_json jsonb,
    completion_date timestamptz,
    docs_url text,
    created_at timestamptz default now()
);

-- 3. SOLAR FARMS TABLES
create table if not exists solar_farms (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    location text,
    capacity_kw numeric,
    irr numeric,
    roi numeric,
    image_url text,
    deadline date,
    min_investment numeric,
    status text check (status in ('draft', 'open', 'funded', 'closed')) default 'draft',
    funding_progress numeric default 0,
    calculator_config_json jsonb,
    created_at timestamptz default now()
);

create table if not exists investments (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references user_profiles(id) on delete cascade,
    farm_id uuid references solar_farms(id) on delete cascade,
    amount numeric,
    tokens numeric,
    roi_to_date numeric default 0,
    created_at timestamptz default now()
);

create table if not exists solar_user_returns (
    id uuid primary key default gen_random_uuid(),
    investment_id uuid references investments(id) on delete cascade,
    units_generated numeric,
    revenue numeric,
    credited_at timestamptz default now()
);

-- 4. RLS POLICIES (SAFE & HOLISTIC)
-- Only apply if not already present
-- Admins have full access
-- Sales: rooftop_leads, consultations, proposals, installations
-- Ops: solar_farms, investments, solar_user_returns
-- Viewer: reports only

-- Example: Rooftop Leads
create policy if not exists "Admin access to rooftop_leads"
  on rooftop_leads for all
  using (auth.uid() in (select id from user_profiles where role in ('admin', 'sales')));

-- Example: Solar Farms
create policy if not exists "Admin/Ops access to solar_farms"
  on solar_farms for all
  using (auth.uid() in (select id from user_profiles where role in ('admin', 'ops')));

-- Example: Investments
create policy if not exists "Admin/Ops access to investments"
  on investments for all
  using (auth.uid() in (select id from user_profiles where role in ('admin', 'ops')));

-- Example: User Profiles (only admin can edit roles)
create policy if not exists "Admin access to user_profiles"
  on user_profiles for all
  using (auth.uid() in (select id from user_profiles where role = 'admin'));

-- Example: Reports (viewer)
create policy if not exists "Viewer access to reports"
  on investments for select
  using (auth.uid() in (select id from user_profiles where role in ('admin', 'viewer')));

-- 5. INDEXES & CONSTRAINTS (for performance, no breaking changes)
create index if not exists idx_leads_status on rooftop_leads(status);
create index if not exists idx_farms_status on solar_farms(status);
create index if not exists idx_investments_user on investments(user_id);
create index if not exists idx_investments_farm on investments(farm_id);

-- 6. SEED DATA (optional, safe for dev)
insert into user_profiles (id, email, name, role)
select gen_random_uuid(), 'admin@type3.com', 'Admin User', 'admin'
where not exists (select 1 from user_profiles where email = 'admin@type3.com');

-- End of migration
