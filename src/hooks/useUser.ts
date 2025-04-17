// hooks/useUser.ts
import { useSession } from "next-auth/react";

export interface AppUser {
  id: string;
  name?: string | null;
  email?: string | null;
}

export function useUser() {
  const { data: session, status } = useSession();

  // Get user ID from either _id, id, or email
  const userId = (
    (session?.user as any)?._id || 
    (session?.user as any)?.id || 
    session?.user?.email || 
    ''
  );

  const userName = session?.user?.name || '';

  return {
    user: session?.user ? {
      id: userId,
      name: session.user.name,
      email: session.user.email
    } : null,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    // Add these to match your return type
    id: userId,
    name: userName
  };
}