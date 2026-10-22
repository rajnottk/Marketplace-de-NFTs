import { z } from "zod";
import { ensExtensions } from "modules/checkout/components/checkout-options";
import type { User, Wallet } from "shared/contracts/marketplace";

const requiredText = z
  .string({ error: "Este campo precisa ser preenchido." })
  .trim()
  .min(1, "Este campo precisa ser preenchido.");
export const collectorSchema = z.object({
  displayName: requiredText,
  username: requiredText,
  profileName: requiredText,
  walletType: requiredText,
  address: requiredText,
  email: requiredText.pipe(z.email("Informe um e-mail válido.")),
  ensName: z.enum(ensExtensions),
  secondaryWallet: z.string(),
  referralCode: z.string(),
  collectorNotes: z.string(),
});

export type CollectorValues = z.infer<typeof collectorSchema>;

export const getWalletCollectorValues = (
  user: User,
  wallet: Wallet,
): CollectorValues => ({
  displayName: wallet.displayName ?? user.displayName,
  username: wallet.username ?? user.username ?? "",
  profileName: wallet.profileName ?? "",
  walletType: wallet.walletType ?? "",
  address: wallet.address,
  email: wallet.email ?? user.email,
  ensName: wallet.ensSuffix ?? ".eth",
  secondaryWallet: wallet.secondaryAddress ?? "",
  referralCode: wallet.referralCode ?? "",
  collectorNotes: wallet.collectorNotes ?? "",
});

export const isWalletConfigured = (user: User, wallet: Wallet) =>
  collectorSchema.safeParse(getWalletCollectorValues(user, wallet)).success;