export type WalletErrorCategory =
  | "user-rejected"
  | "rpc"
  | "no-data"
  | "revert"
  | "gas"
  | "balance"
  | "approval"
  | "unknown";

export interface NormalizedWalletError {
  category: WalletErrorCategory;
  publicMessage: string;
  technicalMessage?: string;
}

const isDev = process.env.NODE_ENV === "development";

function cleanMessage(message: string): string {
  return message.replace(/\s+/g, " ").trim();
}

function technicalForKnown(cleaned: string): string | undefined {
  return isDev && cleaned ? cleaned : undefined;
}

function extractRevertReason(cleaned: string): string | undefined {
  const patterns = [
    /reverted with reason string ['\"]([^'\"]+)['\"]/i,
    /execution reverted(?::| with reason string)?\s*['\"]?([^'\".]+)['\"]?/i,
    /revert(?:ed)?\s*[:\-]\s*([^.;]+)/i,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    const reason = match?.[1]?.trim();
    if (reason) {
      return reason;
    }
  }

  return undefined;
}

export function normalizeWalletError(error: unknown): NormalizedWalletError {
  if (!(error instanceof Error)) {
    return {
      category: "unknown",
      publicMessage: "Transaction failed. Please try again.",
    };
  }

  const cleaned = cleanMessage(error.message ?? "");
  const lower = cleaned.toLowerCase();

  if (cleaned.includes("Amount must be greater than 0")) {
    return {
      category: "revert",
      publicMessage: "Enter an amount greater than 0.",
    };
  }

  if (
    lower.includes("user rejected") ||
    lower.includes("user denied") ||
    lower.includes("denied transaction signature") ||
    lower.includes("rejected signature") ||
    lower.includes("request rejected")
  ) {
    return {
      category: "user-rejected",
      publicMessage: "Transaction was canceled in your wallet.",
      technicalMessage: technicalForKnown(cleaned),
    };
  }

  if (
    lower.includes("function returned no data") ||
    lower.includes("returned no data") ||
    (lower.includes("0x") && lower.includes("no data"))
  ) {
    return {
      category: "no-data",
      publicMessage: "This vault is not fully initialized on the selected network yet.",
      technicalMessage: technicalForKnown(cleaned),
    };
  }

  if (
    lower.includes("insufficient funds") ||
    lower.includes("insufficient balance") ||
    lower.includes("exceeds balance")
  ) {
    return {
      category: "balance",
      publicMessage: "Insufficient balance to complete this transaction.",
      technicalMessage: technicalForKnown(cleaned),
    };
  }

  if (lower.includes("allowance") || lower.includes("approve") || lower.includes("approval")) {
    return {
      category: "approval",
      publicMessage: "Token approval is required before this action can continue.",
      technicalMessage: technicalForKnown(cleaned),
    };
  }

  if (
    lower.includes("gas estimation") ||
    lower.includes("cannot estimate gas") ||
    lower.includes("intrinsic gas") ||
    lower.includes("gas required exceeds")
  ) {
    return {
      category: "gas",
      publicMessage: "Transaction simulation failed. Check amount and try again.",
      technicalMessage: technicalForKnown(cleaned),
    };
  }

  if (lower.includes("execution reverted") || lower.includes("reverted") || lower.includes("revert")) {
    const reason = extractRevertReason(cleaned);
    return {
      category: "revert",
      publicMessage: reason
        ? `Transaction reverted: ${reason}.`
        : "Transaction reverted by contract rules.",
      technicalMessage: technicalForKnown(cleaned),
    };
  }

  if (
    lower.includes("rpc") ||
    lower.includes("network request") ||
    lower.includes("failed to fetch") ||
    lower.includes("fetch failed") ||
    lower.includes("timeout") ||
    lower.includes("429") ||
    lower.includes("503")
  ) {
    return {
      category: "rpc",
      publicMessage: "Network RPC is currently unstable. Try again or switch RPC endpoint.",
      technicalMessage: technicalForKnown(cleaned),
    };
  }

  return {
    category: "unknown",
    publicMessage: "Transaction failed. Please try again.",
    technicalMessage: cleaned || undefined,
  };
}