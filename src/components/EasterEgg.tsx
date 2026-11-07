import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { trackEvent } from '../lib/analytics';

interface EasterEggProps {
  config: {
    enable: boolean;
    triggerMode: 'keyboard' | 'theme_sequence';
    sequenceLength?: number;
    secretKeyList?: string[];
    couponCode?: string;
    message?: string;
  } | null;
}

export function EasterEgg({ config }: EasterEggProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [decryptedMessage, setDecryptedMessage] = useState("");
  const [activeCouponCode, setActiveCouponCode] = useState("");
  const [copyStatus, setCopyStatus] = useState("複製優惠碼");
  const [currentTime, setCurrentTime] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const copyToClipboard = () => {
    if (activeCouponCode) {
      navigator.clipboard.writeText(activeCouponCode);
      setCopyStatus("已複製！");
      trackEvent("copy_coupon", { coupon_code: activeCouponCode });
      setTimeout(() => setCopyStatus("複製優惠碼"), 2000);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentTime(new Date().toISOString());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!config || !config.enable) return;

    let keyBuffer: string[] = [];
    const maxLen = config.sequenceLength || (config.secretKeyList ? config.secretKeyList.length : 10);

    const checkSequence = async () => {
      if (keyBuffer.length === maxLen) {
        setIsVerifying(true);
        try {
          const res = await fetch('/api/easter-egg/unlock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              triggerMode: config.triggerMode,
              inputSequence: keyBuffer,
            }),
          });
          const data = await res.json();
          if (data && data.success) {
            setDecryptedMessage(data.message || '');
            setActiveCouponCode(data.couponCode || '');
            setIsOpen(true);
            trackEvent("unlock_easter_egg", { trigger_mode: config.triggerMode });
            keyBuffer = [];
          } else {
            // Reset buffer if not matching
            keyBuffer = [];
          }
        } catch (err) {
          console.error("Easter Egg unlock failed:", err);
          keyBuffer = [];
        } finally {
          setIsVerifying(false);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (config.triggerMode !== 'keyboard') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (!e.key) return;

      let key = e.key.toUpperCase();
      const keyMap: Record<string, string> = {
        'ARROWUP': '上',
        'ARROWDOWN': '下',
        'ARROWLEFT': '左',
        'ARROWRIGHT': '右',
        ' ': '空白',
        'ENTER': '確認',
        'ESCAPE': '取消',
        '.': '點',
        '>': '大於',
        '<': '小於',
        ',': '逗號',
        '/': '斜線',
        '?': '問號',
        ';': '分號',
        ':': '冒號',
        '\'': '單引號',
        '"': '雙引號'
      };
      key = keyMap[key] || key;

      keyBuffer.push(key);
      if (keyBuffer.length > maxLen) {
        keyBuffer.shift();
      }

      checkSequence();
    };

    const handleThemeChange = (e: Event) => {
      if (config.triggerMode !== 'theme_sequence') return;

      const customEvent = e as CustomEvent<{ colorName: string }>;
      const color = customEvent.detail?.colorName?.toUpperCase();

      if (color) {
        keyBuffer.push(color);
        if (keyBuffer.length > maxLen) {
          keyBuffer.shift();
        }
        checkSequence();
      }
    };

    if (config.triggerMode === 'keyboard') {
      window.addEventListener('keydown', handleKeyDown);
    } else if (config.triggerMode === 'theme_sequence') {
      window.addEventListener('themeChange', handleThemeChange);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, [config]);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with high-tech blur */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
        onClick={() => setIsOpen(false)}
      />

      {/* System Style Modal */}
      <div className="relative z-10 max-w-lg w-full brutalist-block overflow-hidden bg-paper border-4 border-ink shadow-[16px_16px_0_0_#000]">
        {/* System Header */}
        <div className="bg-ink text-white p-3 flex justify-between items-center border-b-4 border-ink">
          <div className="font-mono text-xs tracking-tighter font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-accent animate-pulse"></span>
            JOANNE_DEEP_ARCHIVE // EXTRACTING_SIGNAL
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="font-mono font-bold hover:text-accent transition-colors cursor-pointer"
            title="CLOSE_SIGNAL"
          >
            [X]
          </button>
        </div>

        {/* Content Area */}
        <div className="p-8">
          <div className="mb-8 font-mono text-[10px] text-ink/40 leading-none">
            DATE: {currentTime}
            <br />
            STATUS: RESTRICTED_ACCESS_GRANTED
          </div>

          <div className="mb-6 font-serif text-2xl md:text-3xl font-black text-ink border-l-8 border-accent pl-6 py-2 uppercase tracking-tight">
            深度紀錄：
            <br />
            提取成功
          </div>

          <div className="prose prose-p:font-sans prose-headings:font-serif prose-a:text-accent prose-a:font-bold prose-strong:font-bold prose-hr:border-ink/10 text-ink/90 text-lg leading-relaxed bg-ink/[0.03] p-6 border-2 border-dashed border-ink/20">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {decryptedMessage.replace(/\n/g, '  \n')}
            </ReactMarkdown>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="font-mono text-[10px] animate-pulse text-accent font-bold">
              SYSTEM_MSG: CONNECTION_STABLE
            </div>
            
            {activeCouponCode && (
              <button 
                onClick={copyToClipboard}
                className="w-full py-3 border-2 border-accent text-accent font-bold hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span className="font-mono text-xs opacity-50 group-hover:opacity-100">[{activeCouponCode}]</span>
                {copyStatus}
              </button>
            )}

            <button
              onClick={() => setIsOpen(false)}
              className="brutalist-button w-full py-4 text-lg tracking-[0.2em] uppercase cursor-pointer"
            >
              終止提取
            </button>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="bg-[#EAE8E4] p-2 border-t-4 border-ink font-mono text-[9px] text-ink/50 flex justify-between">
          <span>SECURE_PROTOCOL: ENABLED</span>
          <span>ENCRYPTION: SERVER_SIDE_D1_RESTRICTED</span>
        </div>
      </div>
    </div>
  );
}
