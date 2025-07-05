-- Migration: JWT Key Rotation and Security Enhancements
-- Implements JWT key rotation and enhances cryptographic security for authentication tokens

-- Create a table to store JWT keys for rotation
CREATE TABLE IF NOT EXISTS public.jwt_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_id TEXT NOT NULL UNIQUE,
  key_data TEXT NOT NULL,  -- Encrypted key data
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_rotated_at TIMESTAMPTZ,
  rotation_frequency INTERVAL DEFAULT '30 days'::INTERVAL,
  algorithm TEXT NOT NULL DEFAULT 'HS256'
);

-- Add comments for documentation
COMMENT ON TABLE public.jwt_keys IS 'Stores JWT signing keys with rotation support';
COMMENT ON COLUMN public.jwt_keys.key_id IS 'Unique identifier for the key used in JWT headers';
COMMENT ON COLUMN public.jwt_keys.key_data IS 'Encrypted key data stored securely';
COMMENT ON COLUMN public.jwt_keys.is_current IS 'Whether this is the current active key for signing new tokens';
COMMENT ON COLUMN public.jwt_keys.expires_at IS 'When this key should no longer be used for validation';
COMMENT ON COLUMN public.jwt_keys.rotation_frequency IS 'How often this key should be rotated';

-- Create index for efficient lookups
CREATE INDEX idx_jwt_keys_key_id ON public.jwt_keys(key_id);
CREATE INDEX idx_jwt_keys_is_current ON public.jwt_keys(is_current);
CREATE INDEX idx_jwt_keys_expires_at ON public.jwt_keys(expires_at);

-- Add RLS policies to secure the JWT keys table
ALTER TABLE public.jwt_keys ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage JWT keys
CREATE POLICY "Admins can view JWT keys" 
  ON public.jwt_keys 
  FOR SELECT 
  TO authenticated 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage JWT keys" 
  ON public.jwt_keys 
  FOR ALL 
  TO authenticated 
  USING (public.is_admin(auth.uid()));

