import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const events = [
  {
    time: '3:30 PM',
    title: 'The Ceremony',
    location: 'The Garden',
    description: 'Join us as we exchange vows in a private garden setting.',
  },
  {
    time: '4:30 PM',
    title: 'Cocktail Hour',
    location: 'The Veranda',
    description: "Enjoy signature drinks and hors d'oeuvres with a view.",
  },
  {
    time: '6:00 PM',
    title: 'Dinner & Reception',
    location: 'The Grand Ballroom',
    description: 'A night of dining, dancing, and celebration.',
  },
  {
    time: '11:00 PM',
    title: 'Sparkler Send-off',
    location: 'Main Entrance',
    description: 'Help us celebrate our first night as a married couple.',
  },
];

export default function Schedule() {
  return (
    <section id="schedule" className="magazine-page">
      <div className="w-full">
        {/* Header */}
        <div className="border-b border-ink/20 pb-8 sm:pb-12 mb-8 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-display font-bold text-[#8A6B2F] mb-3">
              Program of Events
            </p>
            <h1 className="text-4xl sm:text-5xl font-serif text-ink uppercase tracking-tight">
              Wedding Schedule
            </h1>
          </div>
          <p className="font-sans text-base sm:text-lg font-semibold text-burgundy">
            Saturday, September 11, 2027
          </p>
        </div>

        {/* Clean Stacked Timeline Cards */}
        <div className="space-y-4 sm:space-y-6">
          {events.map((event) => (
            <div
              key={event.title}
              className="p-6 sm:p-8 bg-cream border-2 border-ink flex flex-col md:flex-row md:items-center gap-4 md:gap-10"
            >
              <div className="md:w-1/3">
                <div className="text-3xl sm:text-4xl font-serif text-ink tabular-nums">
                  {event.time}
                </div>
                <h2 className="text-lg sm:text-xl font-sans font-bold uppercase tracking-wide text-burgundy mt-1">
                  {event.title}
                </h2>
              </div>

              <div className="md:w-2/3 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-ink/15 md:pl-10">
                <div className="flex items-center gap-2 text-sm font-sans font-semibold text-ink/75 mb-2">
                  <MapPin size={16} className="text-burgundy shrink-0" />
                  <span>{event.location}</span>
                </div>
                <p className="font-sans text-base sm:text-lg text-ink/90 leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Next Section Link */}
        <div className="mt-12 pt-8 border-t border-ink/15 flex justify-end">
          <Link
            to="/travel"
            className="inline-flex items-center gap-3 px-6 py-3.5 min-h-[48px] border border-ink bg-white hover:bg-cream text-ink font-sans font-semibold text-sm uppercase tracking-wider transition-colors"
          >
            <span>Travel &amp; Hotels</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
