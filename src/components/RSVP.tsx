import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Lock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RSVP_PASSCODE } from '../constants/guests';

export default function RSVP({ onRSVPSuccess }: { onRSVPSuccess: () => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [rsvpData, setRsvpData] = useState({
    email: '',
    attending: 'yes',
    guests: 1,
    dietary: '',
    songRequest: '',
    note: '',
  });

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() !== RSVP_PASSCODE) {
      setError('Incorrect passcode. Please check your invitation for the 4-digit code.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          ...rsvpData,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit RSVP');

      if (rsvpData.attending === 'yes') {
        onRSVPSuccess();
      }
      setStep(3);
    } catch {
      setError('Something went wrong submitting your RSVP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="rsvp" className="magazine-page">
      <div className="w-full max-w-3xl mx-auto">
        {/* Header */}
        <div className="border-b border-ink/20 pb-8 mb-8 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] font-display font-bold text-[#8A6B2F]">
            Formal RSVP · Kindly Respond by August 1, 2027
          </p>
          <h1 className="text-4xl sm:text-5xl font-serif text-ink uppercase tracking-tight">
            Formal RSVP
          </h1>
          <p className="font-sans text-base text-ink/80 leading-relaxed max-w-2xl">
            Formal RSVPs open once wedding invitations are sent out and are due by{' '}
            <strong className="font-semibold text-ink">August 1, 2027</strong>. Replying to your Save the Date instead?{' '}
            <Link
              to="/availability"
              className="text-burgundy font-semibold underline underline-offset-4 hover:text-ink transition-colors"
            >
              Submit your early availability check here
            </Link>
            .
          </p>
        </div>

        <div className="bg-white border-2 border-ink">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="auth"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 sm:p-10"
              >
                <div className="flex items-center gap-4 pb-6 mb-6 border-b border-ink/15">
                  <div className="w-12 h-12 bg-burgundy text-white flex items-center justify-center shrink-0">
                    <Lock size={22} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif text-ink">Formal Invitation Verification</h2>
                    <p className="text-sm font-sans text-ink/70">
                      Enter your full name and the 4-digit passcode included on your formal wedding invitation.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                  <div>
                    <label htmlFor="rsvp-name" className="block text-sm font-sans font-semibold text-ink mb-2">
                      Full Name
                    </label>
                    <input
                      id="rsvp-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jordan Smith"
                      className="w-full px-4 py-3.5 min-h-[48px] bg-cream border border-ink/30 focus:border-burgundy outline-none text-base font-sans text-ink"
                    />
                  </div>

                  <div>
                    <label htmlFor="rsvp-code" className="block text-sm font-sans font-semibold text-ink mb-2">
                      Invitation Passcode
                    </label>
                    <input
                      id="rsvp-code"
                      type="password"
                      inputMode="numeric"
                      required
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="4-digit code"
                      className="w-full px-4 py-3.5 min-h-[48px] bg-cream border border-ink/30 focus:border-burgundy outline-none text-base font-sans text-ink"
                    />
                  </div>

                  {error && (
                    <p className="text-sm font-sans font-semibold text-burgundy bg-burgundy/5 p-3.5 border border-burgundy/20">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 min-h-[48px] bg-burgundy text-white text-sm font-sans font-semibold uppercase tracking-wider hover:bg-ink transition-colors"
                  >
                    Continue to RSVP
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 sm:p-10"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 pb-6 mb-6 border-b border-ink/15">
                  <h2 className="text-2xl sm:text-3xl font-serif text-ink">
                    Welcome, {name.trim().split(' ')[0]}
                  </h2>
                  <span className="text-xs font-sans font-semibold uppercase tracking-wider text-ink/60">
                    Step 2 of 2
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 font-sans">
                  {/* Attendance Toggle */}
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-3">
                      Will you be attending?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRsvpData({ ...rsvpData, attending: 'yes' })}
                        className={`p-4 min-h-[56px] border-2 text-left text-base font-semibold transition-colors ${
                          rsvpData.attending === 'yes'
                            ? 'border-burgundy bg-burgundy text-white'
                            : 'border-ink/25 bg-white text-ink hover:border-ink'
                        }`}
                      >
                        Joyfully Accepts
                      </button>
                      <button
                        type="button"
                        onClick={() => setRsvpData({ ...rsvpData, attending: 'no' })}
                        className={`p-4 min-h-[56px] border-2 text-left text-base font-semibold transition-colors ${
                          rsvpData.attending === 'no'
                            ? 'border-ink bg-ink text-white'
                            : 'border-ink/25 bg-white text-ink hover:border-ink'
                        }`}
                      >
                        Regretfully Declines
                      </button>
                    </div>
                  </div>

                  {rsvpData.attending === 'yes' && (
                    <div className="space-y-6 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="rsvp-email" className="block text-sm font-semibold text-ink mb-2">
                            Email Address (for confirmation)
                          </label>
                          <input
                            id="rsvp-email"
                            type="email"
                            required
                            value={rsvpData.email}
                            onChange={(e) => setRsvpData({ ...rsvpData, email: e.target.value })}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3.5 min-h-[48px] bg-cream border border-ink/30 focus:border-burgundy outline-none text-base text-ink"
                          />
                        </div>

                        <div>
                          <label htmlFor="rsvp-guests" className="block text-sm font-semibold text-ink mb-2">
                            Number of Guests
                          </label>
                          <select
                            id="rsvp-guests"
                            value={rsvpData.guests}
                            onChange={(e) => setRsvpData({ ...rsvpData, guests: parseInt(e.target.value, 10) })}
                            className="w-full px-4 py-3.5 min-h-[48px] bg-cream border border-ink/30 focus:border-burgundy outline-none text-base text-ink"
                          >
                            <option value={1}>1 Guest</option>
                            <option value={2}>2 Guests</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="rsvp-song" className="block text-sm font-semibold text-ink mb-2">
                            Song Request (optional)
                          </label>
                          <input
                            id="rsvp-song"
                            type="text"
                            value={rsvpData.songRequest}
                            onChange={(e) => setRsvpData({ ...rsvpData, songRequest: e.target.value })}
                            placeholder="A song that gets you dancing"
                            className="w-full px-4 py-3.5 min-h-[48px] bg-cream border border-ink/30 focus:border-burgundy outline-none text-base text-ink"
                          />
                        </div>

                        <div>
                          <label htmlFor="rsvp-dietary" className="block text-sm font-semibold text-ink mb-2">
                            Dietary Restrictions (optional)
                          </label>
                          <input
                            id="rsvp-dietary"
                            type="text"
                            value={rsvpData.dietary}
                            onChange={(e) => setRsvpData({ ...rsvpData, dietary: e.target.value })}
                            placeholder="Allergies or dietary needs"
                            className="w-full px-4 py-3.5 min-h-[48px] bg-cream border border-ink/30 focus:border-burgundy outline-none text-base text-ink"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="rsvp-note" className="block text-sm font-semibold text-ink mb-2">
                      Note for the Couple (optional)
                    </label>
                    <textarea
                      id="rsvp-note"
                      rows={3}
                      value={rsvpData.note}
                      onChange={(e) => setRsvpData({ ...rsvpData, note: e.target.value })}
                      placeholder="Leave a message for Jenneba & Troy"
                      className="w-full px-4 py-3 bg-cream border border-ink/30 focus:border-burgundy outline-none text-base text-ink resize-y"
                    />
                  </div>

                  {error && (
                    <p className="text-sm font-semibold text-burgundy bg-burgundy/5 p-3.5 border border-burgundy/20">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 min-h-[48px] bg-burgundy text-white text-sm font-semibold uppercase tracking-wider hover:bg-ink transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Submitting RSVP...' : 'Submit RSVP'}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 sm:p-10 text-center"
              >
                <div className="w-14 h-14 bg-burgundy text-white flex items-center justify-center mx-auto mb-5 rounded-full">
                  <CheckCircle2 size={28} />
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif text-ink mb-3">
                  RSVP Recorded
                </h2>
                <p className="font-sans text-base sm:text-lg text-ink/85 max-w-xl mx-auto leading-relaxed mb-8">
                  {rsvpData.attending === 'yes'
                    ? "Thank you for confirming! We're so excited to celebrate with you on September 11, 2027."
                    : 'Thank you for letting us know. We will miss having you with us!'}
                </p>

                {rsvpData.attending === 'yes' && (
                  <div className="bg-burgundy text-white p-6 sm:p-8 text-left mb-8">
                    <div className="flex items-center gap-2 text-gold text-xs font-display font-bold uppercase tracking-[0.2em] mb-3">
                      <MapPin size={16} />
                      <span>Venue Details</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-serif mb-1">White&apos;s Ferry Manor</p>
                    <p className="font-sans text-base text-white/90 mb-5">
                      123 Riverside Drive, Leesburg, VA 20176
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        to="/schedule"
                        className="inline-flex items-center justify-center px-5 py-3 min-h-[44px] bg-gold text-ink text-xs font-sans font-bold uppercase tracking-wider hover:bg-white transition-colors"
                      >
                        View Wedding Schedule
                      </Link>
                      <a
                        href="https://maps.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-5 py-3 min-h-[44px] border border-white/40 text-white text-xs font-sans font-semibold uppercase tracking-wider hover:bg-white/10 transition-colors"
                      >
                        Open in Maps
                      </a>
                    </div>
                  </div>
                )}

                <Link
                  to="/"
                  className="inline-flex items-center justify-center px-6 py-3 min-h-[44px] border border-ink text-ink text-sm font-sans font-semibold uppercase tracking-wider hover:bg-cream transition-colors"
                >
                  Back to Home
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
