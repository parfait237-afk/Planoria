"use client";

import { ChevronDown, LoaderCircle, Plus, Trash2, Users } from "lucide-react";
import { type FormEvent, useId, useMemo, useRef, useState } from "react";

import { Modal } from "@/components/ui/modal";
import { UnsavedChangesModal } from "@/components/ui/unsaved-changes-modal";
import { TASK_PRIORITIES, TASK_STATUSES, type TaskChecklistItem, type TaskFormValues } from "@/features/tasks/types/task";
import { usePlanoriaData } from "@/store/planoria-store";

export type PlanTaskValues = TaskFormValues;

export type PlanTaskModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (values: PlanTaskValues) => void | Promise<void>;
  projects?: string[];
  collaborators?: string[];
  onManageProjectMembers?: () => void;
  initialValues?: Partial<PlanTaskValues>;
  modalTitle?: string;
  submitLabel?: string;
};

const inputClass =
  "min-h-10 w-full rounded-[7px] border border-[#dfe6e9] bg-white px-3 text-xs text-[#263e54] outline-none transition-colors placeholder:text-[#95a0aa] focus:border-[#55c5a8] focus:ring-2 focus:ring-[#ccefe5] disabled:bg-[#f4f6f7]";
const labelClass = "mb-1.5 block text-xs font-medium text-[#536477]";
const DEFAULT_PROJECTS = ["Success Design", "Success Stylz", "Event Manager"];
const DEFAULT_COLLABORATORS = ["Alice", "Marc", "Sarah", "David"];

function initialValues(project: string, collaborator: string, today: string): PlanTaskValues {
  return {
    title: "",
    description: "",
    project,
    collaborator,
    plannedDate: today,
    dueDate: today,
    priority: "Normale",
    category: "Design",
    status: "À faire",
    startTime: "",
    endTime: "",
    deadlineTime: "",
    estimatedMinutes: "",
    recurrence: "Aucune",
    checklist: [],
  };
}

