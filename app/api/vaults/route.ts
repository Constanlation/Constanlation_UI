import { NextResponse } from "next/server";

import { getVaultRowsFromDb } from "@/lib/server/vaults";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const runId = url.searchParams.get("runId") ?? undefined;

    const result = await getVaultRowsFromDb(runId);

    return NextResponse.json({
      source: "db",
      runId: result.runId,
      vaults: result.rows,
      warnings: result.warnings,
      provisionalFields: result.provisionalFields,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        source: "db",
        runId: null,
        vaults: [],
        warnings: [],
        provisionalFields: [],
        error: message,
      },
      { status: 500 },
    );
  }
}
