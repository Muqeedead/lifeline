import { useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

/** rAF typewriter */
function useTypewriter() {
  const cancelRef = useRef<null | (() => void)>(null);

  function typeText(
    el: HTMLElement | null,
    text: string,
    cps = 36,
    opts?: { scrollContainer?: HTMLElement | null; autoScroll?: boolean; reducedMotion?: boolean }
  ) {
    if (!el) return () => {};
    const scrollContainer = opts?.scrollContainer ?? null;
    const autoScroll = opts?.autoScroll ?? false;
    const reducedMotion = opts?.reducedMotion ?? false;

    if (reducedMotion) {
      el.textContent = text;
      if (autoScroll && scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
      return () => {};
    }

    el.textContent = "";
    let i = 0;
    let cancelled = false;

    const charsPerMs = cps / 1000;
    let last = performance.now();
    let carry = 0;
    let pauseUntil = 0;

    const pauseFor = (ch: string) => {
      if (ch === "." || ch === "!" || ch === "?") return 180;
      if (ch === ",") return 90;
      if (ch === "\n") return 180;
      return 0;
    };

    const nearBottom = () => {
      if (!scrollContainer) return true;
      return (
        scrollContainer.scrollTop + scrollContainer.clientHeight >=
        scrollContainer.scrollHeight - 28
      );
    };

    const step = (now: number) => {
      if (cancelled) return;

      const dt = now - last;
      last = now;

      if (now < pauseUntil) {
        requestAnimationFrame(step);
        return;
      }

      carry += dt * charsPerMs;

      const toAdd = Math.min(10, Math.floor(carry));
      if (toAdd > 0) {
        carry -= toAdd;

        const next = text.slice(i, i + toAdd);
        i += toAdd;

        el.textContent += next;

        const lastCh = next[next.length - 1];
        const p = pauseFor(lastCh);
        if (p) pauseUntil = now + p;

        if (autoScroll && scrollContainer && nearBottom()) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }

      if (i >= text.length) return;
      requestAnimationFrame(step);
    };

    requestAnimationFrame(step);

    return () => {
      cancelled = true;
    };
  }

  const cancel = () => {
    cancelRef.current?.();
    cancelRef.current = null;
  };

  const start = (
    el: HTMLElement | null,
    text: string,
    cps?: number,
    opts?: { scrollContainer?: HTMLElement | null; autoScroll?: boolean; reducedMotion?: boolean }
  ) => {
    cancel();
    cancelRef.current = typeText(el, text, cps ?? 36, opts);
  };

  return { start, cancel };
}

function useInView<T extends Element>(threshold = 0.25) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setInView(e.isIntersecting);
      },
      { threshold }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, inView };
}

const LOVE_LETTER = `Begum 💌

Pehli cheez pehle… I lovee youu the most meri pyaari si jaan, mere pyaaray bachhayy.
Duniya ke liye aap jitni bhi bari ho jaayein… mera toh wohi bachaa hai jo hamesha se tha, aur wohi hamesha rahega. <3 <3

Kabhi kabhi alfaaz itne kam lagte hain un ehsasaat ke muqable mein jo main aapke liye mehsoos karta hoon…
lekin phir bhi main apni poori koshish karunga.

Begum, aap sirf meri begum hi nahi…
aap meri partner hain, meri inspiration hain, meri zindagi ka woh hissa hain jahan mujhe sukoon milta hai.
Meri sari zindagi mein aapka hona ek khushkhabri hai… meri BUSHRA. <3

Jab main kehta hoon “I love you,” toh mera matlab hota hai:
aapki hassi, aapka masti mein dance karna,
mujhe long rides pe cute cute gaane sunana,
mere favourite khanay banana,
meri khidmat karna, mera ghar sambhalna…
aur zindagi ki har mushkil mere saath face karna.

Meri jaan, aap sirf mere saath nahi hoti… aap mere liye hoti hain.
Aur main aapko har din, har haal mein choose karta hoon.

Hamesha. 💞`;


