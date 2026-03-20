import Link from "next/link";

import { RoleSlug, humanizeRole } from "@/lib/profile/roles";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function ProfileRoleSwitcher({ activeRole, roles }: { activeRole?: RoleSlug; roles: RoleSlug[] }) {
  return (
    <div className="g-glass mb-4 flex flex-wrap gap-2 p-2">
      {roles.map((role) => {
        const active = role === activeRole;

        return (
          <Link
            key={role}
            href={`/profile/${role}`}
            className={cx(
              "rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition",
              active
                ? "bg-accent g-on-accent"
                : "border border-white/20 bg-white/5 text-slate-300 hover:border-white/40 hover:text-white"
            )}
          >
            {humanizeRole(role)}
          </Link>
        );
      })}
    </div>
  );
}
