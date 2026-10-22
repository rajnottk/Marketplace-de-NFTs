import { Wrench } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "shared/components/ui/tabs";
import type { Nft } from "shared/contracts/marketplace";

const tabTriggerClassName =
  "h-full flex-none px-0 pb-2 text-lg font-normal text-ink hover:text-accent data-[active]:font-bold data-[active]:text-accent after:!bottom-0 after:!h-[3px] after:rounded-t-sm after:bg-accent";
const sectionTitleClassName = "text-base font-bold text-ink";
const sectionTextClassName = "mt-1 text-sm leading-7 text-[#CFB28C]";

interface NftDetailTabsProps {
  nft: Nft;
}

const NftDetailTabs = ({ nft }: NftDetailTabsProps) => (
  <Tabs className="mt-16" defaultValue="details">
    <TabsList
      aria-label="Informações do NFT"
      className="h-11 w-full justify-start gap-10 border-b border-[#D28A4C]/60"
      variant="line"
    >
      <TabsTrigger className={tabTriggerClassName} value="details">
        Detalhes do NFT
      </TabsTrigger>
      <TabsTrigger className={tabTriggerClassName} value="reviews">
        Avaliações de colecionadores ({nft.reviewCount})
      </TabsTrigger>
    </TabsList>

    <TabsContent className="pt-5" value="details">
      <div className="space-y-6">
        {nft.details.longDescription.map((paragraph) => (
          <p className="text-sm leading-7 text-[#CFB28C]" key={paragraph}>
            {paragraph}
          </p>
        ))}
      </div>
      <dl className="mt-6 space-y-4">
        <div>
          <dt className={sectionTitleClassName}>Rede:</dt>
          <dd className={sectionTextClassName}>
            Cunhado na {nft.network} com procedência imutável e metadados
            armazenados no IPFS.
          </dd>
        </div>
        <div>
          <dt className={sectionTitleClassName}>Contrato:</dt>
          <dd className={sectionTextClassName}>
            {nft.details.contractAddress} • Contrato inteligente ERC-721
            verificado.
          </dd>
        </div>
        <div>
          <dt className={sectionTitleClassName}>Direitos autorais:</dt>
          <dd className={sectionTextClassName}>
            Direitos autorais do criador: {nft.details.royaltyPercent}% nas
            vendas secundárias, pagos automaticamente pelos mercados
            compatíveis.
          </dd>
        </div>
      </dl>
    </TabsContent>

    <TabsContent className="pt-5" value="reviews">
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <Wrench aria-hidden className="text-accent" size={36} />
        <p className="text-lg font-bold text-ink">Avaliações em manutenção</p>
        <p className="max-w-md text-sm leading-6 text-[#CFB28C]">
          Estamos fazendo melhorias nas avaliações. Volte em breve.
        </p>
      </div>
    </TabsContent>
  </Tabs>
);

export { NftDetailTabs };