// ✅ Add your photos here (place files in /public/photos/)
const PHOTOS: { src: string; alt: string }[] = [
  { src: "/photos/1.jpeg", alt: "Begum 1" },
  { src: "/photos/2.jpeg", alt: "Begum 2" },
  { src: "/photos/3.jpeg", alt: "Begum 3" },
  { src: "/photos/4.jpeg", alt: "Begum 4" },
  { src: "/photos/5.jpeg", alt: "Begum 5" },
  { src: "/photos/6.jpeg", alt: "Begum 6" },
  { src: "/photos/7.jpeg", alt: "Begum 7" },
];

/** ✅ NEW: Premium content */
const TIMELINE = [
  { title: "The first time I knew", body: "Something about you felt like fate being quiet." },
  { title: "The days you made lighter", body: "You turned normal days into good ones." },
  { title: "When you stood by me", body: "You didn’t just love me, you showed up." },
  { title: "Now", body: "This is me, choosing you again." },
  { title: "Always", body: "I’m not going anywhere." },
];

const NOTES = [
  { label: "You feel like home.", title: "Home 🏡", body: "Not a place. A feeling. And you’re mine." },
  { label: "Your smile fixes days.", title: "That smile 🙂", body: "Instant repair. No warranty needed." },
  { label: "You make ordinary soft.", title: "Softness", body: "You make the world less sharp." },
  { label: "I trust you, fully.", title: "Trust", body: "It’s rare. I found it in you." },
  { label: "You’re my calm.", title: "Calm", body: "When everything is loud, you’re the quiet I keep." },
  { label: "You’re my favourite person.", title: "Favourite", body: "If I had to choose a thousand times, it’s you." },
  { label: "Your voice is my comfort.", title: "Comfort", body: "One ‘hello’ from you and my brain stops running." },
  { label: "I choose you. Always.", title: "Choice", body: "Not once. Not sometimes. Every day." },
];

const OPEN_WHEN = [
  { label: "Open when you miss me", body: "Close your eyes for 5 seconds. I’m right there. 🤍" },
  { label: "Open when you’re stressed", body: "Breathe. Water. One small step. I’m with you." },
  { label: "Open when you feel alone", body: "You’re not. Not even for a second." },
  { label: "Open when you need a smile", body: "Imagine me begging you not to press ‘No’ 😤💖" },
  { label: "Open when you can’t sleep", body: "Put the phone down. I’ll be the last thought." },
  { label: "Open when you doubt us", body: "We’re not fragile. We’re real." },
];

const PROMISES = [
  "I’ll protect your peace.",
  "I’ll choose patience over ego.",
  "I’ll stay kind even when I’m tired.",
  "I’ll keep making you laugh.",
  "I’ll be your safe place.",
  "I’ll never stop choosing you.",
  "I’ll listen properly, not just hear.",
  "I’ll build with you, not around you.",
];

function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-mist via-paper to-paper" />
      <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_50%_-10%,rgba(109,94,244,0.18),transparent_60%)]" />
      <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky opacity-70 blur-2xl" />
      <div className="absolute top-40 right-10 h-64 w-64 rounded-full bg-mint opacity-70 blur-2xl" />
      <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-lilac opacity-70 blur-2xl" />
      <div className="absolute inset-0 [mask-image:radial-gradient(1200px_700px_at_50%_0%,black,transparent)] bg-black/5" />
    </div>
  );
}

/** ✅ Modal shell reused by sections */
function ModalShell({
  open,
  onClose,
  eyebrow,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "auto";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close modal backdrop"
      />
      <div className="relative w-full max-w-xl rounded-3xl bg-white/90 shadow-lift ring-1 ring-black/10 overflow-hidden backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-mist to-white">
          <div className="min-w-0">
            {eyebrow && (
              <div className="text-[11px] font-extrabold tracking-[0.22em] text-ink/55">{eyebrow}</div>
            )}
            <div className="text-lg font-extrabold tracking-tight text-ink/85 truncate">{title}</div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-full px-3 py-2 text-ink/60 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-accent/40"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-6 text-ink/75 leading-relaxed whitespace-pre-wrap">{children}</div>
        <div className="px-6 py-4 bg-paper flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="rounded-full px-5 py-2 text-sm font-extrabold text-black bg-accent hover:opacity-95 shadow-soft transition active:scale-[0.99]"
          >
            Okay ❤️
          </button>
        </div>
      </div>
    </div>
  );
}

