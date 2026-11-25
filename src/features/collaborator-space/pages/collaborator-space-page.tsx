import { requireCollaborator } from "@/server/auth/session";
import { loadCollaboratorSpaceData } from "@/features/collaborator-space/services/collaborator-space-data";
import { CollaboratorSpaceView } from "@/features/collaborator-space/components/collaborator-space-view";
export async function CollaboratorSpacePage(){const user=await requireCollaborator();const data=await loadCollaboratorSpaceData(user.sourceCollaboratorId!);return <CollaboratorSpaceView initialData={data}/>;}
