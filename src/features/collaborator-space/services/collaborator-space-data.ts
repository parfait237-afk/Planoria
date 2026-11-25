import "server-only";
import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { activityEvents, collaborators, projects, taskChecklistItems, taskComments, tasks, users } from "@/db/schema";
import { cameroonDateKey, formatCameroonInstant } from "@/lib/cameroon-date";
import type { CollaboratorSpaceData } from "@/features/collaborator-space/types/collaborator-space";

export async function loadCollaboratorSpaceData(collaboratorId:string):Promise<CollaboratorSpaceData>{
  const person=await db.query.collaborators.findFirst({where:and(eq(collaborators.id,collaboratorId),eq(collaborators.accessStatus,"active"),isNull(collaborators.archivedAt))});
  if(!person) throw new Error("Le compte collaborateur n’est plus actif.");
  const taskRows=await db.select().from(tasks).where(and(eq(tasks.assigneeId,collaboratorId),isNull(tasks.archivedAt))).orderBy(asc(tasks.plannedDate),asc(tasks.createdAt));
  const ids=taskRows.map((task)=>task.id);
  const projectIds=[...new Set(taskRows.map((task)=>task.projectId))];
  const [projectRows,checklistRows,commentRows,eventRows,userRows]=await Promise.all([
    projectIds.length?db.select({id:projects.id,name:projects.name}).from(projects).where(inArray(projects.id,projectIds)):[],
    ids.length?db.select().from(taskChecklistItems).where(inArray(taskChecklistItems.taskId,ids)).orderBy(asc(taskChecklistItems.position)):[],
    ids.length?db.select().from(taskComments).where(and(inArray(taskComments.taskId,ids),isNull(taskComments.archivedAt))).orderBy(asc(taskComments.createdAt)):[],
    db.select({id:activityEvents.id,taskId:activityEvents.taskId,summary:activityEvents.summary,createdAt:activityEvents.createdAt}).from(activityEvents).where(eq(activityEvents.collaboratorId,collaboratorId)).orderBy(desc(activityEvents.createdAt)).limit(40),
    db.select({id:users.id,name:users.displayName}).from(users),
  ]);
  const projectNames=new Map(projectRows.map((row)=>[row.id,row.name])); const userNames=new Map(userRows.map((row)=>[row.id,row.name]));
  return {collaborator:{id:person.id,name:person.name,initials:person.initials,jobTitle:person.jobTitle},today:cameroonDateKey(),tasks:taskRows.map((task)=>({id:task.id,title:task.title,instructions:task.instructions,projectName:projectNames.get(task.projectId)??"Projet",category:task.category,priority:task.priority,status:task.status,plannedDate:task.plannedDate,dueDate:task.dueDate,dueTime:task.dueTime,startTime:task.startTime,endTime:task.endTime,correctionReason:task.correctionReason,checklist:checklistRows.filter((item)=>item.taskId===task.id).map((item)=>({id:item.id,label:item.label,completed:Boolean(item.completedAt)})),comments:commentRows.filter((comment)=>comment.taskId===task.id).map((comment)=>({id:comment.id,body:comment.body,author:comment.authorCollaboratorId===collaboratorId?person.name:userNames.get(comment.authorUserId??"")??"Administrateur",createdAt:formatCameroonInstant(comment.createdAt)}))})),activities:eventRows.map((event)=>({id:event.id,taskId:event.taskId,summary:event.summary,createdAt:formatCameroonInstant(event.createdAt)}))};
}
