"use client";

import { Modal } from "@/components/ui/modal";

export type WorkspaceInfoModalProps = {
  open: boolean;
  onClose: () => void;
  role?: string;
  collaborators?: number;
  projects?: string[];
};

export function WorkspaceInfoModal({
  open,
  onClose,
  role = "Administrateur",
  collaborators = 4,
  projects = ["Success Design", "Success Stylz", "Event Manager"],
}: WorkspaceInfoModalProps) {
  return (
    <Modal
      open={open}
      onRequestClose={onClose}
      title="Success Workspace"
      description="Votre espace de démonstration Planoria."
      size="sm"
    >
      <dl className="grid gap-2 text-[13px] leading-5 text-[#536477]">
        <div className="flex gap-1">
          <dt className="font-semibold text-[#142d4e]">Rôle :</dt>
          <dd>{role}</dd>
        </div>
        <div className="flex gap-1">
          <dt className="font-semibold text-[#142d4e]">Équipe :</dt>
          <dd>{collaborators} collaborateurs</dd>
        </div>
        <div className="flex gap-1">
          <dt className="font-semibold text-[#142d4e]">Projets :</dt>
          <dd>{projects.join(", ")}</dd>
        </div>
      </dl>
    </Modal>
  );
}

