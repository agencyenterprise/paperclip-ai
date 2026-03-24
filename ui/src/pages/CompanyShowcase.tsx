import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { companiesApi } from "../api/companies";
import { queryKeys } from "../lib/queryKeys";
import { parseMetaEngineMeta, companySlug } from "../lib/meta-engine";
import type { Company } from "@paperclipai/shared";

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const refs = useRef<Map<string, T>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const key = (e.target as HTMLElement).dataset.revealKey;
          if (e.isIntersecting && key) setVisible((p) => new Set([...p, key]));
        });
      },
      { threshold: 0.12 }
    );
    refs.current.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const revealRef = useCallback((key: string) => (el: T | null) => {
    if (el) {
      el.dataset.revealKey = key;
      refs.current.set(key, el);
      observerRef.current?.observe(el);
    }
  }, []);

  return { revealRef, visible };
}

function useCounter(target: number, active: boolean, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (target === 0) { setVal(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(ease * target));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, duration]);
  return val;
}

function useTyping(lines: string[], active: boolean, speed = 38) {
  const [text, setText] = useState("");
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active || done) return;
    const full = lines[lineIdx] ?? "";
    if (charIdx < full.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), speed);
      return () => clearTimeout(t);
    } else if (lineIdx < lines.length - 1) {
      const t = setTimeout(() => { setLineIdx((l) => l + 1); setCharIdx(0); setText((p) => p + "\n"); }, 350);
      return () => clearTimeout(t);
    } else { setDone(true); }
  }, [active, charIdx, lineIdx, lines, speed, done]);

  useEffect(() => {
    if (!active) return;
    const full = lines[lineIdx] ?? "";
    setText((p) => {
      const rows = p.split("\n");
      rows[lineIdx] = full.slice(0, charIdx);
      return rows.join("\n");
    });
  }, [charIdx, lineIdx, lines, active]);

  return { text, done };
}

// ─── Global styles ────────────────────────────────────────────────────────────

const KEYFRAMES = `
@keyframes float-slow  { 0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-16px) rotate(2deg)} }
@keyframes float-mid   { 0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-10px) rotate(1.5deg)} }
@keyframes float-fast  { 0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)} }
@keyframes pulse-ring  { 0%{transform:scale(1);opacity:.5}70%{transform:scale(1.12);opacity:0}100%{transform:scale(1);opacity:0} }
@keyframes scan-h      { 0%{top:0%;opacity:.7}100%{top:100%;opacity:0} }
@keyframes fade-up     { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }
@keyframes fade-in     { from{opacity:0}to{opacity:1} }
@keyframes slide-r     { from{opacity:0;transform:translateX(-28px)}to{opacity:1;transform:translateX(0)} }
@keyframes slide-l     { from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:translateX(0)} }
@keyframes check-pop   { 0%{transform:scale(0) rotate(-20deg);opacity:0}70%{transform:scale(1.25) rotate(3deg)}100%{transform:scale(1) rotate(0deg);opacity:1} }
@keyframes marquee     { from{transform:translateX(0)}to{transform:translateX(-50%)} }
@keyframes draw-path   { from{stroke-dashoffset:800}to{stroke-dashoffset:0} }
@keyframes shimmer-bg  { 0%{background-position:200% 0}100%{background-position:-200% 0} }
@keyframes ticker-up   { from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1} }
@keyframes glow-pulse  { 0%,100%{opacity:.06}50%{opacity:.14} }
@keyframes spin-slow   { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
@keyframes progress-in { from{width:0}to{width:var(--target-w)} }
`;

function GlobalStyles() { return <style>{KEYFRAMES}</style>; }

function Reveal({ children, delay = 0, anim = "fade-up", className = "" }: {
  children: React.ReactNode; delay?: number; anim?: string; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}
      style={{ animation: v ? `${anim} 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms both` : "none", opacity: v ? undefined : 0 }}>
      {children}
    </div>
  );
}

type ShowcaseProps = { company: Company; meta: ReturnType<typeof parseMetaEngineMeta> };

// ─── Shared clickable demo widget (used across all showcases) ─────────────────

type DemoStepDef = { label: string; conf?: number; flagged?: boolean; detail?: string };

