-- Add the key as nullable while existing bookings are backfilled.
ALTER TABLE "Booking" ADD COLUMN "idempotencyKey" TEXT;

UPDATE "Booking"
SET "idempotencyKey" = md5("id" || "reference");

ALTER TABLE "Booking" ALTER COLUMN "idempotencyKey" SET NOT NULL;

CREATE UNIQUE INDEX "Booking_idempotencyKey_key" ON "Booking"("idempotencyKey");
