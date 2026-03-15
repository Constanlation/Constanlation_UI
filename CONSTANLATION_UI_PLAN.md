## Constantlation UI Plan

### Product line

**Constantlation — Curated vault registry, governed strategies, cross-chain ready.**

### Product meaning

- `constant` -> stability, predictable rules, dependable vault behavior
- `constellation` -> connected on-chain universe and Polkadot ecosystem feeling
- `translation` -> interoperability and future cross-chain / XCM expansion

### Core positioning

Constantlation is not an open marketplace.

It is a curated vault registry with:

- governance-approved strategies
- visible guardian controls
- transparent withdrawal queue mechanics
- consistent vault architecture
- cross-chain-ready product framing

## Design direction

### Primary goals

- premium fintech
- futuristic sci-fi
- institutional governance feel
- cleaner than Morpho
- less noisy than Beefy
- more guided than Yearn

### UX principles

- simplicity first
- trust before hype
- beauty without clutter
- advanced detail behind good information design
- visible safety and governance
- obvious core actions
- plain-language explanations for complex DeFi concepts

### Information hierarchy

1. trust, safety, and health
2. clear user actions
3. vault metrics
4. governance visibility
5. strategy detail
6. raw technical data

## Visual system

### Color palette

- base background: near-black matte
- primary accent: warm metallic gold
- secondary accent: champagne gold
- text: white / off-white
- secondary text: muted warm gray

### Visual balance

- 80% dark premium flat UI
- 20% controlled gold gradients

### Atmosphere

- subtle glow
- refined reflections
- elegant borders
- soft shadow
- cinematic spacing
- restrained constellation / network overlays

### Avoid

- purple or blue neon bias
- noisy galaxy art
- random gradients on every component
- generic crypto dashboard look
- APY-first marketplace spam
- too many decorative badges fighting for attention

### Typography

- headings: `Sora`
- body/UI text: `Inter`

Current repo note:

- the app uses `Sora` / `Inter` font-family tokens in CSS
- no local font files or logo asset were present in the repo
- the implemented UI therefore uses a fallback brand mark component and font-family tokens that can be swapped to bundled font files later without layout changes

### Motion

- home page gets the richest motion treatment
- use layered background motion, reveal timing, and guided section pacing
- app pages stay more functional and restrained
- parallax feel should come from composition and depth, not gimmicks

### Constellation motif

Use subtle-to-medium constellation / node / connected-line visuals in:

- hero atmosphere
- section dividers
- background overlays
- premium stat moments
- flagship vault storytelling

Do not turn the product into space-themed decoration.

## Product architecture

### Route hierarchy

This plan aligns to the actual route structure in the app:

| Page                                           | Route                       |
| ---------------------------------------------- | --------------------------- |
| Home / Landing                                 | `/`                         |
| Vault Directory                                | `/vaults`                   |
| Vault Overview                                 | `/vaults/[slug]`            |
| Deposit / Withdraw / Redeem / Request Withdraw | `/vaults/[slug]/actions`    |
| Portfolio                                      | `/portfolio`                |
| Strategies                                     | `/vaults/[slug]/strategies` |
| Governance                                     | `/vaults/[slug]/governance` |
| Guardian / Safety                              | `/vaults/[slug]/guardian`   |
| Activity / Audit Log                           | `/vaults/[slug]/activity`   |
| Withdrawal Queue                               | `/vaults/[slug]/queue`      |

### Navigation model

- top navigation for the whole product
- secondary vault navigation for vault-specific pages
- desktop-first layout with responsive fallback
- homepage is featured-vault-first
- app is directory-first

### Current demo vault set

- `polaris-prime` -> flagship vault, review state
- `atlas-core` -> conservative healthy vault
- `orion-recovery` -> restricted / critical recovery vault

This gives the UI a meaningful range of health states for demo and judging.

## Role-aware UX

### Supported roles

- user / liquidity provider
- strategist
- governance admin / governance manager
- guardian
- keeper / automation operator

### Rule

- important transparency pages stay visible to everyone
- privileged actions show only for authorized wallets
- permissions are explained in plain language

### Current demo role posture

The static demo uses one connected wallet model that can illustrate multiple role states:

- strategist on the flagship vault
- governance admin on the flagship vault
- guardian on the recovery vault

This lets the UI demonstrate both:

- visible management surfaces when authorized
- read-only transparency when not authorized

## Page blueprints

### 1. Home / Landing

Purpose:

- impress judges immediately
- explain the product in one glance
- showcase the flagship vault

Must communicate:

- curated vault registry
- governed strategies
- visible safety controls
- queue transparency
- cross-chain-ready future

Structure:

- cinematic hero
- featured vault spotlight
- platform trust metrics
- differentiator story blocks
- premium product map for all 10 pages

Implementation note:

- current app uses custom native components for the hero and reveal sections
- if React Bits components are added later, swap them into the hero, showcase blocks, and section transitions first

### 2. Vault Directory

Purpose:

- feel like a curated registry, not a yield marketplace

Requirements:

- health-first vault cards
- clean filter and sort posture
- trust signals before APY
- clear featured vault option

Every card should surface:

