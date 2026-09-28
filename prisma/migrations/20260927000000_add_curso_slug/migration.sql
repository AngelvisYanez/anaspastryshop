-- AddColumn
ALTER TABLE "Curso" ADD COLUMN "slug" TEXT;

-- Backfill: slugify every existing course title so public URLs are readable.
-- Strips the redundant "WORKSHOP"/"Curso Online"/"Masterclass" prefixes that used to
-- live in the titles, and de-duplicates collisions with a numeric suffix.
WITH base AS (
    SELECT
        "id",
        "createdAt",
        COALESCE(
            NULLIF(
                regexp_replace(
                    trim(
                        both '-' FROM
                            regexp_replace(
                                regexp_replace(
                                    regexp_replace(
                                        regexp_replace(
                                            regexp_replace(
                                                regexp_replace(
                                                    trim(
                                                        both '-' FROM
                                                            regexp_replace(
                                                                lower(
                                                                    translate(
                                                                        "title",
                                                                        'áéíóúüñÁÉÍÓÚÑ',
                                                                        'aeiouunAEIOUUN'
                                                                    )
                                                                ),
                                                                '[^a-z0-9]+',
                                                                '-',
                                                                'g'
                                                            )
                                                        ),
                                                        '^workshop-',
                                                        ''
                                                    ),
                                                    '^taller-',
                                                    ''
                                                ),
                                                '^masterclass-online-',
                                                ''
                                            ),
                                                '^masterclass-',
                                                ''
                                            ),
                                            '^curso-online-',
                                            ''
                                        ),
                                        '^curso-',
                                        ''
                                    ),
                                    '-+$',
                                    ''
                                )
                        ),
                        ''
                    ),
                    "id"
                ) AS "raw"
    FROM "Curso"
),
ranked AS (
    SELECT
        "id",
        "raw",
        row_number() OVER (
            PARTITION BY "raw"
            ORDER BY "createdAt" ASC, "id" ASC
        ) AS "n"
    FROM base
)
UPDATE "Curso" AS c
SET "slug" = CASE WHEN r."n" = 1 THEN r."raw" ELSE r."raw" || '-' || r."n" END
FROM ranked AS r
WHERE c."id" = r."id"
  AND c."slug" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Curso_slug_key" ON "Curso"("slug");
