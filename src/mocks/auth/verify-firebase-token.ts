import { z } from "zod";

const firebaseIdentitySchema = z.object({
  localId: z.string().min(1),
  email: z.email(),
  displayName: z.string().optional(),
  photoUrl: z.url().optional(),
  disabled: z.boolean().optional(),
  providerUserInfo: z.array(z.object({ providerId: z.string() })),
});
const lookupSchema = z.object({
  users: z.array(firebaseIdentitySchema).min(1),
});
const lookupTimeoutMs = 8_000;

export type VerifiedFirebaseIdentity = z.infer<typeof firebaseIdentitySchema>;

// Development-only bridge: identity comes from Google's verified token lookup,
// never from a decoded client JWT or a name/e-mail submitted by the browser.
export const verifyFirebaseToken = async (
  idToken: string,
): Promise<VerifiedFirebaseIdentity | null> => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) return null;
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      signal: AbortSignal.timeout(lookupTimeoutMs),
    },
  );
  if (!response.ok) return null;
  const result = lookupSchema.safeParse(await response.json());
  if (!result.success) return null;
  const identity = result.data.users[0];
  if (
    identity.disabled ||
    !identity.providerUserInfo.some((provider) =>
      ["google.com", "facebook.com"].includes(provider.providerId),
    )
  )
    return null;
  return identity;
};