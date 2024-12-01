import { getHomePagePosts } from "@/actions/get-home-page-posts";
import { unknown_error } from "@/lib/variables";
export const dynamic = "force-dynamic";
export const revalidate = 300;
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = url.searchParams.get("page") || "1";
    const result = await getHomePagePosts(Number(page));
    const { error, success, data } = result;
    if (error || !success) {
      return new Response(
        JSON.stringify({ error: error || unknown_error, data, success }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Unhandled error in GET /route:", error);
    return new Response(
      JSON.stringify({
        error: unknown_error,
        data: undefined,
        success: undefined,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
