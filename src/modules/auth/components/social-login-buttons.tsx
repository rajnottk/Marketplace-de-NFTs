import type { SocialProvider } from "modules/auth/apis/firebase-auth.api";

interface SocialLoginButtonsProps {
  disabled: boolean;
  onSignIn: (provider: SocialProvider) => void;
}

const GoogleIcon = () => (
  <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.25c1.9-1.75 2.97-4.33 2.97-7.36Z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.25-2.51c-.9.6-2.05.96-3.37.96-2.6 0-4.8-1.76-5.59-4.12H3.05v2.59A10 10 0 0 0 12 22Z"
    />
    <path
      fill="#FBBC05"
      d="M6.41 13.91a6 6 0 0 1 0-3.82V7.5H3.05a10 10 0 0 0 0 9l3.36-2.59Z"
    />
    <path
      fill="#EA4335"
      d="M12 5.97c1.47 0 2.79.5 3.82 1.49l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.95 5.5l3.36 2.59C7.2 7.73 9.4 5.97 12 5.97Z"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg
    aria-hidden="true"
    className="h-5 w-5 fill-[#4267B2]"
    viewBox="0 0 24 24"
  >
    <path d="M14 22v-9h3l.5-4H14V6.5c0-1.15.3-1.94 2-1.94h1.7V1.1C17.4 1.05 16.4 1 15.2 1 12.7 1 11 2.5 11 5.3V9H8v4h3v9h3Z" />
  </svg>
);

const SocialLoginButtons = ({
  disabled,
  onSignIn,
}: SocialLoginButtonsProps) => (
  <div className="space-y-3">
    <button
      className="flex h-10 w-full items-center justify-center gap-3 rounded-[5px] border border-line text-xs text-muted-foreground transition-colors hover:border-primary hover:text-ink disabled:opacity-50"
      disabled={disabled}
      onClick={() => onSignIn("google")}
      type="button"
    >
      <GoogleIcon />
      Continuar com Google
    </button>
    <button
      className="flex h-10 w-full items-center justify-center gap-3 rounded-[5px] border border-line text-xs text-muted-foreground transition-colors hover:border-primary hover:text-ink disabled:opacity-50"
      disabled={disabled}
      onClick={() => onSignIn("facebook")}
      type="button"
    >
      <FacebookIcon />
      Continuar com Facebook
    </button>
  </div>
);

export { SocialLoginButtons };