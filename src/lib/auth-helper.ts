import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface SessionUser {
  id: string;
  role: string;
  mitraId: string | null;
}

export async function getAuthSession(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return {
    id: (session.user as { id?: string }).id || "",
    role: (session.user as { role?: string }).role || "admin",
    mitraId: (session.user as { mitraId?: string | null }).mitraId || null,
  };
}

// Returns where clause for mitra filtering
// Superadmin: can pass specific mitraId filter or no filter (see all)
// Admin: always filtered by their mitraId
export function getMitraWhere(user: SessionUser, mitraIdFilter?: string): Record<string, unknown> {
  if (user.role === "superadmin") {
    // Superadmin can optionally filter by specific mitra
    if (mitraIdFilter) {
      return { mitraId: mitraIdFilter };
    }
    return {}; // No filter = see all
  }

  // Regular admin: always filtered by their own mitra
  if (user.mitraId) {
    return { mitraId: user.mitraId };
  }

  // Admin without mitra: can only see data without mitraId
  return { mitraId: null };
}

// Check if user has access to specific mitra's data
export function canAccessMitra(user: SessionUser, mitraId?: string | null): boolean {
  if (user.role === "superadmin") return true;
  if (!mitraId && !user.mitraId) return true;
  return user.mitraId === mitraId;
}
