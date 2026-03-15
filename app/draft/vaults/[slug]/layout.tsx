import { notFound } from "next/navigation";
import { type ReactNode } from "react";

import { VaultChrome } from "@/app/draft/components/vault-chrome";
import { getVault, vaults } from "@/app/draft/lib/mock-data";

export function generateStaticParams() {
  return vaults.map((vault) => ({ slug: vault.slug }));
}

export default async function VaultLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vault = getVault(slug);

  if (!vault) {
    notFound();
  }

  return <VaultChrome vault={vault}>{children}</VaultChrome>;
}

