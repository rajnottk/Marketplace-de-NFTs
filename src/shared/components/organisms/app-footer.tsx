import { Link } from "@tanstack/react-router";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { NewsletterForm } from "shared/components/molecules/newsletter-form";

type FooterLinkTarget = "/account/profile" | "/help" | "/collection";

interface FooterLinkColumn {
  title: string;
  target: FooterLinkTarget;
  links: string[];
}

const highlights = [
  {
    initial: "W",
    title: "Segurança da carteira",
    description:
      "Proteja sua carteira e colecione arte digital verificada com confiança.",
  },
  {
    initial: "C",
    title: "Criadores em destaque",
    description:
      "Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.",
  },
  {
    initial: "D",
    title: "Alertas de lançamentos",
    description:
      "Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.",
  },
] as const;

// Profile sub-pages don't exist yet: every profile link points to /account/profile for now.
const linkColumns: FooterLinkColumn[] = [
  {
    title: "Meu perfil",
    target: "/account/profile",
    links: [
      "Meu perfil",
      "Minha coleção",
      "Atividade",
      "Estúdio do criador",
      "Lista de interesse",
    ],
  },
  {
    title: "Central de ajuda",
    target: "/help",
    links: [
      "Central de ajuda",
      "Como comprar NFTs",
      "Carteira e segurança",
      "Política do mercado",
      "Denunciar item",
    ],
  },
  {
    title: "Coleções",
    target: "/collection",
    links: ["Arte digital", "Fotografia", "Música", "Arte 3D", "Utilidade"],
  },
];

// Lucide only ships outline icons: `filled` paints the glyph with currentColor (Instagram stays outlined).
const socialNetworks: {
  label: string;
  href: string;
  icon: LucideIcon;
  filled: boolean;
}[] = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: Facebook,
    filled: true,
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: Instagram,
    filled: false,
  },
  { label: "X (Twitter)", href: "https://x.com", icon: Twitter, filled: true },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: Linkedin,
    filled: true,
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: Youtube,
    filled: true,
  },
];

const compatibleWallets = ["MetaMask", "WalletConnect", "Coinbase"];
const contactEmail = "contato@email.com";
const contactPhone = "+55 11 4002 8922";

const columnTitleClassName = "text-xl font-bold text-ink";
// Vertical orange dividers between the top-row columns (desktop only).
const firstColumnClassName = "lg:pr-6";
const middleColumnClassName = "lg:border-l lg:border-[#D28A4C] lg:px-6";
const lastColumnClassName = "lg:border-l lg:border-[#D28A4C] lg:pl-6";

const AppFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="hidden px-4 pb-6 pt-16 md:block xl:px-0">
      <div className="mx-auto max-w-[1200px] overflow-hidden bg-[#241612]">
        <div className="grid gap-8 px-8 py-8 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.3fr] lg:gap-0 lg:pl-12 lg:pr-8">
          {highlights.map((highlight, index) => (
            <section
              aria-labelledby={`footer-highlight-${index}`}
              className={
                index === 0 ? firstColumnClassName : middleColumnClassName
              }
              key={highlight.initial}
            >
              <span
                aria-hidden
                className="grid h-[72px] w-[72px] place-items-center rounded-full bg-[#D28A4C] text-2xl font-bold text-[#140D0A]"
              >
                {highlight.initial}
              </span>
              <h2
                className="mt-5 text-base font-bold text-ink"
                id={`footer-highlight-${index}`}
              >
                {highlight.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#CFB28C]">
                {highlight.description}
              </p>
            </section>
          ))}
          <section
            aria-labelledby="footer-newsletter-heading"
            className={lastColumnClassName}
          >
            <h2
              className="text-lg font-bold leading-5 text-ink"
              id="footer-newsletter-heading"
            >
              Antecipe-se ao próximo lançamento
            </h2>
            <div className="mt-5">
              <NewsletterForm />
            </div>
            <p className="mt-5 text-sm leading-6 text-[#CFB28C]">
              Receba lançamentos selecionados, histórias de criadores e
              novidades do mercado.
            </p>
          </section>
        </div>

        <div className="grid items-center gap-4 bg-[#3B2314] px-8 py-6 text-sm text-ink sm:grid-cols-2 lg:grid-cols-4">
          <Link
            aria-label="Kurio: página inicial"
            className="font-bold tracking-[0.15em]"
            to="/"
          >
            KURIO
          </Link>
          <p className="leading-6">
            Feito para colecionadores,
            <br />
            criadores e cultura
          </p>
          <a
            className="w-fit hover:text-accent"
            href={`mailto:${contactEmail}`}
          >
            {contactEmail}
          </a>
          <a
            className="w-fit hover:text-accent"
            href={`tel:${contactPhone.replace(/\s/g, "")}`}
          >
            {contactPhone}
          </a>
        </div>

        <div className="grid gap-10 px-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {linkColumns.map((column) => (
            <nav aria-label={column.title} key={column.title}>
              <h2 className={columnTitleClassName}>{column.title}</h2>
              <ul className="mt-4 space-y-3 text-sm text-ink">
                {column.links.map((linkLabel) => (
                  <li key={linkLabel}>
                    <Link
                      className="transition-colors hover:text-accent"
                      to={column.target}
                    >
                      {linkLabel}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div>
            <h2 className={columnTitleClassName}>Redes sociais</h2>
            <ul className="mt-4 flex gap-3">
              {socialNetworks.map(
                ({ label, href, icon: SocialIcon, filled }) => (
                  <li key={label}>
                    <a
                      aria-label={label}
                      className="group grid h-10 w-10 place-items-center rounded-md border border-[#D28A4C] text-[#D28A4C] transition-colors hover:bg-[#D28A4C] hover:text-[#140D0A]"
                      href={href}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <SocialIcon
                        aria-hidden
                        // YouTube's play triangle is the icon's last path: repaint it with the background so it stays visible when filled.
                        className={
                          label === "YouTube"
                            ? "[&>path:last-child]:fill-[#241612] group-hover:[&>path:last-child]:fill-[#D28A4C] [&>path:last-child]:stroke-[#241612] group-hover:[&>path:last-child]:stroke-[#D28A4C]"
                            : undefined
                        }
                        fill={filled ? "currentColor" : "none"}
                        size={20}
                      />
                    </a>
                  </li>
                ),
              )}
            </ul>
            <h2 className={`mt-8 ${columnTitleClassName}`}>
              Carteiras compatíveis
            </h2>
            <p className="mt-4 inline-flex items-center gap-x-2 whitespace-nowrap rounded-md border border-[#D28A4C]/60 bg-[#3B2314] px-3 py-2 text-[10px] font-bold uppercase text-[#E89B55]">
              {compatibleWallets.map((wallet, index) => (
                <span className="inline-flex items-center gap-2" key={wallet}>
                  {index > 0 && <span aria-hidden>•</span>}
                  {wallet}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
      <p className="mt-6 text-center text-sm text-ink">
        © {currentYear} Kurio. Propriedade digital para todos.
      </p>
    </footer>
  );
};

export { AppFooter };