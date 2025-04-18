import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {Prisma} from "@prisma/client"
import getServerUser from "@/hooks/get-server-user";
import { unknown_error, unauthorized_error } from "@/lib/variables";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.toLowerCase()?.trim();
    const filter = searchParams.get("filter")?.toLowerCase() || "default";

    if (!query || query.length < 1) {
        return NextResponse.json(
            { error: "Query is required and must be at least 1 character long" },
            { status: 400 }
        );
    }

    const session = await getServerUser();
    if (!session) {
        return NextResponse.json(
            { error: unauthorized_error, success: false, data: undefined },
            { status: 401 }
        );
    }
    const userId = session.id;

    try {
        const whereCondition: Prisma.UserWhereInput  = {
            AND: [
                {
                    OR: [
                        { username: { contains: query, mode: "insensitive" } },
                        { name: { contains: query, mode: "insensitive" } },
                    ],
                },
                { username: { not: null } },
                { profilePictureUrl: { not: null } },
                { isVerified: true },
            ],
        };

        if (filter === "conversation") {
            (whereCondition.AND as Prisma.UserWhereInput[])?.push({ id: { not: userId } });
        }
        const users = await prisma.user.findMany({
            where: whereCondition,
            select: {
                id: true,
                username: true,
                name: true,
                profilePictureUrl: true,
                blueCheckVerified: true,
            },
            take: 15,
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Unhandled error in GET /search/input-search:", error);
        return NextResponse.json(
            { error: unknown_error },
            { status: 500 }
        );
    }
}
