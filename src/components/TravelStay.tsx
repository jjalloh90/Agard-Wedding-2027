import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const recommendedHotels = [
  'Holiday Inn Express & Suites Leesburg',
  'Home2Suites Hilton Leesburg',
  'SpringHill Suites Ashburn Dulles North',
  'Tru by Hilton Ashburn One Loudoun',
  'Homewood Suites by Hilton Dulles North/Loudoun',
  'Embassy Suites by Dulles North Loudoun',
];

export default function TravelStay() {
  return (
    <section id="travel" className="magazine-page">
      <div className="w-full">
        {/* Header */}
        <div className="border-b border-ink/20 pb-8 sm:pb-12 mb-8 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-display font-bold text-[#8A6B2F] mb-3">
              Guest Information
            </p>
            <h1 className="text-4xl sm:text-5xl font-serif text-ink uppercase tracking-tight">
              Travel Information
            </h1>
          </div>
          <p className="font-sans text-base sm:text-lg text-ink/80 max-w-xl leading-relaxed">
            Below you will find nearby airport details and hotel options to help you plan your trip to Leesburg for our wedding weekend.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {/* 01 Arrivals - Cream */}
          <div className="p-6 sm:p-10 border-2 border-ink bg-cream flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-12">
            <div className="md:w-1/3">
              <span className="text-4xl sm:text-5xl font-serif text-[#8A6B2F] block mb-1 tabular-nums">
                01
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif uppercase tracking-tight text-ink">
                Arrivals
              </h2>
              <div className="w-12 h-0.5 bg-[#8A6B2F] mt-3" />
            </div>

            <div className="md:w-2/3">
              <p className="font-sans text-base sm:text-lg leading-[1.65] text-ink/90">
                Fly into <strong className="font-bold text-ink">Dulles International Airport (IAD)</strong>, situated roughly <strong className="font-bold text-ink">35 minutes</strong> from Leesburg. We recommend <strong className="font-bold text-ink">renting a car or using ride-share services</strong> for ease of travel throughout the weekend.
              </p>
              <div className="mt-5 pt-4 border-t border-ink/15 flex flex-wrap items-center gap-3 text-ink/75 text-xs sm:text-sm uppercase tracking-wider font-sans font-semibold">
                <span>Airport: Dulles (IAD)</span>
                <span aria-hidden="true">·</span>
                <span>Drive Time: ~35 mins</span>
              </div>
            </div>
          </div>

          {/* 02 Hotel Options - Burgundy */}
          <div className="p-6 sm:p-10 border-2 border-ink bg-burgundy text-white flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-12">
            <div className="md:w-1/3">
              <span className="text-4xl sm:text-5xl font-serif text-gold block mb-1 tabular-nums">
                02
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif uppercase tracking-tight text-white">
                Hotel Options
              </h2>
              <div className="w-12 h-0.5 bg-gold mt-3" />
            </div>

            <div className="md:w-2/3">
              <p className="font-sans text-base sm:text-lg leading-[1.65] text-white/95 mb-6">
                For your comfort and convenience, we have put together a{' '}
                <strong className="font-bold text-gold">recommended list of nearby hotels</strong> in the Leesburg and Ashburn area where guests can stay:
              </p>

              <div className="mb-6">
                <h3 className="text-xs uppercase tracking-[0.2em] font-display font-bold text-gold mb-3">
                  Recommended Hotel List
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans text-base leading-snug">
                  {recommendedHotels.map((hotel) => (
                    <li
                      key={hotel}
                      className="flex items-start gap-2.5 bg-white/10 border border-white/20 px-4 py-3 text-white font-semibold"
                    >
                      <span className="text-gold font-bold" aria-hidden="true">
                        •
                      </span>
                      <span>{hotel}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-white/20 flex flex-wrap items-center gap-3 text-white/85 text-xs sm:text-sm tracking-wider uppercase font-sans font-semibold">
                <span>Leesburg &amp; Ashburn Area</span>
                <span aria-hidden="true">·</span>
                <span>Book Direct at Your Preferred Stay</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Section Link */}
        <div className="mt-12 pt-8 border-t border-ink/15 flex justify-end">
          <Link
            to="/faq"
            className="inline-flex items-center gap-3 px-6 py-3.5 min-h-[48px] border border-ink bg-white hover:bg-cream text-ink font-sans font-semibold text-sm uppercase tracking-wider transition-colors"
          >
            <span>Next: FAQs</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
