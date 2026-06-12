"use client";

import { useEffect, useRef, useState } from "react";
import { scenarios, type Scenario } from "./scenarios";

type Decision = "pending" | "approved" | "revised";

const STEP_LABELS = [
  "状況を分析しています",
  "今やるべきアクションを決定しています",
  "実行文面を作成しています",
  "完了報告をまとめています",
] as const;

export default function Home() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [visible, setVisible] = useState(0); // 0..4 表示済みステップ数
  const [running, setRunning] = useState(false);
  const [decision, setDecision] = useState<Decision>("pending");
  const timers = useRef<number[]>([]);

  const active = scenarios.find((s) => s.id === activeId) ?? null;

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (!activeId) return;

    setVisible(0);
    setRunning(true);
    setDecision("pending");

    const delays = [800, 1700, 2800, 4000];
    delays.forEach((d, i) => {
      timers.current.push(window.setTimeout(() => setVisible(i + 1), d));
    });
    timers.current.push(window.setTimeout(() => setRunning(false), 4000));

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [activeId]);

  function reset() {
    setActiveId(null);
    setVisible(0);
    setRunning(false);
    setDecision("pending");
  }

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-20 sm:px-6">
        <Intro />

        {/* シナリオ選択 */}
        <section className="mt-8">
          <SectionLabel>トリガー（状況発生）を選択</SectionLabel>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={[
                  "group rounded-2xl border p-4 text-left transition-all",
                  activeId === s.id
                    ? "border-teal-500 bg-white shadow-lg shadow-teal-500/10 ring-2 ring-teal-500/30"
                    : "border-slate-200 bg-white/70 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md",
                ].join(" ")}
              >
                <div className="flex items-center gap-2 text-2xl">
                  <span>{s.icon}</span>
                  <UrgencyBadge urgency={s.urgency} />
                </div>
                <h3 className="mt-2 text-sm font-bold text-slate-800">
                  {s.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500">{s.tag}</p>
              </button>
            ))}
          </div>
        </section>

        {/* エージェント実行コンソール */}
        <section className="mt-8">
          {!active ? (
            <EmptyConsole />
          ) : (
            <Console
              key={active.id}
              scenario={active}
              visible={visible}
              running={running}
              decision={decision}
              onApprove={() => setDecision("approved")}
              onRevise={() => setDecision("revised")}
              onReset={reset}
            />
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

/* ============================ パーツ ============================ */

function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 text-lg font-black text-white shadow-md">
            ✚
          </div>
          <div>
            <p className="text-sm font-black tracking-tight text-slate-800">
              MediAgent
            </p>
            <p className="text-[11px] text-slate-500">
              病院業務 自律AIエージェント
            </p>
          </div>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700 sm:inline-flex">
          🔒 Human-in-the-Loop
        </span>
      </div>
    </header>
  );
}

