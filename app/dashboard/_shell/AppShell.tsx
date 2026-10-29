"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import styles from "../dashboard.module.css";
import { copilot, creator, deals, stats, today, type CalEvent } from "../data";
import { BLUE, GREEN, PATTERNS, PURPLE, Pixels, Logo, YELLOW, cx } from "./ui";

// The workspace frame shared by every /dashboard screen: sidebar, sky band,
// Copilot drawer, draft modal and toast. Approvals, scheduled clips and
// calendar additions live here so every screen sees the same state.

export interface DraftTarget {
  kind: "reply" | "reminder";
  id: string;
  title: string;
  to: string;
  text: string;
  minutesSaved: number;
}

interface ChatTurn {
  role: "you" | "copilot";
  text: string;
}

interface Shell {
  notify: (message: string) => void;
  openCopilot: () => void;
  openDraft: (draft: DraftTarget) => void;
  approved: Set<string>;
  approve: (ids: { id: string; minutesSaved: number }[]) => void;
  minutesSaved: number;
  scheduledClips: Set<string>;
  scheduleClip: (id: string) => void;
  dealsInCalendar: Set<string>;
  addDealToCalendar: (slug: string) => void;
  addedEvents: CalEvent[];
  addEvent: (event: CalEvent) => void;
  removedEvents: Set<string>;
  removeEvent: (id: string) => void;
}

const ShellContext = createContext<Shell | null>(null);

export function useShell(): Shell {
  const shell = useContext(ShellContext);
  if (!shell) throw new Error("useShell must be used inside <AppShell>");
  return shell;
}

function answerFor(question: string): string {
  const q = question.toLowerCase();
  const hit = copilot.find((a) => a.keywords.some((k) => q.includes(k)));
  if (hit) return hit.answer;
  return "In this demo I can answer questions about money owed, what's due this week, risky deals and what to post next. Try one of the suggestions below.";
}

