/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Schedule from './components/Schedule';
import TravelStay from './components/TravelStay';
import BridalPortal from './components/BridalPortal';
import SaveTheDateSender from './components/SaveTheDateSender';
import AvailabilitySurvey from './components/AvailabilitySurvey';
import RSVP from './components/RSVP';
import OurStory from './components/OurStory';
import FAQ from './components/FAQ';
import Registry from './components/Registry';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import React from 'react';
import { Lock } from 'lucide-react';

function ScrollToHash() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);
  return null;
}

function RedirectToRSVP({ onUnlock }: { onUnlock: () => void }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === '2027') {
      onUnlock();
    } else {
      setError('Incorrect passcode.');
    }
  };

  return (
    <section className="magazine-page justify-center items-center">
      <div className="max-w-lg w-full p-6 sm:p-10 border-2 border-ink bg-white text-center">
        <div className="w-14 h-14 border-2 border-ink flex items-center justify-center text-ink mx-auto mb-6 rounded-full">
          <Lock size={22} />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] font-display font-bold text-[#8A6B2F] mb-2">
          Confirmed Guests
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif text-ink mb-4 uppercase">
          Protected Schedule
        </h1>
        <p className="text-base font-sans text-ink/80 leading-relaxed mb-8">
          To maintain the privacy of our celebration, wedding day schedule details are reserved for confirmed guests. Please RSVP or enter your 4-digit invitation code to view.
        </p>

        <div className="space-y-5">
          <Link
            to="/rsvp"
            className="w-full inline-flex items-center justify-center px-6 py-4 min-h-[48px] bg-burgundy text-white text-sm uppercase font-sans font-semibold tracking-wider hover:bg-ink transition-colors"
          >
            RSVP to Unlock
          </Link>

          <div className="text-xs uppercase font-sans font-semibold tracking-wider text-ink/50">
            or enter invitation code
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              placeholder="4-digit code"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="flex-1 px-4 py-3.5 min-h-[48px] text-base font-sans border border-ink/40 focus:border-burgundy outline-none bg-cream text-center"
            />
            <button
              type="submit"
              className="px-6 py-3.5 min-h-[48px] bg-ink text-white text-sm uppercase font-sans font-semibold tracking-wider hover:bg-burgundy transition-colors"
            >
              Unlock
            </button>
          </form>

          {error && (
            <p className="text-burgundy text-sm font-sans font-semibold">{error}</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [hasRSVPd, setHasRSVPd] = useState(() => {
    return localStorage.getItem('hasRSVPd') === 'true';
  });

  const handleRSVPSuccess = () => {
    setHasRSVPd(true);
    localStorage.setItem('hasRSVPd', 'true');
  };

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-burgundy selection:text-paper font-sans flex flex-col">
      <ScrollToHash />
      <Navbar hasRSVPd={hasRSVPd} />

      <main className="pt-16 md:pt-20 flex-1">
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/story" element={<OurStory />} />
          <Route path="/bridal-party" element={<Navigate to="/" replace />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/rsvp" element={<RSVP onRSVPSuccess={handleRSVPSuccess} />} />
          <Route path="/portal" element={<BridalPortal />} />
          <Route path="/save-the-dates" element={<SaveTheDateSender />} />
          <Route path="/availability" element={<AvailabilitySurvey />} />
          <Route path="/travel" element={<TravelStay />} />
          <Route path="/registry" element={<Registry />} />

          {/* Protected Routes */}
          <Route
            path="/schedule"
            element={hasRSVPd ? <Schedule /> : <RedirectToRSVP onUnlock={handleRSVPSuccess} />}
          />
        </Routes>
      </main>

      <footer className="py-12 sm:py-16 bg-ink text-paper border-t-4 border-gold">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left pb-10 border-b border-paper/15">
            <div>
              <h4 className="text-xs uppercase font-display font-bold tracking-[0.2em] text-gold mb-2">
                Questions &amp; Contact
              </h4>
              <a
                href="mailto:tjagard90@gmail.com"
                className="text-base font-sans text-paper/90 hover:text-gold transition-colors underline underline-offset-4"
              >
                tjagard90@gmail.com
              </a>
            </div>

            <div className="text-center">
              <div className="text-5xl sm:text-6xl font-serif tracking-tight leading-none mb-2">
                J <span className="italic text-gold">&amp;</span> T
              </div>
              <p className="text-xs uppercase font-display font-semibold tracking-[0.25em] text-paper/75">
                The Agard Wedding
              </p>
            </div>

            <div className="md:text-right">
              <h4 className="text-xs uppercase font-display font-bold tracking-[0.2em] text-gold mb-2">
                Wedding Date
              </h4>
              <p className="text-xl font-serif text-paper">September 11, 2027</p>
              <p className="text-sm font-sans text-paper/75">Leesburg, Virginia</p>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm font-sans text-paper/80">
            <p>#CaughtOffAgard · September 2027</p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/travel" className="hover:text-gold transition-colors py-1">
                Travel
              </Link>
              <Link to="/rsvp" className="hover:text-gold transition-colors py-1">
                RSVP
              </Link>
              <Link to="/registry" className="hover:text-gold transition-colors py-1">
                Registry
              </Link>
              <Link to="/faq" className="hover:text-gold transition-colors py-1">
                FAQs
              </Link>
              <Link to="/portal" className="hover:text-gold transition-colors py-1">
                Bridal Portal
              </Link>
              <Link to="/save-the-dates" className="hover:text-gold transition-colors py-1">
                Save the Dates
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
