import type { NextAuthConfig } from "next-auth";
// Edge-safe part (no database): used by middleware.
export default {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) { if (user) token.role = user.role; return token; },
    session({ session, token }) { session.user.role = token.role; session.user.id = token.sub ?? ""; return session; },
    authorized({ auth, request }) {
      if (request.nextUrl.pathname.startsWith("/admin")) {
        const r = auth?.user?.role;
        return r === "ADMIN" || r === "TEACHER";
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
