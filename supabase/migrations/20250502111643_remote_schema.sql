drop policy "Users can view own investments" on "public"."investments";

drop policy "Users can insert own orders" on "public"."orders";

drop policy "Users can read own orders" on "public"."orders";

drop policy "Users can view own purchases" on "public"."purchase_history";

drop policy "Users can update own security settings" on "public"."security_settings";

drop policy "Users can view own security settings" on "public"."security_settings";

drop policy "Admins can update all tickets" on "public"."support_tickets";

drop policy "Admins can view all tickets" on "public"."support_tickets";

drop policy "Users can create tickets" on "public"."support_tickets";

drop policy "Users can view own tickets" on "public"."support_tickets";

drop policy "Admins can create ticket messages" on "public"."ticket_messages";

drop policy "Admins can view all ticket messages" on "public"."ticket_messages";

drop policy "Users can update own profiles" on "public"."user_profiles";

drop policy "Users can view own profiles" on "public"."user_profiles";

drop policy "Users can view own credits" on "public"."wattage_credits";

revoke delete on table "public"."investments" from "anon";

revoke insert on table "public"."investments" from "anon";

revoke references on table "public"."investments" from "anon";

revoke select on table "public"."investments" from "anon";

revoke trigger on table "public"."investments" from "anon";

revoke truncate on table "public"."investments" from "anon";

revoke update on table "public"."investments" from "anon";

revoke delete on table "public"."investments" from "authenticated";

revoke insert on table "public"."investments" from "authenticated";

revoke references on table "public"."investments" from "authenticated";

revoke select on table "public"."investments" from "authenticated";

revoke trigger on table "public"."investments" from "authenticated";

revoke truncate on table "public"."investments" from "authenticated";

revoke update on table "public"."investments" from "authenticated";

revoke delete on table "public"."investments" from "service_role";

revoke insert on table "public"."investments" from "service_role";

revoke references on table "public"."investments" from "service_role";

revoke select on table "public"."investments" from "service_role";

revoke trigger on table "public"."investments" from "service_role";

revoke truncate on table "public"."investments" from "service_role";

revoke update on table "public"."investments" from "service_role";

revoke delete on table "public"."orders" from "anon";

revoke insert on table "public"."orders" from "anon";

revoke references on table "public"."orders" from "anon";

revoke select on table "public"."orders" from "anon";

revoke trigger on table "public"."orders" from "anon";

revoke truncate on table "public"."orders" from "anon";

revoke update on table "public"."orders" from "anon";

revoke delete on table "public"."orders" from "authenticated";

revoke insert on table "public"."orders" from "authenticated";

revoke references on table "public"."orders" from "authenticated";

revoke select on table "public"."orders" from "authenticated";

revoke trigger on table "public"."orders" from "authenticated";

revoke truncate on table "public"."orders" from "authenticated";

revoke update on table "public"."orders" from "authenticated";

revoke delete on table "public"."orders" from "service_role";

revoke insert on table "public"."orders" from "service_role";

revoke references on table "public"."orders" from "service_role";

revoke select on table "public"."orders" from "service_role";

revoke trigger on table "public"."orders" from "service_role";

revoke truncate on table "public"."orders" from "service_role";

revoke update on table "public"."orders" from "service_role";

revoke delete on table "public"."product_categories" from "anon";

revoke insert on table "public"."product_categories" from "anon";

revoke references on table "public"."product_categories" from "anon";

revoke select on table "public"."product_categories" from "anon";

revoke trigger on table "public"."product_categories" from "anon";

revoke truncate on table "public"."product_categories" from "anon";

revoke update on table "public"."product_categories" from "anon";

revoke delete on table "public"."product_categories" from "authenticated";

revoke insert on table "public"."product_categories" from "authenticated";

revoke references on table "public"."product_categories" from "authenticated";

revoke select on table "public"."product_categories" from "authenticated";

revoke trigger on table "public"."product_categories" from "authenticated";

revoke truncate on table "public"."product_categories" from "authenticated";

revoke update on table "public"."product_categories" from "authenticated";

revoke delete on table "public"."product_categories" from "service_role";

revoke insert on table "public"."product_categories" from "service_role";

revoke references on table "public"."product_categories" from "service_role";

revoke select on table "public"."product_categories" from "service_role";

revoke trigger on table "public"."product_categories" from "service_role";

revoke truncate on table "public"."product_categories" from "service_role";

