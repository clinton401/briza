import { getHomePagePosts } from "@/actions/get-home-page-posts";
import { unknown_error } from "@/lib/variables";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = url.searchParams.get("page") || "1";
    const result = await getHomePagePosts(Number(page));

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
    console.error("Unhandled error in GET /route:", error);
    return NextResponse.json(
      { error: unknown_error, data: null, success: false },
      { status: 500 }
    );
  }
}
