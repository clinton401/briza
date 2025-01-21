import { unknown_error } from "@/lib/variables";
import { getReplies } from "@/actions/get-replies";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const url = new URL(req.url);
  const parentCommentId = url.searchParams.get("parent");
  if(!parentCommentId) {
    return NextResponse.json({ error: "parentCommentId is required" }, { status: 400 });

  }

  try {
    const result = await getReplies(id, parentCommentId);
    const { error, success, data } = result;
    if (error || !success || !data) {
      return NextResponse.json(
        { error: error || unknown_error },
        { status: 400 }
      );
    }
    return NextResponse.json( data );
  } catch (error) {
    console.error("Error in GET /api/comments/[id]/replies:", error);
    return NextResponse.json({ error: unknown_error }, { status: 500 });
  }
}
