import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let resend: Resend | null = null;

function getResend() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is required");
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

const DEFAULT_FROM_EMAIL = "Jenneba & Troy <onboarding@resend.dev>";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getAdminPasscode(): string {
  return process.env.SAVE_THE_DATE_PASSCODE || "jennebatroy2027";
}

const FLYER_RELATIVE_PATH = path.join("public", "assets", "aistudio", "IMG_1284_cd807af0.JPG");

function getSaveTheDateFlyerBuffer(): Buffer | null {
  const flyerPath = path.join(process.cwd(), FLYER_RELATIVE_PATH);
  if (fs.existsSync(flyerPath)) {
    return fs.readFileSync(flyerPath);
  }
  return null;
}

type AvailabilityStatus = "yes" | "maybe" | "no";

interface PartyMemberAvailability {
  name: string;
  status: AvailabilityStatus;
}

interface AvailabilityRecord {
  id: string;
  name: string;
  email: string;
  status: AvailabilityStatus;
  partySize: number;
  availableCount: number;
  maybeCount: number;
  noCount: number;
  partyMembers?: PartyMemberAvailability[];
  note: string;
  createdAt: string;
  updatedAt: string;
}

function inferPartySizeFromName(name: string): number {
  const trimmed = name.trim();
  if (!trimmed) return 1;
  const parts = trimmed
    .split(/\s*&\s*|\s+and\s+|\s*\+\s*/i)
    .map((p) => p.trim())
    .filter(Boolean);
  return Math.max(1, Math.min(12, parts.length));
}

function normalizeAvailabilityRecord(raw: Partial<AvailabilityRecord>): AvailabilityRecord {
  const status: AvailabilityStatus =
    raw.status === "yes" || raw.status === "maybe" || raw.status === "no" ? raw.status : "yes";
  const members = Array.isArray(raw.partyMembers)
    ? raw.partyMembers
        .filter(
          (m): m is PartyMemberAvailability =>
            Boolean(m) &&
            typeof m.name === "string" &&
            (m.status === "yes" || m.status === "maybe" || m.status === "no")
        )
        .map((m) => ({ name: m.name.trim(), status: m.status }))
    : undefined;

  if (members && members.length > 0) {
    const availableCount = members.filter((m) => m.status === "yes").length;
    const maybeCount = members.filter((m) => m.status === "maybe").length;
    const noCount = members.filter((m) => m.status === "no").length;
    const derivedStatus: AvailabilityStatus =
      availableCount > 0 ? "yes" : maybeCount > 0 ? "maybe" : "no";

    return {
      id: String(raw.id || `${Date.now()}`),
      name: String(raw.name || members.map((m) => m.name).join(" & ")),
      email: String(raw.email || ""),
      status: derivedStatus,
      partySize: members.length,
      availableCount,
      maybeCount,
      noCount,
      partyMembers: members,
      note: String(raw.note || ""),
      createdAt: String(raw.createdAt || new Date().toISOString()),
      updatedAt: String(raw.updatedAt || new Date().toISOString()),
    };
  }

  const partySize =
    typeof raw.partySize === "number" && Number.isFinite(raw.partySize)
      ? Math.max(1, Math.min(12, Math.round(raw.partySize)))
      : 1;
  const availableCount =
    typeof raw.availableCount === "number" ? raw.availableCount : status === "yes" ? partySize : 0;
  const maybeCount =
    typeof raw.maybeCount === "number" ? raw.maybeCount : status === "maybe" ? partySize : 0;
  const noCount =
    typeof raw.noCount === "number" ? raw.noCount : status === "no" ? partySize : 0;

  return {
    id: String(raw.id || `${Date.now()}`),
    name: String(raw.name || "Guest"),
    email: String(raw.email || ""),
    status,
    partySize,
    availableCount,
    maybeCount,
    noCount,
    note: String(raw.note || ""),
    createdAt: String(raw.createdAt || new Date().toISOString()),
    updatedAt: String(raw.updatedAt || new Date().toISOString()),
  };
}

const AVAILABILITY_FILE = path.join(process.cwd(), "data", "availability-responses.json");

