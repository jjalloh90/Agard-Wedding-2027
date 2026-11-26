import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Person {
  name: string;
  role: string;
  image: string;
  story: string;
}

const bridalParty: Person[] = [
  {
    name: 'Zainab Felder',
    role: 'Maid of Honor',
    image: 'https://picsum.photos/seed/bride1/400/400',
    story:
      "They say first friends are forever, and for us, that's been the truth since day one. Being only 10 months apart, Zainab and I have been inseparable since we were in diapers. From the hallways of elementary school to where we stand today, she has been my confidant, my partner in crime, and my unwavering support system. Zainab and her entire family have been a cornerstone of my life, standing by me through every challenge. I couldn't imagine anyone else by my side on this day.",
  },
  {
    name: 'Florence Kargbo',
    role: 'Bridesmaid',
    image: 'https://picsum.photos/seed/bride2/400/400',
    story:
      "To the world, we are cousins; to our hearts, we are sisters. After being raised together, Florence and I became so indistinguishable that people truly couldn't tell us apart. She has this beautiful way of always making sure I'm okay, always being available to listen, and always standing by my side. I spent my childhood trying to be like her, and I'm spending my wedding day honored to have her right next to me.",
  },
  {
    name: 'Isata Barrie',
    role: 'Bridesmaid',
    image: 'https://picsum.photos/seed/bride3/400/400',
    story:
      "Isata is the little sister I was always meant to have. Our bond truly took root when she was in high school and I was in college, and it has only grown deeper since. From her literally dressing me for my biggest moments to the late-night talks where we were there for each other when no one else was—she is my heart. We fight like sisters and love like sisters, and I couldn't imagine anyone else helping me 'get ready' for the rest of my life.",
  },
  {
    name: 'Isha Barrie',
    role: 'Bridesmaid',
    image: 'https://picsum.photos/seed/bride4/400/400',
    story:
      "Isha and I have always been close in age, but our time in Atlanta made us sisters for life. Known affectionately as 'Frick and Frack,' we did everything together, turning every day into an adventure. Beyond the fun, Isha is a soul who feeds my spirit with constant positivity and encouragement. She is the person who keeps my head high and my heart full, and I'm so honored she's part of my bridal party.",
  },
  {
    name: 'Marissa Griffith',
    role: 'Bridesmaid',
    image: 'https://picsum.photos/seed/bride5/400/400',
    story:
      "They say the best friendships are forged in the moments you need someone most. Marissa and I met through Zainab and instantly clicked, but it was during life's biggest challenges that she truly became my sister. Marissa is the friend who shows up when the world gets heavy—offering unwavering support and a level of loyalty that is rare to find. She has been my anchor through every high and low, and I am so deeply honored to have her strength and heart by my side on this special day.",
  },
  {
    name: 'Brittany Lancaster',
    role: 'Bridesmaid',
    image: 'https://picsum.photos/seed/bride6/400/400',
    story:
      "Brittany is a free soul who instantly felt like family. Over the years, our weekly talks have become one of my favorite rhythms—a time to open up, reflect on life, and speak freely knowing I am in a completely judgment-free zone. She has a way of making the world feel a little lighter and my heart feel a little more understood. I am so honored to have such a supportive and grounding friend standing with me.",
  },
  {
    name: 'Ana Bonner',
    role: 'Bridesmaid',
    image: 'https://picsum.photos/seed/bride7/400/400',
    story:
      "Ana and I found each other in the workplace, but our connection quickly transcended the office. After one deep-dive conversation that lasted until the early morning hours, I knew I had found a sister for life. Ana is someone who consistently empowers me and listens with an open heart. I truly look up to her as a role model; they say imitation is the highest form of flattery, and I aspire to lead with the same heart she does. Having her by my side is a true honor.",
  },
  {
    name: 'Qiana Porter',
    role: 'Bridesmaid',
    image: 'https://picsum.photos/seed/bride8/400/400',
    story:
      "Every bride hopes for a warm welcome into her partner's life, and Kiki made that a reality for me from day one. From the moment we met over oxtails, she embraced me with a sincerity I'll never forget. Kiki has always accepted me as Troy's partner with completely open arms, not just by inviting me into her own celebrations and trips, but by consistently showing up for my family events in return. Her friendship has made me feel truly seen and welcomed long before the wedding day, and I'm honored to have her by my side.",
  },
  {
    name: 'Ashley Agard',
    role: 'Bridesmaid',
    image: 'https://picsum.photos/seed/bride9/400/400',
    story:
      "Ashley, officially gaining you as a sister is one of the highlights of this journey. I've truly enjoyed our time together and seeing the incredible young woman you are becoming. As you step into this next chapter of your life, I want you to know that you'll always have a sister in me—someone to cheer you on, offer a listening ear, and always be in your corner. I'm so happy to have your bright energy by my side as I join the family.",
  },
  {
    name: 'Samantha Agard',
    role: 'Bridesmaid',
    image: 'https://picsum.photos/seed/bride10/400/400',
    story:
      "Samantha, I am so excited to finally call you my sister! It has been such a joy getting to know you, and I've cherished every hangout we've had so far. Watching you grow and being a part of your life is something I don't take for granted. I'm looking forward to a lifetime of more memories, laughter, and sisterhood together. Having you stand with me as I marry your brother makes this day complete.",
  },
  {
    name: 'Trevor Agard',
    role: 'Best Man',
    image: 'https://picsum.photos/seed/groom1/400/400',
    story:
      "Trevor is Troy's brother and his biggest supporter. They've shared everything from childhood toys to life's biggest challenges. Trevor's integrity and strength make him the ideal Best Man.",
  },
  {
    name: 'Brandon Faucett',
    role: 'Groomsman',
    image: 'https://picsum.photos/seed/groom2/400/400',
    story:
      "Brandon and Troy have been friends since their early school days. They've grown up together, sharing a love for sports and competition. Brandon's loyalty is unmatched.",
  },
  {
    name: 'Jeremiah Bowden',
    role: 'Groomsman',
    image: 'https://picsum.photos/seed/groom_jeremiah/400/400',
    story:
      "Jeremiah is a close friend who has been there for Troy through thick and thin. His sense of humor and supportive nature make him an essential part of the groomsmen.",
  },
  {
    name: 'Robin McFarlane',
    role: 'Groomsman',
    image: 'https://picsum.photos/seed/groom3/400/400',
    story:
      "Robin is Troy's long-time friend and partner in crime. Their shared adventures and inside jokes are the foundation of a friendship that has stood the test of time.",
  },
  {
    name: 'Basilio Caruso',
    role: 'Groomsman',
    image: 'https://picsum.photos/seed/groom4/400/400',
    story:
      "Basilio and Troy met through work and quickly realized they shared similar values and goals. Basilio's ambition and drive are qualities Troy respects immensely.",
  },
  {
    name: 'Nehru Attz',
    role: 'Groomsman',
    image: 'https://picsum.photos/seed/groom5/400/400',
    story:
      "Nehru is Troy's cousin and a close friend. Their family bond is strengthened by their shared interests and mutual respect. Nehru's presence adds a special touch to the groomsmen.",
  },
  {
    name: 'Justin Son',
    role: 'Groomsman',
    image: 'https://picsum.photos/seed/groom6/400/400',
    story:
      "Justin and Troy's friendship began on the basketball court. Their shared love for the game translated into a deep and lasting friendship off the court as well.",
  },
  {
    name: 'Issa Legall',
    role: 'Groomsman',
    image: 'https://picsum.photos/seed/groom7/400/400',
    story:
      "Issa is a true friend who has always been there for Troy. His relaxed and easy-going nature makes him a joy to be around. Troy is grateful for his steady friendship.",
  },
  {
    name: 'Hamza Kargbo',
    role: 'Groomsman',
    image: 'https://picsum.photos/seed/groom8/400/400',
    story:
      "Hamza is Jenneba's brother and Troy is honored to have him as a groomsman. Their friendship has grown over the years, and Troy looks forward to officially becoming brothers.",
  },
  {
    name: 'Abdul-Hakeem Kargbo',
    role: 'Groomsman',
    image: 'https://picsum.photos/seed/groom9/400/400',
    story:
      "Abdul-Hakeem is also Jenneba's brother. His kind spirit and thoughtful nature are qualities Troy admires. Having both of Jenneba's brothers in the wedding means the world to the couple.",
  },
];

