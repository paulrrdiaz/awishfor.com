# CLAUDE_DESIGN_PROMPT.md — A Wish For

Use this prompt with Claude Design to create an implementation-ready design brief for A Wish For.

---

## Prompt

You are a senior product designer and design engineer.

Design the full product experience for **A Wish For**, a Spanish-first wishlist builder for meaningful moments.

Target domain: `awishfor.com`.

Tagline:

> Beautiful wishlists for meaningful moments.

Primary CTA:

> Crear mi wishlist

The product lets people create beautiful public gift wishlists for baby showers, birthdays, weddings, housewarmings, and general wishlists. Guests can open a public link, view gifts, and mark gifts as purchased without creating an account.

## Stack constraints

Use the existing `sietch-init` stack:

- Next.js 16
- React 19
- Tailwind CSS v4
- Shadcn/Base UI
- tRPC
- Prisma
- Clerk

Do not propose a different frontend framework, UI library, design system, CMS, or page builder.

Design should be implementable with Tailwind, Shadcn/Base UI primitives, scoped CSS variables, and React components.

## Product style

Visual direction:

- soft editorial
- modern celebration
- warm
- elegant
- personal
- trustworthy
- Spanish-first
- LatAm-friendly

Avoid:

- marketplace/ecommerce look
- cart/checkout-heavy language
- overly childish visuals
- generic corporate SaaS feel on public pages
- too many freeform design controls

The product should feel like a beautiful personal event page, not a store.

## UI priority order

Design the full product experience, but prioritize visual energy in this order:

1. Public wishlist page
2. Creation wizard
3. Marketing landing page
4. Owner dashboard

## Required output format

Produce a design implementation brief with these sections:

```md
# Claude Design Output

## 1. Visual design direction
## 2. Design principles
## 3. Public wishlist page designs
## 4. Wizard designs
## 5. Landing page design
## 6. Dashboard design
## 7. Theme preset specifications
## 8. Layout preset specifications
## 9. Component inventory
## 10. Mobile-first interaction notes
## 11. Spanish UI copy suggestions
## 12. Tailwind/Shadcn implementation notes
```

The output must be specific enough for an engineer to translate directly into components.

Avoid vague moodboard-only advice.

## Product surfaces to design

### 1. Public wishlist page

Route:

```txt
/w/[slug]
```

Public page is mobile-first and guest-facing.

Required section order:

1. Hero
2. Event details
3. Countdown
4. Welcome message
5. Gift list
6. How it works
7. Thank-you message
8. Footer

Required states:

- Published public page
- Draft owner preview with banner
- Archived page inactive state
- Empty filter states
- Gift available
- Gift partially purchased
- Gift fully purchased
- Purchase modal form
- Purchase modal success
- Purchase modal undo available
- Purchase modal error

Draft owner preview banner:

> Vista previa — esta lista aún no está publicada.

Archived message:

> Esta lista ya no está activa. El creador ha archivado esta wishlist.

Gift helper text:

> Puedes comprar el regalo donde prefieras. Solo recuerda marcarlo como comprado para evitar duplicados.

How it works default copy:

> ¿Cómo funciona?  
> 1. Elige un regalo disponible.  
> 2. Puedes comprarlo en la tienda sugerida o donde prefieras.  
> 3. Marca el regalo como comprado para evitar duplicados.

Countdown copy:

- `Faltan 44 días`
- `Falta 1 día`
- `Es hoy`
- `Gracias por celebrar con nosotros.`

Gift CTA:

- Primary: `Marcar como comprado`
- Secondary if product URL exists: `Ver producto`

Fully purchased gifts:

- show `Comprado` badge
- show completed progress
- no CTAs
- visually de-emphasized
- remain visible below available gifts

Public filters:

- Todos
- Disponibles
- Comprados
- Infaltables
- Category filters

Sort options:

- Recomendados
- Precio: menor a mayor
- Precio: mayor a menor
- Nombre: A-Z

