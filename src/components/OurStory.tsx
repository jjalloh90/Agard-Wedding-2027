import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function OurStory() {
  return (
    <section id="story" className="magazine-page">
      <div className="w-full">
        {/* Header */}
        <div className="border-b border-ink/20 pb-8 sm:pb-12 mb-8 sm:mb-12">
          <p className="text-xs uppercase tracking-[0.2em] font-display font-bold text-[#8A6B2F] mb-3">
            Our Story
          </p>
          <h1 className="text-4xl sm:text-5xl font-serif text-ink uppercase tracking-tight mb-4">
            The Evolution of Us
          </h1>
          <p className="font-sans text-base sm:text-lg text-ink/75 max-w-2xl leading-relaxed">
            From a high school spark in 2008 to a lifetime commitment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Black & White Photo */}
          <div className="lg:col-span-6">
            <div className="overflow-hidden border-2 border-ink bg-cream">
              <img
                src="/assets/aistudio/IMG_1275_65dd73c8.jpeg"
                alt="Troy & Jenneba holding hands"
                className="w-full h-auto aspect-[4/5] sm:aspect-[4/3] object-cover grayscale contrast-105 block"
              />
            </div>
          </div>

          {/* Readable Upright Story Text */}
          <div className="lg:col-span-6 space-y-6 font-sans text-base sm:text-lg text-ink/90 leading-[1.75]">
            <p className="first-letter:text-5xl first-letter:font-serif first-letter:text-ink first-letter:float-left first-letter:mr-3 first-letter:leading-none first-letter:mt-1">
              Troy and Jenneba first crossed paths in May 2008 at Troy&apos;s high school prom. While there was an immediate spark, the timing wasn&apos;t quite right for their story to begin. Fast forward fifteen years to December 2023, when Jenneba reached out just to check in.
            </p>
            <p>
              Troy mentioned he had moved to Florida, and Jenneba playfully replied, &ldquo;That&apos;s great! Let me know the next time you&apos;re in town.&rdquo; As fate would have it, Troy was actually in town at that very moment.
            </p>
            <p>
              They met up, rediscovered that old connection, and have been inseparable ever since. It&apos;s a testament to the fact that love has its own timeline, often defying expectations and logical progression.
            </p>

            <div className="pt-6 border-t border-ink/15">
              <p className="text-xl sm:text-2xl font-serif italic text-burgundy">
                &ldquo;Love has its own timeline.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Next Section Link */}
        <div className="mt-12 pt-8 border-t border-ink/15 flex justify-end">
          <Link
            to="/travel"
            className="inline-flex items-center gap-3 px-6 py-3.5 min-h-[48px] border border-ink bg-white hover:bg-cream text-ink font-sans font-semibold text-sm uppercase tracking-wider transition-colors"
          >
            <span>Next: Travel &amp; Hotels</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
