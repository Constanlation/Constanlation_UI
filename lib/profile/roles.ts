import { polkadotTestnetRoleDefaults } from "@/lib/contracts/registry";
import { formatUsd, vaultRows } from "@/lib/mock-data";

export type RoleSlug =
  | "factory-owner"
  | "governance-admin"
  | "vault-admin"
  | "controller-admin"
  | "strategist"
  | "guardian"
  | "keeper"
  | "depositor"
  | "strategy-creator"
  | "treasury";

export interface RoleKpi {
  label: string;
  value: string;
  tone?: "neutral" | "accent";
}

export interface RoleChecklistItem {
  label: string;
  done: boolean;
}

export interface RoleProfile {
  slug: RoleSlug;
  title: string;
  subtitle: string;
  responsibilities: string;
  canSee: string[];
  canDo: string[];
  decisions: {
    approve: string;
    reject: string;
    add: string;
  };
  queue: Array<{ id: string; summary: string; state: "Ready" | "Pending" | "Blocked" }>;
  checklist: RoleChecklistItem[];
  kpis: RoleKpi[];
}

const totalTvl = vaultRows.reduce((sum, row) => sum + row.tvl, 0);
const avgQueueHours = Math.round(vaultRows.reduce((sum, row) => sum + row.queueDepthHours, 0) / vaultRows.length);

