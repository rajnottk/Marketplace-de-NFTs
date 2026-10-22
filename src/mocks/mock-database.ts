import Decimal from "decimal.js";
import { z } from "zod";
import type {
  Cart,
  CartItem,
  Network,
  Nft,
  Order,
  Quote,
  Session,
  User,
  Wallet,
} from "shared/contracts/marketplace";
import {
  cartSchema,
  nftSchema,
  orderSchema,
  userSchema,
  walletSchema,
} from "shared/contracts/marketplace";
import { postFixtures } from "mocks/fixtures/posts";
import {
  apeGreenJacketImage,
  apeTurtleneckImage,
  nftFixtures,
} from "mocks/fixtures/nfts";

interface MockUser extends User {
  passwordHash: string;
}

interface MockState {
  carts: Record<string, Cart>;
  favorites: Record<string, string[]>;
  nfts: Nft[];
  orders: Record<string, Order>;
  sessions: Record<string, string>;
  users: MockUser[];
  wallets: Record<string, Wallet[]>;
}

const persistenceKey = "kurio.mock-state.v4";
const hashSeed = 17;
const hashMultiplier = 31;

const hashPassword = (password: string) =>
  Array.from(password)
    .reduce(
      (hash, character) =>
        (hash * hashMultiplier + character.charCodeAt(0)) | 0,
      hashSeed,
    )
    .toString(36);

const defaultUser: MockUser = {
  id: "collector-ana",
  displayName: "Ana Coleciona",
  email: "collector@kurio.test",
  passwordHash: hashPassword("Kurio#2026"),
  avatarUrl: apeGreenJacketImage,
  sessionVersion: 1,
};

const mockUserSchema = userSchema.extend({ passwordHash: z.string() });
const mockStateSchema = z.object({
  carts: z.record(z.string(), cartSchema),
  favorites: z.record(z.string(), z.array(z.string())),
  nfts: z.array(nftSchema),
  orders: z.record(z.string(), orderSchema),
  sessions: z.record(z.string(), z.string()),
  users: z.array(mockUserSchema),
  wallets: z.record(z.string(), z.array(walletSchema)),
});

const emptyCart = (): Cart => ({ items: [], quote: null, version: 0 });

const createInitialState = (): MockState => ({
  carts: { guest: emptyCart(), [defaultUser.id]: emptyCart() },
  favorites: { [defaultUser.id]: ["emerald-ape-042"] },
  nfts: nftFixtures.map((nft) => ({ ...nft })),
  orders: {},
  sessions: { "session-collector-ana": defaultUser.id },
  users: [{ ...defaultUser }],
  wallets: {
    [defaultUser.id]: [
      {
        id: "wallet-main",
        label: "Carteira principal",
        address: "0x1af9...7bd2",
        network: "Ethereum",
        isPrimary: true,
        connectedState: "connected",
      },
    ],
  },
});

const readPersistedState = (): MockState | null => {
  if (typeof window === "undefined") return null;
  const rawState = window.localStorage.getItem(persistenceKey);
  if (!rawState) return null;

  try {
    const parsedState = mockStateSchema.safeParse(JSON.parse(rawState));
    return parsedState.success ? parsedState.data : null;
  } catch {
    return null;
  }
};

let state = readPersistedState() ?? createInitialState();

const commitState = (nextState: MockState) => {
  state = nextState;
  if (typeof window !== "undefined")
    window.localStorage.setItem(persistenceKey, JSON.stringify(state));
};

const toPublicUser = (user: MockUser): User => ({
  id: user.id,
  displayName: user.displayName,
  email: user.email,
  avatarUrl: user.avatarUrl,
  sessionVersion: user.sessionVersion,
});

const createToken = (userId: string) =>
  `session-${userId}-${crypto.randomUUID()}`;

const getOwner = (sessionToken: string | null) =>
  state.sessions[sessionToken ?? ""] ?? "guest";

const getUserById = (userId: string) =>
  state.users.find((user) => user.id === userId);

const getNftById = (nftId: string) =>
  state.nfts.find((nft) => nft.id === nftId);

export const getNft = (nftId: string) => getNftById(nftId) ?? null;

export const getFeaturedNft = () =>
  state.nfts.find((nft) => nft.featured) ?? null;

