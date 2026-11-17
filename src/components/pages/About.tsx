import { getSiteConfig } from "../../lib/content";

export function About() {
  const config = getSiteConfig();

  return (
    <div className="p-0 min-h-full flex flex-col">
      <header className="px-8 py-10 border-b border-black/15">
        <h2 className="font-sans text-4xl font-extrabold tracking-tight mb-2 text-ink">
          關於
        </h2>
        <p className="font-sans text-ink-light max-w-xl">
          關於 Joanne。
        </p>
      </header>

      <div className="grid md:grid-cols-12 flex-1">
        {/* Logo Section */}
        <section className="p-8 md:col-span-5 lg:col-span-4 border-b md:border-b-0 md:border-r border-black/15 flex flex-col items-center justify-center">
          <div className="w-48 h-48 sm:w-64 sm:h-64 mb-8">
            <img
              src={`${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/joanne-logo.svg`}
              alt={`${config.author} Monogram`}
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="font-sans text-4xl font-extrabold tracking-tight text-ink">{config.author}</h1>
          <div className="font-mono text-xs text-ink-light mt-4">
            CONTENT STRATEGY / SEO
          </div>
        </section>

        {/* Bio & Links Section */}
        <section className="md:col-span-7 lg:col-span-8 flex flex-col">

          {/* Bio */}
          <div className="p-8 lg:p-12 border-b border-black/15">
            <div className="font-mono text-xs text-ink-light mb-6">
              BIOGRAPHY
            </div>
            <p className="font-sans text-lg text-ink leading-relaxed max-w-2xl whitespace-pre-line">
              {config.authorBio}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 flex-1">
            {/* Social Links */}
            <div className="p-8 lg:p-12 border-b sm:border-b-0 sm:border-r border-black/15">
              <div className="font-mono text-xs text-ink-light mb-6 border-b border-black/15 pb-2">
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
                        className="font-sans font-bold text-lg hover:text-accent transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))
                ) : (
                  <li className="font-sans text-sm text-ink-light">尚未設定社群連結</li>
                )}
              </ul>
            </div>

            {/* Friend Links */}
            <div className="p-8 lg:p-12">
              <div className="font-mono text-xs text-ink-light mb-6 border-b border-black/15 pb-2">
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
                        className="font-sans font-bold text-lg hover:text-accent transition-colors underline decoration-1 underline-offset-4"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))
                ) : (
                  <li className="font-sans text-sm text-ink-light">尚未設定友站連結</li>
                )}
              </ul>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}
