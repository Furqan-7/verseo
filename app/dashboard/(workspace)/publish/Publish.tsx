"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import base from "../../dashboard.module.css";
import styles from "./publish.module.css";
import { PageHead, TopBar, useShell } from "../../_shell/AppShell";
import { ReconnectBanner } from "../../_shell/states";
import { PATTERNS, Pixels, RefreshIcon, YELLOW, cx } from "../../_shell/ui";
import { clips, postSlots, publishPlatforms, transcript, video, type Clip, type PublishPlatform } from "../../data";

const STEPS = ["Upload", "Transcript", "Clips", "Captions", "Schedule"];
const TICKS = ["0:00", "3:30", "7:00", "10:30", video.length];
// Longest clip each platform accepts, in seconds.
const MAX_LENGTH: Record<PublishPlatform, number> = { reel: 90, short: 60, tiktok: 600 };

// A fixed, natural-looking waveform (no randomness, so server and client match).
const WAVE = Array.from({ length: 120 }, (_, i) => {
  const v = Math.abs(Math.sin(i * 1.7) * 0.6 + Math.sin(i * 0.37) * 0.3 + Math.sin(i * 5.3) * 0.25);
  return Math.round(22 + Math.min(1, v) * 78);
});

type CaptionKey = `${string}:${PublishPlatform}`;
type Upload = { name: string; progress: number; phase: "uploading" | "transcribing" } | null;

function mmss(sec: number) {
  return `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, "0")}`;
}