/** ✅ Clickable notes carousel (replaces passive Reasons) */
function ClickableNotesCarousel({
  items,
  reducedMotion,
}: {
  items: { label: string; title: string; body: string }[];
  reducedMotion: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const doubled = useMemo(() => [...items, ...items], [items]);

  function onChip(i: number) {
    const real = i % items.length;
    setActive(real);
    setOpen(true);
  }

  return (
    <>
      <div className="mt-6 overflow-hidden rounded-3xl ring-1 ring-black/5 bg-paper">
        <div
          className={`flex gap-3 py-4 px-4 will-change-transform ${
            reducedMotion ? "" : "animate-[marquee_22s_linear_infinite]"
          }`}
        >
          {doubled.map((x, idx) => (
            <button
              key={`${x.label}-${idx}`}
              type="button"
              onClick={() => onChip(idx)}
              className="
                shrink-0 rounded-full
                bg-white/90 backdrop-blur
                px-4 py-2 text-sm font-semibold text-ink/70
                shadow-soft ring-1 ring-black/5
                hover:shadow-lift hover:bg-white
                transition active:scale-[0.99]
                focus:outline-none focus:ring-2 focus:ring-accent/40
              "
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>

      <ModalShell
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="A LITTLE NOTE"
        title={items[active]?.title ?? "Note"}
      >
        {items[active]?.body ?? ""}
      </ModalShell>
    </>
  );
}

function TimelineSection({ items }: { items: { title: string; body: string }[] }) {
  return (
    <div className="mt-6">
      <div className="relative pl-6">
        <div className="absolute left-2 top-0 bottom-0 w-px bg-black/10" />
        <div className="space-y-5">
          {items.map((t, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[2px] top-2 h-3 w-3 rounded-full bg-accent/70 ring-4 ring-white" />
              <div className="rounded-3xl bg-white/80 backdrop-blur p-5 ring-1 ring-black/5 shadow-soft">
                <div className="font-extrabold tracking-tight text-ink/85">{t.title}</div>
                <div className="mt-1 text-sm text-ink/70 leading-relaxed">{t.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OpenWhenGrid({ items }: { items: { label: string; body: string }[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  return (
    <>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((x, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setActive(i);
              setOpen(true);
            }}
            className="
              text-left rounded-3xl bg-white/85 backdrop-blur p-5 ring-1 ring-black/5 shadow-soft
              hover:shadow-lift transition active:scale-[0.99]
              focus:outline-none focus:ring-2 focus:ring-accent/40
            "
          >
            <div className="text-xs font-extrabold tracking-[0.18em] text-ink/55">OPEN WHEN</div>
            <div className="mt-1 font-extrabold text-ink/85">{x.label}</div>
            <div className="mt-2 text-xs text-ink/50">Tap to unlock</div>
          </button>
        ))}
      </div>

      <ModalShell
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="OPEN WHEN"
        title={items[active]?.label ?? "Open when…"}
      >
        {items[active]?.body ?? ""}
      </ModalShell>
    </>
  );
}

function PromiseGrid({ items }: { items: string[] }) {
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((p, i) => (
        <div key={i} className="rounded-3xl bg-white/85 backdrop-blur p-5 ring-1 ring-black/5 shadow-soft">
          <div className="text-sm font-extrabold text-ink/80">Promise</div>
          <div className="mt-1 text-ink/70">{p}</div>
        </div>
      ))}
    </div>
  );
}

/** ✅ Premium Photo Strip + Lightbox */
function PhotoStrip({ photos }: { photos: { src: string; alt: string }[] }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  function openAt(i: number) {
    setIdx(i);
    setOpen(true);
  }
  function close() {
    setOpen(false);
  }
  function prev() {
    setIdx((x) => (x - 1 + photos.length) % photos.length);
  }
  function next() {
    setIdx((x) => (x + 1) % photos.length);
  }

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, photos.length]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow || "auto";
    };
  }, [open]);

  if (!photos.length) return null;

  return (
    <>
      <div className="mt-6 rounded-3xl bg-paper ring-1 ring-black/5 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="text-xs font-semibold text-ink/60">A little film strip 📷</div>
          <div className="text-xs text-ink/45">Scroll • Tap a photo</div>
        </div>

        <div className="px-5 pb-5 overflow-x-auto scroll-smooth">
          <div className="flex gap-4 snap-x snap-mandatory">
            {photos.map((p, i) => (
              <button
                key={p.src}
                type="button"
                onClick={() => openAt(i)}
                className="
                  relative shrink-0 snap-start
                  w-[240px] sm:w-[280px]
                  aspect-[4/5]
                  rounded-3xl overflow-hidden
                  ring-1 ring-black/10
                  bg-white/70 shadow-soft backdrop-blur
                  hover:shadow-lift transition
                  active:scale-[0.99]
                  focus:outline-none focus:ring-2 focus:ring-accent/40
                "
                aria-label={`Open photo ${i + 1}`}
              >
                <img
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,.35),transparent_40%)] opacity-60" />
                <div className="absolute inset-x-3 bottom-3 rounded-full bg-white/70 backdrop-blur px-3 py-1 text-[11px] font-semibold text-ink/70 ring-1 ring-black/5">
                  Memory {i + 1}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
            onClick={close}
            aria-label="Close lightbox backdrop"
          />

          <div className="relative w-full max-w-4xl rounded-3xl bg-white/85 ring-1 ring-black/10 shadow-lift overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-mist to-white">
              <div className="text-xs font-extrabold tracking-[0.22em] text-ink/60">
                MEMORY {idx + 1} / {photos.length}
              </div>

              <button
                type="button"
                onClick={close}
                className="rounded-full px-3 py-2 text-ink/60 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-accent/40"
                aria-label="Close lightbox"
              >
                ✕
              </button>
            </div>

            <div className="relative bg-paper">
              <img src={photos[idx].src} alt={photos[idx].alt} className="w-full max-h-[70vh] object-contain" />

              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    className="
                      absolute left-4 top-1/2 -translate-y-1/2
                      rounded-full bg-white/75 backdrop-blur
                      px-4 py-3
                      shadow-soft ring-1 ring-black/10
                      hover:bg-white/90 transition
                    "
                    aria-label="Previous photo"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="
                      absolute right-4 top-1/2 -translate-y-1/2
                      rounded-full bg-white/75 backdrop-blur
                      px-4 py-3
                      shadow-soft ring-1 ring-black/10
                      hover:bg-white/90 transition
                    "
                    aria-label="Next photo"
                  >
                    →
                  </button>
                </>
              )}
            </div>

            <div className="px-5 py-4 text-xs text-ink/55 bg-white/60">
              Tip: Use <span className="font-semibold">←</span> / <span className="font-semibold">→</span> keys,
              <span className="font-semibold"> Esc</span> to close.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** PAGE 1: Intro */
function IntroPage() {
  const navigate = useNavigate();
  const [musicOn, setMusicOn] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  function continueToMain() {
    navigate("/love", { state: { musicOn } });
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Background />

      <div className="min-h-screen grid place-items-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-white/90 shadow-lift ring-1 ring-black/10 p-7 backdrop-blur-md">
          <div className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1 text-xs font-extrabold tracking-wide text-ink/60 ring-1 ring-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            PRIVATE
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">For you.</h1>
          <p className="mt-2 text-ink/70 leading-relaxed">
            I made a little world for us. Tap when you’re ready.
          </p>

          <button
            onClick={continueToMain}
            className="mt-6 w-full rounded-full bg-accent text-black py-3 font-extrabold shadow-soft hover:opacity-95 transition active:scale-[0.99]"
            type="button"
          >
            Tap to continue ✨
          </button>

          <p className="mt-3 text-xs text-ink/50">Music starts after you tap (phone rules 😌)</p>

          <div className="mt-4 flex items-center justify-between text-xs text-ink/50">
            <span>Music</span>
            <button
              className="rounded-full px-3 py-1 ring-1 ring-black/10 hover:bg-black/5 transition"
              type="button"
              onClick={() => setMusicOn((s) => !s)}
            >
              Start {musicOn ? "On" : "Off"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** PAGE 2: Main experience */
function LovePage() {
  const navigate = useNavigate();
  const reducedMotion = usePrefersReducedMotion();
  const location = useLocation() as { state?: { musicOn?: boolean } };

  const initialMusic = location.state?.musicOn ?? true;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [musicOn, setMusicOn] = useState<boolean>(initialMusic);

  const [letterOpen, setLetterOpen] = useState(false);
  const letterTypedRef = useRef<HTMLDivElement | null>(null);
  const paperRef = useRef<HTMLDivElement | null>(null);

  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const { start: typeStart, cancel: typeCancel } = useTypewriter();

  // Start typing + music (user already tapped on Intro page)
  useEffect(() => {
    typeStart(titleRef.current, "Hi Lovely. I made this for you.", 40, { reducedMotion });

    const a = audioRef.current;
    if (!a) return;

    a.volume = 0.85;
    a.muted = !musicOn;

    (async () => {
      try {
        if (musicOn) await a.play();
      } catch {}
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // lock scroll when letter modal open
  useEffect(() => {
    document.body.style.overflow = letterOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [letterOpen]);

  async function applyMusic(nextOn: boolean) {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !nextOn;
    try {
      if (nextOn) await a.play();
      else a.pause();
    } catch {}
  }

  async function toggleMusic() {
    const next = !musicOn;
    setMusicOn(next);
    await applyMusic(next);
  }

  function openLetter() {
    setLetterOpen(true);
    requestAnimationFrame(() => {
      if (paperRef.current) paperRef.current.scrollTop = 0;
      typeStart(letterTypedRef.current, LOVE_LETTER, 38, {
        scrollContainer: paperRef.current,
        autoScroll: true,
        reducedMotion,
      });
    });
  }

  function closeLetter() {
    setLetterOpen(false);
    typeCancel();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && letterOpen) closeLetter();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [letterOpen]);

  // Memories
  const { ref: videoWrapRef, inView: videoInView } = useInView<HTMLDivElement>(0.35);
  const videosRef = useRef<HTMLVideoElement[]>([]);
  const [videoIndex, setVideoIndex] = useState(0);

  useEffect(() => {
    const vids = videosRef.current.filter(Boolean);
    if (!vids.length) return;

    const ensureSrc = (v: HTMLVideoElement) => {
      if (!v.src) v.src = v.dataset.src || "";
      v.muted = true;
      v.playsInline = true;
      v.setAttribute("playsinline", "");
    };

    let active = false;

    const play = async (i: number) => {
      const v = vids[i];
      ensureSrc(v);
      vids.forEach((vv, idx) => (vv.style.display = idx === i ? "block" : "none"));
      try {
        v.currentTime = 0;
      } catch {}
      try {
        await v.play();
      } catch {}
    };

    const stopAll = () => {
      active = false;
      vids.forEach((v) => {
        try {
          v.pause();
        } catch {}
      });
    };

    const onEnded = () => {
      if (!active) return;
      setVideoIndex((x) => (x + 1) % vids.length);
    };

    vids.forEach((v) => v.addEventListener("ended", onEnded));

    if (videoInView) {
      active = true;
      play(videoIndex);
    } else {
      stopAll();
    }

    return () => {
      vids.forEach((v) => v.removeEventListener("ended", onEnded));
      stopAll();
    };
  }, [videoInView, videoIndex]);

  // Yes/No
  const [hugShown, setHugShown] = useState(false);
  const [noCount, setNoCount] = useState(0);
  const yesScale = useMemo(() => clamp(1 + noCount * 0.18, 1, 3.0), [noCount]);

  const choiceWrapRef = useRef<HTMLDivElement | null>(null);
  const noBtnRef = useRef<HTMLButtonElement | null>(null);
  const boundsRef = useRef({ w: 0, h: 0, bw: 0, bh: 0 });

  useEffect(() => {
    function compute() {
      const wrap = choiceWrapRef.current;
      const btn = noBtnRef.current;
      if (!wrap || !btn) return;
      const wr = wrap.getBoundingClientRect();
      const br = btn.getBoundingClientRect();
      boundsRef.current = { w: wr.width, h: wr.height, bw: br.width, bh: br.height };
    }
    compute();
    window.addEventListener("resize", compute, { passive: true });
    return () => window.removeEventListener("resize", compute);
  }, []);

  const rafMoveQueued = useRef(false);

  function moveNo() {
    if (reducedMotion) return;
    if (rafMoveQueued.current) return;
    rafMoveQueued.current = true;

    requestAnimationFrame(() => {
      rafMoveQueued.current = false;

      const btn = noBtnRef.current;
      if (!btn) return;

      const { w, h, bw, bh } = boundsRef.current;
      const pad = 10;

      const maxX = Math.max(0, w - bw - pad * 2);
      const maxY = Math.max(0, h - bh - pad * 2);

      const x = pad + Math.random() * maxX;
      const y = pad + Math.random() * maxY;

      const currentScale = btn.style.transform.match(/scale\(([^)]+)\)/)?.[1] || "1";
      btn.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${currentScale})`;
    });
  }

  function setNoScale(scale: number) {
    const btn = noBtnRef.current;
    if (!btn) return;
    const t = btn.style.transform.match(/translate3d\([^)]+\)/)?.[0] || "translate3d(0px,0px,0)";
    btn.style.transform = `${t} scale(${scale})`;
  }

  const noLines = [
    "No",
    "Are you sure? 😭",
    "Please? 🥺",
    "Don’t do this to me…",
    "I’ll be sad forever",
    "Okay last chance 😶",
    "Stop pressing No 😤",
    "I’m begging now",
    "Fine… but look at Yes 👀",
    "NO button is tired",
    "You’re making Yes stronger 💪",
  ];

  function onNo() {
    setNoCount((c) => {
      const next = c + 1;
      const btn = noBtnRef.current;
      if (btn) {
        const noScale = clamp(1 - next * 0.06, 0.56, 1);
        setNoScale(noScale);
        btn.style.opacity = String(clamp(1 - next * 0.08, 0.22, 1));
        if (next >= 3) moveNo();
      }
      return next;
    });
  }

  const sectionWrap = "rounded-3xl bg-white/85 shadow-soft ring-1 ring-black/5 backdrop-blur-md p-8 sm:p-10";

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Background />

      {/* Audio */}
      <audio ref={audioRef} src="/song.mp3" loop preload="auto" />

      {/* Top controls */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <div className="mx-auto max-w-3xl px-4 py-4 flex justify-end">
          <button
            onClick={toggleMusic}
            className={`group inline-flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 shadow-soft ring-1 ring-black/5 backdrop-blur-md hover:bg-white/85 hover:shadow-lift transition ${
              !musicOn ? "opacity-85" : ""
            }`}
            type="button"
            aria-label="Toggle music"
          >
            <span
              className={`h-2.5 w-2.5 rounded-full transition ring-2 ring-black/10 ${
                musicOn ? "bg-emerald-400" : "bg-rose-400"
              }`}
            />
            <span className="text-sm font-semibold text-ink/75 group-hover:text-ink/85">
              Music: {musicOn ? "On" : "Off"}
            </span>
          </button>
        </div>
      </div>

      <main className="pt-24 pb-12">
        {/* HERO */}
        <section className="mx-auto max-w-3xl px-4">
          <div className="relative overflow-hidden rounded-3xl bg-white/80 shadow-soft ring-1 ring-black/5 backdrop-blur-md p-8 sm:p-10">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/10 blur-2xl" />
            <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-blush/10 blur-2xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1 text-xs font-extrabold tracking-wide text-ink/70 ring-1 ring-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                PRIVATE
              </div>

              <h1 ref={titleRef} className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight" />

              <p className="mt-4 text-base sm:text-lg text-ink/70 leading-relaxed">
                Not every love is loud. Ours is the kind that stays.
              </p>

              <div className="mt-8 flex items-center gap-2 text-ink/70 text-sm">
                <span className="inline-block animate-bounce">↓</span>
                <span>Scroll</span>
              </div>
            </div>
          </div>
        </section>

        {/* LOVE LETTER */}
        <section className="mx-auto max-w-3xl px-4 mt-10">
          <div className={sectionWrap}>
            <h2 className="text-2xl font-extrabold tracking-tight">Aap ke liye ek khat…</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">
              Scroll karte karte isey dhoondhiyega, parhiyega, Acha lagey? Toh phr parhiyega.
            </p>

            <div className="mt-8 flex justify-center">
              <button
                onClick={openLetter}
                type="button"
                className="relative w-72 max-w-full h-44 rounded-3xl bg-gradient-to-br from-white to-mist shadow-soft ring-1 ring-black/5 hover:shadow-lift transition active:scale-[0.99]"
                aria-label="Open love letter"
              >
                <div className="absolute inset-0 rounded-3xl border border-black/5" />
                <div className="absolute left-5 top-5 text-sm font-bold text-ink/70">Begum</div>
                <div className="absolute right-5 top-5 text-xs text-ink/70">Tap to open</div>

                <div className="absolute inset-x-5 bottom-5 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-ink/70 ring-1 ring-black/5 backdrop-blur">
                    <span className="h-2 w-2 rounded-full bg-blush" />
                    sealed with love
                  </div>
                  <div className="text-xs text-ink/45">💌</div>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* MEMORIES */}
        <section className="mx-auto max-w-3xl px-4 mt-10">
          <div className={sectionWrap}>
            <h2 className="text-2xl font-extrabold tracking-tight">Memories</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">A silent reel, bas hum dono ka.</p>

            <div ref={videoWrapRef} className="mt-6 rounded-3xl bg-paper ring-1 ring-black/5 overflow-hidden">
              <video
                ref={(el) => {
                  if (el) videosRef.current[0] = el;
                }}
                className="w-full hidden"
                muted
                playsInline
                preload="metadata"
                data-src="/v1.mp4"
              />
              <video
                ref={(el) => {
                  if (el) videosRef.current[1] = el;
                }}
                className="w-full hidden"
                muted
                playsInline
                preload="metadata"
                data-src="/v2.mp4"
              />
              <div className="p-4 text-xs text-ink/65">
                {videoInView ? "Playing silently…" : "Scroll here to play (silent)."}
              </div>
            </div>

            <p className="mt-3 text-xs text-ink/65">Ye videos khud chalengi, bilkul silent, jab aap yahan pohanchengi.</p>
          </div>
        </section>

        {/* PHOTOS */}
        <section className="mx-auto max-w-3xl px-4 mt-10">
          <div className={sectionWrap}>
            <h2 className="text-2xl font-extrabold tracking-tight">Photos</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">Little moments. Big meaning.</p>
            <PhotoStrip photos={PHOTOS} />
            <p className="mt-3 text-xs text-ink/50">Tip: Tap any photo to open it properly.</p>
          </div>
        </section>

        {/* LITTLE NOTES (CLICKABLE) */}
        <section className="mx-auto max-w-3xl px-4 mt-10">
          <div className={sectionWrap}>
            <h2 className="text-2xl font-extrabold tracking-tight">Little Notes</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">
              Tap any line. Each one opens something different.
            </p>
            <ClickableNotesCarousel items={NOTES} reducedMotion={reducedMotion} />
            <p className="mt-3 text-xs text-ink/50">Esc to close notes.</p>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="mx-auto max-w-3xl px-4 mt-10">
          <div className={sectionWrap}>
            <h2 className="text-2xl font-extrabold tracking-tight">Our Timeline</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">Not dates. Moments.</p>
            <TimelineSection items={TIMELINE} />
          </div>
        </section>

        {/* OPEN WHEN */}
        <section className="mx-auto max-w-3xl px-4 mt-10">
          <div className={sectionWrap}>
            <h2 className="text-2xl font-extrabold tracking-tight">Open when…</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">Little emergency letters for the heart.</p>
            <OpenWhenGrid items={OPEN_WHEN} />
          </div>
        </section>

        {/* PROMISES */}
        <section className="mx-auto max-w-3xl px-4 mt-10">
          <div className={sectionWrap}>
            <h2 className="text-2xl font-extrabold tracking-tight">Promises</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">Quiet commitments, done daily.</p>
            <PromiseGrid items={PROMISES} />
          </div>
        </section>

        {/* QUESTION */}
        <section className="mx-auto max-w-3xl px-4 mt-10">
          <div className={sectionWrap + " text-center"}>
            <h2 className="text-2xl font-extrabold tracking-tight">Will you always be mine?</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">Choose carefully. I’m watching. 👀</p>

            <div ref={choiceWrapRef} className="mt-6 relative flex items-center justify-center gap-3 min-h-[86px]">
              <button
                onClick={() => setHugShown(true)}
                disabled={hugShown}
                type="button"
                style={{ transform: `scale(${yesScale})` }}
                className="rounded-full px-7 py-3 text-sm font-extrabold text-black bg-blush shadow-soft hover:opacity-95 transition disabled:opacity-70 active:scale-[0.99]"
              >
                {hugShown ? "YES ✅" : "Yes 💖"}
              </button>

              <button
                ref={noBtnRef}
                onClick={onNo}
                onMouseEnter={() => {
                  if (noCount >= 3) moveNo();
                }}
                onTouchStart={(e) => {
                  if (noCount >= 3) {
                    e.preventDefault();
                    moveNo();
                  }
                }}
                disabled={hugShown}
                type="button"
                className="rounded-full px-7 py-3 text-sm font-extrabold text-ink/70 bg-white ring-1 ring-black/10 shadow-soft hover:bg-black/5 transition disabled:opacity-50 active:scale-[0.99]"
                style={{ willChange: "transform, opacity" }}
              >
                {noLines[clamp(noCount, 0, noLines.length - 1)]}
              </button>
            </div>

            {hugShown && (
              <div className="mt-6 rounded-3xl bg-mint/70 ring-1 ring-emerald-200 p-5 text-left shadow-soft">
                <div className="font-extrabold">I knew you’d choose yes 🫂</div>
                <div className="mt-1 text-sm text-ink/70 leading-relaxed">
                  Now you’re stuck with me. Forever-ish. 😌
                </div>
              </div>
            )}
          </div>
        </section>

        <footer className="mt-10 py-10">
  <div className="mx-auto max-w-3xl px-4 flex flex-col items-center justify-center gap-4">
    <div className="flex items-center justify-center gap-2 text-xs text-ink/55">
      <span>Made with love.</span>
      <span>•</span>
      <span>And a little pressure.</span>
    </div>

    <button
      type="button"
      onClick={() => navigate("/", { replace: false })}
      className="rounded-full bg-white/80 backdrop-blur px-5 py-2 text-sm font-extrabold text-ink/80 ring-1 ring-black/10 shadow-soft hover:bg-white hover:shadow-lift transition active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-accent/40"
      aria-label="Back to start"
    >
      ← Back to start
    </button>
  </div>
</footer>
      </main>

      {/* LETTER MODAL */}
      {letterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <button
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            aria-label="Close letter backdrop"
            onClick={closeLetter}
            type="button"
          />
          <div className="relative w-full max-w-2xl rounded-3xl bg-white/90 shadow-lift ring-1 ring-black/10 overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-mist to-white">
              <div className="text-xs font-extrabold tracking-[0.22em] text-ink/60">BEGUM</div>
              <button
                onClick={closeLetter}
                type="button"
                className="rounded-full px-3 py-2 text-ink/60 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-accent/40"
                aria-label="Close letter"
              >
                ✕
              </button>
            </div>

            <div ref={paperRef} className="max-h-[65vh] overflow-auto px-6 py-6">
              <h3 className="text-lg font-extrabold tracking-tight">Begum,</h3>
              <div ref={letterTypedRef} className="mt-3 whitespace-pre-wrap leading-7 text-ink/80" />
            </div>

            <div className="flex items-center justify-between gap-3 px-6 py-4 bg-paper">
              <button
                onClick={() =>
                  typeStart(letterTypedRef.current, LOVE_LETTER, 38, {
                    scrollContainer: paperRef.current,
                    autoScroll: true,
                    reducedMotion,
                  })
                }
                type="button"
                className="rounded-full px-4 py-2 text-sm font-semibold text-ink/70 hover:bg-black/5 transition"
              >
                Type it again
              </button>

              <button
                onClick={closeLetter}
                type="button"
                className="rounded-full px-5 py-2 text-sm font-extrabold text-black bg-accent hover:opacity-95 shadow-soft transition active:scale-[0.99]"
              >
                Hold it close 🤍
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translate3d(0,0,0); }
          100% { transform: translate3d(-50%,0,0); }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<IntroPage />} />
      <Route path="/love" element={<LovePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
