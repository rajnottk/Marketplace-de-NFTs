import imagemMacacoChapeuBucket from "assets/images/ape-bucket-hat.png";
import imagemMacacoFoneDeOuvido from "assets/images/ape-headphones.png";
import imagemMacacoJaquetaVerde from "assets/images/ape-green-jacket.png";
import imagemMacacoGolaAlta from "assets/images/ape-turtleneck.png";
import type { Post } from "shared/contracts/marketplace";

export const postFixtures: Post[] = [
  {
    id: "como-funciona-a-propriedade-de-nfts",
    dataPublicacao: "2026-09-12",
    tempoLeituraMinutos: 6,
    titulo: "Como funciona a propriedade de NFTs",
    descricao: "Aprenda a colecionar, negociar e verificar ativos digitais.",
    imageUrl: imagemMacacoGolaAlta,
  },
  {
    id: "10-artistas-digitais-para-acompanhar",
    dataPublicacao: "2026-09-13",
    tempoLeituraMinutos: 2,
    titulo: "10 artistas digitais para acompanhar",
    descricao: "Conheça criadores que moldam a cultura digital.",
    imageUrl: imagemMacacoJaquetaVerde,
  },
  {
    id: "raridade-atributos-e-procedencia",
    dataPublicacao: "2026-09-15",
    tempoLeituraMinutos: 3,
    titulo: "Raridade, atributos e procedência",
    descricao: "Entenda raridade, procedência, direitos autorais e utilidade.",
    imageUrl: imagemMacacoChapeuBucket,
  },
  {
    id: "como-proteger-sua-carteira",
    dataPublicacao: "2026-09-15",
    tempoLeituraMinutos: 2,
    titulo: "Como proteger sua carteira",
    descricao: "Proteja sua carteira, seus ativos e sua identidade.",
    imageUrl: imagemMacacoFoneDeOuvido,
  },
];