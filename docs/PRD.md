# PRD — A Wish For

## 1. Product summary

**A Wish For** is a Spanish-first wishlist builder for meaningful events such as baby showers, birthdays, weddings, housewarmings, and general gift lists.

The product lets a creator build a beautiful public wishlist page, add gifts from any store, personalize the visual style, and share the page through a clean link, WhatsApp, or QR code. Guests do not need accounts. Guests can mark gifts as purchased so others avoid duplicates.

Target domain: `awishfor.com`.

Primary tagline:

> Beautiful wishlists for meaningful moments.

Primary Spanish CTA:

> Crear mi wishlist

## 2. Goals and non-goals

### Goals

- Let users create beautiful public wishlist pages quickly.
- Support key event types with guided presets.
- Let users add gifts manually or by pasting a product URL.
- Let guests mark gifts as purchased without authentication.
- Prevent duplicate purchases through public gift status/progress.
- Provide owner dashboard tools for managing gifts, purchases, design, and sharing.
- Keep MVP simple, elegant, Spanish-first, and launchable.

### Non-goals for MVP

- No checkout.
- No payment processing.
- No marketplace.
- No inventory system.
- No guest accounts.
- No public wishlist discovery/search.
- No affiliate monetization.
- No premium plans.
- No custom domains.
- No RSVP.
- No collaborators.
- No AI-generated gift recommendations.
- No browser/Puppeteer scraping in MVP.
- No hard delete for wishlists/gifts in MVP.

## 3. Target users

### Primary user: Wishlist owner

A person creating a wishlist for a meaningful event. They want something beautiful, personal, and easy to share.

Examples:

- Parent creating a baby shower wishlist.
- Parent creating a birthday wishlist for a child.
- Couple creating a wedding wishlist.
- Family creating a housewarming wishlist.
- Individual creating a general wishlist.

### Secondary user: Guest

A person invited to view the wishlist. They want to know what to buy and avoid duplicates. They should not need to create an account.

## 4. MVP positioning

A Wish For is not an ecommerce store. It is a beautiful wishlist page builder.

Positioning:

> A simple, elegant way to create and share gift wishlists for meaningful moments.

Spanish product language should keep the word **wishlist** as the app term, with **lista de regalos** as the clarifier.

Use:

- `Crear mi wishlist`
- `Crear wishlist`
- `Lista de regalos`
- `Marcar como comprado`

Avoid:

- Cart-heavy language.
- Checkout-heavy UI.
- Marketplace positioning.
- Corporate SaaS tone.
- Overly childish visuals.

## 5. Core user journeys

### Journey 1 — Create a wishlist

1. User visits `/create`.
2. User selects event type.
3. User enters event details and slug.
4. User chooses design preset and preview.
5. User adds gifts manually or by URL import.
6. User authenticates if needed.
7. User publishes wishlist.
8. User shares link, WhatsApp message, or QR.

### Journey 2 — Guest marks gift as purchased

1. Guest opens `/w/[slug]`.
2. Guest browses gifts.
3. Guest chooses available gift.
4. Guest clicks `Marcar como comprado`.
5. Guest enters name and optional contact/message.
6. Guest confirms quantity.
7. Gift progress updates.
8. Guest sees thank-you success state and short undo option.

### Journey 3 — Owner manages wishlist

1. Owner opens dashboard.
2. Owner sees wishlist cards and progress.
3. Owner opens a wishlist.
4. Owner manages gifts, categories, purchases, design, settings, sharing.
5. Owner can archive or restore wishlist.

## 6. Feature requirements

### Event types

Internal enum:

```ts
baby_shower
birthday
wedding
housewarming
general
```

Spanish labels:

- Baby shower
- Cumpleaños
- Boda
- Nuevo hogar
- Wishlist general

### Default categories

Baby Shower:

- Pañales
- Ropa
- Lactancia
- Baño
- Dormitorio
- Juguetes
- Otros

Birthday:

- Juguetes
- Ropa
- Libros
- Experiencias
- Tecnología
- Otros

Wedding:

- Cocina
- Hogar
- Decoración
- Experiencias
- Luna de miel
- Otros

Housewarming:

- Cocina
- Muebles
- Decoración
- Electrodomésticos
- Herramientas
- Otros

General Wishlist:

- Favoritos
- Útiles
- Diversión
- Experiencias
- Otros

### Event type presets

Store hardcoded presets in:

```txt
src/config/event-type-presets.ts
```

Each preset includes:

