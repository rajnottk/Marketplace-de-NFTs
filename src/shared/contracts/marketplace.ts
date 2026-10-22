import { z } from "zod";

export const networkSchema = z.enum(["Ethereum", "Polygon", "Solana"]);
export type Network = z.infer<typeof networkSchema>;

export const nftEditionSchema = z.enum(["1/1", "1/10", "1/50", "open"]);
export type NftEdition = z.infer<typeof nftEditionSchema>;

export const nftDetailsSchema = z.object({
  longDescription: z.array(z.string()),
  contractAddress: z.string(),
  royaltyPercent: z.number().nonnegative(),
});

export const nftSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  artist: z.string(),
  collection: z.string(),
  description: z.string(),
  imageUrl: z.string().min(1),
  priceEth: z.string(),
  available: z.number().int().nonnegative(),
  maxQuantity: z.number().int().positive(),
  category: z.string(),
  network: networkSchema,
  rarity: z.enum(["Comum", "Raro", "Épico", "Lendário"]),
  version: z.number().int().positive(),
  featured: z.boolean().optional(),
  listedAt: z.string().datetime(),
  salesCount: z.number().int().nonnegative(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  edition: nftEditionSchema,
  tokenNumber: z.number().int().positive(),
  traits: z.array(z.string()),
  details: nftDetailsSchema,
});
export type Nft = z.infer<typeof nftSchema>;

export const postSchema = z.object({
  id: z.string(),
  publishedAt: z.string().date(),
  readingTimeMinutes: z.number().int().positive(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().min(1),
});
export type Post = z.infer<typeof postSchema>;

export const newsletterSubscriptionSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
});
export type NewsletterSubscription = z.infer<
  typeof newsletterSubscriptionSchema
>;

export const userSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  email: z.string().email(),
  avatarUrl: z.string(),
  username: z.string().optional(),
  ensName: z.string().optional(),
  ensSuffix: z.enum([".eth", ".xyz", ".com", ".org"]).optional(),
  walletAlias: z.string().optional(),
  sessionVersion: z.number().int().positive(),
});
export type User = z.infer<typeof userSchema>;

const profileRequiredText = z
  .string()
  .trim()
  .min(1, "Este campo precisa ser preenchido.");
export const profileUpdateSchema = z.object({
  displayName: profileRequiredText.pipe(
    z.string().min(2, "Use pelo menos dois caracteres."),
  ),
  username: profileRequiredText.pipe(
    z
      .string()
      .regex(
        /^[\p{L}\p{N}_.-]+$/u,
        "Use letras, números, ponto, hífen ou sublinhado.",
      ),
  ),
  email: profileRequiredText.pipe(z.email("Informe um e-mail válido.")),
  ensName: profileRequiredText,
  ensSuffix: z.enum([".eth", ".xyz", ".com", ".org"]),
  walletAlias: profileRequiredText,
  avatarUrl: z
    .string()
    .refine(
      (url) =>
        !url ||
        /^(https?:\/\/|\/|data:image\/(png|jpeg|webp);base64,)/i.test(url),
      "Selecione uma imagem válida.",
    ),
  passwordChange: z
    .object({
      currentPassword: z.string().min(1),
      nextPassword: z.string().min(8),
    })
    .optional(),
});
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;

export const sessionSchema = z.object({
  user: userSchema,
  sessionToken: z.string(),
});
export type Session = z.infer<typeof sessionSchema>;

export const walletTypeSchema = z.enum([
  "MetaMask",
  "WalletConnect",
  "Coinbase Wallet",
  "Outra carteira",
]);
export const walletSchema = z.object({
  id: z.string(),
  label: z.string(),
  address: z.string(),
  network: networkSchema,
  isPrimary: z.boolean(),
  connectedState: z.enum(["connected", "disconnected", "rejected"]),
  displayName: z.string().optional(),
  profileName: z.string().optional(),
  walletType: walletTypeSchema.optional(),
  secondaryAddress: z.string().optional(),
  referralCode: z.string().optional(),
  email: z.string().email().optional(),
  ensName: z.string().optional(),
  ensSuffix: z.enum([".eth", ".xyz", ".com", ".org"]).optional(),
  sameAsPrimary: z.boolean().optional(),
});
export type Wallet = z.infer<typeof walletSchema>;
export type WalletInput = Omit<Wallet, "id"> & { id?: string };

export const walletDetailsSchema = walletSchema
  .omit({
    id: true,
    isPrimary: true,
    connectedState: true,
    sameAsPrimary: true,
  })
  .extend({
    label: profileRequiredText,
    address: profileRequiredText,
    displayName: profileRequiredText,
    profileName: profileRequiredText,
    walletType: walletTypeSchema,
    secondaryAddress: z.string().trim(),
    referralCode: profileRequiredText,
    email: profileRequiredText.pipe(z.email("Informe um e-mail válido.")),
    ensName: profileRequiredText,
    ensSuffix: z.enum([".eth", ".xyz", ".com", ".org"]),
  });
export type WalletDetails = z.infer<typeof walletDetailsSchema>;

export const cartItemSchema = z.object({
  id: z.string(),
  nft: nftSchema,
  quantity: z.number().int().positive(),
  unitPriceEth: z.string(),
  itemVersion: z.number().int().positive(),
});
export type CartItem = z.infer<typeof cartItemSchema>;

export const quoteSchema = z.object({
  subtotalEth: z.string(),
  discountEth: z.string(),
  networkFeeEth: z.string(),
  totalEth: z.string(),
  cartVersion: z.number().int().nonnegative(),
  expiresAt: z.string(),
  coupon: z.string().nullable(),
});
export type Quote = z.infer<typeof quoteSchema>;

export const cartSchema = z.object({
  items: z.array(cartItemSchema),
  version: z.number().int().nonnegative(),
  quote: quoteSchema.nullable(),
});
export type Cart = z.infer<typeof cartSchema>;

export const orderStatusSchema = z.enum(["pending", "confirmed", "declined"]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const orderSchema = z.object({
  id: z.string(),
  status: orderStatusSchema,
  transactionRef: z.string(),
  snapshot: z.object({
    items: z.array(cartItemSchema),
    quote: quoteSchema,
    network: networkSchema,
  }),
  version: z.number().int().positive(),
});
export type Order = z.infer<typeof orderSchema>;

export const catalogSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
  network: networkSchema.optional().catch(undefined),
  sort: z
    .enum(["recent", "price-asc", "price-desc"])
    .optional()
    .catch("recent"),
  page: z.coerce.number().int().positive().optional().catch(1),
  tab: z.enum(["all", "new", "trending"]).optional().catch(undefined),
  minPrice: z.coerce.number().nonnegative().optional().catch(undefined),
  maxPrice: z.coerce.number().nonnegative().optional().catch(undefined),
});
export type CatalogSearch = z.infer<typeof catalogSearchSchema>;

export interface ApiError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
  retryable?: boolean;
}

export interface CatalogResponse {
  items: Nft[];
  total: number;
  page: number;
  pageSize: number;
  facets: Record<string, number>;
}

export interface RealtimeEvent<TPayload> {
  eventId: string;
  resourceId: string;
  resourceType: "nft" | "order";
  version: number;
  occurredAt: string;
  data: TPayload;
}