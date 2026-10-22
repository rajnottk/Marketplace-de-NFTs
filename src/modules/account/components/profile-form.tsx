import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  AccountField,
  accountInputClassName,
} from "modules/account/components/account-field";
import { readAvatar } from "modules/account/utils/read-avatar";
import { getApiError } from "shared/api/api-error";
import { queryKeys, updateProfile } from "shared/api/marketplace.api";
import { PasswordField } from "shared/components/molecules/password-field";
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
  profileUpdateSchema,
  type ProfileUpdate,
  type Session,
  type User,
} from "shared/contracts/marketplace";

interface ProfileFormValues {
  displayName: string;
  username: string;
  email: string;
  ensName: string;
  ensSuffix: NonNullable<User["ensSuffix"]>;
  walletAlias: string;
  avatarUrl: string;
  currentPassword: string;
  nextPassword: string;
  confirmPassword: string;
}
interface ProfileFormProps {
  profile: User;
}
const ensSuffixes = [".eth", ".xyz", ".com", ".org"] as const;
const getDefaultValues = (profile: User): ProfileFormValues => ({
  displayName: profile.displayName,
  username: profile.username ?? profile.email.split("@")[0],
  email: profile.email,
  ensName: profile.ensName ?? "",
  ensSuffix: profile.ensSuffix ?? ".eth",
  walletAlias: profile.walletAlias ?? "Carteira principal",
  avatarUrl: profile.avatarUrl,
  currentPassword: "",
  nextPassword: "",
  confirmPassword: "",
});

