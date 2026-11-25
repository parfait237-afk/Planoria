DROP INDEX "project_members_pk";--> statement-breakpoint
DROP INDEX "projects_active_name_unique";--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_pk" PRIMARY KEY("project_id","collaborator_id");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_active_name_unique" ON "projects" USING btree ("name") WHERE "projects"."archived_at" is null;