revoke update on table "public"."product_categories" from "service_role";

revoke delete on table "public"."products" from "anon";

revoke insert on table "public"."products" from "anon";

revoke references on table "public"."products" from "anon";

revoke select on table "public"."products" from "anon";

revoke trigger on table "public"."products" from "anon";

revoke truncate on table "public"."products" from "anon";

revoke update on table "public"."products" from "anon";

revoke delete on table "public"."products" from "authenticated";

revoke insert on table "public"."products" from "authenticated";

revoke references on table "public"."products" from "authenticated";

revoke select on table "public"."products" from "authenticated";

revoke trigger on table "public"."products" from "authenticated";

revoke truncate on table "public"."products" from "authenticated";

revoke update on table "public"."products" from "authenticated";

revoke delete on table "public"."products" from "service_role";

revoke insert on table "public"."products" from "service_role";

revoke references on table "public"."products" from "service_role";

revoke select on table "public"."products" from "service_role";

revoke trigger on table "public"."products" from "service_role";

revoke truncate on table "public"."products" from "service_role";

revoke update on table "public"."products" from "service_role";

revoke delete on table "public"."purchase_history" from "anon";

revoke insert on table "public"."purchase_history" from "anon";

revoke references on table "public"."purchase_history" from "anon";

revoke select on table "public"."purchase_history" from "anon";

revoke trigger on table "public"."purchase_history" from "anon";

revoke truncate on table "public"."purchase_history" from "anon";

revoke update on table "public"."purchase_history" from "anon";

revoke delete on table "public"."purchase_history" from "authenticated";

revoke insert on table "public"."purchase_history" from "authenticated";

revoke references on table "public"."purchase_history" from "authenticated";

revoke select on table "public"."purchase_history" from "authenticated";

revoke trigger on table "public"."purchase_history" from "authenticated";

revoke truncate on table "public"."purchase_history" from "authenticated";

revoke update on table "public"."purchase_history" from "authenticated";

revoke delete on table "public"."purchase_history" from "service_role";

revoke insert on table "public"."purchase_history" from "service_role";

revoke references on table "public"."purchase_history" from "service_role";

revoke select on table "public"."purchase_history" from "service_role";

revoke trigger on table "public"."purchase_history" from "service_role";

revoke truncate on table "public"."purchase_history" from "service_role";

revoke update on table "public"."purchase_history" from "service_role";

revoke delete on table "public"."security_settings" from "anon";

revoke insert on table "public"."security_settings" from "anon";

revoke references on table "public"."security_settings" from "anon";

revoke select on table "public"."security_settings" from "anon";

revoke trigger on table "public"."security_settings" from "anon";

revoke truncate on table "public"."security_settings" from "anon";

revoke update on table "public"."security_settings" from "anon";

revoke delete on table "public"."security_settings" from "authenticated";

revoke insert on table "public"."security_settings" from "authenticated";

revoke references on table "public"."security_settings" from "authenticated";

revoke select on table "public"."security_settings" from "authenticated";

revoke trigger on table "public"."security_settings" from "authenticated";

revoke truncate on table "public"."security_settings" from "authenticated";

revoke update on table "public"."security_settings" from "authenticated";

revoke delete on table "public"."security_settings" from "service_role";

revoke insert on table "public"."security_settings" from "service_role";

revoke references on table "public"."security_settings" from "service_role";

revoke select on table "public"."security_settings" from "service_role";

revoke trigger on table "public"."security_settings" from "service_role";

revoke truncate on table "public"."security_settings" from "service_role";

revoke update on table "public"."security_settings" from "service_role";

revoke delete on table "public"."wattage_credits" from "anon";

revoke insert on table "public"."wattage_credits" from "anon";

revoke references on table "public"."wattage_credits" from "anon";

revoke select on table "public"."wattage_credits" from "anon";

revoke trigger on table "public"."wattage_credits" from "anon";

revoke truncate on table "public"."wattage_credits" from "anon";

revoke update on table "public"."wattage_credits" from "anon";

revoke delete on table "public"."wattage_credits" from "authenticated";

revoke insert on table "public"."wattage_credits" from "authenticated";

revoke references on table "public"."wattage_credits" from "authenticated";

revoke select on table "public"."wattage_credits" from "authenticated";

revoke trigger on table "public"."wattage_credits" from "authenticated";

revoke truncate on table "public"."wattage_credits" from "authenticated";

