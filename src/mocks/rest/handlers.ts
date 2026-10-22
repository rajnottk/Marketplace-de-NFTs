import { delay, http, HttpResponse } from "msw";
import { z } from "zod";
import {
  addToCart,
  authenticate,
  authenticateFirebase,
  createOrder,
  getCart,
  getCatalog,
  getFavorites,
  getNft,
  getFeaturedNft,
  getNftRecommendations,
  getPosts,
  getOrder,
  getSession,
  getWallets,
  logout,
  mergeGuestCart,
  quoteCart,
  register,
  removeCartItem,
  saveWallet,
  toggleFavorite,
  updateCartItem,
  updatePassword,
  updateProfile,
} from "mocks/mock-database";
import {
  networkSchema,
  newsletterSubscriptionSchema,
  profileUpdateSchema,
  walletSchema,
} from "shared/contracts/marketplace";
import { verifyFirebaseToken } from "mocks/auth/verify-firebase-token";
import { MockPersistenceError } from "mocks/persistence";

const apiError = (
  code: string,
  message: string,
  status: number,
  fieldErrors?: Record<string, string>,
) => HttpResponse.json({ error: { code, message, fieldErrors } }, { status });

const withPersistenceErrors = (resolve: () => Response): Response => {
  try {
    return resolve();
  } catch (error) {
    if (error instanceof MockPersistenceError)
      return apiError(error.code, error.message, 507);
    throw error;
  }
};

const getSessionToken = (request: Request) =>
  request.headers.get("x-session-token");

const waitForMockNetwork = async () => delay(220);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
const firebaseLoginSchema = z.object({ idToken: z.string().min(1) });
const registerSchema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});
const addCartSchema = z.object({
  nftId: z.string(),
  quantity: z.number().int().positive(),
});
const updateCartSchema = z.object({ quantity: z.number().int().positive() });
const quoteSchema = z.object({
  coupon: z.string().nullable(),
  network: networkSchema,
});
const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  nextPassword: z.string().min(8),
});
const orderSchema = z.object({ network: networkSchema });