```ts
type EventTypePreset = {
  eventType: EventType;
  label: string;
  defaultHeroTitleTemplate: string;
  defaultWelcomeMessage: string;
  defaultThankYouMessage: string;
  defaultCategories: string[];
  sampleGifts: SampleGift[];
  defaultThemeId: string;
  defaultLayoutId: string;
};
```

## 7. Public wishlist experience

### Route

Public URL pattern:

```txt
/w/[slug]
```

Example:

```txt
https://awishfor.com/w/emma-baby-shower
```

No locale prefix in public URLs.

### Public visibility

- Public wishlists are unlisted.
- No in-app discovery in MVP.
- Public wishlist pages should be `noindex`.
- Marketing pages are indexable.

### Lifecycle behavior

`WishlistStatus`:

```ts
draft | published | archived
```

Rules:

- Draft + non-owner: 404.
- Draft + owner: preview page with banner.
- Published: accessible by link.
- Archived: soft inactive page.

Draft owner preview banner:

> Vista previa — esta lista aún no está publicada.

Archived public message:

> Esta lista ya no está activa. El creador ha archivado esta wishlist.

Optional CTA:

> Crear mi propia wishlist

### Public page section order

1. Hero
2. Event details
3. Countdown
4. Welcome message
5. Gift list
6. How it works
7. Thank-you message
8. Footer

### Event details

Fields:

```ts
eventDate?: DateTime
eventTime?: string // HH:mm
eventLocation?: string
```

Event location is plain text only in MVP.

Past dates are allowed with warning in owner UI:

> Esta fecha ya pasó. Puedes continuar, pero el contador mostrará un mensaje de cierre.

### Countdown

Show countdown if `eventDate` exists.

Copy:

- Future: `Faltan 44 días`
- One day: `Falta 1 día`
- Today: `Es hoy`
- Past: `Gracias por celebrar con nosotros.`

No event date: hide countdown.

Place countdown below event details and above welcome/gifts.

### Public gift helper text

> Puedes comprar el regalo donde prefieras. Solo recuerda marcarlo como comprado para evitar duplicados.

### How it works

Shown by default.

Field:

```ts
showHowItWorks Boolean @default(true)
```

Default copy:

> ¿Cómo funciona?  
> 1. Elige un regalo disponible.  
> 2. Puedes comprarlo en la tienda sugerida o donde prefieras.  
> 3. Marca el regalo como comprado para evitar duplicados.

### Gift CTA behavior

Available/partial gifts:

- Primary CTA: `Marcar como comprado`
- Secondary CTA if `productUrl`: `Ver producto`

Fully purchased gifts:

- Show informational status.
- Show badge `Comprado`.
- Show completed progress.
- No CTAs.
- No product link.
- Remain visible by default below available gifts.

Hidden gifts:

- Excluded from public page.

### Public filters

One active filter at a time:

- Todos
- Disponibles
- Comprados
- Infaltables
- Category filters

Category filters ordered by `Category.sortOrder`.

Mobile UI:

- Horizontal scrollable chip row.
- Sort dropdown.

Recommended implementation:

- Shadcn Button/Badge/ToggleGroup styling.
- ScrollArea.
- Select.

### Public sorting

Options:

- Recomendados
- Precio: menor a mayor
- Precio: mayor a menor
- Nombre: A-Z

Default sort:

- Available/partial first.
- Purchased below.
- Within groups by `sortOrder`.

### Empty filter states

No available gifts:

> Todos los regalos disponibles ya fueron marcados como comprados.

CTA:

> Ver todos los regalos

No purchased gifts:

> Aún no hay regalos marcados como comprados.

CTA:

> Ver regalos disponibles

No infaltable gifts:

> No hay regalos marcados como infaltables en esta lista.

CTA:

> Ver todos los regalos

Empty category:

> No hay regalos en esta categoría.

CTA:

> Ver todos los regalos

### Public progress summary

Example:

> Regalos  
> 8 disponibles · 7 de 16 unidades compradas

## 8. Wishlist creation wizard

### Route

```txt
/create
/create?step=event
/create?step=details
/create?step=design
/create?step=gifts
/create?step=publish
```

### Access

- `/create` is public.
- User can start unauthenticated.
- Auth required to save or publish.

### Steps

1. Event Type
2. Event Details + slug availability
3. Design & Preview
4. Gifts
5. Final Preview, Auth Gate, Publish & Share

### Preview behavior

Preview modes:

```ts
full | preview | compact
```

Rules:

- `full`: real public page; actions enabled.
- `preview`: wizard/dashboard preview; actions disabled, no mutations.
- `compact`: landing/demo snapshot; no actions/navigation.

Step 3 preview:

