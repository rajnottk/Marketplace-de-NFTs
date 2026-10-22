export const checkoutRadioClassName =
  "h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-full border border-primary bg-transparent checked:bg-primary checked:shadow-[inset_0_0_0_3px_var(--color-canvas)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export const checkoutPaymentOptions = [
  {
    value: "walletconnect",
    label: "METAMASK · WALLETCONNECT · COINBASE",
    isBadge: true,
  },
  { value: "metamask", label: "MetaMask", isBadge: false },
  { value: "coinbase", label: "Coinbase Wallet", isBadge: false },
] as const;

// ENS supports .eth directly and imported DNS names under these common TLDs.
export const ensExtensions = [".eth", ".com", ".org", ".xyz"] as const;