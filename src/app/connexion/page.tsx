import { redirect } from "next/navigation";
import { PlanoriaLogo } from "@/components/brand/planoria-logo";
import { LoginForm } from "@/features/auth/components/login-form";
import { getCurrentSession } from "@/server/auth/session";
import { accountHome } from "@/lib/account-category";

export default async function LoginPage() {
  const session = await getCurrentSession();
  if (session) redirect(accountHome(session.user.role));
  return <main className="grid min-h-dvh place-items-center bg-[#f3f7f6] px-4 py-8"><section className="w-full max-w-[440px] rounded-[24px] border border-[#e2e9e7] bg-white p-7 shadow-[0_24px_70px_rgb(20_45_78_/_10%)] sm:p-10"><div className="mb-8 flex items-center gap-3"><PlanoriaLogo size={46} title="Logo Planoria"/><span className="text-2xl font-extrabold text-[#142d4e]">Planoria<span className="text-[#059e79]">.</span></span></div><h1 className="text-3xl font-bold tracking-tight text-[#142d4e]">Se connecter</h1><p className="mt-3 mb-7 text-sm leading-6 text-[#657387]">Recevez un code à usage unique sur votre adresse e-mail professionnelle.</p><LoginForm/></section></main>;
}