revoke update on table "public"."wattage_credits" from "authenticated";

revoke delete on table "public"."wattage_credits" from "service_role";

revoke insert on table "public"."wattage_credits" from "service_role";

revoke references on table "public"."wattage_credits" from "service_role";

revoke select on table "public"."wattage_credits" from "service_role";

revoke trigger on table "public"."wattage_credits" from "service_role";

revoke truncate on table "public"."wattage_credits" from "service_role";

revoke update on table "public"."wattage_credits" from "service_role";

alter table "public"."investments" drop constraint "investments_status_check";

alter table "public"."investments" drop constraint "investments_user_id_fkey";

alter table "public"."orders" drop constraint "orders_status_check";

alter table "public"."orders" drop constraint "orders_user_id_fkey";

alter table "public"."product_categories" drop constraint "product_categories_name_key";

alter table "public"."products" drop constraint "products_category_id_fkey";

alter table "public"."purchase_history" drop constraint "purchase_history_status_check";

alter table "public"."purchase_history" drop constraint "purchase_history_user_id_fkey";

alter table "public"."security_settings" drop constraint "security_settings_user_id_fkey";

alter table "public"."security_settings" drop constraint "security_settings_user_id_key";

alter table "public"."support_tickets" drop constraint "support_tickets_priority_check";

alter table "public"."support_tickets" drop constraint "support_tickets_status_check";

alter table "public"."wattage_credits" drop constraint "wattage_credits_status_check";

alter table "public"."wattage_credits" drop constraint "wattage_credits_user_id_fkey";

alter table "public"."investments" drop constraint "investments_pkey";

alter table "public"."orders" drop constraint "orders_pkey";

alter table "public"."product_categories" drop constraint "product_categories_pkey";

alter table "public"."products" drop constraint "products_pkey";

alter table "public"."purchase_history" drop constraint "purchase_history_pkey";

alter table "public"."security_settings" drop constraint "security_settings_pkey";

alter table "public"."wattage_credits" drop constraint "wattage_credits_pkey";

drop index if exists "public"."idx_products_category_id";

drop index if exists "public"."investments_pkey";

drop index if exists "public"."orders_pkey";

drop index if exists "public"."product_categories_name_key";

drop index if exists "public"."product_categories_pkey";

drop index if exists "public"."products_pkey";

drop index if exists "public"."purchase_history_pkey";

drop index if exists "public"."security_settings_pkey";

drop index if exists "public"."security_settings_user_id_key";

drop index if exists "public"."wattage_credits_pkey";

drop table "public"."investments";

drop table "public"."orders";

drop table "public"."product_categories";

drop table "public"."products";

drop table "public"."purchase_history";

drop table "public"."security_settings";

drop table "public"."wattage_credits";

create table "public"."consultations" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "status" text not null,
    "address" text,
    "consultation_date" timestamp with time zone,
    "notes" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."installations" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "status" text not null,
    "address" text,
    "city" text,
    "state" text,
    "zip_code" text,
    "installation_date" timestamp with time zone,
    "completion_date" timestamp with time zone,
    "notes" text,
    "estimated_savings" numeric(10,2),
    "capacity_kw" numeric(10,2) not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."product_skus" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "sku" text not null,
    "category" text not null,
    "price" numeric(10,2) not null,
    "capacity_kw" numeric(10,2),
    "description" text not null,
    "specifications" jsonb not null default '{}'::jsonb,
    "inventory_count" integer not null default 0,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "generation" text,
    "area_required" integer,
    "monthly_savings" integer,
    "subsidy_amount" integer,
    "original_price" integer,
    "panel_type" text,
    "installation_time" text,
    "image_url" text,
    "features" jsonb default '[]'::jsonb,
    "variants" jsonb,
    "options" jsonb
);


create table "public"."projects" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "capacity" numeric,
    "type" text,
    "status" text default 'planning'::text,
    "location" text,
    "created_at" timestamp with time zone default timezone('utc'::text, now())
);


create table "public"."rooftop_leads" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "contact" text not null,
    "email" text,
    "status" text default 'new'::text,
    "preferred_date" date,
    "preferred_time_slot" text,
    "address" text,
    "city" text,
    "state" text,
    "zip_code" text,
    "product_sku" text,
    "product_name" text,
    "product_power" numeric,
    "source" text,
    "lead_source" text,
    "notes" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."rooftop_leads" enable row level security;

