/**
 * PostgreSQL Database Connection and Queries for KJV Bible App
 * 
 * This module provides database connectivity and query functions using Bun's
 * native PostgreSQL support. It replaces the in-memory mock database with
 * persistent storage.
 * 
 * @module db/database
 */

import postgres from 'postgres';

// ============================================================================
// Database Configuration
// ============================================================================

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'kjv_bible',
  username: process.env.DB_USER || 'kjv_user',
  password: process.env.DB_PASSWORD || 'kjv_password',
};

// Create database connection pool
const sql = postgres(dbConfig);

// Test connection on module load
(async () => {
  try {
    await sql`SELECT 1`;
    console.log('✅ PostgreSQL connected successfully');
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
  }
})();

// ============================================================================
// User Management Functions
// ============================================================================

/**
 * Create or update a user from OAuth provider
 */
export async function upsertUser(userData: {
  email: string;
  name: string;
  avatar_url?: string;
  provider: 'google' | 'github' | 'local';
}): Promise<any> {
  const result = await sql`
    INSERT INTO users (email, name, avatar_url, provider)
    VALUES (${userData.email}, ${userData.name}, ${userData.avatar_url || null}, ${userData.provider})
    ON CONFLICT (email) DO UPDATE SET
      name = EXCLUDED.name,
      avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  
  return result[0];
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<any> {
  const result = await sql`
    SELECT * FROM users WHERE id = ${userId}
  `;
  
  return result[0] || null;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<any> {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email}
  `;
  
  return result[0] || null;
}

// ============================================================================
// Session Management Functions
// ============================================================================

/**
 * Create a new session token
 */
export async function createSession(userId: string, tokenHash: string, expiresAt: Date): Promise<any> {
  const result = await sql`
    INSERT INTO sessions (user_id, token_hash, expires_at)
    VALUES (${userId}, ${tokenHash}, ${expiresAt})
    RETURNING *
  `;
  
  return result[0];
}

/**
 * Get session by token hash
 */
export async function getSessionByToken(tokenHash: string): Promise<any> {
  const result = await sql`
    SELECT s.*, u.* 
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token_hash = ${tokenHash}
      AND s.expires_at > NOW()
  `;
  
  return result[0] || null;
}

/**
 * Update session last used timestamp
 */
export async function updateSessionLastUsed(tokenHash: string): Promise<void> {
  await sql`
    UPDATE sessions 
    SET last_used_at = CURRENT_TIMESTAMP 
    WHERE token_hash = ${tokenHash}
  `;
}

/**
 * Delete expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await sql`
    DELETE FROM sessions WHERE expires_at < NOW()
  `;
  
  return result.count;
}

// ============================================================================
// Bible Text Functions
// ============================================================================

/**
 * Get a Bible chapter with all verses
 */
export async function getBibleChapter(bookName: string, chapter: number): Promise<any> {
  // First verify the book exists
  const bookResult = await sql`
    SELECT * FROM bible_books WHERE name = ${bookName}
  `;
  
  if (!bookResult || bookResult.length === 0) {
    return null;
  }
  
  const book = bookResult[0];
  
  // Get all verses for this chapter
  const versesResult = await sql`
    SELECT verse_number, text 
    FROM bible_verses 
    WHERE book_name = ${bookName} 
      AND chapter = ${chapter}
    ORDER BY verse_number
  `;
  
  if (!versesResult || versesResult.length === 0) {
    return null;
  }
  
  return {
    book: bookName,
    chapter: chapter,
    testament: book.testament,
    verses: versesResult.map((row: any) => ({
      verse: row.verse_number,
      text: row.text
    }))
  };
}

/**
 * Get a specific Bible verse
 */
export async function getBibleVerse(bookName: string, chapter: number, verseNumber: number): Promise<any> {
  const result = await sql`
    SELECT v.*, b.testament
    FROM bible_verses v
    JOIN bible_books b ON v.book_id = b.id
    WHERE v.book_name = ${bookName}
      AND v.chapter = ${chapter}
      AND v.verse_number = ${verseNumber}
  `;
  
  return result[0] || null;
}

/**
 * Search Bible text by keyword
 */
export async function searchBibleText(keyword: string, limit: number = 50): Promise<any[]> {
  const results = await sql`
    SELECT v.book_name, v.chapter, v.verse_number, v.text, b.testament
    FROM bible_verses v
    JOIN bible_books b ON v.book_id = b.id
    WHERE v.text ILIKE ${`%${keyword}%`}
    ORDER BY b.id, v.chapter, v.verse_number
    LIMIT ${limit}
  `;
  
  return results;
}

