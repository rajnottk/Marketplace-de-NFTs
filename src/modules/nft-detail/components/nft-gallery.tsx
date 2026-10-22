import { useState } from "react";
import { ChevronLeft, Search } from "lucide-react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { NftFavoriteButton } from "modules/nft-detail/components/nft-favorite-button";
import { ImageWithSkeleton } from "shared/components/molecules/image-with-skeleton";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "shared/components/ui/dialog";
import { cn } from "shared/lib/utils";

const galleryImageCount = 4;

interface NftGalleryProps {
  imageUrl: string;
  name: string;
  nftId: string;
}

// The prototype shows the same artwork in all four thumbnails.
const NftGallery = ({ imageUrl, name, nftId }: NftGalleryProps) => {
  const router = useRouter();
  const navigate = useNavigate();
  const galleryImages = Array.from(
    { length: galleryImageCount },
    () => imageUrl,
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const selectedImage = galleryImages[selectedImageIndex];

  return (
    <>
      <div className="rounded-t-[40px] bg-[#2F1D15] px-6 pb-8 pt-5 md:hidden">
        <div className="mb-2 flex items-center justify-between">
          <button
            aria-label="Voltar"
            className="grid size-8 place-items-center rounded-full border border-[#D28A4C]/30 bg-[#2F1D15] text-[#CFB28C] hover:text-accent"
            onClick={() => {
              if (router.history.canGoBack()) {
                router.history.back();
                return;
              }
              void navigate({ to: "/" });
            }}
            type="button"
          >
            <ChevronLeft aria-hidden size={18} />
          </button>
          <NftFavoriteButton compact nftId={nftId} />
        </div>
        <ImageWithSkeleton
          alt={`NFT ${name}`}
          className="aspect-square w-full object-cover"
          containerClassName="rounded-[22px]"
          fetchPriority="high"
          height="530"
          src={imageUrl}
          width="530"
        />
      </div>
      <div className="hidden grid-cols-[80px_minmax(0,1fr)] gap-4 md:grid md:grid-cols-[101px_minmax(0,1fr)] md:gap-7">
        <ul
          aria-label="Imagens do NFT"
          className="flex flex-col gap-3 sm:gap-4"
        >
          {galleryImages.map((galleryImage, index) => (
            <li key={index}>
              <button
                aria-label={`Ver imagem ${index + 1} de ${galleryImageCount}`}
                aria-pressed={index === selectedImageIndex}
                className={cn(
                  "block overflow-hidden rounded-md border-2 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  index === selectedImageIndex
                    ? "border-[#D28A4C]"
                    : "border-transparent opacity-80 hover:opacity-100",
                )}
                onClick={() => setSelectedImageIndex(index)}
                type="button"
              >
                <ImageWithSkeleton
                  alt=""
                  className="aspect-square w-full object-cover"
                  height="101"
                  src={galleryImage}
                  width="101"
                />
              </button>
            </li>
          ))}
        </ul>

        <div className="relative self-start bg-[#241612] p-5">
          <ImageWithSkeleton
            alt={`NFT ${name}`}
            containerClassName="rounded-2xl"
            className="aspect-square w-full object-cover"
            fetchPriority="high"
            height="530"
            src={selectedImage}
            width="530"
          />
          <Dialog>
            <DialogTrigger
              aria-label="Ampliar imagem"
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-[#140D0A]/80 text-ink transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <Search size={22} />
            </DialogTrigger>
            <DialogContent className="max-w-[min(90vw,90vh)] p-0">
              <DialogTitle className="sr-only">{`Imagem ampliada de ${name}`}</DialogTitle>
              <img
                alt={`NFT ${name} ampliado`}
                className="aspect-square w-full rounded-2xl object-cover"
                src={selectedImage}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
};

export { NftGallery };