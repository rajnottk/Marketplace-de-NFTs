import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { getApiError } from "shared/api/api-error";
import { addToCart, getNft, queryKeys } from "shared/api/marketplace.api";
import { Button } from "shared/components/ui/button";
import { EmptyState } from "shared/components/ui/empty-state";
import { Skeleton } from "shared/components/ui/skeleton";
import { formatEth } from "shared/lib/money";

const NftDetailPage = () => {
  const { nftId } = useParams({ from: "/nfts/$nftId" });
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const nftQuery = useQuery({
    queryKey: queryKeys.nft(nftId),
    queryFn: () => getNft(nftId),
  });
  const addMutation = useMutation({
    mutationFn: () => addToCart(nftId, quantity),
    onSuccess: (cart) => queryClient.setQueryData(queryKeys.cart, cart),
  });
  const error = nftQuery.error
    ? getApiError(nftQuery.error)
    : addMutation.error
      ? getApiError(addMutation.error)
      : null;

  if (nftQuery.isPending)
    return (
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-2">
        <Skeleton className="aspect-square" />
        <div className="space-y-4">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </main>
    );
  if (!nftQuery.data)
    return (
      <main className="mx-auto max-w-7xl px-4 py-10">
        <EmptyState
          actionLabel="Ver catálogo"
          description={error?.message ?? "Este item não existe mais."}
          onAction={() => undefined}
          title="NFT não encontrado"
        />
      </main>
    );

  const nft = nftQuery.data;
  const maximumQuantity = Math.min(nft.available, nft.maxQuantity);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <Link className="text-xs text-muted hover:text-accent" to="/">
        ← Voltar ao mercado
      </Link>
      <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
        <div className="overflow-hidden rounded-kurio border border-line bg-surface">
          <img
            alt={`NFT ${nft.name}`}
            className="aspect-square h-full w-full object-cover"
            src={nft.imageUrl}
          />
        </div>
        <section className="space-y-6 rounded-kurio border border-line bg-panel p-5 sm:p-7">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-accent">
              {nft.collection}
            </p>
            <h1 className="font-display text-3xl font-bold leading-tight">
              {nft.name}
            </h1>
            <p className="text-sm text-muted">por {nft.artist}</p>
          </div>
          <p className="text-sm leading-7 text-muted">{nft.description}</p>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-kurio bg-surface p-3">
              <dt className="text-muted">Raridade</dt>
              <dd className="mt-1 font-bold text-ink">{nft.rarity}</dd>
            </div>
            <div className="rounded-kurio bg-surface p-3">
              <dt className="text-muted">Disponíveis</dt>
              <dd className="mt-1 font-bold text-ink">{nft.available}</dd>
            </div>
          </dl>
          <div className="border-y border-line py-5">
            <p className="text-xs text-muted">Preço atual</p>
            <p className="mt-1 font-display text-2xl font-bold text-accent">
              {formatEth(nft.priceEth)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Quantidade</span>
            <div className="flex items-center gap-3 rounded-kurio border border-line bg-surface p-1">
              <Button
                aria-label="Diminuir quantidade"
                disabled={quantity === 1}
                onClick={() => setQuantity((previous) => previous - 1)}
                size="icon"
                variant="ghost"
              >
                <Minus size={16} />
              </Button>
              <output className="min-w-5 text-center text-sm">
                {quantity}
              </output>
              <Button
                aria-label="Aumentar quantidade"
                disabled={quantity === maximumQuantity}
                onClick={() => setQuantity((previous) => previous + 1)}
                size="icon"
                variant="ghost"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
          <Button
            className="w-full"
            disabled={addMutation.isPending || nft.available === 0}
            onClick={() => addMutation.mutate()}
            size="lg"
          >
            <ShoppingCart size={18} />
            {nft.available ? "Adicionar ao carrinho" : "Edição esgotada"}
          </Button>
          {error ? (
            <p className="text-xs text-danger" role="alert">
              {error.message}
            </p>
          ) : null}
        </section>
      </section>
    </main>
  );
};

export { NftDetailPage };