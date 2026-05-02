import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/notes', () => ({
  getNoteById: vi.fn(),
  deleteNote: vi.fn(),
  updateNote: vi.fn(),
}));

import { getSession } from '@/lib/auth';
import { deleteNote, getNoteById, updateNote } from '@/lib/notes';
import { DELETE, GET, PUT } from '@/app/api/notes/[id]/route';

const SESSION = { user: { id: 'user-1' } };

const NOTE = {
  id: 'note-1',
  userId: 'user-1',
  title: 'Test',
  contentJson: '{"type":"doc"}',
  isPublic: false,
  publicSlug: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

const req = (method: string, body?: unknown) =>
  new Request('http://localhost/api/notes/note-1', {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/notes/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    const res = await GET(req('GET'), ctx('note-1'));
    expect(res.status).toBe(401);
  });

  it('returns 404 when note is not found', async () => {
    vi.mocked(getSession).mockResolvedValue(SESSION as any);
    vi.mocked(getNoteById).mockReturnValue(null);
    const res = await GET(req('GET'), ctx('note-1'));
    expect(res.status).toBe(404);
  });

  it('returns 200 with note when found', async () => {
    vi.mocked(getSession).mockResolvedValue(SESSION as any);
    vi.mocked(getNoteById).mockReturnValue(NOTE);
    const res = await GET(req('GET'), ctx('note-1'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(NOTE);
  });
});

describe('DELETE /api/notes/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    const res = await DELETE(req('DELETE'), ctx('note-1'));
    expect(res.status).toBe(401);
  });

  it('returns 404 when note is not found', async () => {
    vi.mocked(getSession).mockResolvedValue(SESSION as any);
    vi.mocked(deleteNote).mockReturnValue(false);
    const res = await DELETE(req('DELETE'), ctx('note-1'));
    expect(res.status).toBe(404);
  });

  it('returns 204 when note is deleted successfully', async () => {
    vi.mocked(getSession).mockResolvedValue(SESSION as any);
    vi.mocked(deleteNote).mockReturnValue(true);
    const res = await DELETE(req('DELETE'), ctx('note-1'));
    expect(res.status).toBe(204);
  });
});

describe('PUT /api/notes/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    const res = await PUT(req('PUT', { title: 'New' }), ctx('note-1'));
    expect(res.status).toBe(401);
  });

  it('returns 400 when contentJson is not valid JSON', async () => {
    vi.mocked(getSession).mockResolvedValue(SESSION as any);
    const res = await PUT(req('PUT', { contentJson: 'bad-json' }), ctx('note-1'));
    expect(res.status).toBe(400);
  });

  it('returns 404 when note is not found', async () => {
    vi.mocked(getSession).mockResolvedValue(SESSION as any);
    vi.mocked(updateNote).mockReturnValue(null);
    const res = await PUT(req('PUT', { title: 'New' }), ctx('note-1'));
    expect(res.status).toBe(404);
  });

  it('returns 200 with updated note on valid input', async () => {
    vi.mocked(getSession).mockResolvedValue(SESSION as any);
    vi.mocked(updateNote).mockReturnValue({ ...NOTE, title: 'New' });
    const res = await PUT(req('PUT', { title: 'New' }), ctx('note-1'));
    expect(res.status).toBe(200);
    expect((await res.json()).title).toBe('New');
  });
});
