import { config } from "dotenv";
import { count } from "drizzle-orm";
import { db } from "../src/db/client";
import { activityEvents, collaborators, projectMembers, projects, taskChecklistItems, taskDecisions, tasks, users } from "../src/db/schema";
import { PLANORIA_DEMO_DATA } from "../src/mocks/planoria-demo-data";

config({ path: ".env.local" });
config({ path: ".env" });

const collaboratorIds:Record<string,string>={alice:"10000000-0000-4000-8000-000000000001",marc:"10000000-0000-4000-8000-000000000002",sarah:"10000000-0000-4000-8000-000000000003",david:"10000000-0000-4000-8000-000000000004"};
const projectIds:Record<string,string>={"success-design":"20000000-0000-4000-8000-000000000001","success-stylz":"20000000-0000-4000-8000-000000000002","event-manager":"20000000-0000-4000-8000-000000000003","archive-brand":"20000000-0000-4000-8000-000000000004"};
const taskIds=Object.fromEntries(PLANORIA_DEMO_DATA.tasks.map((task,index)=>[task.id,`30000000-0000-4000-8000-${String(index+1).padStart(12,"0")}`]));
const adminId="00000000-0000-4000-8000-000000000001";
const statusMap={"À faire":"todo","En cours":"in_progress","En pause":"paused","Bloquée":"blocked","Terminée":"completed","Validée":"validated"} as const;
const priorityMap={Urgente:"urgent",Normale:"normal",Faible:"low"} as const;
const projectStatusMap={"À planifier":"to_plan","En cours":"in_progress","En pause":"paused",Terminé:"completed",Archivé:"archived"} as const;
const colorMap={Émeraude:"emerald",Bleu:"blue",Violet:"violet",Ambre:"amber",Corail:"coral"} as const;
const isoDate=(offset:number)=>`2026-11-${String(16+offset).padStart(2,"0")}`;
const eventType=(type:string|undefined):"creation"|"modification"|"status"|"validation"|"correction"=>{
  if(type==="Validation") return "validation";
  if(type==="Correction") return "correction";
  if(type==="Création") return "creation";
  if(type==="Modification") return "modification";
  return "status";
};

async function main(){
  const [existing]=await db.select({value:count()}).from(tasks);
  if(Number(existing.value)>0) throw new Error("Seed annulé : des tâches existent déjà.");
  await db.transaction(async(tx)=>{
    await tx.insert(collaborators).values(PLANORIA_DEMO_DATA.collaborators.map(person=>({id:collaboratorIds[person.id],name:person.name,initials:person.initials,email:person.email,jobTitle:person.role,accessStatus:"not_invited" as const,invitationDraft:person.invitationDraft})));
    await tx.insert(users).values({id:adminId,externalAuthId:"pending:administrator",email:"admin@planoria.local",displayName:"Tchamabe D.",role:"administrator",active:true});
    await tx.insert(projects).values(PLANORIA_DEMO_DATA.projects.map(project=>({id:projectIds[project.id],name:project.name,description:project.description,color:colorMap[project.color??"Émeraude"],status:projectStatusMap[project.status??"À planifier"],startDate:project.startDate,targetDate:project.targetDate,ownerId:project.ownerId?collaboratorIds[project.ownerId]:null,archivedAt:project.status==="Archivé"?new Date("2026-11-16T00:00:00+01:00"):null})));
    const memberships=PLANORIA_DEMO_DATA.projects.flatMap(project=>Array.from(new Set([...(project.memberIds??[]),...(project.ownerId?[project.ownerId]:[])])).map(collaboratorId=>({projectId:projectIds[project.id],collaboratorId:collaboratorIds[collaboratorId]})));
    if(memberships.length) await tx.insert(projectMembers).values(memberships);
    await tx.insert(tasks).values(PLANORIA_DEMO_DATA.tasks.map(task=>({id:taskIds[task.id],title:task.title,instructions:task.description,projectId:projectIds[task.projectId],category:task.category,assigneeId:collaboratorIds[task.collaboratorId],priority:priorityMap[task.priority],status:statusMap[task.status],plannedDate:isoDate(task.plannedOffset),startTime:task.startTime,endTime:task.endTime,dueDate:isoDate(task.dueOffset),estimatedMinutes:task.estimatedMinutes,recurrence:task.recurrence&&task.recurrence!=="Aucune"?{frequency:"weekly" as const,interval:1}:null,correctionRequestedAt:task.correctionRequested?new Date("2026-11-15T16:40:00+01:00"):null,correctionReason:task.correctionReason,completedAt:["Terminée","Validée"].includes(task.status)?new Date("2026-11-16T10:00:00+01:00"):null,validatedAt:task.status==="Validée"?new Date("2026-11-16T10:15:00+01:00"):null})));
    const checklist=PLANORIA_DEMO_DATA.tasks.flatMap(task=>(task.checklist??[]).map((item,position)=>({id:item.id.replace(/^t(\d+)-c(\d+)$/,"40000000-0000-4000-8000-0000000000$1$2"),taskId:taskIds[task.id],label:item.label,position,completedAt:item.completed?new Date("2026-11-16T10:00:00+01:00"):null})));
    if(checklist.length) await tx.insert(taskChecklistItems).values(checklist);
    const decisions=PLANORIA_DEMO_DATA.tasks.flatMap(task=>(task.validationHistory??[]).map((decision,index)=>({id:`50000000-0000-4000-8000-${String(Number(task.id.slice(1))*10+index+1).padStart(12,"0")}`,taskId:taskIds[task.id],authorUserId:adminId,type:decision.type,reason:decision.reason,createdAt:new Date(task.id==="t10"?"2026-11-16T10:15:00+01:00":"2026-11-15T16:40:00+01:00")})));
    if(decisions.length) await tx.insert(taskDecisions).values(decisions);
    await tx.insert(activityEvents).values(PLANORIA_DEMO_DATA.activities.map((event,index)=>({id:`60000000-0000-4000-8000-${String(index+1).padStart(12,"0")}`,type:eventType(event.type),taskId:taskIds[event.taskId],projectId:event.projectId?projectIds[event.projectId]:PLANORIA_DEMO_DATA.tasks.find(task=>task.id===event.taskId)?.projectId?projectIds[PLANORIA_DEMO_DATA.tasks.find(task=>task.id===event.taskId)!.projectId]:null,collaboratorId:collaboratorIds[event.collaboratorId],authorUserId:adminId,summary:event.action,changes:event.changes??[],createdAt:new Date(event.timestamp??`2026-11-16T${String(8+index).padStart(2,"0")}:00:00+01:00`)})));
  });
  const totals=await Promise.all([collaborators,projects,tasks,taskChecklistItems,taskDecisions,activityEvents].map(table=>db.select({value:count()}).from(table)));
  console.log(JSON.stringify({collaborators:Number(totals[0][0].value),projects:Number(totals[1][0].value),tasks:Number(totals[2][0].value),checklistItems:Number(totals[3][0].value),decisions:Number(totals[4][0].value),events:Number(totals[5][0].value)},null,2));
}
main().catch(error=>{console.error(error instanceof Error?error.message:"Seed impossible.");process.exitCode=1;});
