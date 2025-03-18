-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('BUYER', 'SELLER', 'ADMIN');
CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE order_status AS ENUM ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE,
    role user_role DEFAULT 'BUYER',
    is_verified BOOLEAN DEFAULT false,
    id_image TEXT,
    id_number TEXT,
    verification_status verification_status DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create shops table
CREATE TABLE public.shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    logo_url TEXT,
    banner_url TEXT,
    primary_color TEXT DEFAULT '#0F766E',
    secondary_color TEXT DEFAULT '#FFFFFF',
    accent_color TEXT DEFAULT '#F59E0B',
    font_family TEXT DEFAULT 'Inter',
    theme_id UUID,
    layout_config JSONB,
    custom_css JSONB,
    transport_options JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    images TEXT[],
    category TEXT NOT NULL,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    transport_method TEXT,
    transport_cost DECIMAL(10,2),
    status order_status DEFAULT 'PENDING',
    blockchain_tx_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create themes table
CREATE TABLE public.themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT NOT NULL,
    properties JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Shops policies
CREATE POLICY "Anyone can view shops"
    ON public.shops FOR SELECT
    USING (true);

CREATE POLICY "Sellers can create their own shop"
    ON public.shops FOR INSERT
    WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own shop"
    ON public.shops FOR UPDATE
    USING (auth.uid() = seller_id);

-- Products policies
CREATE POLICY "Anyone can view products"
    ON public.products FOR SELECT
    USING (true);

CREATE POLICY "Sellers can create products in their shop"
    ON public.products FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.shops
            WHERE id = shop_id AND seller_id = auth.uid()
        )
    );

CREATE POLICY "Sellers can update their own products"
    ON public.products FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.shops
            WHERE id = shop_id AND seller_id = auth.uid()
        )
    );

-- Orders policies
CREATE POLICY "Users can view their own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = buyer_id);

CREATE POLICY "Users can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = buyer_id);

-- Themes policies
CREATE POLICY "Anyone can view themes"
    ON public.themes FOR SELECT
    USING (true);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shops_updated_at
    BEFORE UPDATE ON public.shops
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_themes_updated_at
    BEFORE UPDATE ON public.themes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 