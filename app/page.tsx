"use client";

import { useEffect, useRef, useState } from "react";
import {
  scenariosByMode,
  modes,
  type Scenario,
  type Theme,
  type Mode,
} from "./scenarios";

type Decision = "pending" | "approved" | "revised";

/* stage:
   0=イベント検知 1=状況分析 2=行動計画 3=ツール実行 4=実行内容 5=完了報告 6=承認待ち */
const PHASES = [
  { key: "thought", label: "状況分析", sub: "Thought" },
  { key: "action", label: "行動計画", sub: "Action" },
  { key: "tools", label: "ツール実行", sub: "Tools" },
  { key: "exec", label: "実行内容", sub: "Execution" },
  { key: "result", label: "完了報告", sub: "Result" },
] as const;

const THEME: Record<
  Theme,
  { text: string; ring: string; grad: string; glow: string }
> = {
  sky: {
    text: "text-sky-300",
    ring: "ring-sky-400/40",
    grad: "from-sky-400 to-blue-600",
    glow: "shadow-[0_0_40px_-8px_rgba(56,189,248,0.6)]",
  },
  cyan: {
    text: "text-cyan-300",
    ring: "ring-cyan-400/40",
    grad: "from-cyan-400 to-teal-600",
    glow: "shadow-[0_0_40px_-8px_rgba(34,211,238,0.6)]",
  },
  violet: {
    text: "text-violet-300",
    ring: "ring-violet-400/40",
    grad: "from-violet-400 to-fuchsia-600",
    glow: "shadow-[0_0_40px_-8px_rgba(167,139,250,0.6)]",
  },
};

const STATUS_COLOR: Record<string, { dot: string; text: string; bg: string }> = {
  amber: { dot: "bg-amber-400", text: "text-amber-300", bg: "bg-amber-400/10 border-amber-400/30" },
  sky: { dot: "bg-sky-400", text: "text-sky-300", bg: "bg-sky-400/10 border-sky-400/30" },
  violet: { dot: "bg-violet-400", text: "text-violet-300", bg: "bg-violet-400/10 border-violet-400/30" },
  cyan: { dot: "bg-cyan-400", text: "text-cyan-300", bg: "bg-cyan-400/10 border-cyan-400/30" },
  teal: { dot: "bg-teal-400", text: "text-teal-300", bg: "bg-teal-400/10 border-teal-400/30" },
  emerald: { dot: "bg-emerald-400", text: "text-emerald-300", bg: "bg-emerald-400/10 border-emerald-400/30" },
  slate: { dot: "bg-slate-400", text: "text-slate-300", bg: "bg-slate-400/10 border-slate-400/30" },
};

function agentStatus(stage: number, decision: Decision) {
  if (decision === "approved") return { label: "実行完了", color: "emerald", live: false };
  if (decision === "revised") return { label: "保留・差し戻し", color: "slate", live: false };
  switch (stage) {
    case 0: return { label: "イベントを検知", color: "amber", live: true };
    case 1: return { label: "状況を分析中", color: "sky", live: true };
    case 2: return { label: "対応を立案中", color: "sky", live: true };
    case 3: return { label: "ツールを実行中", color: "violet", live: true };
    case 4: return { label: "成果物を起案中", color: "cyan", live: true };
    case 5: return { label: "報告を作成中", color: "teal", live: true };
    default: return { label: "あなたの承認待ち", color: "amber", live: true };
  }
}

