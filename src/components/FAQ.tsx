import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    question: 'What is the dress code for the celebration?',
    answer:
      'The dress code is Black-Tie or Africana. We warmly invite our guests to celebrate with us in formal evening wear—floor-length gowns, tuxedos, or dark formal suits—or in elegant traditional Africana attire.',
  },
  {
    question: 'Are children invited to the wedding?',
    answer:
      'Due to venue policies and restrictions with our open bar service, our wedding celebration is strictly 21 and over. We appreciate your understanding and look forward to celebrating with you!',
  },
  {
    question: 'What is the formal RSVP deadline?',
    answer:
      'Formal RSVPs are due by August 1, 2027, once formal wedding invitations are sent out. Please note that this is separate from the Save the Date availability check (due January 31, 2027)—your formal RSVP confirms your final attendance and seating arrangements.',
  },
  {
    question: 'Can I bring a plus one?',
    answer:
      'Due to venue capacity restrictions, we are only able to accommodate those specifically named on your invitation. Your RSVP will reflect your confirmed party size.',
  },
  {
    question: 'Where can we send a wedding gift?',
    answer:
      'Your presence is truly the greatest gift. For those who wish to send a contribution via Zelle, you may send to Jenneba (jjalloh90@gmail.com or 240-383-9238) or Troy (301-651-0237). You can also visit our Registry page to easily copy either account.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="magazine-page">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b border-ink/20 pb-8 sm:pb-12 mb-8 sm:mb-12">
          <p className="text-xs uppercase tracking-[0.2em] font-display font-bold text-[#8A6B2F] mb-3">
            Guest Inquiries
          </p>
          <h1 className="text-4xl sm:text-5xl font-serif text-ink uppercase tracking-tight">
            Frequently Asked Questions
          </h1>
        </div>

        {/* Clean Mobile-Friendly Accordion */}
        <div className="border-t-2 border-ink divide-y divide-ink/20 border-b-2 border-b-ink">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.question} className="bg-white">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="w-full py-5 sm:py-7 px-3 sm:px-6 flex items-center justify-between gap-4 text-left hover:bg-cream transition-colors min-h-[60px]"
                >
                  <div className="flex items-baseline gap-3 sm:gap-5">
                    <span className="text-xs sm:text-sm font-display font-bold text-[#8A6B2F] shrink-0 tabular-nums">
                      0{index + 1}
                    </span>
                    <span className="text-lg sm:text-2xl font-serif text-ink leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    size={22}
                    className={`text-burgundy shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-14 pb-6 pt-1">
                        <p className="font-sans text-base sm:text-[17px] text-ink/85 leading-[1.7] bg-cream p-4 sm:p-5 border border-ink/10">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* CTA Footer */}
        <div className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-base text-ink/75">
            Still have a question? Email us at{' '}
            <a href="mailto:tjagard90@gmail.com" className="text-burgundy font-semibold underline">
              tjagard90@gmail.com
            </a>
          </p>
          <Link
            to="/rsvp"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 min-h-[48px] bg-burgundy text-white text-sm font-sans font-semibold uppercase tracking-wider hover:bg-ink transition-colors w-full sm:w-auto"
          >
            <span>RSVP Here</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
