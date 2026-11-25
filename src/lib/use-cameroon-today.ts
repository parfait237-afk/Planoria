"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { millisecondsUntilNextCameroonDay } from "@/lib/cameroon-date";

export function useCameroonToday(referenceDate: string, referenceInstant: string) {
  const router = useRouter();
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => router.refresh();
    const schedule = () => { clearTimeout(timer); const minute = 60_000 - (Date.now() % 60_000) + 250; const midnight = millisecondsUntilNextCameroonDay(); timer = setTimeout(() => { if (document.visibilityState === "visible") refresh(); schedule(); }, Math.min(minute, midnight)); };
    const onVisibility = () => { if (document.visibilityState === "visible") { refresh(); schedule(); } };
    schedule(); document.addEventListener("visibilitychange", onVisibility); window.addEventListener("focus", refresh);
    return () => { clearTimeout(timer); document.removeEventListener("visibilitychange", onVisibility); window.removeEventListener("focus", refresh); };
  }, [referenceDate, referenceInstant, router]);
  return referenceDate;
}
