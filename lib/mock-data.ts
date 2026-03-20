export type ChainName = "Ethereum" | "Base" | "Polkadot";

export interface VaultListRow {
  slug: string;
  name: string;
  asset: string;
  chain: ChainName;
  curator: string;
  guardianState: "Healthy" | "Watch";
  apy: number;
  tvl: number;
  liquidityUsd: number;
  exposurePct: number;
  riskScore: number;
  strategyPreview: string;
  queueDepthHours: number;
}

export interface StrategyAllocation {
  strategy: string;
  allocationPct: number;
  apy: number;
  amountUsd: number;
}

export interface ActivityEvent {
  time: string;
  event: string;
  actor: string;
  value: string;
  tx: string;
}

export interface ExposureMarket {
  market: string;
  vaultAllocationPct: number;
  amountUsd: number;
  supplyCapUsd: number;
  apy: number;
  utilizationPct: number;
}

export interface VaultDetailData {
  slug: string;
  name: string;
  symbol: string;
  chain: ChainName;
  asset: string;
  curator: string;
  guardianState: "Healthy" | "Watch";
  apyNow: number;
  apy7d: number;
  apy30d: number;
  apy90d: number;
  tvl: number;
  liquidityUsd: number;
  exposurePct: number;
  riskScore: number;
  queueDepthHours: number;
  description: string;
  performance: Array<{ label: string; value: number }>;
  exposureMarkets: ExposureMarket[];
  allocations: StrategyAllocation[];
  risks: string[];
  activity: ActivityEvent[];
  sharePrice: number;
  performanceFeePct: number;
  feeRecipient: string;
  curatorTvl: number;
  owner: string;
  guardian: string;
  timelockDuration: string;
  deploymentDate: string;
  vaultVersion: string;
  contractAddress: string;
  feeModel: string;
}

export const vaultRows: VaultListRow[] = [
  {
    slug: "dot-core",
    name: "DOT Core Reserve",
    asset: "DOT",
    chain: "Polkadot",
    curator: "Constellation Labs",
    guardianState: "Healthy",
    apy: 8.12,
    tvl: 7210000,
    liquidityUsd: 1629000,
    exposurePct: 77,
    riskScore: 2,
    strategyPreview: "Staking + collateralized lending rotation",
    queueDepthHours: 18,
  },
  {
    slug: "usdc-prime",
    name: "USDC Prime Income",
    asset: "USDC",
    chain: "Base",
    curator: "Steady Curators",
    guardianState: "Healthy",
    apy: 6.41,
    tvl: 11980000,
    liquidityUsd: 4010000,
    exposurePct: 66,
    riskScore: 2,
    strategyPreview: "Short-duration lending and basis capture",
    queueDepthHours: 7,
  },
  {
    slug: "eth-guardian",
    name: "ETH Guardian Yield",
    asset: "WETH",
    chain: "Ethereum",
    curator: "North Star DAO",
    guardianState: "Watch",
    apy: 10.02,
    tvl: 9340000,
    liquidityUsd: 1930000,
    exposurePct: 79,
    riskScore: 3,
    strategyPreview: "LST carry with hedged AMM inventory",
    queueDepthHours: 22,
  },
  {
    slug: "stable-xcm",
    name: "Stable XCM Router",
    asset: "USDT",
    chain: "Polkadot",
    curator: "XCM Council",
    guardianState: "Healthy",
    apy: 5.7,
    tvl: 4980000,
    liquidityUsd: 1420000,
    exposurePct: 62,
    riskScore: 1,
    strategyPreview: "Cross-chain stable routing with capped duration",
    queueDepthHours: 11,
  },
];

