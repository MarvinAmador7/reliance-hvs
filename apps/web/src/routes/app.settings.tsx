import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";

import {
  Avatar,
  Field,
  Panel,
  Pill,
  Switch,
  Td,
  Th,
} from "@/components/console/ui";
import { team } from "@/lib/mock-data";
import { useTenant } from "@/lib/tenant";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

const integrations = [
  {
    name: "Follow Up Boss",
    body: "Leads, activity timeline, and agent assignment.",
    status: "Connected",
  },
  { name: "kvCORE", body: "Leads and lead source.", status: "Available" },
  { name: "HubSpot", body: "Contacts and deals.", status: "Available" },
  {
    name: "Webhook / Zapier",
    body: "Every event as JSON to any endpoint.",
    status: "Available",
  },
] as const;

function SettingsPage() {
  const { tenant } = useTenant();
  const [notifyLeads, setNotifyLeads] = useState(true);
  const [notifyWeekly, setNotifyWeekly] = useState(true);
  const [roundRobin, setRoundRobin] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="c-title">Settings</h1>
        <p className="c-label mt-1">
          Organization, team, integrations, and compliance.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Organization">
          <div className="grid gap-4">
            <Field label="Legal name">
              <input
                className="field"
                defaultValue={tenant.legalName}
                type="text"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Brokerage license">
                <input className="field" defaultValue="CQ1045512" type="text" />
              </Field>
              <Field label="Primary MLS">
                <input
                  className="field"
                  defaultValue="MIAMI Association of Realtors"
                  type="text"
                />
              </Field>
            </div>
            <Field label="Office phone">
              <input className="field" defaultValue={tenant.phone} type="tel" />
            </Field>
          </div>
        </Panel>

        <Panel
          action={
            <button className="btn btn-ghost btn-sm" type="button">
              <Plus aria-hidden="true" className="size-4" />
              Invite
            </button>
          }
          flush
          title="Team"
        >
          <table className="w-full">
            <thead>
              <tr>
                <Th>Member</Th>
                <Th>Role</Th>
                <Th>
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {team.map((m) => (
                <tr className="last:[&>td]:border-b-0" key={m.email}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={m.initials} photo={m.photo} size="sm" />
                      <div>
                        <div className="font-medium">{m.name}</div>
                        <div className="c-label">{m.email}</div>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Pill>{m.role}</Pill>
                  </Td>
                  <Td align="right">
                    <button className="btn btn-ghost btn-sm" type="button">
                      Edit
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel
          sub="Where leads go, and how they're routed."
          title="Integrations and lead routing"
        >
          <ul className="divide-y divide-line">
            {integrations.map((i) => (
              <li
                className="flex items-center justify-between gap-4 py-3"
                key={i.name}
              >
                <div>
                  <div className="font-medium text-sm">{i.name}</div>
                  <div className="c-label">{i.body}</div>
                </div>
                {i.status === "Connected" ? (
                  <Pill dot tone="good">
                    Connected
                  </Pill>
                ) : (
                  <button className="btn btn-ghost btn-sm" type="button">
                    Connect
                  </button>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between rounded-[10px] bg-surface px-3.5 py-3">
            <div>
              <div className="font-medium text-sm">Round-robin by ZIP</div>
              <div className="c-label">
                Unassigned leads rotate among agents who cover the ZIP.
              </div>
            </div>
            <Switch
              checked={roundRobin}
              label="Round-robin lead routing"
              onChange={setRoundRobin}
            />
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel
            sub="Shown on every report and in the footer."
            title="Compliance"
          >
            <Field label="MLS disclaimer">
              <textarea
                className="field h-28 resize-none py-2 text-sm"
                defaultValue={tenant.mlsDisclaimer}
              />
            </Field>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Privacy policy URL">
                <input
                  className="field"
                  defaultValue={`https://${tenant.website}/privacy`}
                  type="url"
                />
              </Field>
              <Field label="Terms URL">
                <input
                  className="field"
                  defaultValue={`https://${tenant.website}/terms`}
                  type="url"
                />
              </Field>
            </div>
          </Panel>
          <Panel title="Notifications">
            <div className="divide-y divide-line">
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-sm">New lead alerts</div>
                  <div className="c-label">
                    Email the assigned agent and the owner immediately.
                  </div>
                </div>
                <Switch
                  checked={notifyLeads}
                  label="New lead alerts"
                  onChange={setNotifyLeads}
                />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-sm">
                    Weekly performance summary
                  </div>
                  <div className="c-label">
                    Monday morning, to everyone with the Owner role.
                  </div>
                </div>
                <Switch
                  checked={notifyWeekly}
                  label="Weekly performance summary"
                  onChange={setNotifyWeekly}
                />
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
