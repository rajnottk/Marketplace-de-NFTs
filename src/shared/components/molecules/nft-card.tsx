import { Link } from "@tanstack/react-router";
import { ImageWithSkeleton } from "shared/components/molecules/image-with-skeleton";
import type { Nft } from "shared/contracts/marketplace";
import { formatEthShort } from "shared/lib/money";
import { cn } from "shared/lib/utils";

type NftCardSize = "default" | "compact";

// "compact" renders the 220×303 card used by the recommendations carousel.
const nftCardSizeClassNames: Record<
  NftCardSize,
  { root: string; imageBlock: string; name: string; price: string }
> = {
  default: {
    root: "w-full",
    imageBlock: "p-2 py-10",
    name: "mt-4 text-lg",
    price: "mt-1 text-xl",
  },
  compact: {
    root: "h-[303px] w-[220px]",
    imageBlock: "px-2 py-[26px]",
    name: "mt-2 text-base leading-5",
    price: "text-base leading-5",
  },
};

interface NftCardProps {
  nft: Nft;
  size?: NftCardSize;
}

const NftCard = ({ nft, size = "default" }: NftCardProps) => {
  const sizeClassNames = nftCardSizeClassNames[size];

  return (
    <Link
      aria-label={`Ver ${nft.name}`}
      className={cn("group block", sizeClassNames.root)}
      params={{ nftId: nft.id }}
      to="/nfts/$nftId"
    >
      <article>
        <div
          className={cn(
            "bg-[#241612] transition-colors group-hover:bg-[#2e1c17]",
            sizeClassNames.imageBlock,
          )}
        >
          <ImageWithSkeleton
            alt={`NFT ${nft.name}`}
            containerClassName="rounded-2xl"
            className="aspect-square w-full object-cover transition-[opacity,transform] duration-500 group-hover:scale-[1.02]"
            height="560"
            loading="lazy"
            src={nft.imageUrl}
            width="560"
          />
        </div>
        <h3 className={cn("truncate text-[#F5F1EB]", sizeClassNames.name)}>
          {nft.name}
        </h3>
        <p className={cn("font-bold text-[#E89B55]", sizeClassNames.price)}>
          {formatEthShort(nft.priceEth)}
        </p>
      </article>
    </Link>
  );
};

export { NftCard, type NftCardSize };