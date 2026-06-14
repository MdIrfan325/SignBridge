"use client";

import { useState, useMemo } from "react";
import { SignLanguage, SignEntry, SignCategory, DifficultyLevel, searchSigns, getAllCategories } from "@/lib/sign-data";

interface SignSearchProps {
  language: SignLanguage;
  onSignsChange: (signs: SignEntry[]) => void;
}

export function SignSearch({ language, onSignsChange }: SignSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SignCategory | "">();
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | "">();

  const categories = useMemo(() => getAllCategories(language), [language]);
  const difficulties: DifficultyLevel[] = ["beginner", "intermediate", "advanced"];

  const filteredSigns = useMemo(() => {
    return searchSigns(language, query, {
      category: selectedCategory ? (selectedCategory as SignCategory) : undefined,
      difficulty: selectedDifficulty ? (selectedDifficulty as DifficultyLevel) : undefined,
    });
  }, [language, query, selectedCategory, selectedDifficulty]);

  // Notify parent of changes
  useMemo(() => {
    onSignsChange(filteredSigns);
  }, [filteredSigns, onSignsChange]);

  return (
    <div className="w-full space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search signs by name or description..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-surface border border-line focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
          aria-label="Search signs"
        />
        <svg
          className="absolute right-3 top-3 w-5 h-5 text-surface-muted pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as SignCategory | "")}
              className="w-full px-3 py-2 rounded-lg bg-surface border border-line focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, " ")}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Difficulty Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Difficulty</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel | "")}
            className="w-full px-3 py-2 rounded-lg bg-surface border border-line focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            aria-label="Filter by difficulty"
          >
            <option value="">All Levels</option>
            {difficulties.map((diff) => (
              <option key={diff} value={diff}>
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-surface-muted">
        Found <span className="font-semibold text-foreground">{filteredSigns.length}</span> sign
        {filteredSigns.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
