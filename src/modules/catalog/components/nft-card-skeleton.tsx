import { Skeleton } from "shared/components/ui/skeleton";

// Same shape as NftCard so swapping skeleton → card does not shift the layout.
const NftCardSkeleton = () => (
  <div aria-hidden className="w-full">
    <div className="bg-[#241612] p-2 py-10">
      <Skeleton className="aspect-square w-full rounded-2xl" />
    </div>
    <Skeleton className="mt-4 h-7 w-3/4" />
    <Skeleton className="mt-1 h-7 w-1/3" />
  </div>
);

export { NftCardSkeleton };