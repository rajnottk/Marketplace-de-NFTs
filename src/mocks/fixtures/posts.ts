import apeBucketHatImage from "assets/images/ape-bucket-hat.png";
import apeHeadphonesImage from "assets/images/ape-headphones.png";
import apeGreenJacketImage from "assets/images/ape-green-jacket.png";
import apeTurtleneckImage from "assets/images/ape-turtleneck.png";
import type { Post } from "shared/contracts/marketplace";

export const postFixtures: Post[] = [
  {
    id: "how-nft-ownership-works",
    publishedAt: "2026-09-12",
    readingTimeMinutes: 6,
    title: "Como funciona a propriedade de NFTs",
    description: "Aprenda a colecionar, negociar e verificar ativos digitais.",
    imageUrl: apeTurtleneckImage,
  },
  {
    id: "10-digital-artists-to-follow",
    publishedAt: "2026-09-13",
    readingTimeMinutes: 2,
    title: "10 artistas digitais para acompanhar",
    description: "Conheça criadores que moldam a cultura digital.",
    imageUrl: apeGreenJacketImage,
  },
  {
    id: "rarity-traits-and-provenance",
    publishedAt: "2026-09-15",
    readingTimeMinutes: 3,
    title: "Raridade, atributos e procedência",
    description:
      "Entenda raridade, procedência, direitos autorais e utilidade.",
    imageUrl: apeBucketHatImage,
  },
  {
    id: "how-to-protect-your-wallet",
    publishedAt: "2026-09-15",
    readingTimeMinutes: 2,
    title: "Como proteger sua carteira",
    description: "Proteja sua carteira, seus ativos e sua identidade.",
    imageUrl: apeHeadphonesImage,
  },
];