import { NextRequest, NextResponse } from "next/server";
import { unknown_error } from "@/lib/variables";
import { followOrUnfollowUser } from "@/actions/follow-or-unfollow-user";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string } >}) {
  try {
    const { id } =  await params;
    const result = await followOrUnfollowUser(true, id);
const {error, success} = result
    if ( error || !success) {
      return NextResponse.json({ error: error || unknown_error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in POST /api/users/[id]/follow:", err);
    return NextResponse.json({ error: unknown_error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string } >}) {
  try {
    const { id } =  await params;
    const result = await followOrUnfollowUser(false, id);
    const {error, success} = result
    if ( error || !success) {
      return NextResponse.json({ error: error || unknown_error }, { status: 400 });
    }


    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in DELETE /api/users/[id]/follow:", err);
    return NextResponse.json({ error: unknown_error }, { status: 500 });
  }
}
