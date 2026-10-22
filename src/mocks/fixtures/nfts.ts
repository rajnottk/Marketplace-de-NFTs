import imagemMacacoChapeuBucket from "assets/images/ape-bucket-hat.png";
import imagemMacacoFoneDeOuvido from "assets/images/ape-headphones.png";
import imagemMacacoJaquetaVerde from "assets/images/ape-green-jacket.png";
import imagemMacacoGolaAlta from "assets/images/ape-turtleneck.png";
import type { Network, Nft } from "shared/contracts/marketplace";

const milissegundosPorDia = 24 * 60 * 60 * 1000;

const listadoHaDias = (dias: number) =>
  new Date(Date.now() - dias * milissegundosPorDia).toISOString();

const nftsCurados: Nft[] = [
  {
    id: "emerald-ape-042",
    slug: "emerald-ape-042",
    name: "Emerald Ape #042",
    artist: "Nina Cobalt",
    collection: "Kurio Primate Club",
    description:
      "Um retrato digital de edição limitada, inspirado em fotografia de estúdio e colecionáveis de rua.",
    imageUrl: imagemMacacoJaquetaVerde,
    priceEth: "1.1900",
    available: 4,
    maxQuantity: 2,
    category: "Arte digital",
    network: "Ethereum",
    rarity: "Raro",
    version: 1,
    listadoEm: listadoHaDias(2),
    quantidadeVendas: 180,
  },
  {
    id: "sage-nomad-009",
    slug: "sage-nomad-009",
    name: "Sage Nomad #009",
    artist: "Brenno Mota",
    collection: "Kurio Primate Club",
    description:
      "Uma edição de personagem com texturas analógicas e paleta de tons minerais.",
    imageUrl: imagemMacacoFoneDeOuvido,
    priceEth: "1.9900",
    available: 2,
    maxQuantity: 1,
    category: "Fotografia",
    network: "Ethereum",
    rarity: "Épico",
    version: 1,
    listadoEm: listadoHaDias(5),
    quantidadeVendas: 40,
  },
  {
    id: "neon-vessel-552",
    slug: "neon-vessel-552",
    name: "Neon Vessel #552",
    artist: "Luma Amaral",
    collection: "Kurio Primate Club",
    description:
      "Colecionável raro feito para quem prefere cor, silêncio e caos controlado.",
    imageUrl: imagemMacacoGolaAlta,
    priceEth: "1.2900",
    available: 8,
    maxQuantity: 3,
    category: "Arte 3D",
    network: "Polygon",
    rarity: "Raro",
    version: 1,
    listadoEm: listadoHaDias(12),
    quantidadeVendas: 220,
  },
  {
    id: "night-bloom-228",
    slug: "night-bloom-228",
    name: "Night Bloom #228",
    artist: "Kiko Mar",
    collection: "Garden of Elsewhere",
    description:
      "Um estudo de luz e folhagem para a coleção Garden of Elsewhere.",
    imageUrl: imagemMacacoChapeuBucket,
    priceEth: "0.7800",
    available: 10,
    maxQuantity: 4,
    category: "Arte digital",
    network: "Solana",
    rarity: "Comum",
    version: 1,
    listadoEm: listadoHaDias(40),
    quantidadeVendas: 15,
  },
  {
    id: "copper-dreamer-031",
    slug: "copper-dreamer-031",
    name: "Copper Dreamer #031",
    artist: "Tati Lins",
    collection: "Night Shift",
    description:
      "Retrato de ficção científica em tiragem limitada de doze peças.",
    imageUrl: imagemMacacoJaquetaVerde,
    priceEth: "2.4400",
    available: 1,
    maxQuantity: 1,
    category: "Arte 3D",
    network: "Ethereum",
    rarity: "Lendário",
    version: 1,
    listadoEm: listadoHaDias(3),
    quantidadeVendas: 130,
  },
  {
    id: "soft-machine-120",
    slug: "soft-machine-120",
    name: "Soft Machine #120",
    artist: "Ravi K",
    collection: "Soft Machines",
    description:
      "Um experimento visual em colagem, interface e nostalgia computacional.",
    imageUrl: imagemMacacoFoneDeOuvido,
    priceEth: "0.9200",
    available: 6,
    maxQuantity: 2,
    category: "Generativa",
    network: "Polygon",
    rarity: "Raro",
    version: 1,
    listadoEm: listadoHaDias(60),
    quantidadeVendas: 75,
  },
  {
    id: "bucket-ape-001",
    slug: "bucket-ape-001",
    name: "Bucket Ape #001",
    artist: "Nina Cobalt",
    collection: "Kurio Primate Club",
    description:
      "Peça em destaque da Kurio: um retrato de edição única com chapéu bucket e moletom lilás, disponível por tempo limitado.",
    imageUrl: imagemMacacoChapeuBucket,
    priceEth: "3.5000",
    available: 1,
    maxQuantity: 1,
    category: "Colecionáveis",
    network: "Ethereum",
    rarity: "Lendário",
    version: 1,
    listadoEm: listadoHaDias(1),
    quantidadeVendas: 250,
    destaque: true,
  },
];

