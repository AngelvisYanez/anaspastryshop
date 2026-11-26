import { createHash } from "node:crypto";
import { getMetaPixelId } from "@/lib/meta-pixel";

type ApprovedPurchase = {
  id: string;
  amount: number;
  email: string;
  approvedAt: number;
  phone?: string | null;
  name?: string | null;
  userId?: string | null;
  country?: string | null;
};

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function splitName(name?: string | null): { fn?: string; ln?: string } {
  const parts = (name ?? "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { fn: parts[0] };
  return { fn: parts[0], ln: parts[parts.length - 1] };
}

export async function sendMetaPurchase({
  id,
  amount,
  email,
  approvedAt,
  phone,
  name,
  userId,
  country,
}: ApprovedPurchase) {
  const accessToken = process.env.META_CONVERSIONS_ACCESS_TOKEN?.trim();
  const normalizedEmail = email.trim().toLowerCase();
  if (!accessToken || !normalizedEmail || !Number.isFinite(amount) || amount <= 0) return;

  try {
    const pixelId = await getMetaPixelId();
    if (!pixelId) {
      console.warn("[Meta Conversions] Pixel ID unavailable");
      return;
    }

    // Advanced matching: send every hashed identifier we have so Meta can
    // attribute the purchase to the ad click. More keys = higher match quality.
    const user_data: Record<string, string[]> = {
      em: [hash(normalizedEmail)],
    };

    const phoneDigits = (phone ?? "").replace(/\D/g, "");
    if (phoneDigits) user_data.ph = [hash(phoneDigits)];

    const { fn, ln } = splitName(name);
    if (fn) user_data.fn = [hash(fn)];
    if (ln) user_data.ln = [hash(ln)];

    const countryCode = (country ?? "ve").trim().toLowerCase();
    if (/^[a-z]{2}$/.test(countryCode)) user_data.country = [hash(countryCode)];

    if (userId) user_data.external_id = [hash(userId.trim())];

    const response = await fetch(`https://graph.facebook.com/v25.0/${pixelId}/events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [{
          event_name: "Purchase",
          event_time: approvedAt,
          event_id: `payment-approved:${id}`,
          action_source: "other",
          user_data,
          custom_data: { currency: "USD", value: amount },
        }],
        test_event_code: process.env.META_CONVERSIONS_TEST_EVENT_CODE?.trim() || undefined,
      }),
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      console.warn("[Meta Conversions] Purchase rejected", response.status);
    }
  } catch {
    console.warn("[Meta Conversions] Purchase delivery failed");
  }
}