// Static editorial content: not part of the persisted mock state.
export const getPosts = () => postFixtures.map((post) => ({ ...post }));

const replaceCart = (owner: string, cart: Cart) => {
  commitState({
    ...state,
    carts: {
      ...state.carts,
      [owner]: cart,
    },
  });
};

const calculateQuote = (
  cart: Cart,
  coupon: string | null,
  network: Network = "Ethereum",
): Quote => {
  const subtotal = cart.items.reduce(
    (total, item) =>
      total.plus(new Decimal(item.unitPriceEth).mul(item.quantity)),
    new Decimal(0),
  );
  const discount = coupon === "KURIO10" ? subtotal.mul(0.1) : new Decimal(0);
  const feeRate = network === "Ethereum" ? 0.018 : 0.009;
  const networkFee = subtotal.minus(discount).mul(feeRate);

  return {
    subtotalEth: subtotal.toFixed(4),
    discountEth: discount.toFixed(4),
    networkFeeEth: networkFee.toFixed(4),
    totalEth: subtotal.minus(discount).plus(networkFee).toFixed(4),
    cartVersion: cart.version,
    expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
    coupon,
  };
};

export const resetMockState = () => {
  if (typeof window !== "undefined")
    window.localStorage.removeItem(persistenceKey);
  state = createInitialState();
};

export const getSession = (sessionToken: string | null): Session | null => {
  const user = getUserById(getOwner(sessionToken));
  if (!user) return null;

  return { sessionToken: sessionToken ?? "", user: toPublicUser(user) };
};

export const authenticate = (
  email: string,
  password: string,
): Session | null => {
  const user = state.users.find(
    (candidate) =>
      candidate.email === email &&
      candidate.passwordHash === hashPassword(password),
  );
  if (!user) return null;

  const sessionToken = createToken(user.id);
  commitState({
    ...state,
    sessions: { ...state.sessions, [sessionToken]: user.id },
  });

  return { sessionToken, user: toPublicUser(user) };
};

export const register = (
  displayName: string,
  email: string,
  password: string,
): Session | "conflict" => {
  if (state.users.some((user) => user.email === email)) return "conflict";

  const user: MockUser = {
    id: `collector-${crypto.randomUUID()}`,
    displayName,
    email,
    passwordHash: hashPassword(password),
    avatarUrl: apeTurtleneckImage,
    sessionVersion: 1,
  };
  const sessionToken = createToken(user.id);
  commitState({
    ...state,
    users: [...state.users, user],
    sessions: { ...state.sessions, [sessionToken]: user.id },
    carts: { ...state.carts, [user.id]: emptyCart() },
    favorites: { ...state.favorites, [user.id]: [] },
    wallets: { ...state.wallets, [user.id]: [] },
  });

  return { sessionToken, user: toPublicUser(user) };
};

export const logout = (sessionToken: string | null) => {
  if (!sessionToken) return;
  const sessions = Object.fromEntries(
    Object.entries(state.sessions).filter(([token]) => token !== sessionToken),
  );
  commitState({ ...state, sessions });
};

const trendingSalesThreshold = 100;

const wasListedThisMonth = (listedAt: string) => {
  const listingDate = new Date(listedAt);
  const today = new Date();
  return (
    listingDate.getFullYear() === today.getFullYear() &&
    listingDate.getMonth() === today.getMonth()
  );
};

