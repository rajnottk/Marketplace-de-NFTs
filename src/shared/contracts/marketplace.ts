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
  avatarUrl: z.string().min(1),
  sessionVersion: z.number().int().positive(),
});
export type User = z.infer<typeof userSchema>;

export const sessionSchema = z.object({
  user: userSchema,
  sessionToken: z.string(),
});
export type Session = z.infer<typeof sessionSchema>;

export const walletSchema = z.object({
  id: z.string(),
  label: z.string(),
  address: z.string(),
  network: networkSchema,
  isPrimary: z.boolean(),
  connectedState: z.enum(["connected", "disconnected", "rejected"]),
});
export type Wallet = z.infer<typeof walletSchema>;

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