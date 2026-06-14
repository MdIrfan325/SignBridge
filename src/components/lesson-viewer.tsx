"use client";

import { SignLanguage, LessonContent, getSignById } from "@/lib/sign-data";
import { useState } from "react";

interface LessonViewerProps {
  language: SignLanguage;
  lesson: LessonContent;
  onComplete?: (lessonId: string) => void;
}

export function LessonViewer({ language, lesson, onComplete }: LessonViewerProps) {
  const [currentSignIndex, setCurrentSignIndex] = useState(0);
  const [completedSigns, setCompletedSigns] = useState<Set<string>>(new Set());

  const signs = lesson.signIds
    .map((id) => getSignById(language, id))
    .filter((sign) => sign !== undefined) as typeof language.words;

  const currentSign = signs[currentSignIndex];

  const handleSignComplete = () => {
    setCompletedSigns((prev) => new Set([...prev, currentSign.id]));

    if (currentSignIndex < signs.length - 1) {
      setCurrentSignIndex(currentSignIndex + 1);
    } else {
      onComplete?.(lesson.id);
    }
  };

  const completionPercentage = Math.round((completedSigns.size / signs.length) * 100);
  const isLessonComplete = completedSigns.size === signs.length;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">{lesson.title}</h2>
        <p className="text-foreground/80 mb-4">{lesson.description}</p>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-accent text-white">
            {lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1)}
          </span>
          <span className="text-sm text-surface-muted">⏱️ {lesson.estimatedDuration} minutes</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Progress</span>
          <span className="text-sm font-semibold text-accent">{completionPercentage}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-surface overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Objectives */}
      {lesson.objectives.length > 0 && (
        <div className="p-4 rounded-lg bg-accent-soft border border-accent-soft">
          <h3 className="font-semibold text-foreground mb-3">Lesson Objectives</h3>
          <ul className="space-y-2">
            {lesson.objectives.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-2 text-foreground/80">
                <span className="inline-block w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Current Sign */}
      {currentSign && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-foreground">{currentSign.label}</h3>
            <span className="text-sm font-medium text-surface-muted">
              {currentSignIndex + 1} / {signs.length}
            </span>
          </div>

          <p className="text-foreground/80">{currentSign.description}</p>

          {/* Sign Details Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-surface border border-line">
            <div>
              <p className="text-sm font-medium text-surface-muted mb-1">Movement</p>
              <p className="text-foreground">{currentSign.movement}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-surface-muted mb-1">Tip</p>
              <p className="text-foreground">{currentSign.tip}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setCurrentSignIndex(Math.max(0, currentSignIndex - 1))}
              disabled={currentSignIndex === 0}
              className="flex-1 px-4 py-3 rounded-lg border border-line text-foreground hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous sign"
            >
              ← Previous
            </button>

            {!isLessonComplete ? (
              <button
                onClick={handleSignComplete}
                className="flex-1 px-4 py-3 rounded-lg bg-accent text-white hover:bg-accent/90 font-medium transition-colors"
                aria-label="Mark as learned and continue"
              >
                {currentSignIndex === signs.length - 1 ? "Complete Lesson" : "Continue"}
              </button>
            ) : (
              <button
                disabled
                className="flex-1 px-4 py-3 rounded-lg bg-accent text-white font-medium"
                aria-label="Lesson completed"
              >
                ✓ Lesson Complete
              </button>
            )}

            {currentSignIndex < signs.length - 1 && (
              <button
                onClick={() => setCurrentSignIndex(Math.min(signs.length - 1, currentSignIndex + 1))}
                className="flex-1 px-4 py-3 rounded-lg border border-line text-foreground hover:bg-surface transition-colors"
                aria-label="Next sign"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Completion Message */}
      {isLessonComplete && (
        <div className="p-6 rounded-lg bg-accent-soft border border-accent text-center">
          <p className="text-lg font-semibold text-accent mb-2">🎉 Great job!</p>
          <p className="text-foreground/80">You&apos;ve completed this lesson. Practice makes perfect!</p>
        </div>
      )}

      {/* Sign List Navigation */}
      {signs.length > 1 && (
        <div className="space-y-2 pt-4 border-t border-line">
          <p className="text-sm font-medium text-foreground">Signs in this lesson:</p>
          <div className="flex gap-2 flex-wrap">
            {signs.map((sign, idx) => (
              <button
                key={sign.id}
                onClick={() => setCurrentSignIndex(idx)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  idx === currentSignIndex
                    ? "bg-accent text-white"
                    : completedSigns.has(sign.id)
                      ? "bg-accent-soft text-accent line-through"
                      : "bg-surface border border-line text-foreground hover:border-accent"
                }`}
                aria-label={`Go to ${sign.label}`}
                aria-pressed={idx === currentSignIndex}
              >
                {sign.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
