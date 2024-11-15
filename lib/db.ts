import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

// prisma.$use(async (params, next) => {
//     if (params.model === 'User' && (params.action === 'create' || params.action === 'update')) {
//         const email = params.args.data.email;
//         if (email) {
//             params.args.data.email = email.toLowerCase();
//         }
//     }
//     return next(params);
// });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
