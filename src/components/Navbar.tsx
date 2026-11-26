import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ hasRSVPd: _hasRSVPd }: { hasRSVPd: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Travel', href: '/travel' },
    { name: 'Our Story', href: '/story' },
    { name: 'Schedule', href: '/schedule' },
    { name: 'Registry', href: '/registry' },
    { name: 'FAQs', href: '/faq' },
    { name: 'Bridal Portal', href: '/portal' },
    { name: 'RSVP', href: '/rsvp' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[100] transition-shadow duration-300 bg-white/95 backdrop-blur-sm border-b border-ink/15 ${
        scrolled ? 'shadow-sm' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-16 md:h-20 gap-6">
          {/* Brand Wordmark */}
          <Link
            to="/"
            className="text-2xl sm:text-3xl font-serif text-ink tracking-tight uppercase font-semibold whitespace-nowrap shrink-0"
          >
            Jenneba &amp; Troy
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
            {navLinks
              .filter((link) => link.name !== 'RSVP')
              .map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`text-sm font-sans font-medium tracking-wide whitespace-nowrap shrink-0 transition-colors relative py-1 ${
                      isActive ? 'text-burgundy font-semibold' : 'text-ink/75 hover:text-ink'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-burgundy" />
                    )}
                  </Link>
                );
              })}
          </nav>

          {/* Desktop Primary CTA */}
          <div className="hidden lg:flex items-center shrink-0">
            <Link
              to="/rsvp"
              className="bg-burgundy text-white px-5 py-2.5 text-sm font-sans font-semibold tracking-wide hover:bg-ink transition-colors whitespace-nowrap shrink-0"
            >
              RSVP Here
            </Link>
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center gap-2.5 shrink-0">
            <Link
              to="/rsvp"
              className="bg-burgundy text-white px-3.5 py-2 text-xs font-sans font-semibold uppercase tracking-wider whitespace-nowrap shrink-0 min-h-[40px] flex items-center"
            >
              RSVP
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="text-ink flex items-center justify-center gap-1.5 px-3 min-h-[40px] min-w-[44px] border border-ink/30 bg-white hover:bg-cream transition-colors"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
              <span className="text-xs font-sans font-semibold uppercase tracking-wider">
                {isOpen ? 'Close' : 'Menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden bg-white border-b border-ink/20 shadow-lg"
          >
            <div className="px-4 py-4 divide-y divide-ink/10 max-h-[80vh] overflow-y-auto">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between min-h-[48px] px-3 py-3 text-base font-sans transition-colors ${
                      link.name === 'RSVP'
                        ? 'bg-burgundy text-white font-semibold mt-2 justify-center'
                        : isActive
                        ? 'text-burgundy font-semibold bg-cream'
                        : 'text-ink hover:bg-cream'
                    }`}
                  >
                    <span>{link.name === 'RSVP' ? 'RSVP Here' : link.name}</span>
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
