import { LoaderCircle } from "lucide-react";
export default function Loading() { return <main className="grid min-h-dvh place-items-center bg-[#f7f9fb] text-[#142d4e]"><div className="flex items-center gap-3 text-sm"><LoaderCircle className="size-5 animate-spin text-[#059e79]" aria-hidden="true" />Chargement des données…</div></main>; }