export function PlanTaskModal({
  open,
  onClose,
  onSubmit,
  projects,
  collaborators,
  onManageProjectMembers,
  initialValues: suppliedValues,
  modalTitle = "Nouvelle tâche",
  submitLabel = "Créer la tâche",
}: PlanTaskModalProps) {
  const data = usePlanoriaData();
  const projectOptions = projects ?? DEFAULT_PROJECTS;
  const collaboratorOptions = collaborators ?? DEFAULT_COLLABORATORS;
  const formId = useId();
  const titleRef = useRef<HTMLInputElement>(null);
  const itemCounter = useRef(0);
  const baseline = useMemo(
    () => ({
      ...initialValues(projectOptions[0] ?? "", collaboratorOptions[0] ?? "", data.referenceDate),
      ...suppliedValues,
    }),
    [collaboratorOptions, data.referenceDate, projectOptions, suppliedValues],
  );
  const [values, setValues] = useState<PlanTaskValues>(baseline);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const dirty = JSON.stringify(values) !== JSON.stringify(baseline);

  const setField = <K extends keyof PlanTaskValues>(field: K, value: PlanTaskValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const requestClose = () => {
    if (submitting) return;
    if (dirty) setDiscardOpen(true);
    else {
      setAdvancedOpen(false);
      setSubmitError(null);
      setFieldErrors({});
      onClose();
    }
  };

  const addChecklistItem = () => {
    itemCounter.current += 1;
    setField("checklist", [
      ...values.checklist,
      { id: `check-${itemCounter.current}`, label: "", completed: false },
    ]);
  };

  const updateChecklistItem = (id: string, patch: Partial<TaskChecklistItem>) => {
    setField(
      "checklist",
      values.checklist.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    const errors: Record<string, string> = {};
    if (!values.title.trim()) errors.title = "Le titre est obligatoire.";
    if (!values.project) errors.project = "Sélectionnez un projet.";
    if (!values.collaborator) errors.collaborator = "Sélectionnez un collaborateur.";
    if (!values.plannedDate) errors.plannedDate = "La date planifiée est obligatoire.";
    if (!values.dueDate) errors.dueDate = "L’échéance est obligatoire.";
    else if (values.plannedDate && values.dueDate < values.plannedDate) errors.dueDate = "L’échéance doit être postérieure à la date planifiée.";
    if (values.startTime && values.endTime && values.endTime <= values.startTime) errors.endTime = "L’heure de fin doit être postérieure à l’heure de début.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    if (!onSubmit) return;

    setSubmitting(true);
    try {
      await onSubmit(values);
      setValues(baseline);
      setFieldErrors({});
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "La tâche n’a pas pu être enregistrée.");
    } finally {
      setSubmitting(false);
    }
  };

  const completedItems = values.checklist.filter((item) => item.completed).length;

  return (
    <>
      <Modal
        open={open}
        onRequestClose={requestClose}
        title={modalTitle}
        description="Donnez un cadre clair à la prochaine action."
        eyebrow="Planifier & attribuer"
        size="lg"
        loading={submitting}
        initialFocusRef={titleRef}
        closeLabel="Fermer le formulaire"
        footer={
          <div className="flex items-center justify-between gap-4">
            <p className="hidden text-[10px] text-[#7b8792] sm:block">* Champs obligatoires</p>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                disabled={submitting}
                className="min-h-10 rounded-lg border border-[#dfe5e9] bg-white px-4 text-xs font-semibold text-[#334b61] hover:bg-[#f6f8f9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79] disabled:opacity-50"
                onClick={requestClose}
              >
                Annuler
              </button>
              <button
                type="submit"
                form={formId}
                disabled={submitting || !onSubmit}
                title={!onSubmit ? "Connectez un callback de sauvegarde pour créer la tâche" : undefined}
                className="flex min-h-10 items-center gap-2 rounded-lg bg-[#059e79] px-4 text-xs font-semibold text-white hover:bg-[#078363] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79] disabled:cursor-not-allowed disabled:opacity-50 [&>svg]:size-4"
              >
                {submitting ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
                {submitLabel}
              </button>
            </div>
          </div>
        }
      >
        <form id={formId} onSubmit={handleSubmit} noValidate className="grid gap-5">
          <section aria-labelledby={`${formId}-essential`}>
            <h3 id={`${formId}-essential`} className="mb-5 text-xs font-bold text-[#536477]">
              Informations essentielles
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className={labelClass}>Titre de la tâche <span className="text-[#a45b49]">*</span></span>
                <input ref={titleRef} required aria-invalid={Boolean(fieldErrors.title)} className={inputClass} placeholder="Ex. Finaliser la maquette du site web" value={values.title} onChange={(event) => { setField("title", event.target.value); setFieldErrors((current) => ({ ...current, title: "" })); }} />
                {fieldErrors.title ? <p role="alert" className="mt-1 text-[10px] text-[#b95749]">{fieldErrors.title}</p> : null}
              </label>
              <label className="sm:col-span-2">
                <span className={labelClass}>Description / consignes</span>
                <textarea className={`${inputClass} min-h-16 resize-y py-3`} placeholder="Résultat attendu, contexte et instructions utiles..." value={values.description} onChange={(event) => setField("description", event.target.value)} />
              </label>
              <SelectField label="Projet *" value={values.project} options={projectOptions} onChange={(value) => setField("project", value)} required error={fieldErrors.project} />
              <SelectField label="Collaborateur *" value={values.collaborator} options={collaboratorOptions} onChange={(value) => setField("collaborator", value)} required error={fieldErrors.collaborator} />
              <Field label="Date planifiée *" type="date" required value={values.plannedDate} onChange={(value) => setField("plannedDate", value)} error={fieldErrors.plannedDate} />
              <Field label="Échéance *" type="date" required min={values.plannedDate} value={values.dueDate} onChange={(value) => setField("dueDate", value)} error={fieldErrors.dueDate} />
              <SelectField label="Priorité" value={values.priority} options={TASK_PRIORITIES} onChange={(value) => setField("priority", value as PlanTaskValues["priority"])} />
            </div>
          </section>

          <div className="flex gap-3 rounded-[9px] border border-[#e4e8ed] bg-[#f5f6fa] px-3 py-3 text-xs text-[#536477]">
            <Users className="mt-0.5 size-4 shrink-0 stroke-[1.7]" aria-hidden="true" />
            <p>
              Attribution autorisée à {values.collaborator}, sans ajout aux membres. {" "}
              <button type="button" className="font-semibold text-[#078363] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-[#059e79]" onClick={onManageProjectMembers}>
                Gérer les membres du projet
              </button>
            </p>
          </div>

          <section className="overflow-hidden rounded-[10px] border border-[#e4e8eb]">
            <button
              type="button"
              aria-expanded={advancedOpen}
              className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-[#f8faf9] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#059e79]"
              onClick={() => setAdvancedOpen((current) => !current)}
            >
              <ChevronDown className={`size-4 shrink-0 text-[#23465e] transition-transform ${advancedOpen ? "rotate-0" : "-rotate-90"}`} aria-hidden="true" />
              <span>
                <strong className="block text-xs text-[#263e54]">Options avancées</strong>
                <small className="mt-1 block text-[11px] text-[#7b8792]">Horaires, durée, récurrence et checklist</small>
              </span>
            </button>

            {advancedOpen ? (
              <div className="border-t border-[#edf0f2] px-4 py-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField label="Catégorie" value={values.category} options={["Design", "Communication", "Organisation", "Production", "Formation", "Autre"]} onChange={(value) => setField("category", value)} />
                  <SelectField
                    label="Statut"
                    value={values.status}
                    options={["Terminée", "Validée"].includes(values.status) ? [values.status] : TASK_STATUSES.filter((status) => !["Terminée", "Validée"].includes(status))}
                    onChange={(value) => setField("status", value)}
                    disabled={["Terminée", "Validée"].includes(values.status)}
                  />
                  <Field label="Heure de début" type="time" value={values.startTime} onChange={(value) => setField("startTime", value)} />
                  <Field label="Heure de fin" type="time" value={values.endTime} onChange={(value) => setField("endTime", value)} error={fieldErrors.endTime} />
                  <Field label="Heure limite" type="time" value={values.deadlineTime} onChange={(value) => setField("deadlineTime", value)} />
                  <Field label="Durée estimée (minutes)" type="number" min="0" placeholder="Ex. 120" value={values.estimatedMinutes} onChange={(value) => setField("estimatedMinutes", value)} />
                  <SelectField label="Récurrence" value={values.recurrence} options={["Aucune", "Quotidienne", "Hebdomadaire", "Mensuelle", "Personnalisée"]} onChange={(value) => setField("recurrence", value)} />
                </div>

                <div className="mt-6 border-t border-[#edf0f2] pt-5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#eaf6f1] px-1.5 py-1 text-[9px] font-bold text-[#059e79]">03</span>
                    <h3 className="text-xs font-bold text-[#263e54]">Checklist</h3>
                    <span className="ml-auto text-[10px] text-[#7b8792]">{completedItems} / {values.checklist.length}</span>
                  </div>
                  <p className="mt-2 text-[11px] text-[#7b8792]">Découpez le travail en étapes simples et vérifiables.</p>
                  <div className="mt-4 grid gap-2">
                    {values.checklist.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <input type="checkbox" checked={item.completed} aria-label={`Sous-étape ${index + 1} terminée`} className="size-4 accent-[#059e79]" onChange={(event) => updateChecklistItem(item.id, { completed: event.target.checked })} />
                        <input autoFocus={index === values.checklist.length - 1} className={inputClass} aria-label={`Texte de la sous-étape ${index + 1}`} placeholder={`Décrire la sous-étape ${index + 1}`} value={item.label} onChange={(event) => updateChecklistItem(item.id, { label: event.target.value })} />
                        <button type="button" aria-label={`Supprimer la sous-étape ${index + 1}`} className="grid size-9 shrink-0 place-items-center rounded-lg text-[#657387] hover:bg-[#f3f6f7] hover:text-[#a14f46] focus-visible:outline-2 focus-visible:outline-[#059e79] [&>svg]:size-4" onClick={() => setField("checklist", values.checklist.filter((entry) => entry.id !== item.id))}>
                          <Trash2 aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                    <button type="button" className="mt-1 flex w-fit items-center gap-1 text-[11px] font-semibold text-[#078363] hover:text-[#046b51] focus-visible:outline-2 focus-visible:outline-[#059e79] [&>svg]:size-3.5" onClick={addChecklistItem}>
                      <Plus aria-hidden="true" /> Ajouter une sous-étape
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          {submitError ? <p role="alert" className="rounded-lg bg-[#fff1ef] px-3 py-2 text-xs text-[#9b4439]">{submitError}</p> : null}
        </form>
      </Modal>

      <UnsavedChangesModal
        open={discardOpen}
        onContinue={() => setDiscardOpen(false)}
        onDiscard={() => {
          setDiscardOpen(false);
          setValues(baseline);
          setAdvancedOpen(false);
          setSubmitError(null);
          setFieldErrors({});
          onClose();
        }}
      />
    </>
  );
}

type FieldProps = {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  min?: string;
  placeholder?: string;
  error?: string;
};

function Field({ label, type, value, onChange, required, min, placeholder, error }: FieldProps) {
  return (
    <label>
      <span className={labelClass}>{label}</span>
      <input className={inputClass} type={type} value={value} required={required} min={min} placeholder={placeholder} aria-invalid={Boolean(error)} onChange={(event) => onChange(event.target.value)} />
      {error ? <p role="alert" className="mt-1 text-[10px] text-[#b95749]">{error}</p> : null}
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
};

function SelectField({ label, value, options, onChange, required, disabled, error }: SelectFieldProps) {
  return (
    <label>
      <span className={labelClass}>{label}</span>
      <select className={inputClass} value={value} required={required} disabled={disabled} aria-invalid={Boolean(error)} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
      {error ? <p role="alert" className="mt-1 text-[10px] text-[#b95749]">{error}</p> : null}
    </label>
  );
}

