-- AlterTable
ALTER TABLE "Wishlist"
ADD COLUMN "deliveryRecipientName" TEXT,
ADD COLUMN "deliveryAddress" TEXT,
ADD COLUMN "deliveryPhone" TEXT;

-- Backfill welcomeMessage with the event type's preset copy before making it required.
-- Predicate covers both NULL and whitespace-only values, since the wizard store seeds ''.
UPDATE "Wishlist"
SET "welcomeMessage" = CASE "eventType"
  WHEN 'baby_shower' THEN '¡Estamos emocionados de compartir este momento tan especial con ustedes! Gracias por ser parte de la llegada de nuestro bebé.'
  WHEN 'birthday' THEN '¡Gracias por querer celebrar este día especial conmigo! Aquí encontrarás algunas ideas de regalos que me harían muy feliz.'
  WHEN 'wedding' THEN 'Estamos construyendo nuestro hogar juntos y nos encantaría tu ayuda. Cada regalo es un gesto que atesoraremos para siempre.'
  WHEN 'housewarming' THEN '¡Estamos estrenando hogar y nos emociona comenzar esta nueva etapa! Si quieres ayudarnos a equipar nuestra casa, aquí encontrarás algunas ideas.'
  WHEN 'general' THEN '¡Bienvenido a mi wishlist! Aquí encontrarás algunas cosas que me gustarían. Gracias por pensar en mí.'
  ELSE '¡Bienvenido a mi wishlist! Aquí encontrarás algunas cosas que me gustarían. Gracias por pensar en mí.'
END
WHERE "welcomeMessage" IS NULL OR trim("welcomeMessage") = '';

-- AlterTable
ALTER TABLE "Wishlist" ALTER COLUMN "welcomeMessage" SET NOT NULL;
