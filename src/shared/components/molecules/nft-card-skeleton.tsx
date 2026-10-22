import type { NftCardSize } from "shared/components/molecules/nft-card";
import { Skeleton } from "shared/components/ui/skeleton";
import { cn } from "shared/lib/utils";

interface NftCardSkeletonProps {
  size?: NftCardSize;
}

// Same shape as NftCard so swapping skeleton → card does not shift the layout.
const NftCardSkeleton = ({ size = "default" }: NftCardSkeletonProps) => {
  const isCompact = size === "compact";

  return (
    <div aria-hidden className={isCompact ? "h-[303px] w-[220px]" : "w-full"}>
      <div
        className={cn(
          "bg-[#241612]",
          isCompact
            ? "px-2 py-[26px]"
            : "rounded-2xl p-2 py-3 sm:rounded-none sm:py-10",
        )}
      >
        <Skeleton className="aspect-square w-full rounded-2xl" />
      </div>
      <Skeleton
        className={cn(
          "w-3/4",
          isCompact ? "mt-2 h-5" : "mt-2 h-5 sm:mt-4 sm:h-7",
        )}
      />
      <Skeleton
        className={cn("w-1/3", isCompact ? "mt-0.5 h-5" : "mt-1 h-5 sm:h-7")}
      />
    </div>
  );
};

export { NftCardSkeleton };