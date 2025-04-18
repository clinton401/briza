import { getUnreadNotificationsCount } from "@/actions/get-unread-notifications-count";
import { unknown_error } from "@/lib/variables";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await getUnreadNotificationsCount();
        const { error, data } = response;
        if (error || !data) {
            return NextResponse.json({
                error: error || unknown_error
            }, { status: 400 })
        }

        return NextResponse.json(data
        );
    } catch (error) {
        console.error(`Error in GET /notifications/unread route: ${error}`);
        return NextResponse.json({
            error: unknown_error
        }, {
            status: 500
        })
    }
}