export const vaultDetails: VaultDetailData[] = [
  {
    slug: "dot-core",
    name: "DOT Core Reserve",
    symbol: "clDOT",
    chain: "Polkadot",
    asset: "DOT",
    curator: "Constellation Labs",
    guardianState: "Healthy",
    apyNow: 8.12,
    apy7d: 7.61,
    apy30d: 7.44,
    apy90d: 8.36,
    tvl: 7210000,
    liquidityUsd: 1629000,
    exposurePct: 77,
    riskScore: 2,
    queueDepthHours: 18,
    description:
      "Curated DOT strategy suite focused on predictable reward capture, transparent queue mechanics, and governance-approved parameter updates.",
    performance: [
      { label: "Jan", value: 4.2 },
      { label: "Feb", value: 4.8 },
      { label: "Mar", value: 5.1 },
      { label: "Apr", value: 5.5 },
      { label: "May", value: 6.3 },
      { label: "Jun", value: 6.8 },
      { label: "Jul", value: 7.4 },
      { label: "Aug", value: 7.1 },
      { label: "Sep", value: 7.8 },
      { label: "Oct", value: 8.3 },
      { label: "Nov", value: 8.1 },
      { label: "Dec", value: 8.12 },
    ],
    exposureMarkets: [
      {
        market: "DOT / stDOT Lending",
        vaultAllocationPct: 46,
        amountUsd: 3316600,
        supplyCapUsd: 5000000,
        apy: 9.04,
        utilizationPct: 81,
      },
      {
        market: "DOT Borrow Carry",
        vaultAllocationPct: 28,
        amountUsd: 2018800,
        supplyCapUsd: 3000000,
        apy: 7.21,
        utilizationPct: 74,
      },
      {
        market: "XCM Stable Buffer",
        vaultAllocationPct: 16,
        amountUsd: 1153600,
        supplyCapUsd: 2500000,
        apy: 4.92,
        utilizationPct: 58,
      },
      {
        market: "Idle Liquidity",
        vaultAllocationPct: 10,
        amountUsd: 721000,
        supplyCapUsd: 721000,
        apy: 2.13,
        utilizationPct: 100,
      },
    ],
    allocations: [
      { strategy: "Native DOT Staking", allocationPct: 46, apy: 9.04, amountUsd: 3316600 },
      { strategy: "DOT Borrow Carry", allocationPct: 28, apy: 7.21, amountUsd: 2018800 },
      { strategy: "XCM Stable Buffer", allocationPct: 16, apy: 4.92, amountUsd: 1153600 },
      { strategy: "Guardian Liquidity Buffer", allocationPct: 10, apy: 2.13, amountUsd: 721000 },
    ],
    risks: [
      "Validator concentration risk is controlled by governance-set validator caps.",
      "Queue depth increases during network volatility and can extend withdrawals.",
      "Cross-chain routes are capped and monitored by guardian controls.",
    ],
    activity: [
      {
        time: "2h ago",
        event: "Rebalance Executed",
        actor: "Allocator Bot",
        value: "$182k moved to staking",
        tx: "0x9f4a...82d1",
      },
      {
        time: "9h ago",
        event: "Guardian Checkpoint",
        actor: "Guardian Multisig",
        value: "Healthy",
        tx: "0x38b1...4f7a",
      },
      {
        time: "1d ago",
        event: "Fee Snapshot",
        actor: "Protocol",
        value: "0.45% realized",
        tx: "0x0a41...9a01",
      },
      {
        time: "2d ago",
        event: "Queue Fulfillment",
        actor: "Vault",
        value: "$420k redeemed",
        tx: "0x1158...a322",
      },
    ],
    sharePrice: 1.034979,
    performanceFeePct: 8,
    feeRecipient: "0x255c...085a",
    curatorTvl: 218000000,
    owner: "SAFE 2/4",
    guardian: "Aragon DAO",
    timelockDuration: "7 days",
    deploymentDate: "2025-08-01",
    vaultVersion: "v1.1",
    contractAddress: "0x5d4c2f2D3308114f2E9D3102A9B42Ea362930012",
    feeModel: "0.20% management fee, 8.00% performance fee",
  },
];

