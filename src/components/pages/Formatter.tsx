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
    <div className="flex flex-col bg-[#FFFDF9]">
      <div className="sticky top-0 bg-ink text-white z-20 flex items-center justify-between p-4 px-6 md:px-12 border-b-4 border-ink">
        <div className="font-mono text-sm font-bold flex items-center gap-2">
          <span className="bg-white text-ink w-6 h-6 flex items-center justify-center rounded-sm">&gt;</span>
          TEXT_FORMATTER_UTILITY
        </div>
        <div className="font-mono text-xs font-bold opacity-80">SYS: OFFLINE_TOOL</div>
      </div>

      <div className="flex-1 w-full p-6 md:p-12 pb-32 max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="font-serif text-3xl md:text-4xl font-black text-ink leading-snug mb-4">
            自動排版小工具
          </h1>
          <p className="font-mono text-sm text-ink/70 max-w-2xl">
            將原稿貼在左側，點擊轉換後，右側會自動調整換行與縮排。
            <br />
            您可以勾選是否啟用小說專用的「網頁縮排（&amp;emsp;&amp;emsp;）」，不啟用時會自動清除現有的 &amp;emsp; 縮排。
            <br/><span className="text-accent">註：開頭為 ※、#、&gt; 等符號的特殊段落將自動跳過縮排。本頁面不會被搜尋引擎收錄。</span>
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[60vh]">
          {/* Input Area */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs font-bold text-ink flex justify-between border-b-2 border-ink pb-2">
              <span>[ INPUT_RAW_TEXT ]</span>
            </label>
            <textarea
              className="w-full flex-1 p-4 bg-white border-4 border-ink font-serif text-base resize-none focus:outline-none focus:ring-4 focus:ring-accent/30 shadow-[4px_4px_0_0_#000] custom-scrollbar"
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
                className="w-5 h-5 border-2 border-ink accent-ink cursor-pointer"
              />
              <label htmlFor="useIndent" className="font-mono text-sm font-bold text-ink cursor-pointer select-none">
                啟用段落首行縮排（&amp;emsp;&amp;emsp; 小說專用）
              </label>
            </div>
            <button
              onClick={formatText}
              className="w-full py-4 bg-ink text-white font-mono font-bold hover:bg-accent active:translate-y-[2px] transition-all mt-2 border-2 border-ink shadow-[4px_4px_0_0_#000] active:shadow-none cursor-pointer"
            >
              &gt; EXECUTE_FORMATTING
            </button>
          </div>

          {/* Output Area */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs font-bold text-ink flex justify-between border-b-2 border-ink pb-2">
              <span>[ OUTPUT_MARKDOWN ]</span>
              {copied && <span className="text-accent animate-pulse">COPIED_TO_CLIPBOARD!</span>}
            </label>
            <textarea
              readOnly
              className="w-full flex-1 p-4 bg-ink/5 border-4 border-ink font-mono text-sm resize-none focus:outline-none custom-scrollbar"
              placeholder="排版結果會顯示在這裡..."
              value={output}
            />
            <button
              onClick={copyToClipboard}
              disabled={!output}
              className={cn(
                "w-full py-4 font-mono font-bold transition-all mt-4 border-2 border-ink",
                output 
                  ? "bg-accent text-white hover:bg-ink shadow-[4px_4px_0_0_#000] active:translate-y-[2px] active:shadow-none cursor-pointer" 
                  : "bg-ink/10 text-ink/30 cursor-not-allowed"
              )}
            >
              {copied ? "COPIED !" : "&gt; COPY_TO_CLIPBOARD"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
