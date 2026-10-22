import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollectorForm } from "modules/checkout/components/collector-form";
import {
  getWalletCollectorValues,
  type CollectorValues,
} from "modules/checkout/components/collector-values";
import { getApiError } from "shared/api/api-error";
import { queryKeys, saveWallet } from "shared/api/marketplace.api";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "shared/components/ui/dialog";
import type { Network, User, Wallet } from "shared/contracts/marketplace";

interface WalletConfigurationModalProps {
  wallet: Wallet;
  user: User;
  onClose: () => void;
}

const WalletConfigurationModal = ({
  wallet,
  user,
  onClose,
}: WalletConfigurationModalProps) => {
  const queryClient = useQueryClient();
  const [network, setNetwork] = useState<Network>(wallet.network);
  const mutation = useMutation({
    mutationFn: (values: CollectorValues) =>
      saveWallet({
        ...wallet,
        network,
        displayName: values.displayName,
        username: values.username,
        profileName: values.profileName,
        walletType: values.walletType as NonNullable<Wallet["walletType"]>,
        address: values.address,
        email: values.email,
        ensSuffix: values.ensName,
        secondaryAddress: values.secondaryWallet,
        referralCode: values.referralCode,
        collectorNotes: values.collectorNotes,
      }),
    onSuccess: (wallets) => {
      queryClient.setQueryData(queryKeys.wallets, wallets);
      onClose();
    },
  });
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) onClose();
      }}
      open
    >
      <DialogContent
        aria-describedby={undefined}
        className="themed-scrollbar max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-xl bg-[#241612] px-5 py-7"
        overlayClassName="bg-[#140D0A]/90"
      >
        <DialogTitle className="pr-8">Configurar carteira</DialogTitle>
        <div className="mt-6">
          <CollectorForm
            disabled={mutation.isPending}
            formId="wallet-configuration-form"
            initialValues={getWalletCollectorValues(user, wallet)}
            isQuoting={false}
            network={network}
            onConfirm={(values) => mutation.mutate(values)}
            onNetworkChange={setNetwork}
            user={user}
            wallet={wallet}
          />
        </div>
        {mutation.error && (
          <p className="mt-4 text-sm text-danger" role="alert">
            Não foi possível salvar a carteira.{" "}
            {getApiError(mutation.error).message}
          </p>
        )}
        <button
          className="mt-6 h-12 w-full rounded-full bg-primary text-sm font-bold text-[#140D0A] disabled:opacity-50"
          disabled={mutation.isPending}
          form="wallet-configuration-form"
          type="submit"
        >
          {mutation.isPending ? "Salvando…" : "Salvar carteira"}
        </button>
      </DialogContent>
    </Dialog>
  );
};

export { WalletConfigurationModal };