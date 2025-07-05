

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."contact_reason" AS ENUM (
    'install',
    'invest',
    'partnership',
    'other'
);


ALTER TYPE "public"."contact_reason" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT (role = 'admin') INTO is_admin 
  FROM public.user_profiles 
  WHERE user_profiles.user_id = $1
  LIMIT 1;
  
  RETURN COALESCE(is_admin, false);
END;
$_$;


ALTER FUNCTION "public"."is_admin"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."setup_tables_and_policies"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."setup_tables_and_policies"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_modified_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_modified_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."consultations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "text" NOT NULL,
    "address" "text",
    "consultation_date" timestamp with time zone,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."consultations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email_or_phone" "text" NOT NULL,
    "reason" "public"."contact_reason" NOT NULL,
    "message" "text" NOT NULL,
    "status" "text" DEFAULT 'new'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."contact_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."installations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "text" NOT NULL,
    "address" "text",
    "city" "text",
    "state" "text",
    "zip_code" "text",
    "installation_date" timestamp with time zone,
    "completion_date" timestamp with time zone,
    "notes" "text",
    "estimated_savings" numeric(10,2),
    "capacity_kw" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."installations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_skus" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "sku" "text" NOT NULL,
    "category" "text" NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "capacity_kw" numeric(10,2),
    "description" "text" NOT NULL,
    "specifications" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "inventory_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "generation" "text",
    "area_required" integer,
    "monthly_savings" integer,
    "subsidy_amount" integer,
    "original_price" integer,
    "panel_type" "text",
    "installation_time" "text",
    "image_url" "text",
    "features" "jsonb" DEFAULT '[]'::"jsonb",
    "variants" "jsonb",
    "options" "jsonb"
);


ALTER TABLE "public"."product_skus" OWNER TO "postgres";


COMMENT ON TABLE "public"."product_skus" IS 'Table storing all rooftop solar product SKUs for Type 3 Solar Platform';



CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "capacity" numeric,
    "type" "text",
    "status" "text" DEFAULT 'planning'::"text",
    "location" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roi_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "calculator_type" "text" NOT NULL,
    "input_data" "jsonb" NOT NULL,
    "results" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "roi_logs_calculator_type_check" CHECK (("calculator_type" = ANY (ARRAY['rooftop'::"text", 'investment'::"text"])))
);


ALTER TABLE "public"."roi_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rooftop_leads" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "contact" "text" NOT NULL,
    "email" "text",
    "status" "text" DEFAULT 'new'::"text",
    "preferred_date" "date",
    "preferred_time_slot" "text",
    "address" "text",
    "city" "text",
    "state" "text",
    "zip_code" "text",
    "product_sku" "text",
    "product_name" "text",
    "product_power" numeric,
    "source" "text",
    "lead_source" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."rooftop_leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rooftop_systems" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "installation_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "capacity_kw" numeric(10,2) NOT NULL,
    "panel_count" integer,
    "inverter_type" "text",
    "status" "text" NOT NULL,
    "installation_date" timestamp with time zone,
    "warranty_end_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."rooftop_systems" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_visits" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "phone_number" "text" NOT NULL,
    "email" "text",
    "address" "text",
    "city" "text",
    "state" "text",
    "zip_code" "text",
    "pincode" "text",
    "preferred_date" "date",
    "preferred_time_slot" "text",
    "geolocation" "jsonb",
    "additional_notes" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "product_sku" "text",
    "product_name" "text",
    "capacity_kw" numeric,
    "power" numeric,
    "system_size" numeric,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "scheduled_at" timestamp with time zone,
    "completed_at" timestamp with time zone
);


ALTER TABLE "public"."site_visits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."support_tickets" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."support_tickets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ticket_messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "ticket_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "is_admin" boolean DEFAULT false,
    "message" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ticket_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "amount" numeric NOT NULL,
    "type" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'completed'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "transactions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'failed'::"text"]))),
    CONSTRAINT "transactions_type_check" CHECK (("type" = ANY (ARRAY['purchase'::"text", 'refund'::"text", 'subscription'::"text", 'maintenance'::"text"])))
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "role" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "kyc_status" "text" DEFAULT 'pending'::"text",
    CONSTRAINT "user_profiles_kyc_status_check" CHECK (("kyc_status" = ANY (ARRAY['pending'::"text", 'verified'::"text", 'rejected'::"text"]))),
    CONSTRAINT "user_profiles_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'investor'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_messages"
    ADD CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."installations"
    ADD CONSTRAINT "installations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_skus"
    ADD CONSTRAINT "product_skus_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_skus"
    ADD CONSTRAINT "product_skus_sku_key" UNIQUE ("sku");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roi_logs"
    ADD CONSTRAINT "roi_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rooftop_leads"
    ADD CONSTRAINT "rooftop_leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rooftop_systems"
    ADD CONSTRAINT "rooftop_systems_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_visits"
    ADD CONSTRAINT "site_visits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ticket_messages"
    ADD CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