const ProfileForm = ({ profile }: ProfileFormProps) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReadingAvatar, setIsReadingAvatar] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({ defaultValues: getDefaultValues(profile) });
  const avatarUrl = watch("avatarUrl");
  const ensSuffix = watch("ensSuffix");
  const mutation = useMutation({
    mutationFn: (values: ProfileUpdate) => updateProfile(values),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(queryKeys.profile, updatedProfile);
      queryClient.setQueryData<Session | null>(queryKeys.session, (session) =>
        session ? { ...session, user: updatedProfile } : session,
      );
      reset(getDefaultValues(updatedProfile));
      setIsSaved(() => true);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      if (!apiError.fieldErrors) {
        setError("root", { message: apiError.message });
        return;
      }
      Object.entries(apiError.fieldErrors).forEach(([field, message]) =>
        setError(
          field as keyof ProfileFormValues,
          { message },
          { shouldFocus: true },
        ),
      );
    },
  });
  const fieldProps = (field: keyof ProfileFormValues) => ({
    ...register(field, {
      onChange: () => {
        clearErrors(field);
        clearErrors("root");
        setIsSaved(() => false);
      },
    }),
    id: `profile-${field}`,
    className: accountInputClassName,
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `profile-${field}-error` : undefined,
  });
  const submit = handleSubmit((values) => {
    clearErrors();
    setIsSaved(() => false);
    const isChangingPassword = Boolean(
      values.currentPassword || values.nextPassword || values.confirmPassword,
    );
    let hasPasswordError = false;
    if (isChangingPassword) {
      const passwordErrors = [
        [
          "currentPassword",
          !values.currentPassword,
          "Informe sua senha atual.",
        ],
        [
          "nextPassword",
          values.nextPassword.length < 8,
          "Use pelo menos oito caracteres.",
        ],
        [
          "confirmPassword",
          !values.confirmPassword ||
            values.nextPassword !== values.confirmPassword,
          "As senhas não conferem.",
        ],
      ] as const;
      passwordErrors.forEach(([field, invalid, message]) => {
        if (invalid) {
          setError(field, { message }, { shouldFocus: !hasPasswordError });
          hasPasswordError = true;
        }
      });
    }
    const result = profileUpdateSchema.safeParse({
      ...values,
      passwordChange: isChangingPassword
        ? {
            currentPassword: values.currentPassword,
            nextPassword: values.nextPassword,
          }
        : undefined,
    });
    if (!result.success) {
      result.error.issues
        .filter((issue) => issue.path[0] !== "passwordChange")
        .forEach((issue, index) =>
          setError(
            issue.path[0] as keyof ProfileFormValues,
            { message: issue.message },
            { shouldFocus: index === 0 },
          ),
        );
      return;
    }
    if (!hasPasswordError) mutation.mutate(result.data);
  });

  return (
    <form noValidate onSubmit={submit}>
      <h1 className="mb-8 text-base font-bold">Perfil do colecionador</h1>
      <fieldset disabled={mutation.isPending}>
        <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
          <AccountField
            error={errors.displayName?.message}
            id="profile-displayName"
            label="Nome de exibição"
            required
          >
            <Input
              {...fieldProps("displayName")}
              autoComplete="name"
              required
            />
          </AccountField>
          <AccountField
            error={errors.username?.message}
            id="profile-username"
            label="Nome de usuário"
            required
          >
            <Input
              {...fieldProps("username")}
              autoComplete="username"
              required
            />
          </AccountField>
          <AccountField
            error={errors.email?.message}
            id="profile-email"
            label="E-mail"
            required
          >
            <Input
              {...fieldProps("email")}
              autoComplete="email"
              type="email"
              required
            />
          </AccountField>
          <AccountField
            error={errors.ensName?.message}
            id="profile-ensName"
            label="Nome ENS"
            required
          >
            <div className="flex gap-2">
              <Select
                items={ensSuffixes.map((value) => ({ value, label: value }))}
                onValueChange={(value) => {
                  if (value) {
                    setValue(
                      "ensSuffix",
                      value as ProfileFormValues["ensSuffix"],
                      { shouldDirty: true },
                    );
                    setIsSaved(() => false);
                  }
                }}
                value={ensSuffix}
              >
                <SelectTrigger
                  aria-label="Extensão ENS"
                  className="h-9 shrink-0 rounded-[3px] border border-line px-2"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ensSuffixes.map((suffix) => (
                    <SelectItem key={suffix} value={suffix}>
                      {suffix}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input {...fieldProps("ensName")} required />
            </div>
          </AccountField>
          <AccountField
            error={errors.walletAlias?.message}
            id="profile-walletAlias"
            label="Apelido da carteira"
            required
          >
            <Input {...fieldProps("walletAlias")} required />
          </AccountField>
          <div>
            <p className="mb-2 text-sm">Avatar</p>
            <div className="flex min-h-11 items-center gap-5">
              {avatarUrl ? (
                <img
                  alt="Avatar do perfil"
                  className="size-11 rounded-full border border-line object-cover"
                  src={avatarUrl}
                />
              ) : (
                <div
                  aria-label="Sem avatar"
                  className="grid size-11 place-items-center rounded-full border border-line bg-[#321D14] text-accent"
                >
                  <ImagePlus aria-hidden="true" size={20} strokeWidth={1.5} />
                </div>
              )}
              <input
                accept="image/png,image/jpeg,image/webp"
                aria-label="Escolher imagem do perfil"
                className="sr-only"
                disabled={isReadingAvatar}
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  setIsReadingAvatar(() => true);
                  clearErrors("avatarUrl");
                  try {
                    const image = await readAvatar(file);
                    setValue("avatarUrl", image, { shouldDirty: true });
                    setIsSaved(() => false);
                  } catch (error) {
                    setError("avatarUrl", {
                      message:
                        error instanceof Error
                          ? error.message
                          : "Não foi possível carregar a imagem.",
                    });
                  } finally {
                    setIsReadingAvatar(() => false);
                  }
                }}
                ref={fileInputRef}
                type="file"
              />
              <Button
                className="h-9 rounded-[3px] px-4 text-xs font-bold"
                disabled={isReadingAvatar}
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                {isReadingAvatar ? "Carregando…" : "Alterar"}
              </Button>
              <button
                className="text-xs hover:text-accent disabled:opacity-50"
                disabled={isReadingAvatar || !avatarUrl}
                onClick={() => {
                  setValue("avatarUrl", "", { shouldDirty: true });
                  clearErrors("avatarUrl");
                  setIsSaved(() => false);
                }}
                type="button"
              >
                Remover
              </button>
            </div>
            {errors.avatarUrl && (
              <p className="mt-2 text-xs text-danger" role="alert">
                {errors.avatarUrl.message}
              </p>
            )}
          </div>
        </div>
        <section className="mt-7 space-y-5 sm:w-[calc(50%-0.75rem)]">
          <h2 className="text-base font-medium">Alterar senha</h2>
          <AccountField
            error={errors.currentPassword?.message}
            id="profile-currentPassword"
            label="Senha atual"
          >
            <PasswordField
              {...fieldProps("currentPassword")}
              value={watch("currentPassword")}
              autoComplete="current-password"
              visibilityLabel="senha atual"
            />
          </AccountField>
          <AccountField
            error={errors.nextPassword?.message}
            id="profile-nextPassword"
            label="Nova senha"
          >
            <PasswordField
              {...fieldProps("nextPassword")}
              value={watch("nextPassword")}
              autoComplete="new-password"
              visibilityLabel="nova senha"
            />
          </AccountField>
          <AccountField
            error={errors.confirmPassword?.message}
            id="profile-confirmPassword"
            label="Confirmar nova senha"
          >
            <PasswordField
              {...fieldProps("confirmPassword")}
              value={watch("confirmPassword")}
              autoComplete="new-password"
              visibilityLabel="confirmação da nova senha"
            />
          </AccountField>
        </section>
        <Button
          className="mt-7 h-9 min-w-28 rounded-[3px] text-sm font-bold"
          disabled={mutation.isPending || isReadingAvatar}
          type="submit"
        >
          {mutation.isPending ? "Salvando…" : "Salvar"}
        </Button>
      </fieldset>
      {errors.root && (
        <p className="mt-3 text-sm text-danger" role="alert">
          {errors.root.message}
        </p>
      )}
      {isSaved && (
        <p className="mt-3 text-sm text-muted" role="status">
          Perfil atualizado com sucesso.
        </p>
      )}
    </form>
  );
};

export { ProfileForm };