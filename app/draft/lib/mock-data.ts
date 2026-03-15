export type HealthTone =
  | "healthy"
  | "review"
  | "restricted"
  | "paused"
  | "critical"
  | "neutral";

export type StrategyStatus = "Active" | "Monitoring" | "Panicked";

export type AllocationSegment = {
  label: string;
  amount: string;
  share: number;
  tone: HealthTone | "gold";
  note: string;
};

export type StrategyRecord = {
  id: string;
  name: string;
  destination: string;
  yieldSource: string;
  description: string;
  status: StrategyStatus;
  cap: string;
  target: string;
  allocationGap: string;
  assetsDeployed: string;
  targetAssets: string;
  managedAssets: string;
  pnl: string;
  automationPolicy: string;
  cooldown: string;
  maxAllocate: string;
  maxRecall: string;
  lastHarvest: string;
  lastRebalance: string;
  approved: boolean;
  active: boolean;
  autoManaged: boolean;
};

export type RoleAssignment = {
  role: string;
  holders: string;
  permission: string;
};

export type GovernanceEvent = {
  title: string;
  actor: string;
  time: string;
  summary: string;
  category: string;
};

export type ActivityEvent = {
  event: string;
  actor: string;
  timestamp: string;
  entity: string;
  tx: string;
  category: string;
};

export type QueueEntry = {
  id: string;
  owner: string;
  receiver: string;
  shares: string;
  netPayout: string;
  fee: string;
  grossObligation: string;
  status: string;
  settlementEta: string;
};

export type SafetyEvent = {
  title: string;
  time: string;
  actor: string;
  impact: string;
};

export type FormLine = {
  label: string;
  value: string;
  note?: string;
};

export type ActionFlow = {
  title: string;
  summary: string;
  helper: string;
  fields: FormLine[];
  preview: FormLine[];
  notice: string;
  buttonLabel: string;
};

export type VaultRecord = {
  slug: string;
  name: string;
  symbol: string;
  asset: string;
  assetSymbol: string;
  chain: string;
  featured: boolean;
  shortDescription: string;
  headline: string;
  heroTag: string;
  health: HealthTone;
  healthSummary: string;
  tvl: string;
  apy: string;
  pricePerShare: string;
  idleRatio: string;
  idleAssets: string;
  freeIdle: string;
  queuedAssets: string;
  strategyAssets: string;
  activeStrategies: string;
  withdrawalFee: string;
  idleTarget: string;
  rebalanceSlack: string;
  targetIdleAmount: string;
  needsRebalance: boolean;
  paused: boolean;
  lastRebalance: string;
  lastHarvest: string;
  queueDepth: string;
  queueCoverage: number;
  trustPoints: string[];
  overviewNotes: string[];
  allocation: AllocationSegment[];
  strategyRecords: StrategyRecord[];
  governanceParameters: FormLine[];
  governanceApprovedStrategies: FormLine[];
  roleAssignments: RoleAssignment[];
  governanceEvents: GovernanceEvent[];
  guardianState: {
    state: string;
    stateNote: string;
    automationStatus: string;
    automationNote: string;
    userImpact: Array<{
      action: string;
      healthy: string;
      review: string;
      restricted: string;
      paused: string;
    }>;
    panickedStrategies: FormLine[];
    guardianEvents: SafetyEvent[];
  };
  activityEvents: ActivityEvent[];
  queueEntries: QueueEntry[];
  queueExplainers: FormLine[];
  actionFlows: {
    deposit: ActionFlow;
    withdraw: ActionFlow;
    redeem: ActionFlow;
    requestWithdraw: ActionFlow;
  };
  permissions: {
    strategist: boolean;
    governance: boolean;
    guardian: boolean;
    keeper: boolean;
  };
};

export type HoldingRecord = {
  vaultSlug: string;
  vaultName: string;
  value: string;
  shares: string;
  redeemable: string;
  equivalentAssets: string;
  maxRedeem: string;
  maxWithdraw: string;
  pnl: string;
  exposure: AllocationSegment[];
  queueStatus: string;
};

export const appUser = {
  wallet: "0x7A41...90E2",
  profile: "Demo connected wallet",
  globalRoles: ["Liquidity provider"],
  highlightedPermissions: [
    "Strategist on Polaris Prime Vault",
    "Governance admin on Polaris Prime Vault",
    "Guardian on Orion Recovery Vault",
  ],
};

export const platformStats = [
  {
    label: "Curated vault registry",
    value: "4 vaults",
    detail: "Factory-backed registry with one consistent operating model.",
  },
  {
    label: "Protected TVL",
    value: "$67.9M",
    detail: "Health-led presentation across idle, deployed, and queued assets.",
  },
  {
    label: "Governance approvals",
    value: "11 live strategies",
    detail: "Every strategy is reviewed before it can receive capital.",
  },
  {
    label: "Queue transparency",
    value: "100% visible",
    detail: "Idle coverage, queue depth, and settlement mechanics stay public.",
  },
];

export const productPages = [
  {
    title: "Home",
    href: "/",
    summary: "Judge-facing showcase with flagship vault storytelling and premium motion.",
  },
  {
    title: "Vault Registry",
    href: "/vaults",
    summary: "Curated directory that leads with health, safety, and governance.",
  },
  {
    title: "Vault Overview",
    href: "/vaults/polaris-prime",
    summary: "Core vault page with stat cards, allocation clarity, and action entry points.",
  },
  {
    title: "Actions",
    href: "/vaults/polaris-prime/actions",
    summary: "Deposit, withdraw, redeem, and request withdraw in one guided flow.",
  },
  {
    title: "Portfolio",
    href: "/portfolio",
    summary: "Personal dashboard with holdings, queue state, and strategy exposure.",
  },
  {
    title: "Strategies",
    href: "/vaults/polaris-prime/strategies",
    summary: "Governed strategy catalog with readable risk and automation context.",
  },
  {
    title: "Governance",
    href: "/vaults/polaris-prime/governance",
    summary: "Transparent config surface with event history and role assignments.",
  },
  {
    title: "Guardian / Safety",
    href: "/vaults/polaris-prime/guardian",
    summary: "First-class safety page that explains current restrictions in plain language.",
  },
  {
    title: "Activity",
    href: "/vaults/polaris-prime/activity",
    summary: "Rich timeline and table hybrid for operational transparency.",
  },
  {
    title: "Withdrawal Queue",
    href: "/vaults/polaris-prime/queue",
    summary: "Signature queue page with depth, coverage, and settlement controls.",
  },
];

