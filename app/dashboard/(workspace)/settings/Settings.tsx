"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import base from "../../dashboard.module.css";
import styles from "./settings.module.css";
import { PageHead, TopBar, useShell } from "../../_shell/AppShell";
import { ACCOUNT_META, clearSettings, type AccountId, type BriefingSection, type NotificationId, type Settings as SettingsShape } from "../../_shell/settings";
import { BLUE, GREEN, PATTERNS, PURPLE, Pixels, YELLOW, cx } from "../../_shell/ui";
import { ONBOARDED_COOKIE } from "../../../../src/auth/demo";
import { goals, inboxThreads, niches, type Tone } from "../../data";
import { SETTINGS_TABS, type SettingsTab } from "./tabs";

const TONES: Tone[] = ["Friendly", "Professional", "Shorter"];
const BRIEFING_TIMES = ["7:00", "8:00", "9:00", "10:00"];

const SECTIONS: { id: BriefingSection; label: string; detail: string; color: string; pattern: string }[] = [
  { id: "todo", label: "Today's to-do", detail: "From your inbox and calendar", color: BLUE, pattern: PATTERNS.briefing },
  { id: "inbox", label: "Sorted inbox", detail: "Counts by category and drafted replies", color: GREEN, pattern: PATTERNS.inbox },
  { id: "ideas", label: "Ideas for today", detail: "From what your audience asks", color: YELLOW, pattern: PATTERNS.publish },
  { id: "deals", label: "Deals and payments", detail: "Risks, deadlines and overdue invoices", color: PURPLE, pattern: PATTERNS.deals },
];

const NOTIFICATIONS: { id: NotificationId; label: string; detail: string }[] = [
  { id: "overdue", label: "Overdue payments", detail: "When an invoice passes its due date" },
  { id: "newDeal", label: "New brand offers", detail: "When CreatorOS sorts a new brand deal into your inbox" },
  { id: "deadline", label: "Deadlines tomorrow", detail: "The evening before a deliverable is due" },
  { id: "weekly", label: "Weekly summary", detail: "Every Sunday: money in, posts out, time saved" },
];

const AUTO_DRAFT: { id: keyof SettingsShape["autoDraft"]; label: string; detail: string }[] = [
  { id: "Brand deal", label: "Brand deals", detail: "Replies that confirm dates and ask for missing terms" },
  { id: "Collab", label: "Collabs", detail: "Replies that suggest times from your calendar" },
  { id: "Fan question", label: "Fan questions", detail: "Short answers from your past replies and bio" },
];

function Toggle({ on, onChange, label }: { on: boolean; onChange: (on: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className={cx(styles.toggle, on && styles.toggleOn)} onClick={() => onChange(!on)}>
      <span />
    </button>
  );
}

function Row({ title, detail, children }: { title: string; detail?: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowText}>
        <strong>{title}</strong>
        {detail && <small>{detail}</small>}
      </div>
      <div className={styles.rowControl}>{children}</div>
    </div>
  );
}

// The Nike reply in the chosen tone, ending with the creator's sign-off.
function sampleReply(tone: Tone, signOff: string) {
  const draft = inboxThreads.find((t) => t.id === "m1")!.drafts![tone].replace(/==/g, "");
  const body = draft.split("\n\n").slice(0, -1).join("\n\n");
  return `${body}\n\n${signOff.trim() || "Maya"}`;
}

