"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { LANGUAGES } from "@/lib/sign-data";
import { LessonViewer } from "@/components/lesson-viewer";

export function LearnContent() {
  const [selectedLanguageKey, setSelectedLanguageKey] = useState<string>("isl");
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  const language = LANGUAGES.find((l) => l.key === selectedLanguageKey);
  const lesson = language?.lessons?.find((l) => l.id === selectedLesson);

  return (
    <main className="min-h-screen">
      <SectionHeading
        eyebrow="Interactive Learning"
        title="Master Sign Language Step by Step"
        description="Structured lessons designed to build your sign language skills from beginner to advanced."
      />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Lesson Viewer */}
          {lesson && language ? (
            <div className="mb-20">
              <button
                onClick={() => {
                  setSelectedLesson(null);
                }}
                className="mb-6 px-4 py-2 rounded-lg border border-line text-foreground hover:bg-surface transition-colors"
                aria-label="Back to lessons"
              >
                ← Back to Lessons
              </button>
              <LessonViewer
                language={language}
                lesson={lesson}
                onComplete={() => {
                  setSelectedLesson(null);
                }}
              />
            </div>
          ) : (
            <>
              {/* Language Selection */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-4">Select a Language</h2>
                <div className="flex gap-4 flex-wrap">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.key}
                      onClick={() => {
                        setSelectedLanguageKey(lang.key);
                        setSelectedLesson(null);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedLanguageKey === lang.key
                          ? "bg-accent text-white"
                          : "bg-surface border border-line text-foreground hover:border-accent"
                      }`}
                      aria-pressed={selectedLanguageKey === lang.key}
                    >
                      {lang.shortName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lessons Grid */}
              {language?.lessons && language.lessons.length > 0 ? (
                <div className="mb-20">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Available Lessons</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {language.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="p-6 rounded-lg border border-line bg-surface hover:border-accent transition-all hover:shadow-lg cursor-pointer sb-hover-lift"
                        onClick={() => setSelectedLesson(lesson.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setSelectedLesson(lesson.id);
                          }
                        }}
                        aria-label={`Start ${lesson.title} lesson`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-foreground flex-1">{lesson.title}</h3>
                          <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-accent text-white whitespace-nowrap ml-2">
                            {lesson.difficulty}
                          </span>
                        </div>
                        <p className="text-foreground/70 text-sm mb-4">{lesson.description}</p>
                        <div className="flex items-center justify-between text-sm text-surface-muted">
                          <span>📚 {lesson.signIds.length} signs</span>
                          <span>⏱️ {lesson.estimatedDuration} min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-lg bg-accent-soft border border-accent-soft text-center mb-20">
                  <p className="text-foreground/80">No lessons available for this language yet.</p>
                </div>
              )}

              {/* Learning Path Overview */}
              <div className="pt-12 border-t border-line">
                <h2 className="text-2xl font-bold text-foreground mb-8">How Our Lessons Work</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 sb-reveal">
                  <div className="p-8 rounded-2xl border border-line bg-surface sb-hover-lift" style={{ animationDelay: "80ms" }}>
                    <div className="w-12 h-12 rounded-lg bg-accent text-white flex items-center justify-center text-lg font-bold mb-4">
                      1
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">Structured Learning</h3>
                    <p className="text-foreground/80">Lessons are organized by difficulty level and topic, building your skills progressively.</p>
                  </div>

                  <div className="p-8 rounded-2xl border border-line bg-surface sb-hover-lift" style={{ animationDelay: "120ms" }}>
                    <div className="w-12 h-12 rounded-lg bg-accent text-white flex items-center justify-center text-lg font-bold mb-4">
                      2
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">Detailed Explanations</h3>
                    <p className="text-foreground/80">Each sign includes handshape, location, movement details, and usage context.</p>
                  </div>

                  <div className="p-8 rounded-2xl border border-line bg-surface sb-hover-lift" style={{ animationDelay: "160ms" }}>
                    <div className="w-12 h-12 rounded-lg bg-accent text-white flex items-center justify-center text-lg font-bold mb-4">
                      3
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">Video Demonstrations</h3>
                    <p className="text-foreground/80">See signs performed from multiple angles to better understand hand movements.</p>
                  </div>

                  <div className="p-8 rounded-2xl border border-line bg-surface sb-hover-lift" style={{ animationDelay: "200ms" }}>
                    <div className="w-12 h-12 rounded-lg bg-accent text-white flex items-center justify-center text-lg font-bold mb-4">
                      4
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">Community Content</h3>
                    <p className="text-foreground/80">Content is created and validated by Deaf communities to ensure authenticity.</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