- Before real gifts: use event-specific sample gifts.
- Label: `Vista previa con ejemplos`.
- After real gifts: use draft gifts.
- Label: `Vista previa de tu wishlist`.

Step 5:

- Embedded final preview.
- Button for full page preview.
- Before publish: owner-only draft preview.
- After publish: `Ver lista pública`.

### Local draft behavior

Before auth:

- React state + Zustand + localStorage.
- No database writes.
- Local draft stores `updatedAt`.
- Local draft considered stale after 30 days.

Old local draft prompt:

> Encontramos un borrador antiguo.

Actions:

- Continuar borrador
- Empezar de nuevo

Signed-out draft recovery prompt:

> Encontramos una wishlist que empezaste antes.

Actions:

- Continuar borrador
- Empezar de nuevo

### Authenticated draft behavior

Authenticated user can click:

> Guardar borrador

Rules:

- Persists to DB.
- Stays in wizard.
- Shows Sonner toast `Borrador guardado`.
- Button state: `Guardado`.
- Link: `Ver en dashboard`.
- First save stores `savedWishlistId` and `lastSavedAt` in local draft.
- Subsequent saves update same DB draft.

DB draft minimum fields:

- title
- eventType
- language
- currency
- slug

Draft can have zero gifts.

Saved DB drafts opened from dashboard use dashboard editing, not wizard.

### Signed-in existing drafts

When signed-in user opens `/create`, show up to 3 recent DB drafts:

> ¿Quieres continuar una wishlist pendiente?

Actions:

- Continuar borrador: [title]
- Crear nueva wishlist
- Ver todos mis borradores

### Local vs DB conflict

If local draft has `savedWishlistId`, verify DB draft exists and belongs to current user.

Conflict condition:

```txt
DB updatedAt > localDraft.lastSavedAt
```

Prompt:

> Este borrador fue actualizado desde el dashboard después de tu último guardado.  
> ¿Qué quieres hacer?

Actions:

- Usar versión del dashboard
- Continuar con este borrador local

Continuing with local draft overwrites DB on next save after confirmation.

### Publish requirements

Required:

- title
- event type
- slug available
- language
- currency
- at least 1 visible gift

Design defaults are enough and should not block publishing.

Hidden gifts do not count toward visible gift requirement.

### Publish success state

After publishing from `/create`, remain on Step 5 success/share state.

Copy:

> ¡Tu wishlist está publicada!  
> Comparte tu enlace con tus invitados:

Actions:

- Copiar enlace
- Compartir por WhatsApp
- Descargar QR
- Ver lista pública
- Gestionar en dashboard

After successful publish, clear Zustand/localStorage draft.

## 9. Owner dashboard

### Routes

Use protected route group:

```txt
src/app/
  (protected)/
    dashboard/
      page.tsx
      wishlists/
        page.tsx
        [id]/
          page.tsx
          gifts/page.tsx
          design/page.tsx
          settings/page.tsx
```

URL remains `/dashboard`.

### Dashboard list

MVP layout:

- Card grid.
- Spanish-first empty state.

Empty state:

> Aún no tienes wishlists  
> Crea tu primera wishlist para un baby shower, cumpleaños, boda, nuevo hogar o cualquier momento especial.

CTA:

> Crear wishlist

### Dashboard filters

- Activas = Draft + Published
- Borradores
- Publicadas
- Archivadas

Archived hidden from default list.

Archived empty state:

> No tienes wishlists archivadas.

### Wishlist dashboard navigation

Tabs:

- Resumen
- Regalos
- Diseño
- Configuración

Desktop/tablet: tabs.  
Mobile: dropdown/select.

### Overview metrics

Show:

- Regalos totales
- Regalos disponibles
- Regalos comprados
- Progreso de compras

Progress is quantity-based:

```txt
purchased units / total needed units
```

Example:

```txt
Regalos: 12
Disponibles: 8
Comprados: 4
Progreso: 7 de 16 unidades compradas
```

Also show:

- Public link
- Copy link
- WhatsApp share
- QR download
- Recent purchases

### Recent purchases

Section title:

> Últimas compras

Show latest 5 purchase records:

- guest name
- gift name
- quantity
- message preview
- date/time
- link/details

CTA:

> Ver todas las compras

Purchase management happens through gift-level drawer, not a separate purchases page.

### Publish readiness checklist

If wishlist is not ready:

> Para publicar tu wishlist, completa lo siguiente:

Items:

- Título
- Tipo de evento
- Enlace disponible
- Idioma y moneda
- Al menos 1 regalo visible

Missing items link to appropriate area:

- Configuración
- Regalos

