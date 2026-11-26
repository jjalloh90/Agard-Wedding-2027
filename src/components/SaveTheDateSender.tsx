import React, { useState, useRef } from 'react';
import {
  Lock,
  Upload,
  Mail,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  AlertCircle,
  Download,
  Eye,
  Users,
  RefreshCw,
  CalendarCheck,
} from 'lucide-react';

interface Recipient {
  id: string;
  name: string;
  email: string;
  partySize: number;
}

interface DeliveryResult {
  email: string;
  name: string;
  status: 'sent' | 'failed';
  error?: string;
}

interface PartyMemberAvailability {
  name: string;
  status: 'yes' | 'maybe' | 'no';
}

interface AvailabilityRecord {
  id: string;
  name: string;
  email: string;
  status: 'yes' | 'maybe' | 'no';
  partySize: number;
  availableCount: number;
  maybeCount: number;
  noCount: number;
  partyMembers?: PartyMemberAvailability[];
  note: string;
  createdAt: string;
  updatedAt: string;
}

interface AvailabilityCounts {
  yes: number;
  maybe: number;
  no: number;
  total: number;
  guestsYes: number;
  guestsMaybe: number;
  guestsNo: number;
  guestsTotal: number;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((ch === ',' || ch === '\t' || ch === ';') && !inQuotes) {
      cells.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function combineGuestNames(existingName: string, incomingName: string): string {
  const existing = existingName.trim();
  const incoming = incomingName.trim();
  if (!existing) return incoming;
  if (!incoming) return existing;

  const existingParts = existing
    .split(/\s*&\s*|\s+and\s+/i)
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);

  if (existingParts.includes(incoming.toLowerCase()) || existing.toLowerCase() === incoming.toLowerCase()) {
    return existing;
  }

  return `${existing} & ${incoming}`;
}

function normalizeHeader(header: string): string {
  return header
    .replace(/^\uFEFF/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function inferPartySize(name: string): number {
  const trimmed = name.trim();
  if (!trimmed) return 1;
  const parts = trimmed
    .split(/\s*&\s*|\s+and\s+|\s*\+\s*/i)
    .map((p) => p.trim())
    .filter(Boolean);
  return Math.max(1, Math.min(12, parts.length));
}

function parsePartySizeCell(rawValue?: string): number | null {
  if (!rawValue) return null;
  const match = rawValue.trim().match(/^(\d{1,2})$/);
  if (!match) return null;
  const parsed = parseInt(match[1], 10);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return Math.min(12, parsed);
}

function parseRecipientInput(rawText: string): {
  parsed: Array<{ name: string; email: string; partySize: number }>;
  invalidLines: string[];
} {
  const cleanedText = rawText.replace(/^\uFEFF/, '');
  const lines = cleanedText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { parsed: [], invalidLines: [] };
  }

  const parsed: Array<{ name: string; email: string; partySize: number }> = [];
  const invalidLines: string[] = [];

  // Detect optional CSV header row
  const firstCells = parseCsvLine(lines[0]).map(normalizeHeader);
  const sampleDataCells = lines.length > 1 ? parseCsvLine(lines[1]) : [];

  const emailColIdx = firstCells.findIndex(
    (c) =>
      c === 'email' ||
      c === 'email address' ||
      c === 'e mail' ||
      c === 'e mail address' ||
      c.includes('email') ||
      c.includes('e mail')
  );

  const partySizeColIdx = firstCells.findIndex((c, idx) => {
    if (
      [
        'party size',
        'guest count',
        'number of guests',
        '# of guests',
        'num guests',
        'headcount',
        'total guests',
        'count',
        'size',
        'people',
        'seats',
        'invited',
      ].includes(c)
    ) {
      return true;
    }
    if ((c === 'guests' || c === 'party') && parsePartySizeCell(sampleDataCells[idx]) !== null) {
      return true;
    }
    return false;
  });

  const fullNameColIdx = firstCells.findIndex(
    (c, idx) =>
      idx !== partySizeColIdx &&
      [
        'name',
        'full name',
        'guest name',
        'guest',
        'guests',
        'recipient',
        'recipient name',
        'contact name',
        'party name',
        'party',
        'household',
        'couple',
      ].includes(c)
  );
  const firstNameColIdx = firstCells.findIndex(
    (c) => c === 'first name' || c === 'firstname' || c === 'first' || c === 'given name'
  );
  const lastNameColIdx = firstCells.findIndex(
    (c) => c === 'last name' || c === 'lastname' || c === 'last' || c === 'surname' || c === 'family name'
  );

  const hasHeader =
    emailColIdx !== -1 ||
    fullNameColIdx !== -1 ||
    firstNameColIdx !== -1 ||
    lastNameColIdx !== -1 ||
    partySizeColIdx !== -1;
  const startIdx = hasHeader ? 1 : 0;

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    const cells = parseCsvLine(line);

    if (hasHeader && emailColIdx !== -1) {
      const email = (cells[emailColIdx] || '').trim();
      let name = '';
      if (fullNameColIdx !== -1) {
        name = (cells[fullNameColIdx] || '').trim();
      } else if (firstNameColIdx !== -1 || lastNameColIdx !== -1) {
        const first = firstNameColIdx !== -1 ? (cells[firstNameColIdx] || '').trim() : '';
        const last = lastNameColIdx !== -1 ? (cells[lastNameColIdx] || '').trim() : '';
        name = [first, last].filter(Boolean).join(' ');
      } else {
        // Fallback: use non-email cells that look like text names
        const otherCells = cells
          .filter((_, idx) => idx !== emailColIdx && idx !== partySizeColIdx)
          .map((c) => c.trim())
          .filter((c) => c.length > 0 && !EMAIL_REGEX.test(c) && !/^\+?[\d\s().-]+$/.test(c));
        name = otherCells.join(' ');
      }

      const explicitSize =
        partySizeColIdx !== -1 ? parsePartySizeCell(cells[partySizeColIdx]) : null;
      const partySize = explicitSize ?? inferPartySize(name);

      if (EMAIL_REGEX.test(email)) {
        parsed.push({ name, email, partySize });
      } else if (line) {
        invalidLines.push(line);
      }
      continue;
    }

    // Handle lines with multiple comma-separated emails (e.g., "a@b.com, c@d.com")
    const emailMatches = cells.filter((c) => EMAIL_REGEX.test(c));
    if (emailMatches.length > 1) {
      for (const email of emailMatches) {
        parsed.push({ name: '', email, partySize: 1 });
      }
      continue;
    }

    if (emailMatches.length === 1) {
      const email = emailMatches[0];
      let explicitSize: number | null = null;
      const nameParts: string[] = [];
      for (const cell of cells) {
        if (cell === email || !cell) continue;
        const maybeSize = parsePartySizeCell(cell);
        if (maybeSize !== null && explicitSize === null) {
          explicitSize = maybeSize;
        } else {
          nameParts.push(cell);
        }
      }
      const name = nameParts.join(' ');
      parsed.push({ name, email, partySize: explicitSize ?? inferPartySize(name) });
      continue;
    }

    // Fallback: check for "Name <email@example.com>" format
    const angleMatch = line.match(/^(.*?)<([^\s<>]+@[^\s<>]+\.[^\s<>]+)>$/);
    if (angleMatch) {
      const name = angleMatch[1].replace(/["']/g, '').trim();
      const email = angleMatch[2].trim();
      if (EMAIL_REGEX.test(email)) {
        parsed.push({ name, email, partySize: inferPartySize(name) });
        continue;
      }
    }

    invalidLines.push(line);
  }

  return { parsed, invalidLines };
}

export default function SaveTheDateSender() {
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const [emailConfigured, setEmailConfigured] = useState(true);
  const [fromEmail, setFromEmail] = useState('');
  const [isTestSender, setIsTestSender] = useState(false);

  const [rawInput, setRawInput] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [parseFeedback, setParseFeedback] = useState<{
    added: number;
    duplicates: number;
    invalid: string[];
  } | null>(null);

  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualError, setManualError] = useState('');

  const [subject, setSubject] = useState('Save the Date: Jenneba & Troy | September 11, 2027');
  const [message, setMessage] = useState(
    'We\u2019re saying "I do"! We couldn\u2019t be more excited to invite you to celebrate our love story as we tie the knot on September 11, 2027, in Leesburg, Virginia. Save the date, bring your dancing shoes, and visit our wedding website for travel and hotel details. Formal invitation to follow!'
  );
  const [websiteUrl, setWebsiteUrl] = useState(() =>
    typeof window !== 'undefined' ? window.location.origin : ''
  );
  const [availabilityDeadline, setAvailabilityDeadline] = useState('January 31, 2027');

  const [testEmail, setTestEmail] = useState('');
  const [testName, setTestName] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testStatus, setTestStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [confirmingBulk, setConfirmingBulk] = useState(false);
  const [sendingBulk, setSendingBulk] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const [deliverySummary, setDeliverySummary] = useState<{
    sentCount: number;
    failedCount: number;
    results: DeliveryResult[];
  } | null>(null);

  const [availabilityResponses, setAvailabilityResponses] = useState<AvailabilityRecord[]>([]);
  const [availabilityCounts, setAvailabilityCounts] = useState<AvailabilityCounts>({
    yes: 0,
    maybe: 0,
    no: 0,
    total: 0,
    guestsYes: 0,
    guestsMaybe: 0,
    guestsNo: 0,
    guestsTotal: 0,
  });
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [responsesError, setResponsesError] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchAvailabilityResponses = async (adminPasscode: string) => {
    setLoadingResponses(true);
    setResponsesError('');
    try {
      const res = await fetch('/api/save-the-dates/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: adminPasscode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setResponsesError(data.message || 'Could not load availability responses.');
        return;
      }
      setAvailabilityResponses(Array.isArray(data.responses) ? data.responses : []);
      if (data.counts) {
        setAvailabilityCounts(data.counts);
      }
    } catch {
      setResponsesError('Network error while loading availability responses.');
    } finally {
      setLoadingResponses(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setVerifying(true);

    try {
      const res = await fetch('/api/save-the-dates/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.message || 'Incorrect clearance key.');
        return;
      }

      setEmailConfigured(Boolean(data.emailConfigured));
      setFromEmail(data.fromEmail || '');
      setIsTestSender(Boolean(data.isTestSender));
      setIsUnlocked(true);
      void fetchAvailabilityResponses(passcode);
    } catch {
      setAuthError('Unable to verify right now. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const mergeRecipients = (
    incoming: Array<{ name: string; email: string; partySize: number }>,
    invalid: string[]
  ) => {
    const updated = [...recipients];
    const indexByEmail = new Map<string, number>();
    updated.forEach((r, idx) => indexByEmail.set(r.email.toLowerCase(), idx));

    let added = 0;
    let duplicates = 0;

    for (const item of incoming) {
      const normalizedEmail = item.email.toLowerCase();
      const existingIdx = indexByEmail.get(normalizedEmail);
      if (existingIdx !== undefined) {
        duplicates++;
        const combined = combineGuestNames(updated[existingIdx].name, item.name);
        if (combined !== updated[existingIdx].name) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            name: combined,
            partySize: Math.min(12, updated[existingIdx].partySize + item.partySize),
          };
        }
      } else {
        indexByEmail.set(normalizedEmail, updated.length);
        updated.push({
          id: `${normalizedEmail}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: item.name.trim(),
          email: item.email.trim(),
          partySize: item.partySize,
        });
        added++;
      }
    }

    setRecipients(updated);
    setParseFeedback({
      added,
      duplicates,
      invalid,
    });
  };

  const handleImportText = () => {
    const { parsed, invalidLines } = parseRecipientInput(rawInput);
    mergeRecipients(parsed, invalidLines);
    if (parsed.length > 0) {
      setRawInput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      const { parsed, invalidLines } = parseRecipientInput(content);
      mergeRecipients(parsed, invalidLines);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError('');
    const trimmedEmail = manualEmail.trim();
    const trimmedName = manualName.trim();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setManualError('Please enter a valid email address.');
      return;
    }

    if (recipients.some((r) => r.email.toLowerCase() === trimmedEmail.toLowerCase())) {
      setManualError('This email is already on your Save the Date list.');
      return;
    }

    setRecipients((prev) => [
      ...prev,
      {
        id: `${trimmedEmail.toLowerCase()}-${Date.now()}`,
        name: trimmedName,
        email: trimmedEmail,
        partySize: inferPartySize(trimmedName),
      },
    ]);
    setManualName('');
    setManualEmail('');
  };

  const removeRecipient = (id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRecipientName = (id: string, name: string) => {
    setRecipients((prev) => prev.map((r) => (r.id === id ? { ...r, name } : r)));
  };

  const updateRecipientPartySize = (id: string, partySize: number) => {
    setRecipients((prev) =>
      prev.map((r) => (r.id === id ? { ...r, partySize: Math.max(1, Math.min(12, partySize)) } : r))
    );
  };

  const downloadTemplate = () => {
    const sample =
      'Name,Email,Party Size\nJohn & Jane Smith,smiths@example.com,2\nJordan Taylor,jordan@example.com,1\n';
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'save-the-date-guests-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportResponsesCsv = () => {
    const csvEscape = (value: string) => `"${(value || '').replace(/"/g, '""')}"`;
    const statusMap: Record<AvailabilityRecord['status'], string> = {
      yes: 'Yes - Available',
      maybe: 'Not Sure Yet',
      no: 'Unable to Attend',
    };
    const header =
      'Party Name,Email,Party Size,Guests Available,Guests Not Sure,Guests Unable,Individual Breakdown,Note,Updated At';
    const rows = availabilityResponses.map((r) => {
      const breakdown =
        r.partyMembers && r.partyMembers.length > 0
          ? r.partyMembers.map((m) => `${m.name}: ${statusMap[m.status]}`).join('; ')
          : `${r.name}: ${statusMap[r.status]}`;
      return [
        csvEscape(r.name),
        csvEscape(r.email),
        String(r.partySize ?? 1),
        String(r.availableCount ?? (r.status === 'yes' ? 1 : 0)),
        String(r.maybeCount ?? (r.status === 'maybe' ? 1 : 0)),
        String(r.noCount ?? (r.status === 'no' ? 1 : 0)),
        csvEscape(breakdown),
        csvEscape(r.note),
        csvEscape(r.updatedAt),
      ].join(',');
    });
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'save-the-date-availability.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestStatus(null);
    const trimmed = testEmail.trim();

    if (!EMAIL_REGEX.test(trimmed)) {
      setTestStatus({ type: 'error', text: 'Please enter a valid test email address.' });
      return;
    }

    setSendingTest(true);
    try {
      const res = await fetch('/api/save-the-dates/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passcode,
          recipients: [{ name: testName.trim(), email: trimmed, partySize: inferPartySize(testName) }],
          subject,
          message,
          websiteUrl,
          availabilityDeadline,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setTestStatus({ type: 'error', text: data.message || 'Failed to send test email.' });
        return;
      }

      const firstResult = data.results?.[0];
      if (firstResult?.status === 'sent') {
        setTestStatus({ type: 'success', text: `Test email sent to ${trimmed}.` });
      } else {
        setTestStatus({
          type: 'error',
          text: firstResult?.error || 'Email provider rejected the test message.',
        });
      }
    } catch {
      setTestStatus({ type: 'error', text: 'Network error while sending test email.' });
    } finally {
      setSendingTest(false);
    }
  };

  const handleSendBulk = async () => {
    setConfirmingBulk(false);
    setBulkError('');
    setDeliverySummary(null);
    setSendingBulk(true);

    try {
      const res = await fetch('/api/save-the-dates/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passcode,
          recipients: recipients.map(({ name, email, partySize }) => ({ name, email, partySize })),
          subject,
          message,
          websiteUrl,
          availabilityDeadline,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setBulkError(data.message || 'Failed to send Save the Date emails.');
        return;
      }

      setDeliverySummary({
        sentCount: data.sentCount ?? 0,
        failedCount: data.failedCount ?? 0,
        results: data.results ?? [],
      });
    } catch {
      setBulkError('Network error while sending Save the Date emails.');
    } finally {
      setSendingBulk(false);
    }
  };

  if (!isUnlocked) {
    return (
      <section className="magazine-page justify-center items-center">
        <div className="max-w-lg w-full bg-white p-6 sm:p-10 border-2 border-ink text-center">
          <div className="w-16 h-16 border-2 border-ink flex items-center justify-center text-ink mx-auto mb-6 rounded-full">
            <Lock size={24} />
          </div>
          <p className="text-xs uppercase tracking-[0.2em] font-display font-bold text-[#8A6B2F] mb-2">
            Couple Only
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif text-ink mb-4 uppercase">
            Save the Dates
          </h1>
          <p className="text-ink/80 text-base font-sans mb-8 leading-relaxed">
            Upload your guest email list, customize your Save the Date card, and email your guests directly. Enter your clearance key to continue.
          </p>

          <form onSubmit={handleUnlock} className="space-y-5">
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter clearance key"
              className="w-full px-4 py-3.5 min-h-[48px] bg-cream border border-ink/30 focus:border-burgundy outline-none text-center text-base font-sans text-ink"
              required
            />
            {authError && (
              <p className="text-burgundy text-sm font-sans font-semibold">{authError}</p>
            )}
            <button
              type="submit"
              disabled={verifying}
              className="w-full py-4 min-h-[48px] bg-burgundy text-white text-sm uppercase font-sans font-semibold tracking-wider hover:bg-ink transition-colors disabled:opacity-50"
            >
              {verifying ? 'Verifying...' : 'Open Save the Date Studio'}
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="magazine-page">
      <div className="editorial-grid w-full">
        {/* Header */}
        <div className="col-span-full border-b border-ink/20 pb-8 sm:pb-12 mb-8 sm:mb-12 flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-display font-bold text-[#8A6B2F] mb-3">
              Couple Communications
            </p>
            <h1 className="text-4xl sm:text-5xl font-serif text-ink leading-tight tracking-tight uppercase">
              Save the Date Dispatch
            </h1>
          </div>
          <p className="font-sans text-base text-ink/75 max-w-md leading-relaxed">
            Upload a CSV file or paste your guest email list to send personalized Save the Date cards to everyone invited.
          </p>
        </div>

        {/* Configuration Notice */}
        {(!emailConfigured || isTestSender) && (
          <div className="col-span-full mb-12 p-6 md:p-8 bg-cream border-2 border-ink flex items-start gap-4">
            <AlertCircle className="text-burgundy shrink-0 mt-1" size={22} />
            <div className="font-sans text-sm md:text-base text-ink/85 leading-relaxed space-y-1">
              {!emailConfigured ? (
                <>
                  <p className="font-bold text-burgundy">Email sending key not configured yet (`RESEND_API_KEY`)</p>
                  <p>
                    You can upload and organize your guest list and preview your Save the Date card here anytime. To actually send emails, add your <code className="bg-ink text-white px-1.5 py-0.5 text-xs">RESEND_API_KEY</code> in AI Studio&apos;s Secrets panel.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-burgundy">
                    Currently using Resend&apos;s test sender ({fromEmail})
                  </p>
                  <p>
                    Resend restricts <code className="bg-ink text-white px-1.5 py-0.5 text-xs">onboarding@resend.dev</code> so it can only deliver to your own Resend account email. To email all your guests, verify a domain in Resend and set <code className="bg-ink text-white px-1.5 py-0.5 text-xs">RESEND_FROM_EMAIL</code> in Secrets.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 1: Upload / Paste Emails */}
        <div className="col-span-full lg:col-span-6 space-y-8 mb-12 lg:mb-0">
          <div className="border-2 border-ink bg-cream p-8 md:p-10 shadow-[12px_12px_0px_0px_rgba(231,212,181,0.5)]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/15 pb-5 mb-6">
              <div>
                <span className="text-xs font-display font-black uppercase tracking-[0.4em] text-burgundy block mb-1">
                  Step 01
                </span>
                <h2 className="text-2xl md:text-3xl font-serif uppercase text-ink">
                  Upload Guest Emails
                </h2>
              </div>
              <button
                type="button"
                onClick={downloadTemplate}
                className="inline-flex items-center gap-2 px-4 py-2 border border-ink bg-white text-xs font-display font-bold uppercase tracking-wider hover:bg-gold transition-colors"
              >
                <Download size={14} />
                Sample CSV
              </button>
            </div>

            {/* File Upload Box */}
            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,text/csv,text/plain"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-ink/40 hover:border-burgundy bg-white p-8 flex flex-col items-center justify-center gap-3 text-center transition-colors cursor-pointer"
              >
                <Upload size={28} className="text-burgundy" />
                <span className="font-sans font-semibold text-base text-ink">
                  Click to upload a CSV or TXT file
                </span>
                <span className="font-sans text-xs text-ink/60">
                  Works with Excel / Google Sheets CSV exports (Name &amp; Email or Email-only)
                </span>
              </button>
            </div>

            {/* Paste List */}
            <div className="space-y-3 mb-6">
              <label className="block font-sans text-sm font-semibold text-ink">
                Or paste names &amp; emails (one per line)
              </label>
              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                rows={5}
                placeholder={'John Smith, john@example.com\nJane Doe, jane@example.com\nguest@example.com'}
                className="w-full p-4 bg-white border-2 border-ink/30 focus:border-ink outline-none font-sans text-sm leading-relaxed"
              />
              <button
                type="button"
                onClick={handleImportText}
                disabled={!rawInput.trim()}
                className="w-full py-3.5 bg-ink text-white text-xs uppercase font-display font-black tracking-[0.35em] hover:bg-gold hover:text-ink transition-colors disabled:opacity-40"
              >
                Add Pasted Emails to List
              </button>
            </div>

            {/* Parse Feedback */}
            {parseFeedback && (
              <div className="mb-6 p-4 bg-white border border-burgundy font-sans text-sm space-y-1">
                <p className="font-semibold text-ink">
                  Added {parseFeedback.added} unique email{parseFeedback.added === 1 ? '' : 's'}
                  {parseFeedback.duplicates > 0
                    ? ` (${parseFeedback.duplicates} duplicate email${parseFeedback.duplicates === 1 ? '' : 's'} merged into one send per address)`
                    : ''}
                  .
                </p>
                {parseFeedback.invalid.length > 0 && (
                  <p className="text-burgundy text-xs">
                    Skipped {parseFeedback.invalid.length} unrecognized line{parseFeedback.invalid.length === 1 ? '' : 's'}:{' '}
                    {parseFeedback.invalid.slice(0, 3).join(' | ')}
                    {parseFeedback.invalid.length > 3 ? ' ...' : ''}
                  </p>
                )}
              </div>
            )}

            {/* Add Single Guest */}
            <form onSubmit={handleAddManual} className="pt-5 border-t border-ink/15 space-y-3">
              <label className="block font-sans text-sm font-semibold text-ink">
                Add one guest manually
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Guest Name (optional)"
                  className="px-3 py-2.5 bg-white border border-ink/30 focus:border-ink outline-none font-sans text-sm"
                />
                <input
                  type="email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="guest@email.com"
                  className="px-3 py-2.5 bg-white border border-ink/30 focus:border-ink outline-none font-sans text-sm"
                />
              </div>
              {manualError && <p className="text-xs font-sans text-burgundy font-semibold">{manualError}</p>}
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-ink bg-white text-xs font-display font-black uppercase tracking-widest hover:bg-ink hover:text-white transition-colors"
              >
                <Plus size={14} />
                Add Guest
              </button>
            </form>
          </div>

          {/* Recipient Roster */}
          <div className="border-2 border-ink bg-white p-8">
            <div className="flex items-center justify-between gap-4 border-b border-ink/15 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <Users size={18} className="text-burgundy" />
                <div>
                  <h3 className="text-xl font-serif uppercase text-ink">
                    Recipient List ({recipients.length})
                  </h3>
                  {recipients.length > 0 && (
                    <p className="text-xs font-sans text-ink/60 tabular-nums">
                      {recipients.reduce((sum, r) => sum + (r.partySize || 1), 0)} total guests across{' '}
                      {recipients.length} {recipients.length === 1 ? 'party' : 'parties'}
                    </p>
                  )}
                </div>
              </div>
              {recipients.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setRecipients([]);
                    setParseFeedback(null);
                    setDeliverySummary(null);
                  }}
                  className="text-xs font-display font-bold uppercase tracking-wider text-burgundy hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {recipients.length === 0 ? (
              <p className="font-sans text-sm text-ink/50 py-6 text-center">
                No guests added yet. Upload a CSV (with optional Party Size column) or paste email addresses above to get started.
              </p>
            ) : (
              <div className="max-h-80 overflow-y-auto divide-y divide-ink/10">
                {recipients.map((r) => (
                  <div key={r.id} className="py-2.5 flex items-center justify-between gap-3 font-sans text-sm">
                    <div className="min-w-0 flex-1 space-y-1">
                      <input
                        type="text"
                        value={r.name}
                        onChange={(e) => updateRecipientName(r.id, e.target.value)}
                        placeholder="Guest or Party Name (e.g. John & Jane Smith)"
                        aria-label={`Guest name for ${r.email}`}
                        className="w-full font-semibold text-ink bg-transparent border-b border-transparent focus:border-gold hover:border-ink/20 outline-none py-0.5 text-sm"
                      />
                      <p className="text-ink/70 text-xs truncate">{r.email}</p>
                    </div>
                    <select
                      value={r.partySize}
                      onChange={(e) => updateRecipientPartySize(r.id, parseInt(e.target.value, 10))}
                      aria-label={`Party size for ${r.email}`}
                      className="px-2 py-1.5 bg-cream border border-ink/25 text-xs font-semibold text-ink shrink-0 tabular-nums"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeRecipient(r.id)}
                      aria-label={`Remove ${r.email}`}
                      className="p-1.5 text-ink/40 hover:text-burgundy transition-colors shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step 2 & 3: Customize, Preview & Send */}
        <div className="col-span-full lg:col-span-6 space-y-8">
          <div className="border-2 border-ink bg-white p-8 md:p-10 shadow-[12px_12px_0px_0px_rgba(96,0,16,0.12)]">
            <div className="border-b border-ink/15 pb-5 mb-6">
              <span className="text-xs font-display font-black uppercase tracking-[0.4em] text-burgundy block mb-1">
                Step 02
              </span>
              <h2 className="text-2xl md:text-3xl font-serif uppercase text-ink">
                Customize &amp; Preview Email
              </h2>
            </div>

            <div className="space-y-4 mb-8 font-sans">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Email Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-ink/30 focus:border-ink outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Personal Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 border border-ink/30 focus:border-ink outline-none text-sm leading-relaxed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Wedding Website Link</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 border border-ink/30 focus:border-ink outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">
                  Availability Response Deadline
                </label>
                <input
                  type="text"
                  value={availabilityDeadline}
                  onChange={(e) => setAvailabilityDeadline(e.target.value)}
                  placeholder="e.g. January 31, 2027 (leave blank to hide)"
                  className="w-full px-3.5 py-2.5 border border-ink/30 focus:border-ink outline-none text-sm"
                />
                <p className="text-xs text-ink/60 mt-1">
                  Displayed in the email survey box and on the guest availability page. Clear this field to hide the deadline.
                </p>
              </div>
            </div>

            {/* Live Card Preview */}
            <div>
              <div className="flex items-center gap-2 text-xs font-display font-black uppercase tracking-[0.3em] text-ink/60 mb-3">
                <Eye size={14} />
                Live Email Preview
              </div>
              <div className="bg-cream p-5 border border-ink/20">
                <div className="bg-white border-2 border-ink p-6 md:p-8 text-center">
                  <p className="text-[10px] font-display font-black uppercase tracking-[0.4em] text-burgundy mb-2">
                    Save The Date
                  </p>
                  <h3 className="text-3xl font-serif uppercase text-ink">Jenneba &amp; Troy</h3>
                  <p className="font-script text-burgundy text-3xl sm:text-[32px] leading-snug mt-1.5 mb-5">
                    are getting married
                  </p>

                  <div className="text-left font-serif italic text-base text-ink space-y-3 mb-6">
                    <p>
                      Dear {recipients[0]?.name || 'Guest'},
                    </p>
                    <p className="leading-relaxed whitespace-pre-line">{message}</p>
                  </div>

                  <div className="mb-6 flex justify-center">
                    <img
                      src="/assets/aistudio/IMG_1284_cd807af0.JPG"
                      alt="Save the Date Flyer - Jenneba & Troy"
                      className="w-full max-w-[360px] mx-auto block h-auto border border-gold"
                    />
                  </div>

                  <div className="bg-burgundy text-white py-4 px-4 mb-6">
                    <p className="text-[10px] font-display font-bold uppercase tracking-[0.3em] text-gold mb-1">
                      Saturday, September 11, 2027
                    </p>
                    <p className="font-serif text-base">Leesburg, Virginia</p>
                  </div>

                  {/* Survey Preview */}
                  <div className="bg-cream border border-gold p-5 mb-6 text-center">
                    <p className="text-[10px] font-display font-bold uppercase tracking-[0.25em] text-[#8A6B2F] mb-1">
                      Quick Availability Check
                    </p>
                    <p className="font-serif text-lg text-ink mb-1.5">
                      Are you available on Saturday, September 11, 2027?
                    </p>
                    {availabilityDeadline.trim() && (
                      <p className="font-sans text-xs font-bold uppercase tracking-wider text-burgundy mb-2">
                        Please respond by {availabilityDeadline.trim()}
                      </p>
                    )}
                    <p className="font-sans text-xs text-ink/70 mb-4">
                      {(recipients[0]?.partySize ?? 1) > 1
                        ? 'Responding for more than one person? Tap an option below to confirm availability for each person in your party:'
                        : 'Tap an option below so we can get an early headcount (multi-person parties can confirm each guest on the next screen):'}
                    </p>
                    <div className="max-w-[260px] mx-auto space-y-2 text-[11px] font-sans font-bold uppercase tracking-wider">
                      <div className="py-2.5 px-3 bg-burgundy text-white border border-burgundy">
                        {(recipients[0]?.partySize ?? 1) > 1 ? 'Yes, Count Us In' : 'Yes, Count Me In'}
                      </div>
                      <div className="py-2.5 px-3 bg-white text-ink border border-ink">
                        Not Sure Yet
                      </div>
                      <div className="py-2.5 px-3 bg-white text-burgundy border border-[#8A6B2F]">
                        Unable to Attend
                      </div>
                    </div>
                  </div>

                  <span className="inline-block bg-ink text-white text-[10px] font-display font-black uppercase tracking-[0.3em] px-6 py-3">
                    Visit Wedding Website
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 03: Test & Send */}
          <div className="border-2 border-ink bg-burgundy text-white p-8 md:p-10">
            <span className="text-xs font-display font-black uppercase tracking-[0.4em] text-gold block mb-1">
              Step 03
            </span>
            <h2 className="text-2xl md:text-3xl font-serif uppercase text-white mb-6">
              Test &amp; Send
            </h2>

            {/* Send Test Email */}
            <form onSubmit={handleSendTest} className="pb-6 mb-6 border-b border-white/20 space-y-3 font-sans">
              <label className="block text-sm font-semibold text-gold">
                Send a test email to yourself first
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Your Name"
                  className="px-3 py-2.5 bg-white text-ink text-sm outline-none"
                />
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="px-3 py-2.5 bg-white text-ink text-sm outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={sendingTest || !emailConfigured}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-ink text-xs font-display font-black uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-40"
              >
                <Mail size={14} />
                {sendingTest ? 'Sending Test...' : 'Send Test Email'}
              </button>
              {!emailConfigured && (
                <p className="text-xs text-white/80">
                  Disabled: <code className="bg-black/30 px-1.5 py-0.5">RESEND_API_KEY</code> is not set in AI Studio Secrets yet.
                </p>
              )}
              {testStatus && (
                <p className={`text-sm font-medium ${testStatus.type === 'success' ? 'text-gold' : 'text-white underline'}`}>
                  {testStatus.text}
                </p>
              )}
            </form>

            {/* Bulk Send */}
            <div className="space-y-4 font-sans">
              {!confirmingBulk ? (
                <button
                  type="button"
                  disabled={recipients.length === 0 || sendingBulk || !emailConfigured}
                  onClick={() => setConfirmingBulk(true)}
                  className="w-full py-4 bg-gold text-ink text-xs font-display font-black uppercase tracking-[0.4em] hover:bg-white transition-colors flex items-center justify-center gap-3 disabled:opacity-40"
                >
                  <Send size={16} />
                  {sendingBulk
                    ? `Sending to ${recipients.length} Guests...`
                    : `Send Save the Dates (${recipients.length})`}
                </button>
              ) : (
                <div className="p-5 bg-black/30 border border-gold space-y-4">
                  <p className="text-sm leading-relaxed">
                    Ready to send Save the Date emails to{' '}
                    <strong className="text-gold">{recipients.length}</strong> recipient
                    {recipients.length === 1 ? '' : 's'}?
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleSendBulk}
                      className="px-6 py-3 bg-gold text-ink text-xs font-display font-black uppercase tracking-widest hover:bg-white transition-colors"
                    >
                      Confirm &amp; Send Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingBulk(false)}
                      className="px-6 py-3 border border-white/40 text-white text-xs font-display font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {bulkError && (
                <p className="text-sm bg-black/30 p-3 border border-gold text-white">{bulkError}</p>
              )}

              {deliverySummary && (
                <div className="bg-white text-ink p-5 border-2 border-ink space-y-3">
                  <div className="flex items-center gap-2 font-bold text-base">
                    <CheckCircle2 size={18} className="text-burgundy" />
                    <span>
                      Sent: {deliverySummary.sentCount} | Failed: {deliverySummary.failedCount}
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-ink/10 text-xs">
                    {deliverySummary.results.map((r, idx) => (
                      <div key={`${r.email}-${idx}`} className="py-2 flex items-start justify-between gap-3">
                        <span className="font-medium truncate">
                          {r.name ? `${r.name} (${r.email})` : r.email}
                        </span>
                        <span
                          className={`uppercase font-bold shrink-0 ${
                            r.status === 'sent' ? 'text-green-700' : 'text-burgundy'
                          }`}
                        >
                          {r.status === 'sent' ? 'Sent' : r.error || 'Failed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Availability Survey Responses Dashboard */}
        <div className="col-span-full mt-10">
          <div className="border-2 border-ink bg-white p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-ink/15 pb-6 mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-[0.25em] text-[#8A6B2F] mb-2">
                  <CalendarCheck size={16} className="text-burgundy" />
                  <span>Guest Headcount Tracker</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif uppercase text-ink">
                  Availability Survey Responses
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void fetchAvailabilityResponses(passcode)}
                  disabled={loadingResponses}
                  className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] border border-ink bg-cream text-xs font-sans font-semibold uppercase tracking-wider hover:bg-gold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw size={14} className={loadingResponses ? 'animate-spin' : ''} />
                  {loadingResponses ? 'Refreshing...' : 'Refresh'}
                </button>
                {availabilityResponses.length > 0 && (
                  <button
                    type="button"
                    onClick={exportResponsesCsv}
                    className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-ink text-white text-xs font-sans font-semibold uppercase tracking-wider hover:bg-burgundy transition-colors cursor-pointer"
                  >
                    <Download size={14} />
                    Export CSV
                  </button>
                )}
              </div>
            </div>

            {/* Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-cream border border-ink/15 p-4">
                <p className="text-xs font-sans uppercase tracking-wider text-ink/65 mb-1">Total Guests Replied</p>
                <p className="text-3xl font-serif text-ink tabular-nums">
                  {availabilityCounts.guestsTotal ?? availabilityCounts.total}
                </p>
                <p className="text-xs font-sans text-ink/60 mt-1 tabular-nums">
                  {availabilityCounts.total} {availabilityCounts.total === 1 ? 'party' : 'parties'}
                </p>
              </div>
              <div className="bg-cream border border-ink/15 p-4">
                <p className="text-xs font-sans uppercase tracking-wider text-burgundy font-semibold mb-1">
                  Guests Available
                </p>
                <p className="text-3xl font-serif text-burgundy tabular-nums">
                  {availabilityCounts.guestsYes ?? availabilityCounts.yes}
                </p>
                <p className="text-xs font-sans text-ink/60 mt-1 tabular-nums">
                  {availabilityCounts.yes} {availabilityCounts.yes === 1 ? 'party' : 'parties'}
                </p>
              </div>
              <div className="bg-cream border border-ink/15 p-4">
                <p className="text-xs font-sans uppercase tracking-wider text-[#8A6B2F] font-semibold mb-1">
                  Not Sure Yet
                </p>
                <p className="text-3xl font-serif text-ink tabular-nums">
                  {availabilityCounts.guestsMaybe ?? availabilityCounts.maybe}
                </p>
                <p className="text-xs font-sans text-ink/60 mt-1 tabular-nums">
                  {availabilityCounts.maybe} {availabilityCounts.maybe === 1 ? 'party' : 'parties'}
                </p>
              </div>
              <div className="bg-cream border border-ink/15 p-4">
                <p className="text-xs font-sans uppercase tracking-wider text-ink/65 mb-1">
                  Unable to Attend
                </p>
                <p className="text-3xl font-serif text-ink tabular-nums">
                  {availabilityCounts.guestsNo ?? availabilityCounts.no}
                </p>
                <p className="text-xs font-sans text-ink/60 mt-1 tabular-nums">
                  {availabilityCounts.no} {availabilityCounts.no === 1 ? 'party' : 'parties'}
                </p>
              </div>
            </div>

            {responsesError && (
              <div className="mb-6 p-4 bg-cream border border-burgundy text-sm font-sans text-burgundy font-semibold">
                {responsesError}
              </div>
            )}

            {availabilityResponses.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-ink/25 bg-cream/60 px-4">
                <p className="font-sans text-base text-ink/75 mb-1">No survey responses yet.</p>
                <p className="font-sans text-sm text-ink/55">
                  When guests tap one of the availability buttons in their Save the Date email and confirm for themselves or their party, their answers will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-ink/15">
                <table className="w-full text-left border-collapse font-sans text-sm">
                  <thead>
                    <tr className="bg-cream border-b border-ink/15 text-xs uppercase tracking-wider text-ink/70">
                      <th className="py-3 px-4 font-semibold">Party / Guest</th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">Headcount</th>
                      <th className="py-3 px-4 font-semibold">Availability</th>
                      <th className="py-3 px-4 font-semibold">Note</th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {availabilityResponses.map((r) => {
                      const statusLabel = (st: 'yes' | 'maybe' | 'no') =>
                        st === 'yes'
                          ? 'Yes, Available'
                          : st === 'maybe'
                          ? 'Not Sure Yet'
                          : 'Unable to Attend';
                      const statusColor = (st: 'yes' | 'maybe' | 'no') =>
                        st === 'yes'
                          ? 'text-burgundy font-bold'
                          : st === 'maybe'
                          ? 'text-[#8A6B2F] font-semibold'
                          : 'text-ink/70 font-medium';
                      const formattedDate = new Date(r.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });
                      const partySize = r.partySize ?? 1;
                      const availCount = r.availableCount ?? (r.status === 'yes' ? partySize : 0);

                      return (
                        <tr key={r.id} className="hover:bg-cream/50">
                          <td className="py-3.5 px-4 align-top">
                            <p className="font-semibold text-ink">{r.name}</p>
                            {r.email && <p className="text-xs text-ink/60 break-all">{r.email}</p>}
                          </td>
                          <td className="py-3.5 px-4 align-top whitespace-nowrap tabular-nums text-ink font-semibold">
                            {availCount} / {partySize}
                          </td>
                          <td className="py-3.5 px-4 align-top">
                            {r.partyMembers && r.partyMembers.length > 1 ? (
                              <ul className="space-y-1 text-xs">
                                {r.partyMembers.map((m, idx) => (
                                  <li key={`${r.id}-m-${idx}`} className="flex flex-wrap gap-x-1.5">
                                    <span className="font-semibold text-ink">{m.name}:</span>
                                    <span className={statusColor(m.status)}>
                                      {statusLabel(m.status)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className={`whitespace-nowrap ${statusColor(r.status)}`}>
                                {statusLabel(r.status)}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 align-top text-ink/80 max-w-xs">
                            {r.note ? r.note : <span className="text-ink/35">—</span>}
                          </td>
                          <td className="py-3.5 px-4 align-top text-xs text-ink/60 whitespace-nowrap tabular-nums">
                            {formattedDate}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
