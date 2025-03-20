-- Add requested_role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS requested_role TEXT;

-- Add ID Front Image column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS id_front_image TEXT;

-- Add ID Back Image column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS id_back_image TEXT;

-- Add Selfie Image column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS selfie_image TEXT;

-- Add ID Number column to users table (if it doesn't exist)
ALTER TABLE users ADD COLUMN IF NOT EXISTS id_number TEXT;

-- Add verification_notes column to users table (if it doesn't exist)
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Add verified_at column to users table (if it doesn't exist)
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Make sure verification_status column exists with proper type and default
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'verification_status') THEN
        ALTER TABLE users ADD COLUMN verification_status TEXT DEFAULT 'PENDING';
    END IF;
END
$$;

-- Ensure is_verified column exists with proper default
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_verified') THEN
        ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;
END
$$;

-- Add comment explaining the schema changes
COMMENT ON TABLE users IS 'User accounts with added seller verification fields';
