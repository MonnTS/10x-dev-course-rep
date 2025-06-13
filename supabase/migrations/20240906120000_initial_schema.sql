-- Create generations table
CREATE TABLE generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    model_used TEXT NOT NULL,
    generated_count INTEGER NOT NULL,
    accepted_unedited_count INTEGER,
    accepted_edited_count INTEGER,
    source_text_hash VARCHAR NOT NULL,
    source_text_lenght INTEGER NOT NULL CHECK (source_text_lenght BETWEEN 1000 AND 10000),
    generation_time INTERVAL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create flashcards table
CREATE TABLE flashcards (
    id BIGSERIAL PRIMARY KEY,
    front VARCHAR(200) NOT NULL,
    back VARCHAR(500) NOT NULL,
    source VARCHAR NOT NULL CHECK (source IN ('ai-full', 'ai-edited', 'manual')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create error_logs table
CREATE TABLE error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    error_message TEXT NOT NULL,
    error_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX idx_flashcards_user ON flashcards(user_id);
CREATE INDEX idx_flashcards_generation ON flashcards(generation_id);
CREATE INDEX gin_flashcard_content ON flashcards USING GIN (to_tsvector('english', front || ' ' || back));
CREATE INDEX idx_generations_user ON generations(user_id);
CREATE INDEX idx_error_logs_user ON error_logs(user_id);

-- Create Auto-update trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to flashcards
CREATE TRIGGER update_flashcards_updated
BEFORE UPDATE ON flashcards
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- RLS Policies
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User flashcards access"
ON flashcards FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User generations access"
ON generations FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User error logs access"
ON error_logs FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid()); 