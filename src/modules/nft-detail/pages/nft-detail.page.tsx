import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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

const pageClassName =
  "mx-auto w-full max-w-[1200px] px-2 pb-12 pt-1 md:px-4 md:pb-16 md:pt-8 xl:px-0";
const contentGridClassName =
  "grid gap-0 md:mt-4 md:gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,1fr)] lg:gap-11";

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
    <Skeleton className="hidden h-6 w-40 md:block" />
    <div className={contentGridClassName}>
      <div className="grid grid-cols-1 gap-4 bg-[#2F1D15] p-6 md:grid-cols-[101px_minmax(0,1fr)] md:gap-7 md:bg-transparent md:p-0">
        <div className="hidden flex-col gap-4 md:flex">
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
  const [selectedTab, setSelectedTab] = useState<{
    nftId: string;
    value: "details" | "reviews";
  }>({ nftId, value: "details" });
  const activeTab = selectedTab.nftId === nftId ? selectedTab.value : "details";
  const changeTab = (value: "details" | "reviews") =>
    setSelectedTab(() => ({ nftId, value }));
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
      <div className="hidden md:block">
        <NftDetailBreadcrumb />
      </div>
      <div className={contentGridClassName}>
        {/* Keyed by id so the gallery selection and purchase state reset when navigating between NFTs. */}
        <NftGallery
          imageUrl={nft.imageUrl}
          key={`gallery-${nft.id}`}
          name={nft.name}
          nftId={nft.id}
        />
        <NftPurchasePanel
          key={`purchase-${nft.id}`}
          nft={nft}
          onShowReviews={() => changeTab("reviews")}
        />
      </div>
      <NftDetailTabs
        key={`tabs-${nft.id}`}
        nft={nft}
        onValueChange={changeTab}
        value={activeTab}
      />
      <NftRecommendationsCarousel
        key={`recommendations-${nft.id}`}
        nftIds={[nft.id]}
      />
    </main>
  );
};

export { NftDetailPage };