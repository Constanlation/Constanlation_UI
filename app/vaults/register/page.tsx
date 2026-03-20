"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppPageFrame } from "@/components/app/AppPrimitives";
import { VaultRegistrationStepper } from "@/components/app/VaultRegistrationStepper";

type RegistrationDefaultsResponse = {
  factoryAddress: string | null;
  source: "db" | "registry-fallback";
  warning: string | null;
};

export default function VaultRegistrationPage() {
  const [factoryAddress, setFactoryAddress] = useState<string | undefined>(undefined);
  const [factorySource, setFactorySource] = useState<"db" | "registry-fallback">("registry-fallback");
  const [factoryWarning, setFactoryWarning] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadDefaults = async () => {
      try {
        const response = await fetch("/api/registrations/defaults", { cache: "no-store" });
        const payload = (await response.json()) as RegistrationDefaultsResponse;

        if (!active) {
          return;
        }

        if (payload.factoryAddress) {
          setFactoryAddress(payload.factoryAddress);
        }

        setFactorySource(payload.source);
        setFactoryWarning(payload.warning);
      } catch {
        if (!active) {
          return;
        }
        setFactoryWarning("Unable to load DB defaults. Registration will use local registry fallback if available.");
      }
    };

    void loadDefaults();

    return () => {
      active = false;
    };
  }, []);

  return (
    <AppPageFrame
      title="Vault Registration"
      subtitle="Deploy a new vault ecosystem through a contract-aligned registerVault workflow."
    >
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-400">
        <Link href="/vaults" className="hover:text-white">
          Vaults
        </Link>
        <span>/</span>
        <span className="text-slate-200">Register</span>
      </div>

      {factoryWarning ? (
        <div className="mb-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs text-amber-100">
          {factoryWarning}
        </div>
      ) : null}

      <VaultRegistrationStepper defaultFactoryAddress={factoryAddress} factorySource={factorySource} />
    </AppPageFrame>
  );
}