export function getVaultBySlug(slug: string): VaultDetailData | null {
  const fromDetail = vaultDetails.find((vault) => vault.slug === slug);
  if (fromDetail) {
    return fromDetail;
  }

  const fromRow = vaultRows.find((vault) => vault.slug === slug);
  if (!fromRow) {
    return null;
  }

  return {
    slug: fromRow.slug,
    name: fromRow.name,
    symbol: `cl${fromRow.asset}`,
    chain: fromRow.chain,
    asset: fromRow.asset,
    curator: fromRow.curator,
    guardianState: fromRow.guardianState,
    apyNow: fromRow.apy,
    apy7d: Math.max(fromRow.apy - 0.3, 0),
    apy30d: Math.max(fromRow.apy - 0.6, 0),
    apy90d: fromRow.apy + 0.4,
    tvl: fromRow.tvl,
    liquidityUsd: fromRow.liquidityUsd,
    exposurePct: fromRow.exposurePct,
    riskScore: fromRow.riskScore,
    queueDepthHours: fromRow.queueDepthHours,
    description: fromRow.strategyPreview,
    performance: [
      { label: "Q1", value: fromRow.apy - 1.2 },
      { label: "Q2", value: fromRow.apy - 0.7 },
      { label: "Q3", value: fromRow.apy - 0.2 },
      { label: "Q4", value: fromRow.apy },
    ],
    exposureMarkets: [
      {
        market: "Primary Yield Market",
        vaultAllocationPct: 65,
        apy: fromRow.apy + 0.4,
        amountUsd: fromRow.tvl * 0.65,
        supplyCapUsd: fromRow.tvl,
        utilizationPct: 75,
      },
      {
        market: "Liquidity Buffer",
        vaultAllocationPct: 20,
        apy: Math.max(fromRow.apy - 3, 0),
        amountUsd: fromRow.tvl * 0.2,
        supplyCapUsd: fromRow.tvl * 0.4,
        utilizationPct: 50,
      },
      {
        market: "Guardian Reserve",
        vaultAllocationPct: 15,
        apy: Math.max(fromRow.apy - 5, 0),
        amountUsd: fromRow.tvl * 0.15,
        supplyCapUsd: fromRow.tvl * 0.2,
        utilizationPct: 70,
      },
    ],
    allocations: [
      {
        strategy: "Primary Yield Strategy",
        allocationPct: 65,
        apy: fromRow.apy + 0.4,
        amountUsd: fromRow.tvl * 0.65,
      },
      {
        strategy: "Liquidity Buffer",
        allocationPct: 20,
        apy: Math.max(fromRow.apy - 3, 0),
        amountUsd: fromRow.tvl * 0.2,
      },
      {
        strategy: "Guardian Reserve",
        allocationPct: 15,
        apy: Math.max(fromRow.apy - 5, 0),
        amountUsd: fromRow.tvl * 0.15,
      },
    ],
    risks: [
      "Strategy composition can shift based on governance-approved limits.",
      "Redemption timing depends on current withdrawal queue depth.",
    ],
    activity: [
      {
        time: "5h ago",
        event: "Allocation Update",
        actor: "Allocator",
        value: "Routine rebalance",
        tx: "0x9961...2a74",
      },
      {
        time: "1d ago",
        event: "Guardian Review",
        actor: "Guardian",
        value: fromRow.guardianState,
        tx: "0x44a1...ed53",
      },
    ],
    sharePrice: 1.01,
    performanceFeePct: 8,
    feeRecipient: "0x0000...0001",
    curatorTvl: fromRow.tvl * 8,
    owner: "SAFE 2/4",
    guardian: "Guardian Council",
    timelockDuration: "7 days",
    deploymentDate: "2025-01-01",
    vaultVersion: "v1.1",
    contractAddress: "0x0000000000000000000000000000000000000000",
    feeModel: "0.20% management fee, 8.00% performance fee",
  };
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 100 ? 2 : 0,
  }).format(value);
}

export interface PortfolioPosition {
  slug: string;
  vault: string;
  depositedUsd: number;
  unrealizedPnlUsd: number;
  allocationPct: number;
  pendingWithdrawUsd: number;
}

export interface GovernanceProposal {
  id: string;
  title: string;
  status: "Active" | "Passed" | "Queued" | "Executed";
  eta: string;
  participationPct: number;
}

export interface QueueEntry {
  id: string;
  requester: string;
  requestUsd: number;
  position: number;
  eta: string;
  status: "Pending" | "Partially Filled" | "Ready to Claim" | "Claimed";
}

