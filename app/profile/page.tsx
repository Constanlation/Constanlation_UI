"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAccount } from "wagmi";

import { AppPageFrame, KpiStrip, StatusPill } from "@/components/app/AppPrimitives";
import { ProfileLandingCards } from "@/components/profile/ProfileShell";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { resolveWalletRoles, roleOrder } from "@/lib/profile/roles";

export default function ProfileEntryPage() {
  const { isConnected, address } = useAccount();

  const detectedRoles = useMemo(() => {
    return resolveWalletRoles(address, isConnected);
  }, [address, isConnected]);

  const primaryRole = detectedRoles[0];

  return (
    <AppPageFrame
      title="My Profile Workspace"
      subtitle="Your workspace is resolved from connected wallet roles and access permissions."
    >
      <KpiStrip
        items={[
          { label: "Role Workspaces", value: String(roleOrder.length), tone: "accent" },
          { label: "My Roles", value: String(detectedRoles.length) },
          { label: "Wallet", value: isConnected ? "Connected" : "Disconnected" },
          { label: "Default Workspace", value: primaryRole ? primaryRole.replace("-", " ") : "None" },
        ]}
      />

      <section className="g-glass mt-4 p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill text={isConnected ? "Wallet Connected" : "Wallet Not Connected"} tone={isConnected ? "good" : "warn"} />
          <StatusPill text="Role Visibility: Least Privilege" tone="good" />
        </div>

        {!isConnected ? (
          <div className="mt-4">
            <ConnectWalletButton variant="compact" actionLabel="Open Profile Workspace" />
          </div>
        ) : null}

        {isConnected && detectedRoles.length > 0 ? (
          <Link
            href={`/profile/${primaryRole}`}
            className="mt-4 inline-flex rounded-full border border-accent bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] g-on-accent transition hover:brightness-105"
          >
            Open My Workspace
          </Link>
        ) : null}

        {isConnected && detectedRoles.length === 0 ? (
          <p className="mt-4 text-sm text-slate-300">
            No managed role was detected for this wallet yet. You can still use depositor workflow once permissions are assigned.
          </p>
        ) : null}
      </section>

      {detectedRoles.length > 1 ? (
        <section className="mt-4">
          <p className="mb-3 text-sm text-slate-300">You have multiple role workspaces. Open the one you want to operate now.</p>
          <ProfileLandingCards preferredRoles={detectedRoles} />
        </section>
      ) : null}

      {detectedRoles.length === 1 ? (
        <section className="mt-4">
          <p className="text-sm text-slate-300">
            Single role detected: <span className="font-semibold text-white">{detectedRoles[0]}</span>. Use the workspace button above.
          </p>
        </section>
      ) : null}

      {detectedRoles.length === 0 && isConnected ? (
        <section className="mt-4">
          <ProfileLandingCards preferredRoles={["depositor"]} />
        </section>
      ) : null}
    </AppPageFrame>
  );
}
