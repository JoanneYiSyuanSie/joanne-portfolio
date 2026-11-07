
import { CommissionForm } from "../../components/CommissionForm";

export function Commission() {


  return (
    <div className="p-0">
      <header className="px-8 py-10 border-b-4 border-ink relative overflow-hidden">
        {/* Dynamic diagonal stripes background */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #0A0A0A 25%, transparent 25%, transparent 75%, #0A0A0A 75%, #0A0A0A), repeating-linear-gradient(45deg, #0A0A0A 25%, #F5F4EE 25%, #F5F4EE 75%, #0A0A0A 75%, #0A0A0A)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }}></div>

        <h1 className="font-mono text-3xl font-black mb-2 tracking-widest relative z-10">
          COLLABORATION_PORTAL <span className="text-accent">+++</span>
        </h1>
        <p className="font-sans text-ink font-bold relative z-10 max-w-xl">
          專案合作 ∕ 技術諮詢 ∕ 職缺洽談。<br />歡迎詳細填寫您的需求規格或交流訊息。
        </p>
      </header>

      <div className="grid lg:grid-cols-2 relative">
        <section className="p-8 border-b-4 lg:border-b-0 lg:border-r-4 border-ink">
          <div className="lg:sticky lg:top-8 space-y-6">
            <div className="inline-block bg-ink text-white font-mono text-xs font-bold px-2 py-1">
              COLLABORATION GUIDELINES
            </div>

            <ul className="space-y-4 font-sans text-sm font-bold text-ink leading-relaxed">
              <li className="flex gap-4">
                <span className="text-accent font-black">{">"}</span>
                <p>聯絡管道：歡迎透過右側表單送出需求，或直接寄信至 <a href="mailto:delphinium0121@gmail.com" className="text-accent underline font-mono">delphinium0121@gmail.com</a> 聯繫。</p>
              </li>
              <li className="flex gap-4">
                <span className="text-accent font-black">{">"}</span>
                <p>專長範疇：搜尋引擎優化（SEO）、內容行銷策略、資訊架構規劃（Taxonomy）、Technical SEO 檢視與跨團隊工程溝通。</p>
              </li>
              <li className="flex gap-4">
                <span className="text-accent font-black">{">"}</span>
                <p>合作模式：積極評估全職行銷職缺（SEO、內容行銷、成長行銷），亦歡迎專案合作或行銷策略交流。</p>
              </li>
              <li className="flex gap-4">
                <span className="text-accent font-black">{">"}</span>
                <p>回覆時程：收到訊息後，通常於 1 至 2 個工作天內回覆，敬請留意您的電子信箱。</p>
              </li>
            </ul>
          </div>
        </section>

        <section className="p-8 bg-paper flex flex-col justify-center min-h-[480px]">
          <CommissionForm />
        </section>
      </div>
    </div>
  );
}
