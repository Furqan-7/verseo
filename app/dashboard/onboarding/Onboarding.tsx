"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import base from "../dashboard.module.css";
import styles from "./onboarding.module.css";
import { BLUE, GREEN, Logo, PATTERNS, PURPLE, Pixels, YELLOW, cx } from "../_shell/ui";
import { ONBOARDED_COOKIE } from "../../../src/auth/demo";
import { loadSettings, saveSettings, type AccountId } from "../_shell/settings";
import { categoryCounts, goals, ideas, niches, onboardingAccounts, stats, todos } from "../data";

const STEPS = ["Connect", "About you", "First briefing"];
const BRIEFING_TIMES = ["7:00", "8:00", "9:00"];

type AccountState = "connected" | "connecting" | "connect" | "csv" | "imported" | "soon";

export default function Onboarding() {
  const router = useRouter();
  const csvInput = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [accounts, setAccounts] = useState<Record<string, AccountState>>(
    () => Object.fromEntries(onboardingAccounts.map((a) => [a.id, a.action])),
  );
  const [csvName, setCsvName] = useState<string | null>(null);
  const [niche, setNiche] = useState(niches[0]);
  const [goal, setGoal] = useState<Set<string>>(new Set([goals[0]]));
  const [briefingAt, setBriefingAt] = useState("8:00");

  const connected = onboardingAccounts.filter((a) => accounts[a.id] === "connected" || accounts[a.id] === "imported");

  // Skipping keeps the saved settings; finishing saves what was chosen here.
  function finish(save = false) {
    if (save) {
      const current = loadSettings();
      const mapped = Object.fromEntries(
        onboardingAccounts.map((a) => {
          const state = accounts[a.id];
          return [a.id, state === "connected" || state === "imported" || state === "soon" ? state : "disconnected"];
        }),
      ) as Record<AccountId, "connected" | "imported" | "soon" | "disconnected">;
      saveSettings({ ...current, niche, goals: [...goal], briefingTime: briefingAt, accounts: { ...current.accounts, ...mapped } });
    }
    document.cookie = `${ONBOARDED_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.push("/dashboard");
  }

  function connect(id: string) {
    setAccounts((s) => ({ ...s, [id]: "connecting" }));
    setTimeout(() => setAccounts((s) => ({ ...s, [id]: "connected" })), 900);
  }

  function toggleGoal(g: string) {
    setGoal((s) => {
      const next = new Set(s);
      if (next.has(g) && next.size > 1) next.delete(g);
      else next.add(g);
      return next;
    });
  }

  const briefing = [
    { color: BLUE, pattern: PATTERNS.briefing, title: "Today's to-do", detail: step === 2 ? `${todos.length} tasks from your inbox and calendar` : "From your inbox and calendar" },
    { color: GREEN, pattern: PATTERNS.inbox, title: `${stats.messagesSorted} messages sorted`, detail: "Replies drafted in your tone" },
    { color: YELLOW, pattern: PATTERNS.publish, title: `${ideas.length} ideas for today`, detail: step === 2 ? `For ${niche.toLowerCase()}, from what your audience asks` : "From what your audience asks" },
    { color: PURPLE, pattern: PATTERNS.deals, title: "Deals and payments", detail: `${categoryCounts["Brand deal"]} deals need you · risks flagged, reminders ready` },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.sky} aria-hidden="true">
        <div className={styles.grid} />
        <div className={styles.clouds} />
        <span className={styles.px} style={{ left: "12%", top: 170 }}><Pixels color="#a2e198" pattern="1010010110100101" size={7} /></span>
        <span className={styles.px} style={{ left: "30%", top: 100 }}><Pixels color="#ffcc40" pattern="1000011101000100" size={7} /></span>
        <span className={styles.px} style={{ right: "10%", top: 150 }}><Pixels color="#aeabff" pattern="1001011001101001" size={7} /></span>
      </div>

      <header className={styles.top}>
        <Link className={styles.logo} href="/" aria-label="CreatorOS home">
          <Logo className={styles.logoMark} />
          CREATOROS
        </Link>
        <ol className={styles.steps} aria-label="Setup steps">
          {STEPS.map((label, i) => (
            <li key={label} className={cx(styles.step, i === step && styles.stepNow, i < step && styles.stepDone)} aria-current={i === step ? "step" : undefined}>
              <button type="button" onClick={() => i < step && setStep(i)} disabled={i >= step}>
                <span className={styles.stepMark}>{i < step ? "✓" : i + 1}</span>
                <span className={styles.stepLabel}>{label}</span>
              </button>
            </li>
          ))}
        </ol>
        <button type="button" className={styles.skip} onClick={() => finish()}>Skip for now</button>
      </header>

      <div className={styles.body}>
        <section className={styles.card} aria-labelledby="step-title">
          <div className={base.eyebrow}><span>[</span>step {step + 1} of {STEPS.length}<span>]</span></div>

          {step === 0 && (
            <>
              <h1 id="step-title" className={styles.h1}>Connect your accounts</h1>
              <p className={styles.lead}>CreatorOS reads these to build your daily briefing. You can add more later.</p>
              <ul className={styles.accounts}>
                {onboardingAccounts.map((a) => {
                  const state = accounts[a.id];
                  return (
                    <li key={a.id}>
                      <span className={styles.mark} style={{ background: a.color }}>{a.mark}</span>
                      <span className={styles.accountText}>
                        <strong>{a.name}</strong>
                        <small>{state === "imported" && csvName ? `${csvName} imported` : a.detail}</small>
                      </span>
                      {state === "connected" || state === "imported" ? (
                        <span className={styles.connected}>✓ {state === "imported" ? "Imported" : "Connected"}</span>
                      ) : state === "connecting" ? (
                        <span className={styles.connecting}>Connecting…</span>
                      ) : state === "connect" ? (
                        <button type="button" className={cx(base.btnDark, styles.accountBtn)} onClick={() => connect(a.id)}>Connect</button>
                      ) : state === "csv" ? (
                        <button type="button" className={cx(base.btnGhost, styles.accountBtn)} onClick={() => csvInput.current?.click()}>Import CSV</button>
                      ) : (
                        <span className={base.tag}>Soon</span>
                      )}
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
                    setCsvName(file.name);
                    setAccounts((s) => ({ ...s, instagram: "imported" }));
                  }
                  e.target.value = "";
                }}
              />
              <p className={styles.note}>🔒 Read-only access. Nothing is sent, posted or booked without your approval.</p>
            </>
          )}

          {step === 1 && (
            <>
              <h1 id="step-title" className={styles.h1}>Tell us about you</h1>
              <p className={styles.lead}>Your briefing, ideas and reply tone are tuned to this. You can change it in Settings.</p>
              <fieldset className={styles.group}>
                <legend>Your niche</legend>
                <div className={styles.chips}>
                  {niches.map((n) => (
                    <button key={n} type="button" className={cx(styles.chip, niche === n && styles.chipOn)} aria-pressed={niche === n} onClick={() => setNiche(n)}>{n}</button>
                  ))}
                </div>
              </fieldset>
              <fieldset className={styles.group}>
                <legend>Your main goal <small>pick one or more</small></legend>
                <div className={styles.chips}>
                  {goals.map((g) => (
                    <button key={g} type="button" className={cx(styles.chip, goal.has(g) && styles.chipOn)} aria-pressed={goal.has(g)} onClick={() => toggleGoal(g)}>{g}</button>
                  ))}
                </div>
              </fieldset>
              <fieldset className={styles.group}>
                <legend>Send my briefing at</legend>
                <div className={styles.chips}>
                  {BRIEFING_TIMES.map((t) => (
                    <button key={t} type="button" className={cx(styles.chip, base.mono, briefingAt === t && styles.chipOn)} aria-pressed={briefingAt === t} onClick={() => setBriefingAt(t)}>{t} am</button>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          {step === 2 && (
            <>
              <h1 id="step-title" className={styles.h1}>Your first briefing is ready</h1>
              <p className={styles.lead}>Here&apos;s what CreatorOS found. It arrives every morning at {briefingAt} am.</p>
              <ul className={styles.briefing}>
                {briefing.map((b) => (
                  <li key={b.title}>
                    <Pixels color={b.color} pattern={b.pattern} size={4} />
                    <span>
                      <strong>{b.title}</strong>
                      <small>{b.detail}</small>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className={styles.actions}>
            {step === 0 ? (
              <Link className={base.btnGhost} href="/">Back</Link>
            ) : (
              <button type="button" className={base.btnGhost} onClick={() => setStep(step - 1)}>Back</button>
            )}
            <button type="button" className={cx(base.btnDark, styles.continue)} onClick={() => (step < STEPS.length - 1 ? setStep(step + 1) : finish(true))}>
              {step < STEPS.length - 1 ? "Continue" : "Open my briefing"}
            </button>
          </div>
        </section>

        <aside className={styles.side} aria-label="What happens next">
          {step === 0 && (
            <>
              <h2>Next: tell us about you</h2>
              <div className={styles.preview}>
                <span className={styles.previewLabel}>Your niche</span>
                <div className={styles.chips}>
                  {niches.map((n) => <span key={n} className={cx(styles.chip, styles.chipStatic, niche === n && styles.chipOn)}>{n}</span>)}
                </div>
                <span className={styles.previewLabel}>Your main goal</span>
                <div className={styles.chips}>
                  {goals.map((g) => <span key={g} className={cx(styles.chip, styles.chipStatic, goal.has(g) && styles.chipOn)}>{g}</span>)}
                </div>
              </div>
            </>
          )}
          {step < 2 && (
            <>
              <h2>Then your first briefing</h2>
              <ul className={cx(styles.preview, styles.briefing)}>
                {briefing.map((b) => (
                  <li key={b.title}>
                    <Pixels color={b.color} pattern={b.pattern} size={4} />
                    <span>
                      <strong>{b.title}</strong>
                      <small>{b.detail}</small>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {step === 2 && (
            <>
              <h2>Your setup</h2>
              <dl className={cx(styles.preview, styles.summary)}>
                <div><dt>Connected</dt><dd>{connected.map((a) => a.name).join(", ") || "Nothing yet"}</dd></div>
                <div><dt>Niche</dt><dd>{niche}</dd></div>
                <div><dt>Goal</dt><dd>{[...goal].join(", ")}</dd></div>
                <div><dt>Briefing</dt><dd>Every day at {briefingAt} am</dd></div>
              </dl>
              <button type="button" className={styles.sideLink} onClick={() => setStep(0)}>Connect more accounts</button>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
