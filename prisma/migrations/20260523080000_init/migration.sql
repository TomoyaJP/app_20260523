CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    url TEXT NOT NULL,
    platform TEXT NOT NULL,
    target_user TEXT,
    use_case TEXT,
    solved_problem TEXT,
    suitable_for TEXT,
    not_suitable_for TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    developer_contact TEXT,
    search_text TEXT,
    embedding vector(1536),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE search_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text TEXT NOT NULL,
    normalized_query TEXT,
    category_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    matched_app_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    top_similarity_score DOUBLE PRECISION,
    is_secret BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE unmet_needs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    representative_query TEXT NOT NULL,
    summary TEXT,
    category_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    interested_count INT NOT NULL DEFAULT 1,
    related_app_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    embedding vector(1536),
    ai_target_user_estimate TEXT,
    ai_suggested_features TEXT,
    ai_gap_notes TEXT,
    developer_idea_notes TEXT
);

CREATE TABLE unmet_need_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unmet_need_id UUID NOT NULL REFERENCES unmet_needs (id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_unmet_needs_category ON unmet_needs USING GIN (category_tags);
CREATE INDEX idx_apps_tags ON apps USING GIN (tags);
