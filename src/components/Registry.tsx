import { useState } from 'react';
import { Gift, Copy, Check, Mail, Phone, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type CopyKey = 'jenneba-email' | 'jenneba-phone' | 'troy-phone';

export default function Registry() {
  const [copiedKey, setCopiedKey] = useState<CopyKey | null>(null);

  const handleCopy = (key: CopyKey, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((current) => (current === key ? null : current));
    }, 2000);
  };

  return (
    <section id="registry" className="magazine-page">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b border-ink/20 pb-8 sm:pb-12 mb-8 sm:mb-12">
          <p className="text-xs uppercase tracking-[0.2em] font-display font-bold text-[#8A6B2F] mb-3">
            Gifts &amp; Wishes
          </p>
          <h1 className="text-4xl sm:text-5xl font-serif text-ink uppercase tracking-tight mb-4">
            Registry &amp; Zelle
          </h1>
          <p className="font-sans text-base sm:text-lg text-ink/80 leading-relaxed max-w-2xl">
            Your presence at our celebration in Leesburg is the greatest gift we could ask for. For family and friends who have asked how to bless our next chapter together, contributions may be sent directly via Zelle to either of our accounts below.
          </p>
        </div>

        {/* Zelle Account Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Jenneba's Zelle */}
          <div className="border-2 border-ink bg-cream p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 pb-4 mb-6 border-b border-ink/15">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] font-display font-bold text-[#8A6B2F] mb-1">
                    Zelle Account
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-serif text-ink">Jenneba</h2>
                </div>
                <div className="w-11 h-11 border border-ink/25 bg-white flex items-center justify-center text-burgundy shrink-0">
                  <Gift size={20} />
                </div>
              </div>

              <div className="space-y-4">
                {/* Email */}
                <div className="bg-white border border-ink/20 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-sans font-semibold text-ink/60 mb-1.5">
                    <Mail size={14} className="text-burgundy shrink-0" />
                    <span>Zelle Email</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-base sm:text-lg font-sans font-semibold text-ink break-all">
                      jjalloh90@gmail.com
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('jenneba-email', 'jjalloh90@gmail.com')}
                      aria-label="Copy Jenneba's Zelle email"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] border border-ink bg-cream text-ink text-xs uppercase font-sans font-semibold tracking-wider hover:bg-burgundy hover:text-white hover:border-burgundy transition-colors shrink-0 cursor-pointer"
                    >
                      {copiedKey === 'jenneba-email' ? (
                        <>
                          <Check size={14} />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Phone */}
                <div className="bg-white border border-ink/20 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-sans font-semibold text-ink/60 mb-1.5">
                    <Phone size={14} className="text-burgundy shrink-0" />
                    <span>Or Zelle Phone</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-base sm:text-lg font-sans font-semibold text-ink tabular-nums">
                      240-383-9238
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('jenneba-phone', '240-383-9238')}
                      aria-label="Copy Jenneba's Zelle phone number"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] border border-ink bg-cream text-ink text-xs uppercase font-sans font-semibold tracking-wider hover:bg-burgundy hover:text-white hover:border-burgundy transition-colors shrink-0 cursor-pointer"
                    >
                      {copiedKey === 'jenneba-phone' ? (
                        <>
                          <Check size={14} />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Troy's Zelle */}
          <div className="border-2 border-ink bg-white p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 pb-4 mb-6 border-b border-ink/15">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] font-display font-bold text-[#8A6B2F] mb-1">
                    Zelle Account
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-serif text-ink">Troy</h2>
                </div>
                <div className="w-11 h-11 border border-ink/25 bg-cream flex items-center justify-center text-burgundy shrink-0">
                  <Gift size={20} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-cream border border-ink/20 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-sans font-semibold text-ink/60 mb-1.5">
                    <Phone size={14} className="text-burgundy shrink-0" />
                    <span>Zelle Phone</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-base sm:text-lg font-sans font-semibold text-ink tabular-nums">
                      301-651-0237
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('troy-phone', '301-651-0237')}
                      aria-label="Copy Troy's Zelle phone number"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] border border-ink bg-white text-ink text-xs uppercase font-sans font-semibold tracking-wider hover:bg-burgundy hover:text-white hover:border-burgundy transition-colors shrink-0 cursor-pointer"
                    >
                      {copiedKey === 'troy-phone' ? (
                        <>
                          <Check size={14} />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="font-sans text-sm text-ink/70 leading-relaxed pt-1">
                  Please include your name in the Zelle memo line so we can send you a proper thank-you note after the celebration.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Helpful Note */}
        <div className="border border-ink/20 bg-cream p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-display font-bold text-[#8A6B2F] mb-1.5">
              With Gratitude
            </p>
            <p className="font-sans text-base text-ink/85 leading-relaxed">
              Thank you for celebrating our love story with us. We cannot wait to dance the night away with you on September 11, 2027.
            </p>
          </div>
          <Link
            to="/rsvp"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 min-h-[48px] bg-burgundy text-white text-sm font-sans font-semibold uppercase tracking-wider hover:bg-ink transition-colors shrink-0"
          >
            <span>RSVP Here</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