### Archive and restore

No true wishlist delete in MVP.

Archive:

- `status = archived`
- `archivedAt = now()`

Restore dialog:

> ¿Restaurar esta wishlist?  
> Puedes restaurarla como borrador para editarla antes de compartirla, o publicarla nuevamente con el mismo enlace.

Actions:

- Restaurar como borrador
- Restaurar publicada

Restore as draft:

- `status = draft`
- `archivedAt = null`
- public page returns 404 for non-owner

Restore as published:

- `status = published`
- `archivedAt = null`
- same slug active again

## 10. Gift importer

### MVP importer scope

Support URL-first gift creation with manual fallback.

Use:

- native `fetch`
- `AbortController`
- `cheerio`
- `zod`
- custom URL safety helpers

Do not use in MVP:

- Puppeteer
- Playwright
- Browserless
- paid scraping APIs
- JavaScript execution

### Parsing order

1. JSON-LD Product schema
2. Open Graph
3. Twitter Card
4. HTML title
5. domain/store fallback

### Import output

```ts
type ImportedGiftDraft = {
  productUrl: string;
  finalUrl: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  priceAmount?: number;
  priceCurrency?: Currency;
  storeName?: string;
  source: "open_graph" | "twitter_card" | "json_ld" | "html_title" | "domain";
  confidence: "high" | "medium" | "low";
  warnings?: string[];
};
```

Persist:

- `Gift.productUrl = final cleaned resolved URL`.

Do not persist imported description as `Gift.description`.

Imported description can be temporary UI context only.

### URL cleanup

