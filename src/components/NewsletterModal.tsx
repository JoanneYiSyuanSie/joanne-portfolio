// 展示版本：訂閱表單只是功能示範，沒有串接任何電子報服務，
// 送出時不發任何請求。

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

type ModalState = "idle" | "demo";

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewsletterModal({ isOpen, onClose }: NewsletterModalProps) {
  const [state, setState] = useState<ModalState>("idle");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

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

  // Demo only: never submits anywhere.
  const handleSubmit = useCallback(() => {
    setState("demo");
  }, []);

  // Reset state when closing
  const handleClose = useCallback(() => {
    setState("idle");
    setEmail("");
    setName("");
    onClose();
  }, [onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        {/* Modal card */}
        <div className="relative w-full max-w-md bg-white border border-black/15 shadow-lg animate-modal-in">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 font-sans font-bold text-ink hover:text-accent transition-colors z-10"
            aria-label="關閉"
          >
            ✕
          </button>

          {state === "demo" ? (
            /* ====== DEMO STATE ====== */
            <div className="p-8 space-y-6">
              <div className="font-mono text-[10px] font-bold">
                <span className="bg-ink text-white px-1.5 py-0.5">功能示範</span>
              </div>
              <p className="font-sans text-base text-ink leading-relaxed">
                這是功能示範，表單內容沒有送出，也不會寄到任何地方。
              </p>
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
              <div className="p-6 pb-0">
                <h2 className="font-sans text-xl font-bold text-ink">
                  訂閱電子報
                </h2>
              </div>

              {/* Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="p-6 space-y-5"
              >
                {/* Demo notice */}
                <p className="font-sans text-sm text-ink-light leading-relaxed border border-black/15 bg-paper p-3">
                  功能示範：這個表單尚未串接電子報服務，送出後不會真的寄出。
                </p>

                {/* Description */}
                <p className="font-sans text-sm text-ink-light leading-relaxed">
                  不定期發信：SEO 與內容行銷實務筆記。
                </p>

                {/* Email field */}
                <div className="space-y-2">
                  <label
                    htmlFor="modal-email"
                    className="font-sans text-xs font-bold text-ink flex items-center gap-1"
                  >
                    Email <span className="text-accent">*</span>
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
                    className="w-full px-4 py-3 bg-white border border-black/25 font-sans text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                {/* Name field */}
                <div className="space-y-2">
                  <label
                    htmlFor="modal-name"
                    className="font-sans text-xs font-bold text-ink/60"
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
                    className="w-full px-4 py-3 bg-white border border-black/25 font-sans text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full brutalist-button px-6 py-3 text-sm flex items-center justify-center gap-2"
                >
                  訂閱
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
