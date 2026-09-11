import { Link } from "@tanstack/react-router";
import {
  ChartLine,
  ChevronDown,
  CreditCard,
  Globe,
  Inbox,
  Palette,
  Settings,
  Share2,
} from "lucide-react";
import { Avatar } from "@/components/console/ui";
import { RelianceMark } from "@/components/home-report/tenant-logo";
import { useTenant } from "@/lib/tenant";

const nav = [
  { exact: true, icon: ChartLine, label: "Overview", to: "/app" },
  { icon: Inbox, label: "Leads", to: "/app/leads" },
  { icon: Globe, label: "Sites & widgets", to: "/app/sites" },
  { icon: Palette, label: "Customize", to: "/app/customize" },
  { icon: Share2, label: "Distribution", to: "/app/distribution" },
  { icon: CreditCard, label: "Billing", to: "/app/billing" },
  { icon: Settings, label: "Settings", to: "/app/settings" },
] as const;

export function Sidebar() {
  const { tenant } = useTenant();
  return (
    <aside className="flex h-full flex-col border-line border-r bg-surface">
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-4">
        <RelianceMark />
        <span className="font-semibold text-ink tracking-[-0.01em]">
          Reliance
        </span>
        <span className="rounded-md bg-brand-soft px-1.5 py-0.5 font-medium text-[0.6875rem] text-brand">
          Home Report
        </span>
      </div>

      <button
        className="mx-3 mb-3 flex items-center justify-between gap-2 rounded-[10px] border border-line bg-canvas px-3 py-2 text-left text-sm hover:bg-canvas/60"
        type="button"
      >
        <span className="min-w-0">
          <span className="c-label block">Organization</span>
          <span className="block truncate font-medium text-ink">
            {tenant.legalName}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-ink-muted"
        />
      </button>

      <nav aria-label="Console" className="flex-1 px-3">
        <ul className="space-y-0.5">
          {nav.map((item) => (
            <li key={item.to}>
              <Link
                activeOptions={{ exact: "exact" in item ? item.exact : false }}
                activeProps={{
                  className:
                    "bg-canvas text-ink shadow-[0_1px_2px_oklch(0_0_0/0.06)]",
                }}
                className="flex h-9 items-center gap-2.5 rounded-[10px] px-2.5 text-[0.9375rem] text-ink-muted transition-colors hover:bg-canvas/70 hover:text-ink"
                to={item.to}
              >
                <item.icon aria-hidden="true" className="size-4" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-2.5 border-line border-t px-4 py-3.5">
        <Avatar
          initials="MO"
          photo="https://randomuser.me/api/portraits/women/65.jpg"
          size="sm"
        />
        <div className="min-w-0 text-sm">
          <div className="truncate font-medium text-ink">Maya Ortiz</div>
          <div className="c-label truncate">Marketing Director</div>
        </div>
      </div>
    </aside>
  );
}