Strip known tracking params:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_term`
- `utm_content`
- `fbclid`
- `gclid`
- `msclkid`
- `igshid`
- `ttclid`

Preserve unknown params.

### Limits

- Timeout: 7 seconds.
- Max redirects: 5.
- Max HTML response size: 2MB.
- Content type must be text/html or compatible.

### URL safety

Allow only public HTTP/HTTPS URLs.

Block:

- localhost
- private IPs
- internal ranges
- file URLs
- ftp URLs
- data URLs
- javascript URLs

Validate final URL after redirects.

Never execute JavaScript.

### Failure UX

Full failure:

> No pudimos importar los datos automáticamente. Puedes agregar el regalo manualmente usando este enlace.

Partial import:

> Importamos algunos datos, pero puedes completar lo que falte.

Invalid/private URL:

> Ingresa un enlace válido y público.

Timeout:

> La tienda tardó demasiado en responder. Puedes agregar el regalo manualmente.

### Store display

Public cards show:

- `storeName` if present.
- otherwise clean domain.

Never show full URL as store label.

Known store mapping file:

```txt
src/config/store-display-names.ts
```

Initial mapping scope:

Peru/LatAm:

- Falabella
- Ripley
- Oechsle
- Mercado Libre
- Baby Infanti
- Sodimac
- Promart
- Plaza Vea
- Wong
- Metro
- Casaideas
- H&M Perú
- Zara Perú
- Coolbox
- Juntoz

International:

- Amazon
- Etsy
- IKEA
- Target
- Walmart
- AliExpress

Unknown fallback:

- clean domain
- owner can edit `storeName`

## 11. Gift, quantity, and purchase rules

### Gift visibility

Gift stores visibility, not purchase status.

```ts
GiftVisibilityStatus = available | hidden
```

Public status is derived:

```txt
hidden -> hidden/excluded publicly
purchasedQuantity >= quantityNeeded -> purchased
otherwise -> available
```

No separate persisted `partially_purchased` status.

Partial purchase is shown through progress:

```txt
1 de 4 comprados
```

### Gift priority

```ts
GiftPriority = low | medium | high
```

Spanish labels:

- Baja
- Normal
- Infaltable

Public high-priority badge:

> Infaltable

### Gift fields

Core fields:

```ts
name: string
productUrl?: string
imageUrl?: string
storeName?: string
priceAmount?: Decimal
priceCurrency?: Currency
quantityNeeded: number
priority: GiftPriority
visibilityStatus: GiftVisibilityStatus
publicNote?: string
internalNote?: string
sortOrder: number
deletedAt?: DateTime
```

No persisted `description` field in MVP.

`publicNote`:

- Visible to guests.
- Max 300 chars.

`internalNote`:

- Owner-only.
- Max 500 chars.

`productUrl` optional.

Manual gifts fully supported.

Gift image optional with themed placeholders.

### Price

Price optional.

Use:

```prisma
priceAmount Decimal? @db.Decimal(10, 2)
priceCurrency Currency?
```

Do not use Float.

### Gift delete

Gift delete is soft delete:

```ts
deletedAt: DateTime?
```

No user-facing restore/trash in MVP.

Soft-deleted gifts:

- hidden from public page
- hidden from dashboard counts
- hidden from progress
- hidden from recent purchases

Purchases remain in DB but are ignored.

Future TODO:

- hard delete

Delete confirmation:

> ¿Eliminar este regalo?  
> Este regalo dejará de aparecer en tu wishlist. Si tenía compras registradas, también dejarán de verse asociadas a la lista.

If gift has purchases:

> Este regalo tiene compras registradas. Si lo eliminas, ya no aparecerá en la wishlist ni en el progreso de compras.

No gift delete undo in MVP.

### Purchase model

```prisma
model Purchase {
  id        String   @id @default(cuid())

  giftId    String
  gift      Gift     @relation(fields: [giftId], references: [id], onDelete: Cascade)

  guestName  String
  guestEmail String?
  guestPhone String?
  message    String?

  quantity   Int      @default(1)

  undoTokenHash String?
  undoExpiresAt DateTime?

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

Rules:

- Multiple active purchase records per gift.
- No historical/cancelled purchase records in MVP.
- Quantity must be between 1 and remaining quantity.
- Guest undo deletes only the just-created purchase record.
- Owner can view, delete, and manually add purchase records.

### Purchase modal fields

Required:

- `guestName`, 2–80 chars

Optional:

- `guestEmail`, valid email
- `guestPhone`, 6–30 chars
- `message`, max 500 chars

Quantity:

- show if remaining > 1
- min 1
- max remaining

### Guest success state

> ¡Gracias, María!  
> Tu regalo fue marcado como comprado.  
> Gracias por tu cariño y por ser parte de este momento.

Actions:

- Deshacer
- Cerrar

Undo window:

- 60 seconds.
- Current browser only.
- Server returns raw token once.
- Store hash in DB.

### Owner purchase management

Owner can manually add purchase record.

Required:

- name
- quantity

Optional:

- email
- phone
- message

Default name:

> Registrado por el creador

Manual purchase quantity cannot exceed remaining.

If owner needs more, increase `quantityNeeded` first.

Owner delete purchase confirmation:

> ¿Eliminar esta compra?  
> Esto volverá a aumentar la cantidad disponible para este regalo.

Owner manual purchase success toast:

> Compra agregada

Action:

> Deshacer

Owner undo does not need token because owner is authenticated.

### Quantity editing

Validation:

```txt
quantityNeeded >= purchasedQuantity
```

Error copy:

> No puedes reducir la cantidad por debajo de las unidades ya marcadas como compradas. Elimina una compra primero o aumenta la cantidad.

## 12. Sharing, QR, and WhatsApp

### Share actions

- Copiar enlace
- Compartir por WhatsApp
- Descargar QR

### Copy behavior

Copy clean URL only.

Success:

- Button temporary state: `Copiado`
- Toast: `Enlace copiado`

Error:

> No pudimos copiar el enlace. Puedes seleccionarlo manualmente.

### QR

QR is MVP.

Use client-side `qrcode` package.

QR content:

```txt
https://awishfor.com/w/[slug]
```

Output:

- PNG download.

No custom QR style, logo, SVG, tracking, or server storage in MVP.

If slug changes after publishing, old downloaded QR stops working.

### Slug changes after publishing

Warning:

> Cambiar el enlace público hará que el enlace anterior y los QR ya compartidos dejen de funcionar.  
> También deberás descargar y compartir un nuevo QR.  
> Nuevo enlace: ...

No old redirects in MVP.

### WhatsApp templates

Baby Shower:

```txt
Hola 💛 Creamos una wishlist para el baby shower de Emma.

Puedes verla aquí:
{url}

Gracias por acompañarnos en esta etapa tan especial.
```

Birthday:

```txt
Hola 🎉 Creamos una wishlist para el cumpleaños de Noah.

Puedes verla aquí:
{url}

Gracias por celebrar con nosotros.
```

Wedding:

```txt
Hola 💍 Creamos una wishlist para nuestra boda.

Puedes verla aquí:
{url}

Gracias por acompañarnos en este momento tan especial.
```

Housewarming:

```txt
Hola 🏡 Creamos una wishlist para nuestro nuevo hogar.

Puedes verla aquí:
{url}

Gracias por ser parte de esta nueva etapa.
```

General:

```txt
Hola 💛 Creamos una wishlist con algunas ideas de regalos.

Puedes verla aquí:
{url}

Gracias por tu cariño.
```

## 13. Design system and customization

### Visual direction

Soft editorial + modern celebration.

Attributes:

- warm
- elegant
- personal
- trustworthy
- Spanish-first
- LatAm-friendly

Avoid:

- marketplace/ecommerce look
- overly childish visuals
- corporate SaaS dashboard feel on public pages
- too many freeform controls

### Theme strategy

Themes are hardcoded presets.

Store:

```txt
src/config/public-themes.ts
```

Wishlist stores:

```ts
themeId: string
```

Theme IDs:

- `dulce-rosa` — Dulce Rosa
- `cielo-suave` — Cielo Suave
- `jardin-verde` — Jardín Verde
- `crema-elegante` — Crema Elegante
- `lavanda-fiesta` — Lavanda Fiesta
- `clasico-minimal` — Clásico Minimal

Theme preset type:

```ts
type ThemePreset = {
  id: string;
  name: string;
  description: string;
  preview: {
    background: string;
    primary: string;
    accent: string;
  };
  cssVars: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    border: string;
    input: string;
    ring: string;
    radius?: string;
  };
  heroPattern?: string;
};
```

Public themes use scoped Shadcn/Tailwind CSS variables on a wrapper.

Public components use:

- `bg-background`
- `text-foreground`
- `bg-card`
- `border-border`
- `text-muted-foreground`

Dashboard keeps default app theme.

### Layout presets

Store:

```txt
src/config/public-layouts.ts
```

Layouts:

- `grid` — Galería
- `editorial` — Editorial
- `minimal` — Lista Minimal

Default design by event type:

- Baby Shower: Cielo Suave + Editorial
- Birthday: Lavanda Fiesta + Galería
- Wedding: Crema Elegante + Editorial
- Housewarming: Jardín Verde + Lista Minimal
- General: Clásico Minimal + Galería

### Layout components

```txt
PublicWishlistPage
  GridWishlistLayout
  EditorialWishlistLayout
  MinimalWishlistLayout

Shared:
  WishlistHero
  Countdown
  GiftCard
  GiftGrid/GiftList
  HowItWorks
  WishlistFooter
  PurchaseGiftModal
```

### Component structure

```txt
src/components/
  ui/
  features/
    wishlist/
    wizard/
    dashboard/
  layouts/
    public-wishlist/
    dashboard/
    marketing/
```

### Font strategy

Use `next/font`.

Store:

```txt
src/config/public-fonts.ts
```

MVP font pairings:

- `serif-soft`: Heading Lora, Body Inter
- `sans-modern`: Heading Inter, Body Inter
- `rounded-friendly`: Heading Nunito, Body Nunito

Default:

- `serif-soft`

Deferred:

- `classic-elegant`: Cormorant Garamond + Inter

### Button styles

Store:

```txt
src/config/public-button-styles.ts
```

MVP styles:

- `pill` — Píldora, default
- `rounded` — Redondeado

No square button style in MVP.

### Cover image

Optional.

Rules:

- If no cover image, use theme-generated background.
- Upload supported.
- Remove supported.
- No crop/edit in MVP.

## 14. Internationalization, currency, and region

### Language

Primary language: Spanish.

Secondary support: English.

Wishlist stores:

```ts
language: es | en
```

Public route has no locale prefix. It renders by wishlist language.

Dashboard and marketing can support Spanish/English later, but Spanish default for MVP.

### Currency

Default country: Peru.

Default currency: PEN.

Supported currencies:

- PEN
- USD
- EUR
- MXN
- COP
- CLP
- ARS

Gift price optional.

Importer should use detected currency only if confident. Otherwise use wishlist currency.

Formatting helper:

```ts
formatMoney(amount, currency, locale)
```

Use:

- Spanish default locale: `es-PE`
- English default locale: `en-US`

## 15. Privacy, legal, and safety

### Legal pages

MVP pages:

- `/privacy`
- `/terms`

No separate cookies page.

No cookie banner if no ads/retargeting/Meta Pixel/Google Ads.

### Privacy content should mention

- Clerk
- PostHog
- Sentry
- UploadThing
- Neon
- guest purchase/contact data
- basic cookies/session

### Support email

Use one generic email:

```txt
hola@awishfor.com
```

For:

- support
- privacy
- report list

### Public footer

> Creado con A Wish For · Crea tu propia wishlist  
> Privacidad · Términos · Reportar lista

Report link:

```txt
mailto:hola@awishfor.com?subject=Reportar%20lista
```

### Guest consent copy

Purchase modal:

> Al marcar este regalo como comprado, compartiremos tu nombre y los datos opcionales que ingreses con el creador de la lista.

Also acceptable:

> Tu nombre será visible solo para el creador de la lista.

### Owner publish consent

> Entiendo que esta lista será accesible para cualquier persona con el enlace.

## 16. Technical architecture

### Base stack

Project starts from `sietch-init`.

Do not add foundational setup tasks for:

- Next.js
- React
- tRPC
- Prisma
- Neon
- Clerk
- Clerk webhook sync
- Tailwind
- Shadcn/Base UI
- Biome
- Vitest
- Lefthook
- base protected routes
- base auth/dashboard shell

Expected base stack:

- Next.js 16
- React 19
- tRPC v11
- Prisma 7
- Neon
- Clerk custom UI
- Tailwind v4
- Shadcn/Base UI
- pnpm
- Biome
- Vitest
- lefthook

### Product-critical additions

Required:

- UploadThing
- Upstash Redis
- `qrcode`
- `@dnd-kit`
- `date-fns`
- `cheerio`
- `zod`
- `use-debounce`

Recommended:

- PostHog
- Sentry

### Server structure

```txt
src/server/
  api/
    routers/
      wishlist.ts
      gift.ts
      category.ts
      purchase.ts
      importer.ts
    root.ts
    trpc.ts
  db/client.ts
  services/
    wishlist.service.ts
    gift.service.ts
    importer.service.ts
    slug.service.ts
    purchase.service.ts
    public-wishlist.service.ts
  mappers/
    public-wishlist.mapper.ts
    dashboard-wishlist.mapper.ts
    dashboard-gift.mapper.ts
  validators/
    wishlist.schema.ts
    gift.schema.ts
    purchase.schema.ts
    importer.schema.ts
```

Rules:

- tRPC routers stay thin.
- Services own business rules and data access.
- Mappers shape data for UI.
- React components consume view models, not raw Prisma models.

### Formatter structure

```txt
src/lib/format/
  money.ts
  dates.ts
  strings.ts
```

Rules:

- Mappers serialize safely.
- UI formatting helpers localize display.

Examples:

```ts
formatMoney(amount: string | number, currency: Currency, locale: string): string
formatEventDate(dateIso: string, locale: "es" | "en"): string
formatRelativeDate(dateIso: string, locale: "es" | "en"): string
formatStoreDomain(url: string): string
```

## 17. Data model summary

### User

```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String?
  name      String?
  imageUrl  String?
  locale    Locale   @default(es)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  wishlists Wishlist[]
}
```

Clerk is source of identity. Prisma User stores app relationships/preferences.

### Wishlist

Important fields:

```prisma
model Wishlist {
  id        String @id @default(cuid())
  userId    String
  user      User   @relation(fields: [userId], references: [id])

  title             String
  slug              String @unique
  eventType         EventType
  status            WishlistStatus @default(draft)
  language          Locale @default(es)
  currency          Currency @default(PEN)

  heroTitle         String?
  welcomeMessage    String?
  thankYouMessage   String?
  displayName       String?

  eventDate         DateTime?
  eventTime         String?
  eventLocation     String?

  coverImageUrl     String?
  themeId           String @default("cielo-suave")
  layoutId          String @default("editorial")
  buttonStyle       String @default("pill")
  fontPairing       String @default("serif-soft")
  showHowItWorks    Boolean @default(true)

  publishedAt       DateTime?
  archivedAt        DateTime?

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  categories        Category[]
  gifts             Gift[]
}
```

### Category

```prisma
model Category {
  id         String   @id @default(cuid())
  wishlistId String
  wishlist   Wishlist @relation(fields: [wishlistId], references: [id])

  name       String
  sortOrder  Int      @default(0)

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  gifts      Gift[]
}
```

Deleting category sets assigned gifts to uncategorized.

### Gift

```prisma
model Gift {
  id               String               @id @default(cuid())
  wishlistId       String
  wishlist         Wishlist             @relation(fields: [wishlistId], references: [id], onDelete: Cascade)

  categoryId       String?
  category         Category?            @relation(fields: [categoryId], references: [id], onDelete: SetNull)

  name             String
  productUrl       String?
  imageUrl         String?
  storeName        String?

  priceAmount      Decimal?             @db.Decimal(10, 2)
  priceCurrency    Currency?

  quantityNeeded   Int                  @default(1)
  priority         GiftPriority         @default(medium)
  visibilityStatus GiftVisibilityStatus @default(available)

  publicNote       String?
  internalNote     String?

  sortOrder        Int                  @default(0)
  deletedAt        DateTime?

  createdAt        DateTime             @default(now())
  updatedAt        DateTime             @updatedAt

  purchases        Purchase[]
}
```

### Purchase

```prisma
model Purchase {
  id        String   @id @default(cuid())

  giftId    String
  gift      Gift     @relation(fields: [giftId], references: [id], onDelete: Cascade)

  guestName  String
  guestEmail String?
  guestPhone String?
  message    String?

  quantity   Int      @default(1)

  undoTokenHash String?
  undoExpiresAt DateTime?

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

### Enums

```prisma
enum WishlistStatus {
  draft
  published
  archived
}

enum EventType {
  baby_shower
  birthday
  wedding
  housewarming
  general
}

enum Locale {
  es
  en
}

enum Currency {
  PEN
  USD
  EUR
  MXN
  COP
  CLP
  ARS
}

enum GiftPriority {
  low
  medium
  high
}

enum GiftVisibilityStatus {
  available
  hidden
}
```

## 18. Validation and business rules

### Slug rules

- lowercase letters, numbers, hyphens only
- 3–60 chars
- no spaces
- no special characters
- cannot start with hyphen
- cannot end with hyphen
- globally unique

Check availability:

1. debounced while editing
2. before saving DB draft
3. before publishing

Use `use-debounce`, around 500ms.

API input:

```ts
slug.checkAvailability({ slug, excludeWishlistId? })
```

### Publish validation

Can publish only if:

- title exists
- eventType exists
- slug is valid and available/current
- language exists
- currency exists
- at least 1 non-hidden, non-deleted gift exists

### Quantity validation

Purchase quantity:

```txt
1 <= quantity <= remaining quantity
```

Gift quantity editing:

```txt
quantityNeeded >= purchasedQuantity
```

### Public/private data safety

Public view model must never expose:

- guest email
- guest phone
- purchase message
- internal gift note
- hidden gift
- soft-deleted gift
- owner-only metadata

Dashboard view models may expose owner-needed management data, but should still not pass raw Prisma models directly to UI.

### View model rules

Public page data:

```txt
Prisma models -> server mapper -> PublicWishlistViewModel -> public components
```

Dashboard data:

```txt
Prisma models -> server mapper -> Dashboard ViewModels -> dashboard components
```

Mappers return serialized primitives:

```ts
priceAmount?: string
eventDate?: string
createdAt: string
updatedAt: string
```

UI formatters localize display.

## 19. Analytics and observability

### PostHog events

Track:

- `wizard_started`
- `wishlist_created`
- `wishlist_published`
- `gift_import_attempted`
- `gift_import_succeeded`
- `gift_import_failed`
- `gift_added`
- `public_wishlist_viewed`
- `gift_marked_purchased`
- `qr_downloaded`
- `whatsapp_share_clicked`

### Sentry

Use for:

- server errors
- importer failures
- unexpected purchase mutation failures
- public page runtime errors

### Rate limiting

Use Upstash Redis.

Limit:

- `importer.importFromUrl`
- `purchase.markGiftPurchased`
- `purchase.undoRecentPurchase`
- `slug.checkAvailability`

Recommended limits:

- URL importer auth owner: 20/hour, 100/day.
- URL importer unauth draft: 5/hour/IP.
- Purchase confirmations: 10/hour/IP, 3 attempts/gift/hour.
- Slug availability: 30 checks/hour per IP/user.

## 20. MVP out of scope

- Checkout/payments.
- Marketplace.
- Premium subscriptions.
- Affiliate links.
- Collaborators.
- Guest accounts.
- Public search/discovery.
- Password-protected wishlists.
- RSVP.
- Gift alternatives.
- Custom domains.
- Custom QR styling.
- Advanced analytics for owners.
- Puppeteer/Playwright importer fallback.
- Price refresh.
- AI gift suggestions.
- AI copy generation.
- Hard delete wishlist/gifts.
- Slug redirect history.
- Abuse moderation dashboard.

## 21. Open questions / risks

### Importer reliability

Many ecommerce sites may block server-side HTML fetches or omit metadata. MVP must have strong manual fallback.

### Privacy expectations

Guests may assume their purchase info is private. Modal must clearly explain that name and optional details are shared with the wishlist creator only.

### Slug changes after sharing

Changing slug after publish breaks old links and QR codes. Warning must be clear.

### Quantity edge cases

Concurrent purchases could oversell if validation is not transactional. Purchase creation must validate remaining quantity server-side at mutation time.

### Design scope

Theme/layout customization should stay preset-driven. Avoid turning MVP into a full page builder.

### Public data leaks

Public view model mapper must be carefully tested to avoid exposing internal notes or guest contact data.
