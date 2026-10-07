import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Check, PenLine, HeartPulse, ScrollText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const ONBOARDING_KEY = "orbit:onboarding";
const PROFILE_KEY = "orbit:profile";

function loadOnboarding() {
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProfile(data: object) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
}

const SYMPTOM_OPTIONS = [
  "Low motivation",
  "Brain fog",
  "Anxiety or restlessness",
  "Sleep issues",
  "Lower confidence",
  "Trouble focusing",
  "Social withdrawal",
];

const COMMITMENT_ITEMS = [
  "I will protect my sleep",
  "I will practice a 60-second reset when urges spike",
  "I will ask for support instead of isolating",
];

export default function Personalize() {
  const [, navigate] = useLocation();
  const onboarding = useMemo(
    () => (typeof window === "undefined" ? {} : loadOnboarding()),
    []
  );
  const name = (onboarding?.name as string) || "Friend";

  const [screen, setScreen] = useState(0); // 0 = symptoms, 1 = commit
  const [symptoms, setSymptoms] = useState<string[]>([]);

  const total = 2;
  const progress = Math.round(((screen + 1) / total) * 100);

  const toggleSymptom = (s: string) =>
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const handleCommit = () => {
    saveProfile({ symptoms });
    navigate("/results");
  };

  return (
    <div className="min-h-dvh app-bg text-foreground">
      <div className="mx-auto w-full max-w-[420px] px-4 py-8">
        <div className="page-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10"
              onClick={() => {
                if (screen === 0) navigate("/onboarding");
                else setScreen(0);
              }}
              data-testid="button-personalize-back"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {screen === 0 && (
              <button
                type="button"
                className="text-xs font-semibold text-white/60 underline-offset-4 transition hover:text-white/80 hover:underline"
                onClick={() => setScreen(1)}
                data-testid="link-personalize-skip"
              >
                Skip
              </button>
            )}
          </div>

          <Card className="glass glow mt-5 overflow-hidden">
            <CardContent className="p-6">
              {/* Progress */}
              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between text-xs text-white/60">
                  <span data-testid="text-personalize-step">
                    Step {screen + 1} of {total}
                  </span>
                  <span data-testid="text-personalize-progress">{progress}%</span>
                </div>
                <Progress value={progress} data-testid="progress-personalize" />
              </div>

              {/* ── SCREEN 0: Symptoms ── */}
              {screen === 0 && (
                <>
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div>
                      <h1
                        className="font-[var(--font-serif)] text-[28px] leading-[1.1] text-white"
                        data-testid="text-personalize-title-symptoms"
                      >
                        What symptoms show up for you?
                      </h1>
                      <p
                        className="mt-2 text-sm leading-relaxed text-white/70"
                        data-testid="text-personalize-body-symptoms"
                      >
                        Select any that feel familiar. You can skip this.
                      </p>
                    </div>
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                      <HeartPulse className="h-6 w-6 text-white/85" strokeWidth={1.8} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3" data-testid="group-options-symptoms">
                    {SYMPTOM_OPTIONS.map((s) => {
                      const selected = symptoms.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSymptom(s)}
                          className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
                            selected
                              ? "border-white/20 bg-white/12 text-white shadow-[0_0_0_1px_rgba(130,87,255,0.25)]"
                              : "border-white/10 bg-white/5 text-white/80 hover:bg-white/8 hover:border-white/15"
                          }`}
                          data-testid={`button-symptom-${s.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
                        >
                          <span className="inline-flex items-center gap-2">
                            {selected && <Check className="h-4 w-4 shrink-0" />}
                            {s}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className="grad-pill shine mt-6 w-full rounded-full px-5 py-4 text-[15px] font-semibold text-white transition active:scale-[0.99]"
                    onClick={() => setScreen(1)}
                    data-testid="button-personalize-continue"
                  >
                    Continue
                  </button>
                </>
              )}

              {/* ── SCREEN 1: Commitment ── */}
              {screen === 1 && (
                <>
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div>
                      <h1
                        className="font-[var(--font-serif)] text-[28px] leading-[1.1] text-white"
                        data-testid="text-personalize-title-commit"
                      >
                        A small ritual, {name}
                      </h1>
                      <p
                        className="mt-2 text-sm leading-relaxed text-white/70"
                        data-testid="text-personalize-body-commit"
                      >
                        Make a gentle commitment. It's okay to stumble — we focus on returning.
                      </p>
                    </div>
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                      <ScrollText className="h-6 w-6 text-white/85" strokeWidth={1.8} />
                    </div>
                  </div>

                  <div className="grid gap-3" data-testid="screen-commitment">
                    {COMMITMENT_ITEMS.map((c, idx) => (
                      <div
                        key={c}
                        className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                        data-testid={`row-checklist-${idx}`}
                      >
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
                          <Check className="h-4 w-4 text-white/80" />
                        </div>
                        <p
                          className="text-sm font-semibold text-white/85 leading-snug"
                          data-testid={`text-checklist-${idx}`}
                        >
                          {c}
                        </p>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="grad-pill shine mt-6 w-full rounded-full px-5 py-4 text-[15px] font-semibold text-white transition active:scale-[0.99]"
                    onClick={handleCommit}
                    data-testid="button-commit"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <PenLine className="h-4 w-4" />
                      I commit to myself
                    </span>
                  </button>

                  <p className="mt-4 text-[11px] leading-relaxed text-white/50 text-center" data-testid="text-commit-note">
                    Supportive only. Not medical advice.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
