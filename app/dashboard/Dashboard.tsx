"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./dashboard.module.css";
import { PageHead, TopBar, useShell } from "./_shell/AppShell";
import { withSignOff } from "./_shell/settings";
import { EmptyState, ReconnectBanner } from "./_shell/states";
import { BLUE, CATEGORY_STYLE, GREEN, PATTERNS, PURPLE, Pixels, YELLOW, healthColor, hours } from "./_shell/ui";
import {
  categoryCounts,
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

export default function Dashboard() {
  const { notify, openDraft, approved, minutesSaved, settings } = useShell();
  const [todoList, setTodoList] = useState<Todo[]>(initialTodos);
  const [addedIdeas, setAddedIdeas] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Category | "All">("All");

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

  return (
    <>
      <TopBar>
        <Link className={styles.btnLine} href="/dashboard/publish">＋ Upload video</Link>
      </TopBar>

      <PageHead
        eyebrow={`today · ${today.label}`}
        title={`Good morning, ${settings.name.trim().split(" ")[0] || creator.firstName}`}
        lead={today.summary}
        badge={`${hours(minutesSaved)} saved this week`}
      />
      <ReconnectBanner accounts={["gmail", "youtube"]} />

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
          {doneCount === todoList.length && (
            <EmptyState compact title="All done for today" color={BLUE} pattern={PATTERNS.briefing}>
              Nice work. Add an idea below, or plan tomorrow in Calendar.
            </EmptyState>
          )}
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
                      <button type="button" className={styles.miniDark} onClick={() => openDraft({ kind: "reply", id: m.id, title: "Reply draft", to: m.from, text: withSignOff(m.draft, settings.signOff), minutesSaved: m.minutesSaved })}>
                        Review draft
                      </button>
                    )}
                    <Link className={styles.mini} href={`/dashboard/inbox?m=${m.id}`}>Open</Link>
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
                  <span className={styles.bar}><i style={{ width: `${d.health}%`, background: healthColor(d.health) }} /></span>
                </span>
                {d.overdue && !approved.has(d.id) ? (
                  <button type="button" className={styles.miniDark} onClick={() => openDraft({ kind: "reminder", id: d.id, title: "Payment reminder", to: `${d.brand} · accounts`, text: d.overdue!.reminder, minutesSaved: 10 })}>
                    Send reminder
                  </button>
                ) : d.overdue ? (
                  <span className={styles.savedTag}>✓ Reminder drafted</span>
                ) : (
                  <Link className={styles.mini} href={`/dashboard/deals?deal=${d.slug}`}>Open</Link>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.card} id="publish" aria-labelledby="publish-title">
          <div className={styles.cardHead}>
            <span className={styles.icon}><Pixels color={YELLOW} pattern={PATTERNS.publish} /></span>
            <h2 id="publish-title">Up next</h2>
            <Link className={styles.tag} href="/dashboard/calendar">Open calendar →</Link>
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
    </>
  );
}