function CompanyDemoWidget({
  steps, accent, bg, border, buttonLabel = "▶ Run demo", title, subtitle,
}: {
  steps: DemoStepDef[];
  accent: string;
  bg: string;
  border: string;
  buttonLabel?: string;
  title: string;
  subtitle: string;
}) {
  type Phase = "idle" | "running" | "done";
  const [phase, setPhase] = useState<Phase>("idle");
  const [runningIdx, setRunningIdx] = useState(-1);
  const [doneSet, setDoneSet] = useState<Set<number>>(new Set());

  const run = () => {
    if (phase === "running") return;
    if (phase === "done") {
      setPhase("idle"); setRunningIdx(-1); setDoneSet(new Set()); return;
    }
    setPhase("running");
    steps.forEach((_, i) => {
      setTimeout(() => {
        setRunningIdx(i);
        setTimeout(() => {
          setDoneSet(prev => new Set([...prev, i]));
          if (i === steps.length - 1) { setPhase("done"); setRunningIdx(-1); }
        }, 800);
      }, i * 1050);
    });
  };

  return (
    <div className="rounded-3xl overflow-hidden shadow-lg" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="px-7 py-6 flex items-start justify-between gap-6 border-b" style={{ borderColor: border }}>
        <div>
          <p className="font-bold text-white text-base">{title}</p>
          <p className="text-white/40 text-sm mt-1">{subtitle}</p>
        </div>
        <button onClick={run}
          className="shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95"
          style={{
            backgroundColor: phase === "done" ? "rgba(255,255,255,.1)" : phase === "running" ? "rgba(255,255,255,.06)" : accent,
            color: phase === "running" ? "rgba(255,255,255,.4)" : phase === "done" ? "rgba(255,255,255,.6)" : "#000",
            cursor: phase === "running" ? "not-allowed" : "pointer",
          }}>
          {phase === "done" ? "↺ Reset" : phase === "running" ? "Running…" : buttonLabel}
        </button>
      </div>
      <div className="divide-y" style={{ borderColor: border }}>
        {steps.map((step, i) => {
          const isRunning = runningIdx === i;
          const isDone = doneSet.has(i);
          return (
            <div key={i} className="flex items-center gap-4 px-7 py-4 transition-all duration-300"
              style={{ backgroundColor: isRunning ? "rgba(255,255,255,.04)" : step.flagged && isDone ? "rgba(245,158,11,.05)" : "transparent" }}>
              <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                {!isDone && !isRunning && <span className="w-3 h-3 rounded-full border border-white/15 inline-block" />}
                {isRunning && <span className="w-4 h-4 rounded-full border-2 border-t-transparent inline-block" style={{ borderColor: accent, animation: "spin-slow .6s linear infinite" }} />}
                {isDone && !step.flagged && <span className="font-black text-sm" style={{ color: accent }}>✓</span>}
                {isDone && step.flagged && <span className="font-black text-sm text-amber-400">⚠</span>}
              </div>
              <span className={`text-sm flex-1 transition-colors ${isDone || isRunning ? "text-white/80 font-medium" : "text-white/30"}`}>
                {step.label}
                {isDone && step.detail && <span className="text-amber-400 ml-2 font-normal text-xs">{step.detail}</span>}
              </span>
              {isDone && !step.flagged && step.conf && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                  style={{ backgroundColor: `${accent}18`, color: accent, animation: "fade-in .3s both" }}>
                  {step.conf}% conf.
                </span>
              )}
              {isDone && step.flagged && (
                <span className="text-xs text-amber-400 font-semibold bg-amber-400/10 px-2.5 py-1 rounded-full shrink-0" style={{ animation: "fade-in .3s both" }}>
                  Human review
                </span>
              )}
            </div>
          );
        })}
      </div>
      {phase === "done" && (
        <div className="px-7 py-5 flex items-center gap-3" style={{ borderTop: `1px solid ${border}`, backgroundColor: `${accent}10`, animation: "fade-up .4s both" }}>
          <span className="text-lg font-black" style={{ color: accent }}>✓</span>
          <div>
            <p className="text-white text-sm font-bold">Report ready</p>
            <p className="text-white/35 text-xs">{steps.filter(s => !s.flagged).length} items verified · {steps.filter(s => s.flagged).length} escalated for human review</p>
          </div>
          <button className="ml-auto text-xs font-semibold hover:underline" style={{ color: accent }}>Download report →</button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNDERWRITING — Dark editorial luxury. Triage queue as hero element.
// ═══════════════════════════════════════════════════════════════════════════════

type TriageStatus = "pending" | "analyzing" | "complete" | "escalated";

const SUBMISSIONS: { broker: string; type: string; status: TriageStatus; conf?: number }[] = [
  { broker: "Marsh & McLennan", type: "Commercial Auto", status: "complete", conf: 94 },
  { broker: "Aon Risk Solutions", type: "General Liability", status: "complete", conf: 88 },
  { broker: "Willis Towers Watson", type: "E&O / D&O", status: "analyzing" },
  { broker: "Brown & Riding", type: "Property CAT", status: "escalated" },
  { broker: "Lockton Companies", type: "Workers Comp", status: "pending" },
];

function TriageRow({ broker, type, status, conf, delay }: typeof SUBMISSIONS[0] & { delay: number }) {
  const [s, setS] = useState<TriageStatus>("pending");
  useEffect(() => {
    const t = setTimeout(() => setS(status), delay);
    return () => clearTimeout(t);
  }, [status, delay]);

  const badge = {
    pending: <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/30 font-medium">Queued</span>,
    analyzing: <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />Analyzing</span>,
    complete: <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">✓ {conf}% conf.</span>,
    escalated: <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 font-medium">↑ Escalated</span>,
  }[s];

  return (
    <div className="flex items-center justify-between px-5 py-3.5 rounded-xl border transition-all duration-500"
      style={{ borderColor: s === "complete" ? "rgba(16,185,129,.15)" : s === "escalated" ? "rgba(244,63,94,.12)" : "rgba(255,255,255,.06)", backgroundColor: s === "analyzing" ? "rgba(245,158,11,.04)" : "rgba(255,255,255,.02)" }}>
      <div>
        <p className="text-sm font-semibold text-white/80">{broker}</p>
        <p className="text-xs text-white/30 mt-0.5">{type}</p>
      </div>
      {badge}
    </div>
  );
}

function UnderwritingShowcase({ company, meta }: ShowcaseProps) {
  const { revealRef, visible } = useScrollReveal();

  const steps = meta.howItWorks
    ? meta.howItWorks.split(/→|->/).map(s => s.trim()).filter(Boolean)
    : ["Broker submits ACORD application, loss runs & financials", "Operator maps each document to carrier guidelines with confidence scores", "Items below threshold escalated before any risk is bound", "Underwriter receives structured triage in hours, not days"];

  const docTypes = ["ACORD 125", "Loss Runs", "Financial Statements", "Schedule of Operations", "Inspection Reports", "Premium History", "Prior Carrier Info", "Supplemental Apps", "ACORD 125", "Loss Runs", "Financial Statements", "Schedule of Operations"];

  return (
    <div className="bg-[#080603] text-white font-sans min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <GlobalStyles />

      {/* Scroll fix */}
      <ScrollFix />

      {/* Nav */}
      <UndNav name={company.name} />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden px-6 pt-20">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ animation: "glow-pulse 5s ease-in-out infinite" }}>
          <defs>
            <pattern id="arch" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M16 80 L16 40 Q16 16 40 16 Q64 16 64 40 L64 80" fill="none" stroke="white" strokeWidth=".5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#arch)" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#3b0d02]/30 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center py-20">
          {/* Left copy */}
          <div style={{ animation: "slide-r 0.9s cubic-bezier(0.22,1,0.36,1) both" }}>
            <div className="inline-flex items-center gap-2 mb-8 bg-[#c2440f]/10 border border-[#c2440f]/20 rounded-full px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c2440f] inline-block" />
              <span className="text-[#c2440f] text-xs font-bold uppercase tracking-[.2em]">Commercial Underwriting</span>
            </div>
            <h1 className="text-[clamp(2.8rem,6vw,5.5rem)] font-black leading-[.96] tracking-tight">
              <span className="text-white/20 block">Every submission.</span>
              <span className="text-white/20 block">Triaged in</span>
              <span className="text-white">hours.</span>
            </h1>
            <p className="mt-7 text-white/40 text-lg leading-relaxed max-w-md">
              {meta.plainDescription || "An AI operator that reads every document, maps every risk, and flags what needs human eyes — before coverage is bound."}
            </p>
            <div className="mt-10 flex gap-4">
              <a href="#contact">
                <button className="px-8 py-4 rounded-full bg-[#c2440f] text-white font-bold text-sm hover:bg-[#d4521e] hover:shadow-[0_0_40px_rgba(194,68,15,.45)] transition-all active:scale-95">
                  Open app →
                </button>
              </a>
              <a href="#process">
                <button className="px-8 py-4 rounded-full border border-white/10 text-white/50 font-semibold text-sm hover:border-white/25 hover:text-white/80 transition-all">
                  See how it works
                </button>
              </a>
            </div>
            <div className="mt-12 flex gap-10">
              {[["4 hrs", "Avg turnaround"], ["P&C + Life", "Lines covered"], ["Zero", "Hallucinated approvals"]].map(([v, l]) => (
                <div key={l}>
                  <p className="text-2xl font-black text-[#c2440f]">{v}</p>
                  <p className="text-white/30 text-xs mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: triage queue */}
          <div style={{ animation: "slide-l 0.9s .15s cubic-bezier(0.22,1,0.36,1) both" }}>
            <div className="bg-[#0e0a08]/80 border border-white/8 rounded-3xl overflow-hidden shadow-2xl backdrop-blur">
              <div className="border-b border-white/8 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <span className="text-xs text-white/25 font-medium">Submission Triage Queue</span>
                <span className="text-xs text-[#c2440f] font-bold">Live</span>
              </div>
              <div className="p-5 space-y-2.5">
                {SUBMISSIONS.map((s, i) => (
                  <TriageRow key={s.broker} {...s} delay={800 + i * 600} />
                ))}
              </div>
              <div className="border-t border-white/6 px-6 py-4 flex items-center justify-between text-xs text-white/25">
                <span>5 submissions · 2 complete · 1 analyzing · 1 escalated</span>
                <span className="text-[#c2440f]/60">↻ live</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="border-y border-white/6 py-4 overflow-hidden bg-white/1">
        <div className="flex gap-12 whitespace-nowrap" style={{ animation: "marquee 22s linear infinite" }}>
          {[...docTypes, ...docTypes].map((d, i) => (
            <span key={i} className="text-xs text-white/25 font-semibold uppercase tracking-[.2em] shrink-0">{d}</span>
          ))}
        </div>
      </div>

      {/* Demo */}
      <section id="demo" className="py-24 px-6 bg-white/2 border-t border-white/6">
        <div className="max-w-3xl mx-auto">
          <Reveal><p className="text-[#c2440f] text-xs font-bold uppercase tracking-[.2em] mb-3">Interactive demo</p></Reveal>
          <Reveal delay={60}><h2 className="text-3xl font-black text-white mb-2">Watch the triage engine run.</h2></Reveal>
          <Reveal delay={80}><p className="text-white/35 text-sm mb-10">Click "Run demo" to see a real submission triaged with live confidence scoring.</p></Reveal>
          <Reveal delay={100}>
            <CompanyDemoWidget
              title="Submission Triage — Marsh & McLennan · Commercial Auto"
              subtitle="ACORD 125 + 3yr loss runs + financials"
              accent="#c2440f"
              bg="rgba(14,10,8,0.95)"
              border="rgba(255,255,255,0.08)"
              steps={[
                { label: "ACORD 125 application ingested", conf: 99 },
                { label: "Loss runs analyzed (2023–2025)", conf: 96 },
                { label: "Financial statements cross-referenced", conf: 91 },
                { label: "Prior carrier info: gap detected", flagged: true, detail: "—oss ratio exceeds threshold" },
                { label: "Risk score computed: 72/100", conf: 88 },
                { label: "Triage report generated", conf: 97 },
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal><p className="text-[#c2440f] text-xs font-bold uppercase tracking-[.2em] mb-3">The engine</p></Reveal>
          <Reveal delay={60}><h2 className="text-4xl font-black text-white mb-16">How triage works</h2></Reveal>
          <div className="relative">
            <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-[#c2440f]/60 via-[#c2440f]/20 to-transparent hidden sm:block" />
            <div className="space-y-4">
              {steps.map((step, i) => (
                <Reveal key={i} delay={i * 90} anim="slide-r">
                  <div className="group flex items-start gap-8 sm:pl-16 relative">
                    <div className="hidden sm:flex absolute left-0 top-4 w-12 h-12 rounded-full bg-[#080603] border-2 border-[#c2440f]/30 items-center justify-center font-black text-[#c2440f] text-lg shrink-0 group-hover:border-[#c2440f]/70 transition-all z-10">
                      {i + 1}
                    </div>
                    <div className="flex-1 bg-white/2 border border-white/7 rounded-2xl p-6 hover:border-[#c2440f]/20 hover:bg-white/4 transition-all cursor-default">
                      <p className="text-white/65 group-hover:text-white/90 transition-colors font-medium leading-relaxed">{step}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why aligned */}
      <section className="py-28 px-6 bg-white/2 border-t border-white/6">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-8">
          <Reveal className="sm:col-span-2">
            <p className="text-[#c2440f] text-xs font-bold uppercase tracking-[.2em] mb-4">Aligned by design</p>
            <h2 className="text-3xl font-black text-white mb-5 leading-tight">Honest uncertainty is the product.</h2>
            <p className="text-white/45 leading-relaxed max-w-lg">
              {meta.alignmentConnection || "Underwriting errors cause catastrophic loss exposure. Uncertainty gating means agents never greenlight submissions they cannot verify — delivering the honest triage carriers need before binding coverage."}
            </p>
            <ul className="mt-8 space-y-3">
              {["No hallucinated approvals — escalates when unsure", "Confidence scores on every finding", "Humans govern edge cases, not production throughput"].map((p, i) => (
                <li key={i} className="flex gap-3 text-sm text-white/55">
                  <span className="text-[#c2440f] shrink-0 mt-0.5">✓</span>{p}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={100} anim="slide-l">
            <div ref={revealRef("score") as any} className="bg-white/3 border border-white/8 rounded-3xl p-8 text-center h-full flex flex-col items-center justify-center">
              <p className="text-white/25 text-xs uppercase tracking-widest mb-4">Alignment Score</p>
              <div className="text-8xl font-black text-[#c2440f]">
                {visible.has("score") ? <AnimScore target={meta.alignmentScore ?? 45} /> : "—"}
              </div>
              <div className="text-white/25 text-xl mt-1">/50</div>
              <div className="mt-5 w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full bg-[#c2440f] rounded-full transition-all duration-[2s]"
                  style={{ width: visible.has("score") ? `${((meta.alignmentScore ?? 45) / 50) * 100}%` : "0%" }} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 60%, #7c2d12 0%, #080603 65%)" }} />
        <div className="relative max-w-xl mx-auto text-center space-y-7">
          <h2 className="text-5xl font-black text-white leading-tight">Start reviewing submissions today.</h2>
          <p className="text-white/40">Create a free account and start immediately.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <input type="email" placeholder="you@carrier.com" className="flex-1 max-w-xs bg-white/8 border border-white/12 rounded-full px-5 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#c2440f]/60 transition-all" />
            <button className="px-7 py-3.5 rounded-full bg-[#c2440f] text-white font-bold text-sm hover:bg-[#d4521e] hover:shadow-[0_0_40px_rgba(194,68,15,.5)] transition-all">Notify me</button>
          </div>
        </div>
      </section>
      <ShowcaseFooter name={company.name} />
    </div>
  );
}

// Animated score helper (avoids hook-in-condition)
function AnimScore({ target }: { target: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / 1600, 1);
      setV(Math.round((1 - Math.pow(1 - t, 3)) * target));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return <>{v}</>;
}

function UndNav({ name }: { name: string }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#080603]/95 backdrop-blur border-b border-white/6" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="font-black text-sm text-white tracking-tight">{name}</span>
        <div className="flex items-center gap-5">
          <a href="#demo" className="text-white/40 text-sm hover:text-white/70 transition-colors hidden sm:block">Demo</a>
          <a href="#process" className="text-white/40 text-sm hover:text-white/70 transition-colors hidden sm:block">How it works</a>
          <a href="#contact"><button className="px-5 py-2 rounded-full bg-[#c2440f] text-white text-xs font-bold hover:bg-[#d4521e] transition-all">Sign up free</button></a>
        </div>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TPRM — Command center. Vendor risk heatmap + live terminal.
// ═══════════════════════════════════════════════════════════════════════════════

const VENDOR_GRID = [
  { name: "Salesforce", risk: 0 }, { name: "AWS", risk: 0 }, { name: "Okta", risk: 1 },
  { name: "Zoom", risk: 0 }, { name: "Slack", risk: 0 }, { name: "Datadog", risk: 1 },
  { name: "Stripe", risk: 0 }, { name: "Twilio", risk: 2 }, { name: "GitHub", risk: 0 },
  { name: "Jira", risk: 0 }, { name: "HubSpot", risk: 1 }, { name: "Acme Corp", risk: 3 },
  { name: "DocuSign", risk: 0 }, { name: "Workday", risk: 0 }, { name: "Zendesk", risk: 1 },
  { name: "MongoDB", risk: 0 }, { name: "Netlify", risk: 2 }, { name: "Unknown SaaS", risk: 3 },
];

const RISK_COLOR = ["#10b981", "#f59e0b", "#ef4444", "#ef4444"];
const RISK_LABEL = ["Low", "Medium", "High", "Critical"];

function TprmShowcase({ company, meta }: ShowcaseProps) {
  const [heroVisible, setHeroVisible] = useState(false);
  const [scanIdx, setScanIdx] = useState(-1);
  const { revealRef, visible } = useScrollReveal();

  const terminalLines = [
    "$ tprm-operator scan --vendor=\"Acme Corp\" --depth=full",
    "> Fetching vendor profile...",
    "> Loading 47 risk vectors across 6 domains...",
    "> ISO 27001 ✓   SOC 2 Type II ✓   PCI-DSS ✗",
    "> GDPR gap detected: DPA not executed",
    "> Confidence: 0.81  →  ESCALATE",
    "> Report: tprm-acme-2026.pdf  [2.4 MB]",
  ];
  const { text } = useTyping(terminalLines, heroVisible, 32);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setScanIdx(i);
      i = (i + 1) % VENDOR_GRID.length;
    }, 180);
    return () => clearInterval(interval);
  }, []);

  const scoreVal = useCounter(meta.alignmentScore ?? 36, visible.has("score"), 1600);

  const steps = meta.howItWorks
    ? meta.howItWorks.split(/→|->/).map(s => s.trim()).filter(Boolean)
    : ["Submit vendor profile, contracts & security questionnaire", "Operator maps controls to your risk framework with confidence scores", "Gaps and low-confidence items escalated for human review", "Structured vendor risk report delivered in 48 hours"];

  return (
    <div className="bg-[#010810] text-white min-h-screen" style={{ fontFamily: "'Inter', 'JetBrains Mono', monospace" }}>
      <GlobalStyles />
      <ScrollFix />

      {/* Nav */}
      <TprmNav name={company.name} />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden px-6 pt-20">
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[.045]" style={{ animation: "glow-pulse 7s ease-in-out infinite" }}>
          <defs>
            <pattern id="hex" x="0" y="0" width="56" height="49" patternUnits="userSpaceOnUse">
              <polygon points="28,2 50,14 50,37 28,49 6,37 6,14" fill="none" stroke="#06b6d4" strokeWidth=".6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hex)" />
        </svg>
        {/* Scan line */}
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-50 pointer-events-none" style={{ animation: "scan-h 3.5s linear infinite" }} />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />

        <div className="relative max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center py-20">
          {/* Left */}
          <div style={{ animation: "slide-r 0.85s cubic-bezier(0.22,1,0.36,1) both" }}>
            <div className="inline-flex items-center gap-2 bg-[#06b6d4]/8 border border-[#06b6d4]/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] animate-pulse inline-block" />
              <span className="text-[#06b6d4] text-xs font-bold uppercase tracking-[.2em]">Third-Party Risk Management</span>
            </div>
            <h1 className="text-[clamp(2.5rem,5.5vw,5rem)] font-black leading-[.98] tracking-tight text-white">
              {meta.tagline || <>Vendor risk.<br /><span className="text-[#06b6d4]">Mapped.</span><br />Automated.</>}
            </h1>
            <p className="mt-6 text-white/40 text-base leading-relaxed max-w-md font-sans">
              {meta.plainDescription || "An AI operator that scans every vendor across every risk domain — and only asserts what it can actually verify."}
            </p>
            <div className="mt-10 flex gap-4 font-sans">
              <a href="#contact"><button className="px-7 py-3.5 rounded-lg bg-[#06b6d4] text-black font-bold text-sm hover:bg-[#22d3ee] transition-all active:scale-95">Sign up free</button></a>
              <a href="#process"><button className="px-7 py-3.5 rounded-lg border border-white/12 text-white/45 font-semibold text-sm hover:border-[#06b6d4]/40 hover:text-[#06b6d4] transition-all">How it works</button></a>
            </div>
          </div>

          {/* Right: terminal + heatmap */}
          <div className="space-y-4" style={{ animation: "slide-l 0.85s .15s cubic-bezier(0.22,1,0.36,1) both" }}>
            {/* Terminal */}
            <div className="bg-[#060e1d] border border-[#06b6d4]/15 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(6,182,212,.06)]">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6 bg-black/20">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                <span className="ml-2 text-xs text-white/25">tprm-operator — scan</span>
              </div>
              <div className="p-5 min-h-[180px] text-sm font-mono">
                {text.split("\n").map((line, i) => (
                  <div key={i} className="leading-6">
                    {line.startsWith("$") && <span className="text-[#06b6d4]">{line}</span>}
                    {line.startsWith(">") && <span className="text-white/45">{line}</span>}
                  </div>
                ))}
                <span className="inline-block w-2 h-4 bg-[#06b6d4] ml-0.5 align-middle" style={{ animation: "fade-in .7s step-end infinite" }} />
              </div>
            </div>
            {/* Vendor heatmap */}
            <div className="bg-[#060e1d] border border-white/6 rounded-2xl p-5 font-sans">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-white/30 font-semibold uppercase tracking-wider">Vendor Risk Matrix</p>
                <div className="flex items-center gap-3">
                  {RISK_LABEL.map((l, i) => (
                    <span key={l} className="text-xs flex items-center gap-1" style={{ color: RISK_COLOR[i] }}>
                      <span className="w-1.5 h-1.5 rounded-sm inline-block" style={{ backgroundColor: RISK_COLOR[i] }} />{l}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {VENDOR_GRID.map((v, i) => (
                  <div key={v.name} title={v.name}
                    className="aspect-square rounded-lg flex items-center justify-center transition-all duration-200 cursor-default"
                    style={{
                      backgroundColor: i === scanIdx ? "rgba(6,182,212,.3)" : `${RISK_COLOR[v.risk]}18`,
                      borderWidth: 1,
                      borderColor: i === scanIdx ? "#06b6d4" : `${RISK_COLOR[v.risk]}40`,
                      boxShadow: i === scanIdx ? "0 0 12px rgba(6,182,212,.4)" : "none",
                      transform: i === scanIdx ? "scale(1.08)" : "scale(1)",
                    }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: i === scanIdx ? "#06b6d4" : RISK_COLOR[v.risk] }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="border-y border-[#06b6d4]/10 bg-[#06b6d4]/3 py-10 px-6 font-sans">
        <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x divide-white/6 text-center">
          {[["500+", "Vendor categories"], ["48 hrs", "Assessment turnaround"], ["Zero", "Rubber-stamped reports"]].map(([v, l]) => (
            <div key={l} className="px-8">
              <p className="text-2xl font-extrabold text-[#06b6d4]">{v}</p>
              <p className="text-white/25 text-xs mt-1.5 uppercase tracking-wider">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Demo */}
      <section id="demo" className="py-24 px-6 border-t border-white/5 font-sans">
        <div className="max-w-3xl mx-auto">
          <Reveal><p className="text-[#06b6d4] text-xs font-bold uppercase tracking-[.2em] mb-3">Interactive demo</p></Reveal>
          <Reveal delay={60}><h2 className="text-3xl font-black text-white mb-2">Scan a vendor in real time.</h2></Reveal>
          <Reveal delay={80}><p className="text-white/30 text-sm mb-10">Click "Scan vendor" to watch the operator assess Acme Corp across all risk domains.</p></Reveal>
          <Reveal delay={100}>
            <CompanyDemoWidget
              title="Vendor Risk Scan — Acme Corp"
              subtitle="Full depth scan · 6 risk domains · ISO 27001 + SOC 2 + GDPR"
              accent="#06b6d4"
              bg="rgba(6,14,29,0.98)"
              border="rgba(6,182,212,0.12)"
              buttonLabel="▶ Scan vendor"
              steps={[
                { label: "Vendor profile loaded (Acme Corp)", conf: 99 },
                { label: "SOC 2 Type II report analyzed", conf: 94 },
                { label: "ISO 27001 controls mapped: 41/52", conf: 88 },
                { label: "PCI-DSS: 3 gaps below threshold", flagged: true, detail: "— SAQ-D incomplete" },
                { label: "GDPR DPA: not executed — escalating", flagged: true, detail: "— DPA required" },
                { label: "Vendor risk report generated", conf: 91 },
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="py-28 px-6 font-sans">
        <div className="max-w-4xl mx-auto">
          <Reveal><p className="text-[#06b6d4] text-xs font-bold uppercase tracking-[.2em] mb-3">How the scan works</p></Reveal>
          <Reveal delay={60}><h2 className="text-4xl font-black text-white mb-14">Precision at scale</h2></Reveal>
          <div className="relative">
            <div className="absolute left-4 top-4 bottom-4 w-px bg-gradient-to-b from-[#06b6d4]/40 via-[#06b6d4]/15 to-transparent" />
            <div className="space-y-3 pl-12">
              {steps.map((step, i) => (
                <Reveal key={i} delay={i * 80} anim="slide-r">
                  <div className="group relative">
                    <div className="absolute -left-[2.35rem] top-4 w-5 h-5 rounded-full border-2 border-[#06b6d4]/30 bg-[#010810] flex items-center justify-center group-hover:border-[#06b6d4] transition-all">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]/50 group-hover:bg-[#06b6d4] transition-all" />
                    </div>
                    <div className="bg-white/2 border border-white/6 rounded-xl p-5 hover:border-[#06b6d4]/20 hover:bg-white/4 transition-all">
                      <p className="text-white/55 group-hover:text-white/85 transition-colors">{step}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Alignment */}
      <section className="py-24 px-6 font-sans border-t border-white/5">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-14 items-center">
          <div>
            <Reveal><p className="text-[#06b6d4] text-xs font-bold uppercase tracking-[.2em] mb-3">Zero trust means zero hallucinations</p></Reveal>
            <Reveal delay={60}><h2 className="text-3xl font-black text-white mb-5">Confidence scores on everything.</h2></Reveal>
            <Reveal delay={120}><p className="text-white/40 leading-relaxed text-sm">{meta.alignmentConnection || "Traditional TPRM is checkbox compliance under deadline pressure — rubber-stamped questionnaires. An uncertainty-gated AI only asserts what it can verify. Every claim has a confidence score. Every gap triggers human review."}</p></Reveal>
          </div>
          <Reveal delay={100} anim="slide-l">
            <div ref={revealRef("score") as any} className="bg-[#060e1d] border border-[#06b6d4]/15 rounded-3xl p-10 text-center font-mono">
              <p className="text-white/20 text-xs uppercase tracking-widest mb-6">Alignment Score</p>
              <div className="text-8xl font-black text-[#06b6d4]">{scoreVal}</div>
              <div className="text-white/20 text-xl mt-1">/50</div>
              <div className="mt-6 w-full h-1.5 bg-white/6 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] rounded-full transition-all duration-[2s]"
                  style={{ width: `${(scoreVal / 50) * 100}%` }} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="relative py-28 px-6 font-sans border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 opacity-[.05]"><svg className="w-full h-full"><rect width="100%" height="100%" fill="url(#hex)" /></svg></div>
        <div className="relative max-w-xl mx-auto text-center space-y-7">
          <h2 className="text-4xl font-black text-white">Map your vendor risk. Automatically.</h2>
          <p className="text-white/35">Create a free account and start immediately.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <input type="email" placeholder="security@company.com" className="flex-1 max-w-xs bg-white/5 border border-white/10 rounded-lg px-5 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#06b6d4]/50 transition-all" />
            <button className="px-7 py-3.5 rounded-lg bg-[#06b6d4] text-black font-bold text-sm hover:bg-[#22d3ee] transition-all">Notify me</button>
          </div>
        </div>
      </section>
      <ShowcaseFooter name={company.name} />
    </div>
  );
}

function TprmNav({ name }: { name: string }) {
  const [s, setS] = useState(false);
  useEffect(() => { const fn = () => setS(window.scrollY > 40); window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn); }, []);
  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${s ? "bg-[#010810]/95 backdrop-blur border-b border-white/6" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="font-black text-sm text-white tracking-tight font-sans">{name}</span>
        <div className="flex items-center gap-5">
          <a href="#demo" className="text-white/35 text-sm hover:text-white/60 transition-colors hidden sm:block font-sans">Demo</a>
          <a href="#contact"><button className="px-5 py-2 rounded-lg bg-[#06b6d4] text-black text-xs font-bold hover:bg-[#22d3ee] transition-all">Sign up free</button></a>
        </div>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESG — Light, nature, animated SVG chart in hero. Data-driven sustainability.
// ═══════════════════════════════════════════════════════════════════════════════

function EsgShowcase({ company, meta }: ShowcaseProps) {
  const [mounted, setMounted] = useState(false);
  const { revealRef, visible } = useScrollReveal();
  const scoreVal = useCounter(meta.alignmentScore ?? 38, visible.has("score"), 1600);
  const score = meta.alignmentScore ?? 38;
  const circ = 2 * Math.PI * 44;
  const offset = circ - (score / 50) * circ;

  useEffect(() => { const t = setTimeout(() => setMounted(true), 300); return () => clearTimeout(t); }, []);

  const steps = meta.howItWorks
    ? meta.howItWorks.split(/→|->/).map(s => s.trim()).filter(Boolean)
    : ["Upload sustainability report (PDF, XBRL, raw data)", "Operator maps each disclosure to ESRS / GRI / TCFD frameworks", "Uncertain claims confidence-gated and flagged for review", "Verified disclosure report with gap analysis in 24 hours"];

  const frameworks = ["ESRS", "GRI", "TCFD", "CSRD", "ISSB", "CDP", "SASB"];

  // SVG chart path for an animated "emissions going down" chart
  const chartPath = "M0,80 C40,75 80,65 120,55 C160,45 200,30 240,22 C280,14 320,18 360,12 C400,6 440,8 480,4";

  return (
    <div className="bg-white text-gray-900 font-sans min-h-screen">
      <GlobalStyles />
      <ScrollFix />

      {/* Nav */}
      <EsgNav name={company.name} />

      {/* ── Hero ── full green */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(145deg, #052e16 0%, #14532d 40%, #166534 70%, #15803d 100%)", minHeight: "100vh", display: "flex", alignItems: "center" }}>
        <svg className="absolute inset-0 w-full h-full opacity-[.05] pointer-events-none">
          <defs>
            <pattern id="leaf" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M40 8 Q64 20 64 40 Q64 64 40 72 Q16 64 16 40 Q16 20 40 8Z" fill="white" />
              <line x1="40" y1="8" x2="40" y2="72" stroke="green" strokeWidth=".8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#leaf)" />
        </svg>
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #4ade80, transparent)" }} />

        <div className="relative max-w-7xl mx-auto px-6 py-28 grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left */}
          <div style={{ animation: "slide-r 0.9s cubic-bezier(0.22,1,0.36,1) both" }}>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8">
              <span className="text-sm">🌱</span>
              <span className="text-white/80 text-xs font-bold uppercase tracking-[.2em]">ESG Disclosure, Verified</span>
            </div>
            <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] font-extrabold leading-[1.02] text-white tracking-tight">
              {meta.tagline || <>Sustainability reports.<br />Verified in <span className="text-[#a3e635]">24 hours.</span></>}
            </h1>
            <p className="mt-6 text-white/55 text-lg leading-relaxed max-w-md">
              {meta.plainDescription || "An AI operator that maps every sustainability disclosure to ESRS, GRI, and TCFD — and never overstates what it can verify."}
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {frameworks.map((f, i) => (
                <span key={f} className="bg-white/12 border border-white/20 rounded-full px-3.5 py-1.5 text-white/70 text-xs font-semibold"
                  style={{ animation: `fade-up 0.45s ${400 + i * 55}ms both` }}>
                  {f}
                </span>
              ))}
            </div>
            <div className="mt-10 flex gap-4">
              <a href="#contact"><button className="px-8 py-4 rounded-full bg-white text-[#14532d] font-black text-sm hover:bg-[#f0fdf4] hover:shadow-[0_0_40px_rgba(255,255,255,.3)] transition-all active:scale-95">Sign up free</button></a>
              <a href="#process"><button className="px-8 py-4 rounded-full border border-white/20 text-white/60 text-sm font-semibold hover:border-white/40 hover:text-white/90 transition-all">How it works</button></a>
            </div>
          </div>

          {/* Right: score ring + animated chart */}
          <div className="flex flex-col items-center gap-8" style={{ animation: "slide-l 0.9s .2s cubic-bezier(0.22,1,0.36,1) both" }}>
            {/* Circular score */}
            <div className="relative">
              <div className="absolute inset-[-16px] rounded-full border-2 border-white/8" style={{ animation: "pulse-ring 3s ease-out infinite" }} />
              <div className="absolute inset-[-32px] rounded-full border border-white/4" style={{ animation: "pulse-ring 3s ease-out 1.1s infinite" }} />
              <svg width="200" height="200" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="4" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="#a3e635" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={mounted ? offset : circ}
                  transform="rotate(-90 50 50)"
                  style={{ transition: "stroke-dashoffset 2.2s cubic-bezier(0.22,1,0.36,1)" }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="text-4xl font-black">{mounted ? score : 0}</div>
                <div className="text-white/40 text-xs mt-0.5">/50 score</div>
                <div className="text-[#a3e635] text-xs font-bold uppercase tracking-wider mt-2">Alignment</div>
              </div>
            </div>
            {/* SVG emissions chart */}
            <div className="bg-white/8 border border-white/15 rounded-2xl p-5 w-full">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">GHG Emissions Trajectory</p>
              <svg viewBox="0 0 480 90" className="w-full" style={{ height: 70 }}>
                <defs>
                  <linearGradient id="esg-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a3e635" stopOpacity=".25" />
                    <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${chartPath} L480,90 L0,90 Z`} fill="url(#esg-grad)" />
                <path d={chartPath} fill="none" stroke="#a3e635" strokeWidth="2.5" strokeLinecap="round"
                  style={mounted ? { strokeDasharray: 600, strokeDashoffset: 0, transition: "stroke-dashoffset 2s .3s ease-out", } : { strokeDasharray: 600, strokeDashoffset: 600 }} />
                <text x="0" y="87" fill="rgba(255,255,255,.3)" fontSize="9">2020</text>
                <text x="220" y="87" fill="rgba(255,255,255,.3)" fontSize="9">2023</text>
                <text x="455" y="87" fill="rgba(255,255,255,.3)" fontSize="9">2026</text>
              </svg>
              <p className="text-[#a3e635] text-xs mt-2 font-semibold">↓ 38% scope 1+2 reduction verified</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-[#f0fdf4] py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x divide-gray-200 text-center">
          {[["24 hrs", "Report turnaround"], ["7 frameworks", "ESRS + GRI + TCFD + more"], ["Zero greenwashing", "Uncertainty gating by design"]].map(([v, l]) => (
            <div key={l} className="px-8">
              <p className="text-2xl font-extrabold text-[#15803d]">{v}</p>
              <p className="text-gray-400 text-xs mt-1.5 uppercase tracking-wider">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo */}
      <section id="demo" className="py-24 px-6 bg-[#f0fdf4] border-t border-[#15803d]/10">
        <div className="max-w-3xl mx-auto">
          <Reveal><p className="text-[#15803d] text-xs font-bold uppercase tracking-[.2em] mb-3">Interactive demo</p></Reveal>
          <Reveal delay={60}><h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Verify a disclosure in 24 hours.</h2></Reveal>
          <Reveal delay={80}><p className="text-gray-500 text-sm mb-10">Click "Verify disclosures" to see the operator map a sustainability report to GRI and TCFD frameworks.</p></Reveal>
          <Reveal delay={100}>
            <CompanyDemoWidget
              title="ESG Disclosure Verification — FY2025 Sustainability Report"
              subtitle="GRI 305 emissions · TCFD climate risk · CSRD compliance"
              accent="#4ade80"
              bg="rgba(5,46,22,0.97)"
              border="rgba(74,222,128,0.15)"
              buttonLabel="▶ Verify disclosures"
              steps={[
                { label: "Sustainability PDF ingested (47 pages)", conf: 99 },
                { label: "GHG Scope 1+2 emissions data extracted", conf: 96 },
                { label: "GRI 305: emissions mapped to framework", conf: 91 },
                { label: "TCFD: physical risk disclosure uncertain", flagged: true, detail: "— scenario analysis missing" },
                { label: "CSRD ESRS E1 alignment: 83% mapped", conf: 83 },
                { label: "Verified disclosure report generated", conf: 94 },
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="py-28 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal><p className="text-[#15803d] text-xs font-bold uppercase tracking-[.2em] mb-3">Verification pipeline</p></Reveal>
          <Reveal delay={60}><h2 className="text-4xl font-bold text-gray-900 mb-14 tracking-tight">From report to verified in 24 hours</h2></Reveal>
          <div className="grid sm:grid-cols-2 gap-5">
            {steps.map((step, i) => (
              <Reveal key={i} delay={i * 80} anim="fade-up">
                <div className="group p-7 rounded-3xl border border-gray-100 bg-white hover:border-[#15803d]/20 hover:bg-[#f0fdf4] transition-all h-full">
                  <div className="w-10 h-10 rounded-2xl bg-[#15803d]/10 flex items-center justify-center text-[#15803d] font-black text-lg mb-5 group-hover:bg-[#15803d]/20 transition-all">{i + 1}</div>
                  <p className="text-gray-600 text-sm leading-relaxed">{step}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Alignment */}
      <section className="py-28 px-6 bg-[#f0fdf4]">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-16 items-center">
          <div>
            <Reveal><p className="text-[#15803d] text-xs font-bold uppercase tracking-[.2em] mb-3">Why aligned AI wins here</p></Reveal>
            <Reveal delay={60}><h2 className="text-3xl font-bold text-gray-900 mb-5 tracking-tight">Aligned AI makes sustainability credible.</h2></Reveal>
            <Reveal delay={120}><p className="text-gray-500 leading-relaxed text-sm">{meta.alignmentConnection || "Greenwashing destroys trust. An AI that refuses to validate what it can't verify — that escalates uncertain claims rather than rubber-stamping them — is the only kind credible enough for regulatory disclosure."}</p></Reveal>
            <Reveal delay={180}>
              <ul className="mt-7 space-y-3">
                {["Uncertainty gating prevents greenwashing by design", "Every claim mapped to a framework with a confidence score", "Humans review all edge cases — AI never overstates"].map((p, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600">
                    <span className="text-[#15803d] shrink-0 font-bold">✓</span>{p}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal delay={100} anim="slide-l">
            <div ref={revealRef("score") as any} className="bg-white border border-[#15803d]/15 rounded-3xl p-10 shadow-sm">
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-6">Meta-Engine Alignment Score</p>
              <div className="text-8xl font-black text-[#15803d]">{scoreVal}</div>
              <div className="text-gray-300 text-xl mt-1">/50</div>
              <div className="mt-5 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#15803d] to-[#a3e635] rounded-full transition-all duration-[2s]"
                  style={{ width: `${(scoreVal / 50) * 100}%` }} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="relative py-28 px-6 overflow-hidden" style={{ background: "linear-gradient(145deg, #052e16, #166534)" }}>
        <svg className="absolute inset-0 w-full h-full opacity-[.05] pointer-events-none"><rect width="100%" height="100%" fill="url(#leaf)" /></svg>
        <div className="relative max-w-xl mx-auto text-center space-y-7">
          <h2 className="text-4xl font-extrabold text-white">Start verifying disclosures today.</h2>
          <p className="text-white/45">Create a free account and start immediately.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <input type="email" placeholder="you@company.com" className="flex-1 max-w-xs bg-white/10 border border-white/20 rounded-full px-5 py-3.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/50 transition-all" />
            <button className="px-7 py-3.5 rounded-full bg-white text-[#14532d] font-bold text-sm hover:bg-[#f0fdf4] hover:shadow-[0_0_30px_rgba(255,255,255,.25)] transition-all">Notify me</button>
          </div>
        </div>
      </section>
      <ShowcaseFooter name={company.name} />
    </div>
  );
}

function EsgNav({ name }: { name: string }) {
  const [s, setS] = useState(false);
  useEffect(() => { const fn = () => setS(window.scrollY > 40); window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn); }, []);
  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${s ? "bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className={`font-bold text-sm transition-colors ${s ? "text-gray-900" : "text-white"}`}>{name}</span>
        <a href="#contact"><button className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${s ? "bg-[#15803d] text-white hover:bg-[#166534]" : "bg-white text-[#14532d] hover:bg-[#f0fdf4]"}`}>Sign up free</button></a>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEDICAL BILLING — "The number is the product." Giant 99.2% as hero.
// ═══════════════════════════════════════════════════════════════════════════════

const BILLING_CODES = [
  { code: "99213", desc: "Office visit, established", status: "ok" },
  { code: "99214", desc: "Office visit, established — UPCODED", status: "error" },
  { code: "93000", desc: "Electrocardiogram, routine", status: "ok" },
  { code: "99091", desc: "Collection/interpretation — MISSING MODIFIER", status: "warn" },
  { code: "99232", desc: "Subsequent hospital care", status: "ok" },
  { code: "G0463", desc: "Hospital outpatient clinic visit", status: "error" },
];

function MedicalShowcase({ company, meta }: ShowcaseProps) {
  const { revealRef, visible } = useScrollReveal();
  const [scanIdx, setScanIdx] = useState(-1);
  const [scanned, setScanned] = useState<Set<number>>(new Set());

  // The accuracy counter — fix: use revealRef so the observer fires
  const rawCount = useCounter(992, visible.has("bignum"), 2400);
  const recoveredCount = useCounter(50, visible.has("recovered"), 1800);
  const scoreVal = useCounter(meta.alignmentScore ?? 33, visible.has("score"), 1600);

  // Billing scan animation
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setScanIdx(i);
      setScanned(prev => new Set([...prev, i]));
      i++;
      if (i >= BILLING_CODES.length) { clearInterval(interval); setScanIdx(-1); }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const steps = meta.howItWorks
    ? meta.howItWorks.split(/→|->/).map(s => s.trim()).filter(Boolean)
    : ["Submit clinical notes, superbills, and EOBs", "Operator cross-references CPT / ICD-10 codes against documentation", "Confidence-gated: uncertain codes flagged for coder review", "Audit report with corrected codes and recovered revenue"];

  return (
    <div className="bg-white text-gray-900 font-sans min-h-screen">
      <GlobalStyles />
      <ScrollFix />
      <MedNav name={company.name} />

      {/* ── Hero: THE NUMBER ── */}
      <section className="relative overflow-hidden" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, #f0fdfa 0%, #ffffff 100%)" }}>
        <svg className="absolute inset-0 w-full h-full opacity-[.03] pointer-events-none">
          <defs><pattern id="mg" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0L0 0 0 32" fill="none" stroke="#0f766e" strokeWidth=".5" />
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#mg)" />
        </svg>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(ellipse, #99f6e4, transparent)" }} />

        <div className="relative max-w-5xl mx-auto px-6 text-center" style={{ animation: "fade-up 0.9s cubic-bezier(0.22,1,0.36,1) both" }}>
          <p className="text-[#0f766e] text-sm font-bold uppercase tracking-[.25em] mb-6">Medical Billing Audit · AI-Powered</p>
          {/* Giant number */}
          <div ref={revealRef("bignum") as any} className="tabular-nums leading-none font-black tracking-tighter"
            style={{ fontSize: "clamp(5rem, 22vw, 18rem)", color: "#0f766e" }}>
            {(rawCount / 10).toFixed(1)}%
          </div>
          <p className="text-gray-400 text-xl mt-4 font-medium">code accuracy rate. Consistently.</p>
          <p className="text-gray-400 text-base mt-2 max-w-lg mx-auto leading-relaxed">
            {meta.plainDescription || "An AI operator that cross-references every CPT and ICD-10 code against clinical documentation — and escalates what it can't verify."}
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <a href="#contact"><button className="px-8 py-4 rounded-xl bg-[#0f766e] text-white font-bold text-sm hover:bg-[#0d9488] hover:shadow-[0_4px_30px_rgba(15,118,110,.4)] transition-all active:scale-95">Open app →</button></a>
            <a href="#process"><button className="px-8 py-4 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm hover:border-[#0f766e]/40 hover:text-[#0f766e] transition-all">How it works</button></a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-30" style={{ animation: "fade-up 1s 1s both" }}>
          <span className="text-xs text-gray-400 uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gray-300" style={{ animation: "shimmer-bg 1.5s ease-in-out infinite" }} />
        </div>
      </section>

      {/* Live billing scan demo */}
      <section className="py-20 px-6 bg-[#f0fdfa] border-t border-[#0f766e]/10">
        <div className="max-w-4xl mx-auto">
          <Reveal><p className="text-center text-[#0f766e] text-xs font-bold uppercase tracking-[.2em] mb-2">Live audit preview</p></Reveal>
          <Reveal delay={60}><h2 className="text-center text-3xl font-bold text-gray-900 mb-10 tracking-tight">Billing codes, reviewed in real time</h2></Reveal>
          <Reveal delay={100}>
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Superbill Review — Patient Encounter 2026-03-14</span>
                <span className="text-xs text-[#0f766e] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0f766e] animate-pulse inline-block" />Scanning
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {BILLING_CODES.map((row, i) => (
                  <div key={row.code} className="flex items-center gap-4 px-6 py-4 transition-all duration-300"
                    style={{ backgroundColor: i === scanIdx ? "rgba(15,118,110,.04)" : "transparent" }}>
                    <span className="font-mono text-sm font-bold text-gray-900 w-16 shrink-0">{row.code}</span>
                    <span className="text-sm text-gray-500 flex-1">{row.desc}</span>
                    {scanned.has(i) ? (
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold shrink-0 transition-all`}
                        style={{
                          animation: `check-pop .35s ease-out both`,
                          backgroundColor: row.status === "ok" ? "#f0fdf4" : row.status === "error" ? "#fff1f2" : "#fffbeb",
                          color: row.status === "ok" ? "#15803d" : row.status === "error" ? "#be123c" : "#b45309",
                        }}>
                        {row.status === "ok" ? "✓ Verified" : row.status === "error" ? "✗ Error flagged" : "⚠ Modifier missing"}
                      </span>
                    ) : i === scanIdx ? (
                      <span className="text-xs text-[#0f766e] px-3 py-1 rounded-full bg-[#f0fdfa] font-semibold animate-pulse shrink-0">Scanning…</span>
                    ) : (
                      <span className="text-xs text-gray-300 px-3 py-1 rounded-full bg-gray-50 font-semibold shrink-0">Queued</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-t border-gray-100">
        <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x divide-gray-100 text-center">
          <div ref={revealRef("recovered") as any} className="px-8">
            <p className="text-3xl font-black text-gray-900">${recoveredCount}k+</p>
            <p className="text-gray-400 text-xs mt-1.5 uppercase tracking-wider">Avg. recovered per audit</p>
          </div>
          <div className="px-8">
            <p className="text-3xl font-black text-[#0f766e]">24 hrs</p>
            <p className="text-gray-400 text-xs mt-1.5 uppercase tracking-wider">Audit turnaround</p>
          </div>
          <div className="px-8">
            <p className="text-3xl font-black text-gray-900">6 types</p>
            <p className="text-gray-400 text-xs mt-1.5 uppercase tracking-wider">Billing errors detected</p>
          </div>
        </div>
      </section>

      {/* Demo */}
      <section id="demo" className="py-24 px-6 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <Reveal><p className="text-[#0f766e] text-xs font-bold uppercase tracking-[.2em] mb-3">Interactive demo</p></Reveal>
          <Reveal delay={60}><h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Audit a superbill in real time.</h2></Reveal>
          <Reveal delay={80}><p className="text-gray-500 text-sm mb-10">Click "Run audit" to watch the operator cross-reference CPT codes against clinical documentation.</p></Reveal>
          <Reveal delay={100}>
            <CompanyDemoWidget
              title="Billing Audit — Patient Encounter 2026-03-14"
              subtitle="CPT code verification · ICD-10 cross-reference · modifier check"
              accent="#2dd4bf"
              bg="rgba(10,60,55,0.97)"
              border="rgba(45,212,191,0.15)"
              buttonLabel="▶ Run audit"
              steps={[
                { label: "Superbill ingested: 6 CPT codes", conf: 99 },
                { label: "99213 Office visit: documentation matches", conf: 97 },
                { label: "99214 Office visit: upcoding detected", flagged: true, detail: "— complexity mismatch" },
                { label: "93000 ECG: documentation verified", conf: 95 },
                { label: "99091 Remote monitoring: modifier missing", flagged: true, detail: "— modifier 95 required" },
                { label: "Corrected superbill report generated", conf: 96 },
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="py-28 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <Reveal><p className="text-[#0f766e] text-xs font-bold uppercase tracking-[.2em] mb-3">Process</p></Reveal>
          <Reveal delay={60}><h2 className="text-4xl font-bold text-gray-900 mb-14 tracking-tight">Precision, step by step</h2></Reveal>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <Reveal key={i} delay={i * 80} anim="fade-up">
                <div className="group flex items-start gap-5 p-6 rounded-2xl border border-gray-100 hover:border-[#0f766e]/20 hover:bg-[#f0fdfa]/50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-[#0f766e]/8 flex items-center justify-center font-black text-[#0f766e] shrink-0 group-hover:bg-[#0f766e]/15 transition-all">{i + 1}</div>
                  <p className="text-gray-600 group-hover:text-gray-800 transition-colors pt-2 text-sm leading-relaxed">{step}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Alignment */}
      <section className="py-28 px-6 bg-[#f0fdfa]">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-14 items-center">
          <div>
            <Reveal><p className="text-[#0f766e] text-xs font-bold uppercase tracking-[.2em] mb-3">Aligned AI in healthcare</p></Reveal>
            <Reveal delay={60}><h2 className="text-3xl font-bold text-gray-900 mb-5 tracking-tight">Billing accuracy is a patient safety issue.</h2></Reveal>
            <Reveal delay={120}><p className="text-gray-500 leading-relaxed text-sm">{meta.alignmentConnection || "Incorrect codes don't just cost revenue — they create audit risk, payer disputes, and compliance exposure. An AI that escalates uncertain codes rather than guessing is the only kind that belongs in healthcare billing."}</p></Reveal>
          </div>
          <Reveal delay={100} anim="slide-l">
            <div ref={revealRef("score") as any} className="bg-white border border-[#0f766e]/15 rounded-3xl p-10 shadow-sm">
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-6">Meta-Engine Alignment Score</p>
              <div className="text-8xl font-black text-[#0f766e]">{scoreVal}</div>
              <div className="text-gray-300 text-xl mt-1">/50</div>
              <div className="mt-5 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#0f766e] to-[#2dd4bf] rounded-full transition-all duration-[2s]"
                  style={{ width: `${(scoreVal / 50) * 100}%` }} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-28 px-6 bg-[#0f766e]">
        <div className="max-w-xl mx-auto text-center space-y-7">
          <h2 className="text-4xl font-extrabold text-white">Recover revenue. Reduce audit risk.</h2>
          <p className="text-white/55">Create a free account and start immediately.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <input type="email" placeholder="billing@practice.com" className="flex-1 max-w-xs bg-white/12 border border-white/20 rounded-xl px-5 py-3.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/50 transition-all" />
            <button className="px-7 py-3.5 rounded-xl bg-white text-[#0f766e] font-bold text-sm hover:bg-gray-50 hover:shadow-lg transition-all">Notify me</button>
          </div>
        </div>
      </section>
      <ShowcaseFooter name={company.name} />
    </div>
  );
}

function MedNav({ name }: { name: string }) {
  const [s, setS] = useState(false);
  useEffect(() => { const fn = () => setS(window.scrollY > 40); window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn); }, []);
  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${s ? "bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className={`font-bold text-sm transition-colors ${s ? "text-gray-900" : "text-[#0f766e]"}`}>{name}</span>
        <a href="#contact"><button className="px-5 py-2 rounded-xl bg-[#0f766e] text-white text-xs font-bold hover:bg-[#0d9488] transition-all">Sign up free</button></a>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLIANCE — "From chaos to audit-ready." Split-screen hero, gold checks.
// ═══════════════════════════════════════════════════════════════════════════════

const SOC2_CONTROLS = [
  { id: "CC6.1", label: "Logical access controls", category: "Common Criteria" },
  { id: "CC6.2", label: "Authentication controls", category: "Common Criteria" },
  { id: "CC6.3", label: "Authorization & provisioning", category: "Common Criteria" },
  { id: "CC7.1", label: "System monitoring", category: "Change Mgmt" },
  { id: "CC7.2", label: "Anomaly detection", category: "Change Mgmt" },
  { id: "CC8.1", label: "Change management process", category: "Change Mgmt" },
  { id: "A1.1", label: "Availability commitments", category: "Availability" },
];

function ComplianceShowcase({ company, meta }: ShowcaseProps) {
  const { revealRef, visible } = useScrollReveal();
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const scoreVal = useCounter(meta.alignmentScore ?? 30, visible.has("score"), 1600);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    SOC2_CONTROLS.forEach((_, i) => {
      timers.push(setTimeout(() => setCheckedItems(prev => new Set([...prev, i])), 600 + i * 350));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  const steps = meta.howItWorks
    ? meta.howItWorks.split(/→|->/).map(s => s.trim()).filter(Boolean)
    : ["Upload evidence package (screenshots, logs, policies)", "Operator maps each artifact to SOC 2 controls with confidence scores", "Gaps and low-confidence mappings escalated for human review", "Audit-ready gap analysis report delivered in 24 hours"];

  const evidenceItems = ["Screenshot-01.png", "access_policy_v3.pdf", "infosec_training.csv", "pen_test_report.pdf", "vendor_agreements/", "sso_config.json"];

  return (
    <div className="text-white font-sans min-h-screen" style={{ background: "#0b1628" }}>
      <GlobalStyles />
      <ScrollFix />
      <CompNav name={company.name} />

      {/* ── Hero: split — evidence chaos LEFT, controls board RIGHT ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden px-6 pt-20">
        <svg className="absolute inset-0 w-full h-full opacity-[.04] pointer-events-none">
          <defs><pattern id="cdocs" x="0" y="0" width="52" height="60" patternUnits="userSpaceOnUse">
            <rect x="10" y="7" width="32" height="44" rx="2" fill="none" stroke="white" strokeWidth=".7" />
            <line x1="16" y1="18" x2="36" y2="18" stroke="white" strokeWidth=".5" />
            <line x1="16" y1="25" x2="36" y2="25" stroke="white" strokeWidth=".5" />
            <line x1="16" y1="32" x2="28" y2="32" stroke="white" strokeWidth=".5" />
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#cdocs)" />
        </svg>
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }} />

        <div className="relative max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center py-16">
          {/* Left: headline + evidence chaos visualization */}
          <div style={{ animation: "slide-r 0.9s cubic-bezier(0.22,1,0.36,1) both" }}>
            <div className="flex items-center gap-2 mb-7">
              <div className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
              <p className="text-white/35 text-xs font-bold uppercase tracking-[.25em]">SOC 2 · ISO 27001 · HIPAA</p>
            </div>
            <h1 className="text-[clamp(2.5rem,5.5vw,5rem)] font-black leading-[.98] text-white tracking-tight">
              {meta.tagline || <>Audit-ready.<br /><span className="text-[#f59e0b]">Always.</span></>}
            </h1>
            <p className="mt-6 text-white/40 text-base leading-relaxed max-w-md">
              {meta.plainDescription || "An AI operator that maps your evidence to every control, flags every gap, and delivers an audit-ready report in 24 hours — not 6 months."}
            </p>
            <div className="mt-8 flex gap-4">
              <a href="#contact"><button className="px-8 py-4 rounded-xl bg-[#f59e0b] text-black font-bold text-sm hover:bg-[#fbbf24] hover:shadow-[0_4px_30px_rgba(245,158,11,.4)] transition-all active:scale-95">Open app →</button></a>
              <a href="#process"><button className="px-8 py-4 rounded-xl border border-white/12 text-white/45 font-semibold text-sm hover:border-[#f59e0b]/40 hover:text-[#f59e0b] transition-all">How it works</button></a>
            </div>

            {/* Evidence chaos — before state */}
            <div className="mt-12">
              <p className="text-white/25 text-xs uppercase tracking-widest mb-4">Your evidence package</p>
              <div className="flex flex-wrap gap-2">
                {evidenceItems.map((item, i) => (
                  <div key={item} className="flex items-center gap-2 bg-white/4 border border-white/8 rounded-lg px-3 py-2"
                    style={{ animation: `fade-up .4s ${i * 80}ms both` }}>
                    <span className="text-white/25 text-xs">📄</span>
                    <span className="text-white/50 text-xs font-mono">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-4">
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                <span className="text-white/20 text-xs uppercase tracking-wider">mapped by operator →</span>
                <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent" />
              </div>
            </div>
          </div>

          {/* Right: controls board with animated checkmarks */}
          <div style={{ animation: "slide-l 0.9s .15s cubic-bezier(0.22,1,0.36,1) both" }}>
            <div className="bg-white/4 border border-white/8 rounded-3xl overflow-hidden shadow-2xl backdrop-blur">
              <div className="border-b border-white/8 px-6 py-4 flex items-center justify-between">
                <span className="text-white/60 text-sm font-semibold">SOC 2 Type II Controls</span>
                <span className="text-xs text-[#f59e0b] font-bold">{checkedItems.size}/{SOC2_CONTROLS.length} mapped</span>
              </div>
              <div className="p-4 space-y-2">
                {SOC2_CONTROLS.map((ctrl, i) => (
                  <div key={ctrl.id}
                    className="flex items-center gap-4 p-3.5 rounded-xl transition-all duration-500"
                    style={{ backgroundColor: checkedItems.has(i) ? "rgba(245,158,11,.06)" : "rgba(255,255,255,.02)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300"
                      style={{ backgroundColor: checkedItems.has(i) ? "rgba(245,158,11,.15)" : "rgba(255,255,255,.05)" }}>
                      {checkedItems.has(i) ? (
                        <span className="text-[#f59e0b] text-sm font-black" style={{ animation: "check-pop .35s ease-out both" }}>✓</span>
                      ) : (
                        <span className="w-3 h-3 rounded-sm border border-white/15 block" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-sm font-semibold">{ctrl.label}</p>
                      <p className="text-white/25 text-xs mt-0.5">{ctrl.id} · {ctrl.category}</p>
                    </div>
                    {checkedItems.has(i) && (
                      <span className="text-xs text-emerald-400/70 font-medium shrink-0" style={{ animation: "fade-in .4s both" }}>Evidence mapped</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t border-white/6 px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/30 text-xs">Compliance coverage</span>
                  <span className="text-[#f59e0b] text-xs font-bold">{Math.round((checkedItems.size / SOC2_CONTROLS.length) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/6 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#f59e0b] to-[#fde68a] rounded-full transition-all duration-700"
                    style={{ width: `${(checkedItems.size / SOC2_CONTROLS.length) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="border-y border-[#f59e0b]/10 bg-[#f59e0b]/3 py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x divide-white/6 text-center">
          {[["24 hrs", "From chaos to audit-ready"], ["SOC 2 + ISO 27001", "Frameworks covered"], ["Human-gated", "All uncertain mappings"]].map(([v, l]) => (
            <div key={l} className="px-8">
              <p className="text-xl font-extrabold text-[#f59e0b]">{v}</p>
              <p className="text-white/25 text-xs mt-1.5 uppercase tracking-wider">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Demo */}
      <section id="demo" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <Reveal><p className="text-[#f59e0b] text-xs font-bold uppercase tracking-[.2em] mb-3">Interactive demo</p></Reveal>
          <Reveal delay={60}><h2 className="text-3xl font-black text-white mb-2">Run a compliance assessment.</h2></Reveal>
          <Reveal delay={80}><p className="text-white/35 text-sm mb-10">Click "Run assessment" to see the operator map an evidence package to SOC 2 Type II controls.</p></Reveal>
          <Reveal delay={100}>
            <CompanyDemoWidget
              title="SOC 2 Type II Gap Assessment"
              subtitle="Evidence package: 6 files · CC6.x + CC7.x + A1.x controls"
              accent="#f59e0b"
              bg="rgba(11,22,40,0.98)"
              border="rgba(245,158,11,0.12)"
              buttonLabel="▶ Run assessment"
              steps={[
                { label: "Evidence package ingested (6 files)", conf: 99 },
                { label: "CC6.1 Logical access: access_policy_v3.pdf mapped", conf: 96 },
                { label: "CC6.2 Authentication: SSO config verified", conf: 93 },
                { label: "CC7.1 Monitoring: log retention gap detected", flagged: true, detail: "— 30-day gap in coverage" },
                { label: "A1.1 Availability: uptime SLA mapped", conf: 89 },
                { label: "Gap analysis report generated", conf: 95 },
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <Reveal><p className="text-[#f59e0b] text-xs font-bold uppercase tracking-[.2em] mb-3">The pipeline</p></Reveal>
          <Reveal delay={60}><h2 className="text-4xl font-black text-white mb-14">Evidence to audit report</h2></Reveal>
          <div className="grid sm:grid-cols-2 gap-4">
            {steps.map((step, i) => (
              <Reveal key={i} delay={i * 80} anim="fade-up">
                <div className="group p-7 rounded-2xl border border-white/6 bg-white/2 hover:border-[#f59e0b]/20 hover:bg-white/4 transition-all h-full">
                  <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b] font-black text-lg mb-5 group-hover:bg-[#f59e0b]/20 transition-all">{i + 1}</div>
                  <p className="text-white/55 text-sm leading-relaxed group-hover:text-white/80 transition-colors">{step}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Alignment */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-14 items-center">
          <div>
            <Reveal><p className="text-[#f59e0b] text-xs font-bold uppercase tracking-[.2em] mb-3">Why aligned AI wins here</p></Reveal>
            <Reveal delay={60}><h2 className="text-3xl font-black text-white mb-5">Uncertainty gating IS the compliance product.</h2></Reveal>
            <Reveal delay={120}><p className="text-white/40 leading-relaxed text-sm">{meta.alignmentConnection || "Compliance failures happen when AI overstates coverage. An AI that flags what it can't verify — rather than filling in blanks — is the only kind that passes a real audit. Honest uncertainty is a feature, not a limitation."}</p></Reveal>
            <Reveal delay={180}>
              <ul className="mt-7 space-y-3">
                {["Every evidence mapping has a confidence score", "Gaps escalated to humans, never glossed over", "Audit-ready output means auditors trust the output"].map((p, i) => (
                  <li key={i} className="flex gap-3 text-sm text-white/50">
                    <span className="text-[#f59e0b] shrink-0">✓</span>{p}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal delay={100} anim="slide-l">
            <div ref={revealRef("score") as any} className="bg-white/4 border border-[#f59e0b]/12 rounded-3xl p-10 text-center">
              <p className="text-white/25 text-xs uppercase tracking-widest mb-6">Alignment Score</p>
              <div className="text-8xl font-black text-[#f59e0b]">{scoreVal}</div>
              <div className="text-white/20 text-xl mt-1">/50</div>
              <div className="mt-5 w-full h-1.5 bg-white/6 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#f59e0b] to-[#fde68a] rounded-full transition-all duration-[2s]"
                  style={{ width: `${(scoreVal / 50) * 100}%` }} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="relative py-28 px-6 overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)" }}>
        <div className="absolute inset-0 opacity-[.04]"><svg className="w-full h-full"><rect width="100%" height="100%" fill="url(#cdocs)" /></svg></div>
        <div className="relative max-w-xl mx-auto text-center space-y-7">
          <h2 className="text-4xl font-black text-white">From evidence chaos to audit-ready.</h2>
          <p className="text-white/40">Create a free account and start immediately.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <input type="email" placeholder="security@company.com" className="flex-1 max-w-xs bg-white/8 border border-white/12 rounded-xl px-5 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#f59e0b]/60 transition-all" />
            <button className="px-7 py-3.5 rounded-xl bg-[#f59e0b] text-black font-bold text-sm hover:bg-[#fbbf24] hover:shadow-[0_0_30px_rgba(245,158,11,.4)] transition-all">Notify me</button>
          </div>
        </div>
      </section>
      <ShowcaseFooter name={company.name} />
    </div>
  );
}

function CompNav({ name }: { name: string }) {
  const [s, setS] = useState(false);
  useEffect(() => { const fn = () => setS(window.scrollY > 40); window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn); }, []);
  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${s ? "bg-[#0b1628]/95 backdrop-blur border-b border-white/6" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="font-black text-sm text-white">{name}</span>
        <a href="#contact"><button className="px-5 py-2 rounded-xl bg-[#f59e0b] text-black text-xs font-bold hover:bg-[#fbbf24] transition-all">Sign up free</button></a>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT — Polished template for any future company. Includes live demo.
// ═══════════════════════════════════════════════════════════════════════════════

type DemoStep = { label: string; status: "idle" | "running" | "done" | "flagged"; detail?: string; conf?: number };

function LiveDemoWidget({ market }: { market: string }) {
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [steps, setSteps] = useState<DemoStep[]>([
    { label: "Ingesting submitted document", status: "idle" },
    { label: "Extracting key data fields", status: "idle" },
    { label: "Mapping to framework requirements", status: "idle", conf: 92 },
    { label: "Confidence threshold check (>0.75)", status: "idle" },
    { label: "Flagging low-confidence items", status: "idle", detail: "2 items escalated" },
    { label: "Generating structured output report", status: "idle", conf: 97 },
  ]);
  const [currentIdx, setCurrentIdx] = useState(-1);

  const runDemo = () => {
    if (phase !== "idle") { setPhase("idle"); setCurrentIdx(-1); setSteps(s => s.map(x => ({ ...x, status: "idle" }))); return; }
    setPhase("running");
    steps.forEach((_, i) => {
      setTimeout(() => {
        setCurrentIdx(i);
        setSteps(prev => prev.map((s, j) => j === i ? { ...s, status: "running" } : s));
        setTimeout(() => {
          setSteps(prev => prev.map((s, j) => j === i ? { ...s, status: i === 4 ? "flagged" : "done" } : s));
          if (i === steps.length - 1) { setPhase("done"); setCurrentIdx(-1); }
        }, 900);
      }, i * 1100);
    });
  };

  const icon = (s: DemoStep["status"]) => {
    if (s === "idle") return <span className="w-4 h-4 rounded-full border border-gray-200 inline-block" />;
    if (s === "running") return <span className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent inline-block" style={{ animation: "spin-slow .6s linear infinite" }} />;
    if (s === "done") return <span className="text-emerald-500 text-sm font-black">✓</span>;
    return <span className="text-amber-500 text-sm font-black">⚠</span>;
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
      <div className="border-b border-gray-100 px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-900">AI Operator — Live Run</p>
          <p className="text-xs text-gray-400 mt-0.5">{market} processing pipeline</p>
        </div>
        <button onClick={runDemo}
          className={`px-5 py-2 rounded-full text-sm font-bold transition-all active:scale-95 ${phase === "done" ? "bg-gray-100 text-gray-500 hover:bg-gray-200" : phase === "running" ? "bg-indigo-50 text-indigo-400 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"}`}>
          {phase === "done" ? "↺ Reset" : phase === "running" ? "Running…" : "▶ Run demo"}
        </button>
      </div>
      <div className="divide-y divide-gray-50">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 transition-all duration-300"
            style={{ backgroundColor: i === currentIdx ? "rgba(99,102,241,.03)" : step.status === "flagged" ? "rgba(245,158,11,.03)" : "transparent" }}>
            <div className="w-5 h-5 flex items-center justify-center shrink-0">{icon(step.status)}</div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm transition-colors ${step.status === "idle" ? "text-gray-400" : "text-gray-800 font-medium"}`}>{step.label}</p>
              {step.status !== "idle" && step.detail && (
                <p className="text-xs text-amber-500 mt-0.5" style={{ animation: "fade-in .3s both" }}>{step.detail}</p>
              )}
            </div>
            {step.status === "done" && step.conf && (
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full shrink-0" style={{ animation: "fade-in .3s both" }}>
                {step.conf}% conf.
              </span>
            )}
            {step.status === "flagged" && (
              <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-full shrink-0" style={{ animation: "fade-in .3s both" }}>
                Human review
              </span>
            )}
          </div>
        ))}
      </div>
      {phase === "done" && (
        <div className="border-t border-gray-100 px-6 py-4 bg-emerald-50/50 flex items-center gap-3" style={{ animation: "fade-up .4s both" }}>
          <span className="text-emerald-500 text-lg">✓</span>
          <div>
            <p className="text-sm font-bold text-gray-900">Report ready</p>
            <p className="text-xs text-gray-500">5 items verified · 1 escalated for human review</p>
          </div>
          <button className="ml-auto text-xs text-indigo-600 font-semibold hover:underline">Download →</button>
        </div>
      )}
    </div>
  );
}

function DefaultShowcase({ company, meta }: ShowcaseProps) {
  const { revealRef, visible } = useScrollReveal();
  const scoreVal = useCounter(meta.alignmentScore ?? 30, visible.has("score"), 1600);

  const steps = meta.howItWorks
    ? meta.howItWorks.split(/→|->/).map(s => s.trim()).filter(Boolean)
    : ["Submit your documents and data", "AI operator processes with confidence scoring", "Uncertain items escalated for human review", "Structured output delivered within 24 hours"];

  const market = meta.market || "AI Operator";

  return (
    <div className="bg-white text-gray-900 font-sans min-h-screen">
      <GlobalStyles />
      <ScrollFix />

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-black text-sm text-gray-900 tracking-tight">{company.name}</span>
          <div className="flex items-center gap-5">
            <a href="#demo" className="text-sm text-gray-400 hover:text-gray-700 hidden sm:block transition-colors">See demo</a>
            <a href="#contact"><button className="px-5 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all">Sign up free</button></a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden px-6 pt-16">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4338ca 100%)" }} />
        <svg className="absolute inset-0 w-full h-full opacity-[.04] pointer-events-none">
          <defs><pattern id="def-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth=".6" />
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#def-grid)" />
        </svg>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #818cf8, transparent)" }} />

        <div className="relative max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center py-24">
          {/* Left */}
          <div style={{ animation: "slide-r 0.9s cubic-bezier(0.22,1,0.36,1) both" }}>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-pulse inline-block" />
              <span className="text-indigo-200 text-xs font-bold uppercase tracking-[.2em]">{market}</span>
            </div>
            <h1 className="text-[clamp(2.5rem,5.5vw,5rem)] font-black leading-[1.02] text-white tracking-tight">
              {meta.tagline || company.name}
            </h1>
            <p className="mt-6 text-white/50 text-lg leading-relaxed max-w-md">
              {meta.plainDescription || "An AI operator built on uncertainty gating — every finding has a confidence score, and agents escalate what they can't verify."}
            </p>
            <div className="mt-10 flex gap-4">
              <a href="#contact"><button className="px-8 py-4 rounded-full bg-white text-indigo-900 font-black text-sm hover:bg-indigo-50 hover:shadow-[0_0_40px_rgba(255,255,255,.25)] transition-all active:scale-95">Open app →</button></a>
              <a href="#demo"><button className="px-8 py-4 rounded-full border border-white/15 text-white/55 font-semibold text-sm hover:border-white/30 hover:text-white/90 transition-all">See it live</button></a>
            </div>
            <div className="mt-12 flex gap-10">
              {[["24 hrs", "Turnaround"], ["Human-gated", "All edge cases"], ["Zero", "Hallucinated outputs"]].map(([v, l]) => (
                <div key={l}>
                  <p className="text-xl font-black text-indigo-300">{v}</p>
                  <p className="text-white/30 text-xs mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: hero visual */}
          <div style={{ animation: "slide-l 0.9s .15s cubic-bezier(0.22,1,0.36,1) both" }}>
            <div className="bg-white/6 border border-white/12 rounded-3xl p-6 backdrop-blur shadow-2xl">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
                <span className="ml-2 text-xs text-white/25 font-mono">{company.name.toLowerCase().replace(/\s+/g, "-")} — operator</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Document ingested", status: "done", conf: 99 },
                  { label: "Key fields extracted", status: "done", conf: 94 },
                  { label: "Framework mapping complete", status: "done", conf: 88 },
                  { label: "Low-confidence item", status: "warn", detail: "Escalated to human" },
                  { label: "Report generated", status: "done", conf: 96 },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/4 rounded-xl px-4 py-3"
                    style={{ animation: `fade-up .4s ${300 + i * 100}ms both` }}>
                    <span className={`text-sm font-bold shrink-0 ${row.status === "done" ? "text-emerald-400" : "text-amber-400"}`}>
                      {row.status === "done" ? "✓" : "⚠"}
                    </span>
                    <span className="text-white/65 text-sm flex-1">{row.label}</span>
                    {row.conf && <span className="text-xs text-indigo-300 font-semibold shrink-0">{row.conf}%</span>}
                    {row.detail && <span className="text-xs text-amber-400/80 shrink-0">{row.detail}</span>}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3"
                style={{ animation: "fade-up .4s 900ms both" }}>
                <span className="text-emerald-400 text-lg">✓</span>
                <div>
                  <p className="text-emerald-300 text-sm font-bold">Output ready</p>
                  <p className="text-emerald-400/50 text-xs">4 verified · 1 escalated · avg confidence 94%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive demo section */}
      <section id="demo" className="py-28 px-6 bg-[#f8faff]">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <p className="text-indigo-500 text-xs font-bold uppercase tracking-[.2em] mb-3">Interactive demo</p>
            <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">See the operator in action.</h2>
            <p className="text-gray-500 text-base mb-10">Click "Run demo" to watch the AI operator process a real document — with live confidence scoring and human escalation.</p>
          </Reveal>
          <Reveal delay={80}>
            <LiveDemoWidget market={market} />
          </Reveal>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="py-28 px-6 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <Reveal><p className="text-indigo-500 text-xs font-bold uppercase tracking-[.2em] mb-3">How it works</p></Reveal>
          <Reveal delay={60}><h2 className="text-4xl font-bold text-gray-900 mb-14 tracking-tight">From submission to structured output</h2></Reveal>
          <div className="grid sm:grid-cols-2 gap-4">
            {steps.map((step, i) => (
              <Reveal key={i} delay={i * 80} anim="fade-up">
                <div className="group p-7 rounded-3xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all h-full">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-lg mb-5 group-hover:bg-indigo-100 transition-all">{i + 1}</div>
                  <p className="text-gray-600 text-sm leading-relaxed">{step}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Alignment score */}
      <section className="py-24 px-6 bg-indigo-50">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-14 items-center">
          <div>
            <Reveal><p className="text-indigo-500 text-xs font-bold uppercase tracking-[.2em] mb-3">Why aligned AI</p></Reveal>
            <Reveal delay={60}><h2 className="text-3xl font-bold text-gray-900 mb-5 tracking-tight">Built on uncertainty gating.</h2></Reveal>
            <Reveal delay={120}>
              <p className="text-gray-500 leading-relaxed text-sm">
                {meta.alignmentConnection || "AI operators that guess cause real damage. This operator only asserts what it can verify — every output has a confidence score, and anything below threshold is escalated to a human. Uncertainty is treated as information, not hidden."}
              </p>
            </Reveal>
            <Reveal delay={180}>
              <ul className="mt-7 space-y-3">
                {["Confidence scores on every finding", "Uncertain items escalated, never guessed", "Humans remain in the decision loop"].map((p, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600">
                    <span className="text-indigo-500 shrink-0 font-bold">✓</span>{p}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal delay={100} anim="slide-l">
            <div ref={revealRef("score") as any} className="bg-white border border-indigo-100 rounded-3xl p-10 shadow-sm text-center">
              <p className="text-indigo-400 text-xs uppercase tracking-widest mb-6">Meta-Engine Alignment Score</p>
              <div className="text-8xl font-black text-indigo-600">{scoreVal}</div>
              <div className="text-gray-300 text-xl mt-1">/50</div>
              <div className="mt-5 w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-[2s]"
                  style={{ width: `${(scoreVal / 50) * 100}%` }} />
              </div>
              <p className="text-gray-400 text-xs mt-4">Market size · Automation feasibility · Alignment leverage · Time to revenue · Defensibility</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-28 px-6" style={{ background: "linear-gradient(135deg, #1e1b4b, #4338ca)" }}>
        <div className="max-w-xl mx-auto text-center space-y-7">
          <h2 className="text-4xl font-black text-white">Use {company.name}.</h2>
          <p className="text-white/45">Create a free account and start immediately.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <input type="email" placeholder="you@company.com" className="flex-1 max-w-xs bg-white/10 border border-white/15 rounded-full px-5 py-3.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/40 transition-all" />
            <button className="px-7 py-3.5 rounded-full bg-white text-indigo-900 font-bold text-sm hover:bg-indigo-50 hover:shadow-[0_0_30px_rgba(255,255,255,.25)] transition-all">Notify me</button>
          </div>
        </div>
      </section>
      <ShowcaseFooter name={company.name} />
    </div>
  );
}

// ─── Shared footer ────────────────────────────────────────────────────────────

function ShowcaseFooter({ name }: { name: string }) {
  return (
    <footer className="border-t border-white/6 py-8 px-6 bg-transparent">
      <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-white/20">
        <span className="font-semibold text-white/30">{name}</span>
        <span>Built by the <Link to="/meta-engine" className="underline hover:text-white/40 transition-colors">Meta-Engine</Link> · Alignment-positive AI</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}

// ─── Scroll unlock ────────────────────────────────────────────────────────────

function ScrollFix() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = prev; };
  }, []);
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTER — maps slug → showcase component
// ═══════════════════════════════════════════════════════════════════════════════

export function CompanyShowcase() {
  const { slug } = useParams<{ slug: string }>();
  const { data: companies, isLoading, error } = useQuery({
    queryKey: queryKeys.companies.all,
    queryFn: companiesApi.list,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080603] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/80" style={{ animation: "spin-slow 0.8s linear infinite" }} />
      </div>
    );
  }

  if (error || !companies) {
    return (
      <div className="min-h-screen bg-[#080603] flex items-center justify-center text-white/40 text-sm">
        Failed to load company data.
      </div>
    );
  }

  const company = companies.find(c => companySlug(c.name) === slug);
  if (!company) {
    return (
      <div className="min-h-screen bg-[#080603] flex flex-col items-center justify-center gap-4">
        <p className="text-white/40 text-sm">Company not found: <code className="text-white/60">{slug}</code></p>
        <Link to="/meta-engine" className="text-xs text-white/30 underline hover:text-white/50">← Back to Meta-Engine</Link>
      </div>
    );
  }

  const meta = parseMetaEngineMeta(company.description ?? "");
  const s = (company.name + " " + (meta.market ?? "")).toLowerCase();

  const props: ShowcaseProps = { company, meta };

  if (s.includes("underwriting") || s.includes("insurance") || s.includes("actuarial")) return <UnderwritingShowcase {...props} />;
  if (s.includes("tprm") || s.includes("third-party") || s.includes("vendor risk")) return <TprmShowcase {...props} />;
  if (s.includes("esg") || s.includes("sustainability") || s.includes("disclosure")) return <EsgShowcase {...props} />;
  if (s.includes("medical") || s.includes("billing") || s.includes("healthcare") || s.includes("cpt") || s.includes("icd")) return <MedicalShowcase {...props} />;
  if (s.includes("compliance") || s.includes("soc 2") || s.includes("soc2") || s.includes("audit")) return <ComplianceShowcase {...props} />;

  return <DefaultShowcase {...props} />;
}
