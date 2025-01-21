import { unknown_error } from "@/lib/variables";
import { NextResponse } from "next/server";
import { getNotifications } from "@/actions/get-notifications";

export async function GET(req: Request) {
    try{
        const url = new URL(req.url);
        const page = url.searchParams.get("page") || "1";
        const result = await getNotifications(Number(page));
        const { error, success, data } = result;

        if (error || !success) {
          return NextResponse.json(
            { error: error || unknown_error },
            { status: 400 }
          );
        }
    
        return NextResponse.json(data
        );
    }catch(error){
        console.error("Unhandled error in GET /notifications :", error);
    return NextResponse.json(
      { error: unknown_error },
      { status: 500 }
    );
    }
}