/**
 * Get list of all Bible books
 */
export async function getAllBibleBooks(): Promise<any[]> {
  const result = await sql`
    SELECT * FROM bible_books ORDER BY id
  `;
  
  return result;
}

// ============================================================================
// User Preferences Functions
// ============================================================================

/**
 * Get or create user preferences
 */
export async function getUserPreferences(userId: string): Promise<any> {
  const result = await sql`
    SELECT * FROM user_preferences WHERE user_id = ${userId}
  `;
  
  return result[0] || null;
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string, 
  preferences: {
    theme?: string;
    font_size?: number;
    last_read_book?: string;
    last_read_chapter?: number;
    last_read_verse?: number;
  }
): Promise<any> {
  const updates: string[] = [];
  const values: any[] = [];
  
  if (preferences.theme !== undefined) {
    updates.push(`theme = ${preferences.theme}`);
  }
  if (preferences.font_size !== undefined) {
    updates.push(`font_size = ${preferences.font_size}`);
  }
  if (preferences.last_read_book !== undefined) {
    updates.push(`last_read_book = ${preferences.last_read_book}`);
  }
  if (preferences.last_read_chapter !== undefined) {
    updates.push(`last_read_chapter = ${preferences.last_read_chapter}`);
  }
  if (preferences.last_read_verse !== undefined) {
    updates.push(`last_read_verse = ${preferences.last_read_verse}`);
  }
  
  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  
  const result = await sql`
    INSERT INTO user_preferences (user_id, theme, font_size, last_read_book, last_read_chapter, last_read_verse)
    VALUES (${userId}, ${preferences.theme || 'light'}, ${preferences.font_size || 16}, 
            ${preferences.last_read_book || null}, ${preferences.last_read_chapter || null}, 
            ${preferences.last_read_verse || null})
    ON CONFLICT (user_id) DO UPDATE SET
      ${sql.join(sql.raw(updates.join(', ')))}
    RETURNING *
  `;
  
  return result[0];
}

// ============================================================================
// Bookmark Functions
// ============================================================================

/**
 * Add a bookmark
 */
export async function addBookmark(
  userId: string,
  bookName: string,
  chapter: number,
  verseNumber: number,
  note?: string
): Promise<any> {
  const result = await sql`
    INSERT INTO bookmarks (user_id, book_name, chapter, verse_number, note)
    VALUES (${userId}, ${bookName}, ${chapter}, ${verseNumber}, ${note || null})
    ON CONFLICT (user_id, book_name, chapter, verse_number) DO UPDATE SET
      note = EXCLUDED.note,
      created_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  
  return result[0];
}

/**
 * Get all bookmarks for a user
 */
export async function getUserBookmarks(userId: string): Promise<any[]> {
  const result = await sql`
    SELECT * FROM bookmarks 
    WHERE user_id = ${userId}
    ORDER BY book_name, chapter, verse_number
  `;
  
  return result;
}

/**
 * Remove a bookmark
 */
export async function removeBookmark(
  userId: string,
  bookName: string,
  chapter: number,
  verseNumber: number
): Promise<void> {
  await sql`
    DELETE FROM bookmarks 
    WHERE user_id = ${userId}
      AND book_name = ${bookName}
      AND chapter = ${chapter}
      AND verse_number = ${verseNumber}
  `;
}

// ============================================================================
// Reading History Functions
// ============================================================================

/**
 * Record reading history
 */
export async function recordReadingHistory(
  userId: string,
  bookName: string,
  chapter: number,
  verseNumber?: number,
  durationSeconds?: number
): Promise<any> {
  const result = await sql`
    INSERT INTO reading_history (user_id, book_name, chapter, verse_number, duration_seconds)
    VALUES (${userId}, ${bookName}, ${chapter}, ${verseNumber || null}, ${durationSeconds || null})
    RETURNING *
  `;
  
  return result[0];
}

/**
 * Get recent reading history for a user
 */
export async function getRecentReadingHistory(userId: string, limit: number = 10): Promise<any[]> {
  const result = await sql`
    SELECT * FROM reading_history 
    WHERE user_id = ${userId}
    ORDER BY read_at DESC
    LIMIT ${limit}
  `;
  
  return result;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Hash a token using SHA-256
 */
export function hashToken(token: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a random token
 */
export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// Export the db client for raw queries if needed
export { sql };
