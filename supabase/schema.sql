-- SQL Schema configuration for Supabase Database
-- Ensure all tables use the CMS_ prefix as requested

-- 1. CMS_users: Table for user profiles linked to Supabase Auth users
CREATE TABLE IF NOT EXISTS public.CMS_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.CMS_users ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies for CMS_users
CREATE POLICY "Users can view their own profile" ON public.CMS_users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.CMS_users
    FOR UPDATE USING (auth.uid() = id);

-- Database Trigger to automatically create a profile in CMS_users when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.CMS_users (id, email, full_name)
    VALUES (
        new.id, 
        new.email, 
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. CMS_meals: Table to store canteen meals menu
CREATE TABLE IF NOT EXISTS public.CMS_meals (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    nutrition TEXT NOT NULL,
    time TEXT NOT NULL, -- e.g. Breakfast, Lunch, Dinner
    likes INTEGER DEFAULT 0 NOT NULL,
    dislikes INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.CMS_meals ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies for CMS_meals
CREATE POLICY "Anyone can read meals" ON public.CMS_meals
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can rate meals" ON public.CMS_meals
    FOR UPDATE USING (auth.role() = 'authenticated');


-- 3. CMS_meal_ratings: Table to track ratings and prevent duplicate votes
CREATE TABLE IF NOT EXISTS public.CMS_meal_ratings (
    id SERIAL PRIMARY KEY,
    meal_id INTEGER REFERENCES public.CMS_meals(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.CMS_users(id) ON DELETE CASCADE NOT NULL,
    rating_type TEXT CHECK (rating_type IN ('like', 'dislike')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(meal_id, user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.CMS_meal_ratings ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies for CMS_meal_ratings
CREATE POLICY "Anyone can view ratings" ON public.CMS_meal_ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can insert/modify their own ratings" ON public.CMS_meal_ratings
    FOR ALL USING (auth.uid() = user_id);


-- 4. CMS_feedback: Table to store user canteen feedback
CREATE TABLE IF NOT EXISTS public.CMS_feedback (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.CMS_users(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.CMS_feedback ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies for CMS_feedback
CREATE POLICY "Users can view their own feedback" ON public.CMS_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert feedback" ON public.CMS_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);
