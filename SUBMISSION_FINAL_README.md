## Platform Name Definition

**Constanlation** combines three core ideas that define the protocol’s identity and direction:

- **Constant** → stability, predictable rules, and dependable vault behavior
- **Constellation** → a connected on-chain universe that reflects the broader Polkadot ecosystem
- **Translation** → future interoperability, cross-chain coordination, and XCM-oriented expansion

Together, **Constanlation** represents a governed vault system built for **stable, transparent, and connected strategy allocation**. The name reflects both the protocol’s current product design and its long-term vision: a structured DeFi vault experience that can grow from a single managed vault into a broader multichain capital layer across Polkadot.

The spelling **Constanlation** is intentional: a blended protocol brand that captures the three concepts above in one identity.

---

## Features

### 1. Governance-First Vault Architecture

**Constanlation** is built as a **curated vault protocol**, not an open strategy marketplace. This creates a more structured and trustworthy DeFi experience:

- **Approved strategies only:** Vault strategies must be explicitly approved rather than freely added without oversight.
- **Governance-aligned operations:** Strategy activation, limits, and permissions are tied to visible protocol controls.
- **Clear operational accountability:** Users can understand who manages allocation, who protects the vault, and how emergency actions work.
- **Auditable product flow:** The vault lifecycle is designed to be easier to inspect, monitor, and explain to both users and judges.

### 2. Multi-Role Vault Operations

**Constanlation** demonstrates a full operational lifecycle across multiple protocol roles:

- **Admin configuration:** Admins can deploy and configure the vault environment.
- **Strategist actions:** Strategists manage capital allocation and harvesting within allowed boundaries.
- **Guardian protection:** Guardians can pause or trigger emergency protections when risk conditions appear.
- **Keeper automation:** Keepers execute automation and operational tasks that help maintain protocol flow.
- **Depositor participation:** Users can deposit, withdraw directly when liquidity is available, or use queued exits when needed.

### 3. Transparent Exit Mechanics

One of **Constanlation**’s strongest user-facing goals is to make vault exits understandable and visible:

- **Direct withdrawal when liquid:** Users can exit immediately when enough idle liquidity exists.
- **Queued withdrawal when needed:** If liquidity must be managed across strategies, users can request withdrawal through a queue-based flow.
- **Claim-based settlement flow:** Queued exits can later be claimed once processed.
- **Visible queue state:** Users are not left guessing how exits work or where their request stands.

### 4. Vault Discovery and Monitoring

**Constanlation** is designed as a complete vault product experience, not just a contract demo:

- **Vault discovery:** Users can browse available vaults and access vault detail pages.
- **Performance visibility:** Vault-level metrics and operational state are surfaced in the UI.
- **Governance visibility:** Users can inspect approved strategies, role actions, and control layers.
- **Risk visibility:** Safety state, guardian powers, and protocol protections are part of the product experience.
- **Activity tracking:** Historical actions and vault events are made easier to follow.

### 5. Portfolio and Role-Based Experience

**Constanlation** maps protocol behavior into a more usable interface for different actors:

- **Depositor portfolio view:** Users can track positions, requests, and claims.
- **Operator workspaces:** Strategist, guardian, and keeper actions are separated into role-relevant flows.
- **Permission-aware UX:** The interface reflects actual protocol roles and responsibilities.
- **Cleaner protocol understanding:** This reduces hidden governance assumptions and improves product clarity.

### 6. PVM-Native Solidity Approach

**Constanlation** is also a practical demonstration of building DeFi with Solidity in the Polkadot ecosystem:

- **Solidity-native developer flow:** The protocol uses a familiar smart-contract development approach.
- **PVM ecosystem relevance:** It helps showcase how vault-style DeFi products can run in Polkadot’s EVM-compatible execution environment.
- **Transaction-rich product design:** Deposits, withdrawals, claims, governance actions, keeper actions, and safety controls all contribute to meaningful on-chain activity.
- **Polkadot-aligned application layer:** Rather than copying a generic EVM vault, **Constanlation** is positioned as a DeFi product that helps demonstrate the power of building on Polkadot.

### 7. XCM-Oriented Expansion Direction

**Constanlation** is designed with future ecosystem connectivity in mind:

- **Cross-chain-ready product direction:** The architecture is not framed as a single isolated vault forever.
- **XCM-oriented thinking:** The protocol direction supports future liquidity routing and broader ecosystem coordination.
- **Connected capital layer vision:** Vault participation can evolve toward a wider Polkadot capital network.
- **Stronger ecosystem narrative:** This helps present **Constanlation** as a protocol that can grow with Polkadot’s multichain architecture.

---

## Benefits

### For Depositors

- **Simplified yield access:** Users enter through one managed vault instead of juggling multiple protocols manually.
- **Better transparency:** Governance, risk, strategy approval, and exit mechanics are easier to understand.
- **Safer participation model:** Structured roles and visible protections reduce uncertainty.
- **Flexible exits:** Users can withdraw directly when liquidity is available or use a queued flow when capital is allocated.

### For Protocol Operators

