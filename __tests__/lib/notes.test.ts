import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => ({
  query: vi.fn(),
  get: vi.fn(),
  run: vi.fn(),
}));

import { query, get, run } from '@/lib/db';
import {
  createNote,
  deleteNote,
  getNoteById,
  getNoteByPublicSlug,
  getNotesByUser,
  setNotePublic,
  updateNote,
} from '@/lib/notes';

const RAW = {
  id: 'note-1',
  user_id: 'user-1',
  title: 'Test',
  content_json: '{"type":"doc"}',
  is_public: 0,
  public_slug: null,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createNote', () => {
  it('inserts a note and returns it mapped to camelCase', () => {
    vi.mocked(get).mockReturnValue(RAW as any);
    const note = createNote('user-1', { title: 'Test', contentJson: '{"type":"doc"}' });
    expect(vi.mocked(run)).toHaveBeenCalledWith(
      'INSERT INTO notes (id, user_id, title, content_json) VALUES (?, ?, ?, ?)',
      expect.arrayContaining(['user-1', 'Test', '{"type":"doc"}']),
    );
    expect(note.title).toBe('Test');
    expect(note.userId).toBe('user-1');
    expect(note.isPublic).toBe(false);
  });

  it('throws when the row cannot be fetched after insert', () => {
    vi.mocked(get).mockReturnValue(undefined);
    expect(() => createNote('user-1', { title: 'Test', contentJson: '{}' })).toThrow(
      'Failed to create note',
    );
  });
});

describe('getNoteById', () => {
  it('returns a mapped Note when the row exists', () => {
    vi.mocked(get).mockReturnValue(RAW as any);
    const note = getNoteById('user-1', 'note-1');
    expect(note).not.toBeNull();
    expect(note!.id).toBe('note-1');
    expect(note!.userId).toBe('user-1');
    expect(note!.contentJson).toBe('{"type":"doc"}');
  });

  it('returns null when the row does not exist', () => {
    vi.mocked(get).mockReturnValue(undefined);
    expect(getNoteById('user-1', 'missing')).toBeNull();
  });

  it('enforces ownership via user_id in WHERE clause', () => {
    vi.mocked(get).mockReturnValue(undefined);
    getNoteById('user-1', 'note-1');
    expect(vi.mocked(get)).toHaveBeenCalledWith(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      ['note-1', 'user-1'],
    );
  });
});

describe('getNotesByUser', () => {
  it('returns empty array when user has no notes', () => {
    vi.mocked(query).mockReturnValue([]);
    expect(getNotesByUser('user-1')).toEqual([]);
  });

  it('returns mapped notes for the user', () => {
    vi.mocked(query).mockReturnValue([RAW, { ...RAW, id: 'note-2' }] as any);
    const notes = getNotesByUser('user-1');
    expect(notes).toHaveLength(2);
    expect(notes[0].id).toBe('note-1');
    expect(notes[1].id).toBe('note-2');
  });

  it('queries with user_id filter', () => {
    vi.mocked(query).mockReturnValue([]);
    getNotesByUser('user-1');
    expect(vi.mocked(query)).toHaveBeenCalledWith(expect.stringContaining('WHERE user_id = ?'), [
      'user-1',
    ]);
  });
});

describe('deleteNote', () => {
  it('returns false and skips DELETE when note does not exist', () => {
    vi.mocked(get).mockReturnValue(undefined);
    expect(deleteNote('user-1', 'missing')).toBe(false);
    expect(vi.mocked(run)).not.toHaveBeenCalled();
  });

  it('returns true and runs DELETE when note exists', () => {
    vi.mocked(get).mockReturnValue(RAW as any);
    expect(deleteNote('user-1', 'note-1')).toBe(true);
    expect(vi.mocked(run)).toHaveBeenCalledWith('DELETE FROM notes WHERE id = ? AND user_id = ?', [
      'note-1',
      'user-1',
    ]);
  });
});

