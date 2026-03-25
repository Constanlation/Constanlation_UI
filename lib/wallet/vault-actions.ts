import { type PublicClient, parseUnits } from "viem";

import { governanceManagerAbi, paraVaultAbi, vaultAutomationControllerAbi } from "@/lib/contracts/registry";

const erc20Abi = [
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export interface VaultActionContext {
  publicClient: PublicClient;
  writeContractAsync: (args: {
    address: `0x${string}`;
    abi: readonly unknown[];
    functionName: string;
    args: readonly unknown[];
  }) => Promise<`0x${string}`>;
  userAddress: `0x${string}`;
  vaultAddress: `0x${string}`;
}

async function waitForTx(publicClient: PublicClient, hash: `0x${string}`) {
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") {
    throw new Error(`Transaction reverted on-chain: ${hash}`);
  }
}

export async function readVaultAssetAddress(publicClient: PublicClient, vaultAddress: `0x${string}`) {
  const assetAddress = await publicClient.readContract({
    address: vaultAddress,
    abi: paraVaultAbi,
    functionName: "asset",
    args: [],
  });

  return assetAddress as `0x${string}`;
}

export async function readAssetDecimals(publicClient: PublicClient, assetAddress: `0x${string}`) {
  const decimals = await publicClient.readContract({
    address: assetAddress,
    abi: erc20Abi,
    functionName: "decimals",
    args: [],
  });
  return Number(decimals);
}

export async function readVaultShareDecimals(publicClient: PublicClient, vaultAddress: `0x${string}`) {
  const decimals = await publicClient.readContract({
    address: vaultAddress,
    abi: paraVaultAbi,
    functionName: "decimals",
    args: [],
  });
  return Number(decimals);
}

async function parseAssetAmount(
  publicClient: PublicClient,
  vaultAddress: `0x${string}`,
  humanAmount: string,
): Promise<bigint> {
  const assetAddress = await readVaultAssetAddress(publicClient, vaultAddress);
  const decimals = await readAssetDecimals(publicClient, assetAddress);
  return parseUnits(humanAmount, decimals);
}

async function parseShareAmount(
  publicClient: PublicClient,
  vaultAddress: `0x${string}`,
  humanAmount: string,
): Promise<bigint> {
  const decimals = await readVaultShareDecimals(publicClient, vaultAddress);
  return parseUnits(humanAmount, decimals);
}

export async function readVaultShareBalance(
  publicClient: PublicClient,
  vaultAddress: `0x${string}`,
  userAddress: `0x${string}`,
) {
  const balance = await publicClient.readContract({
    address: vaultAddress,
    abi: paraVaultAbi,
    functionName: "balanceOf",
    args: [userAddress],
  });

  return balance as bigint;
}

export async function readAssetBalance(
  publicClient: PublicClient,
  assetAddress: `0x${string}`,
  userAddress: `0x${string}`,
) {
  const balance = await publicClient.readContract({
    address: assetAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [userAddress],
  });

  return balance as bigint;
}

export async function readMaxWithdrawAssets(
  publicClient: PublicClient,
  vaultAddress: `0x${string}`,
  userAddress: `0x${string}`,
) {
  const maxWithdraw = await publicClient.readContract({
    address: vaultAddress,
    abi: paraVaultAbi,
    functionName: "maxWithdraw",
    args: [userAddress],
  });

  return maxWithdraw as bigint;
}

export async function previewRedeemAssets(
  publicClient: PublicClient,
  vaultAddress: `0x${string}`,
  shares: bigint,
) {
  const assets = await publicClient.readContract({
    address: vaultAddress,
    abi: paraVaultAbi,
    functionName: "previewRedeem",
    args: [shares],
  });

  return assets as bigint;
}

async function ensureVaultAllowance(
  context: VaultActionContext,
  requiredAmount: bigint,
): Promise<`0x${string}` | null> {
  const assetAddress = await readVaultAssetAddress(context.publicClient, context.vaultAddress);
  const allowance = await context.publicClient.readContract({
    address: assetAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [context.userAddress, context.vaultAddress],
  });

  if ((allowance as bigint) >= requiredAmount) {
    return null;
  }

  const approveHash = await context.writeContractAsync({
    address: assetAddress,
    abi: erc20Abi,
    functionName: "approve",
    args: [context.vaultAddress, requiredAmount],
  });
  await waitForTx(context.publicClient, approveHash);
  return approveHash;
}

