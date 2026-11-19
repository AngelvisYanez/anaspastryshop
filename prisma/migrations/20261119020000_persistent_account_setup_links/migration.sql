ALTER TABLE "PasswordResetToken"
  ALTER COLUMN "expiresAt" DROP NOT NULL,
  ADD COLUMN "setupBinding" TEXT;
