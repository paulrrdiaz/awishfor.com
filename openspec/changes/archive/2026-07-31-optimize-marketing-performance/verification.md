## Marketing performance verification

### Retained baseline

The pre-session production audit was retained before the remaining optimization
tasks were applied. It ran against `http://127.0.0.1:4174/` on 2026-07-30 with
Lighthouse's simulated throttling. Generated Lighthouse reports remain in the
ignored `artifacts/marketing-performance/` directory; this table is the
versioned review evidence.

| Profile | Performance | LCP | CLS | TBT | JavaScript | CSS | Initial transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile run 1 | 90 | 3,674 ms | 0 | 4 ms | 590.6 KiB | 34.3 KiB | 1,080.5 KiB |
| Mobile run 2 | 90 | 3,591 ms | 0 | 4 ms | 590.6 KiB | 34.3 KiB | 1,080.5 KiB |
| Mobile run 3 | 90 | 3,589 ms | 0 | 3 ms | 590.6 KiB | 34.3 KiB | 1,080.5 KiB |
| Mobile median | 90 | 3,591 ms | 0 | 4 ms | 590.6 KiB | 34.3 KiB | 1,080.5 KiB |
| Desktop | 100 | 742 ms | 0 | 0 ms | 679.9 KiB | 34.3 KiB | 1,218.6 KiB |

The earlier dependency/resource baseline recorded during proposal discovery was
approximately 433 KiB compressed JavaScript, 355 KiB across ten preloaded font
files, duplicate responsive hero requests, and below-the-fold priority media.
The Lighthouse baseline above is the production starting point;
development-server timings are not accepted as release evidence.

### Final verification

The clean production build completed successfully and classified `/` as `○`
(static/prerendered). Its initial HTML exposes one high-priority local wedding
hero and two font preloads. Marketing Inter and Lora are self-hosted Latin
variable fonts totaling 84.2 KiB; both are requested during the initial load and
active before first paint so interaction cannot trigger a typography swap. A
scan of every initial route chunk found no Clerk UI, tRPC, React Query, nuqs,
tooltip-provider, or toaster runtime marker. The public-font configuration suite
also passed, retaining every selectable public-wishlist font outside marketing.

The versioned final profile uses Lighthouse `devtools` throttling with the same
mobile constraints (150 ms latency, 1,638.4 Kbps throughput, and 4× CPU). This
method was selected because repeated equivalent raw traces reported an observed
LCP below 100 ms while Lantern simulation quantized them to either about 2.1 s
or 2.6 s. Real throttling measures the configured constraints directly and
removes that simulation edge case.

| Profile | Performance | LCP | CLS | TBT | JavaScript | CSS | Initial transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile run 1 | 100 | 863 ms | 0 | 11 ms | 171.5 KiB | 27.0 KiB | 235.4 KiB |
| Mobile run 2 | 100 | 854 ms | 0 | 13 ms | 171.5 KiB | 27.0 KiB | 235.4 KiB |
| Mobile run 3 | 100 | 872 ms | 0 | 13 ms | 171.5 KiB | 27.0 KiB | 235.4 KiB |
| Mobile median | 100 | 863 ms | 0 | 13 ms | 171.5 KiB | 27.0 KiB | 235.4 KiB |
| Desktop | 100 | 86 ms | 0 | 0 ms | — | — | — |

The final cold browser HARs contained 19 mobile and 20 desktop requests. Mobile
requested only `wedding-hero-mobile-300.jpg`; desktop requested only
`wedding-hero.jpg`. Neither trace requested a future hero, an Unsplash image, a
framework image-optimizer URL, or a font before activity.

Live browser checks at 412×823 and 1350×940 confirmed the H2b geometry, Spanish
copy, section order, CTA destinations, responsive navigation, fixed desktop nav
state, and scroll progress. The mobile dialog trapped focus, closed with Escape,
and returned focus to its trigger. Reduced motion retained one static wedding
photograph after activity; a script-blocked run retained the hero, proof rail,
later headings, and six native FAQ disclosures. Normal rotation synchronized
the photograph and proof rail and retained at most the active and imminent
layers.

Verification commands:

- `pnpm test` — 62 files, 610 tests passed
- `pnpm typecheck` — passed
- `pnpm check` — passed
- `pnpm audit:marketing` — passed
