-- DropTable
DROP TABLE "Subscription";

-- DropTable
DROP TABLE "SubscriptionPlan";

-- AlterTable
ALTER TABLE "Curso" ALTER COLUMN "language" SET DEFAULT 'Español';

-- AlterTable
ALTER TABLE "SiteConfig" DROP COLUMN "subscriptionPrice",
DROP COLUMN "subscriptionPriceId",
ALTER COLUMN "siteName" SET DEFAULT 'Ana''s Pastry Shop',
ALTER COLUMN "ctaText" SET DEFAULT 'Ver Talleres Presenciales',
ALTER COLUMN "ctaUrl" SET DEFAULT '/cursos';