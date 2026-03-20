import { NextResponse } from "next/server";
import { getAddress } from "viem";

import { polkadotTestnetContractDefaults } from "@/lib/contracts/registry";
import prisma from "@/lib/prisma";

function normalizeAddress(value: string | null | undefined): `0x${string}` | null {
  if (!value) {
    return null;
  }

  try {
    return getAddress(value) as `0x${string}`;
  } catch {
    return null;
  }
}

export async function GET() {
  const fallbackFactory = normalizeAddress(polkadotTestnetContractDefaults.factory ?? null);

  try {
    const latestRun = await prisma.deploymentRun.findFirst({
      orderBy: { createdAt: "desc" },
      select: { factoryAddress: true },
    });

    const dbFactory = normalizeAddress(latestRun?.factoryAddress);

    if (dbFactory) {
      return NextResponse.json({
        factoryAddress: dbFactory,
        source: "db",
        warning: null,
      });
    }

    if (fallbackFactory) {
      return NextResponse.json({
        factoryAddress: fallbackFactory,
        source: "registry-fallback",
        warning: "No factory address found in database. Using registry default.",
      });
    }

    return NextResponse.json(
      {
        factoryAddress: null,
        source: "registry-fallback",
        warning: "Factory address is unavailable in both DB and registry defaults.",
      },
      { status: 500 },
    );
  } catch (error) {
    if (fallbackFactory) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({
        factoryAddress: fallbackFactory,
        source: "registry-fallback",
        warning: `DB unavailable. Using registry default factory. ${message}`,
      });
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        factoryAddress: null,
        source: "registry-fallback",
        warning: `Unable to resolve factory defaults. ${message}`,
      },
      { status: 500 },
    );
  }
}
