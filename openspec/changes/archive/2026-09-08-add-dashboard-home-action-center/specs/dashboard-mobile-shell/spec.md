## MODIFIED Requirements

### Requirement: Three mobile chrome modes

Below the `md` breakpoint the protected dashboard SHALL present one of three chrome modes, chosen by the route rather than by responsive utilities on shared markup.

- **Root mode** — a title bar carrying the signed-in user's avatar, the screen's title, and at most one overflow control, plus the bottom tab bar. Applies to Inicio, Datos, and Cuenta. The title bar SHALL NOT carry a back affordance, because a root route has nothing to go back to. An overflow control SHALL be rendered only when it opens at least one action that resolves.
- **Section mode** — the wishlist context bar, the section chip row, an optional action bar, and the bottom tab bar. Applies to the wishlist sections that are browsing surfaces.
- **Editor mode** — a bar carrying a back affordance, the screen title, and a save affordance; no chip row and no bottom tab bar; a commit bar pinned to the bottom. Applies to screens whose whole purpose is editing a pending draft.

A route SHALL render exactly one chrome mode. At `md` and above none of the three SHALL render and the desktop sidebar, topbar, and section tabs SHALL remain the chrome.

#### Scenario: A root route wears root mode

- **WHEN** the owner opens Inicio below `md`
- **THEN** a title bar renders with their avatar and the title `Inicio`, together with the bottom tab bar
- **AND** no back affordance renders

#### Scenario: A browsing section wears section mode

- **WHEN** the owner opens Regalos below `md`
- **THEN** the context bar, the chip row, and the bottom tab bar all render

#### Scenario: An editing section wears editor mode

- **WHEN** the owner opens Ajustes or Tema below `md`
- **THEN** the chip row and the bottom tab bar are absent, and a commit bar renders in their place

#### Scenario: An empty overflow is omitted

- **WHEN** a root route has no action to offer behind its overflow control
- **THEN** no overflow control renders in its title bar

#### Scenario: Desktop keeps its own chrome

- **WHEN** the viewport is at `md` or above
- **THEN** no mobile chrome renders and the sidebar, topbar, and section tabs render
