import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Check,
  HelpCircle,
  X,
  CheckCircle2,
  Calendar,
  MapPin,
  ArrowRight,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';

type AvailabilityStatus = 'yes' | 'maybe' | 'no';

interface PartyMemberRow {
  id: string;
  name: string;
  status: AvailabilityStatus;
}

const STATUS_OPTIONS: Array<{
  value: AvailabilityStatus;
  shortLabel: string;
  label: string;
  icon: typeof Check;
}> = [
  {
    value: 'yes',
    shortLabel: 'Available',
    label: "Yes, Available",
    icon: Check,
  },
  {
    value: 'maybe',
    shortLabel: 'Not Sure',
    label: 'Not Sure Yet',
    icon: HelpCircle,
  },
  {
    value: 'no',
    shortLabel: "Can't Make It",
    label: 'Unable to Attend',
    icon: X,
  },
];

function buildInitialMembers(
  rawName: string,
  rawParty: string | null,
  initialStatus: AvailabilityStatus
): PartyMemberRow[] {
  const parsedPartySize = rawParty ? parseInt(rawParty, 10) : NaN;
  const targetSize =
    Number.isFinite(parsedPartySize) && parsedPartySize >= 1
      ? Math.min(12, parsedPartySize)
      : 1;

  const trimmed = rawName.trim();
  const splitParts = trimmed
    ? trimmed
        .split(/\s*&\s*|\s+and\s+|\s*\+\s*/i)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  // Handle "John & Jane Smith" -> carry shared last name to first person cleanly
  let normalizedNames = [...splitParts];
  if (
    normalizedNames.length === 2 &&
    !normalizedNames[0].includes(' ') &&
    normalizedNames[1].includes(' ')
  ) {
    const secondParts = normalizedNames[1].split(/\s+/);
    const sharedLastName = secondParts[secondParts.length - 1];
    if (sharedLastName) {
      normalizedNames = [`${normalizedNames[0]} ${sharedLastName}`, normalizedNames[1]];
    }
  }

  const count = Math.max(1, targetSize, normalizedNames.length);
  const rows: PartyMemberRow[] = [];
  for (let i = 0; i < count; i++) {
    rows.push({
      id: `member-${i}-${Date.now()}`,
      name: normalizedNames[i] || '',
      status: initialStatus,
    });
  }
  return rows;
}

