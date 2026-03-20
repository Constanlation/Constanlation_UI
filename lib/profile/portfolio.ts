export interface PortfolioPosition {
  slug: string;
  vault: string;
  depositedUsd: number;
  unrealizedPnlUsd: number;
  allocationPct: number;
  pendingWithdrawUsd: number;
}

export interface PortfolioWithdrawalRequest {
  id: string;
  slug: string;
  vault: string;
  requestUsd: number;
  eta: string;
  status: "Pending" | "Partially Filled" | "Ready to Claim" | "Claimed";
}
