import { getComments } from "@/actions/get-comments";
import { unknown_error } from "@/lib/variables";
import { NextResponse } from "next/server";
enum Filters {
    LIKES = "LIKES",
    LATEST = "LATEST",
    OLDEST = "OLDEST",
  }
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const postId = url.searchParams.get("postId");
    const page = url.searchParams.get("page") || "1";
    const filter = (url.searchParams.get("filter") as Filters) || Filters.LIKES;

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required.", data: null, success: false },
        { status: 400 }
      );
    }

    const result = await getComments(postId, Number(page), filter);

    const { error, success, data } = result;

    if (error || !success) {
      return NextResponse.json(
        { error: error || unknown_error, data, success },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, error: null, data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unhandled error in GET /comments:", error);
    return NextResponse.json(
      { error: unknown_error, data: null, success: false },
      { status: 500 }
    );
  }
}
