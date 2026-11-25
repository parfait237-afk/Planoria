# Architecture frontend Planoria

## Points d’entrée

- `src/app/page.tsx` assemble la page Dashboard.
- `src/app/taches/page.tsx` assemble la page Gestion des tâches, accessible sur `/taches`.
- `src/app/planning/page.tsx` assemble le Planning, accessible sur `/planning`.
- `src/app/projets/page.tsx` assemble la page Projets, accessible sur `/projets`.
- `src/app/collaborateurs/page.tsx` assemble la page Collaborateurs, accessible sur `/collaborateurs`.
- Les fichiers `app/**/page.tsx` restent volontairement minces conformément à l’App Router Next.js.

## Organisation

```text
src/
├─ app/                         # Routes Next.js et layout racine
├─ components/
│  ├─ brand/                   # Logo et actifs de marque
│  ├─ layout/                  # Sidebar et barre supérieure partagées
│  └─ ui/                      # Modal, Button, Badge, Pagination, confirmation
├─ features/
│  ├─ dashboard/
│  │  ├─ components/           # Vue et sections visuelles du Dashboard
│  │  ├─ domain/               # Calculs propres au Dashboard
│  │  └─ pages/                # Assemblage du Dashboard
│  ├─ tasks/
│  │  ├─ pages/                # Assemblage Gestion des tâches
│  │  ├─ components/           # Stats, filtres, onglets, tableau, lignes, actions
│  │  │  └─ modals/            # Formulaire et décisions de contrôle
│  │  ├─ hooks/                # Filtres, tri, pagination et sélection
│  │  ├─ domain/               # Retard, transitions et décisions métier
│  │  ├─ services/             # Accès/mutations des tâches et contrat de données
│  │  ├─ types/                # Tâches, statuts, projets, membres et décisions
│  │  └─ utils/                # Dates et export CSV
│  ├─ planning/
│  │  ├─ pages/                # Assemblage des cinq vues
│  │  ├─ components/           # Filtres, vues, cartes et charge
│  │  ├─ hooks/                # État des vues, filtres et période
│  │  ├─ domain/               # Calculs de dates et grilles calendrier
│  │  ├─ services/             # Mutations du planning via le store partagé
│  │  └─ types/                # Types des vues et filtres
│  ├─ projects/
│  │  ├─ pages/                # Assemblage de la page Projets
│  │  ├─ components/           # Cartes et formulaire projet
│  │  ├─ domain/               # Validation et calcul de progression
│  │  └─ services/             # Création et modification via le store partagé
│  ├─ collaborators/
│  │  ├─ pages/                # Assemblage de la page Collaborateurs
│  │  ├─ components/           # Cartes et modales de fiches/invitations
│  │  ├─ domain/               # Validation et indicateurs calculés
│  │  └─ services/             # Fiches et brouillons via le store partagé
│  └─ workspace/               # Modales propres à l’espace administrateur
│  └─ collaborator-space/
│     ├─ pages/                 # Assemblage protégé de l’espace personnel
│     ├─ components/            # Accueil, semaine, historique et détail
│     ├─ services/              # Requêtes filtrées et mutations autorisées
│     └─ types/                 # DTO limités au collaborateur connecté
├─ mocks/                      # Jeu de données initial unique
├─ db/                         # Connexion Neon, schémas et repositories serveur
└─ store/                      # État partagé Dashboard/Gestion des tâches
```

## Modifier la page Gestion des tâches

- Assemblage général : `src/features/tasks/pages/task-management-page.tsx`.
- Interface : `src/features/tasks/components/`.
- Modales : `src/features/tasks/components/modals/`.
- État des filtres, tri, pagination et sélection : `src/features/tasks/hooks/use-task-management.ts`.

## Modifier les données fictives

Le jeu initial de développement se trouve dans `src/mocks/planoria-demo-data.ts` et n’est utilisé que par `scripts/seed-database.ts`. À l’exécution, les pages lisent exclusivement PostgreSQL via `src/db/queries/planoria-data.ts`; aucune donnée applicative n’est lue depuis `localStorage`.

## Règles métier

- Tâches et contrôle des réalisations : `src/features/tasks/domain/task-rules.ts`.
- Indicateurs et périodes du Dashboard : `src/features/dashboard/domain/dashboard-rules.ts`.
- Les statuts et priorités partagés sont centralisés dans `src/features/tasks/types/task.ts`.

## Partage avec le Dashboard

`src/store/planoria-store.ts` expose le même instantané aux deux pages avec `useSyncExternalStore`. Toute mutation passe par les services de la fonctionnalité tâches et met donc à jour simultanément le Dashboard et Gestion des tâches.

## Future API

Le contrat `TaskDataService` se trouve dans `src/features/tasks/services/task-service.ts`. Pour intégrer l’API, remplacez `demoTaskDataService` par une implémentation distante et adaptez le store pour gérer les appels asynchrones. Les composants, hooks et règles métier ne doivent pas accéder directement à `fetch` ou `localStorage`.

La fondation PostgreSQL est documentée dans docs/DATABASE.md. Les schémas Drizzle sont répartis dans src/db/schema, la connexion Neon dans src/db/client.ts et les opérations transactionnelles dans src/db/repositories. Les interfaces utilisent encore les données fictives jusqu’au branchement progressif des fonctionnalités.

## Conventions

- Interface en français, TypeScript strict, Tailwind CSS uniquement.
- Icônes d’interface provenant exclusivement de `lucide-react`.
- Les composants d’affichage ne lisent jamais directement la persistance.
- La récurrence reste descriptive tant qu’aucune règle de génération n’est définie.

## Espace collaborateur

- Route : `src/app/espace-collaborateur/page.tsx`.
- Session et catégorie : `src/server/auth/session.ts` avec `requireCollaborator`.
- Données personnelles : `src/features/collaborator-space/services/collaborator-space-data.ts`. Toutes les tâches sont filtrées en SQL avec l’identifiant de la fiche provenant de la session.
- Actions : `src/features/collaborator-space/services/collaborator-actions.ts`. Chaque action recharge la tâche avec la contrainte `assignee_id = collaborateur connecté` avant toute écriture.
- Les champs administratifs ne sont exposés par aucune action collaborateur. Seuls le statut d’exécution, les commentaires et la checklist peuvent être modifiés selon les transitions autorisées.

## Suivi & rapports

- Route : `src/app/rapports/page.tsx`.
- Assemblage : `src/features/reports/pages/reports-page.tsx`.
- Interface : `src/features/reports/components/`.
- Calculs, priorités et conflits : `src/features/reports/domain/`.
- Assistant local et journal : `src/features/reports/services/`.
- Exports réels PDF, XLSX et CSV : `src/features/reports/utils/report-export.ts`.
- La page lit la source partagée `PlanoriaData` du Dashboard et des tâches. La future API remplacera `task-service.ts`; un journal d’audit fiable devra alors être alimenté côté serveur.
