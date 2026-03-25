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

export interface StrategyOperationRow {
  label: string;
  address: string;
  managedAssetsUsd: number;
  capBps: number;
  targetBps: number;
  autoManaged: boolean;
  isPanicked: boolean;
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
  governanceManagerAddress: string;
  automationControllerAddress: string;
  strategyRows: StrategyOperationRow[];
  feeModel: string;
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

export interface GuardianControl {
  label: string;
  state: string;
  updatedAt: string;
}