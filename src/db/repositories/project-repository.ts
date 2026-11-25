import "server-only";
import { db } from "@/db";
import { projectMembers, projects } from "@/db/schema";

export async function createProjectWithMembers(input:typeof projects.$inferInsert & {memberIds:string[]}) {
  return db.transaction(async (tx)=>{
    const {memberIds: requestedMembers,...values}=input;
    const [project]=await tx.insert(projects).values(values).returning();
    const memberIds=new Set(requestedMembers);
    if(values.ownerId) memberIds.add(values.ownerId);
    if(memberIds.size) await tx.insert(projectMembers).values([...memberIds].map(collaboratorId=>({projectId:project.id,collaboratorId})));
    return project;
  });
}