export const roleProfiles: Record<RoleSlug, RoleProfile> = {
  "factory-owner": {
    slug: "factory-owner",
    title: "Factory Owner Workspace",
    subtitle: "Bootstrap vault ecosystems, validate deployment metadata, and manage protocol-level registry operations.",
    responsibilities: "Owns registration execution and controls factory-level lifecycle actions.",
    canSee: [
      "Factory ownership status and deployment authority",
      "Registered ecosystems with admin, treasury, and asset metadata",
      "Pending registration requests and decision history",
    ],
    canDo: ["Create a new vault ecosystem", "Review registration payload health", "Prepare ownership rotation workflow"],
    decisions: {
      approve: "Approve a valid registration request into deploy queue.",
      reject: "Reject malformed or policy-violating registration payload.",
      add: "Add a new ecosystem record by executing registerVault.",
    },
    queue: [
      { id: "REQ-114", summary: "DOT income vault bootstrap", state: "Ready" },
      { id: "REQ-115", summary: "USDT treasury vault registration", state: "Pending" },
      { id: "REQ-116", summary: "Payload missing treasury address", state: "Blocked" },
    ],
    checklist: [
      { label: "Profile page UI", done: true },
      { label: "Pending request list + decision history", done: true },
      { label: "Approve/reject workflow state machine", done: false },
      { label: "Direct write integration to registerVault", done: false },
    ],
    kpis: [
      { label: "Ecosystems Registered", value: String(vaultRows.length), tone: "accent" },
      { label: "Total Registry TVL", value: formatUsd(totalTvl) },
      { label: "Pending Requests", value: "2" },
      { label: "Blocked Requests", value: "1" },
    ],
  },
  "governance-admin": {
    slug: "governance-admin",
    title: "Governance Admin Workspace",
    subtitle: "Manage strategy approvals, role assignment, treasury policy, and vault governance posture.",
    responsibilities: "Controls governance manager policy and critical role assignments.",
    canSee: [
      "Assigned vaults and governance managers",
      "Strategist and guardian roster by vault",
      "Strategy registry state and policy parameters",
    ],
    canDo: [
      "Set strategist and guardian",
      "Set treasury and withdrawal fee",
      "Approve, cap, and disable strategies",
      "Configure automation target and policy",
    ],
    decisions: {
      approve: "Approve strategy into active registry with cap limits.",
      reject: "Reject strategy proposal failing risk or compliance checks.",
      add: "Add strategist, guardian, or policy entries.",
    },
    queue: [
      { id: "STRAT-20", summary: "MockYieldStrategy cap 3500 bps", state: "Ready" },
      { id: "STRAT-21", summary: "Cross-chain carry strategy review", state: "Pending" },
      { id: "STRAT-22", summary: "Missing audit evidence", state: "Blocked" },
    ],
    checklist: [
      { label: "Governance admin profile UI", done: true },
      { label: "Strategy proposal review inbox", done: true },
      { label: "Approve/reject action logs", done: true },
      { label: "On-chain write buttons for governance actions", done: false },
    ],
    kpis: [
      { label: "Active Strategies", value: "5", tone: "accent" },
      { label: "Guardians Assigned", value: "4" },
      { label: "Treasury Policy", value: "Set" },
      { label: "Withdrawal Fee", value: "0.50%" },
    ],
  },
  "vault-admin": {
    slug: "vault-admin",
    title: "Vault Admin Workspace",
    subtitle: "Manage keeper roster, idle policy, governance manager linkage, and vault maintenance controls.",
    responsibilities: "Owns vault-level admin actions and role grants.",
    canSee: [
      "Vault keeper/admin member roster",
      "Idle policy and slack parameters",
      "Governance manager reference and maintenance history",
    ],
    canDo: [
      "Grant and revoke keeper role",
      "Set idle policy values",
      "Update governance manager reference",
      "Prepare rescue token operation record",
    ],
    decisions: {
      approve: "Approve keeper onboarding requests that pass policy checks.",
      reject: "Reject keeper onboarding that fails security policy.",
      add: "Add keeper members and policy config updates.",
    },
    queue: [
      { id: "KEEP-07", summary: "Keeper onboarding for EU ops", state: "Ready" },
      { id: "KEEP-08", summary: "Idle policy adjustment for queue load", state: "Pending" },
      { id: "KEEP-09", summary: "Missing signer attestations", state: "Blocked" },
    ],
    checklist: [
      { label: "Vault admin profile UI", done: true },
      { label: "Keeper request queue", done: true },
      { label: "Approve/reject controls with signer confirmation", done: true },
      { label: "On-chain writes for role and policy actions", done: false },
    ],
    kpis: [
      { label: "Keeper Members", value: "6", tone: "accent" },
      { label: "Pending Keeper Requests", value: "2" },
      { label: "Idle Min Bps", value: "1200" },
      { label: "Rebalance Slack Bps", value: "300" },
    ],
  },
  "controller-admin": {
    slug: "controller-admin",
    title: "Controller Admin Workspace",
    subtitle: "Manage automation policy, controller keeper access, and global automation pause state.",
    responsibilities: "Owns VaultAutomationController admin policy and operator access control.",
    canSee: [
      "Controller policy per strategy",
      "Controller keeper roster and access changes",
      "Global automation paused state",
    ],
    canDo: [
      "Set strategy automation policy",
      "Pause and unpause automation globally",
      "Grant and revoke controller keeper role",
    ],
    decisions: {
      approve: "Approve controller keeper onboarding for trusted operators.",
      reject: "Reject policy changes that exceed automation guardrails.",
      add: "Add new policy versions and keeper access records.",
    },
    queue: [
      { id: "CTRL-11", summary: "Enable policy for DOT strategy", state: "Ready" },
      { id: "CTRL-12", summary: "Pause toggle review pending", state: "Pending" },
      { id: "CTRL-13", summary: "Keeper candidate missing approval", state: "Blocked" },
    ],
    checklist: [
      { label: "Controller admin profile UI", done: true },
      { label: "Policy editor + keeper roster", done: true },
      { label: "Automation pause toggle", done: true },
      { label: "On-chain writes for admin controls", done: false },
    ],
    kpis: [
      { label: "Active Policies", value: "3", tone: "accent" },
      { label: "Controller Keepers", value: "2" },
      { label: "Automation Status", value: "Active" },
      { label: "Pending Changes", value: "1" },
    ],
  },
  strategist: {
    slug: "strategist",
    title: "Strategist Workspace",
    subtitle: "Operate allocation and liquidity actions while balancing target deployment, queue pressure, and safety limits.",
    responsibilities: "Runs capital allocation, recall, harvest, and rebalance operations.",
    canSee: [
      "Strategy health, cap headroom, and deployment targets",
      "Queue pressure and idle deficits",
      "Recent harvest and recall/allocate execution history",
    ],
    canDo: ["Allocate and recall funds", "Recall all from strategy", "Harvest strategy yield", "Trigger ordered rebalance"],
    decisions: {
      approve: "Approve execution plan before submitting strategy operations.",
      reject: "Reject risky allocation plan generated by automation hints.",
      add: "Add operator notes and runbooks for each vault.",
    },
    queue: [
      { id: "OPS-42", summary: "Recall 180k for queue settlement", state: "Ready" },
      { id: "OPS-43", summary: "Harvest cycle window in 45m", state: "Pending" },
      { id: "OPS-44", summary: "Strategy cap reached", state: "Blocked" },
    ],
    checklist: [
      { label: "Strategist profile UI", done: true },
      { label: "Action console scaffold", done: true },
      { label: "Plan approval/rejection log", done: true },
      { label: "Live on-chain actions with simulation", done: false },
    ],
    kpis: [
      { label: "Allocated Capital", value: formatUsd(totalTvl * 0.71), tone: "accent" },
      { label: "Idle Buffer", value: formatUsd(totalTvl * 0.18) },
      { label: "Queue Depth", value: `${avgQueueHours}h` },
      { label: "Plans Ready", value: "1" },
    ],
  },
  guardian: {
    slug: "guardian",
    title: "Guardian Workspace",
    subtitle: "Monitor incidents, control pause and panic states, and coordinate safe recovery sequencing.",
    responsibilities: "Acts as safety controller for pause, unpause, and panic operations.",
    canSee: [
      "Guardian state per vault",
      "Alert timeline and anomaly flags",
      "Incident checklist and blast-radius summary",
    ],
    canDo: ["Pause vault", "Unpause vault", "Panic strategy", "Coordinate recovery with governance"],
    decisions: {
      approve: "Approve recovery plan to resume operations.",
      reject: "Reject unsafe unpause proposal.",
      add: "Add incident reports and mitigation notes.",
    },
    queue: [
      { id: "SAFE-11", summary: "Recovery checklist for DOT vault", state: "Ready" },
      { id: "SAFE-12", summary: "Anomaly under investigation", state: "Pending" },
      { id: "SAFE-13", summary: "Missing blast-radius assessment", state: "Blocked" },
    ],
    checklist: [
      { label: "Guardian profile UI", done: true },
      { label: "Alert-to-action panel", done: true },
      { label: "Approve/reject recovery checklist", done: true },
      { label: "On-chain pause/unpause/panic controls", done: false },
    ],
    kpis: [
      { label: "Healthy Vaults", value: "3", tone: "accent" },
      { label: "Watch Vaults", value: "1" },
      { label: "Open Alerts", value: "2" },
      { label: "Blocked Recovery", value: "1" },
    ],
  },
  keeper: {
    slug: "keeper",
    title: "Keeper Workspace",
    subtitle: "Execute bounded automation jobs for harvest, allocate, recall, and queue settlement.",
    responsibilities: "Executes policy-constrained automation with cooldown checks.",
    canSee: [
      "Controller policy by strategy",
      "Cooldown timers and global pause state",
      "Queue backlog and execution windows",
    ],
    canDo: [
      "Execute harvest",
      "Execute allocate and recall within limits",
      "Execute settleWithdrawals batches",
      "Track cooldown compliance",
    ],
    decisions: {
      approve: "Approve queued keeper job for execution.",
      reject: "Reject job that violates cooldown or amount policy.",
      add: "Add scheduled jobs and operator notes.",
    },
    queue: [
      { id: "JOB-307", summary: "Settle withdrawals maxCount=20", state: "Ready" },
      { id: "JOB-308", summary: "Harvest delayed by cooldown", state: "Pending" },
      { id: "JOB-309", summary: "Auto allocation exceeds cap", state: "Blocked" },
    ],
    checklist: [
      { label: "Keeper profile UI", done: true },
      { label: "Cooldown and policy dashboard", done: true },
      { label: "Job approve/reject queue", done: true },
      { label: "Controller execute tx integration", done: false },
    ],
    kpis: [
      { label: "Ready Jobs", value: "1", tone: "accent" },
      { label: "Pending Jobs", value: "1" },
      { label: "Blocked Jobs", value: "1" },
      { label: "Global Automation", value: "Active" },
    ],
  },
  depositor: {
    slug: "depositor",
    title: "Depositor Workspace",
    subtitle: "Track positions, queue progress, and personal vault actions with signer-ready confirmation flow.",
    responsibilities: "Monitors and executes personal deposit, withdrawal, request, and claim actions.",
    canSee: [
      "Personal positions and unrealized pnl",
      "Claimable queue requests by wallet",
      "Action history and risk disclosures",
    ],
    canDo: ["Deposit and mint", "Withdraw and redeem", "Request queued withdrawal", "Claim settled withdrawal"],
    decisions: {
      approve: "Approve personal withdrawal request before signing.",
      reject: "Reject draft action before submitting transaction.",
      add: "Add watchlist vaults and personal tags.",
    },
    queue: [
      { id: "WR-551", summary: "Claim request ready for USDC Prime", state: "Ready" },
      { id: "WR-552", summary: "DOT queue estimated 8h", state: "Pending" },
      { id: "WR-553", summary: "Wallet not connected", state: "Blocked" },
    ],
    checklist: [
      { label: "Depositor profile page UI", done: true },
      { label: "Live balances + queue status by wallet", done: false },
      { label: "Action confirmation flow", done: true },
      { label: "Full on-chain action wiring", done: false },
    ],
    kpis: [
      { label: "Positions", value: "3", tone: "accent" },
      { label: "Claimable Requests", value: "1" },
      { label: "Pending Queue", value: formatUsd(152000) },
      { label: "Wallet Status", value: "Connected" },
    ],
  },
  "strategy-creator": {
    slug: "strategy-creator",
    title: "Strategy Creator Workspace",
    subtitle: "Prepare strategy drafts, validate authority context, and handoff proposals into governance review.",
    responsibilities: "Creates strategy records and forwards them into governance approval flow.",
    canSee: [
      "Draft strategy configs and deployed records",
      "Authority check result by governance/vault",
      "Governance review status for submitted drafts",
    ],
    canDo: [
      "Prepare deployment payload",
      "Submit strategy metadata for review",
      "Handoff approved strategy to registration flow",
    ],
    decisions: {
      approve: "Approve draft for governance submission.",
      reject: "Reject invalid draft before handoff.",
      add: "Add new drafts and metadata attachments.",
    },
    queue: [
      { id: "DRAFT-14", summary: "DOT carry strategy ready for review", state: "Ready" },
      { id: "DRAFT-15", summary: "Authority check in progress", state: "Pending" },
      { id: "DRAFT-16", summary: "Invalid vault address format", state: "Blocked" },
    ],
    checklist: [
      { label: "Strategy creator profile UI", done: true },
      { label: "Draft pipeline + review board", done: true },
      { label: "Approve/reject draft controls", done: true },
      { label: "Deployment tx + metadata persistence", done: false },
    ],
    kpis: [
      { label: "Drafts", value: "4", tone: "accent" },
      { label: "Under Review", value: "2" },
      { label: "Approved", value: "1" },
      { label: "Blocked", value: "1" },
    ],
  },
  treasury: {
    slug: "treasury",
    title: "Treasury Workspace",
    subtitle: "Monitor fee inflows, reconciliation health, and residual sweep receipts across all vaults.",
    responsibilities: "Tracks and reconciles treasury beneficiary flows.",
    canSee: [
      "Accrued withdrawal fee inflows",
      "Residual sweep receipts",
      "Per-vault reconciliation and anomaly reports",
    ],
    canDo: ["Export accounting statements", "Monitor fee flow anomalies", "Track period close reconciliation"],
    decisions: {
      approve: "Approve payout or reconciliation finalization.",
      reject: "Reject mismatched reconciliation entry.",
      add: "Add accounting notes and external reference IDs.",
    },
    queue: [
      { id: "REC-90", summary: "Q1 reconciliation package", state: "Ready" },
      { id: "REC-91", summary: "Pending transfer index sync", state: "Pending" },
      { id: "REC-92", summary: "Mismatch over fee route", state: "Blocked" },
    ],
    checklist: [
      { label: "Treasury profile UI", done: true },
      { label: "Fee analytics + export pipeline", done: true },
      { label: "Approve/reject reconciliation workflow", done: true },
      { label: "Cross-check against indexed transfers", done: false },
    ],
    kpis: [
      { label: "Fees This Period", value: formatUsd(248300), tone: "accent" },
      { label: "Residual Sweeps", value: "2" },
      { label: "Reconciled Vaults", value: "3/4" },
      { label: "Mismatches", value: "1" },
    ],
  },
};