function readAvailabilityResponses(): AvailabilityRecord[] {
  try {
    if (!fs.existsSync(AVAILABILITY_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(AVAILABILITY_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to read availability responses:", err);
    return [];
  }
}

function writeAvailabilityResponses(records: AvailabilityRecord[]): void {
  const dir = path.dirname(AVAILABILITY_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(AVAILABILITY_FILE, JSON.stringify(records, null, 2), "utf8");
}

function buildSaveTheDateHtml({
  guestName,
  guestEmail,
  partySize,
  message,
  websiteUrl,
  hasFlyer,
  availabilityDeadline,
}: {
  guestName?: string;
  guestEmail?: string;
  partySize?: number;
  message: string;
  websiteUrl: string;
  hasFlyer: boolean;
  availabilityDeadline?: string;
}): string {
  const cleanName = guestName?.trim() || "";
  const cleanEmail = guestEmail?.trim() || "";
  const resolvedPartySize =
    typeof partySize === "number" && Number.isFinite(partySize) && partySize >= 1
      ? Math.min(12, Math.round(partySize))
      : inferPartySizeFromName(cleanName);
  const isMultiPersonParty =
    resolvedPartySize > 1 || /\b(family|household|guests)\b/i.test(cleanName);
  const safeName = cleanName ? escapeHtml(cleanName) : "";
  const greeting = safeName ? `Dear ${safeName},` : "Dear Guest,";
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
  const cleanDeadline =
    availabilityDeadline === undefined ? "January 31, 2027" : availabilityDeadline.trim();
  const safeDeadline = cleanDeadline ? escapeHtml(cleanDeadline) : "";
  const normalizedBaseUrl = /^https?:\/\//i.test(websiteUrl.trim())
    ? websiteUrl.trim().replace(/\/+$/, "")
    : "https://theagardwedding.com";
  const safeUrl = escapeHtml(normalizedBaseUrl);

  const buildSurveyUrl = (choice: AvailabilityStatus): string => {
    const params = new URLSearchParams({ response: choice });
    if (cleanName) params.set("name", cleanName);
    if (cleanEmail) params.set("email", cleanEmail);
    if (resolvedPartySize > 1) params.set("party", String(resolvedPartySize));
    params.set("deadline", cleanDeadline);
    return escapeHtml(`${normalizedBaseUrl}/availability?${params.toString()}`);
  };

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>Save the Date: Jenneba &amp; Troy</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
      body, table, td, a {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      table, td {
        border-collapse: collapse !important;
      }
      img {
        -ms-interpolation-mode: bicubic;
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
      }
      @media only screen and (max-width: 600px) {
        .email-outer {
          padding: 12px 8px !important;
        }
        .email-card {
          padding: 24px 16px !important;
          border-width: 2px !important;
        }
        .header-block {
          padding-bottom: 18px !important;
          margin-bottom: 20px !important;
        }
        .hero-title {
          font-size: 28px !important;
          line-height: 1.15 !important;
        }
        .script-subtitle {
          font-size: 28px !important;
          line-height: 1.25 !important;
        }
        .greeting-text {
          font-size: 19px !important;
        }
        .body-copy {
          font-size: 17px !important;
          line-height: 1.7 !important;
        }
        .flyer-img {
          width: 100% !important;
          max-width: 480px !important;
          height: auto !important;
        }
        .date-box {
          padding: 18px 14px !important;
          margin-bottom: 22px !important;
        }
        .date-location {
          font-size: 18px !important;
        }
        .survey-box {
          padding: 20px 14px !important;
        }
        .cta-btn {
          display: block !important;
          width: 100% !important;
          box-sizing: border-box !important;
          padding: 16px 18px !important;
          font-size: 13px !important;
          letter-spacing: 2px !important;
        }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #FAFAFA; font-family: 'Georgia', serif; color: #1A1A1A;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAFAFA; width: 100%;">
      <tr>
        <td align="center" class="email-outer" style="padding: 28px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border: 3px solid #000000;">
            <tr>
              <td class="email-card" style="padding: 36px 28px;">
                <!-- Header -->
                <div class="header-block" style="text-align: center; border-bottom: 2px solid #E7D4B5; padding-bottom: 22px; margin-bottom: 24px;">
                  <p style="margin: 0 0 8px 0; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; color: #600010;">
                    Save The Date
                  </p>
                  <h1 class="hero-title" style="margin: 0; font-family: 'Georgia', serif; font-size: 36px; line-height: 1.15; font-weight: 400; letter-spacing: 1px; color: #000000; text-transform: uppercase;">
                    Jenneba &amp; Troy
                  </h1>
                  <p class="script-subtitle" style="margin: 8px 0 0 0; font-family: 'Great Vibes', 'Snell Roundhand', 'Apple Chancery', 'Brush Script MT', 'Segoe Script', Georgia, serif; font-size: 32px; line-height: 1.25; font-weight: 400; color: #600010;">
                    are getting married
                  </p>
                </div>

                <!-- Personalized Greeting & Message -->
                <div style="text-align: left; margin-bottom: 24px;">
                  <p class="greeting-text" style="font-family: 'Georgia', serif; font-size: 18px; font-style: italic; margin: 0 0 12px 0; color: #000000;">
                    ${greeting}
                  </p>
                  <p class="body-copy" style="font-family: 'Georgia', serif; font-size: 17px; font-style: italic; line-height: 1.7; color: #1A1A1A; margin: 0;">
                    ${safeMessage}
                  </p>
                </div>

                <!-- Centered Flyer -->
                ${
                  hasFlyer
                    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 0 0 24px 0;">
                        <tr>
                          <td align="center" style="padding: 0; text-align: center;">
                            <img
                              src="cid:save-the-date-flyer"
                              alt="Save the Date - Jenneba &amp; Troy | 09.11.27 | Leesburg, Virginia"
                              width="480"
                              class="flyer-img"
                              style="display: block; width: 100%; max-width: 480px; height: auto; margin: 0 auto; border: 1px solid #E7D4B5; box-sizing: border-box;"
                            />
                          </td>
                        </tr>
                      </table>`
                    : ""
                }

                <!-- Date & Location Banner -->
                <div class="date-box" style="background-color: #600010; color: #FFFFFF; padding: 22px 18px; text-align: center; margin-bottom: 24px;">
                  <p style="margin: 0 0 6px 0; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #E7D4B5;">
                    Saturday, September 11, 2027
                  </p>
                  <p class="date-location" style="margin: 0; font-family: 'Georgia', serif; font-size: 20px; letter-spacing: 1px; color: #FFFFFF;">
                    Leesburg, Virginia
                  </p>
                </div>

                <!-- Quick Availability Survey -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; background-color: #FAF8F5; border: 1px solid #E7D4B5; margin: 0 0 26px 0;">
                  <tr>
                    <td class="survey-box" align="center" style="padding: 24px 20px; text-align: center;">
                      <p style="margin: 0 0 6px 0; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #8A6B2F;">
                        Quick Availability Check
                      </p>
                      <h2 style="margin: 0 0 8px 0; font-family: 'Georgia', serif; font-size: 21px; line-height: 1.3; font-weight: 400; color: #111111;">
                        Are you available on Saturday, September 11, 2027?
                      </h2>
                      ${
                        safeDeadline
                          ? `<p style="margin: 0 0 10px 0; font-family: Arial, sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #600010;">
                              Please respond by ${safeDeadline}
                            </p>`
                          : ""
                      }
                      <p style="margin: 0 0 18px 0; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #444444;">
                        ${
                          isMultiPersonParty
                            ? "Responding for more than one person? Tap an option below to confirm availability for each person in your party (formal invitation &amp; RSVP to follow):"
                            : "Tap an option below so we can get an early headcount&mdash;if you are responding for a couple or household, you can add each person on the next screen (formal invitation &amp; RSVP to follow):"
                        }
                      </p>

                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 360px; width: 100%; margin: 0 auto;">
                        <tr>
                          <td align="center" style="padding: 0 0 10px 0;">
                            <a
                              href="${buildSurveyUrl("yes")}"
                              style="display: block; width: 100%; box-sizing: border-box; background-color: #600010; color: #FFFFFF; text-decoration: none; font-family: Arial, sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 14px 16px; border: 2px solid #600010; text-align: center;"
                            >
                              ${isMultiPersonParty ? "Yes, Count Us In" : "Yes, Count Me In"}
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding: 0 0 10px 0;">
                            <a
                              href="${buildSurveyUrl("maybe")}"
                              style="display: block; width: 100%; box-sizing: border-box; background-color: #FFFFFF; color: #111111; text-decoration: none; font-family: Arial, sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 14px 16px; border: 1.5px solid #111111; text-align: center;"
                            >
                              Not Sure Yet
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding: 0;">
                            <a
                              href="${buildSurveyUrl("no")}"
                              style="display: block; width: 100%; box-sizing: border-box; background-color: #FFFFFF; color: #600010; text-decoration: none; font-family: Arial, sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 14px 16px; border: 1.5px solid #8A6B2F; text-align: center;"
                            >
                              Unable to Attend
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Mobile-Friendly Full-Width CTA -->
                <div style="text-align: center; margin: 24px 0 22px 0;">
                  <a
                    href="${safeUrl}"
                    class="cta-btn"
                    style="display: inline-block; background-color: #000000; color: #FFFFFF; text-decoration: none; font-family: Arial, sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; padding: 16px 32px; border: 2px solid #000000; text-align: center;"
                  >
                    Visit Wedding Website
                  </a>
                </div>

                <!-- Footer -->
                <div style="border-top: 1px solid #E7D4B5; padding-top: 18px; margin-top: 24px; text-align: center;">
                  <p style="margin: 0; font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: #600010; line-height: 1.5;">
                    Formal Invitation to Follow &bull; #CaughtOffAgard
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "2mb" }));

  // Verify Save the Date admin passcode & return Resend configuration status
  app.post("/api/save-the-dates/verify", (req, res) => {
    const { passcode } = req.body ?? {};
    if (typeof passcode !== "string" || passcode.trim().toLowerCase() !== getAdminPasscode().toLowerCase()) {
      return res.status(401).json({ success: false, message: "Incorrect clearance key." });
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;
    const isTestSender = fromEmail.includes("onboarding@resend.dev");

    return res.status(200).json({
      success: true,
      emailConfigured: Boolean(process.env.RESEND_API_KEY),
      fromEmail,
      isTestSender,
    });
  });

  // Fetch recorded availability survey responses for couple
  app.post("/api/save-the-dates/responses", (req, res) => {
    const { passcode } = req.body ?? {};
    if (typeof passcode !== "string" || passcode.trim().toLowerCase() !== getAdminPasscode().toLowerCase()) {
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid clearance key." });
    }

    const responses = readAvailabilityResponses()
      .map((r) => normalizeAvailabilityRecord(r))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    const counts = {
      yes: responses.filter((r) => r.status === "yes").length,
      maybe: responses.filter((r) => r.status === "maybe").length,
      no: responses.filter((r) => r.status === "no").length,
      total: responses.length,
      guestsYes: responses.reduce((sum, r) => sum + r.availableCount, 0),
      guestsMaybe: responses.reduce((sum, r) => sum + r.maybeCount, 0),
      guestsNo: responses.reduce((sum, r) => sum + r.noCount, 0),
      guestsTotal: responses.reduce((sum, r) => sum + r.partySize, 0),
    };

    return res.status(200).json({ success: true, responses, counts });
  });

  // Public endpoint for guest quick availability submission (supports single guests & multi-person parties)
  app.post("/api/availability", async (req, res) => {
    const { name, email, status, note, partySize, partyMembers } = req.body ?? {};

    const cleanEmail = typeof email === "string" ? email.trim().slice(0, 160) : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (cleanEmail && !emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }

    const cleanNote = typeof note === "string" ? note.trim().slice(0, 500) : "";

    let normalizedMembers: PartyMemberAvailability[] | undefined;
    if (Array.isArray(partyMembers) && partyMembers.length > 0) {
      normalizedMembers = [];
      for (const rawMember of partyMembers.slice(0, 12)) {
        const mName = typeof rawMember?.name === "string" ? rawMember.name.trim().slice(0, 100) : "";
        const mStatus = rawMember?.status;
        if (!mName) {
          return res.status(400).json({
            success: false,
            message: "Please enter a name for each person in your party.",
          });
        }
        if (mStatus !== "yes" && mStatus !== "maybe" && mStatus !== "no") {
          return res.status(400).json({
            success: false,
            message: "Please select an availability option for each person in your party.",
          });
        }
        normalizedMembers.push({ name: mName, status: mStatus });
      }
    }

    let cleanName = typeof name === "string" ? name.trim().slice(0, 160) : "";
    let resolvedStatus: AvailabilityStatus;
    let resolvedPartySize: number;
    let availableCount: number;
    let maybeCount: number;
    let noCount: number;

    if (normalizedMembers && normalizedMembers.length > 0) {
      if (!cleanName) {
        cleanName = normalizedMembers.map((m) => m.name).join(" & ").slice(0, 160);
      }
      resolvedPartySize = normalizedMembers.length;
      availableCount = normalizedMembers.filter((m) => m.status === "yes").length;
      maybeCount = normalizedMembers.filter((m) => m.status === "maybe").length;
      noCount = normalizedMembers.filter((m) => m.status === "no").length;
      resolvedStatus = availableCount > 0 ? "yes" : maybeCount > 0 ? "maybe" : "no";
    } else {
      if (status !== "yes" && status !== "maybe" && status !== "no") {
        return res.status(400).json({ success: false, message: "Please select your availability." });
      }
      if (!cleanName) {
        return res.status(400).json({ success: false, message: "Please enter your full name." });
      }
      resolvedStatus = status;
      resolvedPartySize =
        typeof partySize === "number" && Number.isFinite(partySize)
          ? Math.max(1, Math.min(12, Math.round(partySize)))
          : 1;
      availableCount = resolvedStatus === "yes" ? resolvedPartySize : 0;
      maybeCount = resolvedStatus === "maybe" ? resolvedPartySize : 0;
      noCount = resolvedStatus === "no" ? resolvedPartySize : 0;
    }

    const now = new Date().toISOString();
    const records = readAvailabilityResponses().map((r) => normalizeAvailabilityRecord(r));
    let savedRecord: AvailabilityRecord;

    const existingIdx = cleanEmail
      ? records.findIndex((r) => r.email && r.email.toLowerCase() === cleanEmail.toLowerCase())
      : -1;

    if (existingIdx !== -1) {
      savedRecord = {
        ...records[existingIdx],
        name: cleanName,
        email: cleanEmail,
        status: resolvedStatus,
        partySize: resolvedPartySize,
        availableCount,
        maybeCount,
        noCount,
        partyMembers: normalizedMembers,
        note: cleanNote,
        updatedAt: now,
      };
      records[existingIdx] = savedRecord;
    } else {
      savedRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: cleanName,
        email: cleanEmail,
        status: resolvedStatus,
        partySize: resolvedPartySize,
        availableCount,
        maybeCount,
        noCount,
        partyMembers: normalizedMembers,
        note: cleanNote,
        createdAt: now,
        updatedAt: now,
      };
      records.push(savedRecord);
    }

    try {
      writeAvailabilityResponses(records);
    } catch (err) {
      console.error("Error writing availability responses:", err);
      return res.status(500).json({ success: false, message: "Unable to save your response right now." });
    }

    // Optional non-blocking notification email to couple
    if (process.env.RESEND_API_KEY) {
      const notifyEmail = process.env.NOTIFY_EMAIL || "tjagard90@gmail.com";
      const statusLabels: Record<AvailabilityStatus, string> = {
        yes: "Yes, Available (Sept 11, 2027)",
        maybe: "Not Sure Yet",
        no: "Unable to Attend",
      };
      const membersHtml =
        normalizedMembers && normalizedMembers.length > 0
          ? `<p><strong>Party Breakdown (${resolvedPartySize} ${resolvedPartySize === 1 ? "person" : "people"}):</strong></p>
             <ul style="margin: 4px 0 12px 0; padding-left: 20px;">
               ${normalizedMembers
                 .map(
                   (m) =>
                     `<li>${escapeHtml(m.name)} &mdash; <strong>${escapeHtml(statusLabels[m.status])}</strong></li>`
                 )
                 .join("")}
             </ul>`
          : `<p><strong>Response:</strong> ${escapeHtml(statusLabels[resolvedStatus])} (${resolvedPartySize} ${resolvedPartySize === 1 ? "guest" : "guests"})</p>`;

      try {
        const resendClient = getResend();
        await resendClient.emails.send({
          from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL,
          to: notifyEmail,
          subject: `Availability Check: ${cleanName} (${availableCount}/${resolvedPartySize} Available)`,
          html: `<div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6;">
            <h2 style="font-family: Georgia, serif; color: #600010;">Save the Date Availability Update</h2>
            <p><strong>Party:</strong> ${escapeHtml(cleanName)}</p>
            ${cleanEmail ? `<p><strong>Email:</strong> ${escapeHtml(cleanEmail)}</p>` : ""}
            ${membersHtml}
            ${cleanNote ? `<p><strong>Note:</strong> ${escapeHtml(cleanNote)}</p>` : ""}
          </div>`,
        });
      } catch (notifyErr) {
        console.warn("Non-blocking availability notification skipped:", notifyErr);
      }
    }

    return res.status(200).json({
      success: true,
      record: savedRecord,
    });
  });

  // Send Save the Date emails in bulk or as a single test
  app.post("/api/save-the-dates/send", async (req, res) => {
    const { passcode, recipients, subject, message, websiteUrl, availabilityDeadline } = req.body ?? {};

    if (typeof passcode !== "string" || passcode.trim().toLowerCase() !== getAdminPasscode().toLowerCase()) {
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid clearance key." });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(400).json({
        success: false,
        message: "RESEND_API_KEY is not configured. Add it in your AI Studio Secrets panel before sending emails.",
      });
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ success: false, message: "Please provide at least one recipient." });
    }

    if (recipients.length > 500) {
      return res.status(400).json({ success: false, message: "Please send in batches of 500 or fewer recipients." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanSubject = typeof subject === "string" && subject.trim()
      ? subject.trim()
      : "Save the Date: Jenneba & Troy | September 11, 2027";
    const cleanMessage = typeof message === "string" && message.trim()
      ? message.trim()
      : 'We\u2019re saying "I do"! We couldn\u2019t be more excited to invite you to celebrate our love story as we tie the knot on September 11, 2027, in Leesburg, Virginia. Save the date, bring your dancing shoes, and visit our wedding website for travel and hotel details. Formal invitation to follow!';
    const cleanWebsiteUrl = typeof websiteUrl === "string" && websiteUrl.trim()
      ? websiteUrl.trim()
      : process.env.APP_URL || "https://theagardwedding.com";
    const cleanDeadline =
      typeof availabilityDeadline === "string"
        ? availabilityDeadline.trim().slice(0, 80)
        : "January 31, 2027";

    const fromEmail = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;
    const resendClient = getResend();
    const flyerBuffer = getSaveTheDateFlyerBuffer();
    const attachments = flyerBuffer
      ? [
          {
            content: flyerBuffer,
            filename: "save-the-date-flyer.jpg",
            contentType: "image/jpeg",
            contentId: "save-the-date-flyer",
          },
        ]
      : undefined;

    const results: Array<{ email: string; name: string; status: "sent" | "failed"; error?: string }> = [];

    // Guarantee strictly one email sent per unique email address, combining names & party size if shared
    const dedupedRecipients: Array<{ email: string; name: string; partySize: number }> = [];
    const seenEmailIndex = new Map<string, number>();

    for (const rawItem of recipients) {
      const item = rawItem ?? {};
      const email = typeof item.email === "string" ? item.email.trim() : "";
      const name = typeof item.name === "string" ? item.name.trim() : "";
      const explicitPartySize =
        typeof item.partySize === "number" && Number.isFinite(item.partySize) && item.partySize >= 1
          ? Math.min(12, Math.round(item.partySize))
          : inferPartySizeFromName(name);

      if (!emailRegex.test(email)) {
        results.push({ email: email || "(empty)", name, status: "failed", error: "Invalid email address" });
        continue;
      }

      const key = email.toLowerCase();
      const existingIdx = seenEmailIndex.get(key);
      if (existingIdx !== undefined) {
        const existingName = dedupedRecipients[existingIdx].name;
        if (name && existingName) {
          const existingParts = existingName
            .split(/\s*&\s*|\s+and\s+/i)
            .map((p) => p.trim().toLowerCase());
          if (!existingParts.includes(name.toLowerCase())) {
            dedupedRecipients[existingIdx].name = `${existingName} & ${name}`;
            dedupedRecipients[existingIdx].partySize = Math.min(
              12,
              dedupedRecipients[existingIdx].partySize + explicitPartySize
            );
          }
        } else if (name && !existingName) {
          dedupedRecipients[existingIdx].name = name;
          dedupedRecipients[existingIdx].partySize = Math.max(
            dedupedRecipients[existingIdx].partySize,
            explicitPartySize
          );
        }
      } else {
        seenEmailIndex.set(key, dedupedRecipients.length);
        dedupedRecipients.push({ email, name, partySize: explicitPartySize });
      }
    }

    for (let i = 0; i < dedupedRecipients.length; i++) {
      const { email, name, partySize } = dedupedRecipients[i];

      try {
        const response = await resendClient.emails.send({
          from: fromEmail,
          to: email,
          replyTo: "tjagard90@gmail.com",
          subject: cleanSubject,
          html: buildSaveTheDateHtml({
            guestName: name,
            guestEmail: email,
            partySize,
            message: cleanMessage,
            websiteUrl: cleanWebsiteUrl,
            hasFlyer: Boolean(flyerBuffer),
            availabilityDeadline: cleanDeadline,
          }),
          attachments,
        });

        if (response.error) {
          results.push({
            email,
            name,
            status: "failed",
            error: response.error.message || "Email provider rejected the message.",
          });
        } else {
          results.push({ email, name, status: "sent" });
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "Failed to send email";
        results.push({ email, name, status: "failed", error: errMsg });
      }

      // Respect Resend rate limits between requests when sending to multiple guests
      if (i < dedupedRecipients.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

    const sentCount = results.filter((r) => r.status === "sent").length;
    const failedCount = results.length - sentCount;

    return res.status(200).json({
      success: sentCount > 0,
      sentCount,
      failedCount,
      results,
    });
  });

  // API Route for RSVP
  app.post("/api/rsvp", async (req, res) => {
    const { name, email, attending, guests, dietary, songRequest, note } = req.body;

    try {
      // 1. Send confirmation email if attending
      if (attending === 'yes' && email && process.env.RESEND_API_KEY) {
        const resendClient = getResend();
        await resendClient.emails.send({
          from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL,
          to: email,
          replyTo: "tjagard90@gmail.com",
          subject: "RSVP Confirmation: Jenneba & Troy's Wedding",
          html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>RSVP Confirmation</title>
    <style>
      @media only screen and (max-width: 600px) {
        .rsvp-outer { padding: 12px 8px !important; }
        .rsvp-card { padding: 24px 16px !important; }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #FAFAFA; font-family: 'Georgia', serif; color: #600010;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAFAFA; width: 100%;">
      <tr>
        <td align="center" class="rsvp-outer" style="padding: 28px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border: 2px solid #000000;">
            <tr>
              <td class="rsvp-card" style="padding: 36px 28px;">
                <h1 style="text-align: center; color: #600010; margin: 0 0 12px 0; font-size: 28px;">RSVP Confirmed!</h1>
                <p style="font-size: 18px; text-align: center; font-style: italic; margin: 0 0 16px 0;">Hi ${escapeHtml(String(name || "Guest"))},</p>
                <p style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.65; color: #222222; margin: 0 0 24px 0;">
                  We are so excited to celebrate with you! This email confirms your RSVP for our wedding on <strong>September 11, 2027</strong>.
                </p>

                <div style="background-color: #FDFBF7; padding: 20px; margin: 0 0 24px 0; border: 1px solid #E7D4B5; font-family: Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1A1A1A;">
                  <h2 style="font-family: 'Georgia', serif; color: #600010; font-size: 20px; margin: 0 0 12px 0;">Wedding Details</h2>
                  <p style="margin: 0 0 6px 0;"><strong>Date:</strong> Saturday, September 11, 2027</p>
                  <p style="margin: 0 0 6px 0;"><strong>Ceremony Time:</strong> 3:30 PM</p>
                  <p style="margin: 0 0 6px 0;"><strong>Venue:</strong> White's Ferry Manor</p>
                  <p style="margin: 0;"><strong>Address:</strong> 123 Riverside Drive, Leesburg, VA 20176</p>
                </div>

                <p style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #1A1A1A; margin: 0 0 8px 0;"><strong>Your RSVP Details:</strong></p>
                <ul style="font-family: Arial, sans-serif; font-size: 15px; line-height: 1.7; color: #222222; padding-left: 20px; margin: 0 0 24px 0;">
                  <li>Attending: Yes</li>
                  <li>Number of Guests: ${escapeHtml(String(guests ?? 1))}</li>
                  ${dietary ? `<li>Dietary Restrictions: ${escapeHtml(String(dietary))}</li>` : ""}
                  ${songRequest ? `<li>Song Request: ${escapeHtml(String(songRequest))}</li>` : ""}
                </ul>

                <p style="font-size: 16px; line-height: 1.6; text-align: center; margin: 28px 0 0 0;">
                  We can't wait to see you there!<br />
                  <span style="font-size: 24px; color: #600010;">J &amp; T</span>
                </p>

                <hr style="border: 0; border-top: 1px solid #E7D4B5; margin: 24px 0;" />
                <p style="font-family: Arial, sans-serif; font-size: 11px; color: #600010; text-align: center; text-transform: uppercase; letter-spacing: 2px; margin: 0;">#CaughtOffAgard</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
        });
      }

      res.status(200).json({ success: true, message: "RSVP received and email sent." });
    } catch (error) {
      console.error("Error processing RSVP:", error);
      res.status(500).json({ success: false, message: "Failed to process RSVP." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