const NAV = [
  { label: "Today", href: "/dashboard", color: BLUE, pattern: PATTERNS.briefing },
  { label: "Inbox", href: "/dashboard/inbox", color: GREEN, pattern: PATTERNS.inbox, count: stats.messagesSorted },
  { label: "Publish", href: "/dashboard/publish", color: YELLOW, pattern: PATTERNS.publish },
  { label: "Deals", href: "/dashboard/deals", color: PURPLE, pattern: PATTERNS.deals, count: deals.length },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [approved, setApproved] = useState<Set<string>>(new Set());
  const [minutesSaved, setMinutesSaved] = useState(today.minutesSavedThisWeek);
  const [scheduledClips, setScheduledClips] = useState<Set<string>>(new Set());
  const [dealsInCalendar, setDealsInCalendar] = useState<Set<string>>(new Set());
  const [addedEvents, setAddedEvents] = useState<CalEvent[]>([]);
  const [removedEvents, setRemovedEvents] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState<DraftTarget | null>(null);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [chat, setChat] = useState<ChatTurn[]>([]);
  const [question, setQuestion] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const approve = useCallback(
    (items: { id: string; minutesSaved: number }[]) => {
      const fresh = items.filter((item) => !approved.has(item.id));
      if (fresh.length === 0) return;
      setApproved((s) => {
        const next = new Set(s);
        fresh.forEach((item) => next.add(item.id));
        return next;
      });
      setMinutesSaved((m) => m + fresh.reduce((sum, item) => sum + item.minutesSaved, 0));
    },
    [approved],
  );

  // ⌘K / Ctrl+K opens the Copilot, Escape closes whatever is open.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCopilotOpen(true);
      } else if (e.key === "Escape") {
        setDraft(null);
        setCopilotOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function approveDraft() {
    if (!draft) return;
    approve([draft]);
    notify(draft.kind === "reminder" ? "Reminder saved to your Gmail drafts" : "Reply saved to your Gmail drafts");
    setDraft(null);
  }

  function ask(text: string) {
    const q = text.trim();
    if (!q) return;
    setChat((c) => [...c, { role: "you", text: q }, { role: "copilot", text: answerFor(q) }]);
    setQuestion("");
  }

  const shell: Shell = {
    notify,
    openCopilot: () => setCopilotOpen(true),
    openDraft: setDraft,
    approved,
    approve,
    minutesSaved,
    scheduledClips,
    scheduleClip: (id) => setScheduledClips((s) => new Set(s).add(id)),
    dealsInCalendar,
    addDealToCalendar: (slug) => setDealsInCalendar((s) => new Set(s).add(slug)),
    addedEvents,
    removedEvents,
    addEvent: (event) => setAddedEvents((list) => [...list, event]),
    removeEvent: (id) => setRemovedEvents((s) => new Set(s).add(id)),
  };

  return (
    <ShellContext.Provider value={shell}>
      <div className={styles.app}>
        <aside className={styles.sidebar}>
          <Link className={styles.logo} href="/" aria-label="CreatorOS home">
            <Logo />
            CREATOROS
          </Link>
          <nav className={styles.nav} aria-label="Workspace">
            {NAV.map((item) => {
              const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link key={item.label} href={item.href} className={cx(styles.navItem, active && styles.navActive)} aria-current={active ? "page" : undefined}>
                  <Pixels color={item.color} pattern={item.pattern} />
                  <span>{item.label}</span>
                  {item.count !== undefined && <span className={styles.count}>{item.count}</span>}
                </Link>
              );
            })}
            <div className={styles.navLabel}>Workspace</div>
            <Link
              href="/dashboard/calendar"
              className={cx(styles.navItem, pathname.startsWith("/dashboard/calendar") && styles.navActive)}
              aria-current={pathname.startsWith("/dashboard/calendar") ? "page" : undefined}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="3" /><path d="M3 10h18M8 2v4M16 2v4" /></svg>
              <span>Calendar</span>
            </Link>
            <button type="button" className={styles.navItem} onClick={() => notify("Analytics is coming next")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
              <span>Analytics</span>
            </button>
            <button type="button" className={styles.navItem} onClick={() => setCopilotOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 2l2.4 6.9H22l-6 4.4 2.3 7L12 16l-6.3 4.3L8 13.3 2 8.9h7.6z" /></svg>
              <span>Copilot</span>
              <kbd className={styles.kbdSmall}>⌘K</kbd>
            </button>
          </nav>
          <div className={styles.sideFoot}>
            <div className={styles.connected}>
              <span>Connected</span>
              <div className={styles.connIcons}>
                <span style={{ background: "#ea4335" }} title="Gmail">M</span>
                <span style={{ background: "#4285f4" }} title="Google Calendar">31</span>
                <span style={{ background: "#ff0033" }} title="YouTube">▶</span>
                <span style={{ background: "linear-gradient(45deg,#f9a825,#e91e63,#7b1fa2)" }} title="Instagram">IG</span>
                <Link className={styles.connAdd} href="/dashboard/onboarding" aria-label="Connect another account" title="Connect another account">+</Link>
              </div>
            </div>
            <div className={styles.me}>
              <span className={styles.avatar}>{creator.initial}</span>
              <div className={styles.meText}>
                <strong>{creator.name}</strong>
                <span>{creator.audience}</span>
              </div>
              <a className={styles.signOut} href="/auth/signout" title="Sign out" aria-label="Sign out">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" /></svg>
              </a>
            </div>
          </div>
        </aside>

        <main className={styles.main} id="top">
          <div className={styles.sky} aria-hidden="true">
            <div className={styles.skyGrid} />
            <div className={styles.clouds} />
            <div className={styles.skyFade} />
            <span className={styles.bigPx} style={{ right: "16%", top: 92 }}><Pixels color="#aeabff" pattern="1001011001101001" size={7} /></span>
            <span className={styles.bigPx} style={{ right: "34%", top: 150 }}><Pixels color="#ffcc40" pattern="1000011101000100" size={7} /></span>
          </div>
          <div className={styles.wrap}>{children}</div>
        </main>

        {draft && (
          <div className={styles.overlay} onClick={() => setDraft(null)}>
            <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="draft-title" onClick={(e) => e.stopPropagation()}>
              <div className={styles.eyebrow}><span>[</span>{draft.kind === "reminder" ? "payment reminder" : "reply draft"}<span>]</span></div>
              <h3 id="draft-title" className={styles.modalTitle}>{draft.title}</h3>
              <div className={styles.field}><span>To</span><strong>{draft.to}</strong></div>
              <textarea className={styles.textarea} value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} rows={9} />
              <p className={styles.modalNote}>Nothing is sent until you approve it. Approved drafts are saved to Gmail.</p>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnGhost} onClick={() => setDraft(null)}>Cancel</button>
                <button type="button" className={styles.btnDark} onClick={approveDraft}>Approve and save to drafts</button>
              </div>
            </div>
          </div>
        )}

        <div className={cx(styles.drawer, copilotOpen && styles.drawerOpen)} aria-hidden={!copilotOpen}>
          <div className={styles.drawerHead}>
            <span className={styles.spark}>✦</span>
            <strong>Copilot</strong>
            <button type="button" className={styles.close} onClick={() => setCopilotOpen(false)} aria-label="Close Copilot">×</button>
          </div>
          <div className={styles.chat}>
            {chat.length === 0 && (
              <p className={styles.chatEmpty}>Ask anything about your deals, deadlines, money or content. Answers come from your workspace.</p>
            )}
            {chat.map((turn, i) => (
              <div key={i} className={turn.role === "you" ? styles.bubbleYou : styles.bubbleBot}>{turn.text}</div>
            ))}
          </div>
          <div className={styles.suggest}>
            {copilot.map((a) => (
              <button key={a.question} type="button" className={styles.mini} onClick={() => ask(a.question)}>{a.question}</button>
            ))}
          </div>
          <form className={styles.askForm} onSubmit={(e) => { e.preventDefault(); ask(question); }}>
            <input className={styles.askInput} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask CreatorOS…" aria-label="Ask CreatorOS" />
            <button type="submit" className={styles.btnDark}>Ask</button>
          </form>
        </div>
        {copilotOpen && <div className={styles.drawerShade} onClick={() => setCopilotOpen(false)} />}

        {toast && <div className={styles.toast} role="status">{toast}</div>}
      </div>
    </ShellContext.Provider>
  );
}

