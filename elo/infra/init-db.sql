-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Audit Logs Table (Immutable append-only)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    domain VARCHAR(50) NOT NULL,
    actor VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    security_level VARCHAR(20) NOT NULL,
    tool_name VARCHAR(100),
    parameters JSONB,
    approval_status VARCHAR(50),
    execution_result JSONB,
    error_message TEXT,
    client_ip VARCHAR(50)
);

-- Index for fast audit queries
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_domain ON audit_logs(domain);
CREATE INDEX IF NOT EXISTS idx_audit_security_level ON audit_logs(security_level);

-- Semantic Memory Table
CREATE TABLE IF NOT EXISTS semantic_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    domain VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding vector(768)
);

CREATE INDEX IF NOT EXISTS idx_semantic_domain ON semantic_memory(domain);

-- Active Approval Requests Table
CREATE TABLE IF NOT EXISTS approval_requests (
    id VARCHAR(64) PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    tool_name VARCHAR(100) NOT NULL,
    security_level VARCHAR(20) NOT NULL,
    parameters JSONB NOT NULL,
    explanation TEXT NOT NULL,
    diff_preview TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    approved_by VARCHAR(100),
    resolved_at TIMESTAMPTZ
);
