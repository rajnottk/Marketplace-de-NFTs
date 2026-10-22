import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { ImageWithSkeleton } from "shared/components/molecules/image-with-skeleton";
import { Skeleton } from "shared/components/ui/skeleton";
import type { CartItem } from "shared/contracts/marketplace";
import { formatEthShort, multiplyEth } from "shared/lib/money";

const quantityButtonClassName =
  "grid h-7 w-7 place-items-center rounded-full bg-[#D28A4C] text-[#140D0A] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";
const headerCellClassName =
  "border-b border-[#D28A4C]/40 pb-4 text-left text-lg font-normal text-ink";
// Desktop: a five-column table. Mobile: each row becomes a stacked block.
const rowClassName =
  "grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 bg-[#241612] p-3 sm:table-row sm:p-0";
const cellClassName = "sm:table-cell sm:py-0 sm:align-middle";

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
  <table className="block w-full border-separate sm:table sm:border-spacing-y-4">
    <caption className="sr-only">NFTs no carrinho</caption>
    <thead className="hidden sm:table-header-group">
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
    <tbody className="block space-y-4 sm:table-row-group sm:space-y-0">
      {items.map((item) => (
        <tr className={rowClassName} key={item.id}>
          <td className={`${cellClassName} row-span-2 sm:w-[104px]`}>
            <Link
              aria-label={`Ver ${item.nft.name}`}
              className="block"
              params={{ nftId: item.nft.id }}
              to="/nfts/$nftId"
            >
              <ImageWithSkeleton
                alt=""
                containerClassName="h-16 w-16 rounded-md sm:h-[104px] sm:w-[104px]"
                className="h-full w-full object-cover"
                height="104"
                src={item.nft.imageUrl}
                width="104"
              />
            </Link>
          </td>
          <td className={`${cellClassName} min-w-0 sm:pl-6`}>
            <Link
              className="block truncate text-lg font-bold text-ink hover:text-accent"
              params={{ nftId: item.nft.id }}
              to="/nfts/$nftId"
            >
              {item.nft.name}
            </Link>
            <p className="text-base text-[#CFB28C]">
              ID do token: #{String(item.nft.tokenNumber).padStart(4, "0")}
            </p>
          </td>
          <td
            className={`${cellClassName} hidden text-lg font-bold text-[#CFB28C] sm:table-cell`}
          >
            {formatEthShort(item.unitPriceEth)}
          </td>
          <td className={`${cellClassName} col-start-2`}>
            <div
              aria-label={`Quantidade de ${item.nft.name}`}
              className="flex items-center gap-4"
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
                className="min-w-5 text-center text-lg text-ink"
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
          </td>
          <td
            className={`${cellClassName} col-start-3 row-start-1 text-right text-lg font-bold text-[#E89B55] sm:text-left`}
          >
            {formatEthShort(multiplyEth(item.unitPriceEth, item.quantity))}
          </td>
          <td
            className={`${cellClassName} col-start-3 row-start-2 justify-self-end sm:w-16 sm:pr-6`}
          >
            <button
              aria-label={`Remover ${item.nft.name}`}
              className="grid h-10 w-10 place-items-center text-[#CFB28C] transition-colors hover:text-danger disabled:opacity-40"
              disabled={isUpdating}
              onClick={() => onRemove(item.id)}
              type="button"
            >
              <Trash2 size={22} />
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