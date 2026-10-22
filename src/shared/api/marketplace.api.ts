import { apiClient } from "shared/api/api-client";
import { signOutFirebase } from "shared/lib/firebase";
import type {
  Cart,
  CatalogResponse,
  CatalogSearch,
  Network,
  Nft,
  Order,
  Post,
  Quote,
  Session,
  User,
  Wallet,
} from "shared/contracts/marketplace";

export const queryKeys = {
  catalog: (search: CatalogSearch) => ["catalog", search] as const,
  cart: ["cart"] as const,
  favorites: ["favorites"] as const,
  nft: (nftId: string) => ["nft", nftId] as const,
  featuredNft: ["featured-nft"] as const,
  nftRecommendations: (nftIds: string[]) =>
    ["nft-recommendations", [...nftIds].sort()] as const,
  posts: ["posts"] as const,
  order: (orderId: string) => ["order", orderId] as const,
  profile: ["profile"] as const,
  session: ["session"] as const,
  wallets: ["wallets"] as const,
};

export const getCatalog = async (search: CatalogSearch) => {
  const response = await apiClient.get<CatalogResponse>("/nfts", {
    params: search,
  });
  return response.data;
};

export const getNft = async (nftId: string) => {
  const response = await apiClient.get<Nft>(`/nfts/${nftId}`);
  return response.data;
};

export const subscribeToNewsletter = async (email: string) => {
  await apiClient.post("/newsletter", { email });
};

export const getPosts = async () => {
  const response = await apiClient.get<Post[]>("/posts");
  return response.data;
};

export const getNftRecommendations = async (nftIds: string[]) => {
  const response = await apiClient.get<Nft[]>("/nfts/recommendations", {
    params: { nftIds: nftIds.join(",") },
  });
  return response.data;
};

export const getFeaturedNft = async () => {
  const response = await apiClient.get<Nft>("/nfts/featured");
  return response.data;
};

export const getCart = async () => {
  const response = await apiClient.get<Cart>("/cart");
  return response.data;
};

export const addToCart = async (nftId: string, quantity: number) => {
  const response = await apiClient.post<Cart>("/cart", { nftId, quantity });
  return response.data;
};

export const updateCartItem = async (itemId: string, quantity: number) => {
  const response = await apiClient.patch<Cart>(`/cart/${itemId}`, { quantity });
  return response.data;
};

export const removeCartItem = async (itemId: string) => {
  const response = await apiClient.delete<Cart>(`/cart/${itemId}`);
  return response.data;
};

export const getQuote = async (coupon: string | null, network: Network) => {
  const response = await apiClient.post<Quote>("/checkout/quote", {
    coupon,
    network,
  });
  return response.data;
};

export const getSession = async () => {
  const response = await apiClient.get<Session>("/session");
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await apiClient.post<Session>("/auth/login", {
    email,
    password,
  });
  return response.data;
};

export const register = async (
  displayName: string,
  email: string,
  password: string,
) => {
  const response = await apiClient.post<Session>("/auth/register", {
    displayName,
    email,
    password,
  });
  return response.data;
};

export const logout = async () => {
  await apiClient.post("/auth/logout");
  await signOutFirebase().catch(() => undefined);
};

export const getFavorites = async () => {
  const response = await apiClient.get<{ ids: string[] }>("/favorites");
  return response.data.ids;
};

export const toggleFavorite = async (nftId: string) => {
  const response = await apiClient.post<{ ids: string[] }>(
    `/favorites/${nftId}`,
  );
  return response.data.ids;
};

export const createOrder = async (network: Network, idempotencyKey: string) => {
  const response = await apiClient.post<Order>(
    "/orders",
    { network },
    { headers: { "idempotency-key": idempotencyKey } },
  );
  return response.data;
};

export const getOrder = async (orderId: string) => {
  const response = await apiClient.get<Order>(`/orders/${orderId}`);
  return response.data;
};

export const getProfile = async () => {
  const response = await apiClient.get<User>("/profile");
  return response.data;
};

export const updateProfile = async (displayName: string) => {
  const response = await apiClient.patch<User>("/profile", { displayName });
  return response.data;
};

export const updatePassword = async (
  currentPassword: string,
  nextPassword: string,
) => apiClient.post("/profile/password", { currentPassword, nextPassword });

export const getWallets = async () => {
  const response = await apiClient.get<Wallet[]>("/wallets");
  return response.data;
};

export const saveWallet = async (wallet: Omit<Wallet, "id">) => {
  const response = await apiClient.post<Wallet[]>("/wallets", wallet);
  return response.data;
};