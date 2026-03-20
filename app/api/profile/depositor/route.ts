import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getDepositorPortfolioFromDb } from "@/lib/server/profile";

function asString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const address = url.searchParams.get("address")?.trim();

    if (!address) {
      return NextResponse.json(
        {
          source: "db",
          runId: null,
          queryState: "invalid_request",
          positions: [],
          withdrawalRequests: [],
          error: "Missing address query parameter",
        },
        { status: 400 },
      );
    }

    const result = await getDepositorPortfolioFromDb(address);

    return NextResponse.json({
      source: "db",
      runId: result.runId,
      queryState: result.queryState,
      positions: result.positions,
      withdrawalRequests: result.withdrawalRequests,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        source: "db",
        runId: null,
        queryState: "error",
        positions: [],
        withdrawalRequests: [],
        error: message,
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      address?: unknown;
      queueId?: unknown;
      vaultKey?: unknown;
      status?: unknown;
    };

    const address = asString(body.address);
    const queueId = asString(body.queueId);
    const vaultKey = asString(body.vaultKey);
    const requestedStatus = asString(body.status)?.toLowerCase();

    if (!address || !queueId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: address and queueId.",
        },
        { status: 400 },
      );
    }

    const nextStatus = requestedStatus === "redeemed" ? "Redeemed" : "Claimed";

    const baseWhere = {
      queueId,
      ...(vaultKey ? { vaultKey } : {}),
      OR: [{ owner: { equals: address, mode: "insensitive" as const } }, { receiver: { equals: address, mode: "insensitive" as const } }],
    };

    let updateResult = await prisma.queueEntryStatus.updateMany({
      where: baseWhere,
      data: {
        status: nextStatus,
        updatedAt: new Date(),
      },
    });

    if (updateResult.count === 0) {
      updateResult = await prisma.queueEntryStatus.updateMany({
        where: {
          queueId,
          ...(vaultKey ? { vaultKey } : {}),
        },
        data: {
          status: nextStatus,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      queueId,
      status: nextStatus,
      updated: updateResult.count,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}