create table "public"."rooftop_systems" (
    "id" uuid not null default uuid_generate_v4(),
    "installation_id" uuid,
    "user_id" uuid not null,
    "capacity_kw" numeric(10,2) not null,
    "panel_count" integer,
    "inverter_type" text,
    "status" text not null,
    "installation_date" timestamp with time zone,
    "warranty_end_date" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."site_visits" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "phone_number" text not null,
    "email" text,
    "address" text,
    "city" text,
    "state" text,
    "zip_code" text,
    "pincode" text,
    "preferred_date" date,
    "preferred_time_slot" text,
    "geolocation" jsonb,
    "additional_notes" text,
    "status" text default 'pending'::text,
    "product_sku" text,
    "product_name" text,
    "capacity_kw" numeric,
    "power" numeric,
    "system_size" numeric,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "scheduled_at" timestamp with time zone,
    "completed_at" timestamp with time zone
);


alter table "public"."site_visits" enable row level security;

create table "public"."transactions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "amount" numeric not null,
    "type" text not null,
    "description" text,
    "status" text default 'completed'::text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."support_tickets" drop column "assigned_to";

alter table "public"."support_tickets" drop column "message";

alter table "public"."support_tickets" drop column "priority";

alter table "public"."support_tickets" drop column "subject";

alter table "public"."support_tickets" drop column "updated_at";

alter table "public"."support_tickets" alter column "status" drop default;

alter table "public"."support_tickets" alter column "status" set not null;

alter table "public"."support_tickets" disable row level security;

alter table "public"."user_profiles" add column "kyc_status" text default 'pending'::text;

alter table "public"."user_profiles" disable row level security;

CREATE UNIQUE INDEX consultations_pkey ON public.consultations USING btree (id);

CREATE UNIQUE INDEX installations_pkey ON public.installations USING btree (id);

CREATE INDEX product_skus_category_idx ON public.product_skus USING btree (category);

CREATE UNIQUE INDEX product_skus_pkey ON public.product_skus USING btree (id);

CREATE INDEX product_skus_sku_idx ON public.product_skus USING btree (sku);

CREATE UNIQUE INDEX product_skus_sku_key ON public.product_skus USING btree (sku);

CREATE UNIQUE INDEX projects_pkey ON public.projects USING btree (id);

CREATE UNIQUE INDEX rooftop_leads_pkey ON public.rooftop_leads USING btree (id);

CREATE UNIQUE INDEX rooftop_systems_pkey ON public.rooftop_systems USING btree (id);

CREATE UNIQUE INDEX site_visits_pkey ON public.site_visits USING btree (id);

CREATE UNIQUE INDEX transactions_pkey ON public.transactions USING btree (id);

alter table "public"."consultations" add constraint "consultations_pkey" PRIMARY KEY using index "consultations_pkey";

alter table "public"."installations" add constraint "installations_pkey" PRIMARY KEY using index "installations_pkey";

alter table "public"."product_skus" add constraint "product_skus_pkey" PRIMARY KEY using index "product_skus_pkey";

alter table "public"."projects" add constraint "projects_pkey" PRIMARY KEY using index "projects_pkey";

alter table "public"."rooftop_leads" add constraint "rooftop_leads_pkey" PRIMARY KEY using index "rooftop_leads_pkey";

alter table "public"."rooftop_systems" add constraint "rooftop_systems_pkey" PRIMARY KEY using index "rooftop_systems_pkey";

alter table "public"."site_visits" add constraint "site_visits_pkey" PRIMARY KEY using index "site_visits_pkey";

alter table "public"."transactions" add constraint "transactions_pkey" PRIMARY KEY using index "transactions_pkey";

alter table "public"."product_skus" add constraint "product_skus_sku_key" UNIQUE using index "product_skus_sku_key";

alter table "public"."rooftop_systems" add constraint "rooftop_systems_installation_id_fkey" FOREIGN KEY (installation_id) REFERENCES installations(id) not valid;

alter table "public"."rooftop_systems" validate constraint "rooftop_systems_installation_id_fkey";

alter table "public"."transactions" add constraint "transactions_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text]))) not valid;

alter table "public"."transactions" validate constraint "transactions_status_check";

alter table "public"."transactions" add constraint "transactions_type_check" CHECK ((type = ANY (ARRAY['purchase'::text, 'refund'::text, 'subscription'::text, 'maintenance'::text]))) not valid;

