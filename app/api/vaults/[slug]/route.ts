import { NextResponse } from "next/server";

import { getVaultDetailFromDb } from "@/lib/server/vaults";

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const url = new URL(request.url);
    const runId = url.searchParams.get("runId") ?? undefined;

    const result = await getVaultDetailFromDb(slug, runId);

    return NextResponse.json({
      source: "db",
      runId: result.runId,
      vault: result.detail,
      strategyNotes: result.strategyNotes,
      proposals: result.proposals,
      guardianControls: result.guardianControls,
      queue: result.queue,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        source: "db",
        vault: null,
        strategyNotes: [],
        proposals: [],
        guardianControls: [],
        queue: [],
        error: message,
      },
      { status: 500 },
    );
  }
}