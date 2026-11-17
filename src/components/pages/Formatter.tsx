import { useState } from "react";
import { cn } from "../../lib/utils";

export function Formatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [useIndent, setUseIndent] = useState(true);

  const formatText = () => {
    // Standardize newlines (Windows \r\n to Linux \n)
    const text = input.replace(/\r\n/g, '\n');
    const lines = text.split('\n');
    const processed: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      // Remove any existing leading full-width, half-width spaces, or &emsp; so we don't double indent
      let line = lines[i].replace(/^(?:[　\s]|&emsp;)+/, '').trimEnd();
      
      if (line === '') {
        // Keep blank lines
        processed.push('');
        continue;
      }

      // If line does NOT start with common markdown/disclaimer symbols, add emsp indentation (if enabled)
      if (useIndent && !/^[※#>*\-\[\]]/.test(line)) {
        line = '&emsp;&emsp;' + line;
      }

      processed.push(line);
    }

    // Join back with single newlines first
    let joined = processed.join('\n');
    
    // Magic Regex: Only target "single newlines" (a newline surrounded by non-newlines)
    // and convert them into "double newlines".
    // If the author already typed double newlines (or more), leave them exactly as they are!
    joined = joined.replace(/([^\n])\n([^\n])/g, '$1\n\n$2');

    setOutput(joined);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col bg-paper">
      <div className="sticky top-0 bg-ink text-white z-20 flex items-center justify-between p-4 px-6 md:px-12 border-b border-black/20">
        <div className="font-sans text-sm font-bold">排版小工具</div>
        <div className="font-mono text-xs opacity-80">離線工具</div>
      </div>

      <div className="flex-1 w-full p-6 md:p-12 pb-32 max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="font-sans text-3xl md:text-4xl font-extrabold tracking-tight text-ink leading-snug mb-4">
            自動排版小工具
          </h1>
          <p className="font-sans text-sm text-ink-light max-w-2xl leading-relaxed">
            將原稿貼在左側，點擊轉換後，右側會自動調整換行與縮排。
            <br />
            您可以勾選是否啟用小說專用的「網頁縮排（&amp;emsp;&amp;emsp;）」，不啟用時會自動清除現有的 &amp;emsp; 縮排。
            <br/><span className="text-accent">註：開頭為 ※、#、&gt; 等符號的特殊段落將自動跳過縮排。本頁面不會被搜尋引擎收錄。</span>
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[60vh]">
          {/* Input Area */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs text-ink-light flex justify-between border-b border-black/15 pb-2">
              <span>原文</span>
            </label>
            <textarea
              className="w-full flex-1 p-4 bg-white border border-black/25 font-sans text-base resize-none focus:outline-none focus:border-accent custom-scrollbar"
              placeholder="在此貼上原稿..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="flex items-center gap-2.5 mt-4 select-none">
              <input
                type="checkbox"
                id="useIndent"
                checked={useIndent}
                onChange={(e) => setUseIndent(e.target.checked)}
                className="w-5 h-5 accent-ink cursor-pointer"
              />
              <label htmlFor="useIndent" className="font-sans text-sm text-ink cursor-pointer select-none">
                啟用段落首行縮排（&amp;emsp;&amp;emsp; 小說專用）
              </label>
            </div>
            <button
              onClick={formatText}
              className="w-full py-3 bg-ink text-white font-sans font-bold hover:bg-accent transition-colors mt-2 cursor-pointer"
            >
              開始排版
            </button>
          </div>

          {/* Output Area */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs text-ink-light flex justify-between border-b border-black/15 pb-2">
              <span>排版結果</span>
              {copied && <span className="text-accent animate-pulse">已複製！</span>}
            </label>
            <textarea
              readOnly
              className="w-full flex-1 p-4 bg-black/5 border border-black/25 font-mono text-sm resize-none focus:outline-none custom-scrollbar"
              placeholder="排版結果會顯示在這裡..."
              value={output}
            />
            <button
              onClick={copyToClipboard}
              disabled={!output}
              className={cn(
                "w-full py-3 font-sans font-bold transition-colors mt-4",
                output
                  ? "bg-accent text-white hover:bg-ink cursor-pointer"
                  : "bg-black/10 text-ink/30 cursor-not-allowed"
              )}
            >
              {copied ? "已複製" : "複製結果"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
