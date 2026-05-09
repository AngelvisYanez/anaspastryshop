export const SUBSCRIPTION_DAYS = 30;
export const GRACE_DAYS = 2;

export function subscriptionEndDate(from: Date = new Date()): Date {
  return new Date(from.getTime() + SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000);
}

export function isSubscriptionValid(sub: {
  status: string;
  endDate: Date | null;
}): boolean {
  if (sub.status !== "ACTIVE") return false;
  if (!sub.endDate) return true;
  const graceCutoff = new Date(sub.endDate.getTime() + GRACE_DAYS * 24 * 60 * 60 * 1000);
  return new Date() <= graceCutoff;
}

export function subscriptionDaysLeft(endDate: Date | null): number | null {
  if (!endDate) return null;
  return Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