CREATE INDEX "product_skus_category_idx" ON "public"."product_skus" USING "btree" ("category");



CREATE INDEX "product_skus_sku_idx" ON "public"."product_skus" USING "btree" ("sku");



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."product_skus" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



ALTER TABLE ONLY "public"."roi_logs"
    ADD CONSTRAINT "roi_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."rooftop_systems"
    ADD CONSTRAINT "rooftop_systems_installation_id_fkey" FOREIGN KEY ("installation_id") REFERENCES "public"."installations"("id");



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."ticket_messages"
    ADD CONSTRAINT "ticket_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id");



ALTER TABLE ONLY "public"."ticket_messages"
    ADD CONSTRAINT "ticket_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Admins can read all profiles" ON "public"."user_profiles" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "user_profiles_1"
  WHERE (("user_profiles_1"."user_id" = "auth"."uid"()) AND ("user_profiles_1"."role" = 'admin'::"text")))));



CREATE POLICY "Allow all authenticated read" ON "public"."user_profiles" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow full access to authenticated users" ON "public"."rooftop_leads" TO "authenticated" USING (true);



CREATE POLICY "Allow full access to authenticated users" ON "public"."site_visits" TO "authenticated" USING (true);



CREATE POLICY "Allow insert access to anonymous users" ON "public"."rooftop_leads" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Allow insert access to anonymous users" ON "public"."site_visits" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Anyone can create contact messages" ON "public"."contact_messages" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Anyone can create logs" ON "public"."roi_logs" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Users can create ticket messages" ON "public"."ticket_messages" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own logs" ON "public"."roi_logs" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own messages" ON "public"."contact_messages" FOR SELECT TO "authenticated" USING (("email_or_phone" = CURRENT_USER));



CREATE POLICY "Users can read own profile" ON "public"."user_profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view ticket messages they are involved with" ON "public"."ticket_messages" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ("auth"."uid"() IN ( SELECT "support_tickets"."user_id"
   FROM "public"."support_tickets"
  WHERE ("support_tickets"."id" = "ticket_messages"."ticket_id")))));



ALTER TABLE "public"."contact_messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insert_policy" ON "public"."user_profiles" FOR INSERT WITH CHECK (true);



ALTER TABLE "public"."roi_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rooftop_leads" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "select_policy" ON "public"."user_profiles" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."site_visits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ticket_messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "update_policy" ON "public"."user_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."setup_tables_and_policies"() TO "anon";
GRANT ALL ON FUNCTION "public"."setup_tables_and_policies"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."setup_tables_and_policies"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."consultations" TO "anon";
GRANT ALL ON TABLE "public"."consultations" TO "authenticated";
GRANT ALL ON TABLE "public"."consultations" TO "service_role";



GRANT ALL ON TABLE "public"."contact_messages" TO "anon";
GRANT ALL ON TABLE "public"."contact_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_messages" TO "service_role";



GRANT ALL ON TABLE "public"."installations" TO "anon";
GRANT ALL ON TABLE "public"."installations" TO "authenticated";
GRANT ALL ON TABLE "public"."installations" TO "service_role";



GRANT ALL ON TABLE "public"."product_skus" TO "anon";
GRANT ALL ON TABLE "public"."product_skus" TO "authenticated";
GRANT ALL ON TABLE "public"."product_skus" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."roi_logs" TO "anon";
GRANT ALL ON TABLE "public"."roi_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."roi_logs" TO "service_role";



GRANT ALL ON TABLE "public"."rooftop_leads" TO "anon";
GRANT ALL ON TABLE "public"."rooftop_leads" TO "authenticated";
GRANT ALL ON TABLE "public"."rooftop_leads" TO "service_role";



GRANT ALL ON TABLE "public"."rooftop_systems" TO "anon";
GRANT ALL ON TABLE "public"."rooftop_systems" TO "authenticated";
GRANT ALL ON TABLE "public"."rooftop_systems" TO "service_role";



GRANT ALL ON TABLE "public"."site_visits" TO "anon";
GRANT ALL ON TABLE "public"."site_visits" TO "authenticated";
GRANT ALL ON TABLE "public"."site_visits" TO "service_role";



GRANT ALL ON TABLE "public"."support_tickets" TO "anon";
GRANT ALL ON TABLE "public"."support_tickets" TO "authenticated";
GRANT ALL ON TABLE "public"."support_tickets" TO "service_role";



GRANT ALL ON TABLE "public"."ticket_messages" TO "anon";
GRANT ALL ON TABLE "public"."ticket_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."ticket_messages" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
