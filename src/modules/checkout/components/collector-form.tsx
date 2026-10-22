import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  collectorSchema,
  type CollectorValues,
} from "modules/checkout/components/collector-values";
import {
  checkoutRadioClassName,
  ensExtensions,
} from "modules/checkout/components/checkout-options";
import { CheckoutSelect } from "modules/checkout/components/checkout-select";
import { Input } from "shared/components/ui/input";
import type { Network, User, Wallet } from "shared/contracts/marketplace";

const controlClassName =
  "mt-2 h-10 w-full rounded-sm border border-line bg-transparent px-3 text-sm text-ink placeholder:text-muted-foreground/70 focus-visible:outline-accent aria-[invalid=true]:border-danger";

interface CollectorFieldProps {
  id: string;
  label: string;
  children: ReactNode;
  error?: string;
  required?: boolean;
}

const CollectorField = ({
  id,
  label,
  children,
  error,
  required,
}: CollectorFieldProps) => (
  <div className="min-w-0">
    <label className="block text-sm" htmlFor={id}>
      {label}
      {required && (
        <span aria-hidden="true" className="ml-1 text-accent">
          *
        </span>
      )}
    </label>
    {children}
    {error && (
      <p className="mt-2 text-xs text-danger" id={`${id}-error`} role="alert">
        {error}
      </p>
    )}
  </div>
);

interface CollectorFormProps {
  user: User;
  wallet?: Wallet;
  network: Network;
  disabled: boolean;
  isQuoting: boolean;
  onNetworkChange: (network: Network) => void;
  onConfirm: (values: CollectorValues) => void;
  initialValues?: CollectorValues;
  formId?: string;
}

const CollectorForm = ({
  user,
  wallet,
  network,
  disabled,
  isQuoting,
  onNetworkChange,
  onConfirm,
  initialValues,
  formId = "collector-form",
}: CollectorFormProps) => {
  const [useOtherWallet, setUseOtherWallet] = useState(false);
  const [values, setValues] = useState<CollectorValues>(
    initialValues ?? {
      displayName: user.displayName,
      username: "",
      profileName: "",
      walletType: "",
      address: wallet?.address ?? "",
      email: user.email,
      ensName: ".eth",
      secondaryWallet: "",
      referralCode: "",
      collectorNotes: "",
    },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!wallet) return;
    setValues((previous) =>
      previous.address ? previous : { ...previous, address: wallet.address },
    );
  }, [wallet]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled) return;
    const result = collectorSchema.safeParse(values);
    if (!result.success) {
      const nextErrors = Object.fromEntries(
        result.error.issues.map((issue) => [
          String(issue.path[0]),
          issue.message,
        ]),
      );
      setErrors(() => nextErrors);
      event.currentTarget
        .querySelector<HTMLElement>(
          `[id="${String(result.error.issues[0].path[0])}"]`,
        )
        ?.focus();
      return;
    }
    setErrors(() => ({}));
    onConfirm(result.data);
  };

  const inputProps = (name: keyof CollectorValues) => ({
    className: controlClassName,
    id: name,
    name,
    required: true,
    value: values[name],
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setValues((previous) => ({ ...previous, [name]: value }));
      setErrors((previous) => ({ ...previous, [name]: "" }));
    },
  });

  return (
    <section aria-labelledby="collector-heading" className="min-w-0">
      <h1 className="text-lg font-bold" id="collector-heading">
        Perfil do colecionador
      </h1>
      <form className="mt-5" id={formId} noValidate onSubmit={handleSubmit}>
        <fieldset
          className="grid min-w-0 gap-x-6 gap-y-5 sm:grid-cols-2"
          disabled={disabled}
        >
          <legend className="sr-only">Dados do colecionador</legend>
          <CollectorField
            error={errors.displayName}
            id="displayName"
            label="Nome de exibição"
            required
          >
            <Input {...inputProps("displayName")} autoComplete="name" />
          </CollectorField>
          <CollectorField
            error={errors.username}
            id="username"
            label="Nome de usuário"
            required
          >
            <Input {...inputProps("username")} autoComplete="username" />
          </CollectorField>
          <CollectorField id="network" label="Rede" required>
            <CheckoutSelect
              disabled={disabled || isQuoting}
              id="network"
              label="Rede"
              name="network"
              onValueChange={(value) => onNetworkChange(value as Network)}
              options={["Ethereum", "Polygon", "Solana"]}
              required
              value={network}
            />
          </CollectorField>
          <CollectorField
            error={errors.profileName}
            id="profileName"
            label="Nome do perfil"
            required
          >
            <Input {...inputProps("profileName")} />
          </CollectorField>
          <CollectorField
            error={errors.address}
            id="address"
            label="Endereço da carteira"
            required
          >
            <Input
              {...inputProps("address")}
              placeholder="Endereço da carteira"
            />
          </CollectorField>
          <CollectorField
            id="secondaryWallet"
            label="ENS ou carteira secundária (opcional)"
          >
            <Input
              {...inputProps("secondaryWallet")}
              placeholder="ENS ou carteira secundária"
              required={false}
            />
          </CollectorField>
          <CollectorField
            error={errors.walletType}
            id="walletType"
            label="Tipo de carteira"
            required
          >
            <CheckoutSelect
              disabled={disabled}
              error={errors.walletType}
              id="walletType"
              label="Tipo de carteira"
              name="walletType"
              onValueChange={(value) => {
                setValues((previous) => ({ ...previous, walletType: value }));
                setErrors((previous) => ({ ...previous, walletType: "" }));
              }}
              options={[
                "MetaMask",
                "WalletConnect",
                "Coinbase Wallet",
                "Outra carteira",
              ]}
              placeholder="Selecione uma carteira"
              required
              value={values.walletType || null}
            />
          </CollectorField>
          <CollectorField
            id="referralCode"
            label="Código de indicação (opcional)"
          >
            <Input {...inputProps("referralCode")} required={false} />
          </CollectorField>
          <CollectorField
            error={errors.email}
            id="email"
            label="E-mail"
            required
          >
            <Input {...inputProps("email")} autoComplete="email" type="email" />
          </CollectorField>
          <CollectorField id="ensName" label="Nome ENS" required>
            <CheckoutSelect
              compact
              disabled={disabled}
              id="ensName"
              label="Nome ENS"
              name="ensName"
              onValueChange={(value) =>
                setValues((previous) => ({
                  ...previous,
                  ensName: value as CollectorValues["ensName"],
                }))
              }
              options={ensExtensions}
              required
              value={values.ensName}
            />
          </CollectorField>
          <label className="flex cursor-pointer items-center gap-2 text-sm sm:col-span-2">
            <input
              checked={useOtherWallet}
              className={checkoutRadioClassName}
              name="use-other-wallet"
              onChange={() => setUseOtherWallet(() => true)}
              type="radio"
              value="other"
            />
            Usar outra carteira?
          </label>
          <CollectorField
            id="collectorNotes"
            label="Observação do colecionador (opcional)"
          >
            <textarea
              {...inputProps("collectorNotes")}
              className={`${controlClassName} h-40 resize-none py-3`}
              draggable={false}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  collectorNotes: event.target.value,
                }))
              }
              required={false}
            />
          </CollectorField>
        </fieldset>
      </form>
    </section>
  );
};

export { CollectorForm };