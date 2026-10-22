import { useAuthModal } from "modules/auth/hooks/use-auth-modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Plus, WalletCards } from "lucide-react";
import { useState } from "react";
import { getApiError } from "shared/api/api-error";
import { getWallets, queryKeys, saveWallet } from "shared/api/marketplace.api";
import { Button } from "shared/components/ui/button";
import { Card } from "shared/components/ui/card";
import { Input } from "shared/components/ui/input";
import { useSession } from "shared/hooks/use-session";
import type { Network } from "shared/contracts/marketplace";

const WalletsPage = () => {
  const queryClient = useQueryClient();
  const { openAuth } = useAuthModal();
  const { data: session } = useSession();
  const walletsQuery = useQuery({
    queryKey: queryKeys.wallets,
    queryFn: getWallets,
    enabled: Boolean(session),
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState<Network>("Ethereum");
  const saveMutation = useMutation({
    mutationFn: () =>
      saveWallet({
        label,
        address,
        network,
        isPrimary: !walletsQuery.data?.length,
        connectedState: "connected",
      }),
    onSuccess: (wallets) => {
      queryClient.setQueryData(queryKeys.wallets, wallets);
      setIsFormOpen(false);
      setLabel("");
      setAddress("");
    },
  });
  const error = walletsQuery.error
    ? getApiError(walletsQuery.error)
    : saveMutation.error
      ? getApiError(saveMutation.error)
      : null;
  if (!session)
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Card className="p-6 text-center">
          <p className="text-muted">Entre para gerenciar carteiras.</p>
          <button
            className="mt-4 inline-block text-accent underline"
            onClick={() => openAuth()}
            type="button"
          >
            Ir para login
          </button>
        </Card>
      </main>
    );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-accent">
        Minha conta
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold">CARTEIRAS</h1>
      <section className="mt-8 grid gap-6 md:grid-cols-[13rem_minmax(0,1fr)]">
        <nav
          aria-label="Configurações da conta"
          className="h-fit rounded-kurio border border-line bg-surface p-3 text-sm"
        >
          <Link
            className="block rounded px-3 py-2 text-muted hover:text-ink"
            to="/account/profile"
          >
            Dados do perfil
          </Link>
          <Link
            className="block rounded px-3 py-2 text-accent"
            to="/account/wallets"
          >
            Carteiras
          </Link>
        </nav>
        <div className="space-y-4">
          {walletsQuery.data?.map((wallet) => (
            <Card className="flex items-center gap-4 p-5" key={wallet.id}>
              <WalletCards
                aria-hidden="true"
                className="text-accent"
                size={24}
              />
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-bold">
                  {wallet.label}{" "}
                  {wallet.isPrimary ? (
                    <span className="ml-2 text-[10px] text-accent">
                      PRINCIPAL
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {wallet.address} · {wallet.network}
                </p>
              </div>
              <span className="text-xs text-accent">
                {wallet.connectedState === "connected"
                  ? "Conectada"
                  : "Desconectada"}
              </span>
            </Card>
          ))}
          {isFormOpen ? (
            <Card className="space-y-4 p-5">
              <h2 className="font-display text-base font-bold">
                NOVA CARTEIRA
              </h2>
              <label
                className="block text-xs text-muted"
                htmlFor="wallet-label"
              >
                Identificação
                <Input
                  className="mt-2"
                  id="wallet-label"
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder="Ex.: Ledger pessoal"
                  value={label}
                />
              </label>
              <label
                className="block text-xs text-muted"
                htmlFor="wallet-address"
              >
                Endereço
                <Input
                  className="mt-2"
                  id="wallet-address"
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="0x..."
                  value={address}
                />
              </label>
              <label
                className="block text-xs text-muted"
                htmlFor="wallet-network"
              >
                Rede
                <select
                  className="mt-2 h-11 w-full rounded-kurio border border-line bg-surface px-3 text-ink"
                  id="wallet-network"
                  onChange={(event) =>
                    setNetwork(event.target.value as Network)
                  }
                  value={network}
                >
                  <option>Ethereum</option>
                  <option>Polygon</option>
                  <option>Solana</option>
                </select>
              </label>
              <div className="flex gap-2">
                <Button
                  disabled={
                    !label.trim() || !address.trim() || saveMutation.isPending
                  }
                  onClick={() => saveMutation.mutate()}
                >
                  Salvar carteira
                </Button>
                <Button
                  onClick={() => setIsFormOpen(false)}
                  variant="secondary"
                >
                  Cancelar
                </Button>
              </div>
            </Card>
          ) : (
            <Button
              className="w-full"
              onClick={() => setIsFormOpen(true)}
              variant="secondary"
            >
              <Plus size={17} />
              Adicionar carteira
            </Button>
          )}
          {error ? (
            <p className="text-xs text-danger" role="alert">
              {error.message}
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
};

export { WalletsPage };