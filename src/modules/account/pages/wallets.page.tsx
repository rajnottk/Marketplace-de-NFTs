import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  WalletForm,
  type WalletFormHandle,
  type WalletFormValues,
} from "modules/account/components/wallet-form";
import { getApiError } from "shared/api/api-error";
import { getWallets, queryKeys } from "shared/api/marketplace.api";
import { useSession } from "shared/hooks/use-session";

const secondaryCloseDelayMs = 2_000;

const WalletsPage = () => {
  const { data: session } = useSession();
  const walletsQuery = useQuery({
    queryKey: queryKeys.wallets,
    queryFn: getWallets,
    enabled: Boolean(session),
  });
  const [isNewPrimary, setIsNewPrimary] = useState(false);
  const [isSecondaryOpen, setIsSecondaryOpen] = useState(false);
  const [shouldCopyPrimary, setShouldCopyPrimary] = useState(false);
  const [secondaryDefaults, setSecondaryDefaults] =
    useState<Partial<WalletFormValues>>();
  const [secondaryFormVersion, setSecondaryFormVersion] = useState(0);
  const [isSecondaryClosing, setIsSecondaryClosing] = useState(false);
  const secondaryFormRef = useRef<WalletFormHandle>(null);
  const previousDefaultsRef = useRef<Partial<WalletFormValues> | undefined>(
    undefined,
  );
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    },
    [],
  );
  const primary =
    walletsQuery.data?.find((wallet) => wallet.isPrimary) ??
    walletsQuery.data?.[0];
  const secondary = walletsQuery.data?.find(
    (wallet) => !wallet.isPrimary && wallet.id !== primary?.id,
  );
  const clearCloseTimer = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
    setIsSecondaryClosing(() => false);
  };
  const closeSecondaryForm = () => {
    clearCloseTimer();
    setIsSecondaryOpen(() => false);
    setShouldCopyPrimary(() => false);
    setSecondaryDefaults(() => undefined);
    previousDefaultsRef.current = undefined;
  };
  const toggleCopyPrimary = () => {
    if (!primary) return;
    clearCloseTimer();
    if (shouldCopyPrimary) {
      setShouldCopyPrimary(() => false);
      setSecondaryDefaults(() => previousDefaultsRef.current);
      setIsSecondaryOpen(() => false);
      return;
    }
    previousDefaultsRef.current =
      secondaryFormRef.current?.getValues() ?? secondaryDefaults;
    const defaults: Partial<WalletFormValues> = {
      displayName: "",
      network: primary.network,
      walletType: primary.walletType ?? "",
      email: primary.email ?? session?.user.email ?? "",
      ensName: primary.ensName ?? session?.user.ensName ?? "",
      ensSuffix: primary.ensSuffix ?? session?.user.ensSuffix ?? ".eth",
      profileName: primary.profileName ?? session?.user.username ?? "",
      label: "",
      address: "",
      secondaryAddress: "",
      referralCode: "",
    };
    setSecondaryDefaults(() => defaults);
    setSecondaryFormVersion((previous) => previous + 1);
    setShouldCopyPrimary(() => true);
    setIsSecondaryOpen(() => true);
  };
  const toggleSecondaryForm = () => {
    if (isSecondaryOpen) {
      closeSecondaryForm();
      return;
    }
    setIsSecondaryOpen(() => true);
  };
  const handleSecondarySaved = () => {
    clearCloseTimer();
    setIsSecondaryClosing(() => true);
    closeTimerRef.current = setTimeout(
      closeSecondaryForm,
      secondaryCloseDelayMs,
    );
  };
  if (!session) return null;
  if (walletsQuery.isPending)
    return (
      <p className="text-sm text-[#CFB28C]" role="status">
        Carregando carteiras…
      </p>
    );
  if (walletsQuery.error)
    return (
      <p className="text-sm text-danger" role="alert">
        {getApiError(walletsQuery.error).message}
      </p>
    );

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-base font-bold">Carteira principal</h1>
          <p className="mt-1 text-sm leading-5 text-[#CFB28C]">
            Estas carteiras ficam disponíveis no pagamento e para receber NFTs
            comprados.
          </p>
        </div>
        <button
          className="shrink-0 text-sm text-accent hover:text-primary"
          onClick={() => setIsNewPrimary(() => true)}
          type="button"
        >
          Adicionar
        </button>
      </div>
      <WalletForm
        isPrimary
        key={isNewPrimary ? "new-primary" : (primary?.id ?? "primary")}
        onSaved={() => setIsNewPrimary(() => false)}
        user={session.user}
        wallet={isNewPrimary ? undefined : primary}
      />
      <section aria-label="Carteira secundária" className="mt-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold">Carteira secundária</h2>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                checked={shouldCopyPrimary}
                className="size-4 cursor-pointer appearance-none rounded-full border border-primary checked:bg-primary checked:shadow-[inset_0_0_0_3px_var(--color-canvas)] disabled:cursor-default disabled:opacity-50"
                disabled={!primary}
                name="same-as-primary"
                onChange={() => undefined}
                onClick={toggleCopyPrimary}
                type="radio"
              />
              Igual à carteira principal
            </label>
            <button
              className="text-sm text-accent hover:text-primary"
              onClick={toggleSecondaryForm}
              type="button"
            >
              {isSecondaryOpen
                ? "Cancelar"
                : secondary
                  ? "Alterar"
                  : "Adicionar"}
            </button>
          </div>
        </div>
        {!secondary && !isSecondaryOpen && (
          <p className="mt-1 text-sm leading-5 text-[#CFB28C]">
            Você ainda não adicionou uma carteira secundária.
          </p>
        )}
        {secondary && !isSecondaryOpen && (
          <p className="mt-2 break-all text-sm leading-5 text-[#CFB28C]">
            {secondary.label} · {secondary.network} · {secondary.address}
          </p>
        )}
        {isSecondaryOpen && (
          <WalletForm
            disabled={isSecondaryClosing}
            formRef={secondaryFormRef}
            initialValues={secondaryDefaults}
            isPrimary={false}
            key={secondaryFormVersion}
            onSaved={handleSecondarySaved}
            user={session.user}
            wallet={secondary}
          />
        )}
      </section>
    </>
  );
};

export { WalletsPage };