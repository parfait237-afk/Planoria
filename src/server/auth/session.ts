import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { accountHome, canAccessAdminSpace, isAccountCategory } from "@/lib/account-category";
import { isIdentityAuthorized } from "@/server/auth/identity-service";

export async function getCurrentSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.active !== true || !isAccountCategory(session.user.role) || !await isIdentityAuthorized(session.user.id)) return null;
  return session;
}

export async function requireUser() {
  const session = await getCurrentSession();
  if (!session) redirect("/connexion");
  return session.user;
}

export async function requireAdministrator() {
  const user = await requireUser();
  if (!canAccessAdminSpace(user.role, user.active)) redirect(accountHome(user.role));
  return user;
}

export async function requireCollaborator() {
  const user = await requireUser();
  if (user.role !== "collaborator") redirect(accountHome(user.role));
  if (!user.sourceCollaboratorId) throw new Error("Le compte collaborateur n’est pas lié à sa fiche source.");
  return user;
}

export async function requireAdminActor() {
  const user = await requireAdministrator();
  if (!user.sourceUserId) throw new Error("Le compte administrateur n’est pas lié à son utilisateur source.");
  return { id: user.sourceUserId, name: user.name };
}
