// Stripe dependency has been removed.
export const stripe: any = new Proxy({} as any, {
  get(_target, prop) {
    if (prop === "webhooks") {
      return {
        constructEvent: () => {
          throw new Error("Stripe is not configured in this environment.");
        },
      };
    }
    if (prop === "checkout") {
      return {
        sessions: {
          create: async () => {
            throw new Error("Stripe checkout is not configured in this environment.");
          },
        },
      };
    }
    return () => {
      throw new Error("Stripe is not configured in this environment.");
    };
  },
});

export function getStripe(): any {
  return stripe;
}