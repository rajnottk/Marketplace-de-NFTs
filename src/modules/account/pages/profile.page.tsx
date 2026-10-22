import { useQuery } from "@tanstack/react-query";
import { ProfileForm } from "modules/account/components/profile-form";
import { getApiError } from "shared/api/api-error";
import { getProfile, queryKeys } from "shared/api/marketplace.api";
import { useSession } from "shared/hooks/use-session";

const ProfilePage = () => {
  const { data: session } = useSession();
  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
    enabled: Boolean(session),
  });
  return (
    <>
      {profileQuery.isPending && (
        <p className="text-sm text-muted" role="status">
          Carregando perfil…
        </p>
      )}
      {profileQuery.error && (
        <p className="text-sm text-danger" role="alert">
          {getApiError(profileQuery.error).message}
        </p>
      )}
      {profileQuery.data && (
        <ProfileForm key={profileQuery.data.id} profile={profileQuery.data} />
      )}
    </>
  );
};

export { ProfilePage };