-- Create function to encrypt sensitive key data
CREATE OR REPLACE FUNCTION public.encrypt_key_data(p_key_data TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_encrypted TEXT;
BEGIN
  -- In a real implementation, this would use proper encryption
  -- Here we're using pgcrypto for simple encryption
  -- The actual encryption key would be stored securely, not hardcoded
  v_encrypted := encode(pgp_sym_encrypt(p_key_data, current_setting('app.encryption_key', true)), 'base64');
  
  RETURN v_encrypted;
END;
$$;

-- Create function to decrypt sensitive key data
CREATE OR REPLACE FUNCTION public.decrypt_key_data(p_encrypted_data TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_decrypted TEXT;
BEGIN
  -- In a real implementation, this would use proper decryption
  -- The actual encryption key would be stored securely, not hardcoded
  v_decrypted := pgp_sym_decrypt(decode(p_encrypted_data, 'base64'), current_setting('app.encryption_key', true))::TEXT;
  
  RETURN v_decrypted;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to decrypt key data: %', SQLERRM;
  RETURN NULL;
END;
$$;

-- Create function to generate a new secure JWT key
CREATE OR REPLACE FUNCTION public.generate_jwt_key(p_algorithm TEXT DEFAULT 'HS256')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_key TEXT;
BEGIN
  -- Generate a secure random key of appropriate length for the algorithm
  -- HS256 requires at least 32 bytes (256 bits)
  -- HS384 requires at least 48 bytes (384 bits)
  -- HS512 requires at least 64 bytes (512 bits)
  CASE p_algorithm
    WHEN 'HS256' THEN
      v_key := encode(gen_random_bytes(32), 'hex');
    WHEN 'HS384' THEN
      v_key := encode(gen_random_bytes(48), 'hex');
    WHEN 'HS512' THEN
      v_key := encode(gen_random_bytes(64), 'hex');
    ELSE
      -- Default to HS256
      v_key := encode(gen_random_bytes(32), 'hex');
  END CASE;
  
  RETURN v_key;
END;
$$;

-- Create function to add a new JWT key
CREATE OR REPLACE FUNCTION public.add_jwt_key(
  p_key_id TEXT,
  p_algorithm TEXT DEFAULT 'HS256',
  p_rotation_frequency INTERVAL DEFAULT '30 days'::INTERVAL,
  p_make_current BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_key_data TEXT;
  v_encrypted_key TEXT;
  v_new_key_id UUID;
  v_current_user_id UUID;
BEGIN
  -- Get current user ID
  v_current_user_id := auth.uid();
  
  -- Check if user is admin
  IF NOT public.is_admin(v_current_user_id) THEN
    RAISE EXCEPTION 'Only administrators can manage JWT keys';
  END IF;
  
  -- Generate a new secure key
  v_key_data := public.generate_jwt_key(p_algorithm);
  
  -- Encrypt the key data
  v_encrypted_key := public.encrypt_key_data(v_key_data);
  
  -- If making this the current key, first unset any existing current keys
  IF p_make_current THEN
    UPDATE public.jwt_keys
    SET is_current = false
    WHERE is_current = true;
  END IF;
  
  -- Insert the new key
  INSERT INTO public.jwt_keys (
    key_id,
    key_data,
    is_current,
    created_by,
    rotation_frequency,
    algorithm
  ) VALUES (
    p_key_id,
    v_encrypted_key,
    p_make_current,
    v_current_user_id,
    p_rotation_frequency,
    p_algorithm
  )
  RETURNING id INTO v_new_key_id;
  
  RETURN v_new_key_id;
END;
$$;

-- Create function to rotate a JWT key
CREATE OR REPLACE FUNCTION public.rotate_jwt_key(p_key_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_key RECORD;
  v_new_key_id TEXT;
  v_new_key_data TEXT;
  v_encrypted_key TEXT;
  v_current_user_id UUID;
BEGIN
  -- Get current user ID
  v_current_user_id := auth.uid();
  
  -- Check if user is admin
  IF NOT public.is_admin(v_current_user_id) THEN
    RAISE EXCEPTION 'Only administrators can rotate JWT keys';
  END IF;
  
  -- Get existing key information
  SELECT * INTO v_existing_key
  FROM public.jwt_keys
  WHERE key_id = p_key_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'JWT key with ID % not found', p_key_id;
  END IF;
  
  -- Generate a new key ID with same base but different timestamp
  v_new_key_id := p_key_id || '-' || to_char(now(), 'YYYYMMDD-HH24MISS');
  
  -- Generate a new secure key
  v_new_key_data := public.generate_jwt_key(v_existing_key.algorithm);
  
  -- Encrypt the key data
  v_encrypted_key := public.encrypt_key_data(v_new_key_data);
  
  -- Set expiration date for the old key (allow overlap for validation)
  UPDATE public.jwt_keys
  SET 
    is_current = false,
    expires_at = now() + INTERVAL '24 hours',
    last_rotated_at = now()
  WHERE key_id = p_key_id;
  
  -- Insert the new key
  INSERT INTO public.jwt_keys (
    key_id,
    key_data,
    is_current,
    created_by,
    rotation_frequency,
    algorithm
  ) VALUES (
    v_new_key_id,
    v_encrypted_key,
    true,  -- Make the new key current
    v_current_user_id,
    v_existing_key.rotation_frequency,
    v_existing_key.algorithm
  );
  
  RETURN true;
END;
$$;

-- Create function to get the current JWT key
CREATE OR REPLACE FUNCTION public.get_current_jwt_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_key_data TEXT;
BEGIN
  -- Only allow this function to be called by the Supabase system
  IF NOT (current_setting('role') = 'supabase_admin' OR current_setting('role') = 'postgres') THEN
    RAISE EXCEPTION 'This function can only be called by the system';
  END IF;
  
  SELECT public.decrypt_key_data(key_data) INTO v_key_data
  FROM public.jwt_keys
  WHERE is_current = true
  LIMIT 1;
  
  IF v_key_data IS NULL THEN
    RAISE EXCEPTION 'No current JWT key found';
  END IF;
  
  RETURN v_key_data;
END;
$$;

-- Create function to get all valid JWT keys for validation
CREATE OR REPLACE FUNCTION public.get_valid_jwt_keys()
RETURNS TABLE (
  key_id TEXT,
  key_data TEXT,
  algorithm TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow this function to be called by the Supabase system
  IF NOT (current_setting('role') = 'supabase_admin' OR current_setting('role') = 'postgres') THEN
    RAISE EXCEPTION 'This function can only be called by the system';
  END IF;
  
  RETURN QUERY
  SELECT 
    k.key_id,
    public.decrypt_key_data(k.key_data) as key_data,
    k.algorithm
  FROM public.jwt_keys k
  WHERE 
    k.is_current = true 
    OR (k.expires_at IS NULL OR k.expires_at > now());
  
  RETURN;
END;
$$;

-- Create function to check if keys need rotation
CREATE OR REPLACE FUNCTION public.check_jwt_key_rotation()
RETURNS TABLE (
  key_id TEXT,
  needs_rotation BOOLEAN,
  days_until_rotation INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    k.key_id,
    (k.last_rotated_at IS NULL OR (k.last_rotated_at + k.rotation_frequency) < now()) as needs_rotation,
    CASE 
      WHEN k.last_rotated_at IS NULL THEN 0
      ELSE 
        EXTRACT(DAY FROM ((k.last_rotated_at + k.rotation_frequency) - now()))
    END::INTEGER as days_until_rotation
  FROM public.jwt_keys k
  WHERE k.is_current = true OR k.expires_at IS NULL OR k.expires_at > now();
  
  RETURN;
END;
$$;

-- Create JWT key monitoring table for security logs
CREATE TABLE IF NOT EXISTS public.jwt_key_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  key_id TEXT NOT NULL,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies for JWT key events
ALTER TABLE public.jwt_key_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view JWT key events
CREATE POLICY "Admins can view JWT key events" 
  ON public.jwt_key_events 
  FOR SELECT 
  TO authenticated 
  USING (public.is_admin(auth.uid()));

-- System can insert JWT key events
CREATE POLICY "System can insert JWT key events" 
  ON public.jwt_key_events 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Create trigger to log JWT key events
CREATE OR REPLACE FUNCTION public.log_jwt_key_event()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.jwt_key_events (event_type, key_id, performed_by)
    VALUES ('created', NEW.key_id, NEW.created_by);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_current = false AND NEW.is_current = true THEN
      INSERT INTO public.jwt_key_events (event_type, key_id, performed_by)
      VALUES ('activated', NEW.key_id, auth.uid());
    ELSIF OLD.is_current = true AND NEW.is_current = false THEN
      INSERT INTO public.jwt_key_events (event_type, key_id, performed_by)
      VALUES ('deactivated', NEW.key_id, auth.uid());
    ELSIF OLD.expires_at IS NULL AND NEW.expires_at IS NOT NULL THEN
      INSERT INTO public.jwt_key_events (event_type, key_id, performed_by)
      VALUES ('expiration_set', NEW.key_id, auth.uid());
    ELSIF OLD.last_rotated_at IS NULL AND NEW.last_rotated_at IS NOT NULL THEN
      INSERT INTO public.jwt_key_events (event_type, key_id, performed_by)
      VALUES ('rotated', NEW.key_id, auth.uid());
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.jwt_key_events (event_type, key_id, performed_by)
    VALUES ('deleted', OLD.key_id, auth.uid());
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create the trigger on the jwt_keys table
CREATE TRIGGER jwt_keys_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.jwt_keys
  FOR EACH ROW EXECUTE FUNCTION public.log_jwt_key_event();

-- Create function to initialize JWT key if none exists
CREATE OR REPLACE FUNCTION public.initialize_jwt_key()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_key_count INTEGER;
BEGIN
  -- Check if any keys exist
  SELECT COUNT(*) INTO v_key_count FROM public.jwt_keys;
  
  IF v_key_count = 0 THEN
    -- No keys exist, create an initial key
    PERFORM public.add_jwt_key(
      'primary-' || to_char(now(), 'YYYYMMDD'),
      'HS256',
      '30 days'::INTERVAL,
      true
    );
  END IF;
END;
$$;

-- Run initialization to ensure at least one key exists
SELECT public.initialize_jwt_key();
