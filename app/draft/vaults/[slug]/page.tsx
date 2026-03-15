import { notFound } from "next/navigation";

import { OverviewScreen } from "@/app/draft/components/screens";
import { getVault } from "@/app/draft/lib/mock-data";

export default async function VaultOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vault = getVault(slug);

  if (!vault) {
    notFound();
  }

  return <OverviewScreen vault={vault} />;
}

