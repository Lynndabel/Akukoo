import { NextRequest, NextResponse } from "next/server";

// Minimal scaffold for Circle Gas Station integration.
// This endpoint should call Circle's Programmable Wallets API to submit a sponsored transaction
// for the provided calldata. We return a placeholder response until API credentials are configured.
//
// IMPORTANT:
// - Gas sponsorship covers gas, not msg.value. If value is required (e.g., submitProposal stake),
//   the user's Circle wallet must hold sufficient funds. Sponsorship policies are configured in Circle Console.
// - Replace the TODOs with real API calls to Circle once you have your API key and entity details.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      to,
      data,
      value = "0x0",
      chain, // e.g. "base-mainnet" | "polygon-mainnet" | "ethereum-sepolia"
      userId, // your app's user identifier
    } = body || {};

    if (!to || !data || !chain) {
      return NextResponse.json(
        { error: "Missing required fields: to, data, chain" },
        { status: 400 }
      );
    }

    const apiKey = process.env.CIRCLE_API_KEY;
    if (!apiKey) {
      // Scaffold path: allow front-end development while backend credentials are pending
      return NextResponse.json(
        {
          status: "stub",
          note:
            "CIRCLE_API_KEY is not set. Returning placeholder response. Configure .env and replace this stub with real Circle API call.",
          request: { to, data, value, chain, userId },
        },
        { status: 200 }
      );
    }

    // TODO: Replace with actual Circle API request.
    // Reference: Circle Programmable Wallets + Gas Station docs.
    // Typically, you'll:
    // 1) Ensure a Programmable Wallet exists for this user (create/recover)
    // 2) Build a transaction with { to, data, value } for the target chain
    // 3) Submit with Gas Station sponsorship enabled per your policy
    // 4) Return the transaction ID / hash

    // Example placeholder of what a successful response might look like:
    const placeholder = {
      sponsored: true,
      chain,
      to,
      value,
      // txId would be provided by Circle once implemented
      txId: "placeholder-tx-id",
    };

    return NextResponse.json(placeholder, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
