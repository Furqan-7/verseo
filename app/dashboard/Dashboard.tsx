"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./dashboard.module.css";
import {
  categoryCounts,
  copilot,
  creator,
  deals,
  ideas,
  inbox,
  posts,
  stats,
  today,
  todos as initialTodos,
  type Category,
  type Todo,
} from "./data";

// Brand colours shared with the landing page's pixel icons.
const BLUE = "#2a6df4";
const GREEN = "#56c25a";
const YELLOW = "#f4c430";
const PURPLE = "#7b77e8";

const PATTERNS = {
  briefing: "1010010110100101",
  inbox: "1101011010111101",
  publish: "0110111101100100",
  deals: "1001011001101001",
};

const CATEGORY_STYLE: Record<Category, string> = {
  "Brand deal": styles.catDeal,
  Collab: styles.catCollab,
  "Fan question": styles.catFan,
  Spam: styles.catSpam,
};

function Pixels({ color, pattern, size = 3 }: { color: string; pattern: string; size?: number }) {
  return (
    <span className={styles.px} style={{ gridTemplateColumns: `repeat(4, ${size}px)` }} aria-hidden="true">
      {[...pattern].map((cell, i) => (
        <i key={i} style={{ width: size, height: size, background: cell === "1" ? color : "transparent" }} />
      ))}
    </span>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 26.722 26.733" fill="currentColor" aria-hidden="true" className={styles.logoMark}>
      <path d="M9.454 0L3.214 6.357C3.928 7.371 6.778 8.149 8.865 8.559 9.715 8.732 10.586 8.775 11.449 8.688 17.454 8.045 20.051 4.778 20.609 3.12 14.368 6.449 10.572 2.426 9.455 0Z" />
      <path d="M17.581 26.733L23.823 20.376C23.108 19.36 20.258 18.584 18.172 18.172 17.322 18 16.451 17.957 15.588 18.044 9.584 18.688 6.987 21.955 6.429 23.612 12.669 20.284 16.464 24.307 17.581 26.733Z" />
      <path d="M0 17.609L6.411 23.793C7.42 23.071 8.172 20.214 8.564 18.123 8.729 17.272 8.765 16.401 8.671 15.539 7.974 9.54 4.684 6.972 3.021 6.429 6.405 12.64 2.417 16.47 0 17.609Z" />
      <path d="M26.722 9.399L20.312 3.214C19.302 3.937 18.55 6.794 18.158 8.884 17.993 9.735 17.957 10.607 18.051 11.469 18.748 17.468 22.038 20.035 23.701 20.579 20.317 14.368 24.305 10.538 26.722 9.399Z" />
    </svg>
  );
}

function hours(minutes: number) {
  return `${(minutes / 60).toFixed(1).replace(/\.0$/, "")}h`;
}