export const vaults: VaultRecord[] = [
  {
    slug: "polaris-prime",
    name: "Polaris Prime Vault",
    symbol: "CL-POL",
    asset: "USD Coin",
    assetSymbol: "USDC",
    chain: "Polkadot Asset Hub",
    featured: true,
    shortDescription:
      "Flagship stable vault with governed capital routing across reserve, lending, and liquidity sleeves.",
    headline:
      "Institutional-grade stable allocation with visible queue mechanics and governed strategy drift control.",
    heroTag: "Featured flagship vault",
    health: "review",
    healthSummary:
      "Healthy capital posture, but idle reserves are slightly below target and a strategist rebalance is recommended.",
    tvl: "$28.4M",
    apy: "11.8%",
    pricePerShare: "1.1284",
    idleRatio: "16%",
    idleAssets: "$4.6M",
    freeIdle: "$1.3M",
    queuedAssets: "$3.3M",
    strategyAssets: "$23.8M",
    activeStrategies: "3",
    withdrawalFee: "0.15%",
    idleTarget: "20%",
    rebalanceSlack: "4%",
    targetIdleAmount: "$5.7M",
    needsRebalance: true,
    paused: false,
    lastRebalance: "19 min ago",
    lastHarvest: "42 min ago",
    queueDepth: "$3.3M",
    queueCoverage: 39,
    trustPoints: [
      "Governance-approved multi-strategy routing",
      "Guardian protection with public safety events",
      "Queue state published alongside idle coverage",
    ],
    overviewNotes: [
      "Available now covers smaller exits immediately; larger exits lean on the queue or auto-recall.",
      "Idle is below target by $1.1M, so the strategist panel emphasizes a guided rebalance.",
      "No strategy is panicked and automation remains active within policy limits.",
    ],
    allocation: [
      {
        label: "Idle reserve",
        amount: "$4.6M",
        share: 16,
        tone: "gold",
        note: "Immediate liquidity buffer for exits and new allocations.",
      },
      {
        label: "Aave Prime Sleeve",
        amount: "$9.7M",
        share: 34,
        tone: "healthy",
        note: "Overcollateralized lending for core stable yield.",
      },
      {
        label: "Hydration Omnipool",
        amount: "$7.4M",
        share: 26,
        tone: "review",
        note: "Stable routing sleeve under closer allocation monitoring.",
      },
      {
        label: "Reserve Bills Ladder",
        amount: "$6.7M",
        share: 24,
        tone: "neutral",
        note: "Short-duration reserve sleeve for dependable carry.",
      },
    ],
    strategyRecords: [
      {
        id: "treasury-ladder",
        name: "Reserve Bills Ladder",
        destination: "Tokenized short-duration reserve bills",
        yieldSource: "Off-chain treasury carry mirrored on-chain",
        description:
          "Capital preservation sleeve used to keep predictable yield and support queue settlement windows.",
        status: "Active",
        cap: "30%",
        target: "22%",
        allocationGap: "-2.1%",
        assetsDeployed: "$6.7M",
        targetAssets: "$6.3M",
        managedAssets: "$6.8M",
        pnl: "+$145K",
        automationPolicy: "Harvest daily, rebalance every 6 hours",
        cooldown: "Harvest in 1h 14m",
        maxAllocate: "$800K",
        maxRecall: "$1.4M",
        lastHarvest: "4 hours ago",
        lastRebalance: "19 min ago",
        approved: true,
        active: true,
        autoManaged: true,
      },
      {
        id: "aave-prime",
        name: "Aave Prime Sleeve",
        destination: "Aave v3 prime stable markets",
        yieldSource: "Lending spread and protocol incentives",
        description:
          "Core lending sleeve with strong liquidity depth and low operational complexity.",
        status: "Active",
        cap: "40%",
        target: "35%",
        allocationGap: "+1.5%",
        assetsDeployed: "$9.7M",
        targetAssets: "$9.9M",
        managedAssets: "$9.8M",
        pnl: "+$382K",
        automationPolicy: "Harvest every 8 hours, recall only on drift",
        cooldown: "Rebalance in 2h 05m",
        maxAllocate: "$1.2M",
        maxRecall: "$1.7M",
        lastHarvest: "42 min ago",
        lastRebalance: "3 hours ago",
        approved: true,
        active: true,
        autoManaged: true,
      },
      {
        id: "hydration-omnipool",
        name: "Hydration Omnipool Router",
        destination: "Hydration stable routing liquidity",
        yieldSource: "Swap fees and incentive programs",
        description:
          "Liquidity sleeve used to capture ecosystem-native stable routing yield inside controlled exposure limits.",
        status: "Monitoring",
        cap: "30%",
        target: "25%",
        allocationGap: "+0.6%",
        assetsDeployed: "$7.4M",
        targetAssets: "$7.1M",
        managedAssets: "$7.5M",
        pnl: "+$214K",
        automationPolicy: "Automation capped and recall-friendly",
        cooldown: "Harvest in 38m",
        maxAllocate: "$650K",
        maxRecall: "$900K",
        lastHarvest: "2 hours ago",
        lastRebalance: "54 min ago",
        approved: true,
        active: true,
        autoManaged: true,
      },
    ],
    governanceParameters: [
      {
        label: "Withdrawal fee",
        value: "15 bps",
        note: "Treasury-directed and shown before every exit action.",
      },
      {
        label: "Treasury",
        value: "0x9fd...4a2C",
        note: "Receives withdrawal fees and residual sweep proceeds.",
      },
      {
        label: "Idle ratio",
        value: "20%",
        note: "Governed reserve target for predictable withdrawals.",
      },
      {
        label: "Rebalance slack",
        value: "4%",
        note: "Tolerance band before review state is triggered.",
      },
      {
        label: "Governance manager",
        value: "0x11e...7B4E",
        note: "Role-managed contract supervising strategy approvals.",
      },
      {
        label: "Approved strategies",
        value: "3 active",
        note: "No open marketplace listing is possible.",
      },
    ],
    governanceApprovedStrategies: [
      {
        label: "Reserve Bills Ladder",
        value: "Approved / Active / Auto-managed",
        note: "Cap 30%, target 22%.",
      },
      {
        label: "Aave Prime Sleeve",
        value: "Approved / Active / Auto-managed",
        note: "Cap 40%, target 35%.",
      },
      {
        label: "Hydration Omnipool Router",
        value: "Approved / Active / Auto-managed",
        note: "Cap 30%, target 25%.",
      },
    ],
    roleAssignments: [
      {
        role: "Governance admin",
        holders: "2 multisigs",
        permission: "Approves strategies, fees, treasury, and role changes.",
      },
      {
        role: "Strategist",
        holders: "1 operator wallet",
        permission: "Allocates, recalls, harvests, and builds rebalance plans.",
      },
      {
        role: "Guardian",
        holders: "1 security council",
        permission: "Pause, unpause, and panic a strategy when required.",
      },
      {
        role: "Keeper",
        holders: "2 automation workers",
        permission: "Permissionless queue settlement and controller automation.",
      },
    ],
    governanceEvents: [
      {
        title: "StrategyAutomationConfigUpdated",
        actor: "Governance admin",
        time: "Today, 08:14 UTC",
        summary:
          "Hydration Omnipool max allocate per execution reduced to keep recall headroom higher.",
        category: "Strategy config",
      },
      {
        title: "WithdrawalFeeUpdated",
        actor: "Governance admin",
        time: "Mar 12, 2026",
        summary: "Withdrawal fee held at 15 bps after treasury policy review.",
        category: "Fee policy",
      },
      {
        title: "GuardianUpdated",
        actor: "Governance admin",
        time: "Mar 9, 2026",
        summary: "Security council signer rotation completed for guardian coverage.",
        category: "Roles",
      },
      {
        title: "StrategyApproved",
        actor: "Governance admin",
        time: "Mar 1, 2026",
        summary: "Hydration Omnipool Router approved with a 30% cap and guarded automation.",
        category: "Strategy lifecycle",
      },
    ],
    guardianState: {
      state: "Review",
      stateNote:
        "The vault is safe for deposits and exits. Idle reserves are just under target, so operators should top up the free buffer.",
      automationStatus: "Automation active",
      automationNote:
        "Controller policies remain live, and no global automation pause is in effect.",
      userImpact: [
        {
          action: "Deposit",
          healthy: "Yes",
          review: "Yes",
          restricted: "Yes",
          paused: "No",
        },
        {
          action: "Withdraw / Redeem",
          healthy: "Yes",
          review: "Yes",
          restricted: "Yes",
          paused: "Yes",
        },
        {
          action: "Request withdraw",
          healthy: "Yes",
          review: "Yes",
          restricted: "Yes",
          paused: "Yes",
        },
        {
          action: "Allocate to strategy",
          healthy: "Yes",
          review: "Yes",
          restricted: "Limited",
          paused: "No",
        },
        {
          action: "Rebalance",
          healthy: "Yes",
          review: "Yes",
          restricted: "Skip panicked sleeves",
          paused: "No",
        },
      ],
      panickedStrategies: [],
      guardianEvents: [
        {
          title: "AutomationPausedUpdated",
          time: "Today, 07:00 UTC",
          actor: "System",
          impact: "Controller heartbeat confirmed active. No freeze was applied.",
        },
        {
          title: "Review state triggered",
          time: "Today, 06:42 UTC",
          actor: "System",
          impact: "Idle reserves slipped below target; no user restrictions applied.",
        },
      ],
    },
    activityEvents: [
      {
        event: "Deposit",
        actor: "0x7A41...90E2",
        timestamp: "7 min ago",
        entity: "Polaris Prime Vault",
        tx: "0x8ca...31dd",
        category: "User",
      },
      {
        event: "SettleWithdrawals",
        actor: "Keeper 02",
        timestamp: "18 min ago",
        entity: "Queue batch #114-118",
        tx: "0xaa3...820c",
        category: "Keeper",
      },
      {
        event: "Rebalance",
        actor: "Strategist",
        timestamp: "19 min ago",
        entity: "Hydration Omnipool Router",
        tx: "0x7be...b9d4",
        category: "Strategist",
      },
      {
        event: "StrategyAutomationConfigUpdated",
        actor: "Governance admin",
        timestamp: "2 hours ago",
        entity: "Hydration Omnipool Router",
        tx: "0xff0...d61e",
        category: "Governance",
      },
      {
        event: "HarvestExecuted",
        actor: "Automation controller",
        timestamp: "4 hours ago",
        entity: "Reserve Bills Ladder",
        tx: "0x4ca...a112",
        category: "System",
      },
    ],
    queueEntries: [
      {
        id: "#114",
        owner: "0x2bd...51d9",
        receiver: "0x2bd...51d9",
        shares: "28,420 CL-POL",
        netPayout: "$31,940",
        fee: "$48",
        grossObligation: "$31,988",
        status: "Ready to process",
        settlementEta: "Now",
      },
      {
        id: "#115",
        owner: "0x7A41...90E2",
        receiver: "0x7A41...90E2",
        shares: "41,800 CL-POL",
        netPayout: "$47,020",
        fee: "$71",
        grossObligation: "$47,091",
        status: "Pending liquidity",
        settlementEta: "Under 1 hour",
      },
      {
        id: "#116",
        owner: "0x9de...18f2",
        receiver: "0x0c1...bf72",
        shares: "92,400 CL-POL",
        netPayout: "$103,870",
        fee: "$156",
        grossObligation: "$104,026",
        status: "Pending liquidity",
        settlementEta: "Next rebalance window",
      },
    ],
    queueExplainers: [
      {
        label: "Snapshot pricing",
        value: "Locked at request time",
        note: "Queued exits store the net payout and fee immediately so later price moves do not change the request.",
      },
      {
        label: "Residual handling",
        value: "Sweep only when supply is zero",
        note: "Residual strategy assets route to treasury only after the vault is fully unwound.",
      },
      {
        label: "Single-entry processing",
        value: "Permissionless",
        note: "Anyone can process a ready entry. Funds always pay the original receiver.",
      },
    ],
    actionFlows: {
      deposit: {
        title: "Deposit assets and mint vault shares",
        summary:
          "Deposit USDC into the governed vault and receive CL-POL shares at the live price per share.",
        helper:
          "Deposits are open while the vault is not paused and residual cleanup has not blocked minting.",
        fields: [
          { label: "Wallet balance", value: "184,320 USDC" },
          { label: "Max deposit", value: "500,000 USDC" },
          { label: "Price per share", value: "1.1284" },
        ],
        preview: [
          { label: "Estimated shares out", value: "17,690 CL-POL" },
          { label: "Idle impact", value: "Lifts free idle to $1.8M" },
          { label: "Approval state", value: "Allowance ready" },
        ],
        notice:
          "Deposits are enabled. The vault remains in review state only because idle reserves sit below target.",
        buttonLabel: "Deposit USDC",
      },
      withdraw: {
        title: "Specify the asset amount you want back",
        summary:
          "Withdraw uses an asset-denominated target, burns the required shares, and can auto-recall from strategies if needed.",
        helper:
          "Use withdraw when you care about the exact asset amount that lands in your wallet.",
        fields: [
          { label: "Share balance", value: "202,210 CL-POL" },
          { label: "Max withdraw", value: "118,400 USDC" },
          { label: "Requested assets", value: "40,000 USDC" },
        ],
        preview: [
          { label: "Estimated shares burned", value: "35,778 CL-POL" },
          { label: "Withdrawal fee", value: "60 USDC" },
          { label: "Liquidity path", value: "Auto-recall required" },
        ],
        notice:
          "Gross liquidity exceeds free idle, so the vault would recall from strategies before completing the exit.",
        buttonLabel: "Withdraw 40,000 USDC",
      },
      redeem: {
        title: "Burn a chosen share amount",
        summary:
          "Redeem uses share input, returns the corresponding underlying assets, and keeps the share math explicit before signing.",
        helper:
          "Use redeem when your position tracking is share-based and you want to exit a known portion of it.",
        fields: [
          { label: "Share balance", value: "202,210 CL-POL" },
          { label: "Max redeem", value: "200,950 CL-POL" },
          { label: "Redeem amount", value: "25,000 CL-POL" },
        ],
        preview: [
          { label: "Estimated assets out", value: "28,103 USDC" },
          { label: "Withdrawal fee", value: "42 USDC" },
          { label: "Liquidity path", value: "Immediate from idle" },
        ],
        notice:
          "This size clears against idle liquidity without requiring a recall from strategy sleeves.",
        buttonLabel: "Redeem 25,000 CL-POL",
      },
      requestWithdraw: {
        title: "Queue an exit at a fixed snapshot payout",
        summary:
          "Request withdraw locks shares into the queue and records the payout and fee at the moment you submit.",
        helper:
          "Use the queue for larger exits, or when you prefer predictable settlement over immediate recalls.",
        fields: [
          { label: "Share balance", value: "202,210 CL-POL" },
          { label: "Queue request", value: "60,000 CL-POL" },
          { label: "Current queue depth", value: "$3.3M" },
        ],
        preview: [
          { label: "Locked net payout", value: "$67,550" },
          { label: "Locked fee", value: "$101" },
          { label: "Expected settlement", value: "Next rebalance window" },
        ],
        notice:
          "If idle can already cover the request, this path settles instantly. Otherwise it creates a visible FIFO queue entry.",
        buttonLabel: "Request queued withdraw",
      },
    },
    permissions: {
      strategist: true,
      governance: true,
      guardian: false,
      keeper: true,
    },
  },
  {
    slug: "atlas-core",
    name: "Atlas Core Vault",
    symbol: "CL-ATL",
    asset: "Tether USD",
    assetSymbol: "USDT",
    chain: "Moonbeam",
    featured: false,
    shortDescription:
      "Cleaner, lower-volatility stable routing sleeve with oversized idle reserves and low queue depth.",
    headline:
      "Conservative yield posture for users who want smoother idle coverage and a simpler strategy mix.",
    heroTag: "Conservative vault",
    health: "healthy",
    healthSummary:
      "All strategy sleeves are active, idle sits above target, and queue obligations remain light.",
    tvl: "$19.2M",
    apy: "9.6%",
    pricePerShare: "1.0921",
    idleRatio: "24%",
    idleAssets: "$4.6M",
    freeIdle: "$3.8M",
    queuedAssets: "$0.8M",
    strategyAssets: "$14.6M",
    activeStrategies: "2",
    withdrawalFee: "0.10%",
    idleTarget: "18%",
    rebalanceSlack: "5%",
    targetIdleAmount: "$3.5M",
    needsRebalance: false,
    paused: false,
    lastRebalance: "2h ago",
    lastHarvest: "3h ago",
    queueDepth: "$0.8M",
    queueCoverage: 82,
    trustPoints: [
      "Oversized idle buffer",
      "Two-strategy conservative design",
      "Low queue obligations with immediate coverage",
    ],
    overviewNotes: [
      "Atlas is the calmest vault in the registry and leads with instant-liquidity confidence.",
      "The strategy set is smaller and designed to feel less operationally busy than Polaris.",
      "Queue obligations remain visible, but most exits settle without friction.",
    ],
    allocation: [
      {
        label: "Idle reserve",
        amount: "$4.6M",
        share: 24,
        tone: "gold",
        note: "Higher-than-target idle supports fast user exits.",
      },
      {
        label: "Prime Lending",
        amount: "$8.8M",
        share: 46,
        tone: "healthy",
        note: "Primary stable lending sleeve.",
      },
      {
        label: "Reserve Credit Sleeve",
        amount: "$5.8M",
        share: 30,
        tone: "neutral",
        note: "Short-duration reserve yield sleeve.",
      },
    ],
    strategyRecords: [
      {
        id: "prime-lending",
        name: "Prime Lending",
        destination: "Astar and Moonwell stable lending markets",
        yieldSource: "Lending spread",
        description:
          "High-liquidity stable lending sleeve optimized for immediate recall capacity.",
        status: "Active",
        cap: "55%",
        target: "45%",
        allocationGap: "-1.0%",
        assetsDeployed: "$8.8M",
        targetAssets: "$8.6M",
        managedAssets: "$8.9M",
        pnl: "+$176K",
        automationPolicy: "Harvest twice daily",
        cooldown: "Harvest in 2h 40m",
        maxAllocate: "$700K",
        maxRecall: "$1.8M",
        lastHarvest: "3 hours ago",
        lastRebalance: "2 hours ago",
        approved: true,
        active: true,
        autoManaged: true,
      },
      {
        id: "reserve-credit",
        name: "Reserve Credit Sleeve",
        destination: "Short-duration reserve credit notes",
        yieldSource: "Conservative credit spread",
        description:
          "Secondary sleeve used to improve stability and keep the product feeling dependable.",
        status: "Active",
        cap: "35%",
        target: "30%",
        allocationGap: "+0.5%",
        assetsDeployed: "$5.8M",
        targetAssets: "$5.7M",
        managedAssets: "$5.9M",
        pnl: "+$94K",
        automationPolicy: "Harvest daily",
        cooldown: "Rebalance in 5h 10m",
        maxAllocate: "$400K",
        maxRecall: "$1.1M",
        lastHarvest: "1 day ago",
        lastRebalance: "2 hours ago",
        approved: true,
        active: true,
        autoManaged: true,
      },
    ],
    governanceParameters: [
      { label: "Withdrawal fee", value: "10 bps", note: "Lower fee for the most conservative sleeve." },
      { label: "Treasury", value: "0x8e2...C4D1", note: "Shared protocol treasury." },
      { label: "Idle ratio", value: "18%", note: "Lower target because idle currently exceeds it." },
      { label: "Rebalance slack", value: "5%", note: "Broader tolerance for conservative operation." },
      { label: "Governance manager", value: "0x33b...91A0", note: "Independent multisig." },
      { label: "Approved strategies", value: "2 active", note: "No panicked sleeves." },
    ],
    governanceApprovedStrategies: [
      { label: "Prime Lending", value: "Approved / Active", note: "Cap 55%, target 45%." },
      { label: "Reserve Credit Sleeve", value: "Approved / Active", note: "Cap 35%, target 30%." },
    ],
    roleAssignments: [
      { role: "Governance admin", holders: "1 multisig", permission: "Changes fee, treasury, and strategy approvals." },
      { role: "Strategist", holders: "1 operator", permission: "Maintains target allocations." },
      { role: "Guardian", holders: "1 council", permission: "Emergency controls." },
      { role: "Keeper", holders: "Automation only", permission: "Queue settlement and harvest execution." },
    ],
    governanceEvents: [
      {
        title: "TreasuryUpdated",
        actor: "Governance admin",
        time: "Mar 11, 2026",
        summary: "Treasury rotated to the shared operations multisig.",
        category: "Treasury",
      },
      {
        title: "StrategyCapUpdated",
        actor: "Governance admin",
        time: "Mar 8, 2026",
        summary: "Prime Lending cap lifted to 55% after on-chain liquidity review.",
        category: "Strategy config",
      },
    ],
    guardianState: {
      state: "Healthy",
      stateNote: "No restrictions are live and user exits remain fully supported.",
      automationStatus: "Automation active",
      automationNote: "Cooldown windows are normal and queue coverage is strong.",
      userImpact: [],
      panickedStrategies: [],
      guardianEvents: [
        {
          title: "No recent interventions",
          time: "Last 14 days",
          actor: "Guardian",
          impact: "Guardian controls remained unused due to stable operating conditions.",
        },
      ],
    },
    activityEvents: [
      {
        event: "Deposit",
        actor: "0x51d...93ae",
        timestamp: "12 min ago",
        entity: "Atlas Core Vault",
        tx: "0x0d2...dd93",
        category: "User",
      },
      {
        event: "ClaimWithdrawal",
        actor: "Keeper 01",
        timestamp: "48 min ago",
        entity: "Queue entry #43",
        tx: "0x302...be61",
        category: "Keeper",
      },
    ],
    queueEntries: [
      {
        id: "#43",
        owner: "0x851...3d42",
        receiver: "0x851...3d42",
        shares: "9,220 CL-ATL",
        netPayout: "$10,055",
        fee: "$10",
        grossObligation: "$10,065",
        status: "Ready to process",
        settlementEta: "Now",
      },
    ],
    queueExplainers: [
      {
        label: "Queue posture",
        value: "Low depth",
        note: "Atlas usually settles from idle without strategy recalls.",
      },
    ],
    actionFlows: {
      deposit: {
        title: "Deposit USDT",
        summary: "Straightforward deposit flow into the conservative sleeve.",
        helper: "Most users use Atlas when they want a less eventful operating profile.",
        fields: [
          { label: "Wallet balance", value: "91,400 USDT" },
          { label: "Max deposit", value: "350,000 USDT" },
          { label: "Price per share", value: "1.0921" },
        ],
        preview: [
          { label: "Estimated shares out", value: "9,157 CL-ATL" },
          { label: "Idle impact", value: "Raises free idle to $4.1M" },
        ],
        notice: "Healthy state. Deposits and exits remain fully open.",
        buttonLabel: "Deposit USDT",
      },
      withdraw: {
        title: "Withdraw assets",
        summary: "Immediate exits usually clear from idle in Atlas.",
        helper: "The queue exists, but most users will not need it here.",
        fields: [
          { label: "Share balance", value: "171,800 CL-ATL" },
          { label: "Max withdraw", value: "183,220 USDT" },
          { label: "Requested assets", value: "35,000 USDT" },
        ],
        preview: [
          { label: "Estimated shares burned", value: "32,080 CL-ATL" },
          { label: "Withdrawal fee", value: "35 USDT" },
          { label: "Liquidity path", value: "Immediate from idle" },
        ],
        notice: "Free idle already covers this exit size.",
        buttonLabel: "Withdraw 35,000 USDT",
      },
      redeem: {
        title: "Redeem shares",
        summary: "Redeem with explicit share input when you want share-precise accounting.",
        helper: "The preview reflects fee-adjusted assets out.",
        fields: [
          { label: "Share balance", value: "171,800 CL-ATL" },
          { label: "Max redeem", value: "171,000 CL-ATL" },
          { label: "Redeem amount", value: "20,000 CL-ATL" },
        ],
        preview: [
          { label: "Estimated assets out", value: "21,820 USDT" },
          { label: "Withdrawal fee", value: "22 USDT" },
        ],
        notice: "Atlas keeps this path deliberately simple and low-friction.",
        buttonLabel: "Redeem 20,000 CL-ATL",
      },
      requestWithdraw: {
        title: "Queue a larger exit",
        summary: "Queue remains available even though Atlas usually clears exits immediately.",
        helper: "Use when you prefer a fixed snapshot payout for larger requests.",
        fields: [
          { label: "Share balance", value: "171,800 CL-ATL" },
          { label: "Queue request", value: "55,000 CL-ATL" },
          { label: "Current queue depth", value: "$0.8M" },
        ],
        preview: [
          { label: "Locked net payout", value: "$60,000" },
          { label: "Locked fee", value: "$60" },
        ],
        notice: "Most requests this size still settle quickly thanks to the larger idle buffer.",
        buttonLabel: "Request queued withdraw",
      },
    },
    permissions: {
      strategist: false,
      governance: false,
      guardian: false,
      keeper: false,
    },
  },
  {
    slug: "orion-recovery",
    name: "Orion Recovery Vault",
    symbol: "CL-ORN",
    asset: "Acala Dollar",
    assetSymbol: "aUSD",
    chain: "Acala",
    featured: false,
    shortDescription:
      "Restricted vault under active guardian supervision after a strategy panic event.",
    headline:
      "Visible safety controls and queue transparency during a restricted operating posture.",
    heroTag: "Restricted vault",
    health: "critical",
    healthSummary:
      "A panicked strategy and a guardian pause are both active. Deposits are blocked while exits remain visible.",
    tvl: "$20.3M",
    apy: "6.1%",
    pricePerShare: "1.0418",
    idleRatio: "11%",
    idleAssets: "$2.2M",
    freeIdle: "$0.4M",
    queuedAssets: "$1.8M",
    strategyAssets: "$18.1M",
    activeStrategies: "2 of 3",
    withdrawalFee: "0.20%",
    idleTarget: "22%",
    rebalanceSlack: "3%",
    targetIdleAmount: "$4.5M",
    needsRebalance: true,
    paused: true,
    lastRebalance: "Paused",
    lastHarvest: "1 day ago",
    queueDepth: "$1.8M",
    queueCoverage: 22,
    trustPoints: [
      "Guardian intervention is public and traceable",
      "Panicked sleeve is isolated and labeled clearly",
      "Withdrawals remain observable even in restricted mode",
    ],
    overviewNotes: [
      "This vault exists to prove Constantlation does not hide stressed conditions.",
      "Deposits are blocked, but exits and queue state remain public.",
      "Guardian and governance timelines are separated so responsibility stays clear.",
    ],
    allocation: [
      {
        label: "Idle reserve",
        amount: "$2.2M",
        share: 11,
        tone: "gold",
        note: "Small remaining reserve focused on exit support.",
      },
      {
        label: "Recovery lending sleeve",
        amount: "$8.1M",
        share: 40,
        tone: "review",
        note: "Still active with guarded recall behavior.",
      },
      {
        label: "Panicked route",
        amount: "$5.7M",
        share: 28,
        tone: "critical",
        note: "No new allocations. Recall remains in progress.",
      },
      {
        label: "Reserve stabilization sleeve",
        amount: "$4.3M",
        share: 21,
        tone: "restricted",
        note: "Active but monitored during recovery.",
      },
    ],
    strategyRecords: [
      {
        id: "recovery-lending",
        name: "Recovery Lending Sleeve",
        destination: "Conservative money market positions",
        yieldSource: "Lending spread",
        description:
          "Still active and used to support orderly unwind pacing while the vault remains paused.",
        status: "Monitoring",
        cap: "45%",
        target: "40%",
        allocationGap: "+3.2%",
        assetsDeployed: "$8.1M",
        targetAssets: "$7.4M",
        managedAssets: "$8.0M",
        pnl: "+$58K",
        automationPolicy: "Automation limited to recalls",
        cooldown: "Rebalance disabled while paused",
        maxAllocate: "$0",
        maxRecall: "$2.0M",
        lastHarvest: "1 day ago",
        lastRebalance: "Paused",
        approved: true,
        active: true,
        autoManaged: false,
      },
      {
        id: "panicked-route",
        name: "Panicked Route",
        destination: "Structured stable routing program",
        yieldSource: "Swap and liquidity fees",
        description:
          "Guardian-triggered emergency exit recalled part of the sleeve, with residual assets still being recovered.",
        status: "Panicked",
        cap: "30%",
        target: "0%",
        allocationGap: "-28.0%",
        assetsDeployed: "$5.7M",
        targetAssets: "$0",
        managedAssets: "$5.6M",
        pnl: "-$210K",
        automationPolicy: "No new allocations",
        cooldown: "Manual recovery only",
        maxAllocate: "$0",
        maxRecall: "$5.7M",
        lastHarvest: "N/A",
        lastRebalance: "Emergency exit 9h ago",
        approved: true,
        active: false,
        autoManaged: false,
      },
      {
        id: "reserve-stabilizer",
        name: "Reserve Stabilization Sleeve",
        destination: "Reserve protocol stabilization notes",
        yieldSource: "Conservative reserve spread",
        description:
          "Defensive sleeve kept active to support controlled recovery and orderly queue servicing.",
        status: "Active",
        cap: "35%",
        target: "21%",
        allocationGap: "+0.4%",
        assetsDeployed: "$4.3M",
        targetAssets: "$4.2M",
        managedAssets: "$4.5M",
        pnl: "+$35K",
        automationPolicy: "Recall-only if queue pressure rises",
        cooldown: "Harvest in 9h",
        maxAllocate: "$0",
        maxRecall: "$1.2M",
        lastHarvest: "14 hours ago",
        lastRebalance: "Paused",
        approved: true,
        active: true,
        autoManaged: false,
      },
    ],
    governanceParameters: [
      { label: "Withdrawal fee", value: "20 bps", note: "Held constant during recovery." },
      { label: "Treasury", value: "0x41d...AA62", note: "Receives recovery-period fees and residual sweep." },
      { label: "Idle ratio", value: "22%", note: "Target not currently met." },
      { label: "Rebalance slack", value: "3%", note: "Tighter threshold for guarded operation." },
      { label: "Governance manager", value: "0xA13...019b", note: "Coordinates recovery approvals." },
      { label: "Approved strategies", value: "3 total / 2 active", note: "One panicked sleeve remains visible." },
    ],
    governanceApprovedStrategies: [
      { label: "Recovery Lending Sleeve", value: "Approved / Active", note: "Cap 45%, target 40%." },
      { label: "Panicked Route", value: "Approved / Restricted", note: "Target 0%, no new allocations." },
      { label: "Reserve Stabilization Sleeve", value: "Approved / Active", note: "Cap 35%, target 21%." },
    ],
    roleAssignments: [
      { role: "Governance admin", holders: "1 emergency multisig", permission: "Recovery configuration and role updates." },
      { role: "Strategist", holders: "1 operator", permission: "Recall-only operations while paused." },
      { role: "Guardian", holders: "1 security council", permission: "Pause, unpause, panic, and communicate user impact." },
      { role: "Keeper", holders: "1 queue relayer", permission: "Permissionless queue settlement when idle becomes available." },
    ],
    governanceEvents: [
      {
        title: "StrategyDisabled",
        actor: "Governance admin",
        time: "Today, 03:18 UTC",
        summary: "Panicked Route disabled for new allocations until recovery review completes.",
        category: "Strategy lifecycle",
      },
      {
        title: "AutomationPausedUpdated",
        actor: "Governance admin",
        time: "Today, 03:11 UTC",
        summary: "Automation switched to recovery mode with recalls only.",
        category: "Automation",
      },
    ],
    guardianState: {
      state: "Critical",
      stateNote:
        "Deposits are blocked. Users can still withdraw, redeem, request queue exits, and process ready queue entries.",
      automationStatus: "Recovery mode",
      automationNote:
        "Automation only supports recall behavior until the guardian removes the pause.",
      userImpact: [
        {
          action: "Deposit",
          healthy: "Yes",
          review: "Yes",
          restricted: "Yes",
          paused: "No",
        },
        {
          action: "Withdraw / Redeem",
          healthy: "Yes",
          review: "Yes",
          restricted: "Yes",
          paused: "Yes",
        },
        {
          action: "Request withdraw",
          healthy: "Yes",
          review: "Yes",
          restricted: "Yes",
          paused: "Yes",
        },
        {
          action: "Allocate to healthy strategy",
          healthy: "Yes",
          review: "Yes",
          restricted: "Limited",
          paused: "No",
        },
        {
          action: "Panic strategy",
          healthy: "Guardian only",
          review: "Guardian only",
          restricted: "Guardian only",
          paused: "Guardian only",
        },
      ],
      panickedStrategies: [
        {
          label: "Panicked Route",
          value: "$5.7M still deployed",
          note: "Emergency exit fired 9 hours ago. Residual assets continue to unwind.",
        },
      ],
      guardianEvents: [
        {
          title: "Paused",
          time: "Today, 03:05 UTC",
          actor: "Guardian",
          impact: "Deposits blocked while exits remain live.",
        },
        {
          title: "EmergencyExit",
          time: "Today, 02:58 UTC",
          actor: "Guardian",
          impact: "Panicked Route marked restricted and recall flow initiated.",
        },
      ],
    },
    activityEvents: [
      {
        event: "EmergencyExit",
        actor: "Guardian",
        timestamp: "9 hours ago",
        entity: "Panicked Route",
        tx: "0x011...eed2",
        category: "Guardian",
      },
      {
        event: "Pause",
        actor: "Guardian",
        timestamp: "9 hours ago",
        entity: "Orion Recovery Vault",
        tx: "0xb70...93f8",
        category: "Guardian",
      },
      {
        event: "RequestWithdraw",
        actor: "0x7A41...90E2",
        timestamp: "7 hours ago",
        entity: "Queue entry #87",
        tx: "0xe41...cafe",
        category: "User",
      },
    ],
    queueEntries: [
      {
        id: "#87",
        owner: "0x7A41...90E2",
        receiver: "0x7A41...90E2",
        shares: "31,500 CL-ORN",
        netPayout: "$32,630",
        fee: "$65",
        grossObligation: "$32,695",
        status: "Ready to process",
        settlementEta: "Once idle clears",
      },
      {
        id: "#88",
        owner: "0x44f...a3c1",
        receiver: "0x44f...a3c1",
        shares: "78,800 CL-ORN",
        netPayout: "$81,720",
        fee: "$164",
        grossObligation: "$81,884",
        status: "Pending liquidity",
        settlementEta: "Recovery recall in progress",
      },
    ],
    queueExplainers: [
      {
        label: "Recovery pricing",
        value: "Still snapshot-based",
        note: "Even in restricted mode, queued exits preserve fixed payout records at request time.",
      },
      {
        label: "User impact",
        value: "Deposits blocked, exits live",
        note: "The safety page repeats this message so users never have to infer it.",
      },
    ],
    actionFlows: {
      deposit: {
        title: "Deposits blocked while paused",
        summary: "This tab shows the paused-state explanation instead of an active deposit form.",
        helper: "Guardian pause is active. Deposits remain disabled until safety restrictions are lifted.",
        fields: [
          { label: "Vault state", value: "Paused" },
          { label: "Guardian note", value: "Recovery mode active" },
        ],
        preview: [
          { label: "Allowed actions", value: "Withdraw, redeem, request withdraw" },
          { label: "Blocked actions", value: "Deposit, mint, allocate" },
        ],
        notice: "Constantlation keeps the page visible even when actions are restricted.",
        buttonLabel: "Deposits unavailable",
      },
      withdraw: {
        title: "Withdraw with recovery context",
        summary: "Immediate exits stay open, but larger requests may rely on strategy recalls or the queue.",
        helper: "The page surfaces the restriction state before the user signs.",
        fields: [
          { label: "Share balance", value: "31,500 CL-ORN" },
          { label: "Max withdraw", value: "12,900 aUSD" },
        ],
        preview: [
          { label: "Estimated shares burned", value: "12,385 CL-ORN" },
          { label: "Liquidity path", value: "Likely recall or queue" },
        ],
        notice: "Withdrawals remain live even though deposits are paused.",
        buttonLabel: "Withdraw aUSD",
      },
      redeem: {
        title: "Redeem shares in restricted mode",
        summary: "Redeem stays visible so users understand what remains available right now.",
        helper: "This view keeps the UX transparent instead of hiding the route.",
        fields: [{ label: "Share balance", value: "31,500 CL-ORN" }],
        preview: [
          { label: "Estimated assets out", value: "32,958 aUSD" },
          { label: "Fee", value: "66 aUSD" },
        ],
        notice: "Smaller redemptions may still settle from the remaining idle buffer.",
        buttonLabel: "Redeem shares",
      },
      requestWithdraw: {
        title: "Preferred path during recovery",
        summary: "Queued exits provide predictable payout records while idle is replenished through recalls.",
        helper: "The fixed snapshot payout is especially important during recovery periods.",
        fields: [
          { label: "Current queue depth", value: "$1.8M" },
          { label: "Idle available now", value: "$2.2M" },
        ],
        preview: [
          { label: "Locked net payout", value: "$32,630" },
          { label: "Settlement state", value: "Ready to process soon" },
        ],
        notice: "This vault demonstrates why the queue page is a signature Constantlation surface.",
        buttonLabel: "Request queued withdraw",
      },
    },
    permissions: {
      strategist: false,
      governance: false,
      guardian: true,
      keeper: false,
    },
  },
];