function getInitials(name: string) {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

export default function BridalParty() {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  return (
    <section id="bridal-party" className="magazine-page">
      <div className="w-full">
        {/* Header */}
        <div className="border-b border-ink/20 pb-8 sm:pb-12 mb-8 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-display font-bold text-[#8A6B2F] mb-3">
              The Wedding Party
            </p>
            <h1 className="text-4xl sm:text-5xl font-serif text-ink uppercase tracking-tight">
              Meet the Party
            </h1>
          </div>
          <p className="font-sans text-base sm:text-lg text-ink/75 max-w-md leading-relaxed">
            Tap anyone below to read their story and why they mean so much to us.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {bridalParty.map((person) => {
            const isBroken = brokenImages[person.name];
            return (
              <button
                key={person.name}
                type="button"
                onClick={() => setSelectedPerson(person)}
                className="text-left flex flex-col group bg-white border border-ink/15 hover:border-burgundy transition-colors p-2.5 sm:p-3 focus-visible:outline-2 focus-visible:outline-burgundy"
              >
                <div className="relative overflow-hidden aspect-[3/4] w-full mb-3 bg-cream">
                  {isBroken ? (
                    <div className="w-full h-full flex items-center justify-center bg-burgundy text-gold font-serif text-3xl">
                      {getInitials(person.name)}
                    </div>
                  ) : (
                    <img
                      src={person.image}
                      alt={person.name}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setBrokenImages((prev) => ({ ...prev, [person.name]: true }))
                      }
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-serif text-ink group-hover:text-burgundy transition-colors leading-snug">
                  {person.name}
                </h2>
                <p className="text-xs sm:text-sm font-sans text-ink/65 mt-0.5">
                  {person.role}
                </p>
              </button>
            );
          })}
        </div>

        {/* CTA Footer */}
        <div className="mt-14 pt-10 border-t border-ink/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-base text-ink/80">
            Ready to let us know if you can make it?
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

      {/* Story Modal */}
      <AnimatePresence>
        {selectedPerson && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPerson(null)}
              className="absolute inset-0 bg-ink/80 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="relative w-full max-w-3xl bg-white border-2 border-ink shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[88vh]"
            >
              <button
                type="button"
                onClick={() => setSelectedPerson(null)}
                aria-label="Close profile"
                className="absolute top-3 right-3 z-30 bg-white border border-ink text-ink hover:bg-cream min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X size={20} />
              </button>

              <div className="w-full md:w-2/5 h-56 md:h-auto shrink-0 bg-cream">
                {brokenImages[selectedPerson.name] ? (
                  <div className="w-full h-full flex items-center justify-center bg-burgundy text-gold font-serif text-5xl">
                    {getInitials(selectedPerson.name)}
                  </div>
                ) : (
                  <img
                    src={selectedPerson.image}
                    alt={selectedPerson.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover grayscale"
                  />
                )}
              </div>

              <div className="w-full md:w-3/5 p-6 sm:p-8 overflow-y-auto">
                <p className="text-xs uppercase tracking-[0.2em] font-display font-bold text-[#8A6B2F] mb-1">
                  {selectedPerson.role}
                </p>
                <h3 className="text-2xl sm:text-3xl font-serif text-ink mb-4">
                  {selectedPerson.name}
                </h3>
                <p className="font-sans text-base sm:text-[17px] leading-[1.7] text-ink/90">
                  {selectedPerson.story}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
