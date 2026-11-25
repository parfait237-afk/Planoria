import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { authIdentities, collaborators, users } from "@/db/schema";

export const UNKNOWN_EMAIL_MESSAGE = "Cette adresse e-mail ne figure ni parmi les utilisateurs ni parmi les collaborateurs. Veuillez contacter votre administrateur.";

export function normalizeLoginEmail(value: string) {
  return value.trim().toLowerCase();
}

export async function prepareLoginIdentity(emailValue: string) {
  const email = normalizeLoginEmail(emailValue);
  const administrator = await db.query.users.findFirst({ where: sql`lower(${users.email}) = ${email}` });
  if (administrator) {
    if (!administrator.active || administrator.role !== "administrator") return { status: "unauthorized" as const, email };
    const identityByEmail = await db.query.authIdentities.findFirst({ where: sql`lower(${authIdentities.email}) = ${email}` });
    if (identityByEmail && identityByEmail.sourceUserId !== administrator.id) {
      const [identity] = await db.update(authIdentities).set({ email, displayName: administrator.displayName, image: administrator.image, role: "administrator", active: true, sourceUserId: administrator.id, sourceCollaboratorId: null, updatedAt: new Date() }).where(eq(authIdentities.id, identityByEmail.id)).returning({ id: authIdentities.id, role: authIdentities.role });
      return { status: "authorized" as const, email, identity };
    }
    const [identity] = await db.insert(authIdentities).values({ id: administrator.id, email, emailVerified: administrator.emailVerified, displayName: administrator.displayName, image: administrator.image, role: "administrator", active: true, sourceUserId: administrator.id }).onConflictDoUpdate({ target: authIdentities.sourceUserId, set: { email, displayName: administrator.displayName, image: administrator.image, role: "administrator", active: true, sourceCollaboratorId: null, updatedAt: new Date() } }).returning({ id: authIdentities.id, role: authIdentities.role });
    return { status: "authorized" as const, email, identity };
  }

  const collaborator = await db.query.collaborators.findFirst({ where: sql`lower(${collaborators.email}) = ${email}` });
  if (!collaborator) return { status: "unknown" as const, email };
  if (collaborator.accessStatus !== "active") return { status: "unauthorized" as const, email };
  const existing = await db.query.authIdentities.findFirst({ where: sql`lower(${authIdentities.email}) = ${email}` });
  if (existing && existing.sourceCollaboratorId !== collaborator.id) return { status: "unauthorized" as const, email };
  const [identity] = await db.insert(authIdentities).values({ email, emailVerified: false, displayName: collaborator.name, role: "collaborator", active: true, sourceCollaboratorId: collaborator.id }).onConflictDoUpdate({ target: authIdentities.sourceCollaboratorId, set: { email, displayName: collaborator.name, role: "collaborator", active: true, sourceUserId: null, updatedAt: new Date() } }).returning({ id: authIdentities.id, role: authIdentities.role });
  return { status: "authorized" as const, email, identity };
}

export async function isIdentityAuthorized(identityId: string) {
  const identity = await db.query.authIdentities.findFirst({ where: eq(authIdentities.id, identityId) });
  if (!identity?.active) return false;
  if (identity.role === "administrator" && identity.sourceUserId) {
    return Boolean(await db.query.users.findFirst({ where: and(eq(users.id, identity.sourceUserId), eq(users.active, true), eq(users.role, "administrator")), columns: { id: true } }));
  }
  if (identity.role === "collaborator" && identity.sourceCollaboratorId) {
    return Boolean(await db.query.collaborators.findFirst({ where: and(eq(collaborators.id, identity.sourceCollaboratorId), eq(collaborators.accessStatus, "active")), columns: { id: true } }));
  }
  return false;
}
