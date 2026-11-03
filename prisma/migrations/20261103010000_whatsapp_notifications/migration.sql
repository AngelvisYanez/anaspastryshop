CREATE TABLE "WhatsAppAuthState" (
  "instance" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  CONSTRAINT "WhatsAppAuthState_pkey" PRIMARY KEY ("instance", "key")
);

CREATE TABLE "WhatsAppConnection" (
  "instance" TEXT NOT NULL,
  "linkedAt" TIMESTAMP(3),
  CONSTRAINT "WhatsAppConnection_pkey" PRIMARY KEY ("instance")
);

CREATE TABLE "WhatsAppNotification" (
  "id" TEXT NOT NULL,
  "eventKey" TEXT NOT NULL,
  "userId" TEXT,
  "phone" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lockedAt" TIMESTAMP(3),
  "messageId" TEXT,
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sentAt" TIMESTAMP(3),
  CONSTRAINT "WhatsAppNotification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WhatsAppNotification_eventKey_key" ON "WhatsAppNotification"("eventKey");
CREATE INDEX "WhatsAppNotification_status_availableAt_idx" ON "WhatsAppNotification"("status", "availableAt");
CREATE INDEX "WhatsAppNotification_userId_createdAt_idx" ON "WhatsAppNotification"("userId", "createdAt");
