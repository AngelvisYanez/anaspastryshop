"use client";

import { useEffect, useRef } from "react";

export type MetaStandardEvent =
  | "ViewContent"
  | "InitiateCheckout"
  | "CompleteRegistration"
  | "AddToCart"
  | "Lead";

type FbqWindow = { fbq?: (...args: unknown[]) => void };

/**
 * Queue an event once the Meta Pixel bootstrap defines fbq. Retry for up to
 * six seconds when the component mounts before the bootstrap runs.
 */
export function fireMetaEvent(
  event: MetaStandardEvent,
  params?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;

  let retries = 0;
  const attempt = () => {
    const fbq = (window as unknown as FbqWindow).fbq;
    if (typeof fbq === "function") {
      fbq("track", event, params ?? {});
      return;
    }

    if (retries < 40) {
      retries += 1;
      window.setTimeout(attempt, 150);
    }
  };
  attempt();
}

/**
 * Drop-in component that fires a standard event once, when it mounts.
 * Use for page-level signals like ViewContent and InitiateCheckout.
 */
export function MetaTrackEvent({
  event,
  params,
}: {
  event: MetaStandardEvent;
  params?: Record<string, unknown>;
}) {
  const fired = useRef(false);
  // Serialize params so the effect re-runs only on a real value change.
  const key = JSON.stringify(params ?? {});
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    fireMetaEvent(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, key]);
  return null;
}