function Intro() {
  const steps = [
    { n: 1, t: "状況分析", d: "Thought", c: "text-amber-600" },
    { n: 2, t: "自律アクション", d: "Action", c: "text-blue-600" },
    { n: 3, t: "実行内容", d: "Execution", c: "text-teal-600" },
    { n: 4, t: "完了報告", d: "Result", c: "text-emerald-600" },
  ];
  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white/70 p-6 sm:p-8">
      <h1 className="text-xl font-black tracking-tight text-slate-800 sm:text-2xl">
        指示を待たず、自ら考えて動くAIエージェント
      </h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
        院長秘書・総務業務を兼任する自律型エージェントです。現場で発生した状況（トリガー）に対し、
        <strong className="text-slate-800">
          状況分析 → 自律アクション → 文面作成 → 完了報告
        </strong>
        までを ReAct フレームワークで自律的に思考します。
        ただし送信・発注などの最終決定は必ず人間の承認を求める設計です。
      </p>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {steps.map((s) => (
          <div
            key={s.n}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5"
          >
            <div className="flex items-baseline gap-1.5">
              <span className={`text-base font-black ${s.c}`}>{s.n}</span>
              <span className="text-sm font-bold text-slate-700">{s.t}</span>
            </div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              {s.d}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function EmptyConsole() {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/40 p-8 text-center">
      <p className="text-4xl">🤖</p>
      <p className="mt-3 text-sm font-semibold text-slate-600">
        上のトリガーを選ぶと、エージェントが自律的に動き出します
      </p>
      <p className="mt-1 text-xs text-slate-400">
        思考過程（Thought → Action → Execution → Result）がリアルタイムに表示されます
      </p>
    </div>
  );
}

function Console({
  scenario,
  visible,
  running,
  decision,
  onApprove,
  onRevise,
  onReset,
}: {
  scenario: Scenario;
  visible: number;
  running: boolean;
  decision: Decision;
  onApprove: () => void;
  onRevise: () => void;
  onReset: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
      {/* コンソールヘッダー */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="dot text-teal-500" />
          <span className="text-xs font-bold text-slate-600">
            MediAgent 実行ログ
          </span>
        </div>
        <button
          onClick={onReset}
          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-200/70"
        >
          ✕ リセット
        </button>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        {/* トリガー */}
        <TriggerCard scenario={scenario} />

        {/* Step 1: Thought */}
        {visible >= 1 && (
          <StepCard n={1} label="状況分析" sub="Thought" accent="amber">
            {scenario.thought}
          </StepCard>
        )}

        {/* Step 2: Action */}
        {visible >= 2 && (
          <StepCard n={2} label="自律アクション" sub="Action" accent="blue">
            {scenario.action}
          </StepCard>
        )}

        {/* Step 3: Execution */}
        {visible >= 3 && (
          <StepCard n={3} label="実行内容" sub="Execution" accent="teal">
            <ExecutionView scenario={scenario} />
          </StepCard>
        )}

        {/* Step 4: Result + Human-in-the-Loop */}
        {visible >= 4 && (
          <StepCard n={4} label="完了報告" sub="Result" accent="emerald">
            <p>{scenario.result}</p>
            <HumanInTheLoop
              scenario={scenario}
              decision={decision}
              onApprove={onApprove}
              onRevise={onRevise}
            />
          </StepCard>
        )}

        {/* 思考中インジケータ */}
        {running && visible < 4 && (
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
            <span className="flex gap-1 text-teal-500">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </span>
            <span className="text-xs font-medium text-slate-500">
              {STEP_LABELS[visible]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function TriggerCard({ scenario }: { scenario: Scenario }) {
  return (
    <div className="animate-step rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xl">{scenario.icon}</span>
        <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Trigger
        </span>
        <span className="text-[11px] font-medium text-slate-400">
          {scenario.triggerSource}
        </span>
        <span className="ml-auto">
          <UrgencyBadge urgency={scenario.urgency} />
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">
        {scenario.triggerText}
      </p>
    </div>
  );
}

const ACCENTS = {
  amber: {
    bar: "bg-amber-400",
    num: "bg-amber-100 text-amber-700",
    sub: "text-amber-600",
  },
  blue: {
    bar: "bg-blue-500",
    num: "bg-blue-100 text-blue-700",
    sub: "text-blue-600",
  },
  teal: {
    bar: "bg-teal-500",
    num: "bg-teal-100 text-teal-700",
    sub: "text-teal-600",
  },
  emerald: {
    bar: "bg-emerald-500",
    num: "bg-emerald-100 text-emerald-700",
    sub: "text-emerald-600",
  },
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
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${a.num}`}
          >
            {n}
          </span>
          <span className="text-sm font-bold text-slate-800">{label}</span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${a.sub}`}
          >
            {sub}
          </span>
        </div>
        <div className="mt-2 text-sm leading-relaxed text-slate-700">
          {children}
        </div>
      </div>
    </div>
  );
}

function ExecutionView({ scenario }: { scenario: Scenario }) {
  const ex = scenario.execution;
  if (ex.kind === "email") {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/70">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2">
          <span className="text-base">✉️</span>
          <span className="text-xs font-bold text-slate-600">
            自動作成されたメール案
          </span>
          <span className="ml-auto rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
            未送信・要承認
          </span>
        </div>
        <div className="space-y-1.5 px-4 py-3 text-sm">
          <p className="text-slate-500">
            <span className="inline-block w-12 text-xs font-semibold text-slate-400">
              宛先
            </span>
            {ex.to}
          </p>
          <p className="font-semibold text-slate-800">
            <span className="inline-block w-12 text-xs font-semibold text-slate-400">
              件名
            </span>
            {ex.subject}
          </p>
          <div className="mt-2 whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-3 text-[13px] leading-relaxed text-slate-700">
            {ex.body}
          </div>
        </div>
      </div>
    );
  }
  // order
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70">
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2">
        <span className="text-base">🧾</span>
        <span className="text-xs font-bold text-slate-600">発注承認申請書</span>
        <span className="ml-auto rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
          未発注・要承認
        </span>
      </div>
      <dl className="divide-y divide-slate-200 px-4 py-1 text-sm">
        {ex.fields.map((f) => (
          <div key={f.label} className="flex gap-3 py-2">
            <dt className="w-20 shrink-0 text-xs font-semibold text-slate-400">
              {f.label}
            </dt>
            <dd className="flex-1 text-slate-700">{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

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
      <div className="animate-step mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-emerald-700">
          <span className="text-base">✅</span>
          {scenario.approvedTitle}
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-emerald-800/90">
          {scenario.approvedBody}
        </p>
      </div>
    );
  }
  if (decision === "revised") {
    return (
      <div className="animate-step mt-4 rounded-xl border border-slate-300 bg-slate-50 p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <span className="text-base">✋</span>
          人間の判断に差し戻しました
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
          送信・発注は保留しています。修正のご指示をいただければ、内容を作り直して再度ご提案します。
        </p>
      </div>
    );
  }
  return (
    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
      <p className="flex items-center gap-2 text-xs font-bold text-amber-700">
        <span className="text-sm">🔒</span>
        最終確認・承認（Human-in-the-Loop）
      </p>
      <p className="mt-1 text-[12px] text-amber-700/80">
        コンプライアンス上、送信・発注の最終決定は人間が行います。
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={onApprove}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
        >
          {scenario.approveLabel}
        </button>
        <button
          onClick={onRevise}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 active:scale-95"
        >
          修正する
        </button>
      </div>
    </div>
  );
}

function UrgencyBadge({ urgency }: { urgency: Scenario["urgency"] }) {
  const map = {
    高: "border-red-300 bg-red-50 text-red-600",
    中: "border-amber-300 bg-amber-50 text-amber-600",
    低: "border-slate-300 bg-slate-50 text-slate-500",
  } as const;
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${map[urgency]}`}
    >
      緊急度 {urgency}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
      <span className="h-px w-5 bg-slate-300" />
      {children}
    </h2>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/60">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <p className="text-[11px] leading-relaxed text-slate-400">
          ※ 本アプリは自律型AIエージェントの動作を可視化したデモ（シミュレーション）です。
          実際のメール送信・発注・カレンダー更新は行われません。
          表示される会社名・型番・金額はサンプルです。
        </p>
      </div>
    </footer>
  );
}
