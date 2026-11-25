"use client";

import { useRef } from "react";

import { Modal } from "@/components/ui/modal";

export type UnsavedChangesModalProps = {
  open: boolean;
  onContinue: () => void;
  onDiscard: () => void;
};

export function UnsavedChangesModal({ open, onContinue, onDiscard }: UnsavedChangesModalProps) {
  const continueRef = useRef<HTMLButtonElement>(null);

  return (
    <Modal
      open={open}
      onRequestClose={onContinue}
      title="Modifications non enregistrées"
      description="Si vous fermez ce formulaire, vos modifications seront perdues."
      eyebrow="Saisie en cours"
      size="sm"
      closeOnBackdrop={false}
      initialFocusRef={continueRef}
      footer={
        <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
          <button
            ref={continueRef}
            type="button"
            className="min-h-10 rounded-lg border border-[#dfe5e9] bg-white px-4 text-xs font-semibold text-[#334b61] hover:bg-[#f6f8f9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79]"
            onClick={onContinue}
          >
            Continuer la saisie
          </button>
          <button
            type="button"
            className="min-h-10 rounded-lg bg-[#059e79] px-4 text-xs font-semibold text-white hover:bg-[#078363] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79]"
            onClick={onDiscard}
          >
            Abandonner les modifications
          </button>
        </div>
      }
    >
      <span className="sr-only">Choisissez de poursuivre ou d’abandonner la saisie.</span>
    </Modal>
  );
}
