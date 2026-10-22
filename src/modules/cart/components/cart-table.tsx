import { Link } from "@tanstack/react-router";
import { Minus, Plus } from "lucide-react";
import { TrashIcon } from "shared/components/atoms/trash-icon";
import { ImageWithSkeleton } from "shared/components/molecules/image-with-skeleton";
import { Skeleton } from "shared/components/ui/skeleton";
import type { CartItem } from "shared/contracts/marketplace";
import { formatEthShort, multiplyEth } from "shared/lib/money";

const quantityButtonClassName =
  "grid size-6 place-items-center rounded-full border border-[#D28A4C]/20 bg-[#2F1D15] text-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 md:size-7 md:border-0 md:bg-[#D28A4C] md:text-[#140D0A]";
const headerCellClassName =
  "border-b border-[#D28A4C]/40 pb-4 text-left text-lg font-normal text-ink";
// Desktop: a five-column table. Mobile: each row becomes a stacked block.
const rowClassName =
  "grid grid-cols-[88px_minmax(0,1fr)_auto] grid-rows-[auto_32px_32px] items-center gap-x-2 overflow-hidden rounded-[14px] bg-[#241612] pr-2 md:table-row md:overflow-visible md:rounded-none md:p-0";
const cellClassName = "block md:table-cell md:py-0 md:align-middle";

interface CartTableProps {
  items: CartItem[];
  isUpdating: boolean;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

const CartTable = ({
  items,
  isUpdating,
  onQuantityChange,
  onRemove,
}: CartTableProps) => (
  <table className="block w-full border-separate md:table md:border-spacing-y-4">
    <caption className="sr-only">NFTs no carrinho</caption>
    <thead className="hidden md:table-header-group">
      <tr>
        <th className={headerCellClassName} colSpan={2} scope="col">
          NFTs
        </th>
        <th className={headerCellClassName} scope="col">
          Preço
        </th>
        <th className={headerCellClassName} scope="col">
          Edições
        </th>
        <th className={headerCellClassName} scope="col">
          Total
        </th>
        <th className="border-b border-[#D28A4C]/40 pb-4" scope="col">
          <span className="sr-only">Remover</span>
        </th>
      </tr>
    </thead>
    <tbody className="block space-y-4 md:table-row-group md:space-y-0">
      {items.map((item) => (
        <tr className={rowClassName} key={item.id}>
          <td
            className={`${cellClassName} col-start-1 row-span-3 row-start-1 md:w-[104px]`}
          >
            <Link
              aria-label={`Ver ${item.nft.name}`}
              className="block"
              params={{ nftId: item.nft.id }}
              to="/nfts/$nftId"
            >
              <ImageWithSkeleton
                alt=""
                containerClassName="h-[100px] w-[88px] md:h-[104px] md:w-[104px]"
                className="h-full w-full object-cover"
                height="104"
                src={item.nft.imageUrl}
                width="104"
              />
            </Link>
          </td>
          <td
            className={`${cellClassName} col-span-2 col-start-2 row-start-1 min-w-0 pt-2 md:pl-6 md:pt-0`}
          >
            <Link
              className="block truncate text-sm font-bold text-ink hover:text-accent md:text-lg"
              params={{ nftId: item.nft.id }}
              to="/nfts/$nftId"
            >
              {item.nft.name}
            </Link>
            <p className="hidden text-base text-[#CFB28C] md:block">
              ID do token: #{String(item.nft.tokenNumber).padStart(4, "0")}
            </p>
          </td>
          <td
            className={`${cellClassName} hidden text-lg font-bold text-[#CFB28C] md:table-cell`}
          >
            {formatEthShort(item.unitPriceEth)}
          </td>
          <td className={`${cellClassName} col-span-2 col-start-2 row-start-2`}>
            <div className="flex items-center justify-between gap-2 md:block">
              <p className="text-xs text-[#CFB28C] md:hidden">
                Edição:{" "}
                {item.nft.edition === "open" ? "ABERTA" : item.nft.edition}
              </p>
              <div
                aria-label={`Quantidade de ${item.nft.name}`}
                className="flex items-center gap-2 md:gap-4"
                role="group"
              >
                <button
                  aria-label={`Diminuir ${item.nft.name}`}
                  className={quantityButtonClassName}
                  disabled={item.quantity <= 1 || isUpdating}
                  onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                  type="button"
                >
                  <Minus size={16} />
                </button>
                <output
                  aria-live="polite"
                  className="min-w-4 text-center text-sm text-ink md:min-w-5 md:text-lg"
                >
                  {item.quantity}
                </output>
                <button
                  aria-label={`Aumentar ${item.nft.name}`}
                  className={quantityButtonClassName}
                  disabled={isUpdating}
                  onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                  type="button"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </td>
          <td
            className={`${cellClassName} col-start-2 row-start-3 text-base font-bold text-[#E89B55] md:text-lg`}
          >
            {formatEthShort(multiplyEth(item.unitPriceEth, item.quantity))}
          </td>
          <td
            className={`${cellClassName} col-start-3 row-start-3 justify-self-end md:w-16 md:pr-6`}
          >
            <button
              aria-label={`Remover ${item.nft.name}`}
              className="grid size-8 place-items-center text-[#D28A4C] transition-colors hover:text-danger disabled:opacity-40 md:size-10"
              disabled={isUpdating}
              onClick={() => onRemove(item.id)}
              type="button"
            >
              <TrashIcon />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const CartTableSkeleton = () => (
  <div aria-busy="true" aria-label="Carregando carrinho" className="space-y-4">
    <Skeleton className="h-8 w-full" />
    {Array.from({ length: 3 }, (_, index) => (
      <Skeleton className="h-[104px] w-full rounded-none" key={index} />
    ))}
  </div>
);

export { CartTable, CartTableSkeleton };