- **Clear separation of responsibilities:** Admin, strategist, guardian, and keeper roles each have well-defined duties.
- **Safer day-to-day management:** Operational controls reduce reliance on informal off-chain coordination.
- **Improved auditability:** Role actions and vault state can be monitored more clearly.
- **Scalable governance structure:** The protocol can evolve without collapsing everything into one operator role.

### For the Polkadot Ecosystem

- **More meaningful on-chain activity:** Vault interactions generate repeated protocol usage, not just one-time demos.
- **Showcasing PVM utility:** **Constanlation** demonstrates how Solidity-based DeFi products can be built in Polkadot’s execution environment.
- **Stronger DeFi narrative:** It brings a governance-first vault model into the ecosystem rather than a simple forked experience.
- **Cross-chain future potential:** XCM-oriented design helps position the protocol for broader ecosystem participation over time.

---

## Tech Stack

- **Frontend framework:** **Next.js 16** with **React 19** and TypeScript for a modern app-router based dApp UI.
- **Styling and UI system:** **Tailwind CSS 4**, custom UI components, and animation libraries for role-based product flows.
- **Wallet and Web3:** **Reown AppKit**, **wagmi**, and **viem** for wallet connection, chain interaction, and contract calls.
- **Data and indexing layer:** Hybrid model that combines live on-chain reads with indexed event/history views.
- **Backend and persistence:** Next.js API routes with **Prisma** + **PostgreSQL** (`@prisma/client`, `@prisma/adapter-pg`, `pg`).
- **Smart-contract layer:** Solidity vault protocol architecture with governance, strategy, queue, and automation flows.
- **Deployment target:** Built for Polkadot EVM-compatible execution context (PVM-aligned product direction).

---

## Demo Evidence

- **Slide demo (Demo video available in slides):** https://www.canva.com/design/DAHEaLlWJy0/Fkk4dBNhttb3v7mSGdxG2w/edit?ui=eyJBIjp7fX0&referrer=https%3A%2F%2Fwww.canva.com%2Fs%2Ftemplates%3Fquery%3D%26adj%3DeyJFIjp7IkEiOiJ0QUV4UkxnODFSSSJ9fQ
- **Coverage:** Product flow, role-based operations, vault UX, and withdrawal queue/claim behavior are shown in the demo slides.

---

## Security

Security and transparency are core to **Constanlation**’s design. The protocol emphasizes:

- **Explicit safety controls:** Guardian and governance actions are not hidden behind vague admin behavior.
- **Structured operational permissions:** Roles reduce ambiguity around who can do what.
- **Visible risk framework:** Strategy approval, limits, and emergency protections are part of the product model.
- **Auditable flows:** Deposits, exits, queue handling, and operational actions are designed to be inspectable.
- **Reduced hidden governance risk:** Users can better understand the control structure behind the vault.

---

## OpenZeppelin Sponsor Highlight

For the OpenZeppelin sponsor track, **Constanlation** emphasizes practical use of proven OpenZeppelin security and access-control primitives inside a full vault product lifecycle.

### What We Use

- **ERC-4626 vault standard:** Tokenized vault behavior for share-based deposit/mint/withdraw/redeem flows.
- **AccessControl patterns:** Role-gated protocol operations for admin/strategist/guardian/keeper-style responsibilities.
- **Ownable administration:** Ownership-protected administrative surfaces in factory/deployment management.
- **ReentrancyGuard protection:** Reentrancy mitigation around sensitive state-changing flows.
- **SafeERC20 integrations:** Safer token transfer handling across vault/strategy interaction points.
- **ERC20-standard behavior:** Vault/token interactions aligned with established ERC20 expectations.

### What We Do With It

- **Enforce role boundaries:** Operational powers are explicit and not mixed into a single opaque admin path.
- **Use standardized vault semantics:** Deposits, minting, withdrawals, and redemptions follow ERC-4626-style behavior for clearer integrator expectations.
- **Harden capital movement paths:** Deposit, withdrawal, queue processing, and claim-related flows are protected with established defensive patterns.
- **Improve auditability:** Standardized OpenZeppelin primitives make behavior easier to inspect and reason about.
- **Support user trust in production-like flows:** Security controls are integrated into real operator/depositor UX, not isolated in a toy contract demo.

---

## Our Flow Illustration

### 1. Vault Creation and Configuration

- Admin deploys and configures the vault environment.
- Governance structure and permissions are established.
- Approved strategies and limits are prepared for operation.

### 2. Depositor Entry

- User discovers a vault.
- User deposits assets into the vault.
- User receives vault shares representing proportional ownership.

### 3. Strategy Allocation and Operations

- Strategist allocates capital across approved strategies.
- Yield operations and harvesting are executed within permitted controls.
- Keeper assists with recurring operational tasks.

### 4. Safety and Guardian Intervention

- Guardian monitors risk conditions.
- If needed, guardian can pause or trigger emergency protections.
- Users gain visible assurance that safety actions exist and are actionable.

### 5. Withdraw and Queue Flow

- If enough liquid assets exist, user withdraws directly.
- If liquidity is constrained, user submits a queued withdrawal request.
- The queue state and exit path remain visible to the user.

### 6. Claim Processed Exit

- Once the queued exit is processed, the user claims the settled withdrawal.
- This makes exit mechanics more transparent than opaque vault behavior.