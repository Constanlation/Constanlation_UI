import { NextResponse } from "next/server";

import { getDepositorPortfolioFromDb } from "@/lib/server/profile";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const address = url.searchParams.get("address")?.trim();

    if (!address) {
      return NextResponse.json(
        {
          source: "db",
          runId: null,
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
      positions: result.positions,
      withdrawalRequests: result.withdrawalRequests,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        source: "db",
        runId: null,
        positions: [],
        withdrawalRequests: [],
        error: message,
      },
      { status: 500 },
    );
  }
}