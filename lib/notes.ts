import { get, query, run } from './db';

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

export function createNote(userId: string, data: { title: string; contentJson: string }): Note {
  const id = crypto.randomUUID();
  run('INSERT INTO notes (id, user_id, title, content_json) VALUES (?, ?, ?, ?)', [
    id,
    userId,
    data.title,
    data.contentJson,
  ]);
  const row = get<RawNote>('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
  if (!row) throw new Error('Failed to create note');
  return rowToNote(row);
}

export function getNoteById(userId: string, noteId: string): Note | null {
  const row = get<RawNote>('SELECT * FROM notes WHERE id = ? AND user_id = ?', [noteId, userId]);
  return row ? rowToNote(row) : null;
}

export function getNotesByUser(userId: string): Note[] {
  const rows = query<RawNote>('SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC', [
    userId,
  ]);
  return rows.map(rowToNote);
}

export function deleteNote(userId: string, noteId: string): boolean {
  const note = getNoteById(userId, noteId);
  if (!note) return false;
  run('DELETE FROM notes WHERE id = ? AND user_id = ?', [noteId, userId]);
  return true;
}

export function updateNote(
  userId: string,
  noteId: string,
  data: Partial<{ title: string; contentJson: string }>,
): Note | null {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.title !== undefined) {
    fields.push('title = ?');
    values.push(data.title);
  }
  if (data.contentJson !== undefined) {
    fields.push('content_json = ?');
    values.push(data.contentJson);
  }
  if (fields.length === 0) return getNoteById(userId, noteId);

  fields.push("updated_at = datetime('now')");
  values.push(noteId, userId);

  run(`UPDATE notes SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, values as string[]);
  return getNoteById(userId, noteId);
}
