import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { unknown_error } from "@/lib/variables";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.toLowerCase()?.trim();

    if (!query || query.length < 1) {
        return NextResponse.json(
            { error: "Query is required and must be of minimum length of 1" },
            { status: 400 }
        );
    }

    try {


        const users = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { username: { contains: query, mode: "insensitive" } },
                            { name: { contains: query, mode: "insensitive" } }
                        ]
                    },
                    { username: { not: null } },
                    { profilePictureUrl: { not: null } },
                    { isVerified: true },
                ]
            },
            select: {
                id: true,
                username: true,
                name: true,
                profilePictureUrl: true,
                blueCheckVerified: true
            },
            take: 5
        });
        return NextResponse.json({ users })
    } catch (error) {
        console.error("Unhandled error in GET /search/input-search:", error);
        return NextResponse.json(
            { error: unknown_error },
            { status: 500 }
        );
    }
}
