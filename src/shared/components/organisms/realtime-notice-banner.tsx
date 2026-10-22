import { X } from "lucide-react";
import { useRealtimeNotice } from "shared/hooks/use-realtime-notice";
import { dismissRealtimeNotice } from "shared/lib/realtime-notices";

// Accessible banner for real-time changes (prices, availability, session). The live region is always mounted
// so screen readers announce each new message.
const RealtimeNoticeBanner = () => {
  const notice = useRealtimeNotice();
  return (
    // A polite live region without the "status" role while empty, so it does not compete with page status messages.
    <div
      aria-atomic="true"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4"
      data-realtime-notice-region=""
    >
      {notice && (
        <p
          className="pointer-events-auto flex max-w-xl items-start gap-3 rounded-md border border-[#D28A4C] bg-[#241612] px-4 py-3 text-sm text-ink shadow-panel"
          data-realtime-notice=""
          key={notice.id}
        >
          <span className="flex-1">{notice.message}</span>
          <button
            aria-label="Fechar aviso"
            className="text-[#CFB28C] hover:text-accent"
            onClick={dismissRealtimeNotice}
            type="button"
          >
            <X aria-hidden size={16} />
          </button>
        </p>
      )}
    </div>
  );
};

export { RealtimeNoticeBanner };