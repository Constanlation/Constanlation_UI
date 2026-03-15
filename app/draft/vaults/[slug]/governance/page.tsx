import { notFound } from "next/navigation";

import { GovernanceScreen } from "@/app/draft/components/screens";
import { getVault } from "@/app/draft/lib/mock-data";

export default async function VaultGovernancePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vault = getVault(slug);

  if (!vault) {
    notFound();
  }

  return <GovernanceScreen vault={vault} />;
}

