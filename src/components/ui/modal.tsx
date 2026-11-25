"use client";

// Primitive de dialogue partagée par toutes les fonctionnalités.

import { LoaderCircle, X } from "lucide-react";
import {
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

export type ModalCloseReason = "close-button" | "escape" | "backdrop" | "cancel";
export type ModalSize = "sm" | "md" | "lg" | "xl";

export type ModalProps = {
  open: boolean;
  onRequestClose: (reason: ModalCloseReason) => void;
  title: string;
  description?: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  loading?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  closeLabel?: string;
};

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "max-w-[516px]",
  md: "max-w-[640px]",
  lg: "max-w-[752px]",
  xl: "max-w-[920px]",
};

export function Modal({
  open,
  onRequestClose,
  title,
  description,
  eyebrow,
  children,
  footer,
  size = "md",
  closeOnEscape = true,
  closeOnBackdrop = true,
  loading = false,
  initialFocusRef,
  closeLabel = "Fermer",
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const frame = requestAnimationFrame(() => {
        initialFocusRef?.current?.focus();
      });

      return () => {
        cancelAnimationFrame(frame);
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [initialFocusRef, mounted, open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open && dialog?.open) {
      dialog.close();
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, [mounted, open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
      if (closeOnEscape && !loading) onRequestClose("escape");
    };
    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [closeOnEscape, loading, mounted, onRequestClose]);

  // Le serveur et le premier rendu client renvoient tous deux null. Le portail
  // n'est créé qu'après l'hydratation, ce qui garde leurs arbres identiques.
  if (!mounted) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      aria-busy={loading || undefined}
      className={`m-auto max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] overflow-hidden rounded-[15px] border-0 bg-white p-0 text-[#142d4e] shadow-[0_24px_80px_rgb(20_45_78_/_28%)] backdrop:bg-[#18324c]/45 backdrop:backdrop-blur-[3px] ${SIZE_CLASSES[size]}`}
      onClick={(event) => {
        if (event.target === event.currentTarget && closeOnBackdrop && !loading) {
          onRequestClose("backdrop");
        }
      }}
    >
      <div className="flex max-h-[calc(100dvh-24px)] min-h-0 flex-col">
        <header className="relative shrink-0 border-b border-[#edf0f2] bg-white px-6 py-5 pr-16 sm:px-7 sm:py-6 sm:pr-16">
          {eyebrow ? (
            <p className="mb-2 text-[10px] font-bold tracking-[2px] text-[#059e79] uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h2 id={titleId} className="text-[22px] leading-tight font-bold text-[#142d4e] sm:text-[25px]">
            {title}
          </h2>
          {description ? (
            <p id={descriptionId} className="mt-2 text-xs leading-5 text-[#667486] sm:text-[13px]">
              {description}
            </p>
          ) : null}
          <button
            type="button"
            aria-label={closeLabel}
            disabled={loading}
            className="absolute top-5 right-5 grid size-9 place-items-center rounded-lg text-[#657387] transition-colors hover:bg-[#f3f6f7] hover:text-[#142d4e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79] disabled:cursor-not-allowed disabled:opacity-50 [&>svg]:size-5 [&>svg]:stroke-[1.8]"
            onClick={() => onRequestClose("close-button")}
          >
            {loading ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <X aria-hidden="true" />}
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 [scrollbar-color:#b8c1c9_transparent] [scrollbar-width:thin] sm:px-7">
          {children}
        </div>

        {footer ? (
          <footer className="shrink-0 border-t border-[#edf0f2] bg-white px-6 py-4 sm:px-7">
            {footer}
          </footer>
        ) : null}
      </div>
    </dialog>,
    document.body,
  );
}

