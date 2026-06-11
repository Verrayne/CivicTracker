import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Building2, LogOut, Mail, Plus, Save, Settings, ShieldCheck, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/auth";
import { getWards } from "../../services/issues";
import {
  createWard,
  deleteIssue,
  getAdminIssues,
  getAdminSettings,
  updateEmailDelivery,
  updateWard,
  type WardInput,
} from "../../services/admin";
import type { Issue, Ward } from "../../types";

type AdminTab = "wards" | "issues" | "settings";

const emptyWard: WardInput = {
  name: "",
  councillor_name: "",
  councillor_email: "",
  councillor_mobile: "",
};

function WardForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  loading,
}: {
  initial: WardInput;
  submitLabel: string;
  onSubmit: (input: WardInput) => void;
  onCancel?: () => void;
  loading: boolean;
}) {
  const [values, setValues] = useState(initial);
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!/\d/.test(values.name)) {
      setError("Ward name must include its ward number, for example Ward 48.");
      return;
    }
    setError("");
    onSubmit(values);
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Input label="Ward name" placeholder="Ward 48" value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} required />
      <Input label="Councillor name" placeholder="Optional" value={values.councillor_name} onChange={(event) => setValues({ ...values, councillor_name: event.target.value })} />
      <Input label="Councillor email" type="email" placeholder="Optional" value={values.councillor_email} onChange={(event) => setValues({ ...values, councillor_email: event.target.value })} />
      <Input label="Councillor mobile" type="tel" placeholder="Optional" value={values.councillor_mobile} onChange={(event) => setValues({ ...values, councillor_mobile: event.target.value })} />
      {error && <p className="text-sm text-red-700 sm:col-span-2">{error}</p>}
      <div className="flex gap-3 sm:col-span-2">
        <Button type="submit" loading={loading}><Save className="h-4 w-4" /> {submitLabel}</Button>
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}><X className="h-4 w-4" /> Cancel</Button>}
      </div>
    </form>
  );
}