export async function depositAssets(context: VaultActionContext, humanAmount: string) {
  const assets = await parseAssetAmount(context.publicClient, context.vaultAddress, humanAmount);
  if (assets <= BigInt(0)) {
    throw new Error("Amount must be greater than 0");
  }

  await ensureVaultAllowance(context, assets);

  const hash = await context.writeContractAsync({
    address: context.vaultAddress,
    abi: paraVaultAbi,
    functionName: "deposit",
    args: [assets, context.userAddress],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function withdrawAssets(context: VaultActionContext, humanAmount: string) {
  const assets = await parseAssetAmount(context.publicClient, context.vaultAddress, humanAmount);
  if (assets <= BigInt(0)) {
    throw new Error("Amount must be greater than 0");
  }

  const hash = await context.writeContractAsync({
    address: context.vaultAddress,
    abi: paraVaultAbi,
    functionName: "withdraw",
    args: [assets, context.userAddress, context.userAddress],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function requestWithdrawAssets(context: VaultActionContext, humanAmount: string) {
  const shares = await parseShareAmount(context.publicClient, context.vaultAddress, humanAmount);
  if (shares <= BigInt(0)) {
    throw new Error("Amount must be greater than 0");
  }

  const hash = await context.writeContractAsync({
    address: context.vaultAddress,
    abi: paraVaultAbi,
    functionName: "requestWithdraw",
    args: [shares, context.userAddress],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function claimWithdrawalById(context: VaultActionContext, queueId: bigint) {
  const hash = await context.writeContractAsync({
    address: context.vaultAddress,
    abi: paraVaultAbi,
    functionName: "claimWithdrawal",
    args: [queueId],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function allocateToStrategy(
  context: VaultActionContext,
  strategyAddress: `0x${string}`,
  humanAmount: string,
) {
  const assets = await parseAssetAmount(context.publicClient, context.vaultAddress, humanAmount);
  if (assets <= BigInt(0)) {
    throw new Error("Amount must be greater than 0");
  }

  const hash = await context.writeContractAsync({
    address: context.vaultAddress,
    abi: paraVaultAbi,
    functionName: "allocate",
    args: [strategyAddress, assets],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function recallFromStrategyAssets(
  context: VaultActionContext,
  strategyAddress: `0x${string}`,
  humanAmount: string,
) {
  const assets = await parseAssetAmount(context.publicClient, context.vaultAddress, humanAmount);
  if (assets <= BigInt(0)) {
    throw new Error("Amount must be greater than 0");
  }

  const hash = await context.writeContractAsync({
    address: context.vaultAddress,
    abi: paraVaultAbi,
    functionName: "recallFromStrategy",
    args: [strategyAddress, assets],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function recallAllFromStrategy(
  context: VaultActionContext,
  strategyAddress: `0x${string}`,
) {
  const hash = await context.writeContractAsync({
    address: context.vaultAddress,
    abi: paraVaultAbi,
    functionName: "recallAllFromStrategy",
    args: [strategyAddress],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function harvestStrategy(
  context: VaultActionContext,
  strategyAddress: `0x${string}`,
) {
  const hash = await context.writeContractAsync({
    address: context.vaultAddress,
    abi: paraVaultAbi,
    functionName: "harvest",
    args: [strategyAddress],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function rebalanceStrategies(
  context: VaultActionContext,
  recallOrder: Array<`0x${string}`>,
  allocateOrder: Array<`0x${string}`>,
) {
  const hash = await context.writeContractAsync({
    address: context.vaultAddress,
    abi: paraVaultAbi,
    functionName: "rebalance",
    args: [recallOrder, allocateOrder],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function pauseVault(context: VaultActionContext) {
  const hash = await context.writeContractAsync({
    address: context.vaultAddress,
    abi: paraVaultAbi,
    functionName: "pause",
    args: [],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function unpauseVault(context: VaultActionContext) {
  const hash = await context.writeContractAsync({
    address: context.vaultAddress,
    abi: paraVaultAbi,
    functionName: "unpause",
    args: [],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function mintVaultShares(context: VaultActionContext, humanShares: string) {
  const shares = await parseShareAmount(context.publicClient, context.vaultAddress, humanShares);
  if (shares <= BigInt(0)) {
    throw new Error("Amount must be greater than 0");
  }

  const hash = await context.writeContractAsync({
    address: context.vaultAddress,
    abi: paraVaultAbi,
    functionName: "mint",
    args: [shares, context.userAddress],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function redeemVaultShares(context: VaultActionContext, humanShares: string) {
  const shares = await parseShareAmount(context.publicClient, context.vaultAddress, humanShares);
  if (shares <= BigInt(0)) {
    throw new Error("Amount must be greater than 0");
  }

  const hash = await context.writeContractAsync({
    address: context.vaultAddress,
    abi: paraVaultAbi,
    functionName: "redeem",
    args: [shares, context.userAddress, context.userAddress],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

function toUint16(value: number, label: string) {
  if (!Number.isInteger(value) || value < 0 || value > 65_535) {
    throw new Error(`${label} must be an integer between 0 and 65535`);
  }
  return value;
}

export async function setVaultIdlePolicy(
  context: VaultActionContext,
  minIdleBps: number,
  rebalanceSlackBps: number,
) {
  const hash = await context.writeContractAsync({
    address: context.vaultAddress,
    abi: paraVaultAbi,
    functionName: "setIdlePolicy",
    args: [toUint16(minIdleBps, "Min idle BPS"), toUint16(rebalanceSlackBps, "Rebalance slack BPS")],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function rescueVaultToken(
  context: VaultActionContext,
  tokenAddress: `0x${string}`,
  recipientAddress: `0x${string}`,
  humanAmount: string,
) {
  const amount = await parseAssetAmount(context.publicClient, context.vaultAddress, humanAmount);
  if (amount <= BigInt(0)) {
    throw new Error("Amount must be greater than 0");
  }

  const hash = await context.writeContractAsync({
    address: context.vaultAddress,
    abi: paraVaultAbi,
    functionName: "rescueToken",
    args: [tokenAddress, recipientAddress, amount],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function grantVaultRole(
  context: VaultActionContext,
  role: `0x${string}`,
  accountAddress: `0x${string}`,
) {
  const hash = await context.writeContractAsync({
    address: context.vaultAddress,
    abi: paraVaultAbi,
    functionName: "grantRole",
    args: [role, accountAddress],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function revokeVaultRole(
  context: VaultActionContext,
  role: `0x${string}`,
  accountAddress: `0x${string}`,
) {
  const hash = await context.writeContractAsync({
    address: context.vaultAddress,
    abi: paraVaultAbi,
    functionName: "revokeRole",
    args: [role, accountAddress],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

function validateBps(value: number, label: string) {
  return toUint16(value, label);
}

export interface GovernanceStrategyAutomationInput {
  targetBps: number;
  autoManaged: boolean;
}

export async function governanceApproveStrategy(
  context: VaultActionContext,
  governanceManagerAddress: `0x${string}`,
  strategyAddress: `0x${string}`,
  capBps: number,
) {
  const hash = await context.writeContractAsync({
    address: governanceManagerAddress,
    abi: governanceManagerAbi,
    functionName: "approveStrategy",
    args: [strategyAddress, validateBps(capBps, "Strategy cap BPS")],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function governanceDisableStrategy(
  context: VaultActionContext,
  governanceManagerAddress: `0x${string}`,
  strategyAddress: `0x${string}`,
) {
  const hash = await context.writeContractAsync({
    address: governanceManagerAddress,
    abi: governanceManagerAbi,
    functionName: "disableStrategy",
    args: [strategyAddress],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function governanceSetGuardian(
  context: VaultActionContext,
  governanceManagerAddress: `0x${string}`,
  guardianAddress: `0x${string}`,
) {
  const hash = await context.writeContractAsync({
    address: governanceManagerAddress,
    abi: governanceManagerAbi,
    functionName: "setGuardian",
    args: [context.vaultAddress, guardianAddress],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function governanceRevokeGuardian(
  context: VaultActionContext,
  governanceManagerAddress: `0x${string}`,
  guardianAddress: `0x${string}`,
) {
  const hash = await context.writeContractAsync({
    address: governanceManagerAddress,
    abi: governanceManagerAbi,
    functionName: "revokeGuardian",
    args: [context.vaultAddress, guardianAddress],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function governanceSetStrategist(
  context: VaultActionContext,
  governanceManagerAddress: `0x${string}`,
  strategistAddress: `0x${string}`,
) {
  const hash = await context.writeContractAsync({
    address: governanceManagerAddress,
    abi: governanceManagerAbi,
    functionName: "setStrategist",
    args: [context.vaultAddress, strategistAddress],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function governanceRevokeStrategist(
  context: VaultActionContext,
  governanceManagerAddress: `0x${string}`,
  strategistAddress: `0x${string}`,
) {
  const hash = await context.writeContractAsync({
    address: governanceManagerAddress,
    abi: governanceManagerAbi,
    functionName: "revokeStrategist",
    args: [context.vaultAddress, strategistAddress],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function governanceSetStrategyCap(
  context: VaultActionContext,
  governanceManagerAddress: `0x${string}`,
  strategyAddress: `0x${string}`,
  capBps: number,
) {
  const hash = await context.writeContractAsync({
    address: governanceManagerAddress,
    abi: governanceManagerAbi,
    functionName: "setStrategyCap",
    args: [strategyAddress, validateBps(capBps, "Strategy cap BPS")],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function governanceSetStrategyAutomationConfig(
  context: VaultActionContext,
  governanceManagerAddress: `0x${string}`,
  strategyAddress: `0x${string}`,
  config: GovernanceStrategyAutomationInput,
) {
  const hash = await context.writeContractAsync({
    address: governanceManagerAddress,
    abi: governanceManagerAbi,
    functionName: "setStrategyAutomationConfig",
    args: [strategyAddress, validateBps(config.targetBps, "Strategy target BPS"), config.autoManaged],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function governanceSetTreasury(
  context: VaultActionContext,
  governanceManagerAddress: `0x${string}`,
  treasuryAddress: `0x${string}`,
) {
  const hash = await context.writeContractAsync({
    address: governanceManagerAddress,
    abi: governanceManagerAbi,
    functionName: "setTreasury",
    args: [treasuryAddress],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function governanceSetWithdrawalFeeBps(
  context: VaultActionContext,
  governanceManagerAddress: `0x${string}`,
  feeBps: number,
) {
  const hash = await context.writeContractAsync({
    address: governanceManagerAddress,
    abi: governanceManagerAbi,
    functionName: "setWithdrawalFeeBps",
    args: [validateBps(feeBps, "Withdrawal fee BPS")],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function governanceGrantRole(
  context: VaultActionContext,
  governanceManagerAddress: `0x${string}`,
  role: `0x${string}`,
  accountAddress: `0x${string}`,
) {
  const hash = await context.writeContractAsync({
    address: governanceManagerAddress,
    abi: governanceManagerAbi,
    functionName: "grantRole",
    args: [role, accountAddress],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function governanceRevokeRole(
  context: VaultActionContext,
  governanceManagerAddress: `0x${string}`,
  role: `0x${string}`,
  accountAddress: `0x${string}`,
) {
  const hash = await context.writeContractAsync({
    address: governanceManagerAddress,
    abi: governanceManagerAbi,
    functionName: "revokeRole",
    args: [role, accountAddress],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function panicVaultStrategy(
  context: VaultActionContext,
  strategyAddress: `0x${string}`,
) {
  const hash = await context.writeContractAsync({
    address: context.vaultAddress,
    abi: paraVaultAbi,
    functionName: "panicStrategy",
    args: [strategyAddress],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export interface ControllerStrategyPolicyInput {
  enabled: boolean;
  minHarvestInterval: number;
  minRebalanceInterval: number;
  maxAllocatePerExec: string;
  maxRecallPerExec: string;
}

function ensureNonNegativeInteger(value: number, field: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a non-negative number`);
  }
}

async function readControllerKeeperRole(
  context: VaultActionContext,
  controllerAddress: `0x${string}`,
) {
  const keeperRole = await context.publicClient.readContract({
    address: controllerAddress,
    abi: vaultAutomationControllerAbi,
    functionName: "KEEPER_ROLE",
    args: [],
  });
  return keeperRole as `0x${string}`;
}

export async function setControllerAutomationPaused(
  context: VaultActionContext,
  controllerAddress: `0x${string}`,
  paused: boolean,
) {
  const hash = await context.writeContractAsync({
    address: controllerAddress,
    abi: vaultAutomationControllerAbi,
    functionName: "setAutomationPaused",
    args: [paused],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function setControllerStrategyPolicy(
  context: VaultActionContext,
  controllerAddress: `0x${string}`,
  strategyAddress: `0x${string}`,
  policy: ControllerStrategyPolicyInput,
) {
  ensureNonNegativeInteger(policy.minHarvestInterval, "Min harvest interval");
  ensureNonNegativeInteger(policy.minRebalanceInterval, "Min rebalance interval");

  const maxAllocateAssets = await parseAssetAmount(
    context.publicClient,
    context.vaultAddress,
    policy.maxAllocatePerExec,
  );
  const maxRecallAssets = await parseAssetAmount(
    context.publicClient,
    context.vaultAddress,
    policy.maxRecallPerExec,
  );

  const hash = await context.writeContractAsync({
    address: controllerAddress,
    abi: vaultAutomationControllerAbi,
    functionName: "setStrategyPolicy",
    args: [
      strategyAddress,
      {
        enabled: policy.enabled,
        minHarvestInterval: BigInt(Math.floor(policy.minHarvestInterval)),
        minRebalanceInterval: BigInt(Math.floor(policy.minRebalanceInterval)),
        maxAllocatePerExec: maxAllocateAssets,
        maxRecallPerExec: maxRecallAssets,
      },
    ],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function grantControllerKeeperRole(
  context: VaultActionContext,
  controllerAddress: `0x${string}`,
  keeperAddress: `0x${string}`,
) {
  const keeperRole = await readControllerKeeperRole(context, controllerAddress);

  const hash = await context.writeContractAsync({
    address: controllerAddress,
    abi: vaultAutomationControllerAbi,
    functionName: "grantRole",
    args: [keeperRole, keeperAddress],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function revokeControllerKeeperRole(
  context: VaultActionContext,
  controllerAddress: `0x${string}`,
  keeperAddress: `0x${string}`,
) {
  const keeperRole = await readControllerKeeperRole(context, controllerAddress);

  const hash = await context.writeContractAsync({
    address: controllerAddress,
    abi: vaultAutomationControllerAbi,
    functionName: "revokeRole",
    args: [keeperRole, keeperAddress],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function executeKeeperHarvest(
  context: VaultActionContext,
  controllerAddress: `0x${string}`,
  strategyAddress: `0x${string}`,
) {
  const hash = await context.writeContractAsync({
    address: controllerAddress,
    abi: vaultAutomationControllerAbi,
    functionName: "executeHarvest",
    args: [strategyAddress],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function executeKeeperAllocate(
  context: VaultActionContext,
  controllerAddress: `0x${string}`,
  strategyAddress: `0x${string}`,
  humanAmount: string,
) {
  const assets = await parseAssetAmount(context.publicClient, context.vaultAddress, humanAmount);
  if (assets <= BigInt(0)) {
    throw new Error("Amount must be greater than 0");
  }

  const hash = await context.writeContractAsync({
    address: controllerAddress,
    abi: vaultAutomationControllerAbi,
    functionName: "executeAllocate",
    args: [strategyAddress, assets],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function executeKeeperRecall(
  context: VaultActionContext,
  controllerAddress: `0x${string}`,
  strategyAddress: `0x${string}`,
  humanAmount: string,
) {
  const assets = await parseAssetAmount(context.publicClient, context.vaultAddress, humanAmount);
  if (assets <= BigInt(0)) {
    throw new Error("Amount must be greater than 0");
  }

  const hash = await context.writeContractAsync({
    address: controllerAddress,
    abi: vaultAutomationControllerAbi,
    functionName: "executeRecall",
    args: [strategyAddress, assets],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}

export async function executeKeeperSettleWithdrawals(
  context: VaultActionContext,
  controllerAddress: `0x${string}`,
  maxCount: number,
) {
  if (!Number.isFinite(maxCount) || maxCount <= 0) {
    throw new Error("Max count must be greater than 0");
  }

  const hash = await context.writeContractAsync({
    address: controllerAddress,
    abi: vaultAutomationControllerAbi,
    functionName: "executeSettleWithdrawals",
    args: [BigInt(Math.floor(maxCount))],
  });
  await waitForTx(context.publicClient, hash);
  return hash;
}