import React, { useState } from 'react';
import { Lock, Calendar, Phone, Info, Users, ClipboardList, Check, Hotel, ExternalLink, Copy } from 'lucide-react';

const HOTEL_BLOCK_URL = 'https://www.hyatt.com/events/en-US/group-booking/DULLE/G-J912';

export default function BridalPortal() {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [bulkList, setBulkList] = useState('');
  const [formattedCode, setFormattedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedHotelLink, setCopiedHotelLink] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === 'jennebatroy2027') {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Incorrect password. Please check with the couple.');
    }
  };

  const generateCode = () => {
    const names = bulkList
      .split('\n')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    const code = names.map((name) => `  '${name}',`).join('\n');
    setFormattedCode(code);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyHotelLink = () => {
    navigator.clipboard.writeText(HOTEL_BLOCK_URL);
    setCopiedHotelLink(true);
    setTimeout(() => setCopiedHotelLink(false), 2000);
  };

  if (!isUnlocked) {
    return (
      <section className="magazine-page justify-center items-center">
        <div className="max-w-lg w-full bg-white p-6 sm:p-10 border-2 border-ink text-center">
          <div className="w-16 h-16 border-2 border-ink flex items-center justify-center text-ink mx-auto mb-6 rounded-full">
            <Lock size={24} />
          </div>
          <p className="text-xs uppercase tracking-[0.2em] font-display font-bold text-[#8A6B2F] mb-2">
            Wedding Party Only
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif text-ink mb-4 uppercase">
            Bridal Portal
          </h1>
          <p className="font-sans text-base text-ink/75 mb-8 leading-relaxed">
            Access to wedding party timelines, hotel block booking, attire notes, and contacts is limited to the bridal party. Enter the password to continue.
          </p>

          <form onSubmit={handleUnlock} className="space-y-5">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3.5 min-h-[48px] bg-cream border border-ink/30 focus:border-burgundy outline-none text-center text-base font-sans text-ink"
              required
            />
            {error && <p className="text-burgundy text-sm font-sans font-semibold">{error}</p>}
            <button
              type="submit"
              className="w-full py-4 min-h-[48px] bg-burgundy text-white text-sm uppercase font-sans font-semibold tracking-wider hover:bg-ink transition-colors"
            >
              Unlock Portal
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="magazine-page">
      <div className="w-full space-y-10">
        {/* Header */}
        <div className="border-b border-ink/20 pb-8">
          <p className="text-xs uppercase tracking-[0.2em] font-display font-bold text-[#8A6B2F] mb-3">
            Wedding Party Hub
          </p>
          <h1 className="text-4xl sm:text-5xl font-serif text-ink uppercase tracking-tight">
            Bridal Portal
          </h1>
        </div>

        {/* Bridal Party Hotel Block (Locked inside Bridal Portal) */}
        <div className="border-2 border-ink bg-cream p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2.5 text-xs uppercase tracking-[0.2em] font-display font-bold text-[#8A6B2F]">
              <Hotel size={18} className="text-burgundy shrink-0" />
              <span>Bridal Party Only · Hyatt Group Block</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-ink">
              Bridal Party Hotel Block Booking
            </h2>
            <p className="font-sans text-base text-ink/80 leading-relaxed">
              Use the private Hyatt group booking link below to reserve your room under our bridal party block. Please keep this link within the wedding party.
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm font-sans font-semibold text-ink/75 pt-1">
              <span>Group Code: G-J912</span>
              <span aria-hidden="true">·</span>
              <span>Hotel Code: DULLE</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href={HOTEL_BLOCK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-4 min-h-[48px] bg-burgundy text-white text-sm uppercase font-sans font-semibold tracking-wider hover:bg-ink transition-colors whitespace-nowrap"
            >
              <span>Book Hyatt Room Block</span>
              <ExternalLink size={16} />
            </a>
            <button
              type="button"
              onClick={copyHotelLink}
              className="inline-flex items-center justify-center gap-2 px-5 py-4 min-h-[48px] border border-ink bg-white text-ink text-sm uppercase font-sans font-semibold tracking-wider hover:bg-gold transition-colors whitespace-nowrap cursor-pointer"
            >
              {copiedHotelLink ? <Check size={16} className="text-burgundy" /> : <Copy size={16} />}
              <span>{copiedHotelLink ? 'Link Copied' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="border-2 border-ink p-6 sm:p-8 bg-cream">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-ink/15">
              <Calendar size={22} className="text-burgundy" />
              <h2 className="text-2xl font-serif text-ink">Weekend Timeline</h2>
            </div>
            <ul className="space-y-5 font-sans">
              {[
                { time: 'Sept 10 · 4:00 PM', event: 'Official Rehearsal' },
                { time: 'Sept 10 · 6:30 PM', event: 'Welcome Gathering' },
                { time: 'Sept 11 · 8:00 AM', event: 'Morning Prep' },
              ].map((item) => (
                <li key={item.event}>
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink/60 block mb-0.5">
                    {item.time}
                  </span>
                  <span className="text-lg font-serif text-ink">{item.event}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Attire */}
          <div className="border-2 border-ink p-6 sm:p-8 bg-burgundy text-white">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/20">
              <Info size={22} className="text-gold" />
              <h2 className="text-2xl font-serif text-white">Attire Guide</h2>
            </div>
            <div className="space-y-6 font-sans">
              <div>
                <h3 className="text-xs font-display font-bold text-gold uppercase tracking-wider mb-1.5">
                  Groomsmen
                </h3>
                <p className="text-base leading-relaxed text-white/90">
                  Classic black tuxedo, burgundy silk bowties, and personalized gold cufflinks.
                </p>
              </div>
              <div>
                <h3 className="text-xs font-display font-bold text-gold uppercase tracking-wider mb-1.5">
                  Bridesmaids
                </h3>
                <p className="text-base leading-relaxed text-white/90">
                  Floor-length burgundy velvet gowns with gold accessories.
                </p>
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div className="border-2 border-ink p-6 sm:p-8 bg-white">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-ink/15">
              <Phone size={22} className="text-burgundy" />
              <h2 className="text-2xl font-serif text-ink">Key Contacts</h2>
            </div>
            <div className="space-y-5 font-sans">
              <div>
                <p className="text-xs font-display font-bold text-[#8A6B2F] uppercase tracking-wider mb-1">
                  Coordinator Liaison
                </p>
                <p className="text-xl font-serif text-ink">Sarah Miller</p>
                <p className="text-base text-ink/75 tabular-nums">(555) 123-4567</p>
              </div>
              <div className="pt-4 border-t border-ink/15">
                <p className="text-xs font-display font-bold text-[#8A6B2F] uppercase tracking-wider mb-1">
                  Maid of Honor
                </p>
                <p className="text-xl font-serif text-ink">Zainab Felder</p>
                <p className="text-base text-ink/75 tabular-nums">(555) 987-6543</p>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Importer */}
        <div className="border-2 border-ink p-6 sm:p-8 bg-cream">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-ink/15">
            <Users size={22} className="text-burgundy" />
            <div>
              <h2 className="text-2xl font-serif text-ink">Guest List Formatter</h2>
              <p className="text-sm font-sans text-ink/70">
                Paste names (one per line) to format them for <code className="bg-ink text-white px-1.5 py-0.5 text-xs">guests.ts</code>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-sans font-semibold text-ink">
                Guest Names
              </label>
              <textarea
                value={bulkList}
                onChange={(e) => setBulkList(e.target.value)}
                placeholder={'John Smith\nJane Doe'}
                rows={7}
                className="w-full p-4 bg-white border border-ink/30 focus:border-burgundy outline-none text-base font-sans"
              />
              <button
                type="button"
                onClick={generateCode}
                className="w-full py-3.5 min-h-[48px] bg-ink text-white text-sm uppercase font-sans font-semibold tracking-wider hover:bg-burgundy transition-colors"
              >
                Generate List
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-sans font-semibold text-ink">
                  Formatted Output
                </label>
                {formattedCode && (
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold uppercase tracking-wider text-burgundy hover:underline"
                  >
                    {copied ? <Check size={14} /> : <ClipboardList size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              <pre className="w-full h-52 p-4 bg-ink text-white overflow-auto text-sm font-mono leading-relaxed">
                {formattedCode || 'Paste names on the left and click Generate List'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