// The Ask bar and bell, with the screen's main action on the right.
export function TopBar({ children }: { children?: ReactNode }) {
  const { notify, openCopilot } = useShell();
  return (
    <header className={styles.top}>
      <button type="button" className={styles.ask} onClick={openCopilot}>
        <span className={styles.spark}>✦</span>
        <span className={styles.askText}>Ask CreatorOS: “Who still owes me money?”</span>
        <kbd className={styles.kbd}>⌘K</kbd>
      </button>
      <div className={styles.topActions}>
        <button type="button" className={styles.bell} aria-label="Notifications" onClick={() => notify("Glossier's payment is 6 days overdue")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 21h4" /></svg>
          <b />
        </button>
        {children}
      </div>
    </header>
  );
}

// `[ eyebrow ]`, the screen title, one line of context and a green status pill.
export function PageHead({ eyebrow, title, lead, badge }: { eyebrow: string; title: string; lead: ReactNode; badge?: ReactNode }) {
  return (
    <section className={styles.hello}>
      <div>
        <div className={styles.eyebrow}><span>[</span>{eyebrow}<span>]</span></div>
        <h1 className={styles.h1}>{title}</h1>
        <p className={styles.lead}>{lead}</p>
      </div>
      {badge && <span className={styles.saved}>◷ {badge}</span>}
    </section>
  );
}
