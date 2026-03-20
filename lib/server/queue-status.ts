type QueueStatus = "Pending" | "Partially Filled" | "Ready to Claim" | "Claimed";

const STATUS_MAP: Record<string, QueueStatus> = {
  pending: "Pending",
  queued: "Pending",
  requested: "Pending",
  partially_filled: "Partially Filled",
  partiallyfilled: "Partially Filled",
  partial: "Partially Filled",
  ready_to_claim: "Ready to Claim",
  readytoclaim: "Ready to Claim",
  claimable: "Ready to Claim",
  ready: "Ready to Claim",
  claimed: "Claimed",
  redeemed: "Claimed",
  settled: "Claimed",
};

function normalizeStatusKey(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z]/g, "");
}

export function mapQueueStatus(status: string): QueueStatus {
  const normalizedKey = normalizeStatusKey(status);
  return STATUS_MAP[normalizedKey] ?? "Pending";
}

export function etaForQueueStatus(status: QueueStatus): string {
  if (status === "Ready to Claim") {
    return "Ready now";
  }
  if (status === "Claimed") {
    return "Completed";
  }
  if (status === "Partially Filled") {
    return "~Soon";
  }
  return "~Pending";
}

export function isClaimedQueueStatus(status: string): boolean {
  return mapQueueStatus(status) === "Claimed";
}