Public progress example:

> 8 disponibles · 7 de 16 unidades compradas

### 2. Creation wizard

Route:

```txt
/create
```

Steps:

1. Event Type
2. Event Details + slug availability
3. Design & Preview
4. Gifts
5. Final Preview, Auth Gate, Publish & Share

Design requirements:

- guided
- reassuring
- Spanish-first
- mobile-friendly
- live preview in design step
- final preview in publish step
- sample gift preview before real gifts exist

Step 3 preview labels:

- `Vista previa con ejemplos`
- `Vista previa de tu wishlist`

Slug availability states:

- Checking
- Available
- Already taken
- Invalid

Past date warning:

> Esta fecha ya pasó. Puedes continuar, pero el contador mostrará un mensaje de cierre.

Publish success state:

> ¡Tu wishlist está publicada!  
> Comparte tu enlace con tus invitados:

Actions:

- Copiar enlace
- Compartir por WhatsApp
- Descargar QR
- Ver lista pública
- Gestionar en dashboard

### 3. Marketing landing page

Required sections:

1. Hero
2. Cómo funciona
3. Casos de uso
4. Theme previews
5. Example public wishlist preview
6. Final CTA

Hero copy:

> A Wish For  
> Crea una wishlist hermosa para tus momentos especiales.  
> Agrega regalos de cualquier tienda, personaliza tu página y compártela con tus invitados por enlace, WhatsApp o QR.

CTA:

> Crear mi wishlist

Secondary CTA:

> Ver ejemplo

Navigation:

- Logo -> `/`
- Signed out: Iniciar sesión + Crear mi wishlist
- Signed in: Dashboard + Crear mi wishlist

The landing example preview should reuse real public wishlist components in compact mode.

### 4. Owner dashboard

Dashboard should be clean, usable, and less decorative than public pages.

Dashboard routes:

```txt
/dashboard
/dashboard/wishlists
/dashboard/wishlists/[id]
/dashboard/wishlists/[id]/gifts
/dashboard/wishlists/[id]/design
/dashboard/wishlists/[id]/settings
```

Wishlist detail tabs:

- Resumen
- Regalos
- Diseño
- Configuración

Desktop/tablet: tabs.  
Mobile: dropdown/select.

Dashboard list empty state:

> Aún no tienes wishlists  
> Crea tu primera wishlist para un baby shower, cumpleaños, boda, nuevo hogar o cualquier momento especial.

CTA:

> Crear wishlist

Overview metrics:

- Regalos totales
- Regalos disponibles
- Regalos comprados
- Progreso de compras

Recent purchases section:

> Últimas compras

Publish readiness checklist:

> Para publicar tu wishlist, completa lo siguiente:

Items:

- Título
- Tipo de evento
- Enlace disponible
- Idioma y moneda
- Al menos 1 regalo visible

Archive/restore dialog:

> ¿Restaurar esta wishlist?  
> Puedes restaurarla como borrador para editarla antes de compartirla, o publicarla nuevamente con el mismo enlace.

Actions:

- Restaurar como borrador
- Restaurar publicada

## Theme presets

Design 6 theme presets.

Themes:

1. `dulce-rosa` — Dulce Rosa
2. `cielo-suave` — Cielo Suave
3. `jardin-verde` — Jardín Verde
4. `crema-elegante` — Crema Elegante
5. `lavanda-fiesta` — Lavanda Fiesta
6. `clasico-minimal` — Clásico Minimal

For each theme, specify:

- visual personality
- use case/event fit
- preview colors
- scoped CSS variable suggestions
- hero treatment
- card treatment
- button feel

Theme type:

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

Public themes must be scoped to the public wishlist wrapper. Dashboard uses default app theme.

## Layout presets

Design 3 layout presets:

1. `grid` — Galería
2. `editorial` — Editorial
3. `minimal` — Lista Minimal

For each layout, specify:

