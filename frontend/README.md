This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Web3 Configuration

- Set your PlotVoting contract address via env or edit `src/lib/web3.ts`:
  - Env variable: `NEXT_PUBLIC_PLOTVOTING_ADDRESS=0xYourContract` (recommended)
  - Or update `CONTRACT_ADDRESSES.plotVoting` directly in `src/lib/web3.ts`.
- The minimal ABI for PlotVoting is defined in `src/types/abis/PlotVoting.ts`.

## Voting UI

- Navigate to `/voting` to interact with the contract.
- Actions supported:
  - Free vote: calls `vote(proposalId, voteAmount)` (no ETH sent)
  - Optional stake: calls `stakeForProposal(proposalId)` with provided ETH
  - Admin actions: `executeProposal(proposalId)`, `rejectProposal(proposalId)`

Notes:
- Explorer link defaults to Sepolia. If using another chain, adjust the link or add chain-aware routing.
