import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/notes', () => ({ createNote: vi.fn() }));

import { getSession } from '@/lib/auth';
import { createNote } from '@/lib/notes';
import { POST } from '@/app/api/notes/route';

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

const makeRequest = (body: unknown) =>
  new Request('http://localhost/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/notes', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    const res = await POST(makeRequest({ title: 'x', contentJson: '{}' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when title is missing', async () => {
    vi.mocked(getSession).mockResolvedValue(SESSION as any);
    const res = await POST(makeRequest({ contentJson: '{}' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when title is an empty string', async () => {
    vi.mocked(getSession).mockResolvedValue(SESSION as any);
    const res = await POST(makeRequest({ title: '', contentJson: '{}' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when contentJson is not valid JSON', async () => {
    vi.mocked(getSession).mockResolvedValue(SESSION as any);
    const res = await POST(makeRequest({ title: 'Test', contentJson: 'not-json' }));
    expect(res.status).toBe(400);
  });

  it('returns 201 with the created note on valid input', async () => {
    vi.mocked(getSession).mockResolvedValue(SESSION as any);
    vi.mocked(createNote).mockReturnValue(NOTE);
    const res = await POST(makeRequest({ title: 'Test', contentJson: '{"type":"doc"}' }));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(NOTE);
  });

  it('calls createNote with session userId and parsed data', async () => {
    vi.mocked(getSession).mockResolvedValue(SESSION as any);
    vi.mocked(createNote).mockReturnValue(NOTE);
    await POST(makeRequest({ title: 'Test', contentJson: '{"type":"doc"}' }));
    expect(vi.mocked(createNote)).toHaveBeenCalledWith('user-1', {
      title: 'Test',
      contentJson: '{"type":"doc"}',
    });
  });
});
