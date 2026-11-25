"use client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  return <button type="button" onClick={async () => { await authClient.signOut(); router.replace("/connexion"); router.refresh(); }} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#dce4e9] px-4 py-2.5 text-sm font-semibold text-[#526377] transition hover:bg-[#f4f7f8] hover:text-[#142d4e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79]"><LogOut className="size-4" aria-hidden="true"/>{compact ? null : "Se déconnecter"}</button>;
}