alter table "public"."transactions" validate constraint "transactions_type_check";

alter table "public"."transactions" add constraint "transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE SET NULL not valid;

alter table "public"."transactions" validate constraint "transactions_user_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_kyc_status_check" CHECK ((kyc_status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text]))) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_kyc_status_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  profile_exists BOOLEAN;
BEGIN
  -- Check if profile already exists
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles WHERE user_id = NEW.id
  ) INTO profile_exists;
  
  -- Only create if it doesn't exist
  IF NOT profile_exists THEN
    BEGIN
      INSERT INTO public.user_profiles (user_id, full_name, email)
      VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.email
      );
      EXCEPTION WHEN OTHERS THEN
        -- Log error but don't fail
        RAISE NOTICE 'Error creating user profile: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT (role = 'admin') INTO is_admin 
  FROM public.user_profiles 
  WHERE user_profiles.user_id = $1
  LIMIT 1;
  
  RETURN COALESCE(is_admin, false);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.setup_tables_and_policies()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Create rooftop_leads table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rooftop_leads') THEN
        CREATE TABLE public.rooftop_leads (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            contact TEXT NOT NULL,
            email TEXT,
            status TEXT DEFAULT 'new',
            preferred_date DATE,
            preferred_time_slot TEXT,
            address TEXT,
            city TEXT,
            state TEXT,
            zip_code TEXT,
            product_sku TEXT,
            product_name TEXT,
            product_power NUMERIC,
            source TEXT,
            lead_source TEXT,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add RLS policy
        ALTER TABLE public.rooftop_leads ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow full access to authenticated users" ON public.rooftop_leads 
            FOR ALL TO authenticated USING (true);
        CREATE POLICY "Allow insert access to anonymous users" ON public.rooftop_leads 
            FOR INSERT TO anon USING (true);
    END IF;

    -- Create site_visits table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'site_visits') THEN
        CREATE TABLE public.site_visits (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            phone_number TEXT NOT NULL,
            email TEXT,
            address TEXT,
            city TEXT,
            state TEXT,
            zip_code TEXT,
            pincode TEXT,
            preferred_date DATE,
            preferred_time_slot TEXT,
            geolocation JSONB,
            additional_notes TEXT,
            status TEXT DEFAULT 'pending',
            product_sku TEXT,
            product_name TEXT,
            capacity_kw NUMERIC,
            power NUMERIC,
            system_size NUMERIC,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            scheduled_at TIMESTAMP WITH TIME ZONE,
            completed_at TIMESTAMP WITH TIME ZONE
        );

        -- Add RLS policy
        ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow full access to authenticated users" ON public.site_visits 
            FOR ALL TO authenticated USING (true);
        CREATE POLICY "Allow insert access to anonymous users" ON public.site_visits 
            FOR INSERT TO anon USING (true);
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_modified_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$function$
;

grant delete on table "public"."consultations" to "anon";

grant insert on table "public"."consultations" to "anon";

grant references on table "public"."consultations" to "anon";

grant select on table "public"."consultations" to "anon";

grant trigger on table "public"."consultations" to "anon";

grant truncate on table "public"."consultations" to "anon";

grant update on table "public"."consultations" to "anon";

grant delete on table "public"."consultations" to "authenticated";

grant insert on table "public"."consultations" to "authenticated";

grant references on table "public"."consultations" to "authenticated";

grant select on table "public"."consultations" to "authenticated";

grant trigger on table "public"."consultations" to "authenticated";

grant truncate on table "public"."consultations" to "authenticated";

grant update on table "public"."consultations" to "authenticated";

grant delete on table "public"."consultations" to "service_role";

grant insert on table "public"."consultations" to "service_role";

grant references on table "public"."consultations" to "service_role";

grant select on table "public"."consultations" to "service_role";

grant trigger on table "public"."consultations" to "service_role";

grant truncate on table "public"."consultations" to "service_role";

grant update on table "public"."consultations" to "service_role";

grant delete on table "public"."installations" to "anon";

grant insert on table "public"."installations" to "anon";

grant references on table "public"."installations" to "anon";

grant select on table "public"."installations" to "anon";

grant trigger on table "public"."installations" to "anon";

grant truncate on table "public"."installations" to "anon";

grant update on table "public"."installations" to "anon";

grant delete on table "public"."installations" to "authenticated";

grant insert on table "public"."installations" to "authenticated";

