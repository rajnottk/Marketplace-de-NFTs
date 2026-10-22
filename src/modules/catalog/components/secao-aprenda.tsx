import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { getPosts, queryKeys } from "shared/api/marketplace.api";
import { ImagemComSkeleton } from "shared/components/molecules/imagem-com-skeleton";
import { Skeleton } from "shared/components/ui/skeleton";
import type { Post } from "shared/contracts/marketplace";

const quantidadePostsSkeleton = 4;
const classeGridPosts = "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4";
const classeCardPost =
  "flex flex-col overflow-hidden rounded-lg bg-[#241612] lg:h-[369px]";
// timeZone UTC: a data ISO (sem hora) não pode "voltar um dia" no fuso do Brasil.
const formatadorDataPublicacao = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

interface CardPostProps {
  post: Post;
}

const CardPost = ({ post }: CardPostProps) => (
  <article aria-labelledby={`post-${post.id}`} className={classeCardPost}>
    <ImagemComSkeleton
      alt=""
      classeContainer="h-[188px] w-full shrink-0"
      className="h-full w-full object-cover object-[50%_48%]"
      height="188"
      loading="lazy"
      src={post.imageUrl}
      width="268"
    />
    <div className="flex flex-1 flex-col gap-2 px-4 py-4">
      <p className="text-xs leading-4 text-[#CFB28C]">
        <time dateTime={post.dataPublicacao}>
          {formatadorDataPublicacao.format(new Date(post.dataPublicacao))}
        </time>
        <span aria-hidden className="mx-2">
          |
        </span>
        Leitura de {post.tempoLeituraMinutos} min
      </p>
      <h3
        className="text-base font-bold leading-6 text-[#F5F1EB]"
        id={`post-${post.id}`}
      >
        {post.titulo}
      </h3>
      <p className="text-[13px] leading-5 text-[#CFB28C]">{post.descricao}</p>
      <Link
        aria-label={`Ler mais: ${post.titulo}`}
        className="mt-auto w-fit text-sm font-bold text-[#E89B55] hover:underline"
        to="/aprenda"
      >
        Ler mais →
      </Link>
    </div>
  </article>
);

const CardPostSkeleton = () => (
  <div aria-hidden className={classeCardPost}>
    <Skeleton className="h-[188px] w-full shrink-0 rounded-none" />
    <div className="flex flex-1 flex-col gap-3 p-4">
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="mt-auto h-5 w-20" />
    </div>
  </div>
);

const SecaoAprenda = () => {
  const { data: posts, isPending: carregandoPosts } = useQuery({
    queryKey: queryKeys.posts,
    queryFn: getPosts,
  });

  if (!carregandoPosts && !posts?.length) return null;

  return (
    <section aria-labelledby="secao-aprenda-heading" className="pb-16 pt-8">
      <header className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-ink" id="secao-aprenda-heading">
          Diário da Cunhagem
        </h2>
        <p className="mt-4 text-sm text-[#CFB28C]">
          Histórias, guias e insights para colecionadores sobre o universo da
          propriedade digital.
        </p>
      </header>
      <div aria-busy={carregandoPosts} className={classeGridPosts}>
        {carregandoPosts
          ? Array.from({ length: quantidadePostsSkeleton }, (_, indice) => (
              <CardPostSkeleton key={indice} />
            ))
          : posts?.map((post) => <CardPost key={post.id} post={post} />)}
      </div>
    </section>
  );
};

export { SecaoAprenda };