function WardsPanel() {
  const queryClient = useQueryClient();
  const wards = useQuery({ queryKey: ["wards", "admin"], queryFn: getWards });
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const createMutation = useMutation({
    mutationFn: createWard,
    onSuccess: () => {
      setAdding(false);
      setMessage("Ward added successfully.");
      void queryClient.invalidateQueries({ queryKey: ["wards"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: WardInput }) => updateWard(id, input),
    onSuccess: () => {
      setEditingId(null);
      setMessage("Ward details updated.");
      void queryClient.invalidateQueries({ queryKey: ["wards"] });
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div><h2 className="font-display text-3xl font-bold text-civic-950">Wards</h2><p className="mt-1 text-sm text-stone-500">Add wards and maintain councillor contact details.</p></div>
        <Button onClick={() => setAdding(!adding)}><Plus className="h-4 w-4" /> Add ward</Button>
      </div>
      {message && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
      {(createMutation.isError || updateMutation.isError) && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {(createMutation.error || updateMutation.error)?.message}
        </p>
      )}
      {adding && (
        <Card className="p-6">
          <h3 className="mb-5 font-display text-xl font-bold text-civic-950">New ward</h3>
          <WardForm initial={emptyWard} submitLabel="Add ward" loading={createMutation.isPending} onSubmit={(input) => createMutation.mutate(input)} onCancel={() => setAdding(false)} />
        </Card>
      )}
      <div className="grid gap-4">
        {wards.data?.map((ward: Ward) => {
          const initial: WardInput = {
            name: ward.name,
            councillor_name: ward.councillor_name || "",
            councillor_email: ward.councillor_email || "",
            councillor_mobile: ward.councillor_mobile || "",
          };
          return (
            <Card key={ward.id} className="p-6">
              {editingId === ward.id ? (
                <WardForm
                  initial={initial}
                  submitLabel="Save changes"
                  loading={updateMutation.isPending}
                  onSubmit={(input) => updateMutation.mutate({ id: ward.id, input })}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-civic-950">{ward.name}</h3>
                    <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
                      <div><dt className="text-xs text-stone-400">Councillor</dt><dd className="font-semibold">{ward.councillor_name || "Not set"}</dd></div>
                      <div><dt className="text-xs text-stone-400">Email</dt><dd className="font-semibold">{ward.councillor_email || "Not set"}</dd></div>
                      <div><dt className="text-xs text-stone-400">Mobile</dt><dd className="font-semibold">{ward.councillor_mobile || "Not set"}</dd></div>
                    </dl>
                  </div>
                  <Button variant="secondary" onClick={() => setEditingId(ward.id)}>Edit ward</Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function IssuesPanel() {
  const queryClient = useQueryClient();
  const issues = useQuery({ queryKey: ["admin-issues"], queryFn: getAdminIssues });
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const deleteMutation = useMutation({
    mutationFn: deleteIssue,
    onSuccess: () => {
      setMessage("Issue deleted.");
      void queryClient.invalidateQueries({ queryKey: ["admin-issues"] });
      void queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });

  const filtered = issues.data?.filter((issue) => {
    const term = search.trim().toLowerCase();
    return !term || [issue.issue_number, issue.title, issue.street_address].some((value) => value.toLowerCase().includes(term));
  });

  function confirmDelete(issue: Issue) {
    const confirmed = window.confirm(
      `Delete ${issue.issue_number} permanently?\n\nThis removes the public report, photos and communications. A security audit entry is retained. This cannot be undone.`,
    );
    if (confirmed) deleteMutation.mutate(issue);
  }

  return (
    <div className="space-y-5">
      <div><h2 className="font-display text-3xl font-bold text-civic-950">Resident issues</h2><p className="mt-1 text-sm text-stone-500">Review and permanently remove duplicate or invalid reports.</p></div>
      <Input aria-label="Search issues" placeholder="Search issue number, title or address" value={search} onChange={(event) => setSearch(event.target.value)} />
      {message && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
      {deleteMutation.isError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{deleteMutation.error.message}</p>}
      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="hidden grid-cols-[140px_1fr_150px_120px_80px] gap-4 border-b bg-stone-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-500 md:grid">
          <span>Issue</span><span>Details</span><span>Ward</span><span>Status</span><span />
        </div>
        {filtered?.map((issue) => (
          <div key={issue.id} className="grid gap-3 border-b px-5 py-5 last:border-0 md:grid-cols-[140px_1fr_150px_120px_80px] md:items-center md:gap-4">
            <span className="font-mono text-xs font-bold text-civic-700">{issue.issue_number}</span>
            <div><p className="font-semibold text-civic-950">{issue.title}</p><p className="mt-1 text-xs text-stone-500">{issue.street_address} · {format(new Date(issue.created_at), "d MMM yyyy")}</p></div>
            <span className="text-sm text-stone-600">{issue.wards?.name || "Unknown ward"}</span>
            <Badge status={issue.status} />
            <button
              type="button"
              onClick={() => confirmDelete(issue)}
              disabled={deleteMutation.isPending}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-red-700 hover:bg-red-50 disabled:opacity-50"
              aria-label={`Delete ${issue.issue_number}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPanel() {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({ queryKey: ["admin-settings"], queryFn: getAdminSettings });
  const mutation = useMutation({
    mutationFn: updateEmailDelivery,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-settings"] }),
  });
  const enabled = settingsQuery.data?.email_delivery_enabled ?? false;

  return (
    <div className="space-y-5">
      <div><h2 className="font-display text-3xl font-bold text-civic-950">System settings</h2><p className="mt-1 text-sm text-stone-500">Control production behavior without redeploying the application.</p></div>
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-civic-50 text-civic-800"><Mail className="h-5 w-5" /></span>
            <div>
              <h3 className="font-display text-xl font-bold text-civic-950">Municipality email delivery</h3>
              <p className="mt-1 max-w-xl text-sm leading-6 text-stone-500">
                When enabled, newly submitted issues and scheduled follow-ups can be sent to municipal routing addresses.
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            disabled={settingsQuery.isLoading || mutation.isPending}
            onClick={() => mutation.mutate(!enabled)}
            className={`relative h-8 w-14 shrink-0 rounded-full transition ${enabled ? "bg-emerald-600" : "bg-stone-300"}`}
          >
            <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${enabled ? "left-7" : "left-1"}`} />
          </button>
        </div>
        <div className={`mt-6 rounded-xl p-4 text-sm ${enabled ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
          Email delivery is currently <strong>{enabled ? "ON" : "OFF"}</strong>.
          {enabled && " New resident reports may contact the municipality immediately."}
        </div>
        {mutation.isError && <p className="mt-3 text-sm text-red-700">{mutation.error.message}</p>}
      </Card>
    </div>
  );
}

export function AdminDashboardPage() {
  const [tab, setTab] = useState<AdminTab>("wards");
  const { user, signOut } = useAuth();

  const tabs: { id: AdminTab; label: string; icon: typeof Building2 }[] = [
    { id: "wards", label: "Wards", icon: Building2 },
    { id: "issues", label: "Issues", icon: ShieldCheck },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <div className="flex flex-col justify-between gap-5 border-b pb-8 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">Secure workspace</p><h1 className="mt-2 font-display text-4xl font-bold text-civic-950">Administrator</h1><p className="mt-2 text-sm text-stone-500">{user?.email}</p></div>
        <Button variant="secondary" onClick={() => void signOut()}><LogOut className="h-4 w-4" /> Sign out</Button>
      </div>
      <div className="mt-7 flex gap-2 overflow-x-auto pb-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${tab === id ? "bg-civic-900 text-white" : "bg-white text-stone-600 hover:text-civic-900"}`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>
      <div className="mt-8">
        {tab === "wards" && <WardsPanel />}
        {tab === "issues" && <IssuesPanel />}
        {tab === "settings" && <SettingsPanel />}
      </div>
    </div>
  );
}
