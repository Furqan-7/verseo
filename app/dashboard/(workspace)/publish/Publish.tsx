"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import base from "../../dashboard.module.css";
import styles from "./publish.module.css";
import { PageHead, TopBar, useShell } from "../../_shell/AppShell";
import { PATTERNS, Pixels, RefreshIcon, YELLOW, cx } from "../../_shell/ui";
import { clips, postSlots, publishPlatforms, video, type PublishPlatform } from "../../data";

const STEPS = ["Upload", "Transcript", "Clips", "Captions", "Schedule"];
const TICKS = ["0:00", "3:30", "7:00", "10:30", video.length];

// A fixed, natural-looking waveform (no randomness, so server and client match).
const WAVE = Array.from({ length: 120 }, (_, i) => {
  const v = Math.abs(Math.sin(i * 1.7) * 0.6 + Math.sin(i * 0.37) * 0.3 + Math.sin(i * 5.3) * 0.25);
  return Math.round(22 + Math.min(1, v) * 78);
});

type CaptionKey = `${string}:${PublishPlatform}`;

export default function Publish({ initialClip }: { initialClip?: string }) {
  const router = useRouter();
  const { notify, scheduledClips: scheduled, scheduleClip } = useShell();
  const fileInput = useRef<HTMLInputElement>(null);
  const [clipId, setClipId] = useState(clips.some((c) => c.id === initialClip) ? initialClip! : clips[0].id);
  const [platform, setPlatform] = useState<PublishPlatform>("reel");
  const [edits, setEdits] = useState<Record<CaptionKey, string>>({});
  const [variant, setVariant] = useState<Record<CaptionKey, number>>({});
  const [removedTags, setRemovedTags] = useState<Record<string, string[]>>({});
  const [extraTags, setExtraTags] = useState<Record<string, string[]>>({});
  const [adding, setAdding] = useState(false);
  const [newTag, setNewTag] = useState("");

  const clip = clips.find((c) => c.id === clipId)!;
  const clipNumber = clips.indexOf(clip) + 1;
  const slots = postSlots(clipNumber - 1);
  const key: CaptionKey = `${clip.id}:${platform}`;
  const options = clip.captions[platform];
  const caption = edits[key] ?? options[(variant[key] ?? 0) % options.length];
  const limit = publishPlatforms.find((p) => p.id === platform)!.limit;
  const tags = [...clip.hashtags.filter((t) => !(removedTags[clip.id] ?? []).includes(t)), ...(extraTags[clip.id] ?? [])];
  const isScheduled = scheduled.has(clip.id);
  const currentStep = isScheduled ? STEPS.length : 3;

  function pickClip(id: string) {
    setClipId(id);
    setAdding(false);
    router.replace(`/dashboard/publish?clip=${id}`, { scroll: false });
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

  function schedule() {
    scheduleClip(clip.id);
    notify(`Clip ${clipNumber} scheduled: ${slots.map((t) => `${t.label} ${t.when}`).join(", ")}`);
  }

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
            if (file) notify(`${file.name} added. Clips are ready in about 4 minutes.`);
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

      <ol className={styles.stepper} aria-label="Progress">
        {STEPS.map((step, i) => (
          <li key={step} className={cx(styles.step, i < currentStep && styles.stepDone, i === currentStep && styles.stepNow)} aria-current={i === currentStep ? "step" : undefined}>
            <span className={styles.stepMark}>{i < currentStep ? "✓" : i + 1}</span>
            {step}
          </li>
        ))}
      </ol>

      <div className={styles.layout}>
        <section className={styles.card} aria-labelledby="video-title">
          <div className={styles.videoHead}>
            <span className={base.icon}><Pixels color={YELLOW} pattern={PATTERNS.publish} /></span>
            <h2 id="video-title">{video.file}</h2>
            <span className={cx(base.tag, base.mono)}>{video.length} · {video.quality}</span>
          </div>

          <button type="button" className={styles.player} onClick={() => notify(`Playing clip ${clipNumber}: ${clip.start} – ${clip.end}`)} aria-label={`Play clip ${clipNumber}`}>
            <span className={styles.play} aria-hidden="true" />
            <span className={styles.subtitle}>“{clip.quote}”</span>
          </button>

          <div className={styles.timeline}>
            <div className={styles.wave} aria-hidden="true">
              {WAVE.map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}
            </div>
            {clips.map((c, i) => (
              <button
                key={c.id}
                type="button"
                className={cx(styles.segment, c.id === clip.id && styles.segmentOn)}
                style={{
                  left: `${(c.startSec / video.lengthSec) * 100}%`,
                  width: `max(30px, ${((c.endSec - c.startSec) / video.lengthSec) * 100}%)`,
                  borderColor: c.color,
                  background: `${c.color}1f`,
                }}
                onClick={() => pickClip(c.id)}
                aria-label={`Clip ${i + 1}: ${c.start} to ${c.end}`}
              >
                <span style={{ background: c.color }}>{i + 1}</span>
              </button>
            ))}
          </div>
          <div className={styles.ticks} aria-hidden="true">
            {TICKS.map((t) => <span key={t}>{t}</span>)}
          </div>

          <ul className={styles.clips}>
            {clips.map((c, i) => (
              <li key={c.id}>
                <button type="button" className={cx(styles.clip, c.id === clip.id && styles.clipOn)} onClick={() => pickClip(c.id)}>
                  <span className={styles.clipNum} style={{ background: c.color }}>{i + 1}</span>
                  <span className={styles.clipText}>
                    <strong>{c.title}</strong>
                    <small>{c.start} – {c.end} · {c.why}</small>
                  </span>
                  {scheduled.has(c.id) && <span className={base.tag}>scheduled</span>}
                  <span className={styles.hook}>hook {c.hook}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.card} aria-labelledby="captions-title">
          <div className={styles.capHead}>
            <h2 id="captions-title">Clip {clipNumber} · captions for each platform</h2>
            <span className={base.tag}>written in your tone</span>
          </div>

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
              <span className={base.savedTag}>✓ {slots.length} posts scheduled</span>
            ) : (
              <>
                <button type="button" className={base.btnGhost} onClick={rewrite}><RefreshIcon /> Rewrite</button>
                <button type="button" className={base.btnDark} onClick={schedule}>Approve and schedule {slots.length} posts</button>
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
