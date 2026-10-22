import { useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeft2 } from "iconsax-react";

const MobileBackButton = () => {
  const router = useRouter();
  const navigate = useNavigate();
  const handleBack = () => {
    if (router.history.canGoBack()) {
      router.history.back();
      return;
    }
    void navigate({ to: "/" });
  };
  return (
    <button
      aria-label="Voltar"
      className="grid size-8 shrink-0 place-items-center rounded-full border border-[#D28A4C]/30 bg-[#2F1D15] text-[#CFB28C] hover:text-accent md:hidden"
      onClick={handleBack}
      type="button"
    >
      <ArrowLeft2 aria-hidden color="currentColor" size={16} variant="Linear" />
    </button>
  );
};

export { MobileBackButton };