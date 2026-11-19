import { createHash } from "node:crypto";
import { getMetaPixelId } from "@/lib/meta-pixel";

type ApprovedPurchase = {
  id: string;
  amount: number;
  email: string;
  approvedAt: number;
};

export async function sendMetaPurchase({
  id,
  amount,
  email,
  approvedAt,
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
          user_data: {
            em: [createHash("sha256").update(normalizedEmail).digest("hex")],
          },
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
