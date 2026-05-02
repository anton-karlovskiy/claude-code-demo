import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { setNotePublic } from '@/lib/notes';

type RouteContext = { params: Promise<{ id: string }> };

const ShareSchema = z.object({ isPublic: z.boolean() });

export async function POST(req: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = ShareSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const note = setNotePublic(session.user.id, id, parsed.data.isPublic);
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(note);
}
