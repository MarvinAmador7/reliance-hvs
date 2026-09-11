import { Check, ShieldCheck, X } from "lucide-react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { useTenant } from "@/lib/tenant";
import { track } from "@/lib/track";

interface ClaimContextValue {
  claimed: boolean;
  /** Opens the claim dialog; `reason` names the interaction that triggered it. */
  openClaim: (reason: string) => void;
}

const ClaimContext = createContext<ClaimContextValue>({
  claimed: false,
  openClaim: () => undefined,
});

export const useClaim = () => useContext(ClaimContext);

type Step = "identity" | "ownership" | "done";
type Provider = "google" | "apple" | "facebook";

const providerLabel: Record<Provider, string> = {
  apple: "Apple",
  facebook: "Facebook",
  google: "Google",
};

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
      <path
        d="M21.6 12.23c0-.68-.06-1.36-.18-2.02H12v3.83h5.4a4.6 4.6 0 0 1-2 3.02v2.5h3.22c1.89-1.74 2.98-4.3 2.98-7.33Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.96-.9 6.62-2.44l-3.22-2.5c-.9.6-2.04.96-3.4.96-2.6 0-4.8-1.76-5.6-4.12H3.08v2.58A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.4 13.9a6 6 0 0 1 0-3.8V7.52H3.08a10 10 0 0 0 0 8.96L6.4 13.9Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.98c1.47 0 2.78.5 3.82 1.5l2.86-2.86A9.96 9.96 0 0 0 12 2a10 10 0 0 0-8.92 5.52L6.4 10.1c.8-2.36 3-4.12 5.6-4.12Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M16.37 12.7c.02 2.6 2.28 3.47 2.3 3.48-.02.06-.36 1.23-1.19 2.44-.71 1.05-1.45 2.09-2.62 2.11-1.15.02-1.52-.68-2.83-.68-1.31 0-1.72.66-2.8.7-1.13.04-1.99-1.13-2.71-2.17-1.47-2.13-2.6-6.02-1.08-8.65a4.2 4.2 0 0 1 3.54-2.15c1.11-.02 2.15.75 2.83.75.68 0 1.95-.92 3.29-.79.56.02 2.13.23 3.14 1.7-.08.05-1.88 1.1-1.87 3.26ZM14.2 6.4c.6-.72 1-1.73.89-2.73-.86.03-1.9.57-2.52 1.3-.55.64-1.04 1.67-.91 2.65.96.07 1.94-.49 2.54-1.22Z" />
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" fill="#1877F2" r="10" />
      <path
        d="M13.4 20v-6.2h2.08l.32-2.42H13.4V9.84c0-.7.2-1.18 1.2-1.18h1.28V6.5a17 17 0 0 0-1.87-.1c-1.85 0-3.11 1.13-3.11 3.2v1.78H8.8v2.42h2.1V20h2.5Z"
        fill="#fff"
      />
    </svg>
  );
}

const socialProviders: {
  id: Provider;
  label: string;
  mark: () => ReactNode;
}[] = [
  { id: "google", label: "Continue with Google", mark: GoogleMark },
  { id: "apple", label: "Continue with Apple", mark: AppleMark },
  { id: "facebook", label: "Continue with Facebook", mark: FacebookMark },
];

interface ClaimProviderProps {
  addressLine1: string;
  addressLine2: string;
  children: ReactNode;
  purchaseYear: string;
}

