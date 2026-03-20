import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject | undefined {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as JsonObject;
  }
  return undefined;
}

function asString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asInteger(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.trunc(parsed);
    }
  }
  return undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

// Accepts a full registration payload and persists all relevant data to the DB
export async function POST(request: Request) {
  try {
    const body = asObject(await request.json());
    if (!body) {
      return new Response(JSON.stringify({ error: "Invalid JSON payload." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const runLabel = asString(body.runLabel);
    const network = asString(body.network);
    const chainId = asInteger(body.chainId);
    const factoryAddress = asString(body.factoryAddress);

    if (!runLabel || !network || chainId === undefined || !factoryAddress) {
      return new Response(JSON.stringify({ error: "Missing required fields: runLabel, network, chainId, factoryAddress." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const roles = asObject(body.roles) ?? {};
    const deployRoles = asObject(roles.deploy);

    const requestedVault = asObject(body.vault);
    const requestedToken = asObject(body.token);

    const resolvedVaultAddress = asString(requestedVault?.address) ?? asString(roles.deployedVault);
    const resolvedGovernanceManager = asString(requestedVault?.governanceManager) ?? asString(roles.deployedGovernanceManager);
    const resolvedTokenAddress = asString(requestedToken?.address) ?? asString(deployRoles?.asset);

    if (!resolvedVaultAddress || !resolvedGovernanceManager || !resolvedTokenAddress) {
      return new Response(
        JSON.stringify({
          error: "Unable to resolve vault/token payload. Provide vault and token objects, or include roles.deploy + deployedVault + deployedGovernanceManager.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const shareSymbol = asString(requestedVault?.shareSymbol) ?? asString(deployRoles?.shareSymbol) ?? "SHARE";
    const vaultName = asString(requestedVault?.vaultName) ?? asString(deployRoles?.shareName);
    const vaultSymbol = asString(requestedVault?.vaultSymbol) ?? shareSymbol;
    const vaultKey = asString(requestedVault?.vaultKey) ?? resolvedVaultAddress;
    const vaultScenario = asString(requestedVault?.scenario) ?? "default";

    const tokenName = asString(requestedToken?.name) ?? asString(deployRoles?.shareName) ?? "Unknown Asset";
    const tokenSymbol = asString(requestedToken?.symbol) ?? asString(deployRoles?.shareSymbol) ?? "ASSET";
    const tokenDecimals = asInteger(requestedToken?.decimals) ?? 18;

    const strategist = asString(body.strategist) ?? asString(roles.strategist);
    const guardian = asString(body.guardian) ?? asString(roles.guardian);
    const keeper = asString(body.keeper) ?? asString(roles.keeper);
    const treasury = asString(body.treasury) ?? asString(deployRoles?.treasury);
    const withdrawalFeeBps = asInteger(body.withdrawalFeeBps) ?? 0;
    const strategy = asObject(body.strategy);
    const controller = asObject(body.controller);
    const controllerAddress = asString(controller?.address) ?? null;

    // Create DeploymentRun
    const createdRun = await prisma.deploymentRun.create({
      data: {
        runLabel,
        generatedAt: new Date(),
        network,
        chainId,
        persistMode: "manual",
        factoryAddress,
        roles: roles as Prisma.InputJsonValue,
      },
    });

    // Create Token (asset)
    await prisma.token.create({
      data: {
        runId: createdRun.id,
        address: resolvedTokenAddress,
        name: tokenName,
        symbol: tokenSymbol,
        decimals: tokenDecimals,
      },
    });

    // Create Vault
    await prisma.vault.create({
      data: {
        runId: createdRun.id,
        vaultKey,
        scenario: vaultScenario,
        address: resolvedVaultAddress,
        governanceManager: resolvedGovernanceManager,
        automationController: controllerAddress,
        assetAddress: resolvedTokenAddress,
        assetSymbol: tokenSymbol,
        assetDecimals: tokenDecimals,
        shareSymbol,
        withdrawalFeeBps,
        totalAssets: "0",
        idleAssets: "0",
        totalSupply: "0",
        pricePerShare: "0",
        totalQueuedAssets: "0",
        paused: false,
        nextSettleId: "0",
        withdrawalCounter: "0",
        vaultName: vaultName ?? null,
        vaultSymbol: vaultSymbol,
      },
    });

    // Create RoleMembers
    const roleMembers = [];
    if (strategist) {
      roleMembers.push({
        id: crypto.randomUUID(),
        runId: createdRun.id,
        contractAddress: resolvedGovernanceManager,
        contractType: "GovernanceManager",
        roleId: "STRATEGIST_ROLE",
        roleName: "strategist",
        account: strategist,
        grantedAtBlock: 0,
        revokedAtBlock: null,
        isActive: true,
      });
    }
    if (guardian) {
      roleMembers.push({
        id: crypto.randomUUID(),
        runId: createdRun.id,
        contractAddress: resolvedGovernanceManager,
        contractType: "GovernanceManager",
        roleId: "GUARDIAN_ROLE",
        roleName: "guardian",
        account: guardian,
        grantedAtBlock: 0,
        revokedAtBlock: null,
        isActive: true,
      });
    }
    if (keeper) {
      roleMembers.push({
        id: crypto.randomUUID(),
        runId: createdRun.id,
        contractAddress: resolvedVaultAddress,
        contractType: "ParaVault",
        roleId: "KEEPER_ROLE",
        roleName: "keeper",
        account: keeper,
        grantedAtBlock: 0,
        revokedAtBlock: null,
        isActive: true,
      });
    }
    if (treasury) {
      roleMembers.push({
        id: crypto.randomUUID(),
        runId: createdRun.id,
        contractAddress: resolvedGovernanceManager,
        contractType: "GovernanceManager",
        roleId: "TREASURY_ROLE",
        roleName: "treasury",
        account: treasury,
        grantedAtBlock: 0,
        revokedAtBlock: null,
        isActive: true,
      });
    }
    for (const rm of roleMembers) {
      await prisma.roleMember.create({ data: rm });
    }

    // Create Strategy if present
    const strategyAddress = asString(strategy?.address);
    if (strategy && strategyAddress) {
      await prisma.strategy.create({
        data: {
          runId: createdRun.id,
          vaultKey,
          label: asString(strategy.label) ?? "",
          address: strategyAddress,
          capBps: asInteger(strategy.capBps) ?? 0,
          targetBps: asInteger(strategy.targetBps) ?? 0,
          autoManaged: asBoolean(strategy.autoManaged) ?? false,
          isPanicked: false,
          totalManagedAssets: "0",
        },
      });
    }

    // Optionally: save idlePolicy, controller, etc. as needed

    return new Response(JSON.stringify({ success: true, runId: createdRun.id }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