- vault name and symbol
- asset
- TVL
- APY
- price per share
- idle ratio
- strategy count
- health badge
- paused / restricted state
- governance-approved status
- guardian-protected status
- queue obligations
- clear CTA

### 3. Vault Overview

Purpose:

- be the core vault intelligence page

Requirements:

- premium stat cards
- health banner
- allocation visualization
- governance and guardian summary
- strong CTA row
- plain-language liquidity notes

Must show:

- TVL
- price per share
- APY
- idle liquidity
- free idle
- queued assets
- strategy assets
- strategy count
- withdrawal fee
- idle target
- rebalance slack
- target idle amount
- rebalance need
- pause state
- last rebalance / last harvest context

### 4. Actions

Purpose:

- make deposit and exit decisions clear before signing

Requirements:

- four-tab action surface
- `Deposit`
- `Withdraw`
- `Redeem`
- `Request Withdraw`

Must include:

- plain-language action explanation
- result preview cards
- fee visibility
- liquidity note
- disabled / warning / paused state handling
- visible comparison table for withdraw vs redeem vs request withdraw

### 5. Portfolio

Purpose:

- explain not just ownership, but exposure and redeemability

Requirements:

- personal dashboard feel
- holdings summary
- redeemable estimate
- equivalent assets
- max redeem / max withdraw
- PnL
- effective strategy exposure
- pending queue entries
- recent user actions

### 6. Strategies

Purpose:

- translate strategy mechanics into readable product language

Requirements:

- strategy cards or hybrid table/cards
- destination
- yield source
- cap
- target
- status
- allocation gap
- managed assets
- PnL
- automation policy
- cooldown info

Role rule:

- strategist controls only show when the connected wallet is authorized

### 7. Governance

Purpose:

- make governance feel institutional, serious, and productized

Requirements:

- visible to all
- admin controls only for authorized wallets
- config cards
- approved strategy list
- role assignments
- event history

Must show:

- withdrawal fee
- treasury
- idle ratio
- rebalance slack
- governance manager
- strategy count
- approved strategy states
- role assignment visibility
- governance timeline

### 8. Guardian / Safety

Purpose:

- make safety a first-class differentiator

Requirements:

- visible to all
- guardian action panel only for guardian wallets
- clear state system:
  - Healthy
  - Review
  - Restricted
  - Paused
  - Critical

Must answer:

- is the vault safe now
- what is restricted
- what can users do right now
- what the guardian did

Must include:

- user impact matrix
- panicked strategy section
- automation safety note
- guardian actions
- safety timeline

### 9. Activity / Audit Log

Purpose:

- give the protocol an observable, trustworthy operating surface

Requirements:

- timeline + table hybrid
- powerful filter posture
- links to related entities
- event categories by actor type

Each row should support:

- event name
- actor
- timestamp
- affected entity
- tx hash reference
- category tag

### 10. Withdrawal Queue

Purpose:

- treat the queue as one of Constantlation's signature pages

Requirements:

- queue overview
- depth indicators
- idle vs queued coverage
- entry table
- settlement explanation
- single-entry processing explanation
- snapshot pricing explanation
- residual handling explanation

Design goal:

- make the queue visually memorable and operationally clear

## Shared component rules

Use:

- matte luxury cards
- subtle gold borders and highlights
- premium CTA buttons
- elegant tabs
- smooth hover transitions
- polished modals / drawers when later wired
- refined charts and bars
- meaningful empty states

## Content and language rules

### Tone

- balanced
- intelligent
- not overly technical on first impression
- not beginner-only

### Explanation style

- use tooltips, info popovers, or modal hooks for advanced concepts
- avoid unexplained jargon in primary content blocks
- label permissions in plain language
- explain liquidity posture with phrases like:
  - available now
  - partial available
  - strategy unwind required

## Data and implementation requirements

The visual design needs more than direct contract reads.

### Required support data

- indexed role membership snapshots
- queue entity indexing
- transaction input decoding for exit method labeling
- price-per-share history for APY and charts
- off-chain strategy metadata
- deployment metadata for vault, governance manager, controller, and factory addresses

### Current implementation approach in this repo

- static mock data drives the product UI
- the static content is intentionally structured around real contract concepts
- route hierarchy and role visibility are ready for real data wiring

### Recommended next integration steps

1. replace mock vault records with indexer-backed data loaders
2. connect wallet and permission state
3. wire action tabs to real contract calls and previews
4. swap the fallback brand mark for the final logo asset
5. bundle exact Sora and Inter font files for deterministic typography

## Final design standard

Constantlation should feel:

- cleaner than Morpho
- less noisy than Beefy
- more guided than Yearn
- premium enough for judges
- understandable enough for normal users
- strong enough for advanced users

Final tagline to keep prominent:

**Constantlation — Curated vault registry, governed strategies, cross-chain ready.**

# Reactbits component installation

Installation

Below are example commands for the SplitText component. Replace placeholders to fit your stack.
shadcn

npx shadcn@latest add https://reactbits.dev/r/<Component>-<LANG>-<STYLE>

<LANGUAGE> + <STYLE> combinations:

    JS-CSS - JavaScript + Plain CSS
    JS-TW - JavaScript + Tailwind
    TS-CSS - TypeScript + Plain CSS
    TS-TW - TypeScript + Tailwind
