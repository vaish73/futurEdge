// hooks/useUser.ts
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

export function useUser(): {
  name: any; user: Session["user"] | null; status: "loading" | "authenticated" | "unauthenticated" 
} {
  const { data: session, status } = useSession();

  return {
  user: session?.user ?? null,
  status,
  name: undefined,
};
}