export const getCatalog = (params: URLSearchParams) => {
  const query = params.get("q")?.trim().toLowerCase() ?? "";
  const category = params.get("category");
  const network = params.get("network");
  const tab = params.get("tab") ?? "all";
  const minPrice = params.get("minPrice");
  const maxPrice = params.get("maxPrice");
  const sort = params.get("sort") ?? "recent";
  const page = Number(params.get("page") ?? 1);
  const pageSize = 9;
  const filtered = state.nfts.filter((nft) => {
    const matchesQuery =
      !query ||
      `${nft.name} ${nft.artist} ${nft.collection}`
        .toLowerCase()
        .includes(query);
    const matchesCategory = !category || nft.category === category;
    const matchesNetwork = !network || nft.network === network;
    const matchesMinPrice =
      !minPrice || new Decimal(nft.priceEth).gte(minPrice);
    const matchesMaxPrice =
      !maxPrice || new Decimal(nft.priceEth).lte(maxPrice);
    const matchesTab =
      tab === "new"
        ? wasListedThisMonth(nft.listedAt)
        : tab === "trending"
          ? nft.salesCount >= trendingSalesThreshold
          : true;
    return (
      matchesQuery &&
      matchesCategory &&
      matchesNetwork &&
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesTab
    );
  });
  const sorted = [...filtered].sort((left, right) => {
    if (sort === "price-asc")
      return new Decimal(left.priceEth).cmp(right.priceEth);
    if (sort === "price-desc")
      return new Decimal(right.priceEth).cmp(left.priceEth);
    return (
      new Date(right.listedAt).getTime() - new Date(left.listedAt).getTime()
    );
  });
  const facets = state.nfts.reduce<Record<string, number>>(
    (all, nft) => ({
      ...all,
      [nft.category]: (all[nft.category] ?? 0) + 1,
      [nft.network]: (all[nft.network] ?? 0) + 1,
    }),
    {},
  );

  return {
    items: sorted.slice((page - 1) * pageSize, page * pageSize),
    total: sorted.length,
    page,
    pageSize,
    facets,
  };
};

export const getCart = (sessionToken: string | null) =>
  state.carts[getOwner(sessionToken)] ?? emptyCart();

export const mergeGuestCart = (sessionToken: string) => {
  const owner = getOwner(sessionToken);
  if (owner === "guest") return getCart(sessionToken);
  const guestCart = state.carts.guest ?? emptyCart();
  const accountCart = state.carts[owner] ?? emptyCart();
  const combinedItems = guestCart.items.reduce<CartItem[]>(
    (items, guestItem) => {
      const existingItem = items.find(
        (item) => item.nft.id === guestItem.nft.id,
      );
      if (!existingItem) return [...items, guestItem];

      const maximumQuantity = Math.min(
        existingItem.nft.available,
        existingItem.nft.maxQuantity,
      );
      const nextQuantity = Math.min(
        maximumQuantity,
        existingItem.quantity + guestItem.quantity,
      );
      return items.map((item) =>
        item.id === existingItem.id
          ? { ...existingItem, quantity: nextQuantity }
          : item,
      );
    },
    accountCart.items,
  );

  const nextCart = {
    items: combinedItems,
    quote: null,
    version: accountCart.version + guestCart.version + 1,
  };
  commitState({
    ...state,
    carts: { ...state.carts, guest: emptyCart(), [owner]: nextCart },
  });
  return nextCart;
};

export const addToCart = (
  sessionToken: string | null,
  nftId: string,
  quantity: number,
) => {
  const owner = getOwner(sessionToken);
  const cart = getCart(sessionToken);
  const nft = getNftById(nftId);
  if (!nft) return "not-found";
  const existingItem = cart.items.find((item) => item.nft.id === nftId);
  const targetQuantity = (existingItem?.quantity ?? 0) + quantity;
  if (targetQuantity > nft.available || targetQuantity > nft.maxQuantity)
    return "out-of-stock";

  const item: CartItem = existingItem
    ? { ...existingItem, quantity: targetQuantity }
    : {
        id: `cart-item-${nftId}`,
        nft,
        quantity,
        unitPriceEth: nft.priceEth,
        itemVersion: nft.version,
      };
  const items = existingItem
    ? cart.items.map((cartItem) => (cartItem.id === item.id ? item : cartItem))
    : [...cart.items, item];
  const nextCart = { ...cart, items, quote: null, version: cart.version + 1 };
  replaceCart(owner, nextCart);
  return nextCart;
};

export const updateCartItem = (
  sessionToken: string | null,
  itemId: string,
  quantity: number,
) => {
  const owner = getOwner(sessionToken);
  const cart = getCart(sessionToken);
  const item = cart.items.find((cartItem) => cartItem.id === itemId);
  if (!item) return "not-found";
  if (quantity > item.nft.available || quantity > item.nft.maxQuantity)
    return "out-of-stock";

  const nextCart = {
    ...cart,
    items: cart.items.map((cartItem) =>
      cartItem.id === itemId ? { ...cartItem, quantity } : cartItem,
    ),
    quote: null,
    version: cart.version + 1,
  };
  replaceCart(owner, nextCart);
  return nextCart;
};

