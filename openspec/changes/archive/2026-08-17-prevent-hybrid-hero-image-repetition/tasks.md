## 1. Shared image allocation

- [x] 1.1 Add an order-preserving hero-image partition helper that returns two null-padded static slots and the remaining carousel images without mutating records or dropping metadata.
- [x] 1.2 Add focused unit tests for zero through six images, covering order, null padding, `isSample` preservation, and disjoint static/carousel ownership.

## 2. Hybrid layout integration

- [x] 2.1 Update `arch-trio` so its medium and small frames use ordered images 1 and 2, its large frame receives only images 3 onward, and obsolete carousel `startIndex` behavior is removed.
- [x] 2.2 Add the responsive white border to the Arch Trio large gallery frame so it applies to placeholder, single-image, and multi-image states.
- [x] 2.3 Update `collage-staggered` so its two primary side frames use ordered images 1 and 2 and its center carousel receives only images 3 onward, while preserving its separate decorative Polaroid treatment.
- [x] 2.4 Update carousel-support comments or guidance that currently imply hybrid carousel controls appear whenever the wishlist has two total cover images.

## 3. Regression coverage and validation

- [x] 3.1 Add focused layout regression tests proving that three total images produce one control-free carousel-frame image and four or five images expose only the ordered remainder as slides in both hybrid layouts.
- [x] 3.2 Add regression coverage proving the Arch Trio large frame carries its white responsive border in both single-image fallback and multi-slide carousel states.
- [x] 3.3 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`, address failures caused by this change, and record any unrelated failures before marking implementation complete.
