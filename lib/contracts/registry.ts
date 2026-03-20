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

export const polkadotTestnetContractDefaults = {
  network: polkadotTestnetAddresses.network,
  chainId: polkadotTestnetAddresses.chainId,
  factory: polkadotTestnetAddresses.contracts.VaultFactory,
  governanceManager:
    polkadotTestnetAddresses.vaults[0]?.governanceManager ?? polkadotTestnetAddresses.contracts.GovernanceManager,
  vault: polkadotTestnetAddresses.vaults[0]?.vault ?? polkadotTestnetAddresses.contracts.ParaVault,
  controller:
    polkadotTestnetAddresses.vaults[0]?.automationController ??
    polkadotTestnetAddresses.contracts.VaultAutomationController,
  strategy:
    polkadotTestnetAddresses.vaults[0]?.strategyAddress ?? polkadotTestnetAddresses.contracts.MockYieldStrategy,
  asset: polkadotTestnetAddresses.vaults[0]?.assetAddress ?? polkadotTestnetAddresses.contracts.MockERC20,
} as const;
