import { Link } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { Button } from "shared/components/ui/button";

interface UnderConstructionPageProps {
  title: string;
}

const UnderConstructionContent = ({ title }: UnderConstructionPageProps) => (
  <div className="flex flex-col items-center gap-5">
    <Construction aria-hidden className="text-accent" size={40} />
    <p className="text-sm tracking-[0.1em] text-[#CFB28C]">{title}</p>
    <h1 className="font-display text-2xl font-bold sm:text-3xl">
      PÁGINA EM CONSTRUÇÃO
    </h1>
    <p className="max-w-md text-sm leading-6 text-[#CFB28C]">
      Estamos preparando esta área. Volte em breve para conferir as novidades.
    </p>
    <Button
      className="bg-[#D28A4C] font-bold text-[#140D0A] shadow-none hover:bg-[#D28A4C]/90"
      nativeButton={false}
      render={<Link to="/" />}
    >
      Voltar ao início
    </Button>
  </div>
);

const UnderConstructionPage = ({ title }: UnderConstructionPageProps) => (
  <main className="mx-auto grid min-h-[60vh] max-w-[1200px] place-items-center px-4 py-16 text-center xl:px-0">
    <UnderConstructionContent title={title} />
  </main>
);

export { UnderConstructionContent, UnderConstructionPage };