import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role: "ADMIN" | "STAFF" | "STUDENT";
  }

  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "STAFF" | "STUDENT";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: "ADMIN" | "STAFF" | "STUDENT";
  }
}
