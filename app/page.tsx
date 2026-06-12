"use client";

import { useEffect, useRef, useState } from "react";
import { scenarios, type Scenario, type Theme } from "./scenarios";

type Decision = "pending" | "approved" | "revised";

/* stage: 0=トリガーのみ 1=Thought 2=Action 3=Execution 4=Result 5=承認待ち */
const PHASES = [
  { key: "thought", label: "状況分析", sub: "Thought" },
  { key: "action", label: "自律アクション", sub: "Action" },
  { key: "execution", label: "実行内容", sub: "Execution" },
  { key: "result", label: "完了報告", sub: "Result" },
] as const;

const THEME: Record<
  Theme,
  { text: string; ring: string; grad: string; glow: string; soft: string }
> = {
  sky: {
    text: "text-sky-300",
    ring: "ring-sky-400/40",
    grad: "from-sky-400 to-blue-600",
    glow: "shadow-[0_0_40px_-8px_rgba(56,189,248,0.6)]",
    soft: "bg-sky-400/10 border-sky-400/30 text-sky-200",
  },
  cyan: {
    text: "text-cyan-300",
    ring: "ring-cyan-400/40",
    grad: "from-cyan-400 to-teal-600",
    glow: "shadow-[0_0_40px_-8px_rgba(34,211,238,0.6)]",
    soft: "bg-cyan-400/10 border-cyan-400/30 text-cyan-200",
  },
  violet: {
    text: "text-violet-300",
    ring: "ring-violet-400/40",
    grad: "from-violet-400 to-fuchsia-600",
    glow: "shadow-[0_0_40px_-8px_rgba(167,139,250,0.6)]",
    soft: "bg-violet-400/10 border-violet-400/30 text-violet-200",
  },
};

export default function Home() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [stage, setStage] = useState(0);
  const [decision, setDecision] = useState<Decision>("pending");

  const active = scenarios.find((s) => s.id === activeId) ?? null;

  function selectScenario(id: string) {
    setActiveId(id);
    setStage(0);
    setDecision("pending");
    // 起動演出のあとThoughtへ
    window.setTimeout(() => setStage(1), 650);
  }

  function reset() {
    setActiveId(null);
    setStage(0);
    setDecision("pending");
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 sm:px-6">
        <Hero />

        <section className="mt-10">
          <SectionLabel index="01">トリガー（状況発生）を選択</SectionLabel>
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

        <section className="mt-10">
          <SectionLabel index="02">エージェント実行コンソール</SectionLabel>
          <div className="mt-4">
            {!active ? (
              <EmptyConsole />
            ) : (
              <Console
                key={active.id}
                scenario={active}
                stage={stage}
                decision={decision}
                onAdvance={(from) =>
                  setStage((s) => (s === from ? from + 1 : s))
                }
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

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#060b18]/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 text-lg font-black text-white shadow-lg shadow-cyan-500/30">
            ✚
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#060b18] pulse-ring" />
          </div>
          <div>
            <p className="text-sm font-black tracking-tight text-white">
              MediAgent
            </p>
            <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              自律AIエージェント・稼働中
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
        病院の秘書AI。
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
        現場で起きた状況（トリガー）に対し、
        <span className="font-semibold text-slate-200">
          状況分析 → 自律アクション → 文面作成 → 完了報告
        </span>
        までをリアルタイムに思考。送信・発注などの最終決定は必ず人間が承認する設計です。
      </p>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <StatChip value="4" label="思考ステップ" accent="text-cyan-300" />
        <StatChip value="3" label="対応シナリオ" accent="text-sky-300" />
        <StatChip value="100%" label="人間が最終承認" accent="text-violet-300" />
      </div>
    </section>
  );
}

function StatChip({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <div className="glass-soft rounded-2xl px-4 py-3">
      <p className={`text-2xl font-black ${accent}`}>{value}</p>
      <p className="text-[11px] text-slate-400">{label}</p>
    </div>
  );
}

/* ============================ Scenario card ============================ */

function ScenarioCard({
  scenario,
  active,
  onSelect,
}: {
  scenario: Scenario;
  active: boolean;
  onSelect: () => void;
}) {
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
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${t.grad} opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-40`}
      />
      <div className="relative flex items-center justify-between">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${t.grad} text-2xl shadow-lg`}
        >
          {scenario.icon}
        </span>
        <UrgencyBadge urgency={scenario.urgency} />
      </div>
      <h3 className="relative mt-4 text-base font-bold text-white">
        {scenario.title}
      </h3>
      <p className={`relative mt-1 text-xs font-medium ${t.text}`}>
        {scenario.tag}
      </p>
      <p className="relative mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 transition group-hover:text-white">
        {active ? "実行中" : "▶ エージェントを起動"}
      </p>
    </button>
  );
}

