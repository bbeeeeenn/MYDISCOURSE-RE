import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
   req: NextRequest,
): Promise<NextResponse<{ ok: false } | { ok: true; count: number }>> {
   try {
      const searchParams = req.nextUrl.searchParams;
      const userId = searchParams.get("id");
      if (!userId) return NextResponse.json({ ok: false });
      const count = await prisma.notification.count({
         where: { userId, read: false },
      });

      return NextResponse.json({ ok: true, count: count });
   } catch (e) {
      console.error(e);
      return NextResponse.json({ ok: false });
   }
}