export const removeCartItem = (sessionToken: string | null, itemId: string) => {
  const owner = getOwner(sessionToken);
  const cart = getCart(sessionToken);
  const nextCart = {
    ...cart,
    items: cart.items.filter((item) => item.id !== itemId),
    quote: null,
    version: cart.version + 1,
  };
  replaceCart(owner, nextCart);
  return nextCart;
};

export const quoteCart = (
  sessionToken: string | null,
  coupon: string | null,
  network: Network,
) => {
  if (coupon && coupon !== "KURIO10") return "invalid-coupon";
  const owner = getOwner(sessionToken);
  const cart = getCart(sessionToken);
  const quote = calculateQuote(cart, coupon, network);
  const nextCart = { ...cart, quote };
  replaceCart(owner, nextCart);
  return quote;
};

export const getFavorites = (sessionToken: string | null) => {
  const owner = getOwner(sessionToken);
  return state.favorites[owner] ?? [];
};

export const toggleFavorite = (sessionToken: string | null, nftId: string) => {
  const owner = getOwner(sessionToken);
  if (owner === "guest") return "unauthorized";
  const favorites = getFavorites(sessionToken);
  const nextFavorites = favorites.includes(nftId)
    ? favorites.filter((favoriteId) => favoriteId !== nftId)
    : [...favorites, nftId];
  commitState({
    ...state,
    favorites: { ...state.favorites, [owner]: nextFavorites },
  });
  return nextFavorites;
};

export const getWallets = (sessionToken: string | null) =>
  state.wallets[getOwner(sessionToken)] ?? [];

export const saveWallet = (
  sessionToken: string | null,
  wallet: Omit<Wallet, "id">,
) => {
  const owner = getOwner(sessionToken);
  const user = getUserById(owner);
  if (!user) return "unauthorized";
  const wallets = getWallets(sessionToken);
  const nextWallet: Wallet = { ...wallet, id: `wallet-${crypto.randomUUID()}` };
  const normalizedWallets = wallet.isPrimary
    ? [
        ...wallets.map((storedWallet) => ({
          ...storedWallet,
          isPrimary: false,
        })),
        nextWallet,
      ]
    : [...wallets, nextWallet];
  commitState({
    ...state,
    wallets: { ...state.wallets, [owner]: normalizedWallets },
  });
  return normalizedWallets;
};

export const createOrder = (
  sessionToken: string | null,
  network: Network,
  idempotencyKey: string,
) => {
  const owner = getOwner(sessionToken);
  const user = getUserById(owner);
  if (!user) return "unauthorized";
  const existingOrder = Object.values(state.orders).find(
    (order) => order.id === `order-${idempotencyKey}`,
  );
  if (existingOrder) return existingOrder;

  const cart = getCart(sessionToken);
  const quote = cart.quote ?? calculateQuote(cart, null, network);
  if (!cart.items.length) return "empty-cart";
  const order: Order = {
    id: `order-${idempotencyKey}`,
    status: "confirmed",
    transactionRef: `0x${crypto.randomUUID().replaceAll("-", "").slice(0, 24)}`,
    snapshot: { items: cart.items, quote, network },
    version: 1,
  };
  commitState({
    ...state,
    orders: { ...state.orders, [order.id]: order },
    carts: { ...state.carts, [owner]: emptyCart() },
  });
  return order;
};

export const getOrder = (orderId: string) => state.orders[orderId] ?? null;

export const updateProfile = (
  sessionToken: string | null,
  displayName: string,
) => {
  const owner = getOwner(sessionToken);
  const user = getUserById(owner);
  if (!user) return "unauthorized";
  const updatedUser = { ...user, displayName };
  commitState({
    ...state,
    users: state.users.map((candidate) =>
      candidate.id === owner ? updatedUser : candidate,
    ),
  });
  return toPublicUser(updatedUser);
};

export const updatePassword = (
  sessionToken: string | null,
  currentPassword: string,
  nextPassword: string,
) => {
  const owner = getOwner(sessionToken);
  const user = getUserById(owner);
  if (!user) return "unauthorized";
  if (user.passwordHash !== hashPassword(currentPassword))
    return "invalid-password";

  const updatedUser = { ...user, passwordHash: hashPassword(nextPassword) };
  commitState({
    ...state,
    users: state.users.map((candidate) =>
      candidate.id === owner ? updatedUser : candidate,
    ),
  });
  return "updated";
};