export default function Publish({ initialClip }: { initialClip?: string }) {
  const router = useRouter();
  const { notify, scheduledClips: scheduled, scheduleClip } = useShell();
  const fileInput = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(3);
  const [reached, setReached] = useState(3);
  const [upload, setUpload] = useState<Upload>(null);
  const [fileName, setFileName] = useState(video.file);
  const [dragging, setDragging] = useState(false);
  const [query, setQuery] = useState("");
  const [trims, setTrims] = useState<Record<string, { start: number; end: number }>>({});
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [clipId, setClipId] = useState(clips.some((c) => c.id === initialClip) ? initialClip! : clips[0].id);
  const [platform, setPlatform] = useState<PublishPlatform>("reel");
  const [edits, setEdits] = useState<Record<CaptionKey, string>>({});
  const [variant, setVariant] = useState<Record<CaptionKey, number>>({});
  const [removedTags, setRemovedTags] = useState<Record<string, string[]>>({});
  const [extraTags, setExtraTags] = useState<Record<string, string[]>>({});
  const [adding, setAdding] = useState(false);
  const [newTag, setNewTag] = useState("");

  // Steps the simulated upload, then transcription, then opens the Transcript.
  useEffect(() => {
    if (!upload) return;
    const t = setTimeout(() => {
      if (upload.progress < 100) {
        setUpload({ ...upload, progress: Math.min(100, upload.progress + (upload.phase === "uploading" ? 7 : 12)) });
      } else if (upload.phase === "uploading") {
        setUpload({ ...upload, phase: "transcribing", progress: 0 });
      } else {
        setUpload(null);
        setStep(1);
        setReached(1);
        notify(`${upload.name}: transcript ready and ${clips.length} clips found`);
      }
    }, 120);
    return () => clearTimeout(t);
  }, [upload, notify]);

  const span = (c: Clip) => trims[c.id] ?? { start: c.startSec, end: c.endSec };
  const kept = clips.filter((c) => !skipped.has(c.id));
  const clip = clips.find((c) => c.id === clipId)!;
  const clipNumber = clips.indexOf(clip) + 1;
  const slots = postSlots(clipNumber - 1);
  const key: CaptionKey = `${clip.id}:${platform}`;
  const options = clip.captions[platform];
  const caption = edits[key] ?? options[(variant[key] ?? 0) % options.length];
  const limit = publishPlatforms.find((p) => p.id === platform)!.limit;
  const tags = [...clip.hashtags.filter((t) => !(removedTags[clip.id] ?? []).includes(t)), ...(extraTags[clip.id] ?? [])];
  const isScheduled = scheduled.has(clip.id);
  const allScheduled = kept.length > 0 && kept.every((c) => scheduled.has(c.id));
  const { start, end } = span(clip);

  function go(next: number) {
    setStep(next);
    setReached((r) => Math.max(r, next));
  }

  function pickClip(id: string) {
    setClipId(id);
    setAdding(false);
    router.replace(`/dashboard/publish?clip=${id}`, { scroll: false });
  }

  // A simulated upload; the effect above moves it along.
  function startUpload(name: string) {
    setFileName(name);
    setStep(0);
    setReached(0);
    setUpload({ name, progress: 0, phase: "uploading" });
  }

  function nudge(edge: "start" | "end", by: number) {
    const s = span(clip);
    const next = { ...s, [edge]: s[edge] + by };
    if (next.end - next.start < 5 || next.start < 0 || next.end > video.lengthSec) return;
    setTrims((t) => ({ ...t, [clip.id]: next }));
  }

  function toggleKeep() {
    setSkipped((s) => {
      const next = new Set(s);
      if (next.has(clip.id)) next.delete(clip.id);
      else next.add(clip.id);
      return next;
    });
  }

  function rewrite() {
    setEdits((e) => {
      const next = { ...e };
      delete next[key];
      return next;
    });
    setVariant((v) => ({ ...v, [key]: (v[key] ?? 0) + 1 }));
    notify(`New ${publishPlatforms.find((p) => p.id === platform)!.label} caption, written in your tone`);
  }

  function addTag() {
    const clean = newTag.trim().replace(/^#*/, "").replace(/\s+/g, "");
    if (clean) {
      const tag = `#${clean.toLowerCase()}`;
      if (!tags.includes(tag)) setExtraTags((s) => ({ ...s, [clip.id]: [...(s[clip.id] ?? []), tag] }));
    }
    setNewTag("");
    setAdding(false);
  }

  function removeTag(tag: string) {
    if (clip.hashtags.includes(tag)) {
      setRemovedTags((s) => ({ ...s, [clip.id]: [...(s[clip.id] ?? []), tag] }));
    } else {
      setExtraTags((s) => ({ ...s, [clip.id]: (s[clip.id] ?? []).filter((t) => t !== tag) }));
    }
  }

  function schedule(c: Clip = clip) {
    scheduleClip(c.id);
    const n = clips.indexOf(c) + 1;
    notify(`Clip ${n} scheduled: ${postSlots(n - 1).map((t) => `${t.label} ${t.when}`).join(", ")}`);
    setReached((r) => Math.max(r, 4));
  }

  const stepDone = (i: number) => (i === 4 ? allScheduled : i < reached && !(i === 0 && upload));

  const videoCard = (
    <section className={styles.card} aria-labelledby="video-title">
      <div className={styles.videoHead}>
        <span className={base.icon}><Pixels color={YELLOW} pattern={PATTERNS.publish} /></span>
        <h2 id="video-title">{fileName}</h2>
        <span className={cx(base.tag, base.mono)}>{video.length} · {video.quality}</span>
      </div>

      <button type="button" className={styles.player} onClick={() => notify(`Playing clip ${clipNumber}: ${mmss(start)} – ${mmss(end)}`)} aria-label={`Play clip ${clipNumber}`}>
        <span className={styles.play} aria-hidden="true" />
        <span className={styles.subtitle}>“{clip.quote}”</span>
      </button>

      <div className={styles.timeline}>
        <div className={styles.wave} aria-hidden="true">
          {WAVE.map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}
        </div>
        {clips.map((c, i) => {
          const s = span(c);
          return (
            <button
              key={c.id}
              type="button"
              className={cx(styles.segment, c.id === clip.id && styles.segmentOn, skipped.has(c.id) && styles.segmentOff)}
              style={{
                left: `${(s.start / video.lengthSec) * 100}%`,
                width: `max(30px, ${((s.end - s.start) / video.lengthSec) * 100}%)`,
                borderColor: c.color,
                background: `${c.color}1f`,
              }}
              onClick={() => pickClip(c.id)}
              aria-label={`Clip ${i + 1}: ${mmss(s.start)} to ${mmss(s.end)}`}
            >
              <span style={{ background: c.color }}>{i + 1}</span>
            </button>
          );
        })}
      </div>
      <div className={styles.ticks} aria-hidden="true">
        {TICKS.map((t) => <span key={t}>{t}</span>)}
      </div>

      <ul className={styles.clips}>
        {clips.map((c, i) => {
          const s = span(c);
          return (
            <li key={c.id}>
              <button type="button" className={cx(styles.clip, c.id === clip.id && styles.clipOn, skipped.has(c.id) && styles.clipOff)} onClick={() => pickClip(c.id)}>
                <span className={styles.clipNum} style={{ background: c.color }}>{i + 1}</span>
                <span className={styles.clipText}>
                  <strong>{c.title}</strong>
                  <small>{mmss(s.start)} – {mmss(s.end)} · {skipped.has(c.id) ? "skipped" : c.why}</small>
                </span>
                {scheduled.has(c.id) && <span className={base.tag}>scheduled</span>}
                <span className={styles.hook}>hook {c.hook}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );

  return (
    <>
      <TopBar>
        <button type="button" className={base.btnDark} onClick={() => fileInput.current?.click()}>＋ Upload video</button>
        <input
          ref={fileInput}
          type="file"
          accept="video/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) startUpload(file.name);
            e.target.value = "";
          }}
        />
      </TopBar>

      <PageHead
        eyebrow="publish"
        title="Create once, publish everywhere"
        lead={`One 14-minute vlog became ${clips.length} clips with captions for every platform.`}
        badge={`${video.minutesSavedPerClip} min saved per clip`}
      />
      <ReconnectBanner accounts={["youtube"]} />

      <ol className={styles.stepper} aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label} className={cx(styles.step, stepDone(i) && styles.stepDone, i === step && styles.stepNow)} aria-current={i === step ? "step" : undefined}>
            <button type="button" onClick={() => setStep(i)} disabled={i > reached || Boolean(upload)}>
              <span className={styles.stepMark}>{stepDone(i) && i !== step ? "✓" : i + 1}</span>
              {label}
            </button>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <section className={cx(styles.card, styles.single)} aria-label="Upload">
          {upload ? (
            <div className={styles.progress}>
              <strong>{upload.phase === "uploading" ? `Uploading ${upload.name}` : "Transcribing and finding clips"}</strong>
              <span className={styles.bar}><i style={{ width: `${upload.progress}%` }} /></span>
              <small>
                {upload.phase === "uploading"
                  ? `${upload.progress}% · you can leave this page, it keeps going`
                  : "Listening for strong hooks, questions your audience asked and quick payoffs"}
              </small>
            </div>
          ) : (
            <div
              className={cx(styles.drop, dragging && styles.dropOn)}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) startUpload(file.name);
              }}
            >
              <span className={styles.dropIcon}><Pixels color={YELLOW} pattern={PATTERNS.publish} size={5} /></span>
              <strong>Drop a video here</strong>
              <small>MP4 or MOV, up to 4 GB. CreatorOS transcribes it and suggests clips for Reels, Shorts and TikTok.</small>
              <div className={styles.dropActions}>
                <button type="button" className={base.btnDark} onClick={() => fileInput.current?.click()}>Choose a file</button>
                <button type="button" className={base.btnGhost} onClick={() => startUpload(video.file)}>Use the demo vlog</button>
              </div>
            </div>
          )}
        </section>
      )}

      {step === 1 && (
        <section className={cx(styles.card, styles.single)} aria-labelledby="transcript-title">
          <div className={styles.capHead}>
            <h2 id="transcript-title">Transcript · {fileName}</h2>
            <span className={base.tag}>{transcript.length} lines · {video.length}</span>
          </div>
          <label className={styles.search}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the transcript" aria-label="Search the transcript" />
          </label>
          <ol className={styles.lines}>
            {transcript
              .filter((l) => !query.trim() || l.text.toLowerCase().includes(query.trim().toLowerCase()))
              .map((l) => {
                const inClip = clips.find((c) => l.sec >= span(c).start && l.sec <= span(c).end);
                return (
                  <li key={l.sec} style={inClip ? { background: `${inClip.color}14`, boxShadow: `inset 3px 0 0 ${inClip.color}` } : undefined}>
                    <time className={base.mono}>{mmss(l.sec)}</time>
                    <span>{l.text}</span>
                    {inClip && <span className={styles.lineTag} style={{ color: inClip.color }}>clip {clips.indexOf(inClip) + 1}</span>}
                  </li>
                );
              })}
          </ol>
          <div className={styles.foot}>
            <span className={styles.note}>Tinted lines are where CreatorOS found clips.</span>
            <button type="button" className={base.btnDark} onClick={() => go(2)}>Review {clips.length} clips →</button>
          </div>
        </section>
      )}

      {(step === 2 || step === 3) && (
        <div className={styles.layout}>
          {videoCard}

          {step === 2 ? (
            <section className={styles.card} aria-labelledby="trim-title">
              <div className={styles.capHead}>
                <h2 id="trim-title">Clip {clipNumber} · {clip.title.replace(/[“”]/g, "")}</h2>
                <span className={styles.hook}>hook {clip.hook}</span>
              </div>
              <p className={styles.why}>Why this clip: {clip.why}.</p>

              <div className={styles.trim}>
                {(["start", "end"] as const).map((edge) => (
                  <div key={edge} className={styles.trimBox}>
                    <span>{edge === "start" ? "Starts" : "Ends"}</span>
                    <strong className={base.mono}>{mmss(span(clip)[edge])}</strong>
                    <div className={styles.nudges}>
                      <button type="button" className={base.mini} onClick={() => nudge(edge, -1)} aria-label={`${edge} one second earlier`}>−1s</button>
                      <button type="button" className={base.mini} onClick={() => nudge(edge, 1)} aria-label={`${edge} one second later`}>+1s</button>
                    </div>
                  </div>
                ))}
                <div className={styles.trimBox}>
                  <span>Length</span>
                  <strong className={base.mono}>{end - start}s</strong>
                  <small>{trims[clip.id] ? "trimmed by you" : "as suggested"}</small>
                </div>
              </div>

              <div className={styles.fieldHead}><span>Fits</span></div>
              <ul className={styles.fits}>
                {publishPlatforms.map((p) => {
                  const ok = end - start <= MAX_LENGTH[p.id];
                  return (
                    <li key={p.id}>
                      <span className={styles.swatch} style={{ background: p.swatch }} />
                      {p.label}
                      <span className={ok ? styles.fitOk : styles.fitBad}>{ok ? "✓ fits" : `over ${MAX_LENGTH[p.id]}s`}</span>
                    </li>
                  );
                })}
              </ul>

              <div className={styles.foot}>
                <button type="button" className={base.btnGhost} onClick={toggleKeep}>{skipped.has(clip.id) ? "Keep this clip" : "Skip this clip"}</button>
                {trims[clip.id] && (
                  <button type="button" className={base.btnGhost} onClick={() => setTrims(({ [clip.id]: _, ...rest }) => rest)}>Reset times</button>
                )}
                <button type="button" className={base.btnDark} onClick={() => { if (skipped.has(clip.id) && kept[0]) pickClip(kept[0].id); go(3); }} disabled={kept.length === 0}>
                  Write captions for {kept.length} {kept.length === 1 ? "clip" : "clips"} →
                </button>
              </div>
            </section>
          ) : (
            <section className={styles.card} aria-labelledby="captions-title">
              <div className={styles.capHead}>
                <h2 id="captions-title">Clip {clipNumber} · captions for each platform</h2>
                <span className={base.tag}>written in your tone</span>
              </div>

              {skipped.has(clip.id) ? (
                <p className={styles.why}>This clip is skipped. Pick another clip, or keep it again in the Clips step.</p>
              ) : (
                <>
                  <div className={styles.platforms} role="tablist" aria-label="Platform">
                    {publishPlatforms.map((p) => (
                      <button key={p.id} type="button" role="tab" aria-selected={platform === p.id} className={cx(styles.platform, platform === p.id && styles.platformOn)} onClick={() => setPlatform(p.id)}>
                        <span className={styles.swatch} style={{ background: p.swatch }} />
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <div className={styles.fieldHead}>
                    <label htmlFor="caption">Caption</label>
                    <span className={cx(styles.counter, caption.length > limit && styles.over)}>{caption.length.toLocaleString("en-US")} / {limit.toLocaleString("en-US")}</span>
                  </div>
                  <textarea
                    id="caption"
                    className={styles.caption}
                    value={caption}
                    onChange={(e) => setEdits((s) => ({ ...s, [key]: e.target.value }))}
                    rows={4}
                    disabled={isScheduled}
                  />

                  <div className={styles.fieldHead}>
                    <span>Hashtags</span>
                    <span className={styles.counter}>{clip.hashtags.length} suggested</span>
                  </div>
                  <div className={styles.tags}>
                    {tags.map((t) => (
                      <button key={t} type="button" className={styles.hashtag} onClick={() => removeTag(t)} disabled={isScheduled} title={`Remove ${t}`}>
                        {t}
                      </button>
                    ))}
                    {adding ? (
                      <form className={styles.addForm} onSubmit={(e) => { e.preventDefault(); addTag(); }}>
                        <input autoFocus value={newTag} onChange={(e) => setNewTag(e.target.value)} onBlur={addTag} placeholder="#hashtag" aria-label="New hashtag" />
                      </form>
                    ) : (
                      !isScheduled && <button type="button" className={styles.addTag} onClick={() => setAdding(true)}>+ add</button>
                    )}
                  </div>

                  <div className={styles.fieldHead}>
                    <span>Best times to post</span>
                    <span className={styles.counter}>from your last 30 days</span>
                  </div>
                  <div className={styles.times}>
                    {slots.map((t) => (
                      <div key={t.platform} className={cx(styles.time, t.platform === platform && styles.timeOn)}>
                        <strong>
                          <span className={styles.swatchSmall} style={{ background: publishPlatforms.find((p) => p.id === t.platform)!.swatch }} />
                          {t.label}
                        </strong>
                        <span className={base.mono}>{t.when}</span>
                        <small>{t.why}</small>
                      </div>
                    ))}
                  </div>

                  <div className={styles.foot}>
                    <span className={styles.note}>{isScheduled ? "Scheduled. Every post is now in your calendar." : "Nothing posts until you approve."}</span>
                    {isScheduled ? (
                      <>
                        <span className={base.savedTag}>✓ {slots.length} posts scheduled</span>
                        <button type="button" className={base.btnGhost} onClick={() => go(4)}>See schedule →</button>
                      </>
                    ) : (
                      <>
                        <button type="button" className={base.btnGhost} onClick={rewrite}><RefreshIcon /> Rewrite</button>
                        <button type="button" className={base.btnDark} onClick={() => schedule()}>Approve and schedule {slots.length} posts</button>
                      </>
                    )}
                  </div>
                </>
              )}
            </section>
          )}
        </div>
      )}

      {step === 4 && (
        <section className={cx(styles.card, styles.single)} aria-labelledby="schedule-title">
          <div className={styles.capHead}>
            <h2 id="schedule-title">Schedule</h2>
            <span className={base.tag}>{kept.filter((c) => scheduled.has(c.id)).length} of {kept.length} clips scheduled</span>
          </div>
          <ul className={styles.schedule}>
            {kept.map((c) => {
              const n = clips.indexOf(c) + 1;
              const done = scheduled.has(c.id);
              return (
                <li key={c.id}>
                  <span className={styles.clipNum} style={{ background: c.color }}>{n}</span>
                  <span className={styles.clipText}>
                    <strong>{c.short}</strong>
                    <small>{postSlots(n - 1).map((s) => `${s.label} ${s.when}`).join(" · ")}</small>
                  </span>
                  {done ? (
                    <span className={base.savedTag}>✓ Scheduled</span>
                  ) : (
                    <>
                      <button type="button" className={base.mini} onClick={() => { pickClip(c.id); setStep(3); }}>Review captions</button>
                      <button type="button" className={base.miniDark} onClick={() => schedule(c)}>Approve</button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
          <div className={styles.foot}>
            <span className={styles.note}>Scheduled posts appear in your calendar and go out at these times.</span>
            <Link className={base.btnGhost} href={`/dashboard/calendar?date=${postSlots(0)[0].date}`}>Open calendar →</Link>
          </div>
        </section>
      )}
    </>
  );
}
