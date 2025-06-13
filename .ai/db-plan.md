# Database Schema for Flashcards MVP

## 1. Tables Structure

### 1.0 Users

> Note: This table is managed by Supabase Auth system (auth.users).

- **id**: UUID PRIMARY KEY
- **email**: VARCHAR(255)
- **encypted_password**: VARCHAR NOT NULL
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT now()
- **confirmed_at**: TIMESTAMPTZ

### 1.1 Flashcards

- **id**: BIGSERIAL PRIMARY KEY
- **front**: VARCHAR(200) NOT NULL
- **back**: VARCHAR(500) NOT NULL
- **source**: VARCHAR NOT NULL CHECK (source IN ('ai-full', 'ai-edited', 'manual'))
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT now()
- **updated_at**: TIMESTAMPTZ NOT NULL DEFAULT now()
- **generation_id**: UUID REFERENCES generations(id) ON DELETE SET NULL
- **user_id**: UUID NOT NULL REFERENCES users(id)

### 1.2 Error Logs

- **id**: UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- **user_id**: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- **error_message**: TEXT NOT NULL
- **error_time**: TIMESTAMPTZ NOT NULL DEFAULT NOW()

### 1.3 Generations

- **id**: UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- **user_id**: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- **model_used**: TEXT NOT NULL
- **generated_count**: INTEGER NOT NULL
- **accepted_unedited_count**: INTEGER NULLABLE
- **accepted_edited_count**: INTEGER NULLABLE
- **source_text_hash**: VARCHAR NOT NULL
- **source_text_lenght**: INTEGER NOT NULL CHECK (source_text_lenght BETWEEN 1000 AND 10000)
- **generation_time**: INTERVAL
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()

## 2. Relationships

- **users (1) → flashcards (N)**  
  One user can have multiple flashcards
- **users (1) → error_logs (N)**  
  One user can have multiple error logs
- **users (1) → generations (N)**  
  One user can have multiple generation processes
- **generations (1) → flashcards (N)**  
  One generation can produce multiple flashcards

## 3. Indexes

```sql
CREATE INDEX idx_flashcards_user ON flashcards(user_id);
CREATE INDEX idx_flashcards_generation ON flashcards(generation_id);
CREATE INDEX gin_flashcard_content ON flashcards USING GIN (to_tsvector('english', front || ' ' || back));
CREATE INDEX idx_generations_user ON generations(user_id);
CREATE INDEX idx_error_logs_user ON error_logs(user_id);
```

## 4. PostgreSQL Features

```sql
-- Custom ENUM type
CREATE TYPE difficulty_rating AS ENUM ('hard', 'medium', 'easy');

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_flashcards_updated
BEFORE UPDATE ON flashcards
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- RLS Policies
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User flashcards access"
ON flashcards FOR ALL USING (user_id = auth.uid());

ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User generations access"
ON generations FOR ALL USING (user_id = auth.uid());

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User error logs access"
ON error_logs FOR ALL USING (user_id = auth.uid());
```

## 5. Implementation Notes

1. **Security**:
   - All user data access controlled through RLS policies
   - Supabase Auth handles user authentication
2. **Performance**:
   - UUIDs for distributed systems readiness
   - GIN index for full-text search on flashcard content
   - Indexes on foreign keys for efficient joins
   - TOAST compression for large text fields
3. **Data Integrity**:
   - ON DELETE CASCADE for user-related data
   - ON DELETE SET NULL for generation references in flashcards
   - Automatic timestamp management
   - Source validation through CHECK constraints
   - Text length constraints on flashcard content
4. **Scalability**:
   - Ready for partitioning by user_id if needed
   - Index coverage for common query patterns
   - Horizontal scaling possible through Supabase
5. **AI Integration**:
   - Tracking of AI-generated vs manual content through source field
   - Generation metrics tracking for optimization
   - Hash-based deduplication of source texts
