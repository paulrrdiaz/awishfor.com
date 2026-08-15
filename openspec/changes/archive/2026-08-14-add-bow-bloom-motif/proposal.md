## Why

The motif catalog ships eight sets and every one of them is an animal-plus-prop pairing (bear, bunny, unicorn, fox, duck, elephant, dino, plus moon/stars). An owner decorating a baby shower or birthday wishlist who does not want a cartoon animal on their page has no option other than "Sin motivo". A flowers-and-ribbons set closes that gap with the decorative vocabulary — bows, blooms, muted rose and sage — that reads as celebratory without being a character.

## What Changes

- Add a ninth motif set, `bow-bloom` ("Lazos y flores"), tagged for both `baby_shower` and `birthday`, with `cielo-suave-rosa` as its suggested theme.
- Add two new `MotifShape` union members and their `SHAPE_SVGS` entries: `bow` (primary, 48×40 native) and `bloom` (secondary, 40×40 native), authored in the shipped ink-outline plus `color-mix()` shading style rather than the flat first-pass style.
- Give the set a muted, baby-shower-first fixed palette (dusty rose body, cream detail, plum ink) and a `secondaryColors` entry so blooms carry their own peach/sage identity instead of repeating the bow's rose, the same mechanism `forest-fox` and `duck-boat` already use.
- Update the catalog and picker specs, whose current requirements hardcode "eight sets" and name the exact three sets tagged for `birthday`.

Non-goals, called out because they are adjacent and easy to mistake as included:

- **Not** re-authoring the ten shapes still rendering in the flat first-pass style (`bear`, `fox`, `cloud`, `flower`, `rainbow`, `tree`, `boat`, `balloon`, `star`, `leaf`). `svg-motif-illustrations` archived with that work unfinished; `bow-bloom` ships in the finished style regardless, and the catch-up is a separate change.
- **Not** widening `MOTIF_GATED_EVENT_TYPES`. The set is gated to `baby_shower`/`birthday` like everything else, so no gate, store, wizard, or settings-form call site changes.
- **Not** changing the `MotifPreset` data shape, the `shapes` 2-tuple, placement logic, scale values, treatments, palettes, or persistence. A third shape (a sprig or stem) was considered and rejected — see design.md.
- **Not** adding a new theme preset. `cielo-suave-rosa` already exists and is unclaimed by any motif.

## Capabilities

### New Capabilities

(none — this adds a catalog entry and two shapes inside existing capabilities, not a new capability)

### Modified Capabilities

- `public-wishlist-motifs`: the "Motif catalog" requirement fixes the catalog at eight named sets, asserts "exactly eight entries", asserts the birthday-tagged set is exactly `unicorn-rainbow`/`elephant-balloon`/`moon-stars`, and requires every entry's fixed palette to match a hex value in `Motif Proposals.dc.html`. All four points change: nine sets, `bow-bloom` added to both the catalog list and the birthday list, and the design-source assertion scoped to the eight sets that actually originate from that file. Also gains a new requirement fixing the per-role legibility contract that decided this set's shape assignment. That requirement binds shapes authored from it onward only — `star` and `leaf` do not satisfy it at their smallest placement scales today, and this change does not re-author them, so the conformance debt is recorded in the requirement and inherited by the change that eventually pays down the flat-ten backlog.
- `motif-picker`: the "Picker offers only motifs tagged for the event type" requirement's scenarios name "all eight sets" for `baby_shower` and exactly three sets for `birthday`. Both become nine and four respectively.

Both are delivered as REMOVED-plus-ADDED rather than MODIFIED: three of the affected scenario headers carry the stale counts in the header text itself ("Catalog exposes eight sets…", "Three sets are tagged for birthday", "Baby shower sees all eight sets"), and OpenSpec has no scenario-rename operation — a MODIFIED block must reproduce every existing scenario header verbatim, which would leave headers asserting eight while their bodies assert nine. Each removal is a one-for-one restatement with the normative rules carried over unchanged; the Reason and Migration notes in the delta files record that.

## Impact

- **Code**: `src/config/motifs.ts` (`MotifId` union, `MOTIF_IDS`, `MotifShape` union, one `MOTIF_PRESETS` entry), `src/components/shared/motif/motif-shape-svgs.tsx` (two new `SHAPE_SVGS` entries).
- **Tests**: `src/config/motifs.test.ts` (two `toHaveLength(8)` assertions and the birthday-ids assertion), `src/components/shared/motif/motif-shape.test.tsx` (literal shape list the per-shape suite iterates), `src/components/features/wishlist/motif-picker.test.tsx` (any count- or id-sensitive assertions).
- **Storybook**: `src/components/shared/motif/motif-shape.stories.tsx` derives its grid from `MOTIF_PRESETS`, so the new set appears with no edit — but every cell renders at scale 1, which is not where these shapes are at risk. A scale-ladder story is added so the legibility checks have a vehicle.
- **Consumers unaffected**: `MotifScatter`, `MotifSeal`, `MotifSticker`, `MotifBand`, `MotifDivider`, `MotifPicker`, and `PublicThemeProvider` all read the catalog and shape registry generically — no call-site changes.
- **No schema, migration, validator, or API changes.** `wishlistMotifIdSchema` derives its enum from `MOTIF_IDS`, and the save-draft event-type gate derives from `preset.eventTypes`, so both pick the new set up automatically.
