import apeBucketHatImage from "assets/images/ape-bucket-hat.png";
import apeHeadphonesImage from "assets/images/ape-headphones.png";
import apeGreenJacketImage from "assets/images/ape-green-jacket.png";
import apeTurtleneckImage from "assets/images/ape-turtleneck.png";
import type { Network, Nft } from "shared/contracts/marketplace";

const millisecondsPerDay = 24 * 60 * 60 * 1000;

const listedDaysAgo = (days: number) =>
  new Date(Date.now() - days * millisecondsPerDay).toISOString();

const curatedNfts: Nft[] = [
  {
    id: "emerald-ape-042",
    slug: "emerald-ape-042",
    name: "Emerald Ape #042",
    artist: "Nina Cobalt",
    collection: "Kurio Primate Club",
    description:
      "Um retrato digital de edição limitada, inspirado em fotografia de estúdio e colecionáveis de rua.",
    imageUrl: apeGreenJacketImage,
    priceEth: "1.1900",
    available: 4,
    maxQuantity: 2,
    category: "Arte digital",
    network: "Ethereum",
    rarity: "Raro",
    version: 1,
    listedAt: listedDaysAgo(2),
    salesCount: 180,
  },
  {
    id: "sage-nomad-009",
    slug: "sage-nomad-009",
    name: "Sage Nomad #009",
    artist: "Brenno Mota",
    collection: "Kurio Primate Club",
    description:
      "Uma edição de personagem com texturas analógicas e paleta de tons minerais.",
    imageUrl: apeHeadphonesImage,
    priceEth: "1.9900",
    available: 2,
    maxQuantity: 1,
    category: "Fotografia",
    network: "Ethereum",
    rarity: "Épico",
    version: 1,
    listedAt: listedDaysAgo(5),
    salesCount: 40,
  },
  {
    id: "neon-vessel-552",
    slug: "neon-vessel-552",
    name: "Neon Vessel #552",
    artist: "Luma Amaral",
    collection: "Kurio Primate Club",
    description:
      "Colecionável raro feito para quem prefere cor, silêncio e caos controlado.",
    imageUrl: apeTurtleneckImage,
    priceEth: "1.2900",
    available: 8,
    maxQuantity: 3,
    category: "Arte 3D",
    network: "Polygon",
    rarity: "Raro",
    version: 1,
    listedAt: listedDaysAgo(12),
    salesCount: 220,
  },
  {
    id: "night-bloom-228",
    slug: "night-bloom-228",
    name: "Night Bloom #228",
    artist: "Kiko Mar",
    collection: "Garden of Elsewhere",
    description:
      "Um estudo de luz e folhagem para a coleção Garden of Elsewhere.",
    imageUrl: apeBucketHatImage,
    priceEth: "0.7800",
    available: 10,
    maxQuantity: 4,
    category: "Arte digital",
    network: "Solana",
    rarity: "Comum",
    version: 1,
    listedAt: listedDaysAgo(40),
    salesCount: 15,
  },
  {
    id: "copper-dreamer-031",
    slug: "copper-dreamer-031",
    name: "Copper Dreamer #031",
    artist: "Tati Lins",
    collection: "Night Shift",
    description:
      "Retrato de ficção científica em tiragem limitada de doze peças.",
    imageUrl: apeGreenJacketImage,
    priceEth: "2.4400",
    available: 1,
    maxQuantity: 1,
    category: "Arte 3D",
    network: "Ethereum",
    rarity: "Lendário",
    version: 1,
    listedAt: listedDaysAgo(3),
    salesCount: 130,
  },
  {
    id: "soft-machine-120",
    slug: "soft-machine-120",
    name: "Soft Machine #120",
    artist: "Ravi K",
    collection: "Soft Machines",
    description:
      "Um experimento visual em colagem, interface e nostalgia computacional.",
    imageUrl: apeHeadphonesImage,
    priceEth: "0.9200",
    available: 6,
    maxQuantity: 2,
    category: "Generativa",
    network: "Polygon",
    rarity: "Raro",
    version: 1,
    listedAt: listedDaysAgo(60),
    salesCount: 75,
  },
  {
    id: "bucket-ape-001",
    slug: "bucket-ape-001",
    name: "Bucket Ape #001",
    artist: "Nina Cobalt",
    collection: "Kurio Primate Club",
    description:
      "Peça em destaque da Kurio: um retrato de edição única com chapéu bucket e moletom lilás, disponível por tempo limitado.",
    imageUrl: apeBucketHatImage,
    priceEth: "3.5000",
    available: 1,
    maxQuantity: 1,
    category: "Colecionáveis",
    network: "Ethereum",
    rarity: "Lendário",
    version: 1,
    listedAt: listedDaysAgo(1),
    salesCount: 250,
    featured: true,
  },
];

