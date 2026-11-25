import { pgEnum } from "drizzle-orm/pg-core";
export const appRoleEnum=pgEnum("app_role",["administrator","collaborator"]);
export const accessStatusEnum=pgEnum("access_status",["not_invited","invited","active","suspended"]);
export const projectStatusEnum=pgEnum("project_status",["to_plan","in_progress","paused","completed","archived"]);
export const projectColorEnum=pgEnum("project_color",["emerald","blue","violet","amber","coral"]);
export const taskStatusEnum=pgEnum("task_status",["todo","in_progress","paused","blocked","completed","validated"]);
export const taskPriorityEnum=pgEnum("task_priority",["urgent","normal","low"]);
export const decisionTypeEnum=pgEnum("decision_type",["validated","correction","reopened"]);
export const eventTypeEnum=pgEnum("event_type",["creation","modification","status","validation","correction","comment"]);
