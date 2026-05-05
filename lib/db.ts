import { Database } from 'bun:sqlite';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

function isVercelRuntime() {
  // Vercel sets multiple env vars depending on environment/runtime.
  // We treat any of these as "running on Vercel" to avoid writing to the read-only FS.
  return Boolean(
    process.env.VERCEL ||
      process.env.VERCEL_ENV ||
      process.env.VERCEL_REGION ||
      process.env.NOW_REGION
  );
}

// On Vercel, the filesystem is read-only except for `/tmp`.
const defaultDbPath = isVercelRuntime() ? '/tmp/app.db' : 'data/app.db';
const dbPath = process.env.DB_PATH ?? defaultDbPath;

const dbDir = dirname(dbPath);
if (isVercelRuntime()) {
  if (!dbPath.startsWith('/tmp/')) {
    throw new Error(
      `Invalid DB_PATH on Vercel: "${dbPath}". Vercel functions can only write to "/tmp". ` +
        `Set DB_PATH to a "/tmp/..." path (ephemeral) or use an external DB for persistence.`
    );
  }
  mkdirSync(dbDir, { recursive: true });
} else {
  mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath, { create: true });
db.run('PRAGMA journal_mode = WAL;');
db.run('PRAGMA foreign_keys = ON;');

db.exec(`
  CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    emailVerified INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expiresAt TEXT NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES user(id)
  );

  CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    accessToken TEXT,
    refreshToken TEXT,
    accessTokenExpiresAt TEXT,
    refreshTokenExpiresAt TEXT,
    scope TEXT,
    idToken TEXT,
    password TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES user(id)
  );

  CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content_json TEXT NOT NULL,
    is_public INTEGER NOT NULL DEFAULT 0,
    public_slug TEXT UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES user(id)
  );

  CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
  CREATE INDEX IF NOT EXISTS idx_notes_public_slug ON notes(public_slug);
  CREATE INDEX IF NOT EXISTS idx_notes_is_public ON notes(is_public);
`);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BindParams = any[];

export function query<T>(sql: string, params?: unknown[]): T[] {
  const stmt = db.query<T, BindParams>(sql);
  return params ? stmt.all(...(params as BindParams)) : stmt.all();
}

export function get<T>(sql: string, params?: unknown[]): T | undefined {
  const stmt = db.query<T, BindParams>(sql);
  return (params ? stmt.get(...(params as BindParams)) : stmt.get()) ?? undefined;
}

export function run(sql: string, params?: unknown[]): void {
  db.run(sql, (params ?? []) as BindParams);
}
