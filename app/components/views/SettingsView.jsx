// components/views/SettingsView.jsx
"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Download, History, Loader2, LogOut, Phone, Plus, RotateCcw, Trash2, UserX, X } from "lucide-react";
import { Rise, Stagger } from "../ui/motion";
import { CURRENCIES } from "../OnboardingScreen";
import AddictionPicker from "../AddictionPicker";
import NotificationSettings from "../NotificationSettings";
import { formatDuration, fromDateTimeInputs, parseQuitDate, toDateInput, toTimeInput } from "../../utils/dateUtils";
import { toast } from "../../lib/toast";

function Section({ title, children, description, className = "" }) {
  return (
    <Rise as="section" className={`card space-y-4 ${className}`}>
      <div>
        <h2 className="font-semibold text-slate-900">{title}</h2>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      {children}
    </Rise>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export default function SettingsView({ user, userData, onBack, onUpdateProfile, onSlip, onExport, onResetAll, onSignOut, onDeleteAccount, onShowInstall }) {
  const quit = parseQuitDate(userData.quitDate) || new Date();
  const [form, setForm] = useState({
    name: userData.name || "",
    addiction: userData.addiction,
    addictionId: userData.addictionId ?? null,
    addictionCategory: userData.addictionCategory ?? null,
    date: toDateInput(quit),
    time: toTimeInput(quit),
    costPerDay: userData.costPerDay ? String(userData.costPerDay) : "",
    currency: userData.currency || "USD",
    motivation: userData.motivation,
  });
  const [contact, setContact] = useState({ name: "", phone: "" });
  const [resetText, setResetText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deletePw, setDeletePw] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const contacts = userData.supportContacts || [];
  const history = [...(userData.relapseHistory || [])].reverse();

  const saveProfile = (e) => {
    e.preventDefault();
    if (!form.addiction.trim() || !form.motivation.trim()) return toast("Addiction and motivation can’t be empty", "error");
    const quitDate = fromDateTimeInputs(form.date, form.time);
    if (new Date(quitDate) > new Date()) return toast("Quit date can’t be in the future", "error");
    onUpdateProfile({
      name: form.name.trim(),
      addiction: form.addiction.trim(),
      addictionId: form.addictionId,
      addictionCategory: form.addictionCategory,
      quitDate,
      costPerDay: Math.max(0, parseFloat(form.costPerDay) || 0),
      currency: form.currency,
      motivation: form.motivation.trim(),
    });
    toast("Profile saved");
  };

  const addContact = (e) => {
    e.preventDefault();
    if (!contact.name.trim() || !/[\d+]{3,}/.test(contact.phone.replace(/[\s()-]/g, ""))) return toast("Add a name and a valid phone number", "error");
    onUpdateProfile({ supportContacts: [...contacts, { id: Date.now(), name: contact.name.trim(), phone: contact.phone.trim() }] });
    setContact({ name: "", phone: "" });
  };

  return (
    <Stagger className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 lg:gap-6">
      <Rise className="lg:col-span-2">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 lg:hidden">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="font-display mt-2 px-1 text-3xl font-semibold text-slate-900 lg:mt-0">Settings</h1>
      </Rise>

      <Section title="Account" description="Your progress is saved to this account and syncs across devices." className="lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-emerald-600 text-lg font-semibold text-white">
              {(user?.name || user?.email || "?")[0].toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">{user?.name || "Signed in"}</p>
              <p className="truncate text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>
          <button onClick={onSignOut} className="btn-secondary">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </Section>

      <div className="min-w-0 space-y-4 lg:space-y-6">
      <Section title="Profile">
        <form onSubmit={saveProfile} className="space-y-4">
          <Field label="Name">
            <input className="field" value={form.name} onChange={set("name")} placeholder="Optional" />
          </Field>
          <div>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Recovering from</span>
            <AddictionPicker value={form} onChange={(v) => setForm((f) => ({ ...f, ...v }))} />
          </div>
          <Field label="Quit date & time">
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input type="date" className="field" value={form.date} max={toDateInput(new Date())} onChange={set("date")} aria-label="Quit date" />
              <input type="time" className="field" value={form.time} onChange={set("time")} aria-label="Quit time" />
            </div>
            <span className="mt-1 block text-xs text-slate-500">For corrections. If you slipped, use “Record a slip” below so it’s kept in your history.</span>
          </Field>
          <Field label="Daily cost">
            <div className="grid grid-cols-[auto_1fr] gap-2">
              <select className="field w-auto" value={form.currency} onChange={set("currency")} aria-label="Currency">
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input type="number" inputMode="decimal" min="0" step="0.01" className="field" value={form.costPerDay} onChange={set("costPerDay")} placeholder="0.00" />
            </div>
          </Field>
          <Field label="Your why">
            <textarea rows={3} className="field resize-none" value={form.motivation} onChange={set("motivation")} />
          </Field>
          <button type="submit" className="btn-primary w-full">Save changes</button>
        </form>
      </Section>

      </div>
      <div className="min-w-0 space-y-4 lg:space-y-6">
      <Section title="Notifications" description="Reminders and milestones, inside the app and on your phone.">
        <NotificationSettings onShowInstall={onShowInstall} />
      </Section>
      <Section title="Install the app" description="Add Recovery to your home screen for one-tap access and phone notifications.">
        <button onClick={onShowInstall} className="btn-secondary w-full">
          <Download className="h-4 w-4" /> Install / Add to Home Screen
        </button>
      </Section>
      <Section title="Support contacts" description="People you can call or text from the SOS toolkit.">
        {contacts.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-teal-600" />
              <div>
                <div className="font-semibold text-slate-900">{c.name}</div>
                <div className="text-xs text-slate-500">{c.phone}</div>
              </div>
            </div>
            <button onClick={() => onUpdateProfile({ supportContacts: contacts.filter((x) => x.id !== c.id) })} className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700" aria-label={`Remove ${c.name}`}>
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <form onSubmit={addContact} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <input className="field" placeholder="Name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} aria-label="Contact name" />
          <input className="field" type="tel" placeholder="Phone" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} aria-label="Contact phone" />
          <button type="submit" className="btn-primary px-3" aria-label="Add contact">
            <Plus className="h-5 w-5" />
          </button>
        </form>
      </Section>

      <Section title="Slips" description="Recording a slip restarts your counter but keeps everything else.">
        <button onClick={onSlip} className="btn-secondary w-full">
          <RotateCcw className="h-4 w-4" /> Record a slip
        </button>
        {history.length > 0 && (
          <div className="space-y-2">
            <p className="eyebrow flex items-center gap-1.5"><History className="h-3.5 w-3.5" /> History</p>
            {history.map((r) => (
              <div key={r.date} className="rounded-2xl bg-slate-50 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-800">{new Date(r.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                  <span className="text-slate-500">after {formatDuration(r.durationMs ?? r.daysClean * 86400000)}</span>
                </div>
                {r.trigger && <p className="mt-1 text-slate-600"><span className="font-medium">What happened:</span> {r.trigger}</p>}
                {r.reflection && <p className="mt-1 text-slate-600"><span className="font-medium">Next time:</span> {r.reflection}</p>}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Your data" description="Download a copy of everything, or start over.">
        <button onClick={onExport} className="btn-secondary w-full">
          <Download className="h-4 w-4" /> Export backup (JSON)
        </button>
        <div className="rounded-2xl border border-rose-200 p-4">
          <p className="text-sm font-semibold text-rose-800">Delete everything</p>
          <p className="mt-1 text-sm text-slate-600">Permanently erases your profile, journal, cravings, moods and progress. Type RESET to confirm.</p>
          <div className="mt-3 flex gap-2">
            <input className="field" value={resetText} onChange={(e) => setResetText(e.target.value)} placeholder="RESET" aria-label="Type RESET to confirm" />
            <button disabled={resetText !== "RESET"} onClick={onResetAll} className="btn-danger shrink-0">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-rose-200 p-4">
          <p className="text-sm font-semibold text-rose-800">Delete account</p>
          <p className="mt-1 text-sm text-slate-600">Removes your account and everything in it from our servers. This can’t be undone.</p>
          <AnimatePresence initial={false} mode="wait">
            {deleting ? (
              <motion.form
                key="confirm"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  setDeleteError("");
                  try {
                    await onDeleteAccount(deletePw);
                  } catch (err) {
                    setDeleteError(err.message);
                    setBusy(false);
                  }
                }}
                className="mt-3 space-y-2 overflow-hidden"
              >
                <input type="password" className="field" value={deletePw} onChange={(e) => setDeletePw(e.target.value)} placeholder="Confirm with your password" aria-label="Password" autoComplete="current-password" />
                {deleteError && <p className="text-sm text-rose-700">{deleteError}</p>}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setDeleting(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={!deletePw || busy} className="btn-danger flex-1">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />} Delete account
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.button key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setDeleting(true)} className="mt-3 text-sm font-semibold text-rose-700 hover:underline">
                Delete my account…
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </Section>
      </div>
    </Stagger>
  );
}
