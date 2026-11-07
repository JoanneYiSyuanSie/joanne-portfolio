import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

const BREVO_FORM_ACTION =
  "https://aa713cf2.sibforms.com/serve/MUIFAFXTIrsKOIeKK7jOqwucDvkUyLwQRT6Nvd3ZCHTfmby0MQA0AlAzyRhGWTYfy8G7XBz_GNlDY2SlxNoSBjuYcLuK6Iwkhz-UaQEPqyumtSWbNZQ35_6ShqB8GN6l3dQHJEVFFtvV9k66kODR0UzXyptWCKHoEX-Oyb5pmkL_pImD6NAbyYgcHHWxMehPDKfsWrehlXFn5k-xlw==";
const IFRAME_NAME = "brevo-submit-target";

type ModalState = "idle" | "submitting" | "success";

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewsletterModal({ isOpen, onClose }: NewsletterModalProps) {
  const [state, setState] = useState<ModalState>("idle");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isAdult, setIsAdult] = useState(false);
  const [source, setSource] = useState("website");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Detect URL parameter for UTM source tracking or fallback to document.referrer
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get("utm_source") || params.get("source") || params.get("src");
      if (utmSource) {
        setSource(utmSource.substring(0, 100)); // limit length
      } else if (document.referrer) {
        try {
          const refUrl = new URL(document.referrer);
          const host = refUrl.hostname.toLowerCase();
          if (host.includes("threads.net")) {
            setSource("threads");
          } else if (host.includes("plurk.com")) {
            setSource("plurk");
          } else if (host.includes("twitter.com") || host.includes("t.co") || host.includes("x.com")) {
            setSource("twitter");
          } else if (host.includes("facebook.com") || host.includes("fb.me") || host.includes("fb.com")) {
            setSource("facebook");
          } else if (host.includes("instagram.com")) {
            setSource("instagram");
          } else {
            setSource("website");
          }
        } catch (e) {
          console.warn("Failed to parse referrer URL:", e);
          setSource("website");
        }
      } else {
        setSource("website");
      }
    }
  }, [isOpen]);

  // Handle form submit
  const handleSubmit = useCallback(() => {
    if (state === "submitting") return;
    setState("submitting");

    // Listen for iframe load (indicates form was submitted)
    const iframe = iframeRef.current;
    if (iframe) {
      const onLoad = () => {
        setState("success");
        iframe.removeEventListener("load", onLoad);
      };
      iframe.addEventListener("load", onLoad);
    }

    // Fallback: if iframe load doesn't fire in 4s, assume success
    setTimeout(() => {
      setState((prev) => (prev === "submitting" ? "success" : prev));
    }, 4000);

    // Submit the form
    formRef.current?.submit();
  }, [state]);

  // Reset state when closing
  const handleClose = useCallback(() => {
    if (state === "submitting") return;
    setState("idle");
    setEmail("");
    setName("");
    setIsAdult(false);
    onClose();
  }, [state, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      {/* Hidden iframe for form submission */}
      <iframe
        ref={iframeRef}
        name={IFRAME_NAME}
        title="newsletter-submit"
        className="hidden"
        aria-hidden="true"
      />

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        {/* Modal card */}
        <div className="relative w-full max-w-md bg-paper border-4 border-ink shadow-[8px_8px_0_0_#0A0A0A] animate-modal-in">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 font-mono font-bold text-ink hover:text-accent transition-colors z-10"
            aria-label="關閉"
          >
            [✕]
          </button>

          {state === "success" ? (
            /* ====== SUCCESS STATE ====== */
            <div className="p-8 text-center space-y-6">
              <div className="font-mono text-xs font-bold text-accent tracking-widest flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-accent inline-block" />
                SUBSCRIPTION_CONFIRMED
              </div>
              <div className="font-serif text-3xl font-black text-ink">
                歡迎加入檔案庫。
              </div>
              <p className="font-sans text-sm text-ink-light">
                您將會不定期收到來自 Joanne Archive 的技術通訊。
                <br />
                感謝您的訂閱！
              </p>
              <div className="font-mono text-xs text-ink/40 tracking-widest">
                /// TRANSMISSION_COMPLETE ///
              </div>
              <button
                onClick={handleClose}
                className="brutalist-button px-6 py-2 text-sm"
              >
                關閉視窗
              </button>
            </div>
          ) : (
            /* ====== FORM STATE ====== */
            <>
              {/* Header */}
              <div className="bg-ink text-white p-6">
                <div className="font-mono text-[10px] font-bold text-white/40 tracking-widest mb-2">
                  INCOMING_TRANSMISSION
                </div>
                <h2 className="font-serif text-xl font-black">
                  訂閱電子報{" "}
                  <span className="text-accent">___</span>
                </h2>
              </div>

              {/* Form */}
              <form
                ref={formRef}
                action={BREVO_FORM_ACTION}
                method="POST"
                target={IFRAME_NAME}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="p-6 space-y-5"
              >

                {/* Description */}
                <p className="font-sans text-sm text-ink-light leading-relaxed">
                  不定期發信。創作閒聊、寫作心得、更新通知等。
                </p>

                {/* Email field */}
                <div className="space-y-2">
                  <label
                    htmlFor="modal-email"
                    className="font-mono text-xs font-bold text-ink tracking-wider flex items-center gap-1"
                  >
                    EMAIL <span className="text-accent">*</span>
                  </label>
                  <input
                    id="modal-email"
                    type="email"
                    name="EMAIL"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-white border-4 border-ink font-mono text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                {/* Name field */}
                <div className="space-y-2">
                  <label
                    htmlFor="modal-name"
                    className="font-mono text-xs font-bold text-ink/60 tracking-wider"
                  >
                    暱稱（選填）
                  </label>
                  <input
                    id="modal-name"
                    type="text"
                    name="FIRSTNAME"
                    maxLength={200}
                    autoComplete="given-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="您希望我們怎麼稱呼您？"
                    className="w-full px-4 py-3 bg-white border-4 border-ink/40 font-mono text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                {/* R18 checkbox */}
                <div className="flex items-start gap-3 select-none p-3 bg-accent/5 border-2 border-dashed border-accent/20">
                  <input
                    id="modal-is-adult"
                    type="checkbox"
                    checked={isAdult}
                    onChange={(e) => setIsAdult(e.target.checked)}
                    className="w-5 h-5 mt-0.5 accent-accent cursor-pointer shrink-0"
                  />
                  <label
                    htmlFor="modal-is-adult"
                    className="font-sans font-bold text-xs text-ink cursor-pointer leading-relaxed"
                  >
                    我已年滿 18 歲，且希望接收成人內容
                  </label>
                </div>

                {/* Hidden fields for custom attributes */}
                <input type="hidden" name="IS_ADULT" value={isAdult ? "1" : "0"} />
                <input type="hidden" name="SOURCE" value={source} />

                {/* Honeypot (anti-spam, hidden) */}
                <input
                  type="text"
                  name="email_address_check"
                  defaultValue=""
                  className="hidden"
                  tabIndex={-1}
                  aria-hidden="true"
                  autoComplete="off"
                />
                <input type="hidden" name="locale" value="en" />

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={state === "submitting"}
                  className="w-full brutalist-button px-6 py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state === "submitting" ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin" />
                      傳輸中...
                    </>
                  ) : (
                    <>
                      接收通訊
                      <span className="font-mono">→</span>
                    </>
                  )}
                </button>

                {/* Microcopy */}
                <p className="font-mono text-[10px] text-ink/40 text-center leading-relaxed">
                  我們絕不發送垃圾信件，您隨時可以取消訂閱。
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
