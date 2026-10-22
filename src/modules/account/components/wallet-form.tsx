import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useImperativeHandle, useState, type Ref } from "react";
import { useForm } from "react-hook-form";
import {
  AccountField,
  accountInputClassName,
} from "modules/account/components/account-field";
import { getApiError } from "shared/api/api-error";
import { queryKeys, saveWallet } from "shared/api/marketplace.api";
import { Button } from "shared/components/ui/button";
import { Input } from "shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "shared/components/ui/select";
import {
  networkSchema,
  walletDetailsSchema,
  walletTypeSchema,
  type Network,
  type User,
  type Wallet,
  type WalletDetails,
} from "shared/contracts/marketplace";

export interface WalletFormValues extends Omit<
  WalletDetails,
  "network" | "walletType"
> {
  network: Network | "";
  walletType: WalletDetails["walletType"] | "";
}
export interface WalletFormHandle {
  getValues: () => WalletFormValues;
}
interface WalletFormProps {
  wallet?: Wallet;
  user: User;
  isPrimary: boolean;
  onSaved: () => void;
  initialValues?: Partial<WalletFormValues>;
  formRef?: Ref<WalletFormHandle>;
  disabled?: boolean;
}
const ensSuffixes = [".eth", ".xyz", ".com", ".org"] as const;
const walletControlClassName = `${accountInputClassName} h-10`;