- page structure
- hero layout
- gift list/grid behavior
- mobile behavior
- best event fit
- component hierarchy

Default design by event type:

- Baby Shower: Cielo Suave + Editorial
- Birthday: Lavanda Fiesta + Galería
- Wedding: Crema Elegante + Editorial
- Housewarming: Jardín Verde + Lista Minimal
- General: Clásico Minimal + Galería

## Font pairings

Use `next/font`.

MVP pairings:

- `serif-soft`: Heading Lora, Body Inter
- `sans-modern`: Heading Inter, Body Inter
- `rounded-friendly`: Heading Nunito, Body Nunito

Default:

- `serif-soft`

Deferred:

- `classic-elegant`: Cormorant Garamond + Inter

## Button styles

MVP styles:

- `pill` — Píldora, default
- `rounded` — Redondeado

No square button style in MVP.

## Component structure constraints

Respect this structure:

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

Config structure:

```txt
src/config/
  public-themes.ts
  public-layouts.ts
  public-fonts.ts
  public-button-styles.ts
  event-type-presets.ts
  demo-wishlist.ts
```

Public layout components:

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

## Gift card variants

Design variants for:

- available
- partially purchased
- purchased
- hidden in dashboard only

Gift card should support:

- image or placeholder
- name
- store/domain
- optional price
- category
- priority badge `Infaltable`
- public note
- quantity progress
- status badge
- actions depending on state

## Purchase modal states

Design states:

1. Form
2. Loading
3. Success
4. Undo available
5. Undo expired/error
6. Purchase error

Fields:

- guest name required
- email optional
- phone optional
- message optional
- quantity selector if remaining > 1

Consent copy:

> Al marcar este regalo como comprado, compartiremos tu nombre y los datos opcionales que ingreses con el creador de la lista.

Success copy:

> ¡Gracias, María!  
> Tu regalo fue marcado como comprado.  
> Gracias por tu cariño y por ser parte de este momento.

Actions:

- Deshacer
- Cerrar

## Empty states

Use these exact public filter empty states:

No available:

> Todos los regalos disponibles ya fueron marcados como comprados.

CTA:

> Ver todos los regalos

No purchased:

> Aún no hay regalos marcados como comprados.

CTA:

> Ver regalos disponibles

No infaltables:

> No hay regalos marcados como infaltables en esta lista.

CTA:

> Ver todos los regalos

Empty category:

> No hay regalos en esta categoría.

CTA:

> Ver todos los regalos

## Sharing states

Design share panel for wizard success and dashboard overview.

Actions:

- Copiar enlace
- Compartir por WhatsApp
- Descargar QR

Copy success:

- Button state: `Copiado`
- Toast: `Enlace copiado`

Copy error:

> No pudimos copiar el enlace. Puedes seleccionarlo manualmente.

Slug change warning for published wishlists:

> Cambiar el enlace público hará que el enlace anterior y los QR ya compartidos dejen de funcionar.  
> También deberás descargar y compartir un nuevo QR.  
> Nuevo enlace: ...

## Tailwind/Shadcn implementation notes

Please include:

- recommended component hierarchy
- class composition strategy
- where to use Shadcn components
- where to create custom components
- mobile-first layout notes
- responsive breakpoints
- scoped theme variable approach
- examples of theme wrapper usage
- accessibility notes
- loading/skeleton states
- empty/error state patterns

Use scoped CSS variables on public wishlist wrapper, such as:

- `--background`
- `--foreground`
- `--card`
- `--card-foreground`
- `--primary`
- `--primary-foreground`
- `--accent`
- `--accent-foreground`
- `--border`
- `--ring`

Public components should use semantic utility classes:

- `bg-background`
- `text-foreground`
- `bg-card`
- `text-card-foreground`
- `border-border`
- `text-muted-foreground`

## Final instruction

Produce a practical, implementation-ready design brief. Be specific. Prefer concrete component guidance over generic design language.
