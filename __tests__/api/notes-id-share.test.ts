import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/notes', () => ({ setNotePublic: vi.fn() }));

import { getSession } from '@/lib/auth';
import { setNotePublic } from '@/lib/notes';
import { POST } from '@/app/api/notes/[id]/share/route';

const SESSION = { user: { id: 'user-1' } };

const NOTE = {
  id: 'note-1',
  userId: 'user-1',
  title: 'Test',
  contentJson: '{"type":"doc"}',
  isPublic: true,
  publicSlug: 'abc123',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

const req = (body: unknown) =>
  new Request('http://localhost/api/notes/note-1/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/notes/[id]/share', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    const res = await POST(req({ isPublic: true }), ctx('note-1'));
    expect(res.status).toBe(401);
  });

  it('returns 400 when isPublic is missing', async () => {
    vi.mocked(getSession).mockResolvedValue(SESSION as any);
    const res = await POST(req({}), ctx('note-1'));
    expect(res.status).toBe(400);
  });

  it('returns 400 when isPublic is a string instead of boolean', async () => {
    vi.mocked(getSession).mockResolvedValue(SESSION as any);
    const res = await POST(req({ isPublic: 'true' }), ctx('note-1'));
    expect(res.status).toBe(400);
  });

  it('returns 404 when note is not found', async () => {
    vi.mocked(getSession).mockResolvedValue(SESSION as any);
    vi.mocked(setNotePublic).mockReturnValue(null);
    const res = await POST(req({ isPublic: true }), ctx('note-1'));
    expect(res.status).toBe(404);
  });

  it('makes note public and returns updated note', async () => {
    vi.mocked(getSession).mockResolvedValue(SESSION as any);
    vi.mocked(setNotePublic).mockReturnValue(NOTE);
    const res = await POST(req({ isPublic: true }), ctx('note-1'));
    expect(res.status).toBe(200);
    expect(vi.mocked(setNotePublic)).toHaveBeenCalledWith('user-1', 'note-1', true);
    expect(await res.json()).toEqual(NOTE);
  });

  it('makes note private and returns updated note', async () => {
    vi.mocked(getSession).mockResolvedValue(SESSION as any);
    vi.mocked(setNotePublic).mockReturnValue({ ...NOTE, isPublic: false, publicSlug: null });
    const res = await POST(req({ isPublic: false }), ctx('note-1'));
    expect(res.status).toBe(200);
    expect(vi.mocked(setNotePublic)).toHaveBeenCalledWith('user-1', 'note-1', false);
  });
});