export function ClaimProvider({
  addressLine1,
  addressLine2,
  purchaseYear,
  children,
}: ClaimProviderProps) {
  const { tenant } = useTenant();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [claimed, setClaimed] = useState(false);
  const [step, setStep] = useState<Step>("identity");
  const [reason, setReason] = useState("");
  const [provider, setProvider] = useState<Provider>("google");

  const openClaim = useCallback((why: string) => {
    setReason(why);
    setStep("identity");
    track("claim_started", why);
    dialogRef.current?.showModal();
  }, []);

  const close = () => dialogRef.current?.close();

  const chooseSocial = (id: Provider) => {
    setProvider(id);
    track("claim_identity_verified", providerLabel[id]);
    setStep("ownership");
  };

  const value = useMemo(() => ({ claimed, openClaim }), [claimed, openClaim]);

  const title =
    step === "done" ? "This home is yours." : `Claim ${addressLine1}`;

  return (
    <ClaimContext.Provider value={value}>
      {children}
      <dialog
        aria-labelledby="claim-title"
        className="m-auto w-[min(100%-2rem,28rem)] rounded-3xl bg-canvas p-0 text-ink shadow-frame backdrop:bg-ink/40 backdrop:backdrop-blur-sm open:animate-[rise_320ms_var(--ease-out-quint)_both]"
        onClose={() => {
          if (step !== "done") {
            track("claim_dismissed", step);
          }
        }}
        ref={dialogRef}
      >
        <form
          className="p-7 md:p-8"
          method="dialog"
          onSubmit={(e) => {
            if (step === "ownership") {
              e.preventDefault();
              setStep("done");
              setClaimed(true);
              track("claim_verified", addressLine1);
            }
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-ink-muted text-sm">{addressLine2}</div>
              <h2 className="t-h3 mt-0.5" id="claim-title">
                {title}
              </h2>
            </div>
            <button
              aria-label="Close"
              className="-mt-1 -mr-2 rounded-full p-2 text-ink-muted hover:bg-surface hover:text-ink"
              onClick={close}
              type="button"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>

          {step === "identity" ? (
            <>
              <p className="mt-3 text-ink-muted">
                Owners can set the condition, correct the home's details, and
                keep the estimate current.
                {reason ? ` You'll be able to save ${reason}.` : ""}
              </p>
              <p className="mt-5 font-medium text-sm">First, verify it's you</p>
              <div className="mt-2 grid gap-2">
                {socialProviders.map((p) => (
                  <button
                    className="btn btn-ghost btn-md justify-start gap-3 rounded-full bg-canvas"
                    key={p.id}
                    onClick={() => chooseSocial(p.id)}
                    type="button"
                  >
                    <p.mark />
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="mt-5 inline-flex items-start gap-2 text-ink-muted text-xs leading-relaxed">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 shrink-0"
                />
                Your claim is private. {tenant.legalName} will only use it to
                keep this report accurate.
              </p>
            </>
          ) : null}

          {step === "ownership" ? (
            <>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-sm">
                <Check aria-hidden="true" className="size-4 text-brand" />
                Verified with {providerLabel[provider]}
              </div>
              <p className="mt-4 font-medium text-sm">
                Now, confirm you own the home
              </p>
              <label className="mt-2 block">
                <span className="mb-1.5 block text-ink-muted text-sm">
                  Year you bought it
                </span>
                <input
                  className="field tabular"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  placeholder={purchaseYear}
                  required
                  type="text"
                />
                <span className="mt-1.5 block text-ink-muted text-sm">
                  We match this against the deed on public record. Nothing is
                  shared with anyone.
                </span>
              </label>
              <button
                className="btn btn-brand btn-pill mt-6 w-full"
                type="submit"
              >
                Claim this home
              </button>
            </>
          ) : null}

          {step === "done" ? (
            <>
              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-brand-soft px-4 py-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-brand-ink">
                  <Check aria-hidden="true" className="size-4" />
                </span>
                <span className="text-ink text-sm">
                  You're the owner on record. Condition and detail changes now
                  save to this home.
                </span>
              </div>
              <ul className="mt-5 space-y-2 text-ink-muted text-sm">
                <li>
                  Your estimate updates monthly with your changes applied.
                </li>
                <li>
                  Only you and {tenant.agent.name.split(" ")[0]} can see what
                  you've saved.
                </li>
              </ul>
              <button
                className="btn btn-ink btn-pill mt-6 w-full"
                onClick={close}
                type="button"
              >
                Back to my report
              </button>
            </>
          ) : null}
        </form>
      </dialog>
    </ClaimContext.Provider>
  );
}

/** Pill button that opens the claim flow, or shows the claimed state. */
export function ClaimButton({ reason }: { reason: string }) {
  const { claimed, openClaim } = useClaim();
  if (claimed) {
    return (
      <span className="btn btn-soft btn-pill">
        <Check aria-hidden="true" className="size-4" />
        Your home
      </span>
    );
  }
  return (
    <button
      className="btn btn-ghost btn-pill"
      onClick={() => openClaim(reason)}
      type="button"
    >
      Claim this home
    </button>
  );
}

/** Inline text link that opens the claim flow. */
export function ClaimLink({ reason }: { reason: string }) {
  const { claimed, openClaim } = useClaim();
  if (claimed) {
    return <span className="font-medium text-ink">update it below</span>;
  }
  return (
    <button
      className="font-medium text-brand underline-offset-4 hover:underline"
      onClick={() => openClaim(reason)}
      type="button"
    >
      claim this home
    </button>
  );
}
