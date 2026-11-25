"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { PlanoriaData } from "@/features/tasks/types/task";
import { useCameroonToday } from "@/lib/use-cameroon-today";
type Value = { data: PlanoriaData; replaceData: (data: PlanoriaData) => void };
const Context = createContext<Value | null>(null);
const DATA_EVENT = "planoria:data-replaced";

export function PlanoriaDataProvider({ initialData, children }: { initialData: PlanoriaData; children: ReactNode }) {
  const [data, setData] = useState(initialData);
  const [previousInitialData, setPreviousInitialData] = useState(initialData);
  if (previousInitialData !== initialData) {
    setPreviousInitialData(initialData);
    setData(initialData);
  }
  useCameroonToday(data.referenceDate, data.referenceInstant);
  useEffect(() => {
    const update = (event: Event) => setData((event as CustomEvent<PlanoriaData>).detail);
    window.addEventListener(DATA_EVENT, update);
    return () => window.removeEventListener(DATA_EVENT, update);
  }, []);
  return <Context.Provider value={{ data, replaceData: setData }}>{children}</Context.Provider>;
}

export function replacePlanoriaData(data: PlanoriaData) { window.dispatchEvent(new CustomEvent(DATA_EVENT, { detail: data })); }

export function usePlanoriaData() {
  const context = useContext(Context);
  if (!context) throw new Error("usePlanoriaData doit être utilisé dans PlanoriaDataProvider.");
  return context.data;
}