export const featuredVault = vaults.find((vault) => vault.featured) ?? vaults[0];

export const portfolioSummary = {
  totalValue: "$412.8K",
  unrealizedPnl: "+$18.4K",
  redeemableNow: "$249.6K",
  queuedNetPayout: "$47.0K",
};

export const holdings: HoldingRecord[] = [
  {
    vaultSlug: "polaris-prime",
    vaultName: "Polaris Prime Vault",
    value: "$228.1K",
    shares: "202,210 CL-POL",
    redeemable: "$227.8K",
    equivalentAssets: "$228.1K",
    maxRedeem: "200,950 CL-POL",
    maxWithdraw: "$118.4K",
    pnl: "+$10.9K",
    exposure: [
      {
        label: "Idle reserve",
        amount: "$36.5K",
        share: 16,
        tone: "gold",
        note: "Immediate liquidity portion of your exposure.",
      },
      {
        label: "Aave Prime Sleeve",
        amount: "$77.6K",
        share: 34,
        tone: "healthy",
        note: "Largest sleeve in your current exposure.",
      },
      {
        label: "Hydration Omnipool",
        amount: "$59.3K",
        share: 26,
        tone: "review",
        note: "Tracked closely because the vault is in review state.",
      },
      {
        label: "Reserve Bills Ladder",
        amount: "$54.7K",
        share: 24,
        tone: "neutral",
        note: "Stability sleeve underpinning your position.",
      },
    ],
    queueStatus: "One queued exit worth $47.0K net payout is still pending liquidity.",
  },
  {
    vaultSlug: "atlas-core",
    vaultName: "Atlas Core Vault",
    value: "$184.7K",
    shares: "171,800 CL-ATL",
    redeemable: "$184.4K",
    equivalentAssets: "$184.7K",
    maxRedeem: "171,000 CL-ATL",
    maxWithdraw: "$183.2K",
    pnl: "+$7.5K",
    exposure: [
      {
        label: "Idle reserve",
        amount: "$44.3K",
        share: 24,
        tone: "gold",
        note: "Stronger immediate-liquidity posture than Polaris.",
      },
      {
        label: "Prime Lending",
        amount: "$84.9K",
        share: 46,
        tone: "healthy",
        note: "Core stable lending exposure.",
      },
      {
        label: "Reserve Credit Sleeve",
        amount: "$55.5K",
        share: 30,
        tone: "neutral",
        note: "Conservative reserve spread exposure.",
      },
    ],
    queueStatus: "No pending queue entries.",
  },
];

export const portfolioActions = [
  {
    label: "Queued withdraw pending",
    value: "$47.0K net payout",
    note: "Polaris Prime Vault queue entry #115 remains visible until processed.",
  },
  {
    label: "Recent deposit",
    value: "$20.0K",
    note: "Latest top-up entered Polaris 7 minutes ago.",
  },
  {
    label: "Immediate exit capacity",
    value: "$249.6K",
    note: "Based on current max withdraw and redeem previews across holdings.",
  },
];

export const portfolioEventLog = [
  {
    event: "Deposit",
    actor: appUser.wallet,
    timestamp: "7 min ago",
    entity: "Polaris Prime Vault",
    tx: "0x8ca...31dd",
    category: "User",
  },
  {
    event: "RequestWithdraw",
    actor: appUser.wallet,
    timestamp: "1 hour ago",
    entity: "Polaris queue #115",
    tx: "0x52c...7e19",
    category: "User",
  },
  {
    event: "ClaimWithdrawal",
    actor: appUser.wallet,
    timestamp: "Yesterday",
    entity: "Atlas queue #39",
    tx: "0x392...ae83",
    category: "User",
  },
];

export function getVault(slug: string) {
  return vaults.find((vault) => vault.slug === slug);
}