export default function Home() {
  const [activeMode, setActiveMode] = useState<Mode>("medical");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [stage, setStage] = useState(0);
  const [decision, setDecision] = useState<Decision>("pending");

  const modeInfo = modes.find((m) => m.id === activeMode)!;
  const scenarios = scenariosByMode[activeMode];
  const active = scenarios.find((s) => s.id === activeId) ?? null;

  function reset() {
    setActiveId(null);
    setStage(0);
    setDecision("pending");
  }
  function changeMode(id: Mode) {
    if (id === activeMode) return;
    setActiveMode(id);
    reset();
  }
  function selectScenario(id: string) {
    setActiveId(id);
    setStage(0);
    setDecision("pending");
    window.setTimeout(() => setStage(1), 900);
  }

  return (
    <>
      <Header running={!!active && decision === "pending" && stage < 6} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 sm:px-6">
        <Hero />

        <section className="mt-8">
          <SectionLabel index="01">あなたの業種を選ぶ</SectionLabel>
          <div className="mt-3 flex flex-wrap gap-2">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => changeMode(m.id)}
                className={[
                  "flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold transition-all",
                  activeMode === m.id
                    ? "glass border-cyan-400/40 text-white shadow-[0_0_30px_-10px_rgba(34,211,238,0.7)]"
                    : "glass-soft text-slate-400 hover:text-white hover:border-white/20",
                ].join(" ")}
              >
                <span className="text-lg">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">{modeInfo.blurb}</p>
        </section>

        <section className="mt-8">
          <SectionLabel index="02">監視中のイベント（タップで発生）</SectionLabel>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {scenarios.map((s) => (
              <ScenarioCard
                key={s.id}
                scenario={s}
                active={activeId === s.id}
                onSelect={() => selectScenario(s.id)}
              />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <SectionLabel index="03">エージェント・ライブモニター</SectionLabel>
          <div className="mt-4">
            {!active ? (
              <EmptyConsole />
            ) : (
              <Console
                key={activeMode + active.id}
                scenario={active}
                sessionPrefix={modeInfo.sessionPrefix}
                stage={stage}
                decision={decision}
                onAdvance={(from) => setStage((s) => (s === from ? from + 1 : s))}
                onApprove={() => setDecision("approved")}
                onRevise={() => setDecision("revised")}
                onReset={reset}
              />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

/* ============================ Header / Hero ============================ */

function Header({ running }: { running: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#060b18]/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 text-lg font-black text-white shadow-lg shadow-cyan-500/30">
            ✦
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#060b18] pulse-ring" />
          </div>
          <div>
            <p className="text-sm font-black tracking-tight text-white">
              AIエージェント体験デモ
            </p>
            <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className={`h-1.5 w-1.5 rounded-full ${running ? "bg-violet-400" : "bg-emerald-400"}`} />
              {running ? "エージェント稼働中…" : "関西ぱど AIブートキャンプ"}
            </p>
          </div>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[11px] font-bold text-amber-300 sm:inline-flex">
          🔒 Human-in-the-Loop
        </span>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mt-10">
      <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold tracking-wide text-cyan-300">
        ✦ ReAct Autonomous Agent
      </span>
      <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
        指示を待たず、
        <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">
          自ら考えて動く
        </span>
        <br className="hidden sm:block" />
        AIエージェントの"頭の中"。
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
        現場のイベントを検知すると、エージェントが
        <span className="font-semibold text-slate-200">
          分析 → 立案 → ツール実行 → 起案 → 報告
        </span>
        まで自律的に処理。その思考とツール操作を<span className="text-slate-300">ライブで可視化</span>します。
        送信・発注などの最終決定は必ず人間が承認します。
      </p>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <StatChip value="3×3" label="業種 × シナリオ" accent="text-cyan-300" />
        <StatChip value="5" label="自律処理ステップ" accent="text-sky-300" />
        <StatChip value="100%" label="人間が最終承認" accent="text-violet-300" />
      </div>
    </section>
  );
}

function StatChip({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <div className="glass-soft rounded-2xl px-4 py-3">
      <p className={`text-2xl font-black ${accent}`}>{value}</p>
      <p className="text-[11px] text-slate-400">{label}</p>
    </div>
  );
}

/* ============================ Scenario card ============================ */

function ScenarioCard({ scenario, active, onSelect }: { scenario: Scenario; active: boolean; onSelect: () => void }) {
  const t = THEME[scenario.theme];
  return (
    <button
      onClick={onSelect}
      className={[
        "group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300",
        active
          ? `glass ${t.glow} ring-2 ${t.ring} -translate-y-1`
          : "glass-soft hover:-translate-y-1 hover:border-white/20",
      ].join(" ")}
    >
      <div className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${t.grad} opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-40`} />
      <div className="relative flex items-center justify-between">
        <span className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${t.grad} text-2xl shadow-lg`}>
          {scenario.icon}
        </span>
        <UrgencyBadge urgency={scenario.urgency} />
      </div>
      <h3 className="relative mt-4 text-base font-bold text-white">{scenario.title}</h3>
      <p className={`relative mt-1 text-xs font-medium ${t.text}`}>{scenario.tag}</p>
      <p className="relative mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 transition group-hover:text-white">
        {active ? "● 処理中" : "⚡ イベントを発生させる"}
      </p>
    </button>
  );
}

/* ============================ Console ============================ */

function Console({
  scenario, sessionPrefix, stage, decision, onAdvance, onApprove, onRevise, onReset,
}: {
  scenario: Scenario;
  sessionPrefix: string;
  stage: number;
  decision: Decision;
  onAdvance: (from: number) => void;
  onApprove: () => void;
  onRevise: () => void;
  onReset: () => void;
}) {
  const t = THEME[scenario.theme];
  const progress = Math.min(stage, 5);
  const st = agentStatus(stage, decision);
  const sc = STATUS_COLOR[st.color];
  const running = st.live && stage < 6 && decision === "pending";

  return (
    <div className={`glass overflow-hidden rounded-3xl ${t.glow}`}>
      {/* console bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-400/80" />
            <span className="h-3 w-3 rounded-full bg-amber-400/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
          </span>
          <span className="ml-2 font-mono text-xs font-bold text-slate-300">
            {sessionPrefix}://session/{scenario.id}
          </span>
        </div>
        <button onClick={onReset} className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-400 transition hover:bg-white/10 hover:text-white">
          ✕ 終了
        </button>
      </div>

      {/* live HUD */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-black/20 px-5 py-2.5">
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold ${sc.bg} ${sc.text}`}>
          <span className={`h-2 w-2 rounded-full ${sc.dot} ${st.live ? "animate-pulse" : ""}`} />
          {st.label}
        </span>
        <span className="ml-auto flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span>⏱ <ElapsedTimer active={running} /></span>
          <span className="text-slate-600">|</span>
          <span>🔧 {stage >= 4 || decision !== "pending" ? scenario.toolCalls.length : stage >= 3 ? "…" : 0} ツール</span>
        </span>
      </div>

      {/* stepper */}
      <Stepper stage={stage} theme={scenario.theme} />

      {/* progress */}
      <div className="h-1 w-full bg-white/5">
        <div className={`h-full bg-gradient-to-r ${t.grad} transition-all duration-700`} style={{ width: `${(progress / 5) * 100}%` }} />
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <TriggerCard scenario={scenario} />

        {stage >= 1 && (
          <StepCard n={1} label="状況分析" sub="Thought" accent="amber">
            <Typewriter text={scenario.thought} done={stage > 1} onDone={() => onAdvance(1)} />
          </StepCard>
        )}

        {stage >= 2 && (
          <StepCard n={2} label="行動計画" sub="Action" accent="sky">
            <Typewriter text={scenario.action} done={stage > 2} onDone={() => onAdvance(2)} />
          </StepCard>
        )}

        {stage >= 3 && (
          <StepCard n={3} label="ツール実行" sub="Tools" accent="violet">
            <ToolRunner calls={scenario.toolCalls} done={stage > 3} onDone={() => onAdvance(3)} />
          </StepCard>
        )}

        {stage >= 4 && (
          <StepCard n={4} label="実行内容" sub="Execution" accent="cyan">
            <ExecutionView scenario={scenario} done={stage > 4} onDone={() => onAdvance(4)} />
          </StepCard>
        )}

        {stage >= 5 && (
          <StepCard n={5} label="完了報告" sub="Result" accent="emerald">
            <Typewriter text={scenario.result} done={stage > 5} onDone={() => onAdvance(5)} />
            {stage >= 6 && (
              <HumanInTheLoop scenario={scenario} decision={decision} onApprove={onApprove} onRevise={onRevise} />
            )}
          </StepCard>
        )}

        {stage === 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="flex gap-1 text-amber-300"><span className="dot" /><span className="dot" /><span className="dot" /></span>
            <span className="font-mono text-xs text-slate-400">イベントを検知しました。エージェントを起動しています…</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ElapsedTimer({ active }: { active: boolean }) {
  const [ms, setMs] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    if (!active) return;
    if (startRef.current == null) startRef.current = Date.now() - ms;
    const id = window.setInterval(() => setMs(Date.now() - (startRef.current as number)), 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  return <span>{(ms / 1000).toFixed(1)}s</span>;
}

function Stepper({ stage, theme }: { stage: number; theme: Theme }) {
  const t = THEME[theme];
  return (
    <div className="flex items-center gap-1 overflow-x-auto px-5 py-3">
      {PHASES.map((p, i) => {
        const idx = i + 1;
        const stateDone = stage > idx;
        const stateActive = stage === idx || (stage > 5 && idx === 5);
        return (
          <div key={p.key} className="flex flex-1 items-center gap-1">
            <div className="flex items-center gap-2">
              <span
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black transition-all",
                  stateDone ? "bg-emerald-400/20 text-emerald-300"
                    : stateActive ? `bg-gradient-to-br ${t.grad} text-white shadow-lg`
                    : "bg-white/5 text-slate-500",
                ].join(" ")}
              >
                {stateDone ? "✓" : idx}
              </span>
              <div className="hidden md:block">
                <p className={["text-[11px] font-bold leading-tight", stateActive ? "text-white" : stateDone ? "text-slate-300" : "text-slate-500"].join(" ")}>
                  {p.label}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-slate-500">{p.sub}</p>
              </div>
            </div>
            {i < PHASES.length - 1 && (
              <span className={`mx-1 h-px flex-1 ${stage > idx ? "bg-emerald-400/40" : "bg-white/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ============================ Tool Runner（可視化の核） ============================ */

function ToolRunner({
  calls, done, onDone,
}: {
  calls: { tool: string; call: string; result: string }[];
  done: boolean;
  onDone: () => void;
}) {
  const [n, setN] = useState(done ? calls.length : 0); // 完了済み件数
  const firedRef = useRef(false);

  useEffect(() => {
    if (done) { setN(calls.length); return; }
    if (n >= calls.length) {
      if (!firedRef.current) { firedRef.current = true; onDone(); }
      return;
    }
    const id = window.setTimeout(() => setN((v) => v + 1), 820);
    return () => clearTimeout(id);
  }, [n, calls.length, done, onDone]);

  const running = !done && n < calls.length;

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#060a14]">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2">
        <span className="text-base">🔧</span>
        <span className="text-xs font-bold text-slate-300">ツール実行ログ</span>
        <span className="ml-auto font-mono text-[10px] text-slate-500">
          {done ? calls.length : n}/{calls.length}
        </span>
      </div>
      <div className="space-y-1.5 px-4 py-3 font-mono text-[12px] leading-relaxed">
        {calls.map((c, i) => {
          const finished = done || i < n;
          const current = !done && i === n;
          if (!finished && !current) {
            return (
              <div key={i} className="flex items-center gap-2 text-slate-600">
                <span className="w-3 text-center">·</span>
                <span>{c.tool}</span>
              </div>
            );
          }
          return (
            <div key={i} className="animate-step">
              <div className="flex items-center gap-2">
                <span className={`w-3 text-center ${finished ? "text-emerald-400" : "text-violet-300"}`}>
                  {finished ? "✓" : <span className="inline-block animate-pulse">▸</span>}
                </span>
                <span className="rounded bg-white/10 px-1.5 py-px text-[10px] font-bold text-slate-200">{c.tool}</span>
                <span className="text-slate-300">{c.call}</span>
              </div>
              {finished ? (
                <div className="pl-5 text-emerald-300/90">→ {c.result}</div>
              ) : (
                <div className="pl-5 text-slate-500">→ 実行中…</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================ Typewriter ============================ */

function Typewriter({ text, done, speed = 15, onDone }: { text: string; done: boolean; speed?: number; onDone: () => void }) {
  const [n, setN] = useState(done ? text.length : 0);
  const firedRef = useRef(false);
  useEffect(() => {
    if (done) { setN(text.length); return; }
    if (n >= text.length) {
      if (!firedRef.current) { firedRef.current = true; onDone(); }
      return;
    }
    const id = window.setTimeout(() => setN((v) => v + 1), speed);
    return () => clearTimeout(id);
  }, [n, text, done, speed, onDone]);
  const typing = !done && n < text.length;
  return (
    <span className="whitespace-pre-wrap">
      {text.slice(0, done ? text.length : n)}
      {typing && <span className="caret" />}
    </span>
  );
}

/* ============================ Trigger / Step ============================ */

function TriggerCard({ scenario }: { scenario: Scenario }) {
  const t = THEME[scenario.theme];
  return (
    <div className="animate-step rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xl">{scenario.icon}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          EVENT DETECTED
        </span>
        <span className={`text-[11px] font-medium ${t.text}`}>{scenario.triggerSource}</span>
        <span className="ml-auto"><UrgencyBadge urgency={scenario.urgency} /></span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-200">{scenario.triggerText}</p>
      <p className="mt-1.5 text-[11px] text-amber-300/80">⚡ エージェントがこのイベントを自動検知し、対応を開始しました。</p>
    </div>
  );
}

const ACCENTS = {
  amber: { bar: "bg-amber-400", num: "bg-amber-400/15 text-amber-300", sub: "text-amber-300" },
  sky: { bar: "bg-sky-400", num: "bg-sky-400/15 text-sky-300", sub: "text-sky-300" },
  violet: { bar: "bg-violet-400", num: "bg-violet-400/15 text-violet-300", sub: "text-violet-300" },
  cyan: { bar: "bg-cyan-400", num: "bg-cyan-400/15 text-cyan-300", sub: "text-cyan-300" },
  emerald: { bar: "bg-emerald-400", num: "bg-emerald-400/15 text-emerald-300", sub: "text-emerald-300" },
} as const;

function StepCard({ n, label, sub, accent, children }: { n: number; label: string; sub: string; accent: keyof typeof ACCENTS; children: React.ReactNode }) {
  const a = ACCENTS[accent];
  return (
    <div className="animate-step flex gap-3">
      <div className={`mt-1 w-1 shrink-0 rounded-full ${a.bar}`} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${a.num}`}>{n}</span>
          <span className="text-sm font-bold text-white">{label}</span>
          <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${a.sub}`}>{sub}</span>
        </div>
        <div className="mt-2 text-sm leading-relaxed text-slate-300">{children}</div>
      </div>
    </div>
  );
}

/* ============================ Execution ============================ */

function ExecutionView({ scenario, done, onDone }: { scenario: Scenario; done: boolean; onDone: () => void }) {
  const firedRef = useRef(false);
  useEffect(() => {
    if (done) return;
    if (firedRef.current) return;
    const id = window.setTimeout(() => { firedRef.current = true; onDone(); }, 700);
    return () => clearTimeout(id);
  }, [done, onDone]);

  const ex = scenario.execution;
  if (ex.kind === "email") {
    return (
      <div className="animate-pop overflow-hidden rounded-xl border border-white/10 bg-[#0a1120]/80">
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2">
          <span className="text-base">✉️</span>
          <span className="text-xs font-bold text-slate-300">自動作成されたメール案</span>
          <span className="ml-auto rounded bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">未送信・要承認</span>
        </div>
        <div className="space-y-1.5 px-4 py-3 text-sm">
          <p className="text-slate-400"><span className="inline-block w-12 font-mono text-xs text-slate-500">To</span>{ex.to}</p>
          <p className="font-semibold text-white"><span className="inline-block w-12 font-mono text-xs text-slate-500">Subj</span>{ex.subject}</p>
          <div className="mt-2 whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-3 text-[13px] leading-relaxed text-slate-300">{ex.body}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="animate-pop overflow-hidden rounded-xl border border-white/10 bg-[#0a1120]/80">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2">
        <span className="text-base">🧾</span>
        <span className="text-xs font-bold text-slate-300">{ex.docLabel}</span>
        <span className="ml-auto rounded bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">要承認</span>
      </div>
      <dl className="divide-y divide-white/5 px-4 py-1 text-sm">
        {ex.fields.map((f) => (
          <div key={f.label} className="flex gap-3 py-2">
            <dt className="w-20 shrink-0 font-mono text-xs text-slate-500">{f.label}</dt>
            <dd className="flex-1 text-slate-200">{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ============================ Human-in-the-Loop ============================ */

function HumanInTheLoop({ scenario, decision, onApprove, onRevise }: { scenario: Scenario; decision: Decision; onApprove: () => void; onRevise: () => void }) {
  if (decision === "approved") {
    return (
      <div className="animate-pop relative mt-4 overflow-hidden rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
        <Burst />
        <p className="relative flex items-center gap-2 text-sm font-bold text-emerald-300"><span className="text-base">✅</span>{scenario.approvedTitle}</p>
        <p className="relative mt-1.5 text-[13px] leading-relaxed text-emerald-100/90">{scenario.approvedBody}</p>
      </div>
    );
  }
  if (decision === "revised") {
    return (
      <div className="animate-pop mt-4 rounded-xl border border-white/15 bg-white/5 p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-200"><span className="text-base">✋</span>人間の判断に差し戻しました</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">送信・発注は保留しています。修正のご指示をいただければ、内容を作り直して再度ご提案します。</p>
      </div>
    );
  }
  return (
    <div className="animate-step mt-4 rounded-xl border border-amber-400/30 bg-amber-400/[0.07] p-4">
      <p className="flex items-center gap-2 text-xs font-bold text-amber-300"><span className="text-sm">🔒</span>最終確認・承認（Human-in-the-Loop）</p>
      <p className="mt-1 text-[12px] text-amber-200/70">ここまではAIが自律処理。送信・発注・確定の最終決定だけは、必ず人間が行います。</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button onClick={onApprove} className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:brightness-110 active:scale-95 sm:w-auto sm:py-2">
          {scenario.approveLabel}
        </button>
        <button onClick={onRevise} className="w-full rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/10 active:scale-95 sm:w-auto sm:py-2">
          修正する
        </button>
      </div>
    </div>
  );
}

function Burst() {
  const colors = ["#34d399", "#22d3ee", "#a78bfa", "#fbbf24", "#f472b6"];
  const parts = Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * Math.PI * 2;
    const dist = 50 + (i % 3) * 18;
    return { bx: `${Math.cos(angle) * dist}px`, by: `${Math.sin(angle) * dist}px`, color: colors[i % colors.length], delay: `${(i % 5) * 0.03}s` };
  });
  return (
    <div className="pointer-events-none absolute left-6 top-5">
      {parts.map((p, i) => (
        <span key={i} className="particle" style={{ background: p.color, animationDelay: p.delay, ["--bx"]: p.bx, ["--by"]: p.by } as React.CSSProperties} />
      ))}
    </div>
  );
}

/* ============================ Misc ============================ */

function EmptyConsole() {
  return (
    <div className="glass-soft flex min-h-[240px] flex-col items-center justify-center rounded-3xl p-8 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 text-4xl">
        🤖
        <span className="absolute inset-0 rounded-2xl pulse-ring" />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-200">エージェントは待機中 ── イベントを監視しています</p>
      <p className="mt-1 font-mono text-xs text-slate-500">上のイベントを発生させると、自律的に動き出します</p>
    </div>
  );
}

function UrgencyBadge({ urgency }: { urgency: Scenario["urgency"] }) {
  const map = {
    高: "border-rose-400/40 bg-rose-400/10 text-rose-300",
    中: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    低: "border-slate-400/40 bg-slate-400/10 text-slate-300",
  } as const;
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${map[urgency]}`}>緊急度 {urgency}</span>;
}

function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
      <span className="font-mono text-cyan-400">{index}</span>
      <span className="h-px w-5 bg-white/20" />
      {children}
    </h2>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <p className="text-[11px] leading-relaxed text-slate-500">
          ※ 本アプリは自律型AIエージェントの動作を可視化したデモ（シミュレーション）です。
          実際のメール送信・発注・カレンダー更新は行われません。表示されるツール実行ログ・会社名・型番・金額・氏名はサンプルです。
        </p>
        <p className="mt-2 text-[11px] text-slate-500">
          関西ぱど AIブートキャンプ ── 現場で使えるAIエージェントを、自分で作れるようになる伴走型プログラム。
        </p>
      </div>
    </footer>
  );
}
