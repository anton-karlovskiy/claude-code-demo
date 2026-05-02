import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { createNote } from "@/lib/notes";

const isValidJson = (s: string) => { try { JSON.parse(s); return true; } catch { return false; } };

const CreateNoteSchema = z.object({
  title: z.string().min(1),
  contentJson: z.string().min(1).refine(isValidJson, "contentJson must be valid JSON"),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = CreateNoteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const note = createNote(session.user.id, parsed.data);
  return NextResponse.json(note, { status: 201 });
}
