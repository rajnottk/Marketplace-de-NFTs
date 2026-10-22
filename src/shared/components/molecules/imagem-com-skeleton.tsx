import { useCallback, useState, type ComponentProps } from "react";
import { Skeleton } from "shared/components/ui/skeleton";
import { cn } from "shared/lib/utils";

interface ImageWithSkeletonProps extends ComponentProps<"img"> {
  containerClassName?: string;
}

// Shows a Skeleton while the image loads, then fades the image in to avoid a flash of empty content.
const ImageWithSkeleton = ({
  containerClassName,
  className,
  onLoad,
  ...props
}: ImageWithSkeletonProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Cached images may finish loading before the onLoad handler is attached.
  const checkCachedImage = useCallback(
    (imageElement: HTMLImageElement | null) => {
      if (imageElement?.complete && imageElement.naturalWidth > 0)
        setIsImageLoaded(true);
    },
    [],
  );

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {!isImageLoaded && (
        <Skeleton
          aria-hidden
          className="absolute inset-0 h-full w-full rounded-none"
        />
      )}
      <img
        className={cn(
          "transition-opacity duration-500",
          isImageLoaded ? "opacity-100" : "opacity-0",
          className,
        )}
        onLoad={(event) => {
          setIsImageLoaded(true);
          onLoad?.(event);
        }}
        ref={checkCachedImage}
        {...props}
      />
    </div>
  );
};

export { ImageWithSkeleton };