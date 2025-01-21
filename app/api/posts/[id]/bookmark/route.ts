import {NextRequest, NextResponse } from "next/server";
import { bookmarkOrUnbookmarkPost } from "@/actions/bookmark-or-unbookmark-post";
import { unknown_error } from "@/lib/variables";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const result = await bookmarkOrUnbookmarkPost(true, id);
    const { error, success } = result;

    if (error || !success) {
      return NextResponse.json(
        { error: error || unknown_error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in POST /api/posts/[id]/bookmark:", err);
    return NextResponse.json({ error: unknown_error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const result = await bookmarkOrUnbookmarkPost(false, id);
    const { error, success } = result;

    if (error || !success) {
      return NextResponse.json(
        { error: error || unknown_error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in DELETE /api/posts/[id]/bookmark:", err);
    return NextResponse.json({ error: unknown_error }, { status: 500 });
  }
}
