"use client";

import { useState } from "react";
import { SignLanguage, SignEntry } from "@/lib/sign-data";
import { SignSearch } from "./sign-search";
import { SignDetail } from "./sign-detail";

interface SignsGridProps {
  language: SignLanguage;
  title?: string;
  showSearch?: boolean;
  initialCategory?: string;
}

export function SignsGrid({ language, title = "Signs", showSearch = true, initialCategory }: SignsGridProps) {
  const [signs, setSigns] = useState<SignEntry[]>(
    initialCategory
      ? language.words.filter((s) => s.category === initialCategory)
      : language.words
  );
  const [selectedSign, setSelectedSign] = useState<SignEntry | null>(null);

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      {title && <h2 className="text-3xl font-bold text-foreground">{title}</h2>}

      {/* Search */}
      {showSearch && (
        <div className="p-6 rounded-lg bg-surface border border-line">
          <SignSearch language={language} onSignsChange={setSigns} />
        </div>
      )}

      {/* Detail View */}
      {selectedSign && (
        <div className="p-6 rounded-lg bg-surface border border-line">
          <SignDetail sign={selectedSign} onClose={() => setSelectedSign(null)} />
        </div>
      )}

      {/* Signs Grid */}
      {!selectedSign && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {signs.length > 0 ? (
            signs.map((sign) => (
              <div
                key={sign.id}
                onClick={() => setSelectedSign(sign)}
                className="p-6 rounded-lg border border-line bg-surface hover:border-accent transition-all cursor-pointer sb-hover-lift"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedSign(sign);
                  }
                }}
                aria-label={`View details for ${sign.label}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-foreground">{sign.label}</h3>
                  {sign.category && (
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-accent-soft text-accent whitespace-nowrap ml-2">
                      {sign.category}
                    </span>
                  )}
                </div>

                <p className="text-foreground/80 text-sm mb-4 line-clamp-2">{sign.description}</p>

                <div className="space-y-2">
                  {sign.difficulty && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-surface-muted">Level:</span>
                      <span className="font-medium text-foreground capitalize">{sign.difficulty}</span>
                    </div>
                  )}
                  {sign.handshape && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-surface-muted">Handshape:</span>
                      <span className="font-medium text-foreground">{sign.handshape.name}</span>
                    </div>
                  )}
                  {sign.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-surface-muted">Location:</span>
                      <span className="font-medium text-foreground">{sign.location.body_part}</span>
                    </div>
                  )}
                </div>

                <button className="mt-4 w-full px-3 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 font-medium text-sm transition-colors">
                  View Details
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full p-8 text-center">
              <p className="text-foreground/80">No signs found matching your search.</p>
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      {!selectedSign && signs.length > 0 && (
        <div className="text-sm text-surface-muted text-center pt-4">
          Showing {signs.length} of {language.words.length} sign{language.words.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