const totalNftsCatalogo = 36;
const sementeGeradorNfts = 20261020;

// PRNG determinístico (mulberry32): os NFTs gerados são sempre os mesmos a cada carga, mantendo ids estáveis.
const criarGeradorAleatorio = (semente: number) => {
  let estado = semente;
  return () => {
    estado = (estado + 0x6d2b79f5) | 0;
    let mistura = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    mistura =
      (mistura + Math.imul(mistura ^ (mistura >>> 7), 61 | mistura)) ^ mistura;
    return ((mistura ^ (mistura >>> 14)) >>> 0) / 4294967296;
  };
};

const temasPorImagem = [
  {
    imagem: imagemMacacoJaquetaVerde,
    colecao: "Kurio Primate Club",
    prefixos: ["Emerald", "Varsity", "Jade", "Ivy"],
    descricao:
      "Retrato de primata com jaqueta college e acessórios de esmeralda.",
  },
  {
    imagem: imagemMacacoFoneDeOuvido,
    colecao: "Golden Frequencies",
    prefixos: ["Golden", "Amber", "Honey", "Sunset"],
    descricao: "Personagem musical com fones verdes e jaqueta bomber creme.",
  },
  {
    imagem: imagemMacacoGolaAlta,
    colecao: "Night Shift",
    prefixos: ["Onyx", "Shadow", "Noir", "Velvet"],
    descricao: "Retrato elegante com gola alta verde e blazer de linho.",
  },
  {
    imagem: imagemMacacoChapeuBucket,
    colecao: "Garden of Elsewhere",
    prefixos: ["Sage", "Lilac", "Moss", "Misty"],
    descricao: "Retrato tranquilo com chapéu bucket e moletom lilás.",
  },
] as const;

const sufixosNome = [
  "Beat",
  "Signal",
  "Nomad",
  "Dreamer",
  "Vessel",
  "Echo",
  "Pulse",
  "Bloom",
  "Drift",
  "Machine",
] as const;
const artistas = [
  "Nina Cobalt",
  "Brenno Mota",
  "Luma Amaral",
  "Kiko Mar",
  "Tati Lins",
  "Ravi K",
] as const;
const categoriasCatalogo = [
  "Arte digital",
  "Fotografia",
  "Música",
  "Arte 3D",
  "Colecionáveis",
  "Generativa",
  "Jogos",
  "Assinaturas",
  "Utilidade",
] as const;
const redes: Network[] = ["Ethereum", "Polygon", "Solana"];
const raridades: Nft["rarity"][] = ["Comum", "Raro", "Épico", "Lendário"];

const gerarNftsAleatorios = (quantidade: number): Nft[] => {
  const aleatorio = criarGeradorAleatorio(sementeGeradorNfts);
  const sortearDe = <TOpcao>(opcoes: readonly TOpcao[]) =>
    opcoes[Math.floor(aleatorio() * opcoes.length)];
  const sortearInteiro = (minimo: number, maximo: number) =>
    minimo + Math.floor(aleatorio() * (maximo - minimo + 1));
  const idsUsados = new Set(nftsCurados.map((nft) => nft.id));
  const nftsGerados: Nft[] = [];

  while (nftsGerados.length < quantidade) {
    const tema = sortearDe(temasPorImagem);
    const numeroEdicao = String(sortearInteiro(1, 999)).padStart(3, "0");
    const nomeBase = `${sortearDe(tema.prefixos)} ${sortearDe(sufixosNome)}`;
    const idNft = `${nomeBase.toLowerCase().replace(" ", "-")}-${numeroEdicao}`;
    if (idsUsados.has(idNft)) continue;
    idsUsados.add(idNft);

    const estoqueDisponivel = sortearInteiro(1, 12);
    // ~1/3 listados no mês atual (Novos lançamentos); o restante espalhado nos últimos 90 dias.
    const diasDesdeListagem =
      aleatorio() < 0.34
        ? sortearInteiro(0, Math.max(0, new Date().getDate() - 1))
        : sortearInteiro(32, 90);
    nftsGerados.push({
      id: idNft,
      slug: idNft,
      name: `${nomeBase} #${numeroEdicao}`,
      artist: sortearDe(artistas),
      collection: tema.colecao,
      description: tema.descricao,
      imageUrl: tema.imagem,
      priceEth: (sortearInteiro(10, 500) / 100).toFixed(4),
      available: estoqueDisponivel,
      maxQuantity: sortearInteiro(1, Math.min(4, estoqueDisponivel)),
      category: sortearDe(categoriasCatalogo),
      network: sortearDe(redes),
      rarity: sortearDe(raridades),
      version: 1,
      listadoEm: listadoHaDias(diasDesdeListagem),
      quantidadeVendas: sortearInteiro(0, 300),
    });
  }

  return nftsGerados;
};

export const nftFixtures: Nft[] = [
  ...nftsCurados,
  ...gerarNftsAleatorios(totalNftsCatalogo - nftsCurados.length),
];

export {
  imagemMacacoChapeuBucket,
  imagemMacacoFoneDeOuvido,
  imagemMacacoGolaAlta,
  imagemMacacoJaquetaVerde,
};