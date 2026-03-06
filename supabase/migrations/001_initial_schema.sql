-- PROFILES (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'creator', 'pro', 'agency')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    assets_used_this_month INT DEFAULT 0,
    billing_cycle_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BRAND VOICES
CREATE TABLE brand_voices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    voice_description TEXT NOT NULL,
    example_content TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SOURCE ASSETS (uploaded content)
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('audio', 'video', 'text', 'url')),
    source_url TEXT,
    file_size_bytes BIGINT,
    duration_seconds INT,
    transcript TEXT,
    status TEXT DEFAULT 'uploading' CHECK (status IN (
        'uploading', 'uploaded', 'transcribing', 'generating', 'complete', 'failed'
    )),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OUTPUTS (generated platform content)
CREATE TABLE outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN (
        'linkedin', 'twitter', 'newsletter', 'instagram', 'youtube_shorts'
    )),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    version INT DEFAULT 1,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- USAGE LOGS (cost tracking)
CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    api_provider TEXT NOT NULL,
    tokens_used INT,
    cost_usd DECIMAL(10,6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users manage own voices" ON brand_voices FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own assets" ON assets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own outputs" ON outputs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own usage" ON usage_logs FOR SELECT USING (auth.uid() = user_id);

-- INDEXES
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_outputs_asset_id ON outputs(asset_id);
CREATE INDEX idx_outputs_platform ON outputs(platform);
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);

-- FUNCTION: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- FUNCTION: Increment assets used
CREATE OR REPLACE FUNCTION increment_assets_used(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET assets_used_this_month = assets_used_this_month + 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
