"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import base from "../../dashboard.module.css";
import styles from "./deals.module.css";
import { PageHead, TopBar, useShell } from "../../_shell/AppShell";
import { cx, healthColor } from "../../_shell/ui";
import { HEALTH_MAX, boardDeals, dealStages, deals, inboxThreads, isoFromLabel, type BoardDeal } from "../../data";

const HEALTH_ROWS: { key: keyof BoardDeal["health"]; label: string }[] = [
  { key: "financial", label: "Financial" },
  { key: "deadline", label: "Deadline" },
  { key: "contract", label: "Contract" },
  { key: "scope", label: "Scope" },
];

function score(deal: BoardDeal) {
  const h = deal.health;
  return h.financial + h.deadline + h.contract + h.scope;
}

function money(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : `$${n}`;
}

export default function Deals({ initialSlug }: { initialSlug?: string }) {
  const router = useRouter();
  const { notify, openDraft, approved, dealsInCalendar: inCalendar, addDealToCalendar } = useShell();
  const fileInput = useRef<HTMLInputElement>(null);
  const [slug, setSlug] = useState(boardDeals.some((d) => d.slug === initialSlug) ? initialSlug! : "nike");
  const [done, setDone] = useState<Record<string, boolean>>({});

  const deal = boardDeals.find((d) => d.slug === slug)!;
  const total = boardDeals.reduce((sum, d) => sum + d.amount, 0);
  const reminder = deals.find((d) => d.overdue)!;
  const reminderSaved = approved.has(reminder.id);
  const replyId = deal.replyId ?? `deal-${deal.slug}`;

  function select(next: string) {
    setSlug(next);
    router.replace(`/dashboard/deals?deal=${next}`, { scroll: false });
  }

  function draftReply() {
    if (deal.replyId === reminder.id) {
      openDraft({ kind: "reminder", id: reminder.id, title: "Payment reminder", to: `${reminder.brand} · accounts`, text: reminder.overdue!.reminder, minutesSaved: 10 });
      return;
    }
    const thread = inboxThreads.find((t) => t.id === deal.replyId);
    const fixes = deal.risks.map((r) => `- ${r.fix}`).join("\n");
    openDraft({
      kind: "reply",
      id: replyId,
      title: `Reply to ${deal.brand}`,
      to: thread?.from ?? `${deal.brand} · partnerships`,
      text: thread?.drafts
        ? thread.drafts.Friendly.replace(/==/g, "")
        : `Hi ${deal.brand} team,\n\nThanks for the ${deal.campaign.toLowerCase()} offer! ${
            fixes ? `Before I sign, could we update a few points?\n\n${fixes}\n\n` : "Everything looks good on my side. "
          }Looking forward to it.\n\nBest,\nMaya`,
      minutesSaved: 8,
    });
  }

  function addToCalendar() {
    addDealToCalendar(deal.slug);
    notify(`${deal.deliverables.length} ${deal.brand} deadlines added to your calendar`);
  }

  const isDone = (id: string, fallback: boolean) => done[id] ?? fallback;
  const total100 = score(deal);
  const replyLabel = deal.replyId === reminder.id ? "Send payment reminder" : deal.risks.length ? "Draft reply with fixes" : "Draft reply";
  const replyDone = approved.has(replyId);

  return (
    <>
      <TopBar>
        <button type="button" className={base.btnDark} onClick={() => fileInput.current?.click()}>＋ Upload contract</button>
        <input
          ref={fileInput}
          type="file"
          accept=".pdf,.doc,.docx"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) notify(`${file.name} uploaded. CreatorOS is reading the terms.`);
            e.target.value = "";
          }}
        />
      </TopBar>

      <PageHead
        eyebrow="deals"
        title="Brand deals"
        lead={`${boardDeals.length} active deals worth ${money(total)}. Nike needs a reply and ${
          reminderSaved ? "Glossier's reminder is in your drafts." : "Glossier's payment is overdue."
        }`}
        badge={reminderSaved ? "reminder saved to Gmail drafts" : `${reminder.overdue!.amount} overdue · reminder ready`}
      />

      <div className={styles.layout}>
        <div className={styles.board} role="list" aria-label="Deal pipeline">
          {dealStages.map(({ stage, color }) => {
            const inStage = boardDeals.filter((d) => d.stage === stage);
            return (
              <section key={stage} className={styles.column} role="listitem" aria-label={stage}>
                <div className={styles.columnHead}>
                  <span className={styles.stageDot} style={{ background: color }} />
                  <strong>{stage}</strong>
                  <span>{inStage.length}</span>
                </div>
                {inStage.map((d) => {
                  const s = score(d);
                  const reminderNote = d.replyId === reminder.id && reminderSaved;
                  return (
                    <button
                      key={d.slug}
                      type="button"
                      className={cx(styles.dealCard, d.slug === slug && styles.dealOn)}
                      onClick={() => select(d.slug)}
                      aria-pressed={d.slug === slug}
                    >
                      <span className={styles.brand}>
                        <span className={styles.brandMark} style={{ background: d.color }}>{d.initial}</span>
                        {d.brand}
                      </span>
                      <small className={styles.dealNote}>{d.note}</small>
                      {d.alert && (
                        <small className={d.alert.tone === "bad" && !reminderNote ? styles.alertBad : styles.alertWarn}>
                          {reminderNote ? "6 days overdue · reminder saved" : d.alert.text}
                        </small>
                      )}
                      <span className={styles.dealFoot}>
                        <span className={base.mono}>{s}</span>
                        <span className={styles.miniBar}><i style={{ width: `${s}%`, background: healthColor(s) }} /></span>
                        <strong>{d.value}</strong>
                      </span>
                    </button>
                  );
                })}
              </section>
            );
          })}
        </div>

        <aside className={styles.panel} aria-labelledby="deal-title">
          <div className={styles.panelHead}>
            <div className={styles.chips}>
              <span className={cx(base.tag, styles.stageTag)} style={{ background: `${dealStages.find((s) => s.stage === deal.stage)!.color}33` }}>{deal.stage}</span>
              <span className={base.tag}>{deal.source}</span>
            </div>
            <h2 id="deal-title" className={styles.title}>{deal.brand} · {deal.campaign}</h2>
            <p className={styles.sub}>{deal.summary}</p>
          </div>

          <div className={styles.block}>
            <div className={styles.blockHead}>
              <h3>Deal health</h3>
              <span className={base.tag}>rule-based score</span>
            </div>
            <div className={styles.health}>
              <div className={styles.dial} role="img" aria-label={`Deal Health ${total100} out of 100`}>
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#f0f0f0" strokeWidth="7" />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="#181818"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={`${(total100 / 100) * 276.46} 276.46`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <span><strong>{total100}</strong><small>/100</small></span>
              </div>
              <ul className={styles.rows}>
                {HEALTH_ROWS.map(({ key, label }) => {
                  const value = deal.health[key];
                  const max = HEALTH_MAX[key];
                  return (
                    <li key={key}>
                      <span>{label}</span>
                      <span className={styles.rowBar}><i style={{ width: `${(value / max) * 100}%`, background: healthColor(value, max) }} /></span>
                      <span className={base.mono}>{value}/{max}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className={styles.block}>
            <h3 className={styles.blockTitle}>Extracted terms</h3>
            <dl className={styles.terms}>
              {deal.terms.map((t) => (
                <div key={t.label}>
                  <dt>{t.label}</dt>
                  <dd>
                    <span className={t.missing ? styles.missing : undefined}>{t.value}</span>
                    {t.clause && <small className={base.mono}>{t.clause}</small>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className={styles.block}>
            <h3 className={styles.blockTitle}>
              {deal.risks.length === 0 ? "No risks found" : `${deal.risks.length} ${deal.risks.length === 1 ? "risk" : "risks"} to fix${deal.stage === "New offer" || deal.stage === "Negotiating" ? " before signing" : ""}`}
            </h3>
            {deal.risks.length === 0 ? (
              <p className={styles.clean}>✓ Payment terms, revisions and usage rights all look standard.</p>
            ) : (
              <ul className={styles.risks}>
                {deal.risks.map((r) => (
                  <li key={r.title}>
                    <strong>{r.title}</strong>
                    <span>{r.fix}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.block}>
            <h3 className={styles.blockTitle}>Deliverables</h3>
            <ul className={styles.deliverables}>
              {deal.deliverables.map((d) => {
                const checked = isDone(d.id, d.done);
                return (
                  <li key={d.id}>
                    <label>
                      <input type="checkbox" checked={checked} onChange={() => setDone((s) => ({ ...s, [d.id]: !checked }))} />
                      <span className={checked ? styles.doneText : undefined}>{d.title}</span>
                    </label>
                    <span className={base.mono}>{d.date}{checked ? " ✓" : ""}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className={styles.actions}>
            {inCalendar.has(deal.slug) ? (
              <Link className={cx(base.savedTag, styles.actionTag)} href={`/dashboard/calendar?date=${isoFromLabel(deal.deliverables.find((d) => !d.done)?.date ?? deal.deliverables[0].date)}`}>✓ In your calendar →</Link>
            ) : (
              <button type="button" className={base.btnGhost} onClick={addToCalendar}>Add to calendar</button>
            )}
            {replyDone ? (
              <span className={cx(base.savedTag, styles.actionTag)}>✓ Saved to Gmail drafts</span>
            ) : (
              <button type="button" className={base.btnDark} onClick={draftReply}>{replyLabel}</button>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