export interface PortfolioWithdrawalRequest {
  id: string;
  slug: string;
  vault: string;
  requestUsd: number;
  eta: string;
  status: "Pending" | "Partially Filled" | "Ready to Claim" | "Claimed";
}

export interface GuardianControl {
  label: string;
  state: string;
  updatedAt: string;
}

export const portfolioPositions: PortfolioPosition[] = [
  {
    slug: "dot-core",
    vault: "DOT Core Reserve",
    depositedUsd: 164000,
    unrealizedPnlUsd: 9800,
    allocationPct: 48,
    pendingWithdrawUsd: 12000,
  },
  {
    slug: "usdc-prime",
    vault: "USDC Prime Income",
    depositedUsd: 121000,
    unrealizedPnlUsd: 4200,
    allocationPct: 36,
    pendingWithdrawUsd: 0,
  },
  {
    slug: "stable-xcm",
    vault: "Stable XCM Router",
    depositedUsd: 56000,
    unrealizedPnlUsd: 1200,
    allocationPct: 16,
    pendingWithdrawUsd: 4500,
  },
];

export const governanceByVault: Record<string, GovernanceProposal[]> = {
  "dot-core": [
    {
      id: "PROP-118",
      title: "Raise DOT staking cap from 45% to 52%",
      status: "Active",
      eta: "Voting ends in 2d",
      participationPct: 62,
    },
    {
      id: "PROP-114",
      title: "Reduce queue buffer target to 8%",
      status: "Passed",
      eta: "Queued for timelock",
      participationPct: 79,
    },
  ],
};

export const queueByVault: Record<string, QueueEntry[]> = {
  "dot-core": [
    {
      id: "REQ-2042",
      requester: "0x84A2...2D81",
      requestUsd: 42000,
      position: 1,
      eta: "~6h",
      status: "Ready to Claim",
    },
    {
      id: "REQ-2043",
      requester: "0x11Fc...A13E",
      requestUsd: 18000,
      position: 2,
      eta: "~11h",
      status: "Pending",
    },
    {
      id: "REQ-2044",
      requester: "0x7bE0...9905",
      requestUsd: 9000,
      position: 3,
      eta: "~15h",
      status: "Pending",
    },
  ],
};

export const portfolioWithdrawalRequests: PortfolioWithdrawalRequest[] = [
  {
    id: "REQ-2042",
    slug: "dot-core",
    vault: "DOT Core Reserve",
    requestUsd: 12000,
    eta: "Ready now",
    status: "Ready to Claim",
  },
  {
    id: "REQ-3121",
    slug: "stable-xcm",
    vault: "Stable XCM Router",
    requestUsd: 4500,
    eta: "~4h",
    status: "Pending",
  },
];

export const guardianByVault: Record<string, GuardianControl[]> = {
  "dot-core": [
    { label: "Pause State", state: "Unpaused", updatedAt: "9h ago" },
    { label: "Emergency Exit", state: "Ready", updatedAt: "1d ago" },
    { label: "Oracle Deviation Guard", state: "Enabled", updatedAt: "2d ago" },
    { label: "Borrow Cap Guard", state: "Enabled", updatedAt: "4h ago" },
  ],
};

export const strategyNotesByVault: Record<string, Array<{ time: string; note: string }>> = {
  "dot-core": [
    { time: "2h ago", note: "Shifted 2.1% from idle buffer into primary staking market." },
    { time: "1d ago", note: "Reduced borrow carry allocation by 1.5% due to utilization spike." },
  ],
};

export function getVaultProposals(slug: string): GovernanceProposal[] {
  return governanceByVault[slug] ?? [];
}

export function getVaultQueue(slug: string): QueueEntry[] {
  return queueByVault[slug] ?? [];
}

export function getVaultGuardianControls(slug: string): GuardianControl[] {
  return guardianByVault[slug] ?? [];
}

export function getVaultStrategyNotes(slug: string): Array<{ time: string; note: string }> {
  return strategyNotesByVault[slug] ?? [];
}