describe('updateNote', () => {
  it('does not run UPDATE when data is empty', () => {
    vi.mocked(get).mockReturnValue(RAW as any);
    updateNote('user-1', 'note-1', {});
    expect(vi.mocked(run)).not.toHaveBeenCalled();
  });

  it('builds SQL with only title when only title is provided', () => {
    vi.mocked(get).mockReturnValue({ ...RAW, title: 'New Title' } as any);
    updateNote('user-1', 'note-1', { title: 'New Title' });
    const sql = vi.mocked(run).mock.calls[0][0] as string;
    expect(sql).toContain('title = ?');
    expect(sql).not.toContain('content_json');
  });

  it('builds SQL with only content_json when only contentJson is provided', () => {
    vi.mocked(get).mockReturnValue(RAW as any);
    updateNote('user-1', 'note-1', { contentJson: '{}' });
    const sql = vi.mocked(run).mock.calls[0][0] as string;
    expect(sql).toContain('content_json = ?');
    expect(sql).not.toContain('title = ?');
  });

  it('includes both columns in SQL when both fields are provided', () => {
    vi.mocked(get).mockReturnValue(RAW as any);
    updateNote('user-1', 'note-1', { title: 'New', contentJson: '{}' });
    const sql = vi.mocked(run).mock.calls[0][0] as string;
    expect(sql).toContain('title = ?');
    expect(sql).toContain('content_json = ?');
  });

  it('returns null when note does not exist', () => {
    vi.mocked(get).mockReturnValue(undefined);
    expect(updateNote('user-1', 'missing', { title: 'New' })).toBeNull();
  });
});

describe('rowToNote (via getNoteById)', () => {
  it('maps is_public=1 to isPublic=true', () => {
    vi.mocked(get).mockReturnValue({ ...RAW, is_public: 1 } as any);
    expect(getNoteById('user-1', 'note-1')!.isPublic).toBe(true);
  });

  it('maps is_public=0 to isPublic=false', () => {
    vi.mocked(get).mockReturnValue({ ...RAW, is_public: 0 } as any);
    expect(getNoteById('user-1', 'note-1')!.isPublic).toBe(false);
  });

  it('maps snake_case DB fields to camelCase Note properties', () => {
    vi.mocked(get).mockReturnValue(RAW as any);
    const note = getNoteById('user-1', 'note-1')!;
    expect(note.userId).toBe('user-1');
    expect(note.contentJson).toBe('{"type":"doc"}');
    expect(note.publicSlug).toBeNull();
    expect(note.createdAt).toBe('2024-01-01');
    expect(note.updatedAt).toBe('2024-01-01');
  });
});

describe('setNotePublic', () => {
  it('returns null when note does not exist', () => {
    vi.mocked(get).mockReturnValue(undefined);
    expect(setNotePublic('user-1', 'missing', true)).toBeNull();
  });

  it('generates a slug when making public with no existing slug', () => {
    vi.mocked(get)
      .mockReturnValueOnce(RAW as any)
      .mockReturnValueOnce({ ...RAW, is_public: 1, public_slug: 'abc' } as any);
    setNotePublic('user-1', 'note-1', true);
    const params = vi.mocked(run).mock.calls[0][1] as unknown[];
    expect(params[0]).toBe(1);
    expect(typeof params[1]).toBe('string');
    expect((params[1] as string).length).toBeGreaterThan(0);
  });

  it('preserves existing slug when re-publishing', () => {
    const withSlug = { ...RAW, is_public: 0, public_slug: 'existing-slug' };
    vi.mocked(get)
      .mockReturnValueOnce(withSlug as any)
      .mockReturnValueOnce({ ...withSlug, is_public: 1 } as any);
    setNotePublic('user-1', 'note-1', true);
    const params = vi.mocked(run).mock.calls[0][1] as unknown[];
    expect(params[1]).toBe('existing-slug');
  });

  it('sets is_public=0 when making private', () => {
    const publicNote = { ...RAW, is_public: 1, public_slug: 'some-slug' };
    vi.mocked(get)
      .mockReturnValueOnce(publicNote as any)
      .mockReturnValueOnce({ ...publicNote, is_public: 0 } as any);
    setNotePublic('user-1', 'note-1', false);
    const params = vi.mocked(run).mock.calls[0][1] as unknown[];
    expect(params[0]).toBe(0);
  });
});

describe('getNoteByPublicSlug', () => {
  it('returns mapped note when slug exists and note is public', () => {
    vi.mocked(get).mockReturnValue({ ...RAW, is_public: 1, public_slug: 'abc123' } as any);
    const note = getNoteByPublicSlug('abc123');
    expect(note).not.toBeNull();
    expect(note!.isPublic).toBe(true);
  });

  it('returns null when slug is not found', () => {
    vi.mocked(get).mockReturnValue(undefined);
    expect(getNoteByPublicSlug('bad-slug')).toBeNull();
  });

  it('queries with public_slug and is_public=1 check', () => {
    vi.mocked(get).mockReturnValue(undefined);
    getNoteByPublicSlug('abc123');
    expect(vi.mocked(get)).toHaveBeenCalledWith(
      'SELECT * FROM notes WHERE public_slug = ? AND is_public = 1',
      ['abc123'],
    );
  });
});
