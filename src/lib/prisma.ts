import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL?.replace(
   /([?&]sslmode=)(prefer|require|verify-ca)(?=&|$)/,
   "$1verify-full",
);

const globalForPrisma = global as unknown as {
   prisma: PrismaClient;
};
const adapter = new PrismaPg({
   connectionString,
});
const prisma =
   globalForPrisma.prisma ||
   new PrismaClient({
      adapter,
   });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
export default prisma;
