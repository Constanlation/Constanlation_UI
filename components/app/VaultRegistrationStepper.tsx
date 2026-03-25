"use client";

import { CircleHelp } from "lucide-react";
import { useEffect, useState } from "react";
import { decodeEventLog, keccak256, toBytes } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";

import Stepper, { Step } from "@/components/Stepper";
import {
  accessControlAbi,
  governanceManagerAbi,
  paraVaultAbi,
  polkadotTestnetContractDefaults,
  polkadotTestnetRoleDefaults,
  vaultAutomationControllerAbi,
  vaultFactoryAbi,
} from "@/lib/contracts/registry";
import { toChecksumAddress } from "@/lib/utils";

type FieldType = "text" | "number" | "boolean" | "address";

type StepField = {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  roleHint?: string;
};

type RegistrationStep = {
  id: string;
  title: string;
  description: string;
  signer: string;
  optional?: boolean;
  fields: StepField[];
};

type StepStatusTone = "info" | "success" | "error";

type StepStatus = {
  tone: StepStatusTone;
  message: string;
};

type FactorySource = "db" | "registry-fallback";

type VaultRegistrationStepperProps = {
  defaultFactoryAddress?: string;
  factorySource?: FactorySource;
};

const KEEPER_ROLE = keccak256(toBytes("KEEPER_ROLE"));
const REGISTRATION_DRAFT_STORAGE_KEY = "constellation.vault-registration.draft.v1";

function buildInitialValues(defaultFactoryAddress?: string): Record<string, string | boolean> {
  const defaults: Record<string, string | boolean> = {};

  if (defaultFactoryAddress) {
    defaults["deploy.factory"] = defaultFactoryAddress;
  } else if (polkadotTestnetContractDefaults.factory) {
    defaults["deploy.factory"] = polkadotTestnetContractDefaults.factory;
  }
  if (polkadotTestnetContractDefaults.asset) {
    defaults["deploy.asset_"] = polkadotTestnetContractDefaults.asset;
  }
  if (polkadotTestnetRoleDefaults.admin) {
    defaults["deploy.admin_"] = polkadotTestnetRoleDefaults.admin;
    defaults["strategist.strategist"] = polkadotTestnetRoleDefaults.admin;
    defaults["guardian.guardian"] = polkadotTestnetRoleDefaults.admin;
  }
  if (polkadotTestnetRoleDefaults.treasury) {
    defaults["deploy.treasury_"] = polkadotTestnetRoleDefaults.treasury;
  }
  if (polkadotTestnetRoleDefaults.keeper) {
    defaults["vaultKeeper.keeper"] = polkadotTestnetRoleDefaults.keeper;
    defaults["controller.keeper"] = polkadotTestnetRoleDefaults.keeper;
  }
  if (polkadotTestnetContractDefaults.governanceManager) {
    defaults["strategist.governanceManager"] = polkadotTestnetContractDefaults.governanceManager;
    defaults["guardian.governanceManager"] = polkadotTestnetContractDefaults.governanceManager;
    defaults["treasury.governanceManager"] = polkadotTestnetContractDefaults.governanceManager;
    defaults["withdrawalFee.governanceManager"] = polkadotTestnetContractDefaults.governanceManager;
    defaults["strategyApproval.governanceManager"] = polkadotTestnetContractDefaults.governanceManager;
    defaults["strategyAutomation.governanceManager"] = polkadotTestnetContractDefaults.governanceManager;
  }
  if (polkadotTestnetContractDefaults.vault) {
    defaults["strategist.vault_"] = polkadotTestnetContractDefaults.vault;
    defaults["guardian.vault_"] = polkadotTestnetContractDefaults.vault;
    defaults["vaultKeeper.vault_"] = polkadotTestnetContractDefaults.vault;
    defaults["idlePolicy.vault_"] = polkadotTestnetContractDefaults.vault;
  }
  if (polkadotTestnetContractDefaults.controller) {
    defaults["controller.controller"] = polkadotTestnetContractDefaults.controller;
  }
  if (polkadotTestnetContractDefaults.strategy) {
    defaults["strategyApproval.strategy"] = polkadotTestnetContractDefaults.strategy;
    defaults["strategyAutomation.strategy"] = polkadotTestnetContractDefaults.strategy;
    defaults["controller.strategy"] = polkadotTestnetContractDefaults.strategy;
  }

  return defaults;
}

