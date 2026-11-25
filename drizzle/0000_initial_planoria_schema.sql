CREATE TYPE "public"."access_status" AS ENUM('not_invited', 'invited', 'active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."app_role" AS ENUM('administrator', 'collaborator');--> statement-breakpoint
CREATE TYPE "public"."decision_type" AS ENUM('validated', 'correction', 'reopened');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('creation', 'modification', 'status', 'validation', 'correction', 'comment');--> statement-breakpoint
CREATE TYPE "public"."project_color" AS ENUM('emerald', 'blue', 'violet', 'amber', 'coral');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('to_plan', 'in_progress', 'paused', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('urgent', 'normal', 'low');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('todo', 'in_progress', 'paused', 'blocked', 'completed', 'validated');--> statement-breakpoint
CREATE TABLE "collaborators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"initials" text NOT NULL,
	"email" text,
	"job_title" text,
	"access_status" "access_status" DEFAULT 'not_invited' NOT NULL,
	"invitation_draft" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "collaborators_name_not_blank" CHECK (length(trim("collaborators"."name")) > 0)
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"project_id" uuid NOT NULL,
	"collaborator_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" "project_color" DEFAULT 'emerald' NOT NULL,
	"status" "project_status" DEFAULT 'to_plan' NOT NULL,
	"start_date" date,
	"target_date" date,
	"owner_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "projects_dates_order" CHECK ("projects"."target_date" is null or "projects"."start_date" is null or "projects"."target_date" >= "projects"."start_date")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_auth_id" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"role" "app_role" NOT NULL,
	"collaborator_id" uuid,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "task_checklist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"label" text NOT NULL,
	"position" integer NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "task_checklist_position_nonnegative" CHECK ("task_checklist_items"."position" >= 0),
	CONSTRAINT "task_checklist_label_not_blank" CHECK (length(trim("task_checklist_items"."label")) > 0)
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"instructions" text DEFAULT '' NOT NULL,
	"project_id" uuid NOT NULL,
	"category" text NOT NULL,
	"assignee_id" uuid NOT NULL,
	"priority" "task_priority" DEFAULT 'normal' NOT NULL,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"planned_date" date NOT NULL,
	"start_time" time,
	"end_time" time,
	"due_date" date NOT NULL,
	"due_time" time,
	"estimated_minutes" integer,
	"recurrence" jsonb,
	"correction_requested_at" timestamp with time zone,
	"correction_reason" text,
	"completed_at" timestamp with time zone,
	"validated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "tasks_title_not_blank" CHECK (length(trim("tasks"."title")) > 0),
	CONSTRAINT "tasks_estimated_minutes_positive" CHECK ("tasks"."estimated_minutes" is null or "tasks"."estimated_minutes" > 0),
	CONSTRAINT "tasks_dates_order" CHECK ("tasks"."due_date" >= "tasks"."planned_date"),
	CONSTRAINT "tasks_time_order" CHECK ("tasks"."end_time" is null or "tasks"."start_time" is null or "tasks"."end_time" > "tasks"."start_time")
);
--> statement-breakpoint
CREATE TABLE "activity_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "event_type" NOT NULL,
	"task_id" uuid,
	"project_id" uuid,
	"collaborator_id" uuid,
	"author_user_id" uuid,
	"summary" text NOT NULL,
	"changes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "activity_events_summary_not_blank" CHECK (length(trim("activity_events"."summary")) > 0)
);
--> statement-breakpoint
CREATE TABLE "task_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"author_user_id" uuid,
	"author_collaborator_id" uuid,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "task_comments_body_not_blank" CHECK (length(trim("task_comments"."body")) > 0)
);
--> statement-breakpoint
CREATE TABLE "task_decisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"author_user_id" uuid,
	"type" "decision_type" NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "task_decisions_reason_not_blank" CHECK (length(trim("task_decisions"."reason")) > 0)
);
--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_collaborator_id_collaborators_id_fk" FOREIGN KEY ("collaborator_id") REFERENCES "public"."collaborators"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_collaborators_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."collaborators"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_collaborator_id_collaborators_id_fk" FOREIGN KEY ("collaborator_id") REFERENCES "public"."collaborators"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_checklist_items" ADD CONSTRAINT "task_checklist_items_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_collaborators_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."collaborators"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_collaborator_id_collaborators_id_fk" FOREIGN KEY ("collaborator_id") REFERENCES "public"."collaborators"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_author_collaborator_id_collaborators_id_fk" FOREIGN KEY ("author_collaborator_id") REFERENCES "public"."collaborators"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_decisions" ADD CONSTRAINT "task_decisions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_decisions" ADD CONSTRAINT "task_decisions_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "collaborators_email_unique" ON "collaborators" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "project_members_pk" ON "project_members" USING btree ("project_id","collaborator_id");--> statement-breakpoint
CREATE INDEX "project_members_collaborator_idx" ON "project_members" USING btree ("collaborator_id");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_active_name_unique" ON "projects" USING btree ("name","archived_at");--> statement-breakpoint
CREATE INDEX "projects_owner_idx" ON "projects" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_external_auth_id_unique" ON "users" USING btree ("external_auth_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_collaborator_unique" ON "users" USING btree ("collaborator_id");--> statement-breakpoint
CREATE UNIQUE INDEX "task_checklist_position_unique" ON "task_checklist_items" USING btree ("task_id","position");--> statement-breakpoint
CREATE INDEX "tasks_project_idx" ON "tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "tasks_assignee_idx" ON "tasks" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "tasks_planned_date_idx" ON "tasks" USING btree ("planned_date");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "activity_events_task_idx" ON "activity_events" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "activity_events_project_idx" ON "activity_events" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "activity_events_created_at_idx" ON "activity_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "task_comments_task_idx" ON "task_comments" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "task_decisions_task_idx" ON "task_decisions" USING btree ("task_id");