"use client";

import { ArrowLeft, KeyRound, LoaderCircle, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { accountHome, isAccountCategory } from "@/lib/account-category";

const GENERIC_MESSAGE = "Si cette adresse est autorisée, un code de connexion vient d’être envoyé.";

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (step === "otp") otpRef.current?.focus(); }, [step]);
  useEffect(() => { if (!cooldown) return; const id = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000); return () => window.clearInterval(id); }, [cooldown]);

  async function sendCode(event?: FormEvent) {
    event?.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalized)) { setError("Saisissez une adresse e-mail valide."); return; }
    setPending(true); setError("");
    try {
      const response = await fetch("/api/auth/request-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: normalized }) });
      const payload = await response.json() as { success?: boolean; error?: string };
      if (!response.ok || !payload.success) { setError(payload.error ?? "Le service de connexion est temporairement indisponible. Veuillez réessayer."); return; }
      setEmail(normalized); setMessage(GENERIC_MESSAGE); setStep("otp"); setCooldown(60);
    } catch {
      setError("Le service de connexion est temporairement indisponible. Veuillez réessayer.");
    } finally {
      setPending(false);
    }
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) { setError("Le code doit contenir six chiffres."); return; }
    setPending(true); setError("");
    const result = await authClient.signIn.emailOtp({ email, otp });
    setPending(false);
    if (result.error || !result.data) {
      const code = result.error?.code;
      setError(code === "OTP_EXPIRED" ? "Ce code a expiré. Demandez-en un nouveau." : code === "TOO_MANY_ATTEMPTS" ? "La limite de tentatives est atteinte. Demandez un nouveau code." : "Le code est incorrect ou n’est plus valide.");
      return;
    }
    const role = (result.data.user as typeof result.data.user & { role?: unknown }).role;
    if (!isAccountCategory(role)) { setError("Le type de compte enregistré est invalide. Contactez un administrateur."); return; }
    router.replace(accountHome(role));
    router.refresh();
  }

  return step === "email" ? (
    <form className="grid gap-5" onSubmit={sendCode} noValidate>
      <div className="grid gap-2"><label className="text-sm font-semibold text-[#142d4e]" htmlFor="email">Adresse e-mail</label><div className="relative"><Mail className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-[#718096]" aria-hidden="true"/><input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 w-full rounded-xl border border-[#dce4e9] bg-white pr-4 pl-11 text-[#142d4e] outline-none transition focus:border-[#059e79] focus:ring-3 focus:ring-[#059e79]/15" placeholder="vous@entreprise.com" /></div></div>
      {error ? <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <button disabled={pending} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#078363] px-5 font-semibold text-white transition hover:bg-[#066e54] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79] disabled:cursor-not-allowed disabled:opacity-60">{pending ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true"/> : <KeyRound className="size-5" aria-hidden="true"/>}Recevoir un code</button>
    </form>
  ) : (
    <form className="grid gap-5" onSubmit={verifyCode}>
      <p className="text-sm leading-6 text-[#657387]">{message}<br/><span className="font-semibold text-[#142d4e]">{email.replace(/^(.{2}).*(@.*)$/, "$1••••$2")}</span></p>
      <div className="grid gap-2"><label className="text-sm font-semibold text-[#142d4e]" htmlFor="otp">Code de vérification</label><input ref={otpRef} id="otp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} className="h-14 w-full rounded-xl border border-[#dce4e9] bg-white px-4 text-center text-2xl font-bold tracking-[0.45em] text-[#142d4e] outline-none transition focus:border-[#059e79] focus:ring-3 focus:ring-[#059e79]/15" /></div>
      {error ? <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <button disabled={pending} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#078363] px-5 font-semibold text-white transition hover:bg-[#066e54] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79] disabled:opacity-60">{pending && <LoaderCircle className="size-5 animate-spin" aria-hidden="true"/>}Vérifier et se connecter</button>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><button type="button" onClick={() => { setStep("email"); setOtp(""); setError(""); }} className="flex items-center gap-1.5 font-medium text-[#526377] hover:text-[#142d4e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79]"><ArrowLeft className="size-4" aria-hidden="true"/>Modifier mon adresse</button><button type="button" disabled={pending || cooldown > 0} onClick={() => void sendCode()} className="font-semibold text-[#078363] hover:text-[#066e54] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79] disabled:text-[#9aa8b5]">{cooldown ? `Renvoyer dans ${cooldown} s` : "Renvoyer un code"}</button></div>
    </form>
  );
}
