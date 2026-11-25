import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { activityEvents, taskDecisions, tasks } from "@/db/schema";

export async function listActiveTasks() {
  return db.select().from(tasks).where(isNull(tasks.archivedAt));
}

export async function recordTaskDecision(input:{taskId:string;authorUserId:string;type:"validated"|"correction"|"reopened";reason:string}) {
  return db.transaction(async (tx) => {
    const [task]=await tx.select().from(tasks).where(and(eq(tasks.id,input.taskId),isNull(tasks.archivedAt))).limit(1);
    if(!task) throw new Error("Tâche introuvable.");
    const nextStatus=input.type==="validated"?"validated":input.type==="correction"?"in_progress":"in_progress";
    const [decision]=await tx.insert(taskDecisions).values(input).returning();
    await tx.update(tasks).set({status:nextStatus,correctionReason:input.type==="correction"?input.reason:null,validatedAt:input.type==="validated"?new Date():null,updatedAt:new Date()}).where(eq(tasks.id,input.taskId));
    await tx.insert(activityEvents).values({type:input.type==="validated"?"validation":"correction",taskId:task.id,projectId:task.projectId,collaboratorId:task.assigneeId,authorUserId:input.authorUserId,summary:input.type==="validated"?"Tâche validée":"Décision de correction",changes:[{field:"status",before:task.status,after:nextStatus}]});
    return decision;
  });
}