/* ============================ Console ============================ */

function Console({
  scenario,
  stage,
  decision,
  onAdvance,
  onApprove,
  onRevise,
  onReset,
}: {
  scenario: Scenario;
  stage: number;
  decision: Decision;
  onAdvance: (from: number) => void;
  onApprove: () => void;
  onRevise: () => void;
  onReset: () => void;
}) {
  const t = THEME[scenario.theme];
  const progress = Math.min(stage, 4);

  return (
    <div className={`glass overflow-hidden rounded-3xl ${t.glow}`}>
      {/* コンソールバー */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-400/80" />
            <span className="h-3 w-3 rounded-full bg-amber-400/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
          </span>
          <span className="ml-2 font-mono text-xs font-bold text-slate-300">
            mediagent://session/{scenario.id}
          </span>
        </div>
        <button
          onClick={onReset}
          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          ✕ 終了
        </button>
      </div>

      {/* ステッパー */}
      <Stepper stage={stage} theme={scenario.theme} />

      {/* progress */}
      <div className="h-1 w-full bg-white/5">
        <div
          className={`h-full bg-gradient-to-r ${t.grad} transition-all duration-700`}
          style={{ width: `${(progress / 4) * 100}%` }}
        />
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <TriggerCard scenario={scenario} />

        {stage >= 1 && (
          <StepCard n={1} label="状況分析" sub="Thought" accent="amber">
            <Typewriter
              text={scenario.thought}
              done={stage > 1}
              onDone={() => onAdvance(1)}
            />
          </StepCard>
        )}

        {stage >= 2 && (
          <StepCard n={2} label="自律アクション" sub="Action" accent="sky">
            <Typewriter
              text={scenario.action}
              done={stage > 2}
              onDone={() => onAdvance(2)}
            />
          </StepCard>
        )}

        {stage >= 3 && (
          <StepCard n={3} label="実行内容" sub="Execution" accent="violet">
            <ExecutionView
              scenario={scenario}
              done={stage > 3}
              onDone={() => onAdvance(3)}
            />
          </StepCard>
        )}

        {stage >= 4 && (
          <StepCard n={4} label="完了報告" sub="Result" accent="emerald">
            <Typewriter text={scenario.result} done={stage > 4} onDone={() => onAdvance(4)} />
            {stage >= 5 && (
              <HumanInTheLoop
                scenario={scenario}
                decision={decision}
                onApprove={onApprove}
                onRevise={onRevise}
              />
            )}
          </StepCard>
        )}

        {stage < 4 && (
          <ThinkingBar stage={stage} theme={scenario.theme} />
        )}
      </div>
    </div>
  );
}

function Stepper({ stage, theme }: { stage: number; theme: Theme }) {
  const t = THEME[theme];
  return (
    <div className="flex items-center gap-1 overflow-x-auto px-5 py-3">
      {PHASES.map((p, i) => {
        const idx = i + 1;
        const stateDone = stage > idx;
        const stateActive = stage === idx || (stage > 4 && idx === 4);
        return (
          <div key={p.key} className="flex flex-1 items-center gap-1">
            <div className="flex items-center gap-2">
              <span
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black transition-all",
                  stateDone
                    ? "bg-emerald-400/20 text-emerald-300"
                    : stateActive
                      ? `bg-gradient-to-br ${t.grad} text-white shadow-lg`
                      : "bg-white/5 text-slate-500",
                ].join(" ")}
              >
                {stateDone ? "✓" : idx}
              </span>
              <div className="hidden sm:block">
                <p
                  className={[
                    "text-[11px] font-bold leading-tight",
                    stateActive
                      ? "text-white"
                      : stateDone
                        ? "text-slate-300"
                        : "text-slate-500",
                  ].join(" ")}
                >
                  {p.label}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-slate-500">
                  {p.sub}
                </p>
              </div>
            </div>
            {i < PHASES.length - 1 && (
              <span
                className={`mx-1 h-px flex-1 ${stage > idx ? "bg-emerald-400/40" : "bg-white/10"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ThinkingBar({ stage, theme }: { stage: number; theme: Theme }) {
  const labels = [
    "セッションを初期化しています",
    "状況を分析しています",
    "最適なアクションを決定しています",
    "実行ドラフトを作成しています",
  ];
  const t = THEME[theme];
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <span className={`flex gap-1 ${t.text}`}>
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </span>
      <span className="font-mono text-xs text-slate-400">
        {labels[stage]}
      </span>
    </div>
  );
}

/* ============================ Typewriter ============================ */

function Typewriter({
  text,
  done,
  speed = 16,
  onDone,
}: {
  text: string;
  done: boolean;
  speed?: number;
  onDone: () => void;
}) {
  const [n, setN] = useState(done ? text.length : 0);
  const firedRef = useRef(false);

  useEffect(() => {
    if (done) {
      setN(text.length);
      return;
    }
    if (n >= text.length) {
      if (!firedRef.current) {
        firedRef.current = true;
        onDone();
      }
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
    <div className="animate-step rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xl">{scenario.icon}</span>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
          TRIGGER
        </span>
        <span className={`text-[11px] font-medium ${t.text}`}>
          {scenario.triggerSource}
        </span>
        <span className="ml-auto">
          <UrgencyBadge urgency={scenario.urgency} />
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-200">
        {scenario.triggerText}
      </p>
    </div>
  );
}

const ACCENTS = {
  amber: { bar: "bg-amber-400", num: "bg-amber-400/15 text-amber-300", sub: "text-amber-300" },
  sky: { bar: "bg-sky-400", num: "bg-sky-400/15 text-sky-300", sub: "text-sky-300" },
  violet: { bar: "bg-violet-400", num: "bg-violet-400/15 text-violet-300", sub: "text-violet-300" },
  emerald: { bar: "bg-emerald-400", num: "bg-emerald-400/15 text-emerald-300", sub: "text-emerald-300" },
} as const;

function StepCard({
  n,
  label,
  sub,
  accent,
  children,
}: {
  n: number;
  label: string;
  sub: string;
  accent: keyof typeof ACCENTS;
  children: React.ReactNode;
}) {
  const a = ACCENTS[accent];
  return (
    <div className="animate-step flex gap-3">
      <div className={`mt-1 w-1 shrink-0 rounded-full ${a.bar}`} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${a.num}`}>
            {n}
          </span>
          <span className="text-sm font-bold text-white">{label}</span>
          <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${a.sub}`}>
            {sub}
          </span>
        </div>
        <div className="mt-2 text-sm leading-relaxed text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ============================ Execution ============================ */

function ExecutionView({
  scenario,
  done,
  onDone,
}: {
  scenario: Scenario;
  done: boolean;
  onDone: () => void;
}) {
  const firedRef = useRef(false);
  useEffect(() => {
    if (done) return;
    if (firedRef.current) return;
    const id = window.setTimeout(() => {
      firedRef.current = true;
      onDone();
    }, 750);
    return () => clearTimeout(id);
  }, [done, onDone]);

  const ex = scenario.execution;
  if (ex.kind === "email") {
    return (
      <div className="animate-pop overflow-hidden rounded-xl border border-white/10 bg-[#0a1120]/80">
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2">
          <span className="text-base">✉️</span>
          <span className="text-xs font-bold text-slate-300">自動作成されたメール案</span>
          <span className="ml-auto rounded bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">
            未送信・要承認
          </span>
        </div>
        <div className="space-y-1.5 px-4 py-3 text-sm">
          <p className="text-slate-400">
            <span className="inline-block w-12 font-mono text-xs text-slate-500">To</span>
            {ex.to}
          </p>
          <p className="font-semibold text-white">
            <span className="inline-block w-12 font-mono text-xs text-slate-500">Subj</span>
            {ex.subject}
          </p>
          <div className="mt-2 whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-3 text-[13px] leading-relaxed text-slate-300">
            {ex.body}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="animate-pop overflow-hidden rounded-xl border border-white/10 bg-[#0a1120]/80">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2">
        <span className="text-base">🧾</span>
        <span className="text-xs font-bold text-slate-300">発注承認申請書</span>
        <span className="ml-auto rounded bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">
          未発注・要承認
        </span>
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

function HumanInTheLoop({
  scenario,
  decision,
  onApprove,
  onRevise,
}: {
  scenario: Scenario;
  decision: Decision;
  onApprove: () => void;
  onRevise: () => void;
}) {
  if (decision === "approved") {
    return (
      <div className="animate-pop relative mt-4 overflow-hidden rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
        <Burst />
        <p className="relative flex items-center gap-2 text-sm font-bold text-emerald-300">
          <span className="text-base">✅</span>
          {scenario.approvedTitle}
        </p>
        <p className="relative mt-1.5 text-[13px] leading-relaxed text-emerald-100/90">
          {scenario.approvedBody}
        </p>
      </div>
    );
  }
  if (decision === "revised") {
    return (
      <div className="animate-pop mt-4 rounded-xl border border-white/15 bg-white/5 p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <span className="text-base">✋</span>
          人間の判断に差し戻しました
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">
          送信・発注は保留しています。修正のご指示をいただければ、内容を作り直して再度ご提案します。
        </p>
      </div>
    );
  }
  return (
    <div className="animate-step mt-4 rounded-xl border border-amber-400/30 bg-amber-400/[0.07] p-4">
      <p className="flex items-center gap-2 text-xs font-bold text-amber-300">
        <span className="text-sm">🔒</span>
        最終確認・承認（Human-in-the-Loop）
      </p>
      <p className="mt-1 text-[12px] text-amber-200/70">
        コンプライアンス上、送信・発注の最終決定は人間が行います。
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={onApprove}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:brightness-110 active:scale-95"
        >
          {scenario.approveLabel}
        </button>
        <button
          onClick={onRevise}
          className="rounded-xl border border-white/15 bg-white/5 px-5 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/10 active:scale-95"
        >
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
    return {
      bx: `${Math.cos(angle) * dist}px`,
      by: `${Math.sin(angle) * dist}px`,
      color: colors[i % colors.length],
      delay: `${(i % 5) * 0.03}s`,
    };
  });
  return (
    <div className="pointer-events-none absolute left-6 top-5">
      {parts.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={
            {
              background: p.color,
              animationDelay: p.delay,
              ["--bx"]: p.bx,
              ["--by"]: p.by,
            } as React.CSSProperties
          }
        />
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
      <p className="mt-4 text-sm font-semibold text-slate-200">
        上のトリガーを選ぶと、エージェントが自律的に動き出します
      </p>
      <p className="mt-1 font-mono text-xs text-slate-500">
        Thought → Action → Execution → Result
      </p>
    </div>
  );
}

function UrgencyBadge({ urgency }: { urgency: Scenario["urgency"] }) {
  const map = {
    高: "border-rose-400/40 bg-rose-400/10 text-rose-300",
    中: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    低: "border-slate-400/40 bg-slate-400/10 text-slate-300",
  } as const;
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${map[urgency]}`}>
      緊急度 {urgency}
    </span>
  );
}

function SectionLabel({
  index,
  children,
}: {
  index: string;
  children: React.ReactNode;
}) {
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
          実際のメール送信・発注・カレンダー更新は行われません。
          表示される会社名・型番・金額はサンプルです。
        </p>
      </div>
    </footer>
  );
}