export default function AvailabilitySurvey() {
  const [searchParams] = useSearchParams();
  const initialParam = searchParams.get('response');
  const initialStatus: AvailabilityStatus =
    initialParam === 'yes' || initialParam === 'maybe' || initialParam === 'no'
      ? initialParam
      : 'yes';

  const initialRawName = searchParams.get('name') || '';
  const initialRawParty = searchParams.get('party');
  const deadlineParam = searchParams.get('deadline');
  const deadlineText = deadlineParam === null ? 'January 31, 2027' : deadlineParam.trim();

  const [members, setMembers] = useState<PartyMemberRow[]>(() =>
    buildInitialMembers(initialRawName, initialRawParty, initialStatus)
  );
  const [email, setEmail] = useState(() => searchParams.get('email') || '');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedRecord, setSubmittedRecord] = useState<{
    name: string;
    email: string;
    partySize: number;
    availableCount: number;
    maybeCount: number;
    noCount: number;
    partyMembers: Array<{ name: string; status: AvailabilityStatus }>;
    note: string;
  } | null>(null);

  const updateMemberName = (id: string, value: string) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, name: value } : m)));
  };

  const updateMemberStatus = (id: string, value: AvailabilityStatus) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status: value } : m)));
  };

  const setAllMembersStatus = (value: AvailabilityStatus) => {
    setMembers((prev) => prev.map((m) => ({ ...m, status: value })));
  };

  const addMember = () => {
    if (members.length >= 12) return;
    setMembers((prev) => [
      ...prev,
      {
        id: `member-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: '',
        status: prev[0]?.status || initialStatus,
      },
    ]);
  };

  const removeMember = (id: string) => {
    if (members.length <= 1) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanedMembers = members.map((m) => ({
      name: m.name.trim(),
      status: m.status,
    }));

    if (cleanedMembers.some((m) => !m.name)) {
      setError('Please enter a full name for each person in your party before submitting.');
      return;
    }

    const combinedPartyName = cleanedMembers.map((m) => m.name).join(' & ');
    const primaryStatus: AvailabilityStatus = cleanedMembers.some((m) => m.status === 'yes')
      ? 'yes'
      : cleanedMembers.some((m) => m.status === 'maybe')
      ? 'maybe'
      : 'no';

    setSubmitting(true);
    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: combinedPartyName,
          email: email.trim(),
          status: primaryStatus,
          partySize: cleanedMembers.length,
          partyMembers: cleanedMembers,
          note: note.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Unable to submit your response. Please try again.');
        return;
      }

      setSubmittedRecord({
        name: data.record.name,
        email: data.record.email,
        partySize: data.record.partySize ?? cleanedMembers.length,
        availableCount: data.record.availableCount ?? 0,
        maybeCount: data.record.maybeCount ?? 0,
        noCount: data.record.noCount ?? 0,
        partyMembers: data.record.partyMembers || cleanedMembers,
        note: data.record.note,
      });
    } catch {
      setError('Network error while saving your response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedRecord) {
    return (
      <section className="magazine-page justify-center items-center">
        <div className="max-w-xl w-full bg-white border-2 border-ink p-6 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 border-2 border-burgundy bg-cream text-burgundy rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-display font-bold text-[#8A6B2F] mb-2">
              Thank You
            </p>
            <h1 className="text-3xl sm:text-4xl font-serif text-ink uppercase">
              Availability Saved
            </h1>
          </div>

          <div className="bg-cream border border-ink/15 p-5 sm:p-6 text-left space-y-3 text-base font-sans">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-ink/10">
              <span className="text-xs uppercase tracking-wider font-display font-bold text-ink/65">
                Party Responses ({submittedRecord.partySize})
              </span>
              <span className="text-xs font-sans font-semibold text-burgundy tabular-nums">
                {submittedRecord.availableCount} of {submittedRecord.partySize} Available
              </span>
            </div>

            <ul className="divide-y divide-ink/10">
              {submittedRecord.partyMembers.map((m, idx) => {
                const label =
                  STATUS_OPTIONS.find((opt) => opt.value === m.status)?.label || m.status;
                const statusClass =
                  m.status === 'yes'
                    ? 'text-burgundy font-semibold'
                    : m.status === 'maybe'
                    ? 'text-[#8A6B2F] font-semibold'
                    : 'text-ink/65';
                return (
                  <li
                    key={`${m.name}-${idx}`}
                    className="py-2 flex flex-wrap items-baseline justify-between gap-2"
                  >
                    <span className="font-semibold text-ink">{m.name}</span>
                    <span className={`text-sm ${statusClass}`}>{label}</span>
                  </li>
                );
              })}
            </ul>

            {submittedRecord.email && (
              <p className="text-sm text-ink/75 pt-2 border-t border-ink/10 break-all">
                <span className="font-semibold text-ink">Email:</span> {submittedRecord.email}
              </p>
            )}
            {submittedRecord.note && (
              <p className="text-sm text-ink/80">
                <span className="font-semibold text-ink">Note:</span> {submittedRecord.note}
              </p>
            )}
          </div>

          <p className="text-sm sm:text-base font-sans text-ink/75 leading-relaxed">
            Thanks for letting Jenneba &amp; Troy know! Your formal wedding invitation and final RSVP (due August 1, 2027) will follow closer to the wedding date.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/travel"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[48px] bg-burgundy text-white text-sm uppercase font-sans font-semibold tracking-wider hover:bg-ink transition-colors"
            >
              Hotel &amp; Travel Info
              <ArrowRight size={16} />
            </Link>
            <button
              type="button"
              onClick={() => setSubmittedRecord(null)}
              className="px-5 py-3.5 min-h-[48px] border border-ink text-ink text-sm uppercase font-sans font-semibold tracking-wider hover:bg-cream transition-colors cursor-pointer"
            >
              Edit Response
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="magazine-page justify-center items-center">
      <div className="max-w-2xl w-full bg-white border-2 border-ink p-6 sm:p-10 space-y-8">
        <div className="text-center border-b border-ink/15 pb-6 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] font-display font-bold text-[#8A6B2F]">
            Save the Date · Quick Check
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif text-ink uppercase leading-tight">
            Are You Available That Day?
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm sm:text-base font-sans text-ink/80 pt-1">
            <span className="inline-flex items-center gap-2">
              <Calendar size={16} className="text-burgundy shrink-0" />
              Saturday, September 11, 2027
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin size={16} className="text-burgundy shrink-0" />
              Leesburg, Virginia
            </span>
          </div>
          {deadlineText && (
            <p className="text-sm font-sans font-semibold text-burgundy pt-1">
              Please submit your availability by {deadlineText}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Party Member Availability Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-burgundy shrink-0" />
                <h2 className="font-sans text-base font-semibold text-ink">
                  {members.length > 1
                    ? `Your Party (${members.length} Guests)`
                    : 'Your Availability'}
                </h2>
              </div>

              {members.length > 1 && (
                <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
                  <span className="text-ink/60">Set all to:</span>
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAllMembersStatus(opt.value)}
                      className="px-2.5 py-1.5 min-h-[36px] border border-ink/25 bg-cream hover:border-burgundy hover:text-burgundy text-ink font-semibold transition-colors cursor-pointer"
                    >
                      {opt.shortLabel}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="text-sm font-sans text-ink/70 leading-relaxed">
              Responding for a couple or household? Confirm each person&apos;s availability below or add everyone in your party so we have an accurate headcount.
            </p>

            <div className="space-y-4">
              {members.map((member, index) => (
                <div
                  key={member.id}
                  className="bg-cream border border-ink/20 p-4 sm:p-5 space-y-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor={`member-name-${member.id}`}
                      className="text-xs uppercase tracking-wider font-display font-bold text-[#8A6B2F]"
                    >
                      {members.length > 1 ? `Guest ${index + 1}` : 'Guest Name'}{' '}
                      <span className="text-burgundy">*</span>
                    </label>
                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMember(member.id)}
                        aria-label={`Remove guest ${index + 1}`}
                        className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-ink/55 hover:text-burgundy transition-colors py-1 px-2 min-h-[36px] cursor-pointer"
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <input
                    id={`member-name-${member.id}`}
                    type="text"
                    value={member.name}
                    onChange={(e) => updateMemberName(member.id, e.target.value)}
                    placeholder={
                      index === 0 ? 'Your full name' : `Guest ${index + 1} full name`
                    }
                    required
                    className="w-full px-4 py-3 min-h-[48px] bg-white border border-ink/30 focus:border-burgundy outline-none text-base font-sans text-ink"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {STATUS_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      const isSelected = member.status === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateMemberStatus(member.id, option.value)}
                          aria-pressed={isSelected}
                          className={`min-h-[48px] px-3.5 py-2.5 border-2 font-sans text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-burgundy text-white border-burgundy'
                              : 'bg-white text-ink border-ink/20 hover:border-ink'
                          }`}
                        >
                          <Icon size={16} className="shrink-0" />
                          <span>{option.shortLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {members.length < 12 && (
              <button
                type="button"
                onClick={addMember}
                className="w-full py-3.5 px-4 min-h-[48px] border border-dashed border-ink/40 hover:border-burgundy hover:text-burgundy bg-white text-ink text-sm font-sans font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Plus size={16} />
                <span>Add Another Person in Your Party</span>
              </button>
            )}
          </div>

          <div>
            <label htmlFor="avail-email" className="block font-sans text-sm font-semibold text-ink mb-1.5">
              Party Email Address <span className="text-ink/50 font-normal">(optional)</span>
            </label>
            <input
              id="avail-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 min-h-[48px] bg-cream border border-ink/30 focus:border-burgundy outline-none text-base font-sans text-ink"
            />
          </div>

          <div>
            <label htmlFor="avail-note" className="block font-sans text-sm font-semibold text-ink mb-1.5">
              Quick Note for Jenneba &amp; Troy <span className="text-ink/50 font-normal">(optional)</span>
            </label>
            <textarea
              id="avail-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Travel thoughts, questions, or a quick hello..."
              className="w-full px-4 py-3 bg-cream border border-ink/30 focus:border-burgundy outline-none text-base font-sans text-ink leading-relaxed"
            />
          </div>

          {error && (
            <div className="p-3.5 bg-cream border border-burgundy text-burgundy text-sm font-sans font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 min-h-[52px] bg-burgundy text-white text-sm uppercase font-sans font-semibold tracking-wider hover:bg-ink transition-colors disabled:opacity-50 cursor-pointer"
          >
            {submitting
              ? 'Saving Response...'
              : members.length > 1
              ? `Confirm Availability for ${members.length} Guests`
              : 'Confirm & Submit Availability'}
          </button>

          <p className="text-xs sm:text-sm font-sans text-ink/60 text-center leading-relaxed">
            This is an early headcount only—not your formal RSVP (due August 1, 2027). You can revisit this page anytime to update your party&apos;s answer.
          </p>
        </form>
      </div>
    </section>
  );
}
