# Couche de données Planoria

## Branchement de l’application

- Les pages serveur chargent la source partagée dans `src/db/queries/planoria-data.ts`.
- Les composants clients la reçoivent via `src/components/providers/planoria-page-data.tsx` et `src/store/planoria-store.tsx`.
- Toutes les écritures passent par `src/app/actions/planoria-actions.ts`.
- Les opérations composées sont transactionnelles : tâche/checklist/événement, décision/statut/événement et projet/membres.
- Sans authentification, `src/server/auth/development-actor.ts` fournit un acteur technique uniquement en développement ; les mutations sont refusées en production.
- Lors de l’intégration d’une future API, remplacer la requête partagée et les actions serveur sans modifier les composants d’affichage.

## Configuration

Copier .env.example vers .env.local et renseigner DATABASE_URL depuis Neon. Cette variable reste exclusivement serveur et doit conserver sslmode=require. Ne jamais la préfixer par NEXT_PUBLIC_.

La connexion transactionnelle est définie dans src/db/client.ts avec le pilote WebSocket officiel Neon. src/db/index.ts marque l’accès comme server-only. Les composants React client ne doivent importer aucun fichier de src/db.

## Schéma

- users : identité fournie ultérieurement par un système d’authentification externe, rôle applicatif et lien facultatif vers une fiche.
- collaborators : fiches internes, utilisables sans compte connecté.
- projects, project_members : projets, responsable et membres.
- tasks, task_checklist_items : tâches, planification, contrôle, correction, récurrence et checklist ordonnée.
- task_comments : échanges conservés et archivables.
- task_decisions : décisions immuables de validation, correction ou réouverture.
- activity_events : journal horodaté avec changements avant/après en JSON.

Les dates calendaires utilisent date ; les instants utilisent timestamp with time zone. L’interface effectue l’affichage en Africa/Douala. « En retard » reste calculé depuis l’échéance et le statut.

## Commandes

- npm run db:generate -- --name=nom_migration
- npm run db:check
- npm run db:health
- npm run db:migrate
- npm run db:studio

db:migrate ne doit être exécutée qu’après inspection de la base cible et revue du SQL. Ne pas utiliser drizzle-kit push sur une base partagée ou de production.

## Migrations actuelles

- 0000_initial_planoria_schema.sql : tables, enums, clés étrangères, index et contraintes.
- 0001_correct_project_constraints.sql : clé primaire composite des membres et unicité partielle du nom des projets actifs.

Elles sont générées mais non appliquées : aucune DATABASE_URL n’est configurée et l’état de la base Neon cible n’a pas été inspecté.

## Transactions

Les repositories de src/db/repositories contiennent les opérations atomiques. La création d’un projet ajoute son responsable aux membres dans la même transaction. Une décision de tâche met à jour la tâche et écrit l’événement correspondant dans la même transaction.

## Authentification et autorisations

Le schéma prépare les rôles administrateur/collaborateur et une référence d’identité externe. Aucun système de connexion, session ou mot de passe n’est implémenté. Avant de brancher les pages, chaque commande serveur devra vérifier la session et l’autorisation sur la ressource ; la colonne role seule ne constitue pas une protection.

## Future API

Les pages utilisent encore le store de démonstration. Le remplacement progressif doit passer par les repositories et services serveur, sans accès SQL depuis les composants et sans modifier le design.