grant references on table "public"."installations" to "authenticated";

grant select on table "public"."installations" to "authenticated";

grant trigger on table "public"."installations" to "authenticated";

grant truncate on table "public"."installations" to "authenticated";

grant update on table "public"."installations" to "authenticated";

grant delete on table "public"."installations" to "service_role";

grant insert on table "public"."installations" to "service_role";

grant references on table "public"."installations" to "service_role";

grant select on table "public"."installations" to "service_role";

grant trigger on table "public"."installations" to "service_role";

grant truncate on table "public"."installations" to "service_role";

grant update on table "public"."installations" to "service_role";

grant delete on table "public"."product_skus" to "anon";

grant insert on table "public"."product_skus" to "anon";

grant references on table "public"."product_skus" to "anon";

grant select on table "public"."product_skus" to "anon";

grant trigger on table "public"."product_skus" to "anon";

grant truncate on table "public"."product_skus" to "anon";

grant update on table "public"."product_skus" to "anon";

grant delete on table "public"."product_skus" to "authenticated";

grant insert on table "public"."product_skus" to "authenticated";

grant references on table "public"."product_skus" to "authenticated";

grant select on table "public"."product_skus" to "authenticated";

grant trigger on table "public"."product_skus" to "authenticated";

grant truncate on table "public"."product_skus" to "authenticated";

grant update on table "public"."product_skus" to "authenticated";

grant delete on table "public"."product_skus" to "service_role";

grant insert on table "public"."product_skus" to "service_role";

grant references on table "public"."product_skus" to "service_role";

grant select on table "public"."product_skus" to "service_role";

grant trigger on table "public"."product_skus" to "service_role";

grant truncate on table "public"."product_skus" to "service_role";

grant update on table "public"."product_skus" to "service_role";

grant delete on table "public"."projects" to "anon";

grant insert on table "public"."projects" to "anon";

grant references on table "public"."projects" to "anon";

grant select on table "public"."projects" to "anon";

grant trigger on table "public"."projects" to "anon";

grant truncate on table "public"."projects" to "anon";

grant update on table "public"."projects" to "anon";

grant delete on table "public"."projects" to "authenticated";

grant insert on table "public"."projects" to "authenticated";

grant references on table "public"."projects" to "authenticated";

grant select on table "public"."projects" to "authenticated";

grant trigger on table "public"."projects" to "authenticated";

grant truncate on table "public"."projects" to "authenticated";

grant update on table "public"."projects" to "authenticated";

grant delete on table "public"."projects" to "service_role";

grant insert on table "public"."projects" to "service_role";

grant references on table "public"."projects" to "service_role";

grant select on table "public"."projects" to "service_role";

grant trigger on table "public"."projects" to "service_role";

grant truncate on table "public"."projects" to "service_role";

grant update on table "public"."projects" to "service_role";

grant delete on table "public"."rooftop_leads" to "anon";

grant insert on table "public"."rooftop_leads" to "anon";

grant references on table "public"."rooftop_leads" to "anon";

grant select on table "public"."rooftop_leads" to "anon";

grant trigger on table "public"."rooftop_leads" to "anon";

grant truncate on table "public"."rooftop_leads" to "anon";

grant update on table "public"."rooftop_leads" to "anon";

grant delete on table "public"."rooftop_leads" to "authenticated";

grant insert on table "public"."rooftop_leads" to "authenticated";

grant references on table "public"."rooftop_leads" to "authenticated";

grant select on table "public"."rooftop_leads" to "authenticated";

grant trigger on table "public"."rooftop_leads" to "authenticated";

grant truncate on table "public"."rooftop_leads" to "authenticated";

grant update on table "public"."rooftop_leads" to "authenticated";

grant delete on table "public"."rooftop_leads" to "service_role";

grant insert on table "public"."rooftop_leads" to "service_role";

grant references on table "public"."rooftop_leads" to "service_role";

grant select on table "public"."rooftop_leads" to "service_role";

grant trigger on table "public"."rooftop_leads" to "service_role";

grant truncate on table "public"."rooftop_leads" to "service_role";

grant update on table "public"."rooftop_leads" to "service_role";

grant delete on table "public"."rooftop_systems" to "anon";

grant insert on table "public"."rooftop_systems" to "anon";

grant references on table "public"."rooftop_systems" to "anon";

grant select on table "public"."rooftop_systems" to "anon";