const catalogNftCount = 36;
const nftGeneratorSeed = 20261020;

// Deterministic PRNG (mulberry32): generated NFTs are identical on every load, keeping ids stable.
const createRandomGenerator = (seed: number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
};

const themesByImage = [
  {
    image: apeGreenJacketImage,
    collection: "Kurio Primate Club",
    prefixes: ["Emerald", "Varsity", "Jade", "Ivy"],
    description:
      "Retrato de primata com jaqueta college e acessórios de esmeralda.",
  },
  {
    image: apeHeadphonesImage,
    collection: "Golden Frequencies",
    prefixes: ["Golden", "Amber", "Honey", "Sunset"],
    description: "Personagem musical com fones verdes e jaqueta bomber creme.",
  },
  {
    image: apeTurtleneckImage,
    collection: "Night Shift",
    prefixes: ["Onyx", "Shadow", "Noir", "Velvet"],
    description: "Retrato elegante com gola alta verde e blazer de linho.",
  },
  {
    image: apeBucketHatImage,
    collection: "Garden of Elsewhere",
    prefixes: ["Sage", "Lilac", "Moss", "Misty"],
    description: "Retrato tranquilo com chapéu bucket e moletom lilás.",
  },
] as const;

const nameSuffixes = [
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
const artists = [
  "Nina Cobalt",
  "Brenno Mota",
  "Luma Amaral",
  "Kiko Mar",
  "Tati Lins",
  "Ravi K",
] as const;
const catalogCategories = [
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
const networks: Network[] = ["Ethereum", "Polygon", "Solana"];
const rarities: Nft["rarity"][] = ["Comum", "Raro", "Épico", "Lendário"];

const generateRandomNfts = (count: number): Nft[] => {
  const random = createRandomGenerator(nftGeneratorSeed);
  const pickFrom = <TOption>(options: readonly TOption[]) =>
    options[Math.floor(random() * options.length)];
  const randomInt = (min: number, max: number) =>
    min + Math.floor(random() * (max - min + 1));
  const usedIds = new Set(curatedNfts.map((nft) => nft.id));
  const generatedNfts: Nft[] = [];

  while (generatedNfts.length < count) {
    const theme = pickFrom(themesByImage);
    const editionNumber = String(randomInt(1, 999)).padStart(3, "0");
    const baseName = `${pickFrom(theme.prefixes)} ${pickFrom(nameSuffixes)}`;
    const nftId = `${baseName.toLowerCase().replace(" ", "-")}-${editionNumber}`;
    if (usedIds.has(nftId)) continue;
    usedIds.add(nftId);

    const availableStock = randomInt(1, 12);
    // ~1/3 listed in the current month ("Novos lançamentos"); the rest spread over the last 90 days.
    const daysSinceListing =
      random() < 0.34
        ? randomInt(0, Math.max(0, new Date().getDate() - 1))
        : randomInt(32, 90);
    generatedNfts.push({
      id: nftId,
      slug: nftId,
      name: `${baseName} #${editionNumber}`,
      artist: pickFrom(artists),
      collection: theme.collection,
      description: theme.description,
      imageUrl: theme.image,
      priceEth: (randomInt(10, 500) / 100).toFixed(4),
      available: availableStock,
      maxQuantity: randomInt(1, Math.min(4, availableStock)),
      category: pickFrom(catalogCategories),
      network: pickFrom(networks),
      rarity: pickFrom(rarities),
      version: 1,
      listedAt: listedDaysAgo(daysSinceListing),
      salesCount: randomInt(0, 300),
    });
  }

  return generatedNfts;
};

export const nftFixtures: Nft[] = [
  ...curatedNfts,
  ...generateRandomNfts(catalogNftCount - curatedNfts.length),
];

export {
  apeBucketHatImage,
  apeGreenJacketImage,
  apeHeadphonesImage,
  apeTurtleneckImage,
};