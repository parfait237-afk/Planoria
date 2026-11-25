import "server-only";

type OtpEmail = { email: string; otp: string };

function required(name: "RESEND_API_KEY" | "EMAIL_FROM") {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`La variable serveur ${name} est absente.`);
  return value;
}

export async function sendLoginOtpEmail({ email, otp }: OtpEmail) {
  const mode = process.env.EMAIL_MODE?.trim().toLowerCase();
  const allowed = process.env.TEST_ALLOWED_EMAIL?.trim().toLowerCase();
  if ((mode === "test" || mode === "resend-test") && (!allowed || email.toLowerCase() !== allowed)) {
    throw new Error("Ce destinataire n’est pas autorisé par la configuration d’envoi de test.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${required("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: required("EMAIL_FROM"),
      to: [email],
      subject: "Votre code de connexion Planoria",
      html: `<div style="font-family:Arial,sans-serif;color:#142d4e;line-height:1.6"><h1 style="font-size:22px">Connexion à Planoria</h1><p>Votre code de vérification est :</p><p style="font-size:30px;font-weight:700;letter-spacing:8px;color:#078363">${otp}</p><p>Ce code expire dans 5 minutes et ne peut être utilisé qu’une seule fois.</p><p>Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.</p></div>`,
      text: `Votre code de connexion Planoria est ${otp}. Il expire dans 5 minutes. Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.`,
    }),
  });
  if (!response.ok) throw new Error(`Resend a refusé l’envoi (${response.status}).`);
}