export const handlers = [
  http.post("/api/auth/firebase", async ({ request }) => {
    const parsed = firebaseLoginSchema.safeParse(await request.json());
    if (!parsed.success)
      return apiError(
        "VALIDATION_ERROR",
        "Não foi possível validar o login social.",
        422,
      );
    try {
      const identity = await verifyFirebaseToken(parsed.data.idToken);
      if (!identity)
        return apiError(
          "UNAUTHORIZED",
          "Não foi possível validar sua conta social. Tente entrar novamente e autorize o compartilhamento do e-mail.",
          401,
        );
      const session = authenticateFirebase(identity);
      if (session === "conflict")
        return apiError(
          "CONFLICT",
          "Este e-mail já possui uma conta. Entre com seu método original.",
          409,
        );
      mergeGuestCart(session.sessionToken);
      return HttpResponse.json(session);
    } catch {
      return apiError(
        "NETWORK_ERROR",
        "Não foi possível validar o login social. Tente novamente.",
        503,
      );
    }
  }),
  http.post("/api/auth/login", async ({ request }) => {
    await waitForMockNetwork();
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success)
      return apiError("VALIDATION_ERROR", "Confira seu e-mail e senha.", 422);
    const session = authenticate(parsed.data.email, parsed.data.password);
    if (!session)
      return apiError("UNAUTHORIZED", "Credenciais inválidas.", 401);
    mergeGuestCart(session.sessionToken);
    return HttpResponse.json(session);
  }),

  http.post("/api/auth/register", async ({ request }) => {
    await waitForMockNetwork();
    const parsed = registerSchema.safeParse(await request.json());
    if (!parsed.success)
      return apiError(
        "VALIDATION_ERROR",
        "Preencha todos os campos corretamente.",
        422,
      );
    const session = register(
      parsed.data.displayName,
      parsed.data.email,
      parsed.data.password,
    );
    if (session === "conflict")
      return apiError("CONFLICT", "Este e-mail já possui uma conta.", 409);
    mergeGuestCart(session.sessionToken);
    return HttpResponse.json(session, { status: 201 });
  }),

  http.post("/api/auth/logout", async ({ request }) => {
    await waitForMockNetwork();
    logout(getSessionToken(request));
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/session", async ({ request }) => {
    await waitForMockNetwork();
    const session = getSession(getSessionToken(request));
    if (!session) return apiError("UNAUTHORIZED", "Sua sessão expirou.", 401);
    return HttpResponse.json(session);
  }),

  http.get("/api/nfts", async ({ request }) => {
    await waitForMockNetwork();
    return HttpResponse.json(getCatalog(new URL(request.url).searchParams));
  }),

  http.post("/api/newsletter", async ({ request }) => {
    await waitForMockNetwork();
    const parsed = newsletterSubscriptionSchema.safeParse(await request.json());
    if (!parsed.success)
      return apiError("VALIDATION_ERROR", "Informe um e-mail válido.", 422);
    return HttpResponse.json({ subscribed: true }, { status: 201 });
  }),

  http.get("/api/posts", async () => {
    await waitForMockNetwork();
    return HttpResponse.json(getPosts());
  }),

  http.get("/api/nfts/featured", async () => {
    await waitForMockNetwork();
    const featuredNft = getFeaturedNft();
    if (!featuredNft)
      return apiError("NOT_FOUND", "NFT em destaque não encontrado.", 404);
    return HttpResponse.json(featuredNft);
  }),

  http.get("/api/nfts/recommendations", async ({ request }) => {
    await waitForMockNetwork();
    const nftIdsParam = new URL(request.url).searchParams.get("nftIds") ?? "";
    const referenceNftIds = nftIdsParam
      .split(",")
      .map((nftId) => nftId.trim())
      .filter(Boolean);
    return HttpResponse.json(getNftRecommendations(referenceNftIds));
  }),

  http.get("/api/nfts/:nftId", async ({ params }) => {
    await waitForMockNetwork();
    const nft = getNft(String(params.nftId));
    if (!nft) return apiError("NOT_FOUND", "NFT não encontrado.", 404);
    return HttpResponse.json(nft);
  }),

  http.get("/api/cart", async ({ request }) => {
    await waitForMockNetwork();
    return HttpResponse.json(getCart(getSessionToken(request)));
  }),

  http.post("/api/cart", async ({ request }) => {
    await waitForMockNetwork();
    const parsed = addCartSchema.safeParse(await request.json());
    if (!parsed.success)
      return apiError(
        "VALIDATION_ERROR",
        "Não foi possível adicionar este item.",
        422,
      );
    const cart = addToCart(
      getSessionToken(request),
      parsed.data.nftId,
      parsed.data.quantity,
    );
    if (cart === "not-found")
      return apiError("NOT_FOUND", "NFT não encontrado.", 404);
    return HttpResponse.json(cart, { status: 201 });
  }),

  http.patch("/api/cart/:itemId", async ({ params, request }) => {
    await waitForMockNetwork();
    const parsed = updateCartSchema.safeParse(await request.json());
    if (!parsed.success)
      return apiError("VALIDATION_ERROR", "Quantidade inválida.", 422);
    const cart = updateCartItem(
      getSessionToken(request),
      String(params.itemId),
      parsed.data.quantity,
    );
    if (cart === "not-found")
      return apiError("NOT_FOUND", "Item do carrinho não encontrado.", 404);
    return HttpResponse.json(cart);
  }),

  http.delete("/api/cart/:itemId", async ({ params, request }) => {
    await waitForMockNetwork();
    return HttpResponse.json(
      removeCartItem(getSessionToken(request), String(params.itemId)),
    );
  }),

  http.post("/api/checkout/quote", async ({ request }) => {
    await waitForMockNetwork();
    const parsed = quoteSchema.safeParse(await request.json());
    if (!parsed.success)
      return apiError(
        "VALIDATION_ERROR",
        "Não foi possível calcular a cotação.",
        422,
      );
    const quote = quoteCart(
      getSessionToken(request),
      parsed.data.coupon,
      parsed.data.network,
    );
    if (quote === "invalid-coupon")
      return apiError("COUPON_INVALID", "Este cupom não é válido.", 422);
    return HttpResponse.json(quote);
  }),

  http.get("/api/favorites", async ({ request }) => {
    await waitForMockNetwork();
    const session = getSession(getSessionToken(request));
    if (!session)
      return apiError("UNAUTHORIZED", "Entre para acessar favoritos.", 401);
    return HttpResponse.json({ ids: getFavorites(getSessionToken(request)) });
  }),

  http.post("/api/favorites/:nftId", async ({ params, request }) => {
    await waitForMockNetwork();
    const favorites = toggleFavorite(
      getSessionToken(request),
      String(params.nftId),
    );
    if (favorites === "unauthorized")
      return apiError("UNAUTHORIZED", "Entre para favoritar NFTs.", 401);
    return HttpResponse.json({ ids: favorites });
  }),

  http.post("/api/orders", async ({ request }) => {
    await waitForMockNetwork();
    const parsed = orderSchema.safeParse(await request.json());
    if (!parsed.success)
      return apiError("VALIDATION_ERROR", "Pedido inválido.", 422);
    const idempotencyKey = request.headers.get("idempotency-key");
    if (!idempotencyKey)
      return apiError(
        "VALIDATION_ERROR",
        "Chave de idempotência ausente.",
        422,
      );
    return withPersistenceErrors(() => {
      const order = createOrder(
        getSessionToken(request),
        parsed.data.network,
        idempotencyKey,
      );
      if (order === "unauthorized")
        return apiError("UNAUTHORIZED", "Entre para finalizar a compra.", 401);
      if (order === "empty-cart")
        return apiError("CONFLICT", "Seu carrinho está vazio.", 409);
      return HttpResponse.json(order, { status: 201 });
    });
  }),

  http.get("/api/orders/:orderId", async ({ params, request }) => {
    await waitForMockNetwork();
    if (!getSession(getSessionToken(request)))
      return apiError("UNAUTHORIZED", "Entre para consultar pedidos.", 401);
    const order = getOrder(String(params.orderId));
    if (!order) return apiError("NOT_FOUND", "Pedido não encontrado.", 404);
    return HttpResponse.json(order);
  }),

  http.get("/api/profile", async ({ request }) => {
    await waitForMockNetwork();
    const session = getSession(getSessionToken(request));
    if (!session)
      return apiError("UNAUTHORIZED", "Entre para acessar o perfil.", 401);
    return HttpResponse.json(session.user);
  }),

  http.patch("/api/profile", async ({ request }) => {
    await waitForMockNetwork();
    const parsed = profileUpdateSchema.safeParse(await request.json());
    if (!parsed.success)
      return apiError("VALIDATION_ERROR", "Confira os dados do perfil.", 422);
    const user = updateProfile(getSessionToken(request), parsed.data);
    if (user === "unauthorized")
      return apiError("UNAUTHORIZED", "Sua sessão expirou.", 401);
    if (user === "conflict")
      return apiError("CONFLICT", "Este e-mail já está em uso.", 409, {
        email: "Este e-mail já está em uso.",
      });
    if (user === "username-conflict")
      return apiError("CONFLICT", "Este nome de usuário já está em uso.", 409, {
        username: "Este nome de usuário já está em uso.",
      });
    if (user === "invalid-password")
      return apiError("VALIDATION_ERROR", "A senha atual não confere.", 422, {
        currentPassword: "A senha atual não confere.",
      });
    return HttpResponse.json(user);
  }),

  http.post("/api/profile/password", async ({ request }) => {
    await waitForMockNetwork();
    const parsed = passwordSchema.safeParse(await request.json());
    if (!parsed.success)
      return apiError(
        "VALIDATION_ERROR",
        "A nova senha deve ter ao menos oito caracteres.",
        422,
      );
    const result = updatePassword(
      getSessionToken(request),
      parsed.data.currentPassword,
      parsed.data.nextPassword,
    );
    if (result === "unauthorized")
      return apiError("UNAUTHORIZED", "Sua sessão expirou.", 401);
    if (result === "invalid-password")
      return apiError("VALIDATION_ERROR", "A senha atual não confere.", 422, {
        currentPassword: "Senha inválida",
      });
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/wallets", async ({ request }) => {
    await waitForMockNetwork();
    if (!getSession(getSessionToken(request)))
      return apiError("UNAUTHORIZED", "Entre para acessar carteiras.", 401);
    return HttpResponse.json(getWallets(getSessionToken(request)));
  }),

  http.post("/api/wallets", async ({ request }) => {
    await waitForMockNetwork();
    const parsed = walletSchema
      .omit({ id: true })
      .safeParse(await request.json());
    if (!parsed.success)
      return apiError("VALIDATION_ERROR", "Dados da carteira inválidos.", 422);
    return withPersistenceErrors(() => {
      const wallets = saveWallet(getSessionToken(request), parsed.data);
      if (wallets === "unauthorized")
        return apiError("UNAUTHORIZED", "Entre para salvar uma carteira.", 401);
      if (wallets === "not-found")
        return apiError("NOT_FOUND", "Carteira não encontrada.", 404);
      return HttpResponse.json(wallets, { status: 201 });
    });
  }),
  http.patch("/api/wallets/:walletId", async ({ request, params }) => {
    await waitForMockNetwork();
    const parsed = walletSchema
      .omit({ id: true })
      .safeParse(await request.json());
    if (!parsed.success)
      return apiError("VALIDATION_ERROR", "Dados da carteira inválidos.", 422);
    return withPersistenceErrors(() => {
      const wallets = saveWallet(getSessionToken(request), {
        ...parsed.data,
        id: String(params.walletId),
      });
      if (wallets === "unauthorized")
        return apiError("UNAUTHORIZED", "Entre para salvar uma carteira.", 401);
      if (wallets === "not-found")
        return apiError("NOT_FOUND", "Carteira não encontrada.", 404);
      return HttpResponse.json(wallets);
    });
  }),
];