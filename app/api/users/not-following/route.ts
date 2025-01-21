import { unknown_error } from "@/lib/variables";
import { NextResponse } from "next/server";
import { getUsersNotFollowedByCurrentUser } from "@/actions/get-users-not-followed-by-current-user";

export async function GET() {
  try {
    const response = await getUsersNotFollowedByCurrentUser();
    const { error, users } = response;
    if (error || !users) {
      return NextResponse.json(
        { error: error || unknown_error },
        { status: 400 }
      );
    }
    return NextResponse.json({users: users});
  } catch (error) {
    console.error(`Error in get /api/users/not-following: ${error}`);
    return NextResponse.json({ error: unknown_error }, { status: 500 });
  }
}
