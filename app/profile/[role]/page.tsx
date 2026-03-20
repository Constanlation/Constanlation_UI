"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useAccount } from "wagmi";

import { AppPageFrame } from "@/components/app/AppPrimitives";
import { ProfileNotFound, ProfileShell } from "@/components/profile/ProfileShell";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { getRoleProfile, resolveWalletRoles } from "@/lib/profile/roles";

export default function ProfileRolePage() {
  const { role } = useParams<{ role: string }>();
  const { address, isConnected } = useAccount();

  const resolvedRoles = useMemo(() => resolveWalletRoles(address, isConnected), [address, isConnected]);
  const roleProfile = getRoleProfile(role);

  if (!roleProfile) {
    return <ProfileNotFound role={role} />;
  }

  if (!isConnected) {
    return (
      <AppPageFrame
        title="Connect Wallet"
        subtitle="Wallet connection is required to open a role workspace with permission-based visibility."
      >
        <section className="g-glass p-4 md:p-6">
          <p className="text-sm text-slate-300">Connect wallet to open your permitted role workspace.</p>
          <ConnectWalletButton className="mt-4" actionLabel="Open Workspace" />
        </section>
      </AppPageFrame>
    );
  }

  if (!resolvedRoles.includes(roleProfile.slug)) {
    return (
      <AppPageFrame
        title="Role Access Restricted"
        subtitle="This role workspace is not available for the connected wallet permissions."
      >
        <section className="g-glass p-4 md:p-6">
          <p className="text-sm text-slate-300">
            Open your profile home to access only the role workspaces your wallet can operate.
          </p>
          <Link
            href="/profile"
            className="mt-4 inline-flex rounded-full border border-accent bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] g-on-accent transition hover:brightness-105"
          >
            Open Profile Home
          </Link>
        </section>
      </AppPageFrame>
    );
  }

  return <ProfileShell role={roleProfile} ownedRoles={resolvedRoles} walletAddress={address} />;
}
