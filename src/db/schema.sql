/**
 * Database Schema for KJV Bible App
 * 
 * This file contains SQL migrations for setting up the PostgreSQL database.
 * Run these migrations to initialize the database structure.
 * 
 * Usage:
 *   psql -U kjv_user -d kjv_bible -f src/db/schema.sql
 */

-- Enable UUID extension for better ID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Users Table
-- Stores user account information from OAuth providers
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('google', 'github', 'local')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups by email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index for faster lookups by provider
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider);

-- ============================================================================
-- Sessions/Tokens Table
-- Stores authentication tokens for user sessions
-- ============================================================================
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);

-- Index for user's sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- ============================================================================
-- Bible Text Table
-- Stores the complete King James Version Bible text
-- Optimized for reading chapters and verses
-- ============================================================================
CREATE TABLE IF NOT EXISTS bible_books (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    testament VARCHAR(10) NOT NULL CHECK (testament IN ('Old', 'New')),
    chapters INTEGER NOT NULL,
    abbreviation VARCHAR(10)
);

-- Insert book data
INSERT INTO bible_books (name, testament, chapters, abbreviation) VALUES
    -- Old Testament
    ('Genesis', 'Old', 50, 'Gen'),
    ('Exodus', 'Old', 40, 'Exo'),
    ('Leviticus', 'Old', 27, 'Lev'),
    ('Numbers', 'Old', 36, 'Num'),
    ('Deuteronomy', 'Old', 34, 'Deu'),
    ('Joshua', 'Old', 24, 'Jos'),
    ('Judges', 'Old', 21, 'Jdg'),
    ('Ruth', 'Old', 4, 'Rut'),
    ('1 Samuel', 'Old', 31, '1Sa'),
    ('2 Samuel', 'Old', 24, '2Sa'),
    ('1 Kings', 'Old', 22, '1Ki'),
    ('2 Kings', 'Old', 25, '2Ki'),
    ('1 Chronicles', 'Old', 29, '1Ch'),
    ('2 Chronicles', 'Old', 36, '2Ch'),
    ('Ezra', 'Old', 10, 'Ezr'),
    ('Nehemiah', 'Old', 13, 'Neh'),
    ('Esther', 'Old', 10, 'Est'),
    ('Job', 'Old', 42, 'Job'),
    ('Psalms', 'Old', 150, 'Psa'),
    ('Proverbs', 'Old', 31, 'Pro'),
    ('Ecclesiastes', 'Old', 12, 'Ecc'),
    ('Song of Solomon', 'Old', 8, 'Son'),
    ('Isaiah', 'Old', 66, 'Isa'),
    ('Jeremiah', 'Old', 52, 'Jer'),
    ('Lamentations', 'Old', 5, 'Lam'),
    ('Ezekiel', 'Old', 48, 'Eze'),
    ('Daniel', 'Old', 12, 'Dan'),
    ('Hosea', 'Old', 14, 'Hos'),
    ('Joel', 'Old', 3, 'Joe'),
    ('Amos', 'Old', 9, 'Amo'),
    ('Obadiah', 'Old', 1, 'Oba'),
    ('Jonah', 'Old', 4, 'Jon'),
    ('Micah', 'Old', 7, 'Mic'),
    ('Nahum', 'Old', 3, 'Nah'),
    ('Habakkuk', 'Old', 3, 'Hab'),
    ('Zephaniah', 'Old', 3, 'Zep'),
    ('Haggai', 'Old', 2, 'Hag'),
    ('Zechariah', 'Old', 14, 'Zec'),
    ('Malachi', 'Old', 4, 'Mal'),
    -- New Testament
    ('Matthew', 'New', 28, 'Mat'),
    ('Mark', 'New', 16, 'Mar'),
    ('Luke', 'New', 24, 'Luk'),
    ('John', 'New', 21, 'Jhn'),
    ('Acts', 'New', 28, 'Act'),
    ('Romans', 'New', 16, 'Rom'),
    ('1 Corinthians', 'New', 16, '1Co'),
    ('2 Corinthians', 'New', 13, '2Co'),
    ('Galatians', 'New', 6, 'Gal'),
    ('Ephesians', 'New', 6, 'Eph'),
    ('Philippians', 'New', 4, 'Phi'),
    ('Colossians', 'New', 4, 'Col'),
    ('1 Thessalonians', 'New', 5, '1Th'),
    ('2 Thessalonians', 'New', 3, '2Th'),
    ('1 Timothy', 'New', 6, '1Ti'),
    ('2 Timothy', 'New', 4, '2Ti'),
    ('Titus', 'New', 3, 'Tit'),
    ('Philemon', 'New', 1, 'Phm'),
    ('Hebrews', 'New', 13, 'Heb'),
    ('James', 'New', 5, 'Jam'),
    ('1 Peter', 'New', 5, '1Pe'),
    ('2 Peter', 'New', 3, '2Pe'),
    ('1 John', 'New', 5, '1Jn'),
    ('2 John', 'New', 1, '2Jn'),
    ('3 John', 'New', 1, '3Jn'),
    ('Jude', 'New', 1, 'Jud'),
    ('Revelation', 'New', 22, 'Rev')
