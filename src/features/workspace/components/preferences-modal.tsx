"use client";

import { Modal } from "@/components/ui/modal";

export type PreferencesModalProps = {
  open: boolean;
  compact: boolean;
  onCompactChange: (compact: boolean) => void;
  onClose: () => void;
};

export function PreferencesModal({
  open,
  compact,
  onCompactChange,
  onClose,
}: PreferencesModalProps) {
  return (
    <Modal
      open={open}
      onRequestClose={onClose}
      title="Préférences d’affichage"
      description="Personnalisez votre espace de travail."
      size="sm"
    >
      <label className="flex cursor-pointer items-center gap-3 text-[13px] font-medium text-[#142d4e]">
        <input
          type="checkbox"
          checked={compact}
          onChange={(event) => onCompactChange(event.target.checked)}
          className="size-4 rounded border-[#cbd5dc] accent-[#059e79] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79]"
        />
        Affichage compact
      </label>
      <p className="mt-5 text-xs leading-5 text-[#667486]">
        Les tâches de cette démonstration sont conservées dans ce navigateur.
      </p>
    </Modal>
  );
}

