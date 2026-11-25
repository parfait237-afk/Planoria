"use client";

import { useState } from "react";

import { AdminSidebar, type AdminSidebarProps } from "@/components/layout/admin-sidebar";
import { PlanTaskModal, type PlanTaskValues } from "@/features/tasks/components/modals/task-form-modal";
import { PreferencesModal } from "@/features/workspace/components/preferences-modal";
import { WorkspaceInfoModal } from "@/features/workspace/components/workspace-info-modal";

type OpenModal = "workspace" | "preferences" | "plan-task" | null;

export type AdminSidebarWithModalsProps = Omit<
  AdminSidebarProps,
  "onWorkspace" | "onPreferences" | "onPlanTask"
> & {
  compact?: boolean;
  onCompactChange?: (compact: boolean) => void;
  onCreateTask?: (values: PlanTaskValues) => void | Promise<void>;
  onManageProjectMembers?: () => void;
};

export function AdminSidebarWithModals({
  compact: controlledCompact,
  onCompactChange,
  onCreateTask,
  onManageProjectMembers,
  ...sidebarProps
}: AdminSidebarWithModalsProps) {
  const [openModal, setOpenModal] = useState<OpenModal>(null);
  const [localCompact, setLocalCompact] = useState(false);
  const compact = controlledCompact ?? localCompact;

  const handleCompactChange = (value: boolean) => {
    if (controlledCompact === undefined) setLocalCompact(value);
    onCompactChange?.(value);
  };

  return (
    <>
      <AdminSidebar
        {...sidebarProps}
        onWorkspace={() => setOpenModal("workspace")}
        onPreferences={() => setOpenModal("preferences")}
        onPlanTask={() => setOpenModal("plan-task")}
      />
      <WorkspaceInfoModal open={openModal === "workspace"} onClose={() => setOpenModal(null)} />
      <PreferencesModal
        open={openModal === "preferences"}
        compact={compact}
        onCompactChange={handleCompactChange}
        onClose={() => setOpenModal(null)}
      />
      <PlanTaskModal
        open={openModal === "plan-task"}
        onClose={() => setOpenModal(null)}
        onSubmit={onCreateTask}
        onManageProjectMembers={onManageProjectMembers}
      />
    </>
  );
}

