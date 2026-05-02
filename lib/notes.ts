import { get, run } from "./db";

export type Note = {
  id: string;
  userId: string;
  title: string;
  contentJson: string;
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
};

type RawNote = {
  id: string;
  user_id: string;
  title: string;
  content_json: string;
  is_public: number;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
};

function rowToNote(row: RawNote): Note {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    contentJson: row.content_json,
    isPublic: row.is_public === 1,
    publicSlug: row.public_slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createNote(
  userId: string,
  data: { title: string; contentJson: string }
): Note {
  const id = crypto.randomUUID();
  run(
    "INSERT INTO notes (id, user_id, title, content_json) VALUES (?, ?, ?, ?)",
    [id, userId, data.title, data.contentJson]
  );
  const row = get<RawNote>(
    "SELECT * FROM notes WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  if (!row) throw new Error("Failed to create note");
  return rowToNote(row);
}
