import { NextRequest, NextResponse } from "next/server";
import { likeOrUnlikePost } from "@/actions/like-or-unlike-post"; // Update the import path if necessary
import { unknown_error } from "@/lib/variables";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string } >}) {
  try {
    const { postOwnerId } = await req.json();
    const { id } =  await params;
    const result = await likeOrUnlikePost(true, id, postOwnerId);
const {error, success} = result
    if ( error || !success) {
      return NextResponse.json({ error: error || unknown_error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in POST /api/posts/[id]/like:", err);
    return NextResponse.json({ error: unknown_error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string } >}) {
  try {
    const { postOwnerId } = await req.json();
    const { id } = await params;

    const result = await likeOrUnlikePost(false, id, postOwnerId);
    const {error, success} = result
    if ( error || !success) {
      return NextResponse.json({ error: error || unknown_error }, { status: 400 });
    }


    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in DELETE /api/posts/[id]/like:", err);
    return NextResponse.json({ error: unknown_error }, { status: 500 });
  }
}