export default function Settings({ initialTab }: { initialTab: SettingsTab }) {
  const router = useRouter();
  const { notify, settings, updateSettings } = useShell();
  const csvInput = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const [saved, setSaved] = useState(false);
  const [connecting, setConnecting] = useState<AccountId | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (savedTimer.current) clearTimeout(savedTimer.current);
  }, []);

  function save(patch: Partial<SettingsShape>) {
    updateSettings(patch);
    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 1600);
  }

  function open(next: SettingsTab) {
    setTab(next);
    router.replace(`/dashboard/settings?tab=${next}`, { scroll: false });
  }

  function setAccount(id: AccountId, state: SettingsShape["accounts"][AccountId]) {
    save({ accounts: { ...settings.accounts, [id]: state } });
  }

  function connect(id: AccountId) {
    setConnecting(id);
    setTimeout(() => {
      setConnecting(null);
      setAccount(id, "connected");
      notify(`${ACCOUNT_META[id].name} connected`);
    }, 900);
  }

  function resetDemo() {
    clearSettings();
    document.cookie = `${ONBOARDED_COOKIE}=; path=/; max-age=0`;
    window.location.href = "/dashboard/onboarding";
  }

  const active = SETTINGS_TABS.find((t) => t.id === tab)!;
  const connectedCount = (Object.keys(ACCOUNT_META) as AccountId[]).filter((id) => ["connected", "imported"].includes(settings.accounts[id])).length;

  return (
    <>
      <TopBar>
        <a className={base.btnLine} href="/auth/signout">Sign out</a>
      </TopBar>

      <PageHead
        eyebrow="settings"
        title="Settings"
        lead="Your profile, connected accounts and how CreatorOS works for you."
        badge="changes save automatically"
      />

      <div className={styles.layout}>
        <nav className={styles.tabs} aria-label="Settings sections">
          {SETTINGS_TABS.map((t) => (
            <button key={t.id} type="button" className={cx(styles.tab, tab === t.id && styles.tabOn)} onClick={() => open(t.id)} aria-current={tab === t.id ? "page" : undefined}>
              <strong>{t.label}</strong>
              <small>{t.id === "accounts" ? `${connectedCount} connected` : t.hint}</small>
            </button>
          ))}
        </nav>

        <section className={styles.card} aria-labelledby="settings-title">
          <div className={styles.cardHead}>
            <h2 id="settings-title">{active.label}</h2>
            <span className={cx(styles.saved, saved && styles.savedOn)} role="status">{saved ? "✓ Saved" : ""}</span>
          </div>

          {tab === "profile" && (
            <>
              <div className={styles.profile}>
                <span className={base.avatar}>{(settings.name.trim()[0] ?? "M").toUpperCase()}</span>
                <div>
                  <strong>{settings.name || "Your name"}</strong>
                  <small>{settings.channel}</small>
                </div>
              </div>
              <label className={styles.field}>
                <span>Name</span>
                <input value={settings.name} onChange={(e) => save({ name: e.target.value })} placeholder="Your name" />
              </label>
              <label className={styles.field}>
                <span>Main channel</span>
                <input value={settings.channel} onChange={(e) => save({ channel: e.target.value })} placeholder="@handle · YouTube" />
              </label>
              <label className={styles.field}>
                <span>Sign-in email</span>
                <input value="user@gmail.com" readOnly disabled />
                <small>The demo account’s email can’t be changed.</small>
              </label>
              <fieldset className={styles.group}>
                <legend>Your niche</legend>
                <div className={styles.chips}>
                  {niches.map((n) => (
                    <button key={n} type="button" className={cx(styles.chip, settings.niche === n && styles.chipOn)} aria-pressed={settings.niche === n} onClick={() => save({ niche: n })}>{n}</button>
                  ))}
                </div>
              </fieldset>
              <fieldset className={styles.group}>
                <legend>Your goals <small>pick one or more</small></legend>
                <div className={styles.chips}>
                  {goals.map((g) => {
                    const on = settings.goals.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        className={cx(styles.chip, on && styles.chipOn)}
                        aria-pressed={on}
                        onClick={() => {
                          if (on && settings.goals.length === 1) return;
                          save({ goals: on ? settings.goals.filter((x) => x !== g) : [...settings.goals, g] });
                        }}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </>
          )}

          {tab === "accounts" && (
            <>
              <ul className={styles.accounts}>
                {(Object.keys(ACCOUNT_META) as AccountId[]).map((id) => {
                  const meta = ACCOUNT_META[id];
                  const state = settings.accounts[id];
                  return (
                    <li key={id}>
                      <span className={styles.mark} style={{ background: meta.color }}>{meta.mark}</span>
                      <span className={styles.rowText}>
                        <strong>{meta.name}</strong>
                        <small>
                          {state === "connected" ? `${meta.detail} · synced 9:02` : state === "imported" ? "Metrics imported from CSV · 28 Oct" : meta.detail}
                        </small>
                      </span>
                      <span className={styles.accountActions}>
                        {state === "soon" ? (
                          <span className={base.tag}>Soon</span>
                        ) : connecting === id ? (
                          <span className={styles.pending}>Connecting…</span>
                        ) : state === "connected" ? (
                          <>
                            <span className={styles.ok}>✓ Connected</span>
                            <button type="button" className={base.mini} onClick={() => { setAccount(id, "disconnected"); notify(`${meta.name} disconnected`); }}>Disconnect</button>
                          </>
                        ) : state === "imported" ? (
                          <>
                            <span className={styles.ok}>✓ Imported</span>
                            <button type="button" className={base.mini} onClick={() => csvInput.current?.click()}>Re-import</button>
                          </>
                        ) : id === "instagram" ? (
                          <button type="button" className={base.btnGhost} onClick={() => csvInput.current?.click()}>Import CSV</button>
                        ) : (
                          <button type="button" className={base.btnDark} onClick={() => connect(id)}>Connect</button>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <input
                ref={csvInput}
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAccount("instagram", "imported");
                    notify(`${file.name} imported`);
                  }
                  e.target.value = "";
                }}
              />
              <p className={styles.note}>🔒 Read-only access. Nothing is sent, posted or booked without your approval. Disconnecting stops new syncs; nothing already in CreatorOS is deleted.</p>
            </>
          )}

          {tab === "briefing" && (
            <>
              <fieldset className={styles.group}>
                <legend>Send my briefing at</legend>
                <div className={styles.chips}>
                  {BRIEFING_TIMES.map((t) => (
                    <button key={t} type="button" className={cx(styles.chip, base.mono, settings.briefingTime === t && styles.chipOn)} aria-pressed={settings.briefingTime === t} onClick={() => save({ briefingTime: t })}>
                      {t} am
                    </button>
                  ))}
                </div>
              </fieldset>
              <Row title="Email me the briefing" detail={`Arrives at ${settings.briefingTime} am, Monday to Sunday. It’s always on your Today screen too.`}>
                <Toggle on={settings.briefingEmail} onChange={(on) => save({ briefingEmail: on })} label="Email me the briefing" />
              </Row>
              <Row title="Preview the email" detail="Opens today’s briefing email with your time, name and sections.">
                <a
                  className={base.btnGhost}
                  target="_blank"
                  rel="noopener"
                  href={`/dashboard/email/briefing?${new URLSearchParams({
                    time: settings.briefingTime,
                    name: settings.name.split(" ")[0] || "Maya",
                    sections: (Object.keys(settings.briefingSections) as BriefingSection[]).filter((k) => settings.briefingSections[k]).join(","),
                  })}`}
                >
                  Preview ↗
                </a>
              </Row>
              <h3 className={styles.subTitle}>What it includes</h3>
              {SECTIONS.map((s) => (
                <Row
                  key={s.id}
                  title={s.label}
                  detail={
                    <span className={styles.withIcon}>
                      <Pixels color={s.color} pattern={s.pattern} />
                      {s.detail}
                    </span>
                  }
                >
                  <Toggle
                    on={settings.briefingSections[s.id]}
                    label={s.label}
                    onChange={(on) => {
                      const next = { ...settings.briefingSections, [s.id]: on };
                      if (!Object.values(next).some(Boolean)) return notify("Keep at least one section in your briefing");
                      save({ briefingSections: next });
                    }}
                  />
                </Row>
              ))}
            </>
          )}

          {tab === "replies" && (
            <>
              <fieldset className={styles.group}>
                <legend>Default tone</legend>
                <div className={styles.segment} role="radiogroup" aria-label="Default tone">
                  {TONES.map((t) => (
                    <button key={t} type="button" role="radio" aria-checked={settings.tone === t} className={cx(styles.segmentBtn, settings.tone === t && styles.segmentOn)} onClick={() => save({ tone: t })}>
                      {t}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className={styles.field}>
                <span>Sign-off</span>
                <textarea rows={2} value={settings.signOff} onChange={(e) => save({ signOff: e.target.value })} />
              </label>
              <div className={styles.sample}>
                <div className={styles.sampleHead}>
                  <span>Preview · reply to Nike</span>
                  <span className={base.tag}>{settings.tone.toLowerCase()}</span>
                </div>
                <p>{sampleReply(settings.tone, settings.signOff)}</p>
              </div>
              <h3 className={styles.subTitle}>Draft replies automatically for</h3>
              {AUTO_DRAFT.map((a) => (
                <Row key={a.id} title={a.label} detail={a.detail}>
                  <Toggle on={settings.autoDraft[a.id]} onChange={(on) => save({ autoDraft: { ...settings.autoDraft, [a.id]: on } })} label={`Auto-draft ${a.label}`} />
                </Row>
              ))}
              <p className={styles.note}>Spam is never answered. Every draft waits for your approval before it’s saved to Gmail.</p>
            </>
          )}

          {tab === "notifications" && (
            <>
              {NOTIFICATIONS.map((n) => (
                <Row key={n.id} title={n.label} detail={n.detail}>
                  <Toggle on={settings.notifications[n.id]} onChange={(on) => save({ notifications: { ...settings.notifications, [n.id]: on } })} label={n.label} />
                </Row>
              ))}
              <p className={styles.note}>Alerts appear under the bell and in your briefing email{settings.briefingEmail ? "" : " (briefing email is off)"}.</p>
            </>
          )}

          {tab === "account" && (
            <>
              <div className={styles.plan}>
                <div>
                  <span className={styles.planName}>Free plan</span>
                  <strong>$0 / month</strong>
                  <small>1 creator · Gmail, Calendar and YouTube · daily briefing</small>
                </div>
                <a className={base.btnDark} href="/#pricing">See plans</a>
              </div>
              <Row title="Sign out" detail="You can sign back in with the demo login.">
                <a className={base.btnGhost} href="/auth/signout">Sign out</a>
              </Row>
              <Row title="Reset demo data" detail="Clears your settings in this browser and starts onboarding again.">
                <button type="button" className={cx(base.btnGhost, styles.danger)} onClick={resetDemo}>Reset</button>
              </Row>
            </>
          )}
        </section>
      </div>
    </>
  );
}
