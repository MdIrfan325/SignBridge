"use client";

import { useState, useMemo } from "react";
import { SignLanguage, PracticeExercise, getSignById } from "@/lib/sign-data";

interface PracticeQuizProps {
  language: SignLanguage;
  exercise: PracticeExercise;
  onComplete?: (score: number) => void;
}

// Helper function to shuffle array using Fisher-Yates algorithm
const shuffleArray = (array: string[]): string[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export function PracticeQuiz({ language, exercise, onComplete }: PracticeQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const signs = useMemo(() => {
    return exercise.signIds
      .map((id) => getSignById(language, id))
      .filter((sign) => sign !== undefined) as typeof language.words;
  }, [language, exercise]);

  // Generate options for all questions using useMemo
  const questionOptions = useMemo(() => {
    const options: Record<number, string[]> = {};
    signs.forEach((sign, index) => {
      const correctAnswer = sign.label;
      const allOptions = [...new Set([correctAnswer, ...signs.slice(0, 3).map((s) => s.label)])].slice(0, 4);
      options[index] = shuffleArray(allOptions);
    });
    return options;
  }, [signs]);

  const currentSign = signs[currentQuestionIndex];

  const handleAnswer = (answer: string) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: answer,
    });

    if (currentQuestionIndex < signs.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    setShowResults(true);
  };

  const getScore = (): number => {
    if (signs.length === 0) return 0;
    let correct = 0;
    Object.entries(answers).forEach(([index, answer]) => {
      if (parseInt(index) < signs.length && signs[parseInt(index)].label === answer) {
        correct++;
      }
    });
    return Math.round((correct / signs.length) * 100);
  };

  const score = getScore();
  const isPassing = score >= exercise.passingScore;

  if (showResults) {
    return (
      <div className="w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">{exercise.title} - Results</h2>
          <p className="text-foreground/80 mb-8">{exercise.description}</p>
        </div>

        {/* Score Display */}
        <div className={`p-8 rounded-lg text-center ${isPassing ? "bg-accent-soft border border-accent" : "bg-accent-soft/50 border border-accent-soft"}`}>
          <div className="text-6xl font-bold mb-2">
            <span className={isPassing ? "text-accent" : "text-accent"}>{score}%</span>
          </div>
          <p className="text-lg font-semibold text-foreground mb-2">
            {isPassing ? `🎉 Congratulations! You passed!` : `Keep practicing!`}
          </p>
          <p className="text-foreground/80">Passing score: {exercise.passingScore}%</p>
        </div>

        {/* Answer Review */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">Review Your Answers</h3>
          {signs.map((sign, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === sign.label;

            return (
              <div
                key={sign.id}
                className={`p-4 rounded-lg border ${isCorrect ? "border-accent bg-accent-soft/30" : "border-line bg-surface"}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-foreground">Question {index + 1}</p>
                    <p className="text-sm text-foreground/70">{sign.description}</p>
                  </div>
                  {isCorrect ? (
                    <span className="text-accent font-bold">✓ Correct</span>
                  ) : (
                    <span className="text-accent font-bold">✗ Incorrect</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-surface-muted">Your answer:</p>
                    <p className="font-medium text-foreground">{userAnswer || "No answer"}</p>
                  </div>
                  <div>
                    <p className="text-surface-muted">Correct answer:</p>
                    <p className="font-medium text-accent">{sign.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6">
          <button
            onClick={() => {
              setCurrentQuestionIndex(0);
              setAnswers({});
              setShowResults(false);
              onComplete?.(score);
            }}
            className="flex-1 px-4 py-3 rounded-lg bg-accent text-white hover:bg-accent/90 font-medium transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => onComplete?.(score)}
            className="flex-1 px-4 py-3 rounded-lg border border-line text-foreground hover:bg-surface font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  if (!currentSign) {
    return <div className="text-center text-foreground/80">Loading...</div>;
  }

  const options = questionOptions[currentQuestionIndex] || [];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">{exercise.title}</h2>
        <p className="text-foreground/80 mb-4">{exercise.description}</p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Progress</span>
          <span className="text-sm font-semibold text-accent">
            {currentQuestionIndex + 1} / {signs.length}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-surface overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${((currentQuestionIndex + 1) / signs.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="p-8 rounded-lg bg-accent-soft border border-accent-soft text-center">
        <p className="text-lg font-semibold text-foreground mb-2">What is this sign?</p>
        <p className="text-foreground/80">{currentSign.description}</p>
        {currentSign.movement && (
          <p className="text-sm text-surface-muted mt-4">
            <strong>Movement:</strong> {currentSign.movement}
          </p>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            className="p-4 rounded-lg border border-line bg-surface hover:border-accent hover:bg-accent/5 transition-all font-medium text-foreground text-left"
            aria-label={`Select ${option}`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
          className="flex-1 px-4 py-3 rounded-lg border border-line text-foreground hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentQuestionIndex(Math.min(signs.length - 1, currentQuestionIndex + 1))}
          disabled={currentQuestionIndex === signs.length - 1}
          className="flex-1 px-4 py-3 rounded-lg border border-line text-foreground hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
