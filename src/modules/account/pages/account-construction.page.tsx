import { UnderConstructionContent } from "modules/under-construction/pages/under-construction.page";

interface AccountConstructionPageProps {
  title: string;
}
const AccountConstructionPage = ({ title }: AccountConstructionPageProps) => (
  <div className="grid min-h-[60vh] place-items-center py-16 text-center">
    <UnderConstructionContent title={title} />
  </div>
);

export { AccountConstructionPage };