import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { auth } from "@/server/auth/auth";
import { prepareLoginIdentity, UNKNOWN_EMAIL_MESSAGE } from "@/server/auth/identity-service";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function consumeProtectedLookup(request: Request, email: string) {
  const opaque = createHash("sha256").update(email).digest("hex").slice(0, 24);
  await auth.api.sendVerificationOTP({ body: { email: `blocked+${opaque}@invalid.planoria.local`, type: "sign-in" }, headers: request.headers });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: unknown };
    if (typeof body.email !== "string" || !EMAIL_PATTERN.test(body.email.trim())) return NextResponse.json({ error: "Saisissez une adresse e-mail valide." }, { status: 400 });
    const result = await prepareLoginIdentity(body.email);
    if (result.status === "unknown") {
      await auth.api.sendVerificationOTP({ body: { email: result.email, type: "sign-in" }, headers: request.headers });
      return NextResponse.json({ error: UNKNOWN_EMAIL_MESSAGE }, { status: 404 });
    }
    if (result.status === "unauthorized") {
      await consumeProtectedLookup(request, result.email);
      return NextResponse.json({ error: "Ce compte n’est pas autorisé à se connecter. Veuillez contacter votre administrateur." }, { status: 403 });
    }
    await auth.api.sendVerificationOTP({ body: { email: result.email, type: "sign-in" }, headers: request.headers });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Le service de connexion est temporairement indisponible. Veuillez réessayer." }, { status: 503 });
  }
}
