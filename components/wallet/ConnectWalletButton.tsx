"use client";

import { useAppKit } from "@reown/appkit/react";
import { useAccount, useDisconnect } from "wagmi";

import { hasReownProjectId } from "@/lib/wallet/reown";

type ConnectWalletButtonProps = {
  actionLabel: string;
};

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function ConnectedButton({ actionLabel }: ConnectWalletButtonProps) {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const buttonLabel = isConnected
    ? `Disconnect ${address ? shortAddress(address) : "Wallet"}`
    : `Connect Wallet To ${actionLabel}`;

  const handleClick = () => {
    if (isConnected) {
      disconnect();
      return;
    }

    void open();
  };

  return (
    <button type="button" className="g-btn-primary mt-4 w-full !py-3 !text-xs" onClick={handleClick}>
      {buttonLabel}
    </button>
  );
}

export function ConnectWalletButton({ actionLabel }: ConnectWalletButtonProps) {
  if (!hasReownProjectId) {
    return (
      <div className="mt-4">
        <button
          type="button"
          className="g-btn-primary w-full !py-3 !text-xs opacity-60"
          disabled
          aria-disabled="true"
          title="Set NEXT_PUBLIC_REOWN_PROJECT_ID to enable wallet connection"
        >
          Connect Wallet To {actionLabel}
        </button>
        <p className="mt-2 text-center text-[11px] uppercase tracking-[0.14em] text-amber-300/80">
          Wallet disabled: set NEXT_PUBLIC_REOWN_PROJECT_ID
        </p>
      </div>
    );
  }

  return <ConnectedButton actionLabel={actionLabel} />;
}
