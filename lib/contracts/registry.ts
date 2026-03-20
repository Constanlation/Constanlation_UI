import type { Abi } from "viem";

import polkadotTestnetAddresses from "@/abi/addresses.polkadotTestnet.json";
import vaultAutomationControllerArtifact from "@/abi/contracts/contracts_automation_VaultAutomationController_sol__VaultAutomationController.json";
import vaultFactoryArtifact from "@/abi/contracts/contracts_factory_VaultFactory_sol__VaultFactory.json";
import governanceManagerArtifact from "@/abi/contracts/contracts_governance_GovernanceManager_sol__GovernanceManager.json";
import paraVaultArtifact from "@/abi/contracts/contracts_vault_ParaVault_sol__ParaVault.json";

export const accessControlAbi = [
  {
    type: "function",
    name: "hasRole",
    stateMutability: "view",
    inputs: [
      { name: "role", type: "bytes32" },
      { name: "account", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const satisfies Abi;

export const paraVaultAbi = paraVaultArtifact.abi as Abi;
export const governanceManagerAbi = governanceManagerArtifact.abi as Abi;
export const vaultAutomationControllerAbi = vaultAutomationControllerArtifact.abi as Abi;
export const vaultFactoryAbi = vaultFactoryArtifact.abi as Abi;

export const polkadotTestnetRoleDefaults = {
  admin: polkadotTestnetAddresses.roles.admin,
  strategist: polkadotTestnetAddresses.roles.strategist,
  guardian: polkadotTestnetAddresses.roles.guardian,
  keeper: polkadotTestnetAddresses.roles.keeper,
  treasury: polkadotTestnetAddresses.roles.treasury,
} as const;

function pickPrimaryVault() {
  const vaults = polkadotTestnetAddresses.vaults;
  return vaults.find((vault) => vault.key === "dot-core")
    ?? vaults.find((vault) => vault.key === "pvPASEO")
    ?? vaults[0];
}

const primaryVault = pickPrimaryVault();

export const polkadotTestnetContractDefaults = {
  network: polkadotTestnetAddresses.network,
  chainId: polkadotTestnetAddresses.chainId,
  factory: polkadotTestnetAddresses.contracts.VaultFactory,
  governanceManager:
    primaryVault?.governanceManager ?? polkadotTestnetAddresses.contracts.GovernanceManager,
  vault: primaryVault?.vault ?? polkadotTestnetAddresses.contracts.ParaVault,
  controller:
    primaryVault?.automationController ??
    polkadotTestnetAddresses.contracts.VaultAutomationController,
  strategy:
    primaryVault?.strategyAddress ?? polkadotTestnetAddresses.contracts.MockYieldStrategy,
  asset: primaryVault?.assetAddress ?? polkadotTestnetAddresses.contracts.MockERC20,
} as const;
