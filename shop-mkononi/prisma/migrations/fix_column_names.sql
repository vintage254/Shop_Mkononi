-- Fix the column name mismatch for isVerified
-- If the column already exists, this will be a no-op

-- First check if is_verified column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'is_verified'
    ) THEN
        -- Add the is_verified column
        ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;
END
$$;

-- Copy data from isVerified to is_verified if both exist and isVerified has data
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'isVerified'
    ) AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'is_verified'
    ) THEN
        -- Update is_verified with values from isVerified
        UPDATE users SET is_verified = "isVerified";
    END IF;
END
$$;

-- Drop the isVerified column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'isVerified'
    ) THEN
        ALTER TABLE users DROP COLUMN "isVerified";
    END IF;
END
$$;