const registrationSteps: RegistrationStep[] = [
  {
    id: "deploy",
    title: "Deploy Vault Ecosystem",
    description: "Create GovernanceManager + ParaVault through VaultFactory.registerVault.",
    signer: "Factory Owner",
    fields: [
      {
        name: "asset_",
        label: "Asset (ERC20) Address",
        type: "address",
        placeholder: "0x...",
        required: true,
      },
      {
        name: "admin_",
        label: "Governance Admin Address",
        type: "address",
        placeholder: "0x...",
        required: true,
      },
      {
        name: "treasury_",
        label: "Treasury Address",
        type: "address",
        placeholder: "0x...",
        required: true,
      },
      { name: "shareName_", label: "Share Token Name", type: "text", required: true },
      { name: "shareSymbol_", label: "Share Token Symbol", type: "text", required: true },
    ],
  },
];

export function VaultRegistrationStepper({ defaultFactoryAddress, factorySource }: VaultRegistrationStepperProps) {
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [values, setValues] = useState<Record<string, string | boolean>>(() => buildInitialValues(defaultFactoryAddress));
  const [statuses, setStatuses] = useState<Record<string, StepStatus>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stepperInitialStep, setStepperInitialStep] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);
  const [isDraftRestored, setIsDraftRestored] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.sessionStorage.getItem(REGISTRATION_DRAFT_STORAGE_KEY);
      if (!raw) {
        setIsDraftRestored(true);
        return;
      }

      const draft = JSON.parse(raw) as {
        values?: Record<string, string | boolean>;
        currentStep?: number;
      };

      if (draft.values && typeof draft.values === "object") {
        setValues((prev) => ({ ...prev, ...draft.values }));
      }

      if (
        Number.isInteger(draft.currentStep) &&
        Number(draft.currentStep) >= 1 &&
        Number(draft.currentStep) <= registrationSteps.length
      ) {
        setStepperInitialStep(Number(draft.currentStep));
        setCurrentStep(Number(draft.currentStep));
      }
    } catch {
      // Ignore corrupt draft payload and continue with defaults.
    } finally {
      setIsDraftRestored(true);
    }
  }, []);

  useEffect(() => {
    if (!isDraftRestored || typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(
      REGISTRATION_DRAFT_STORAGE_KEY,
      JSON.stringify({
        values,
        currentStep,
      }),
    );
  }, [currentStep, isDraftRestored, values]);

  const setFieldValue = (stepId: string, name: string, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [`${stepId}.${name}`]: value }));
  };

  const getFieldValue = (stepId: string, name: string) => values[`${stepId}.${name}`];

  const setFieldError = (stepId: string, name: string, message: string) => {
    setErrors((prev) => ({ ...prev, [`${stepId}.${name}`]: message }));
  };

  const clearFieldError = (stepId: string, name: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`${stepId}.${name}`];
      return next;
    });
  };

  const normalizeAddressField = (stepId: string, name: string) => {
    const value = getFieldValue(stepId, name);
    if (typeof value !== "string" || value.trim() === "") {
      clearFieldError(stepId, name);
      return true;
    }

    const checksummed = toChecksumAddress(value.trim());
    if (!checksummed) {
      setFieldError(stepId, name, "Invalid address format.");
      return false;
    }

    setFieldValue(stepId, name, checksummed);
    clearFieldError(stepId, name);
    return true;
  };

  const isFieldEmpty = (value: string | boolean | undefined) => {
    if (typeof value === "boolean") {
      return value === false;
    }
    if (typeof value === "string") {
      return value.trim() === "";
    }
    return true;
  };

  const clearStepErrors = (step: RegistrationStep) => {
    setErrors((prev) => {
      const next = { ...prev };
      for (const field of step.fields) {
        delete next[`${step.id}.${field.name}`];
      }
      return next;
    });
  };

  const getString = (stepId: string, name: string) => {
    const value = getFieldValue(stepId, name);
    return typeof value === "string" ? value.trim() : "";
  };

  const getBool = (stepId: string, name: string) => {
    const value = getFieldValue(stepId, name);
    return Boolean(value);
  };

  const getUint16 = (stepId: string, name: string) => {
    const value = getString(stepId, name);
    return Number(value);
  };

  const getBigInt = (stepId: string, name: string) => {
    const value = getString(stepId, name);
    return BigInt(value || "0");
  };

  const executeStepTransaction = async (step: RegistrationStep) => {
    if (!publicClient) {
      throw new Error("No active public client. Check wallet network and try again.");
    }

    const assertContractTarget = async (address: `0x${string}`, label: string) => {
      const bytecode = await publicClient.getBytecode({ address });
      if (!bytecode || bytecode === "0x") {
        throw new Error(
          `${label} must be a deployed contract address. Received an EOA or empty account: ${address}`,
        );
      }
    };

    switch (step.id) {
      case "deploy": {
        const factoryAddress = getString("deploy", "factory") as `0x${string}`;
        if (!factoryAddress) {
          throw new Error("Vault Factory default is unavailable. Check registration defaults and try again.");
        }
        await assertContractTarget(factoryAddress, "Vault Factory address");

        const hash = await writeContractAsync({
          address: factoryAddress,
          abi: vaultFactoryAbi,
          functionName: "registerVault",
          args: [
            getString("deploy", "asset_") as `0x${string}`,
            getString("deploy", "admin_") as `0x${string}`,
            getString("deploy", "treasury_") as `0x${string}`,
            getString("deploy", "shareName_"),
            getString("deploy", "shareSymbol_"),
          ],
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        let deployedVault = "";
        let deployedGovernanceManager = "";

        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: vaultFactoryAbi,
              data: log.data,
              topics: log.topics,
            });

            if (decoded.eventName === "VaultCreated") {
              const decodedArgs = decoded.args as Record<string, unknown> | undefined;
              const vault = decodedArgs?.vault;
              const governanceManager = decodedArgs?.governanceManager;
              if (typeof vault === "string" && typeof governanceManager === "string") {
                deployedVault = vault;
                deployedGovernanceManager = governanceManager;
                break;
              }
            }
          } catch {
            // Ignore non-matching logs.
          }
        }

        if (deployedVault && deployedGovernanceManager) {
          // Persist a registration run record to the server DB for later retrieval/indexing.
          try {
            const shareName = getString("deploy", "shareName_") || "Unnamed Vault";
            const shareSymbol = getString("deploy", "shareSymbol_") || "SHARE";
            const tokenAddress = getString("deploy", "asset_");
            const treasuryAddress = getString("deploy", "treasury_");

            const persistResponse = await fetch("/api/registrations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                runLabel: `run-${Date.now()}`,
                network: polkadotTestnetContractDefaults.network ?? "unknown",
                chainId: Number(polkadotTestnetContractDefaults.chainId ?? 0),
                factoryAddress: factoryAddress,
                roles: {
                  deploy: {
                    asset: tokenAddress,
                    admin: getString("deploy", "admin_"),
                    treasury: treasuryAddress,
                    shareName,
                    shareSymbol,
                  },
                  deployedVault,
                  deployedGovernanceManager,
                },
                vault: {
                  address: deployedVault,
                  governanceManager: deployedGovernanceManager,
                  shareSymbol,
                  vaultName: shareName,
                  vaultSymbol: shareSymbol,
                  vaultKey: deployedVault,
                  scenario: "default",
                },
                token: {
                  address: tokenAddress,
                  name: `${shareName} Asset`,
                  symbol: shareSymbol || "ASSET",
                  decimals: 18,
                },
                treasury: treasuryAddress,
              }),
            });

            if (!persistResponse.ok) {
              const errorText = await persistResponse.text().catch(() => "");
              console.error("Failed to persist registration run:", persistResponse.status, errorText);
            }
          } catch (e) {
            // non-fatal: persist failure should not block UX flow
            console.error("Failed to persist registration run:", e);
          }
        }

        return {
          hash,
          message: deployedVault && deployedGovernanceManager
            ? `Deployment confirmed. Vault: ${deployedVault} | GovernanceManager: ${deployedGovernanceManager}. Continue role setup in /profile/governance-admin, /profile/vault-admin, and /profile/controller-admin.`
            : "Deployment confirmed.",
        };
      }
      case "strategist": {
        const governanceManagerAddress = getString("strategist", "governanceManager") as `0x${string}`;
        await assertContractTarget(governanceManagerAddress, "Governance Manager address");

        const hash = await writeContractAsync({
          address: governanceManagerAddress,
          abi: governanceManagerAbi,
          functionName: "setStrategist",
          args: [
            getString("strategist", "vault_") as `0x${string}`,
            getString("strategist", "strategist") as `0x${string}`,
          ],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        return { hash, message: "Strategist role assignment confirmed." };
      }
      case "guardian": {
        const governanceManagerAddress = getString("guardian", "governanceManager") as `0x${string}`;
        await assertContractTarget(governanceManagerAddress, "Governance Manager address");

        const hash = await writeContractAsync({
          address: governanceManagerAddress,
          abi: governanceManagerAbi,
          functionName: "setGuardian",
          args: [
            getString("guardian", "vault_") as `0x${string}`,
            getString("guardian", "guardian") as `0x${string}`,
          ],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        return { hash, message: "Guardian role assignment confirmed." };
      }
      case "vaultKeeper": {
        const vaultAddress = getString("vaultKeeper", "vault_") as `0x${string}`;
        await assertContractTarget(vaultAddress, "Vault address");

        const hash = await writeContractAsync({
          address: vaultAddress,
          abi: accessControlAbi,
          functionName: "grantRole",
          args: [KEEPER_ROLE, getString("vaultKeeper", "keeper") as `0x${string}`],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        return { hash, message: "Vault keeper role grant confirmed." };
      }
      case "withdrawalFee": {
        const governanceManagerAddress = getString("withdrawalFee", "governanceManager") as `0x${string}`;
        await assertContractTarget(governanceManagerAddress, "Governance Manager address");

        const hash = await writeContractAsync({
          address: governanceManagerAddress,
          abi: governanceManagerAbi,
          functionName: "setWithdrawalFeeBps",
          args: [getUint16("withdrawalFee", "feeBps")],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        return { hash, message: "Withdrawal fee update confirmed." };
      }
      case "strategyApproval": {
        const governanceManagerAddress = getString("strategyApproval", "governanceManager") as `0x${string}`;
        await assertContractTarget(governanceManagerAddress, "Governance Manager address");

        const hash = await writeContractAsync({
          address: governanceManagerAddress,
          abi: governanceManagerAbi,
          functionName: "approveStrategy",
          args: [
            getString("strategyApproval", "strategy") as `0x${string}`,
            getUint16("strategyApproval", "capBps"),
          ],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        return { hash, message: "Strategy approval confirmed." };
      }
      case "strategyAutomation": {
        const governanceManagerAddress = getString("strategyAutomation", "governanceManager") as `0x${string}`;
        await assertContractTarget(governanceManagerAddress, "Governance Manager address");

        const hash = await writeContractAsync({
          address: governanceManagerAddress,
          abi: governanceManagerAbi,
          functionName: "setStrategyAutomationConfig",
          args: [
            getString("strategyAutomation", "strategy") as `0x${string}`,
            getUint16("strategyAutomation", "targetBps"),
            getBool("strategyAutomation", "autoManaged"),
          ],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        return { hash, message: "Strategy automation config confirmed." };
      }
      case "idlePolicy": {
        const vaultAddress = getString("idlePolicy", "vault_") as `0x${string}`;
        await assertContractTarget(vaultAddress, "Vault address");

        const hash = await writeContractAsync({
          address: vaultAddress,
          abi: paraVaultAbi,
          functionName: "setIdlePolicy",
          args: [
            getUint16("idlePolicy", "_minIdleBps"),
            getUint16("idlePolicy", "_rebalanceSlackBps"),
          ],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        return { hash, message: "Idle policy update confirmed." };
      }
      case "controller": {
        const controllerAddress = getString("controller", "controller") as `0x${string}`;
        const strategyAddress = getString("controller", "strategy") as `0x${string}`;
        const keeperAddress = getString("controller", "keeper") as `0x${string}`;

        await assertContractTarget(controllerAddress, "Automation Controller address");

        const policyHash = await writeContractAsync({
          address: controllerAddress,
          abi: vaultAutomationControllerAbi,
          functionName: "setStrategyPolicy",
          args: [
            strategyAddress,
            {
              enabled: getBool("controller", "enabled"),
              minHarvestInterval: getBigInt("controller", "minHarvestInterval"),
              minRebalanceInterval: getBigInt("controller", "minRebalanceInterval"),
              maxAllocatePerExec: getBigInt("controller", "maxAllocatePerExec"),
              maxRecallPerExec: getBigInt("controller", "maxRecallPerExec"),
            },
          ],
        });
        await publicClient.waitForTransactionReceipt({ hash: policyHash });

        const grantHash = await writeContractAsync({
          address: controllerAddress,
          abi: vaultAutomationControllerAbi,
          functionName: "grantRole",
          args: [KEEPER_ROLE, keeperAddress],
        });
        await publicClient.waitForTransactionReceipt({ hash: grantHash });

        return { hash: grantHash, message: "Controller policy and keeper role grant confirmed." };
      }
      default:
        return { hash: "", message: "No contract action configured for this step." };
    }
  };

  const runRpcPreflightCheck = async () => {
    if (!publicClient) {
      return { ok: false, message: "No active public client. Check wallet network and try again." };
    }

    const timeoutMs = 4000;
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`RPC preflight timed out after ${timeoutMs}ms.`));
      }, timeoutMs);
    });

    try {
      await Promise.race([publicClient.getBlockNumber(), timeout]);
      return { ok: true, message: "RPC preflight passed. Requesting wallet signature..." };
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : "RPC preflight failed.";
      const message = /RPC endpoint returned too many errors|Requested resource not available/i.test(rawMessage)
        ? `${rawMessage} RPC preflight failed. Try switching wallet RPC / network endpoint before signing.`
        : `RPC preflight failed: ${rawMessage}`;
      return { ok: false, message };
    }
  };

  const submitStep = async (step: RegistrationStep) => {
    setStatuses((prev) => ({
      ...prev,
      [step.id]: { tone: "info", message: "Validating step inputs..." },
    }));

    let hasError = false;

    const allFieldsEmpty = step.fields.every((field) => {
      const value = getFieldValue(step.id, field.name);
      return isFieldEmpty(value);
    });

    if (step.optional && allFieldsEmpty) {
      clearStepErrors(step);
      setStatuses((prev) => ({
        ...prev,
        [step.id]: { tone: "info", message: "Optional step skipped. You can configure this later." },
      }));
      return true;
    }

    const missing = step.fields.find((field) => {
      if (!field.required) {
        return false;
      }
      const value = getFieldValue(step.id, field.name);
      return value === undefined || value === "";
    });

    if (missing) {
      setStatuses((prev) => ({
        ...prev,
        [step.id]: { tone: "error", message: `Missing required field: ${missing.label}` },
      }));
      return false;
    }

    for (const field of step.fields) {
      const value = getFieldValue(step.id, field.name);
      if (field.type === "address") {
        const valid = normalizeAddressField(step.id, field.name);
        if (!valid) {
          hasError = true;
        }
      }
      if (field.type === "number" && typeof value === "string" && value !== "") {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) {
          setFieldError(step.id, field.name, "Invalid numeric value.");
          hasError = true;
          continue;
        }
        if (field.min !== undefined && numeric < field.min) {
          setFieldError(step.id, field.name, `Value must be at least ${field.min}.`);
          hasError = true;
          continue;
        }
        if (field.max !== undefined && numeric > field.max) {
          setFieldError(step.id, field.name, `Value must be at most ${field.max}.`);
          hasError = true;
          continue;
        }
        clearFieldError(step.id, field.name);
      }
    }

    if (hasError) {
      setStatuses((prev) => ({
        ...prev,
        [step.id]: { tone: "error", message: "Resolve highlighted errors before continuing." },
      }));
      return false;
    }

    if (!isConnected) {
      setStatuses((prev) => ({
        ...prev,
        [step.id]: { tone: "error", message: "Connect wallet before submitting this step." },
      }));
      return false;
    }

    setStatuses((prev) => ({
      ...prev,
      [step.id]: { tone: "info", message: "Validation passed. Running RPC preflight check..." },
    }));

    const preflight = await runRpcPreflightCheck();
    if (!preflight.ok) {
      setStatuses((prev) => ({
        ...prev,
        [step.id]: { tone: "error", message: preflight.message },
      }));
      return false;
    }

    setStatuses((prev) => ({
      ...prev,
      [step.id]: { tone: "info", message: preflight.message },
    }));

    try {
      const txResult = await executeStepTransaction(step);
      setStatuses((prev) => ({
        ...prev,
        [step.id]: {
          tone: "success",
          message: txResult.hash
            ? `${txResult.message} Tx: ${txResult.hash}`
            : txResult.message,
        },
      }));
      return true;
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : "Transaction failed.";
      const message = /External transactions to internal accounts cannot include data/i.test(rawMessage)
        ? `${rawMessage} Ensure the target field points to the deployed contract (for this step, Governance Manager), not your wallet address.`
        : /RPC endpoint returned too many errors|Requested resource not available/i.test(rawMessage)
        ? `${rawMessage} Try switching wallet RPC / network endpoint and resubmit.`
        : rawMessage;
      setStatuses((prev) => ({
        ...prev,
        [step.id]: { tone: "error", message },
      }));
      return false;
    }
  };

  return (
    <section className="g-glass p-5 md:p-7" aria-label="Vault registration stepper">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Contract Submission Workflow</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-white">Vault Registration</h2>
          <p className="mt-2 text-sm text-slate-300">
            Registration is creation-only and maps directly to VaultFactory.registerVault.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Post-deploy role and policy actions are handled in role workspaces.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Vault Factory source: {factorySource === "db" ? "Database default" : "Registry fallback"}.
          </p>
          <p className="mt-1 text-xs text-slate-400 break-all">
            Vault Factory: {getString("deploy", "factory") || "Unavailable"}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20">
        {!isDraftRestored ? (
          <div className="px-6 py-8 text-sm text-slate-300">Restoring draft...</div>
        ) : null}
        <Stepper
          key={`vault-registration-stepper-${stepperInitialStep}`}
          initialStep={stepperInitialStep}
          onStepChange={setCurrentStep}
          onFinalStepCompleted={() => {
            if (typeof window !== "undefined") {
              window.sessionStorage.removeItem(REGISTRATION_DRAFT_STORAGE_KEY);
            }
          }}
          onBeforeNext={async (stepNumber) => {
            const step = registrationSteps[stepNumber - 1];
            if (!step) {
              return true;
            }
            return await submitStep(step);
          }}
          stepCircleContainerClassName="!max-w-none !rounded-2xl !shadow-none"
          stepContainerClassName="!border-b !border-white/10"
          contentClassName="!pt-3 !pb-0"
          footerClassName="!pt-1"
          backButtonText="Previous"
          nextButtonText="Next"
          backButtonProps={{
            className:
              "rounded-full border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 transition duration-300 hover:border-white/40 hover:bg-white/10 hover:text-white",
          }}
          nextButtonProps={{
            className:
              "rounded-full border border-accent bg-accent px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] g-on-accent transition duration-300 hover:border-[rgba(255,246,75,0.7)] hover:bg-[rgba(255,246,75,0.9)]",
          }}
          style={{ display: isDraftRestored ? undefined : "none" }}
        >
          {registrationSteps.map((step) => (
            <Step key={step.id}>
              <article className="rounded-2xl border border-white/15 bg-white/5 p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm text-slate-300">{step.description}</p>
                  </div>
                  <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                    Signer: {step.signer}
                  </span>
                </div>

                {step.optional ? (
                  <p className="mt-3 rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">
                    {step.id === "strategyApproval" || step.id === "strategyAutomation"
                      ? "Optional step. You can complete strategy configuration later from governance flow after vault deployment."
                      : "Optional step. Requires separate VaultAutomationController deployment."}
                  </p>
                ) : null}

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {step.fields.map((field) => {
                    const fieldKey = `${step.id}.${field.name}`;
                    const value = getFieldValue(step.id, field.name);
                    const error = errors[fieldKey];

                    return (
                      <label key={fieldKey} className="block space-y-1.5">
                        <span className="flex items-center gap-1 text-xs uppercase tracking-[0.12em] text-slate-400">
                          {field.label}
                          {field.roleHint ? (
                            <span className="inline-flex" title={field.roleHint} aria-label={field.roleHint}>
                              <CircleHelp className="h-3.5 w-3.5 text-slate-500" />
                            </span>
                          ) : null}
                        </span>

                        {field.type === "boolean" ? (
                          <input
                            type="checkbox"
                            checked={Boolean(value)}
                            onChange={(event) => setFieldValue(step.id, field.name, event.target.checked)}
                            className="h-4 w-4 rounded border-white/20 bg-white/5"
                          />
                        ) : (
                          <input
                            type={field.type === "address" ? "text" : field.type}
                            min={field.min}
                            max={field.max}
                            placeholder={field.placeholder}
                            value={typeof value === "string" ? value : ""}
                            onBlur={() => {
                              if (field.type === "address") {
                                normalizeAddressField(step.id, field.name);
                              }
                            }}
                            onChange={(event) => {
                              setFieldValue(step.id, field.name, event.target.value);
                              clearFieldError(step.id, field.name);
                            }}
                            className={`w-full rounded-xl border bg-white/5 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 ${
                              error
                                ? "border-red-500/90 focus:border-red-500"
                                : "border-white/15 focus:border-accent"
                            }`}
                          />
                        )}

                        {error ? <p className="text-xs text-red-500">{error}</p> : null}
                      </label>
                    );
                  })}
                </div>

                {statuses[step.id] ? (
                  <div
                    className={`mt-6 rounded-xl border px-3 py-2 text-xs ${
                      statuses[step.id].tone === "success"
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                        : statuses[step.id].tone === "error"
                          ? "border-red-500/40 bg-red-500/10 text-red-300"
                          : "border-sky-400/30 bg-sky-400/10 text-sky-200"
                    }`}
                  >
                    {statuses[step.id].message}
                  </div>
                ) : null}
              </article>
            </Step>
          ))}
        </Stepper>
      </div>
    </section>
  );
}
