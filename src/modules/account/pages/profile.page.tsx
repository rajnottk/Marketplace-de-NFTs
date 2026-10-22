import { useAuthModal } from "modules/auth/hooks/use-auth-modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { getApiError } from "shared/api/api-error";
import {
  getProfile,
  queryKeys,
  updatePassword,
  updateProfile,
} from "shared/api/marketplace.api";
import { Button } from "shared/components/ui/button";
import { Card } from "shared/components/ui/card";
import { Input } from "shared/components/ui/input";
import { useSession } from "shared/hooks/use-session";

const ProfilePage = () => {
  const queryClient = useQueryClient();
  const { openAuth } = useAuthModal();
  const { data: session } = useSession();
  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
    enabled: Boolean(session),
  });
  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const updateMutation = useMutation({
    mutationFn: () => updateProfile(displayName),
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.profile, profile);
      queryClient.setQueryData(queryKeys.session, (current: typeof session) =>
        current ? { ...current, user: profile } : current,
      );
    },
  });
  const passwordMutation = useMutation({
    mutationFn: () => updatePassword(currentPassword, nextPassword),
    onSuccess: () => {
      setCurrentPassword("");
      setNextPassword("");
    },
  });
  const error = profileQuery.error
    ? getApiError(profileQuery.error)
    : updateMutation.error
      ? getApiError(updateMutation.error)
      : passwordMutation.error
        ? getApiError(passwordMutation.error)
        : null;
  const profile = profileQuery.data;
  const value = displayName || profile?.displayName || "";

  if (!session)
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Card className="p-6 text-center">
          <p className="text-muted">Entre para editar seu perfil.</p>
          <button
            className="mt-4 inline-block text-accent underline"
            onClick={() => openAuth()}
            type="button"
          >
            Ir para login
          </button>
        </Card>
      </main>
    );
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-accent">
        Minha conta
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold">
        PERFIL DO COLECIONADOR
      </h1>
      <section className="mt-8 grid gap-6 md:grid-cols-[13rem_minmax(0,1fr)]">
        <nav
          aria-label="Configurações da conta"
          className="h-fit rounded-kurio border border-line bg-surface p-3 text-sm"
        >
          <Link
            className="block rounded px-3 py-2 text-accent"
            to="/account/profile"
          >
            Dados do perfil
          </Link>
          <Link
            className="block rounded px-3 py-2 text-muted hover:text-ink"
            to="/account/wallets"
          >
            Carteiras
          </Link>
        </nav>
        <Card className="space-y-6 p-5 sm:p-7">
          <div className="flex items-center gap-4">
            <img
              alt="Avatar da conta"
              className="h-16 w-16 rounded-full object-cover"
              src={profile?.avatarUrl ?? session.user.avatarUrl}
            />
            <div>
              <p className="font-display text-sm font-bold">
                {profile?.displayName ?? session.user.displayName}
              </p>
              <p className="mt-1 text-xs text-muted">
                {profile?.email ?? session.user.email}
              </p>
            </div>
          </div>
          <label
            className="block max-w-md text-xs text-muted"
            htmlFor="profile-name"
          >
            Nome público
            <Input
              className="mt-2"
              id="profile-name"
              onChange={(event) => setDisplayName(event.target.value)}
              value={value}
            />
          </label>
          <Button
            disabled={updateMutation.isPending || !value.trim()}
            onClick={() => updateMutation.mutate()}
          >
            Salvar alterações
          </Button>
          <div className="space-y-4 border-t border-line pt-5">
            <h2 className="font-display text-sm font-bold">SEGURANÇA</h2>
            <label
              className="block max-w-md text-xs text-muted"
              htmlFor="current-password"
            >
              Senha atual
              <Input
                className="mt-2"
                id="current-password"
                onChange={(event) => setCurrentPassword(event.target.value)}
                type="password"
                value={currentPassword}
              />
            </label>
            <label
              className="block max-w-md text-xs text-muted"
              htmlFor="next-password"
            >
              Nova senha
              <Input
                className="mt-2"
                id="next-password"
                minLength={8}
                onChange={(event) => setNextPassword(event.target.value)}
                type="password"
                value={nextPassword}
              />
            </label>
            <Button
              disabled={
                passwordMutation.isPending ||
                !currentPassword ||
                nextPassword.length < 8
              }
              onClick={() => passwordMutation.mutate()}
              variant="secondary"
            >
              Alterar senha
            </Button>
          </div>
          {error ? (
            <p className="text-xs text-danger" role="alert">
              {error.message}
            </p>
          ) : null}
        </Card>
      </section>
    </main>
  );
};

export { ProfilePage };