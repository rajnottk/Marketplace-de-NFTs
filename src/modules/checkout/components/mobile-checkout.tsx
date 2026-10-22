import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { EllipsisVertical } from "lucide-react";
import { Wallet2 } from "iconsax-react";
import { checkoutRadioClassName } from "modules/checkout/components/checkout-options";
import { isWalletConfigured } from "modules/checkout/components/collector-values";
import { WalletConfigurationModal } from "modules/checkout/components/wallet-configuration-modal";
import { MobileBackButton } from "shared/components/molecules/mobile-back-button";
import type {
  Network,
  Quote,
  User,
  Wallet,
} from "shared/contracts/marketplace";
import { formatEthSummary } from "shared/lib/money";

const paymentOptions = [
  { value: "walletconnect", label: "WalletConnect", initial: "W" },
  { value: "metamask", label: "MetaMask", initial: "M" },
  { value: "coinbase", label: "Coinbase Wallet", initial: null },
] as const;

interface MobileCheckoutProps {
  wallets: Wallet[];
  user: User;
  quote: Quote | null;
  isQuoting: boolean;
  isOrdering: boolean;
  paymentMethod: string;
  error: string | null;
  onNetworkChange: (network: Network) => void;
  onPaymentMethodChange: (method: string) => void;
  onConfirm: () => void;
}

const MobileCheckout = ({
  wallets,
  user,
  quote,
  isQuoting,
  isOrdering,
  paymentMethod,
  error,
  onNetworkChange,
  onPaymentMethodChange,
  onConfirm,
}: MobileCheckoutProps) => {
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(
    wallets[0]?.id ?? null,
  );
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [hasAttemptedPurchase, setHasAttemptedPurchase] = useState(false);
  const selectedWallet =
    wallets.find((wallet) => wallet.id === selectedWalletId) ?? wallets[0];
  const selectedNetwork = selectedWallet?.network;
  const editingWallet = wallets.find((wallet) => wallet.id === editingWalletId);
  const isConfigured = Boolean(
    selectedWallet && isWalletConfigured(user, selectedWallet),
  );

  useEffect(() => {
    if (selectedNetwork) onNetworkChange(selectedNetwork);
  }, [selectedNetwork, onNetworkChange]);

  const handleConfirm = () => {
    setHasAttemptedPurchase(() => true);
    if (!isConfigured || isOrdering) return;
    onConfirm();
  };

  return (
    <div className="flex min-h-[calc(100dvh-10rem)] flex-col">
      <div className="relative mb-6 flex items-center">
        <MobileBackButton />
        <h1 className="absolute inset-x-10 text-center text-base font-bold">
          Pagamento com carteira
        </h1>
      </div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold">Carteira conectada</h2>
        <button
          className="text-xs font-bold text-accent disabled:opacity-50"
          disabled={!selectedWallet || isOrdering}
          onClick={() => setEditingWalletId(() => selectedWallet?.id ?? null)}
          type="button"
        >
          Trocar carteira
        </button>
      </div>
      <fieldset disabled={isOrdering}>
        <legend className="sr-only">Carteiras conectadas</legend>
        <div className="space-y-4">
          {wallets.map((wallet) => (
            <div
              className="flex items-center gap-2 rounded-[14px] bg-[#241612] px-4 py-3"
              key={wallet.id}
            >
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-4">
                <input
                  checked={selectedWallet?.id === wallet.id}
                  className={checkoutRadioClassName}
                  name="connected-wallet"
                  onChange={() => {
                    setSelectedWalletId(() => wallet.id);
                    setHasAttemptedPurchase(() => false);
                    onNetworkChange(wallet.network);
                  }}
                  type="radio"
                  value={wallet.id}
                />
                <span className="min-w-0 text-xs leading-5 text-[#CFB28C]">
                  <span className="block truncate text-sm font-bold text-ink">
                    {wallet.label}
                  </span>
                  <span className="block truncate">
                    {wallet.ensName
                      ? `${wallet.ensName}${wallet.ensName.endsWith(wallet.ensSuffix ?? ".eth") ? "" : (wallet.ensSuffix ?? ".eth")}`
                      : wallet.address}
                  </span>
                  <span className="block">Rede {wallet.network}</span>
                </span>
              </label>
              <button
                aria-label={`Configurar ${wallet.label}`}
                className="grid size-8 shrink-0 place-items-center text-[#B0916A] hover:text-accent"
                onClick={() => setEditingWalletId(() => wallet.id)}
                type="button"
              >
                <EllipsisVertical aria-hidden size={18} />
              </button>
            </div>
          ))}
        </div>
      </fieldset>
      {!wallets.length && (
        <p className="rounded-xl bg-[#241612] p-4 text-sm text-[#CFB28C]">
          Você ainda não tem uma carteira conectada.{" "}
          <Link className="text-accent underline" to="/account/wallet">
            Configurar carteiras
          </Link>
        </p>
      )}
      <fieldset className="mt-4" disabled={isOrdering}>
        <legend className="mb-3 text-sm font-bold">Carteira e rede</legend>
        <div className="space-y-3">
          {paymentOptions.map((option) => (
            <label
              className="flex min-h-14 cursor-pointer items-center gap-3 rounded-[14px] bg-[#241612] px-3 py-2"
              key={option.value}
            >
              <span
                aria-hidden
                className="grid size-9 place-items-center rounded-full border border-primary/20 bg-[#2F1D15] text-xs text-accent"
              >
                {option.initial ?? (
                  <Wallet2 color="currentColor" size={20} variant="Linear" />
                )}
              </span>
              <span className="flex-1 text-xs">{option.label}</span>
              <input
                checked={paymentMethod === option.value}
                className={checkoutRadioClassName}
                name="mobile-payment-method"
                onChange={() => onPaymentMethodChange(option.value)}
                type="radio"
                value={option.value}
              />
            </label>
          ))}
        </div>
      </fieldset>
      <p aria-live="polite" className="mt-4 text-right text-sm font-bold">
        Total:{" "}
        <span className="ml-4 text-base text-accent">
          {quote ? formatEthSummary(quote.totalEth) : "Calculando…"}
        </span>
      </p>
      {isQuoting && (
        <p className="mt-1 text-right text-xs text-[#CFB28C]" role="status">
          Atualizando total…
        </p>
      )}
      <div className="mt-auto pt-12">
        {hasAttemptedPurchase && !isConfigured && (
          <p className="mb-4 text-sm leading-6 text-danger" role="alert">
            Complete os dados obrigatórios da carteira selecionada. Toque em
            “Trocar carteira” para configurá-la.
          </p>
        )}
        {error && (
          <p className="mb-4 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <button
          aria-busy={isOrdering}
          className="h-14 w-full rounded-full bg-[#D28A4C] text-sm font-bold text-[#140D0A] disabled:opacity-50"
          disabled={isOrdering}
          onClick={handleConfirm}
          type="button"
        >
          {isOrdering ? "Confirmando…" : "Confirmar compra"}
        </button>
      </div>
      {editingWallet && (
        <WalletConfigurationModal
          key={editingWallet.id}
          onClose={() => setEditingWalletId(() => null)}
          user={user}
          wallet={editingWallet}
        />
      )}
    </div>
  );
};

export { MobileCheckout };