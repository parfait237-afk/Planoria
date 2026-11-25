export const ACCOUNT_CATEGORIES = ["administrator", "collaborator"] as const;

/**
 * Catégorie métier du compte Planoria.
 * `users` reste le nom technique commun à tous les comptes authentifiés.
 */
export type AccountCategory = (typeof ACCOUNT_CATEGORIES)[number];

export function isAccountCategory(value: unknown): value is AccountCategory {
  return typeof value === "string" && ACCOUNT_CATEGORIES.includes(value as AccountCategory);
}

export function accountHome(category: AccountCategory) {
  return category === "administrator" ? "/" : "/espace-collaborateur";
}

export function canAccessAdminSpace(category: AccountCategory, active: boolean) {
  return active && category === "administrator";
}
