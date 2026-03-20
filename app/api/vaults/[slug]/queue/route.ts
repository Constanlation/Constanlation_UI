import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { etaForQueueStatus, mapQueueStatus } from "@/lib/server/queue-status";
import type { QueueEntry } from "@/lib/vaults/types";

function toFiniteNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function shortAddress(address: string): string {
  if (address.length < 10) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const normalizedSlug = slug.trim();

    if (!normalizedSlug) {
      return NextResponse.json({ source: "db", queue: [], error: "Invalid vault slug." }, { status: 400 });
    }

    const statuses = await prisma.queueEntryStatus.findMany({
      where: {
        OR: [{ vaultKey: normalizedSlug }, { vaultAddress: normalizedSlug }],
      },
      orderBy: [{ createdAt: "asc" }],
      select: {
        queueId: true,
        owner: true,
        netAssets: true,
        status: true,
      },
    });

    const queue: QueueEntry[] = statuses.map((row, index) => {
      const status = mapQueueStatus(row.status);
      return {
        id: row.queueId,
        requester: shortAddress(row.owner),
        requestUsd: toFiniteNumber(row.netAssets),
        position: index + 1,
        eta: etaForQueueStatus(status),
        status,
      };
    });

    return NextResponse.json({ source: "db", queue });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        source: "db",
        queue: [],
        error: message,
      },
      { status: 500 },
    );
  }
}
