import { NextRequest, NextResponse } from "next/server";
import { likeOrUnlikeComment } from "@/actions/like-or-unlike-comment";
import { unknown_error } from "@/lib/variables";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { postId, commentOwnerId } = await req.json();
    const { id } = await params;
    const result = await likeOrUnlikeComment(true, id, commentOwnerId, postId);
    const { error, success } = result
    if (error || !success) {
      return NextResponse.json({ error: error || unknown_error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in POST /api/comments/[id]/like:", err);
    return NextResponse.json({ error: unknown_error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { postId, commentOwnerId } = await req.json();
    const { id } = await params;
    const result = await likeOrUnlikeComment(false, id, commentOwnerId, postId);
    const { error, success } = result
    if (error || !success) {
      return NextResponse.json({ error: error || unknown_error }, { status: 400 });
    }


    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in DELETE /api/comments/[id]/like:", err);
    return NextResponse.json({ error: unknown_error }, { status: 500 });
  }
}
