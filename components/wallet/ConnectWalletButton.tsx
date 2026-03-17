"use client";

import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";

import { hasReownProjectId } from "@/lib/wallet/reown";

type ConnectWalletButtonProps = {
  actionLabel?: string;
  variant?: "default" | "compact";
  className?: string;
  showHelperText?: boolean;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function ConnectedButton({ actionLabel = "Deposit", variant = "default", className }: ConnectWalletButtonProps) {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();

  const compactButtonClasses = isConnected
    ? "inline-flex min-w-[176px] items-center justify-center rounded-full border border-accent bg-accent px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] g-on-accent transition whitespace-nowrap"
    : "inline-flex min-w-[176px] items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:border-white/40 hover:text-white whitespace-nowrap";

  const buttonClasses = cx(
    variant === "compact" ? compactButtonClasses : "g-btn-primary mt-4 w-full !py-3 !text-xs",
    className
  );

  const buttonLabel = isConnected
    ? variant === "compact"
      ? `${address ? shortAddress(address) : "Wallet"}`
      : `Account ${address ? shortAddress(address) : "Wallet"}`
    : variant === "compact"
      ? "Connect Wallet"
      : `Connect Wallet To ${actionLabel}`;

  const handleClick = () => {
    if (isConnected) {
      void open({ view: "Account" });
      return;
    }

    void open();
  };

  return (
    <button type="button" className={buttonClasses} onClick={handleClick}>
      {buttonLabel}
    </button>
  );
}

export function ConnectWalletButton({
  actionLabel = "Deposit",
  variant = "default",
  className,
  showHelperText = true,
}: ConnectWalletButtonProps) {
  const disabledButtonClass = cx(
    variant === "compact"
      ? "inline-flex min-w-[176px] items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 opacity-70 whitespace-nowrap"
      : "g-btn-primary w-full !py-3 !text-xs opacity-60",
    className
  );

  const disabledLabel = variant === "compact" ? "Connect Wallet" : `Connect Wallet To ${actionLabel}`;

  if (!hasReownProjectId) {
    return (
      <div className={variant === "compact" ? undefined : "mt-4"}>
        <button
          type="button"
          className={disabledButtonClass}
          disabled
          aria-disabled="true"
          title="Set NEXT_PUBLIC_REOWN_PROJECT_ID to enable wallet connection"
        >
          {disabledLabel}
        </button>
        {showHelperText && variant !== "compact" ? (
          <p className="mt-2 text-center text-[11px] uppercase tracking-[0.14em] text-amber-300/80">
            Wallet disabled: set NEXT_PUBLIC_REOWN_PROJECT_ID
          </p>
        ) : null}
      </div>
    );
  }

  return <ConnectedButton actionLabel={actionLabel} variant={variant} className={className} />;
}
