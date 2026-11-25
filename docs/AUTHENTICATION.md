# Authentification Planoria

Planoria utilise Better Auth, son adaptateur Drizzle et le plugin Email OTP. Les codes à six chiffres expirent après cinq minutes, sont stockés hachés, limités à trois tentatives et remplacés lors d’un renvoi. Resend assure l’envoi réel.

Les comptes ne sont jamais créés depuis l’écran de connexion (`disableSignUp`). Un compte doit exister dans `users`, être actif et posséder l’une des deux seules catégories métier : `administrator` ou `collaborator`. Il n’existe aucune troisième catégorie.

Dans le vocabulaire métier Planoria, un « User » est l’administrateur stocké dans `users`, tandis qu’un « Collaborateur » est l’utilisateur standard stocké dans `collaborators`. La table technique `auth_identities` fournit à Better Auth une identité de session commune, liée par `source_user_id` ou `source_collaborator_id`, mais jamais aux deux. Elle ne confère aucun droit par elle-même.

La demande de code passe par `/api/auth/request-otp`. Le serveur normalise l’adresse, consulte `users` en priorité, puis `collaborators`. Un collaborateur doit avoir `access_status = active`; une simple fiche ou une invitation non acceptée ne suffit pas. Une adresse inconnue reçoit l’alerte explicite prévue par le produit et aucun OTP n’est envoyé. Better Auth conserve le hachage, l’expiration, l’usage unique et la limitation des tentatives.

Toutes les pages métier existantes passent par `PlanoriaPageData`, qui exige `requireAdministrator`. Les lectures d’historique et toutes les mutations exigent également `requireAdminActor`, qui retrouve l’identifiant du `users` source pour l’audit. L’espace d’attente collaborateur exige explicitement `requireCollaborator`. Les redirections d’interface complètent ces contrôles serveur mais ne les remplacent pas. Avant chaque création de session, la source est relue afin de refuser un administrateur désactivé ou un collaborateur dont l’accès n’est plus actif.

Variables serveur requises : `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RESEND_API_KEY`, `EMAIL_FROM`. En mode test, définir `EMAIL_MODE=test` et `TEST_ALLOWED_EMAIL`.

Pour initialiser le premier administrateur, insérer côté serveur une ligne `users` avec une adresse normalisée en minuscules, `display_name`, `role = 'administrator'` et `active = true`. Ne jamais exposer cette opération comme inscription publique.

Les tables `sessions`, `accounts`, `verifications` et `rate_limits` sont gérées par Better Auth. Une déconnexion révoque la session en base. Les cookies de session sont `HttpOnly`, `SameSite=Lax` et deviennent `Secure` en production.
