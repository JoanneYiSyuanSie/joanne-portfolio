
import { getSiteConfig } from "../../lib/content";

export function About() {
  const config = getSiteConfig();

  return (
    <div className="p-0">
      <header className="px-8 py-10 bg-[#FFFDF9] border-b-4 border-ink relative overflow-hidden">
        {/* Background Decorative */}
        <div className="absolute -right-10 -top-10 text-[15rem] font-serif font-black text-ink opacity-5 select-none leading-none">
          J
        </div>

        <h2 className="font-mono text-3xl font-black mb-2 tracking-widest relative z-10 text-ink">
          MARKETER_PROFILE <span className="text-accent">___</span>
        </h2>
        <p className="font-sans font-bold opacity-80 max-w-xl text-ink relative z-10">
          關於 Joanne。
        </p>
      </header>

      <div className="grid md:grid-cols-12">
        {/* Logo Section */}
        <section className="p-8 md:col-span-5 lg:col-span-4 border-b-4 md:border-b-0 md:border-r-4 border-ink bg-paper flex flex-col items-center justify-center">
          <div className="relative group w-48 h-48 sm:w-64 sm:h-64 mb-8">
            <div className="absolute inset-0 bg-ink transform translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-300"></div>
            <div className="absolute inset-0 bg-white border-4 border-ink p-4 group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform duration-300 flex items-center justify-center overflow-hidden">
              <img
                src={`${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/joanne-logo.svg`}
                alt={`${config.author} Monogram`}
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
          
          <h1 className="font-serif text-4xl font-black text-ink">{config.author}</h1>
          <div className="font-mono text-xs font-bold text-ink bg-white border-2 border-ink px-2 py-1 mt-4 shadow-[2px_2px_0_0_#0A0A0A] relative z-10">
            CONTENT STRATEGY / SEO
          </div>
        </section>

        {/* Bio & Links Section */}
        <section className="md:col-span-7 lg:col-span-8 flex flex-col">

          {/* Bio */}
          <div className="p-8 lg:p-12 border-b-4 border-ink">
            <div className="font-mono text-xs font-bold text-accent mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-accent inline-block"></span>
              BIOGRAPHY
            </div>
            <p className="font-sans text-lg font-bold text-ink leading-relaxed max-w-2xl whitespace-pre-line">
              {config.authorBio}
            </p>
          </div>

          <div className="grid sm:grid-cols-2">
            {/* Social Links */}
            <div className="p-8 lg:p-12 border-b-4 sm:border-b-0 sm:border-r-4 border-ink bg-ink text-white">
              <div className="font-mono text-xs font-bold text-white/50 mb-6 border-b border-white/20 pb-2">
                SOCIAL_CONNECTIONS
              </div>
              <ul className="space-y-4">
                {config.social && config.social.length > 0 ? (
                  config.social.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono font-bold text-lg hover:text-accent transition-colors flex items-center gap-2 group"
                      >
                        <span className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">►</span>
                        {link.name}
                      </a>
                    </li>
                  ))
                ) : (
                  <li className="font-mono text-sm text-white/50 italic">尚未設定社群連結</li>
                )}
              </ul>
            </div>

            {/* Friend Links */}
            <div className="p-8 lg:p-12 bg-black text-white">
              <div className="font-mono text-xs font-bold text-white/50 mb-6 border-b border-white/20 pb-2">
                FRIEND_NETWORK
              </div>
              <ul className="space-y-4">
                {config.friendLinks && config.friendLinks.length > 0 ? (
                  config.friendLinks.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-sans font-bold text-lg hover:text-accent transition-colors underline decoration-2 underline-offset-4"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))
                ) : (
                  <li className="font-mono text-sm text-white/50 italic">尚未設定友站連結</li>
                )}
              </ul>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}
