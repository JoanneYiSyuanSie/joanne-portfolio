import { useState, FormEvent } from "react";
import { cn } from "../lib/utils";
import { getSiteConfig } from "../lib/content";
import { trackEvent } from "../lib/analytics";

type CommissionType = "驚喜包" | "客製化" | "詢問";

interface FormData {
  isAdult: string;
  nickname: string;
  contact: string;
  clientHistory: string;
  commissionType: CommissionType | "";
  promoCode: string;
  referenceLink: string;
  acceptAu: string;
  wordCount: string;
  preferenceMode: string;
  wishlist: string;
  additionalNotes: string;
  otherQuestions: string;
  responseFrequency: string;
}

const INITIAL_DATA: FormData = {
  isAdult: "",
  nickname: "",
  contact: "",
  clientHistory: "",
  commissionType: "",
  promoCode: "",
  referenceLink: "",
  acceptAu: "",
  wordCount: "",
  preferenceMode: "",
  wishlist: "",
  additionalNotes: "",
  otherQuestions: "",
  responseFrequency: "",
};

export function CommissionForm() {
  const config = getSiteConfig();
  const [data, setData] = useState<FormData>(INITIAL_DATA);
  const [status, setStatus] = useState<"IDLE" | "SUBMITTING" | "SUCCESS" | "ERROR">("IDLE");
  const [errorMessage, setErrorMessage] = useState("");

  const isSurprisePackOpen = config.commission.surprisePackOpen;
  const isCustomCommissionOpen = config.commission.customCommissionOpen ?? true;

  const handleChange = (field: keyof FormData, value: string) => {
    setData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "isAdult" && value === "否") {
        if (prev.commissionType === "驚喜包" || prev.commissionType === "客製化") {
          next.commissionType = "詢問";
        }
      }
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setStatus("SUBMITTING");

    try {
      /*
      // --- 舊版 Google Apps Script 提交邏輯 (已註解保留) ---
      const oldUrl = config.commission.googleAppsScriptUrl;
      if (!oldUrl) {
        setStatus("ERROR");
        setErrorMessage("SYS_ERR: Webhook URL not configured.");
        return;
      }
      const response = await fetch(oldUrl, {
        method: "POST",
        body: JSON.stringify(data),
      });
      // ----------------------------------------
      */

      // --- 新版 Cloudflare Pages 提交邏輯 ---
      const url = "/api/commission";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let msg = `Server HTTP ${response.status}`;
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errData = await response.json();
            msg = errData.message || msg;
          }
        } catch (e) { }
        throw new Error(msg);
      }

      const contentType = response.headers.get("content-type");
      let result;
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        throw new Error("API 端點回應格式異常 (本地開發無 Pages Functions 環境)");
      }

      if (result.result === "success") {
        setStatus("SUCCESS");
        trackEvent("commission_submit", {
          commission_type: data.commissionType
        });
        setData(INITIAL_DATA); // Clear form
      } else {
        throw new Error(result.message || "Unknown error occurred");
      }
    } catch (err: any) {
      console.error("Form submission error:", err);
      setStatus("ERROR");
      setErrorMessage("TRANSMISSION_FAILED: " + (err.message || "Please try again later."));
    }
  };

  if (status === "SUCCESS") {
    return (
      <div className="w-full max-w-md mx-auto my-auto border-2 sm:border-4 border-ink p-6 sm:p-8 bg-white flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in zoom-in-95 box-border">
        <div className="inline-flex items-center gap-1.5 border-2 border-ink px-3 py-1 font-mono text-xs font-bold bg-white text-accent tracking-wider whitespace-nowrap">
          <span>✓</span>
          <span>TRANSMISSION_SUCCESS</span>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <h3 className="font-sans font-black text-xl text-ink">
            訊息已成功送出
          </h3>
          <p className="font-sans text-sm font-bold text-ink leading-relaxed max-w-xs sm:max-w-sm mx-auto">
            Joanne 將於 48 小時內進行處理與回覆，感謝您的耐心等候。
          </p>
        </div>

        <div className="pt-2 w-full sm:w-auto">
          <button
            onClick={() => setStatus("IDLE")}
            className="brutalist-button w-full sm:w-auto px-6 py-2.5 text-xs sm:text-sm font-mono font-bold tracking-wider"
          >
            RETURN_TO_FORM
          </button>
        </div>
      </div>
    );
  }


  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-xl mx-auto pb-8">
      {status === "ERROR" && (
        <div className="border-2 border-ink bg-paper p-4 font-mono text-xs sm:text-sm shadow-[4px_4px_0_0_#0A0A0A] border-l-8 border-l-ink space-y-1">
          <div className="text-ink font-bold flex items-center gap-2">
            <span className="bg-ink text-white px-1.5 py-0.5 text-[10px]">ERROR</span>
            <span>TRANSMISSION_FAILED</span>
          </div>
          <p className="text-ink-light font-sans font-bold text-sm leading-snug pt-1">
            {errorMessage}
          </p>
        </div>
      )}

      {/* 1. 成年確認 */}
      <div className="space-y-3 p-4 border-l-4 border-ink bg-white">
        <label className="block font-sans font-black text-lg text-ink">
          您成年了嗎？ <span className="text-accent font-bold">*</span>
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="isAdult"
              value="是"
              required
              checked={data.isAdult === "是"}
              onChange={(e) => handleChange("isAdult", e.target.value)}
              className="w-5 h-5 accent-accent cursor-pointer"
            />
            <span className="font-sans font-bold group-hover:text-accent transition-colors">是</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="isAdult"
              value="否"
              required
              checked={data.isAdult === "否"}
              onChange={(e) => handleChange("isAdult", e.target.value)}
              className="w-5 h-5 accent-accent cursor-pointer"
            />
            <span className="font-sans font-bold group-hover:text-accent transition-colors">否</span>
          </label>
        </div>
        {data.isAdult === "否" && (
          <div className="mt-3 p-3 border-2 border-ink bg-paper text-ink font-sans text-xs sm:text-sm font-bold flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2">
            <span className="font-mono text-[10px] bg-ink text-white px-1.5 py-0.5 shrink-0 font-bold">NOTICE</span>
            <span className="leading-relaxed">無論內容尺度，僅接受 18 歲以上成年人進行委託</span>
          </div>
        )}
      </div>

      {/* 2. 稱呼 */}
      <div className="space-y-2">
        <label className="block font-sans font-black text-lg text-ink">
          您的稱呼
        </label>
        <input
          type="text"
          value={data.nickname}
          onChange={(e) => handleChange("nickname", e.target.value)}
          className="w-full p-3 border-2 border-ink bg-white focus:outline-none focus:border-accent focus:shadow-[4px_4px_0_0_var(--theme-accent)] transition-all font-sans"
          placeholder="簡答文字"
        />
      </div>

      {/* 3. 聯絡方式 */}
      <div className="space-y-2">
        <label className="block font-sans font-black text-lg text-ink">
          您的 Email <span className="text-[#D9453B]">*</span>
        </label>
        <p className="text-sm font-bold text-ink-light font-sans mb-2">您偏好的聯絡信箱</p>
        <input
          type="email"
          required
          value={data.contact}
          onChange={(e) => handleChange("contact", e.target.value)}
          className="w-full p-3 border-2 border-ink bg-white focus:outline-none focus:border-accent focus:shadow-[4px_4px_0_0_var(--theme-accent)] transition-all font-sans"
          placeholder="例如：yourname@example.com"
        />
      </div>

      {/* 委託經歷 */}
      <div className="space-y-3">
        <label className="block font-sans font-black text-lg text-ink">
          曾與 Joanne 合作過嗎？ <span className="text-[#D9453B]">*</span>
        </label>
        <div className="flex flex-wrap gap-6 mt-2">
          {["初次合作", "非初次合作"].map((option) => (
            <label key={option} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="clientHistory"
                value={option}
                required
                checked={data.clientHistory === option}
                onChange={(e) => handleChange("clientHistory", e.target.value)}
                className="w-5 h-5 accent-accent cursor-pointer shrink-0"
              />
              <span className="font-sans font-bold group-hover:text-accent transition-colors">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 4. 優惠碼 */}
      <div className="space-y-2">
        <label className="block font-sans font-black text-lg text-ink">
          優惠碼
        </label>
        <input
          type="text"
          value={data.promoCode}
          onChange={(e) => handleChange("promoCode", e.target.value)}
          className="w-full p-3 border-2 border-ink bg-white focus:outline-none focus:border-accent focus:shadow-[4px_4px_0_0_var(--theme-accent)] transition-all font-sans"
          placeholder="符合使用條件方可折抵"
        />
      </div>

      {/* 5. 委託形式 */}
      <div className="space-y-3 p-4 border-2 border-ink bg-paper shadow-[4px_4px_0_0_#0A0A0A]">
        <label className="block font-sans font-black text-lg text-ink">
          委託形式 <span className="text-[#D9453B]">*</span>
        </label>
        <div className="space-y-4 mt-4">
          {(config.commission.types || [
            { id: "驚喜包", label: "1. 初次委託限定驚喜包", description: "不需提供詳細大綱，由作者根據設定自由發揮。" },
            { id: "客製化", label: "2. 客製化委託 (以字數計價)", description: "希望指定具體情節、角色互動與結局走向等細節。\n可修改兩次，若事前已確認大綱或主題則不接受大幅度修改（paro／劇情走向等）。" },
            { id: "詢問", label: "3. 單純詢問 / 問題回報等", description: "若不確定委託範圍、想洽談特殊合作，或是純粹打招呼，請選此項。" }
          ]).map((type) => {
            const isAdultOnly = type.id === "驚喜包" || type.id === "客製化";
            const isClosed = (type.id === "驚喜包" && !isSurprisePackOpen) || (type.id === "客製化" && !isCustomCommissionOpen);
            const isDisabled = (data.isAdult === "否" && isAdultOnly) || isClosed;

            return (
              <label
                key={type.id}
                className={cn(
                  "flex items-start gap-3 relative transition-opacity",
                  isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer group"
                )}
              >
                <input
                  type="radio"
                  name="commissionType"
                  value={type.id}
                  required
                  disabled={isDisabled}
                  checked={data.commissionType === type.id}
                  onChange={(e) => handleChange("commissionType", e.target.value as CommissionType)}
                  className="w-5 h-5 mt-0.5 accent-accent cursor-pointer peer shrink-0 disabled:cursor-not-allowed"
                />
                <span className="font-sans font-bold peer-checked:text-accent group-hover:text-accent transition-colors flex items-center flex-wrap gap-2">
                  {type.label}
                  <span className="text-[10px] font-mono bg-ink/10 text-ink px-1 border border-ink/20 rounded-sm">?</span>
                  {type.id === "驚喜包" && isSurprisePackOpen && config.commission.surprisePackReferenceUrl && (
                    <a
                      href={config.commission.surprisePackReferenceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-accent underline hover:text-ink font-mono font-bold ml-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      [ 活動須知 ↗ ]
                    </a>
                  )}
                  {type.id === "驚喜包" && !isSurprisePackOpen && (
                    <span className="text-xs bg-ink text-white px-2 py-0.5 flex items-center gap-1">
                      目前未開放
                      {config.commission.surprisePackReferenceUrl && (
                        <a
                          href={config.commission.surprisePackReferenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:text-accent ml-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          [ 活動須知 ↗ ]
                        </a>
                      )}
                    </span>
                  )}
                  {type.id === "客製化" && !isCustomCommissionOpen && (
                    <span className="text-xs bg-ink text-white px-2 py-0.5">目前未開放</span>
                  )}
                </span>

                {/* Hover Tooltip */}
                {type.description && !isDisabled && (
                  <div className="absolute left-8 top-full mt-1 w-72 p-3 bg-white text-ink border-2 border-ink shadow-[4px_4px_0_0_#0A0A0A] text-sm font-sans font-bold z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-pre-wrap">
                    <div className="font-mono text-xs text-accent mb-1">[ INFO ]</div>
                    {type.description}
                  </div>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* 分支邏輯渲染 */}

      {/* 驚喜包(有開放) 或 客製化(有開放) */}
      {((data.commissionType === "驚喜包" && isSurprisePackOpen) || (data.commissionType === "客製化" && isCustomCommissionOpen)) && (
        <div className="space-y-8 p-6 border-l-4 border-accent bg-white animate-in fade-in slide-in-from-top-4">

          {/* 驚喜包專屬：活動須知橫幅 */}
          {data.commissionType === "驚喜包" && config.commission.surprisePackReferenceUrl && (
            <div className="p-3 bg-paper border-2 border-ink flex items-center justify-between text-xs sm:text-sm font-bold">
              <span className="text-ink">✦ 填單前請先確認本期驚喜包規則與主題：</span>
              <a
                href={config.commission.surprisePackReferenceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-accent underline hover:text-ink font-mono whitespace-nowrap ml-2"
              >
                [ 活動須知 ↗ ]
              </a>
            </div>
          )}

          <div className="space-y-2">
            <label className="block font-sans font-black text-lg text-ink">
              設定資料連結 <span className="text-[#D9453B]">*</span>
            </label>
            <input
              type="url"
              required
              value={data.referenceLink}
              onChange={(e) => handleChange("referenceLink", e.target.value)}
              className="w-full p-3 border-2 border-ink bg-white focus:outline-none focus:border-accent focus:shadow-[4px_4px_0_0_var(--theme-accent)] transition-all font-sans"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-3">
            <label className="block font-sans font-black text-lg text-ink">
              可接受Paro / AU <span className="text-[#D9453B]">*</span>
            </label>
            <p className="text-sm font-bold text-ink-light font-sans mb-2">可能參考既有paro設定或自由發揮，也可能最後還是寫原設</p>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="acceptAu"
                  value="可以"
                  required
                  checked={data.acceptAu === "可以"}
                  onChange={(e) => handleChange("acceptAu", e.target.value)}
                  className="w-5 h-5 accent-accent cursor-pointer"
                />
                <span className="font-sans font-bold group-hover:text-accent transition-colors">可以</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="acceptAu"
                  value="不可以"
                  required
                  checked={data.acceptAu === "不可以"}
                  onChange={(e) => handleChange("acceptAu", e.target.value)}
                  className="w-5 h-5 accent-accent cursor-pointer"
                />
                <span className="font-sans font-bold group-hover:text-accent transition-colors">不可以</span>
              </label>
            </div>
          </div>

          {/* 客製化專屬題組 */}
          {data.commissionType === "客製化" && (
            <>
              {/* 偏好模式 */}
              <div className="space-y-3">
                <label className="block font-sans font-black text-lg text-ink">
                  偏好模式 <span className="text-[#D9453B]">*</span>
                </label>
                <div className="flex flex-col gap-3 mt-2">
                  {[
                    "希望討論文章元素 / 大綱 / 角色互動要求等",
                    "驚喜包 (確認報價後直接給予成品供委託人確認，省略大綱確認流程)"
                  ].map((option) => (
                    <label key={option} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="preferenceMode"
                        value={option}
                        required
                        checked={data.preferenceMode === option}
                        onChange={(e) => handleChange("preferenceMode", e.target.value)}
                        className="w-5 h-5 mt-0.5 accent-accent cursor-pointer shrink-0"
                      />
                      <span className="font-sans font-bold group-hover:text-accent transition-colors leading-relaxed">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 希望篇幅 */}
              <div className="space-y-3">
                <label className="block font-sans font-black text-lg text-ink">
                  希望篇幅 <span className="text-[#D9453B]">*</span>
                </label>
                <div className="flex flex-col gap-3 mt-2">
                  {["1000-2000字", "2001-3000字", "3001-4000字", "4001-5000字", "其他"].map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="wordCount"
                        value={option}
                        required
                        checked={data.wordCount === option}
                        onChange={(e) => handleChange("wordCount", e.target.value)}
                        className="w-5 h-5 accent-accent cursor-pointer shrink-0"
                      />
                      <span className="font-sans font-bold group-hover:text-accent transition-colors">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 回覆頻率 */}
          <div className="space-y-3">
            <label className="block font-sans font-black text-lg text-ink">
              您回覆訊息的頻率 <span className="text-[#D9453B]">*</span>
            </label>
            <div className="flex flex-col gap-3 mt-2">
              {["24小時內", "48小時內", "72小時內"].map((option) => (
                <label key={option} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="responseFrequency"
                    value={option}
                    required
                    checked={data.responseFrequency === option}
                    onChange={(e) => handleChange("responseFrequency", e.target.value)}
                    className="w-5 h-5 accent-accent cursor-pointer shrink-0"
                  />
                  <span className="font-sans font-bold group-hover:text-accent transition-colors">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-sans font-black text-lg text-ink">
              許願區
            </label>
            <p className="text-sm font-bold text-ink-light font-sans mb-2">不保證實現</p>
            <textarea
              rows={3}
              value={data.wishlist}
              onChange={(e) => handleChange("wishlist", e.target.value)}
              className="w-full p-3 border-2 border-ink bg-white focus:outline-none focus:border-accent focus:shadow-[4px_4px_0_0_var(--theme-accent)] transition-all font-sans resize-y"
              placeholder="簡答文字"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-sans font-black text-lg text-ink">
              任何想說的話
            </label>
            <textarea
              rows={4}
              value={data.additionalNotes}
              onChange={(e) => handleChange("additionalNotes", e.target.value)}
              className="w-full p-3 border-2 border-ink bg-white focus:outline-none focus:border-accent focus:shadow-[4px_4px_0_0_var(--theme-accent)] transition-all font-sans resize-y"
              placeholder="詳答文字"
            />
          </div>

        </div>
      )}

      {/* 詢問回報 */}
      {data.commissionType === "詢問" && (
        <div className="space-y-8 p-6 border-l-4 border-ink-light bg-white animate-in fade-in slide-in-from-top-4">
          <div className="space-y-2">
            <label className="block font-sans font-black text-lg text-ink">
              請說
            </label>
            <textarea
              rows={5}
              required
              value={data.otherQuestions}
              onChange={(e) => handleChange("otherQuestions", e.target.value)}
              className="w-full p-3 border-2 border-ink bg-white focus:outline-none focus:border-accent focus:shadow-[4px_4px_0_0_var(--theme-accent)] transition-all font-sans resize-y"
              placeholder="詳答文字"
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-8 flex flex-col items-end gap-4">
        <button
          type="submit"
          disabled={
            status === "SUBMITTING" ||
            (data.commissionType === "驚喜包" && !isSurprisePackOpen) ||
            (data.isAdult === "否" && (data.commissionType === "驚喜包" || data.commissionType === "客製化"))
          }
          className="brutalist-button px-8 py-4 text-xl tracking-widest disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_#0A0A0A] flex items-center gap-3"
        >
          {status === "SUBMITTING" ? (
            <>
              <div className="w-5 h-5 border-4 border-ink border-t-accent rounded-full animate-spin"></div>
              TRANSMITTING...
            </>
          ) : (
            "EXECUTE_SUBMIT"
          )}
        </button>
      </div>

    </form>
  );
}