ON CONFLICT (name) DO NOTHING;

-- Create index for book lookups
CREATE INDEX IF NOT EXISTS idx_bible_books_name ON bible_books(name);

-- ============================================================================
-- Bible Verses Table
-- Stores individual verses with foreign key to books
-- Partitioned by book for better performance (optional in production)
-- ============================================================================
CREATE TABLE IF NOT EXISTS bible_verses (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES bible_books(id) ON DELETE CASCADE,
    book_name VARCHAR(100) NOT NULL,
    chapter INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    text TEXT NOT NULL,
    CONSTRAINT unique_verse UNIQUE (book_name, chapter, verse_number)
);

-- Composite index for fast chapter retrieval
CREATE INDEX IF NOT EXISTS idx_bible_verses_book_chapter 
    ON bible_verses(book_name, chapter, verse_number);

-- Index for book lookups
CREATE INDEX IF NOT EXISTS idx_bible_verses_book ON bible_verses(book_name);

-- ============================================================================
-- User Preferences Table
-- Stores user-specific settings like theme, font size, etc.
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
    font_size INTEGER DEFAULT 16,
    last_read_book VARCHAR(100),
    last_read_chapter INTEGER,
    last_read_verse INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for user preference lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- ============================================================================
-- Bookmarks Table
-- Allows users to bookmark specific verses
-- ============================================================================
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_name VARCHAR(100) NOT NULL,
    chapter INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_bookmark UNIQUE (user_id, book_name, chapter, verse_number)
);

-- Index for user's bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);

-- Composite index for sorting bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_book ON bookmarks(user_id, book_name, chapter, verse_number);

-- ============================================================================
-- Reading History Table
-- Tracks user reading progress for analytics and resumption
-- ============================================================================
CREATE TABLE IF NOT EXISTS reading_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_name VARCHAR(100) NOT NULL,
    chapter INTEGER NOT NULL,
    verse_number INTEGER,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    duration_seconds INTEGER
);

-- Index for user's reading history
CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);

-- Index for recent reading
CREATE INDEX IF NOT EXISTS idx_reading_history_read_at ON reading_history(read_at);

-- ============================================================================
-- Function to update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Grant permissions to kjv_user
-- ============================================================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO kjv_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO kjv_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO kjv_user;

-- ============================================================================
-- Sample Data (Optional - for development/testing)
-- ============================================================================
-- Uncomment below to insert sample Genesis 1 verses
/*
INSERT INTO bible_verses (book_id, book_name, chapter, verse_number, text)
SELECT 
    bb.id,
    'Genesis',
    1,
    v.num,
    v.text
FROM bible_books bb,
LATERAL (
    VALUES 
        (1, 'In the beginning God created the heaven and the earth.'),
        (2, 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.'),
        (3, 'And God said, Let there be light: and there was light.'),
        (4, 'And God saw the light, that it was good: and God divided the light from the darkness.'),
        (5, 'And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.')
) AS v(num, text)
WHERE bb.name = 'Genesis'
ON CONFLICT (book_name, chapter, verse_number) DO NOTHING;
*/
