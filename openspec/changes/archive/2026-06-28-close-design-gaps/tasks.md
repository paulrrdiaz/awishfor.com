## 1. Wishlist dressCode field (TASKS 1.2)

- [x] 1.1 Add `dressCode String?` to the `Wishlist` model in `prisma/schema.prisma`
- [x] 1.2 Run `pnpm prisma migrate dev` (additive nullable column) and regenerate the client
- [x] 1.3 Add optional `dressCode` to the wishlist validator schema in `src/server/validators/wishlist.schema.ts`
- [x] 1.4 Thread `dressCode` through wishlist create/update in `src/server/services/wishlist.service.ts`
- [x] 1.5 Carry `dressCode` in `src/server/mappers/public-wishlist.mapper.ts` and the dashboard wishlist mapper, with view-model types updated
- [x] 1.6 Tick TASKS.md 1.2 dress-code task

## 2. Event-type preset defaults (TASKS 4.1)

- [x] 2.1 Set `defaultThemeId`/`defaultLayoutId` per event type in `src/config/event-type-presets.ts` to the brief table: baby_shower→`cielo-suave`+`editorial`, birthday→`lavanda-fiesta`+`grid`, wedding→`crema-elegante`+`editorial`, housewarming→`jardin-verde`+`minimal`, general→`clasico-minimal`+`grid`
- [x] 2.2 Verify each id resolves against `src/config/public-themes.ts` and `src/config/public-layouts.ts`
- [x] 2.3 Tick TASKS.md 4.1 default-by-event-type task

## 3. Public wishlist layout (TASKS 3.4)

- [x] 3.1 Add the event-details section: 3 cards (Fecha · Lugar · Código de vestimenta) in the public layout, omitting empty cards and the whole section when all are empty
- [x] 3.2 Update the `Countdown` component states to `Faltan N días` · `Falta 1 día` · `Es hoy` · post-event `Gracias por celebrar con nosotros.`, recomputing client-side and flipping at T-0
- [x] 3.3 De-emphasize purchased gifts in `GiftCard`/`GiftList`: ~60% opacity + line-through name, sorted below available gifts
- [x] 3.4 Tick TASKS.md 3.4 event-details, countdown, and de-emphasis tasks

## 4. Public gift filters (TASKS 3.5)

- [x] 4.1 Render filter chips in `src/components/features/wishlist/public-filters.tsx` as a scroll-snap toggle group with per-chip `aria-pressed`; active chip inverted (`bg-foreground text-background`)
- [x] 4.2 Apply exact empty-filter copy + CTAs (Disponibles / Comprados / Infaltables / category) per the filters spec, each resetting to `Todos`/available
- [x] 4.3 Tick TASKS.md 3.5 chip toggle group and empty-copy tasks

## 5. Guest purchase modal (TASKS 6.2)

- [x] 5.1 Make `src/components/features/wishlist/purchase-gift-modal.tsx` render as a bottom sheet below `md` and a centered dialog at `md+`, with a sticky 48px footer
- [x] 5.2 Set the exact consent copy: "Al marcar este regalo como comprado, compartiremos tu nombre y los datos opcionales que ingreses con el creador de la lista."
- [x] 5.3 Tick TASKS.md 6.2 bottom-sheet and consent-copy tasks

## 6. Wizard Details + slug step (TASKS 4.4)

- [x] 6.1 Add the optional dress-code ("Código de vestimenta") field to `details-step.tsx`, persisting to the wizard store
- [x] 6.2 Apply exact slug-state copy: `◌ Verificando…` · `✓ Disponible` (green ring) · `✕ Ya está en uso` · `✕ Solo letras, números y guiones`
- [x] 6.3 Apply exact past-date copy: "Esta fecha ya pasó. Puedes continuar, pero el contador mostrará un mensaje de cierre."
- [x] 6.4 Tick TASKS.md 4.4 dress-code, slug-copy, and past-date tasks

## 7. Wizard Design step (TASKS 4.5)

- [x] 7.1 Label the embedded preview in `design-step.tsx` "Vista previa con ejemplos"
- [x] 7.2 Show all seven theme swatches including `cielo-suave-rosa`
- [x] 7.3 Tick TASKS.md 4.5 preview-label and seven-swatch tasks

## 8. Wizard Publish step (TASKS 4.8)

- [x] 8.1 Label the final preview "Vista previa de tu wishlist" and add auth-gate copy "tu progreso ya está guardado" in `publish-step.tsx`
- [x] 8.2 Ensure publish-success state shows the five labeled actions: Copiar enlace · Compartir por WhatsApp · Descargar QR · Ver lista pública · Gestionar en dashboard
- [x] 8.3 Tick TASKS.md 4.8 final-preview-label and publish-success tasks

## 9. Validation

- [x] 9.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; fix any fallout
- [x] 9.2 Manually verify each refined surface (public page, filters, modal, wizard steps) against the exact copy
- [x] 9.3 Confirm all 8 TASKS.md items now have every task checked