grant trigger on table "public"."rooftop_systems" to "anon";

grant truncate on table "public"."rooftop_systems" to "anon";

grant update on table "public"."rooftop_systems" to "anon";

grant delete on table "public"."rooftop_systems" to "authenticated";

grant insert on table "public"."rooftop_systems" to "authenticated";

grant references on table "public"."rooftop_systems" to "authenticated";

grant select on table "public"."rooftop_systems" to "authenticated";

grant trigger on table "public"."rooftop_systems" to "authenticated";

grant truncate on table "public"."rooftop_systems" to "authenticated";

grant update on table "public"."rooftop_systems" to "authenticated";

grant delete on table "public"."rooftop_systems" to "service_role";

grant insert on table "public"."rooftop_systems" to "service_role";

grant references on table "public"."rooftop_systems" to "service_role";

grant select on table "public"."rooftop_systems" to "service_role";

grant trigger on table "public"."rooftop_systems" to "service_role";

grant truncate on table "public"."rooftop_systems" to "service_role";

grant update on table "public"."rooftop_systems" to "service_role";

grant delete on table "public"."site_visits" to "anon";

grant insert on table "public"."site_visits" to "anon";

grant references on table "public"."site_visits" to "anon";

grant select on table "public"."site_visits" to "anon";

grant trigger on table "public"."site_visits" to "anon";

grant truncate on table "public"."site_visits" to "anon";

grant update on table "public"."site_visits" to "anon";

grant delete on table "public"."site_visits" to "authenticated";

grant insert on table "public"."site_visits" to "authenticated";

grant references on table "public"."site_visits" to "authenticated";

grant select on table "public"."site_visits" to "authenticated";

grant trigger on table "public"."site_visits" to "authenticated";

grant truncate on table "public"."site_visits" to "authenticated";

grant update on table "public"."site_visits" to "authenticated";

grant delete on table "public"."site_visits" to "service_role";

grant insert on table "public"."site_visits" to "service_role";

grant references on table "public"."site_visits" to "service_role";

grant select on table "public"."site_visits" to "service_role";

grant trigger on table "public"."site_visits" to "service_role";

grant truncate on table "public"."site_visits" to "service_role";

grant update on table "public"."site_visits" to "service_role";

grant delete on table "public"."transactions" to "anon";

grant insert on table "public"."transactions" to "anon";

grant references on table "public"."transactions" to "anon";

grant select on table "public"."transactions" to "anon";

grant trigger on table "public"."transactions" to "anon";

grant truncate on table "public"."transactions" to "anon";

grant update on table "public"."transactions" to "anon";

grant delete on table "public"."transactions" to "authenticated";

grant insert on table "public"."transactions" to "authenticated";

grant references on table "public"."transactions" to "authenticated";

grant select on table "public"."transactions" to "authenticated";

grant trigger on table "public"."transactions" to "authenticated";

grant truncate on table "public"."transactions" to "authenticated";

grant update on table "public"."transactions" to "authenticated";

grant delete on table "public"."transactions" to "service_role";

grant insert on table "public"."transactions" to "service_role";

grant references on table "public"."transactions" to "service_role";

grant select on table "public"."transactions" to "service_role";

grant trigger on table "public"."transactions" to "service_role";

grant truncate on table "public"."transactions" to "service_role";

grant update on table "public"."transactions" to "service_role";

create policy "Allow full access to authenticated users"
on "public"."rooftop_leads"
as permissive
for all
to authenticated
using (true);


create policy "Allow insert access to anonymous users"
on "public"."rooftop_leads"
as permissive
for insert
to anon
with check (true);


create policy "Allow full access to authenticated users"
on "public"."site_visits"
as permissive
for all
to authenticated
using (true);


create policy "Allow insert access to anonymous users"
on "public"."site_visits"
as permissive
for insert
to anon
with check (true);


create policy "Allow all authenticated read"
on "public"."user_profiles"
as permissive
for select
to public
using ((auth.uid() IS NOT NULL));


create policy "insert_policy"
on "public"."user_profiles"
as permissive
for insert
to public
with check (true);


create policy "select_policy"
on "public"."user_profiles"
as permissive
for select
to authenticated
using (true);


create policy "update_policy"
on "public"."user_profiles"
as permissive
for update
to public
using ((auth.uid() = user_id));


CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.product_skus FOR EACH ROW EXECUTE FUNCTION update_modified_column();


