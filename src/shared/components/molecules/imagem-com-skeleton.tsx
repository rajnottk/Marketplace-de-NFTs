import { useCallback, useState, type ComponentProps } from "react";
import { Skeleton } from "shared/components/ui/skeleton";
import { cn } from "shared/lib/utils";

interface ImagemComSkeletonProps extends ComponentProps<"img"> {
  classeContainer?: string;
}

// Mostra um Skeleton enquanto a imagem carrega e revela a imagem com fade, evitando a "piscada".
const ImagemComSkeleton = ({
  classeContainer,
  className,
  onLoad,
  ...props
}: ImagemComSkeletonProps) => {
  const [imagemCarregada, setImagemCarregada] = useState(false);

  // Imagens já em cache podem terminar de carregar antes do onLoad ser registrado.
  const verificarImagemEmCache = useCallback(
    (elementoImagem: HTMLImageElement | null) => {
      if (elementoImagem?.complete && elementoImagem.naturalWidth > 0)
        setImagemCarregada(true);
    },
    [],
  );

  return (
    <div className={cn("relative overflow-hidden", classeContainer)}>
      {!imagemCarregada && (
        <Skeleton
          aria-hidden
          className="absolute inset-0 h-full w-full rounded-none"
        />
      )}
      <img
        className={cn(
          "transition-opacity duration-500",
          imagemCarregada ? "opacity-100" : "opacity-0",
          className,
        )}
        onLoad={(evento) => {
          setImagemCarregada(true);
          onLoad?.(evento);
        }}
        ref={verificarImagemEmCache}
        {...props}
      />
    </div>
  );
};

export { ImagemComSkeleton };