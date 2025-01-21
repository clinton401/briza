import { unknown_error } from "@/lib/variables";
import { getPost } from "@/actions/get-post";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const result = await getPost(id);
    const { error, success, data } = result;
    if (error || !success || !data) {
      return NextResponse.json(
        { error: error || unknown_error },
        { status: 400 }
      );
    }
    return NextResponse.json( data );
  } catch (error) {
    console.error("Error in GET /api/posts/[id]:", error);
    return NextResponse.json({ error: unknown_error }, { status: 500 });
  }
}
