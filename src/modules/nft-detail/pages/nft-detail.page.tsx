import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { getApiError } from "shared/api/api-error";
import { getNft, queryKeys } from "shared/api/marketplace.api";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "shared/components/ui/breadcrumb";
import { NftRecommendationsCarousel } from "shared/components/organisms/nft-recommendations-carousel";
import { EmptyState } from "shared/components/ui/empty-state";
import { Skeleton } from "shared/components/ui/skeleton";
import { NftDetailTabs } from "modules/nft-detail/components/nft-detail-tabs";
import { NftGallery } from "modules/nft-detail/components/nft-gallery";
import { NftPurchasePanel } from "modules/nft-detail/components/nft-purchase-panel";

const pageClassName = "mx-auto w-full max-w-[1200px] px-4 pb-16 pt-8 xl:px-0";
const contentGridClassName =
  "mt-4 grid gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,1fr)] lg:gap-11";

const NftDetailBreadcrumb = () => (
  <Breadcrumb>
    <BreadcrumbList className="text-base font-bold text-ink">
      <BreadcrumbItem>
        <BreadcrumbLink className="hover:text-accent" render={<Link to="/" />}>
          Início
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage className="font-bold">Mercado</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
);

const NftDetailSkeleton = () => (
  <main aria-busy="true" aria-label="Carregando NFT" className={pageClassName}>
    <Skeleton className="h-6 w-40" />
    <div className={contentGridClassName}>
      <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-4 sm:grid-cols-[101px_minmax(0,1fr)] sm:gap-7">
        <div className="flex flex-col gap-3 sm:gap-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton className="aspect-square w-full" key={index} />
          ))}
        </div>
        <Skeleton className="aspect-square w-full rounded-none" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  </main>
);

const NftDetailPage = () => {
  const { nftId } = useParams({ from: "/nfts/$nftId" });
  const navigate = useNavigate();
  const nftQuery = useQuery({
    queryKey: queryKeys.nft(nftId),
    queryFn: () => getNft(nftId),
  });

  if (nftQuery.isPending) return <NftDetailSkeleton />;

  if (!nftQuery.data) {
    const error = nftQuery.error ? getApiError(nftQuery.error) : null;
    return (
      <main className={pageClassName}>
        <EmptyState
          actionLabel="Ver catálogo"
          description={error?.message ?? "Este item não existe mais."}
          onAction={() => navigate({ to: "/" })}
          title="NFT não encontrado"
        />
      </main>
    );
  }

  const nft = nftQuery.data;

  return (
    <main className={pageClassName}>
      <NftDetailBreadcrumb />
      <div className={contentGridClassName}>
        {/* Keyed by id so the gallery selection and purchase state reset when navigating between NFTs. */}
        <NftGallery
          imageUrl={nft.imageUrl}
          key={`gallery-${nft.id}`}
          name={nft.name}
        />
        <NftPurchasePanel key={`purchase-${nft.id}`} nft={nft} />
      </div>
      <NftDetailTabs key={`tabs-${nft.id}`} nft={nft} />
      <NftRecommendationsCarousel
        key={`recommendations-${nft.id}`}
        nftIds={[nft.id]}
      />
    </main>
  );
};

export { NftDetailPage };