interface DraftTarget {
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

function answerFor(question: string): string {
  const q = question.toLowerCase();
  const hit = copilot.find((a) => a.keywords.some((k) => q.includes(k)));
  if (hit) return hit.answer;
  return "In this demo I can answer questions about money owed, what's due this week, risky deals and what to post next. Try one of the suggestions below.";
}

export default function Dashboard() {
  const [todoList, setTodoList] = useState<Todo[]>(initialTodos);
  const [addedIdeas, setAddedIdeas] = useState<Set<string>>(new Set());
  const [approved, setApproved] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Category | "All">("All");
  const [minutesSaved, setMinutesSaved] = useState(today.minutesSavedThisWeek);
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

  const doneCount = todoList.filter((t) => t.done).length;
  const overdueDeal = deals.find((d) => d.overdue);
  const pendingDrafts =
    inbox.filter((m) => !approved.has(m.id)).length + (overdueDeal && !approved.has(overdueDeal.id) ? 1 : 0);
  const visibleInbox = useMemo(
    () => (filter === "All" ? inbox : inbox.filter((m) => m.category === filter)),
    [filter],
  );

  function toggleTodo(id: string) {
    setTodoList((list) => list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function addIdea(id: string, title: string) {
    if (addedIdeas.has(id)) return;
    setAddedIdeas((s) => new Set(s).add(id));
    setTodoList((list) => [...list, { id: `idea-${id}`, title: `Film: ${title}`, detail: "Added from Ideas for today", when: "Today", done: false }]);
    notify("Added to today's to-do");
  }

  function approveDraft() {
    if (!draft) return;
    setApproved((s) => new Set(s).add(draft.id));
    setMinutesSaved((m) => m + draft.minutesSaved);
    notify(draft.kind === "reminder" ? "Reminder saved to your Gmail drafts" : "Reply saved to your Gmail drafts");
    setDraft(null);
  }

  function ask(text: string) {
    const q = text.trim();
    if (!q) return;
    setChat((c) => [...c, { role: "you", text: q }, { role: "copilot", text: answerFor(q) }]);
    setQuestion("");
  }

  const nav = [
    { label: "Today", href: "#top", color: BLUE, pattern: PATTERNS.briefing, active: true },
    { label: "Inbox", href: "#inbox", color: GREEN, pattern: PATTERNS.inbox, count: stats.messagesSorted },
    { label: "Publish", href: "#publish", color: YELLOW, pattern: PATTERNS.publish },
    { label: "Deals", href: "#deals", color: PURPLE, pattern: PATTERNS.deals, count: deals.length },
  ];

  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <a className={styles.logo} href="/" aria-label="CreatorOS home">
          <Logo />
          CREATOROS
        </a>
        <nav className={styles.nav} aria-label="Workspace">
          {nav.map((item) => (
            <a key={item.label} href={item.href} className={item.active ? `${styles.navItem} ${styles.navActive}` : styles.navItem}>
              <Pixels color={item.color} pattern={item.pattern} />
              <span>{item.label}</span>
              {item.count !== undefined && <span className={styles.count}>{item.count}</span>}
            </a>
          ))}
          <div className={styles.navLabel}>Workspace</div>
          <button type="button" className={styles.navItem} onClick={() => notify("Calendar is coming next")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="3" /><path d="M3 10h18M8 2v4M16 2v4" /></svg>
            <span>Calendar</span>
          </button>
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
              <button type="button" className={styles.connAdd} onClick={() => notify("More integrations are on the way")} aria-label="Connect another account">+</button>
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

        <div className={styles.wrap}>
          <header className={styles.top}>
            <button type="button" className={styles.ask} onClick={() => setCopilotOpen(true)}>
              <span className={styles.spark}>✦</span>
              <span className={styles.askText}>Ask CreatorOS: “Who still owes me money?”</span>
              <kbd className={styles.kbd}>⌘K</kbd>
            </button>
            <div className={styles.topActions}>
              <button type="button" className={styles.bell} aria-label="Notifications" onClick={() => notify("Glossier's payment is 6 days overdue")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 21h4" /></svg>
                <b />
              </button>
              <button type="button" className={styles.btnLine} onClick={() => notify("Video upload opens the Publish flow")}>
                ＋ Upload video
              </button>
            </div>
          </header>

          <section className={styles.hello}>
            <div>
              <div className={styles.eyebrow}><span>[</span>today · {today.label}<span>]</span></div>
              <h1 className={styles.h1}>Good morning, {creator.firstName}</h1>
              <p className={styles.lead}>{today.summary}</p>
            </div>
            <span className={styles.saved}>◷ {hours(minutesSaved)} saved this week</span>
          </section>

          <section className={styles.stats} aria-label="Today at a glance">
            <div className={styles.stat}>
              <div className={styles.statKey}><Pixels color={GREEN} pattern={PATTERNS.inbox} />Messages sorted</div>
              <div className={styles.statValue}>{stats.messagesSorted}<small>since yesterday</small></div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statKey}><Pixels color={BLUE} pattern={PATTERNS.briefing} />Replies drafted</div>
              <div className={styles.statValue}>{pendingDrafts}<small>ready to approve</small></div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statKey}><Pixels color={PURPLE} pattern={PATTERNS.deals} />Deals need you</div>
              <div className={styles.statValue}>{deals.length}<small>{overdueDeal && !approved.has(overdueDeal.id) ? "1 payment overdue" : "reminder drafted"}</small></div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statKey}><Pixels color={YELLOW} pattern={PATTERNS.publish} />Posts scheduled</div>
              <div className={styles.statValue}>{stats.scheduledPosts}<small>this week</small></div>
            </div>
          </section>

          <div className={styles.cols}>
            <section className={`${styles.card} ${styles.cardRaised}`} aria-labelledby="todo-title">
              <div className={styles.cardHead}>
                <span className={styles.icon}><Pixels color={BLUE} pattern={PATTERNS.briefing} /></span>
                <h2 id="todo-title">Today&apos;s to-do</h2>
                <span className={styles.tag}>{doneCount} of {todoList.length} done</span>
              </div>
              <ul className={styles.list}>
                {todoList.map((t) => (
                  <li key={t.id} className={t.done ? `${styles.todo} ${styles.todoDone}` : styles.todo}>
                    <button
                      type="button"
                      className={t.done ? `${styles.check} ${styles.checkOn}` : styles.check}
                      onClick={() => toggleTodo(t.id)}
                      aria-pressed={t.done}
                      aria-label={`${t.done ? "Mark not done" : "Mark done"}: ${t.title}`}
                    >
                      {t.done ? "✓" : ""}
                    </button>
                    <div className={styles.todoText}>
                      <strong>{t.title}</strong>
                      <small>{t.detail}</small>
                    </div>
                    <span className={styles.when}>{t.when}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.card} id="inbox" aria-labelledby="inbox-title">
              <div className={styles.cardHead}>
                <span className={styles.icon}><Pixels color={GREEN} pattern={PATTERNS.inbox} /></span>
                <h2 id="inbox-title">Inbox, sorted for you</h2>
                <span className={styles.tag}>Gmail · YouTube · DMs</span>
              </div>
              <div className={styles.cats} role="tablist" aria-label="Filter messages">
                <button type="button" role="tab" aria-selected={filter === "All"} className={filter === "All" ? `${styles.cat} ${styles.catAll} ${styles.catOn}` : `${styles.cat} ${styles.catAll}`} onClick={() => setFilter("All")}>All</button>
                {(Object.keys(categoryCounts) as Category[]).map((c) => (
                  <button key={c} type="button" role="tab" aria-selected={filter === c} className={filter === c ? `${styles.cat} ${CATEGORY_STYLE[c]} ${styles.catOn}` : `${styles.cat} ${CATEGORY_STYLE[c]}`} onClick={() => setFilter(c)}>
                    {c === "Fan question" ? "Fans" : c} {categoryCounts[c]}
                  </button>
                ))}
              </div>
              <ul className={styles.list}>
                {visibleInbox.map((m) => (
                  <li key={m.id} className={styles.msg}>
                    <span className={styles.who} style={{ background: m.color }}>{m.initial}</span>
                    <div className={styles.msgBody}>
                      <div className={styles.msgTop}>
                        <strong>{m.from}</strong>
                        <span className={`${styles.tag} ${CATEGORY_STYLE[m.category]}`}>{m.category}</span>
                      </div>
                      <p>{m.subject}</p>
                      <div className={styles.actions}>
                        {approved.has(m.id) ? (
                          <span className={styles.savedTag}>✓ Saved to Gmail drafts</span>
                        ) : (
                          <button type="button" className={styles.miniDark} onClick={() => setDraft({ kind: "reply", id: m.id, title: "Reply draft", to: m.from, text: m.draft, minutesSaved: m.minutesSaved })}>
                            Review draft
                          </button>
                        )}
                        <button type="button" className={styles.mini} onClick={() => notify("The full Inbox view is coming next")}>Open</button>
                      </div>
                    </div>
                  </li>
                ))}
                {visibleInbox.length === 0 && (
                  <li className={styles.empty}>
                    {filter === "Spam" ? "4 spam messages were filtered out. Nothing needs you here." : `${categoryCounts[filter as Category]} more in the full Inbox.`}
                  </li>
                )}
              </ul>
            </section>

            <section className={styles.card} aria-labelledby="ideas-title">
              <div className={styles.cardHead}>
                <span className={styles.icon}><Pixels color={YELLOW} pattern={PATTERNS.publish} /></span>
                <h2 id="ideas-title">Ideas for today</h2>
                <span className={styles.tag}>from your audience</span>
              </div>
              <div className={styles.ideas}>
                {ideas.map((idea) => (
                  <div key={idea.id} className={styles.idea}>
                    <strong>{idea.title}</strong>
                    <small>{idea.why}</small>
                    <div className={styles.ideaRow}>
                      {idea.platforms.map((p) => <span key={p} className={styles.tag}>{p}</span>)}
                      <button type="button" className={addedIdeas.has(idea.id) ? `${styles.mini} ${styles.miniDone}` : styles.mini} onClick={() => addIdea(idea.id, idea.title)} disabled={addedIdeas.has(idea.id)}>
                        {addedIdeas.has(idea.id) ? "✓ Added" : "+ Add to today"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className={styles.rows}>
            <section className={styles.card} id="deals" aria-labelledby="deals-title">
              <div className={styles.cardHead}>
                <span className={styles.icon}><Pixels color={PURPLE} pattern={PATTERNS.deals} /></span>
                <h2 id="deals-title">Brand deals</h2>
                <span className={styles.tag}>{stats.expectedRevenue} expected</span>
              </div>
              <ul className={styles.list}>
                {deals.map((d) => (
                  <li key={d.id} className={styles.deal}>
                    <div>
                      <strong>{d.brand} · {d.campaign}</strong>
                      <small className={d.overdue && !approved.has(d.id) ? styles.overdue : undefined}>
                        {d.overdue && !approved.has(d.id) ? `${d.overdue.amount} · ${d.overdue.days} days overdue` : `${d.value} · ${d.detail}`}
                      </small>
                    </div>
                    <span className={styles.health} title="Deal Health">
                      {d.health}
                      <span className={styles.bar}><i style={{ width: `${d.health}%`, background: d.health >= 85 ? GREEN : d.health >= 70 ? YELLOW : "#e5574a" }} /></span>
                    </span>
                    {d.overdue && !approved.has(d.id) ? (
                      <button type="button" className={styles.miniDark} onClick={() => setDraft({ kind: "reminder", id: d.id, title: "Payment reminder", to: `${d.brand} · accounts`, text: d.overdue!.reminder, minutesSaved: 10 })}>
                        Send reminder
                      </button>
                    ) : d.overdue ? (
                      <span className={styles.savedTag}>✓ Reminder drafted</span>
                    ) : (
                      <button type="button" className={styles.mini} onClick={() => notify("Deal details are coming next")}>Open</button>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.card} id="publish" aria-labelledby="publish-title">
              <div className={styles.cardHead}>
                <span className={styles.icon}><Pixels color={YELLOW} pattern={PATTERNS.publish} /></span>
                <h2 id="publish-title">Up next</h2>
                <span className={styles.tag}>best times</span>
              </div>
              <ul className={styles.list}>
                {posts.map((p) => (
                  <li key={p.id} className={styles.post}>
                    <span className={styles.thumb} aria-hidden="true" />
                    <div>
                      <strong>{p.title} · {p.platform}</strong>
                      <small>{p.status}</small>
                    </div>
                    <span className={`${styles.tag} ${styles.mono}`}>{p.when}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
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

      <div className={copilotOpen ? `${styles.drawer} ${styles.drawerOpen}` : styles.drawer} aria-hidden={!copilotOpen}>
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
  );
}
