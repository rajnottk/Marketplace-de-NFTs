import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { getPosts, queryKeys } from "shared/api/marketplace.api";
import { ImageWithSkeleton } from "shared/components/molecules/image-with-skeleton";
import { Skeleton } from "shared/components/ui/skeleton";
import type { Post } from "shared/contracts/marketplace";

const postSkeletonCount = 4;
const postsGridClassName = "grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4";
const postCardClassName =
  "flex flex-col overflow-hidden rounded-lg bg-[#241612] lg:h-[369px]";
// timeZone UTC: an ISO date without time must not shift back one day in Brazil's timezone.
const publishedAtFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => (
  <article aria-labelledby={`post-${post.id}`} className={postCardClassName}>
    <ImageWithSkeleton
      alt=""
      containerClassName="h-[100px] w-full shrink-0 sm:h-[188px]"
      className="h-full w-full object-cover object-[50%_48%]"
      height="188"
      loading="lazy"
      src={post.imageUrl}
      width="268"
    />
    <div className="flex flex-1 flex-col gap-2 px-3 py-3 sm:px-4 sm:py-4">
      <p className="text-[10px] leading-[14px] text-[#CFB28C] sm:text-xs sm:leading-4">
        <time dateTime={post.publishedAt}>
          {publishedAtFormatter.format(new Date(post.publishedAt))}
        </time>
        <span aria-hidden className="mx-2">
          |
        </span>
        Leitura de {post.readingTimeMinutes} min
      </p>
      <h3
        className="text-xs font-bold leading-[18px] text-[#F5F1EB] sm:text-base sm:leading-6"
        id={`post-${post.id}`}
      >
        {post.title}
      </h3>
      <p className="line-clamp-3 text-[11px] leading-4 text-[#CFB28C] sm:line-clamp-none sm:text-[13px] sm:leading-5">
        {post.description}
      </p>
      <Link
        aria-label={`Ler mais: ${post.title}`}
        className="mt-auto w-fit text-xs font-bold text-[#E89B55] hover:underline sm:text-sm"
        to="/learn"
      >
        Ler mais →
      </Link>
    </div>
  </article>
);

const PostCardSkeleton = () => (
  <div aria-hidden className={postCardClassName}>
    <Skeleton className="h-[100px] w-full shrink-0 rounded-none sm:h-[188px]" />
    <div className="flex flex-1 flex-col gap-3 p-4">
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="mt-auto h-5 w-20" />
    </div>
  </div>
);

const LearnSection = () => {
  const { data: posts, isPending: isLoadingPosts } = useQuery({
    queryKey: queryKeys.posts,
    queryFn: getPosts,
  });

  if (!isLoadingPosts && !posts?.length) return null;

  return (
    <section
      aria-labelledby="learn-section-heading"
      className="pb-8 pt-4 sm:pb-16 sm:pt-8"
    >
      <header className="mb-5 text-center sm:mb-10">
        <h2
          className="text-xl font-bold text-ink sm:text-3xl"
          id="learn-section-heading"
        >
          Diário da Cunhagem
        </h2>
        <p className="mt-2 text-xs text-[#CFB28C] sm:mt-4 sm:text-sm">
          Histórias, guias e insights para colecionadores sobre o universo da
          propriedade digital.
        </p>
      </header>
      <div aria-busy={isLoadingPosts} className={postsGridClassName}>
        {isLoadingPosts
          ? Array.from({ length: postSkeletonCount }, (_, index) => (
              <PostCardSkeleton key={index} />
            ))
          : posts?.map((post) => <PostCard key={post.id} post={post} />)}
      </div>
    </section>
  );
};

export { LearnSection };