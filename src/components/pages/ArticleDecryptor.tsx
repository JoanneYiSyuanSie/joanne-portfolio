import { useState } from "react";
import CryptoJS from "crypto-js";
import { ArticleRenderer } from "./ArticleRenderer";
import { Lock } from "lucide-react";

export function ArticleDecryptor({ post }: { post: any }) {
  const [isLocked, setIsLocked] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [decryptedContent, setDecryptedContent] = useState("");
  const [decryptError, setDecryptError] = useState(false);

  const handleDecrypt = () => {
    try {
      const bytes = CryptoJS.AES.decrypt(post.content, passwordInput.trim());
      const originalText = bytes.toString(CryptoJS.enc.Utf8);

      if (!originalText) {
        throw new Error("Invalid decryption key");
      }

      setDecryptedContent(originalText);
      setIsLocked(false);
      setDecryptError(false);
    } catch (err) {
      setDecryptError(true);
      setPasswordInput("");
    }
  };

  const processedContent = (decryptedContent || "").replace(/\n\n\n+/g, (match: string) => {
    const newlineCount = (match.match(/\n/g) || []).length;
    return "\n\n" + "&nbsp;\n\n".repeat(newlineCount - 2);
  });

  if (!isLocked) {
    return <ArticleRenderer processedContent={processedContent} />;
  }

  return (
    <div className="my-12 w-full p-8 md:p-12 border border-[#E5E0D8] bg-white/80 rounded-xs text-center font-sans">
      <div className="w-8 h-8 mx-auto mb-3 text-[#1A1A1A]/70 flex items-center justify-center">
        <Lock className="w-5 h-5 stroke-[1.75]" />
      </div>

      <h3 className="font-serif font-bold text-base text-[#1A1A1A] mb-1.5">
        此篇文章設有密碼
      </h3>

      {post.isR18 || post.is_r18 ? (
        <p className="text-xs text-[#666666] mb-5 leading-relaxed">
          內含敏感情節。輸入密碼即代表您已年滿 18 歲。
        </p>
      ) : (
        <p className="text-xs text-[#666666] mb-5">
          請輸入密碼以繼續閱讀。
        </p>
      )}

      {(post.password_hint || post.passwordHint) && (
        <div className="mb-4 text-xs text-[#888888] bg-[#F7F5F0] py-1.5 px-3 rounded-xs border border-[#E5E0D8] inline-block">
          密碼提示：{post.password_hint || post.passwordHint}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 max-w-xs mx-auto">
        <input
          type="text"
          name="access_code"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
          value={passwordInput}
          onChange={(e) => {
            setPasswordInput(e.target.value);
            if (decryptError) setDecryptError(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleDecrypt()}
          placeholder="請輸入密碼..."
          className="flex-1 px-3 py-1.5 text-sm bg-[#F7F5F0] border border-[#E5E0D8] rounded-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] text-center"
        />
        <button
          onClick={handleDecrypt}
          className="px-5 py-1.5 bg-accent text-white hover:opacity-90 text-xs font-medium rounded-xs transition-all cursor-pointer shrink-0"
        >
          解鎖
        </button>
      </div>

      {decryptError && (
        <div className="mt-3 text-xs text-[#D9453B]">
          密碼不正確，請重新確認。
        </div>
      )}
    </div>
  );
}
