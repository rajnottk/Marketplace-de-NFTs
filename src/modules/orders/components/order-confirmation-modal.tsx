import { X } from "lucide-react";
import purchaseThankYouImage from "assets/images/purchase-thank-you.png";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "shared/components/ui/dialog";
import type { Order } from "shared/contracts/marketplace";
import { formatEthSummary, multiplyEth } from "shared/lib/money";

interface PurchaseConfirmation {
  order: Order;
  confirmedAt: string;
  walletLabel: string;
}

interface OrderConfirmationModalProps {
  confirmation: PurchaseConfirmation;
  onClose: () => void;
}

const transactionPrefixLength = 6;
const transactionSuffixLength = 4;
const purchaseDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});
const transactionColumnsClassName =
  "grid grid-cols-[minmax(0,1fr)_2.75rem_5.25rem] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_3.5rem_6rem]";

const formatPurchaseDate = (value: string) => {
  const parts = purchaseDateFormatter.formatToParts(new Date(value));
  const day = parts.find((part) => part.type === "day")?.value;
  const month =
    parts.find((part) => part.type === "month")?.value.replace(".", "") ?? "";
  const year = parts.find((part) => part.type === "year")?.value;
  return `${day} ${month.charAt(0).toUpperCase()}${month.slice(1)}, ${year}`;
};

const OrderConfirmationModal = ({
  confirmation,
  onClose,
}: OrderConfirmationModalProps) => {
  const { order, confirmedAt, walletLabel } = confirmation;
  const { snapshot, transactionRef } = order;
  const shortTransactionRef = `${transactionRef.slice(0, transactionPrefixLength).toUpperCase().replace("0X", "0x")}…${transactionRef.slice(-transactionSuffixLength).toUpperCase()}`;
  const metadata = [
    {
      label: "ID da transação",
      value: shortTransactionRef,
      title: transactionRef,
    },
    { label: "Data", value: formatPurchaseDate(confirmedAt) },
    { label: "Total", value: formatEthSummary(snapshot.quote.totalEth) },
    { label: "Carteira", value: walletLabel },
  ];

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      open
    >
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[500px] overflow-y-auto border-b-[10px] border-primary bg-[#241612] text-ink"
        overlayClassName="bg-[#140D0A]"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Compra confirmada</DialogTitle>
        <DialogClose
          aria-label="Fechar confirmação"
          className="absolute right-3 top-3 grid h-6 w-6 place-items-center text-accent transition-colors hover:text-ink"
        >
          <X aria-hidden="true" size={16} strokeWidth={1} />
        </DialogClose>
        <header className="px-6 pb-4 pt-5 text-center [@media(max-height:760px)]:pb-3 [@media(max-height:760px)]:pt-4">
          <img
            alt=""
            className="mx-auto h-[72px] w-auto [@media(max-height:760px)]:h-14"
            src={purchaseThankYouImage}
          />
          <DialogDescription className="mt-3 text-sm font-bold text-muted-foreground [@media(max-height:760px)]:mt-2">
            Seus NFTs agora estão na sua carteira
          </DialogDescription>
        </header>

        <dl className="grid grid-cols-2 gap-y-3 border-y border-primary/70 px-6 py-3 text-xs text-muted-foreground sm:grid-cols-[1.2fr_1.1fr_0.9fr_1.25fr]">
          {metadata.map((item) => (
            <div
              className="min-w-0 border-primary/70 px-2 first:pl-0 sm:border-r sm:last:border-r-0 sm:last:pr-0"
              key={item.label}
            >
              <dt className="sm:whitespace-nowrap">{item.label}</dt>
              <dd
                className="mt-0.5 break-words sm:whitespace-nowrap"
                title={item.title}
              >
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <section
          aria-labelledby="transaction-details-heading"
          className="px-5 pb-6 pt-4 sm:px-9 [@media(max-height:760px)]:pb-5"
        >
          <h2 className="text-sm font-bold" id="transaction-details-heading">
            Detalhes da transação
          </h2>
          <div
            aria-hidden="true"
            className={`${transactionColumnsClassName} mt-2 border-b border-line pb-2 text-sm`}
          >
            <span className="font-bold">NFTs</span>
            <span className="text-center font-bold">Edições</span>
            <span className="text-right">Subtotal</span>
          </div>
          <ul aria-label="NFTs comprados" className="mt-1.5">
            {snapshot.items.map((item) => (
              <li
                className={`${transactionColumnsClassName} py-1.5`}
                key={item.id}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <img
                    alt={item.nft.name}
                    className="h-12 w-12 shrink-0 rounded-lg object-cover sm:h-[60px] sm:w-[60px]"
                    src={item.nft.imageUrl}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-5 sm:text-sm">
                      {item.nft.name}
                    </p>
                    <p className="text-[11px] leading-4 text-muted-foreground sm:text-xs">
                      ID do token: #
                      {String(item.nft.tokenNumber).padStart(4, "0")}
                    </p>
                  </div>
                </div>
                <span className="text-center text-xs text-muted-foreground">
                  (x {item.quantity})
                </span>
                <span className="text-right text-sm font-bold text-accent sm:text-base">
                  {formatEthSummary(
                    multiplyEth(item.unitPriceEth, item.quantity),
                  )}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-2 space-y-2 border-b border-line pb-2 text-sm">
            <div className="flex items-baseline justify-between gap-4">
              <dt>Taxa de rede</dt>
              <dd>{formatEthSummary(snapshot.quote.networkFeeEth)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 font-bold">
              <dt>Total</dt>
              <dd className="text-base text-accent">
                {formatEthSummary(snapshot.quote.totalEth)}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-center text-xs leading-5 text-muted-foreground [@media(max-height:760px)]:leading-4">
            Transação confirmada na {snapshot.network}. A propriedade foi
            transferida para sua carteira conectada e registrada na rede.
          </p>
          <div className="mt-4 text-center [@media(max-height:760px)]:mt-3">
            <a
              className="inline-flex h-11 items-center justify-center rounded-[5px] bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-accent-strong"
              href="https://etherscan.io/"
              rel="noopener noreferrer"
              target="_blank"
            >
              Ver no Etherscan
            </a>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
};

export { OrderConfirmationModal };
export type { PurchaseConfirmation };