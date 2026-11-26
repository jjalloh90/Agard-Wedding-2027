import Countdown from './Countdown';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const quickSections = [
  {
    title: 'Travel & Hotels',
    description: 'Airport details and nearby hotel options in Leesburg & Ashburn.',
    to: '/travel',
  },
  {
    title: 'Our Story',
    description: 'How we met in 2008 and reconnected fifteen years later.',
    to: '/story',
  },
  {
    title: 'Schedule',
    description: 'Wedding day ceremony, cocktail hour, and reception times.',
    to: '/schedule',
  },
  {
    title: 'FAQs',
    description: 'Dress code, adult-only celebration notes, and RSVP details.',
    to: '/faq',
  },
  {
    title: 'Registry & Zelle',
    description: 'Gift details and Zelle accounts for Jenneba and Troy.',
    to: '/registry',
  },
];

export default function Hero() {
  return (
    <section className="magazine-page justify-center">
      <div className="w-full max-w-4xl mx-auto py-4 sm:py-8">
        {/* Main Editorial Hero Card */}
        <div className="text-center border-b border-ink/15 pb-10 sm:pb-14 mb-10 sm:mb-14">
          <p className="text-xs sm:text-sm uppercase tracking-[0.25em] font-display font-semibold text-burgundy mb-4">
            We Are Getting Married
          </p>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif text-ink uppercase tracking-tight mb-5">
            Jenneba &amp; Troy
          </h1>
          <p className="text-base sm:text-xl font-sans font-medium text-ink/85 mb-8">
            Saturday, September 11, 2027 <span aria-hidden="true" className="mx-2 text-[#8A6B2F]">•</span> Leesburg, Virginia
          </p>

          <div className="max-w-xl mx-auto mb-8 sm:mb-10">
            <Countdown />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
            <Link
              to="/rsvp"
              className="inline-flex items-center justify-center px-8 py-4 min-h-[48px] bg-burgundy text-white text-sm sm:text-base font-sans font-semibold uppercase tracking-wider hover:bg-ink transition-colors"
            >
              RSVP Here
            </Link>
            <Link
              to="/travel"
              className="inline-flex items-center justify-center px-8 py-4 min-h-[48px] bg-white border-2 border-ink text-ink text-sm sm:text-base font-sans font-semibold uppercase tracking-wider hover:bg-cream transition-colors"
            >
              Travel &amp; Hotels
            </Link>
          </div>
        </div>

        {/* Clean Mobile-First Quick Guide */}
        <div>
          <h2 className="text-xs uppercase tracking-[0.2em] font-display font-bold text-ink/60 mb-4 text-center sm:text-left">
            Wedding Weekend Guide
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickSections.map((item, idx) => {
              const isLastOdd = quickSections.length % 2 === 1 && idx === quickSections.length - 1;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`group p-6 bg-cream border border-ink/15 hover:border-burgundy transition-colors flex items-center justify-between gap-4 min-h-[88px] ${
                    isLastOdd ? 'sm:col-span-2' : ''
                  }`}
                >
                  <div>
                    <h3 className="text-xl font-serif text-ink group-hover:text-burgundy transition-colors mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base font-sans text-ink/75 leading-snug">
                      {item.description}
                    </p>
                  </div>
                  <ArrowRight size={20} className="text-burgundy shrink-0 group-hover:translate-x-1 transition-transform" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
