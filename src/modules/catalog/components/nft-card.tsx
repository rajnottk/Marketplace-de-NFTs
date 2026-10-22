import { Link } from "@tanstack/react-router";
import { ImagemComSkeleton } from "shared/components/molecules/imagem-com-skeleton";
import type { Nft } from "shared/contracts/marketplace";
import { formatEthResumido } from "shared/lib/money";

interface NftCardProps {
  nft: Nft;
}

const NftCard = ({ nft }: NftCardProps) => (
  <Link
    aria-label={`Ver ${nft.name}`}
    className="group block w-full"
    params={{ nftId: nft.id }}
    to="/nfts/$nftId"
  >
    <article>
      <div className="bg-[#241612] p-2 py-10 transition-colors group-hover:bg-[#2e1c17]">
        <ImagemComSkeleton
          alt={`NFT ${nft.name}`}
          classeContainer="rounded-2xl"
          className="aspect-square w-full object-cover transition-[opacity,transform] duration-500 group-hover:scale-[1.02]"
          height="560"
          loading="lazy"
          src={nft.imageUrl}
          width="560"
        />
      </div>
      <h3 className="mt-4 truncate text-lg text-[#F5F1EB]">{nft.name}</h3>
      <p className="mt-1 text-xl font-bold text-[#E89B55]">
        {formatEthResumido(nft.priceEth)}
      </p>
    </article>
  </Link>
);

export { NftCard };