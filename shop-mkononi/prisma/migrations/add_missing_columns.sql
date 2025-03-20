-- WARNING: This script will delete all existing user data
-- Make sure you have a backup before running this in production

-- First, drop existing tables in the correct order to avoid foreign key constraints
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with all required fields
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  email_verified TIMESTAMP WITH TIME ZONE,
  name TEXT,
  image TEXT,
  password TEXT,
  
  -- Phone and verification
  phone TEXT UNIQUE,
  phone_verified BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  
  -- Role management
  role TEXT DEFAULT 'BUYER',
  requested_role TEXT,
  
  -- ID verification
  id_number TEXT,
  id_front_image TEXT,
  id_back_image TEXT,
  selfie_image TEXT,
  verification_status TEXT DEFAULT 'PENDING',
  verification_notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create NextAuth related tables
CREATE TABLE public.accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, provider_account_id)
);

CREATE TABLE public.sessions (
  id TEXT PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE public.verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(identifier, token)
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_verification_tokens_identifier ON public.verification_tokens(identifier);

-- Optional: Insert a test admin user
-- INSERT INTO users (id, email, name, role, is_verified, verification_status)
-- VALUES ('admin-id', 'admin@example.com', 'Admin User', 'ADMIN', true, 'APPROVED');
