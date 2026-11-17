
import { CommissionForm } from "../../components/CommissionForm";

export function Commission() {


  return (
    <div className="p-0">
      <header className="px-8 py-10 border-b border-black/15">
        <h1 className="font-serif text-4xl font-semibold mb-2">
          聯絡
        </h1>
        <p className="font-sans text-ink-light max-w-xl">
          專案合作 ∕ 技術諮詢 ∕ 職缺洽談。
        </p>
      </header>

      <div className="grid lg:grid-cols-2 relative">
        <section className="p-8 border-b lg:border-b-0 lg:border-r border-black/15">
          <div className="lg:sticky lg:top-8 space-y-6">
            <div className="font-sans text-xs tracking-[0.2em] text-ink-light">
              合作說明
            </div>

            <ul className="space-y-4 font-sans text-sm text-ink leading-relaxed">
              <li className="flex gap-4">
                <span className="text-accent">—</span>
                <p>聯絡管道：歡迎透過右側表單送出需求，或直接寄信至 <a href="mailto:delphinium0121@gmail.com" className="text-accent underline">delphinium0121@gmail.com</a> 聯繫。</p>
              </li>
              <li className="flex gap-4">
                <span className="text-accent">—</span>
                <p>合作模式：積極評估全職行銷職缺（SEO、內容行銷、成長行銷），亦歡迎專案合作或行銷策略交流。</p>
              </li>
              <li className="flex gap-4">
                <span className="text-accent">—</span>
                <p>回覆時程：收到訊息後，通常於 1 至 2 個工作天內回覆，敬請留意您的電子信箱。</p>
              </li>
            </ul>
          </div>
        </section>

        <section className="p-8 flex flex-col justify-center min-h-[480px]">
          <div className="max-w-xl mx-auto w-full mb-6 border-y border-black/15 py-4">
            <div className="font-sans text-xs font-bold tracking-[0.2em] text-ink-light mb-2">
              功能示範
            </div>
            <p className="font-sans text-sm text-ink leading-relaxed">
              這個表單只是功能示範，送出後不會真的寄出。如需聯繫，請直接寄信至 <a href="mailto:delphinium0121@gmail.com" className="text-accent underline">delphinium0121@gmail.com</a>。
            </p>
          </div>
          <CommissionForm />
        </section>
      </div>
    </div>
  );
}
