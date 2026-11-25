CREATE TABLE "auth_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"display_name" text NOT NULL,
	"image" text,
	"role" "app_role" NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"source_user_id" uuid,
	"source_collaborator_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_identities_single_source" CHECK ((("auth_identities"."source_user_id" is not null)::int + ("auth_identities"."source_collaborator_id" is not null)::int) = 1),
	CONSTRAINT "auth_identities_role_source" CHECK (("auth_identities"."role" = 'administrator' and "auth_identities"."source_user_id" is not null) or ("auth_identities"."role" = 'collaborator' and "auth_identities"."source_collaborator_id" is not null))
);
--> statement-breakpoint
INSERT INTO "auth_identities" ("id", "email", "email_verified", "display_name", "image", "role", "active", "source_user_id", "source_collaborator_id", "created_at", "updated_at")
SELECT "id", lower("email"), "email_verified", "display_name", "image", "role", "active",
	CASE WHEN "role" = 'administrator' THEN "id" ELSE NULL END,
	CASE WHEN "role" = 'collaborator' THEN "collaborator_id" ELSE NULL END,
	"created_at", "updated_at"
FROM "users"
WHERE "role" = 'administrator' OR "collaborator_id" IS NOT NULL
ON CONFLICT DO NOTHING;
--> statement-breakpoint
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_source_user_id_users_id_fk" FOREIGN KEY ("source_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_source_collaborator_id_collaborators_id_fk" FOREIGN KEY ("source_collaborator_id") REFERENCES "public"."collaborators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "auth_identities_email_unique" ON "auth_identities" USING btree (lower("email"));--> statement-breakpoint
CREATE UNIQUE INDEX "auth_identities_user_unique" ON "auth_identities" USING btree ("source_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_identities_collaborator_unique" ON "auth_identities" USING btree ("source_collaborator_id");--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_auth_identities_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_identities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_auth_identities_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_identities"("id") ON DELETE cascade ON UPDATE no action;
