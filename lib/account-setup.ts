import { createHash } from "node:crypto";

export function accountSetupBinding(userId: string, passwordHash: string) {
  return createHash("sha256").update(`${userId}:${passwordHash}`).digest("hex");
}