const WalletForm = ({
  wallet,
  user,
  isPrimary,
  onSaved,
  initialValues,
  formRef,
  disabled = false,
}: WalletFormProps) => {
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState(false);
  const prefix = isPrimary ? "primary" : "secondary";
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<WalletFormValues>({
    defaultValues: {
      label: wallet?.label ?? "",
      address: wallet?.address ?? "",
      network: wallet?.network ?? "",
      displayName: wallet?.displayName ?? user.displayName,
      profileName: wallet?.profileName ?? user.username ?? user.displayName,
      walletType: wallet?.walletType ?? "",
      secondaryAddress: wallet?.secondaryAddress ?? "",
      referralCode: wallet?.referralCode ?? "",
      email: wallet?.email ?? user.email,
      ensName: wallet?.ensName ?? user.ensName ?? "",
      ensSuffix: wallet?.ensSuffix ?? user.ensSuffix ?? ".eth",
      ...initialValues,
    },
  });
  useImperativeHandle(formRef, () => ({ getValues }), [getValues]);
  const mutation = useMutation({
    mutationFn: (values: WalletDetails) =>
      saveWallet({
        ...values,
        id: wallet?.id,
        isPrimary,
        sameAsPrimary: false,
        connectedState: "disconnected",
      }),
    onSuccess: (wallets) => {
      queryClient.setQueryData(queryKeys.wallets, wallets);
      setIsSaved(() => true);
      onSaved();
    },
    onError: (error) =>
      setError("root", { message: getApiError(error).message }),
  });
  const fieldId = (field: keyof WalletFormValues) =>
    `${prefix}-wallet-${field}`;
  const fieldProps = (field: keyof WalletFormValues) => ({
    ...register(field, {
      onChange: () => {
        clearErrors(field);
        clearErrors("root");
        setIsSaved(() => false);
      },
    }),
    id: fieldId(field),
    className: walletControlClassName,
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `${fieldId(field)}-error` : undefined,
  });
  const dropdown = (
    field: "network" | "walletType" | "ensSuffix",
    label: string,
    options: readonly string[],
    placeholder?: string,
  ) => (
    <Select
      disabled={mutation.isPending || disabled}
      items={options.map((value) => ({ value, label: value }))}
      onValueChange={(value) => {
        if (value) {
          setValue(field, value as WalletFormValues[typeof field], {
            shouldDirty: true,
          });
          clearErrors(field);
          setIsSaved(() => false);
        }
      }}
      value={watch(field) || null}
    >
      <SelectTrigger
        aria-describedby={errors[field] ? `${fieldId(field)}-error` : undefined}
        aria-invalid={Boolean(errors[field])}
        aria-label={label}
        className={`${walletControlClassName} border px-3 ${field === "ensSuffix" ? "shrink-0" : "w-full"} ${watch(field) ? "text-ink" : "text-muted-foreground"}`}
        id={fieldId(field)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent align="start">
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
  const textField = (
    field: Exclude<
      keyof WalletFormValues,
      "network" | "walletType" | "ensSuffix"
    >,
    label: string,
    placeholder?: string,
  ) => (
    <AccountField
      compact
      error={errors[field]?.message}
      id={fieldId(field)}
      label={label}
      required
    >
      <Input
        {...fieldProps(field)}
        autoComplete={field === "email" ? "email" : undefined}
        placeholder={placeholder}
        required
        type={field === "email" ? "email" : "text"}
      />
    </AccountField>
  );
  return (
    <form
      className="mt-8"
      noValidate
      onSubmit={handleSubmit((values) => {
        clearErrors();
        setIsSaved(() => false);
        const result = walletDetailsSchema.safeParse(values);
        if (!result.success) {
          const invalidFields = new Set<string>();
          result.error.issues.forEach((issue) => {
            const field = String(issue.path[0]);
            if (invalidFields.has(field)) return;
            setError(
              field as keyof WalletFormValues,
              {
                message:
                  field === "network" || field === "walletType"
                    ? "Selecione uma opção."
                    : issue.message,
              },
              { shouldFocus: invalidFields.size === 0 },
            );
            invalidFields.add(field);
          });
          return;
        }
        mutation.mutate(result.data);
      })}
    >
      <fieldset
        className="grid gap-x-6 gap-y-6 sm:grid-cols-2"
        disabled={mutation.isPending || disabled}
      >
        {textField("displayName", "Nome de exibição")}
        {textField("label", "Apelido da carteira")}
        <AccountField
          compact
          error={errors.network?.message}
          id={fieldId("network")}
          label="Rede"
          required
        >
          {dropdown(
            "network",
            "Rede",
            networkSchema.options,
            "Selecione uma rede",
          )}
        </AccountField>
        {textField("profileName", "Nome do perfil")}
        {textField(
          "address",
          "Endereço da carteira",
          "Endereço 0x da carteira",
        )}
        <div className="self-end">
          <Input
            {...fieldProps("secondaryAddress")}
            aria-label="ENS ou carteira secundária (opcional)"
            placeholder="ENS ou carteira secundária (opcional)"
          />
        </div>
        <AccountField
          compact
          error={errors.walletType?.message}
          id={fieldId("walletType")}
          label="Tipo de carteira"
          required
        >
          {dropdown(
            "walletType",
            "Tipo de carteira",
            walletTypeSchema.options,
            "Selecione uma carteira",
          )}
        </AccountField>
        {textField("referralCode", "Código de indicação")}
        {textField("email", "E-mail")}
        <AccountField
          compact
          error={errors.ensName?.message}
          id={fieldId("ensName")}
          label="Nome ENS"
          required
        >
          <div className="flex gap-2">
            {dropdown("ensSuffix", "Extensão ENS", ensSuffixes)}
            <Input {...fieldProps("ensName")} required />
          </div>
        </AccountField>
        <div className="sm:col-span-2">
          <Button
            className="mt-1 h-10 rounded-[3px] px-1 text-sm font-bold"
            disabled={mutation.isPending || disabled}
            type="submit"
          >
            {mutation.isPending ? "Salvando…" : "Salvar carteira"}
          </Button>
        </div>
      </fieldset>
      {errors.root && (
        <p className="mt-3 text-sm text-danger" role="alert">
          {errors.root.message}
        </p>
      )}
      {isSaved && (
        <p className="mt-3 text-sm text-[#CFB28C]" role="status">
          Carteira salva com sucesso.
        </p>
      )}
    </form>
  );
};

export { WalletForm };