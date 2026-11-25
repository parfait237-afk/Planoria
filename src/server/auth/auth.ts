import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendLoginOtpEmail } from "@/server/email/resend";
import { eq } from "drizzle-orm";
import { isIdentityAuthorized } from "@/server/auth/identity-service";

export const auth = betterAuth({
  appName: "Planoria",
  database: drizzleAdapter(db, { provider: "pg", schema, transaction: true }),
  user: {
    modelName: "authIdentities",
    fields: { name: "displayName", emailVerified: "emailVerified" },
    additionalFields: {
      role: { type: ["administrator", "collaborator"], required: true, input: false },
      active: { type: "boolean", required: true, input: false },
      sourceUserId: { type: "string", required: false, input: false },
      sourceCollaboratorId: { type: "string", required: false, input: false },
    },
  },
  session: { modelName: "sessions", expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  account: { modelName: "accounts" },
  verification: { modelName: "verifications" },
  plugins: [emailOTP({
    disableSignUp: true,
    otpLength: 6,
    expiresIn: 300,
    allowedAttempts: 3,
    storeOTP: "hashed",
    resendStrategy: "rotate",
    rateLimit: { window: 60, max: 3 },
    sendVerificationOTP: async ({ email, otp, type }) => {
      if (type !== "sign-in") return;
      const user = await db.query.authIdentities.findFirst({ where: eq(schema.authIdentities.email, email), columns: { active: true } });
      if (user?.active) await sendLoginOtpEmail({ email, otp });
    },
  })],
  rateLimit: { enabled: true, storage: "database", modelName: "rateLimits", window: 60, max: 10, customRules: { "/email-otp/send-verification-otp": { window: 60, max: 3 }, "/sign-in/email-otp": { window: 300, max: 10 } } },
  advanced: { database: { generateId: "uuid" }, useSecureCookies: process.env.NODE_ENV === "production", cookiePrefix: "planoria" },
  databaseHooks: { session: { create: { before: async (session) => {
    return await isIdentityAuthorized(session.userId) ? undefined : false;
  } } } },
});