export const roleOrder: RoleSlug[] = [
  "factory-owner",
  "governance-admin",
  "vault-admin",
  "controller-admin",
  "strategist",
  "guardian",
  "keeper",
  "depositor",
  "strategy-creator",
  "treasury",
];

export function getRoleProfile(role: string): RoleProfile | null {
  if (role in roleProfiles) {
    return roleProfiles[role as RoleSlug];
  }
  return null;
}

export function humanizeRole(role: RoleSlug): string {
  return role
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalize(value: string | undefined) {
  return value?.toLowerCase();
}

export function resolveWalletRoles(walletAddress?: string, isConnected?: boolean): RoleSlug[] {
  if (!isConnected || !walletAddress) {
    return [];
  }

  const wallet = normalize(walletAddress);
  const roles = new Set<RoleSlug>();

  // Any connected wallet can use depositor workspace.
  roles.add("depositor");

  const admin = normalize(polkadotTestnetRoleDefaults.admin);
  const strategist = normalize(polkadotTestnetRoleDefaults.strategist);
  const guardian = normalize(polkadotTestnetRoleDefaults.guardian);
  const keeper = normalize(polkadotTestnetRoleDefaults.keeper);
  const treasury = normalize(polkadotTestnetRoleDefaults.treasury);

  if (wallet === admin) {
    roles.add("factory-owner");
    roles.add("governance-admin");
    roles.add("vault-admin");
    roles.add("controller-admin");
    roles.add("strategy-creator");
  }

  if (wallet === strategist) {
    roles.add("strategist");
    roles.add("strategy-creator");
  }

  if (wallet === guardian) {
    roles.add("guardian");
  }

  if (wallet === keeper) {
    roles.add("keeper");
  }

  if (wallet === treasury) {
    roles.add("treasury");
  }

  return roleOrder.filter((role) => roles.has(role));
}
