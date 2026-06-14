"use client";

import { SignEntry } from "@/lib/sign-data";
import { useState } from "react";

interface SignDetailProps {
  sign: SignEntry;
  onClose?: () => void;
}

export function SignDetail({ sign, onClose }: SignDetailProps) {
  const [selectedVideoAngle, setSelectedVideoAngle] = useState<number>(0);

  const primaryVideo = sign.videos?.[selectedVideoAngle];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">{sign.label}</h2>
          {sign.difficulty && (
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-accent text-white">
              {sign.difficulty.charAt(0).toUpperCase() + sign.difficulty.slice(1)}
            </span>
          )}
          {sign.category && (
            <span className="inline-block ml-2 px-3 py-1 rounded-full text-sm font-medium bg-accent-soft text-accent">
              {sign.category.replace(/-/g, " ").toUpperCase()}
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-surface-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      {/* Main Description */}
      <p className="text-lg text-foreground/80">{sign.description}</p>

      {/* Video Section */}
      {primaryVideo || sign.videos?.[0] ? (
        <div className="space-y-4">
          <div className="rounded-lg overflow-hidden bg-surface-muted aspect-video flex items-center justify-center">
            {primaryVideo?.url ? (
              <video
                src={primaryVideo.url}
                controls
                className="w-full h-full"
                aria-label={`${sign.label} sign video - ${primaryVideo.angle} angle`}
              />
            ) : (
              <div className="text-center text-surface-muted">
                <p className="text-sm">Video not available</p>
              </div>
            )}
          </div>

          {/* Video Angle Selector */}
          {sign.videos && sign.videos.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {sign.videos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedVideoAngle(index)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedVideoAngle === index
                      ? "bg-accent text-white"
                      : "bg-surface border border-line hover:border-accent text-foreground"
                  }`}
                  aria-label={`View ${sign.videos![index].angle} angle`}
                  aria-pressed={selectedVideoAngle === index}
                >
                  {sign.videos[index].angle.charAt(0).toUpperCase() + sign.videos[index].angle.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Sign Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Movement */}
        <div className="p-4 rounded-lg bg-surface border border-line">
          <h3 className="font-semibold text-foreground mb-2">Movement</h3>
          <p className="text-foreground/80">{sign.movement}</p>
        </div>

        {/* Tip */}
        <div className="p-4 rounded-lg bg-surface border border-line">
          <h3 className="font-semibold text-foreground mb-2">💡 Tip</h3>
          <p className="text-foreground/80">{sign.tip}</p>
        </div>
      </div>

      {/* Technical Details */}
      {(sign.handshape || sign.location || sign.movementDetails) && (
        <div className="space-y-4 pt-4 border-t border-line">
          <h3 className="text-lg font-semibold text-foreground">Technical Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sign.handshape && (
              <div className="p-4 rounded-lg bg-accent-soft">
                <p className="text-sm font-medium text-surface-muted mb-1">Handshape</p>
                <p className="font-semibold text-foreground">{sign.handshape.name}</p>
                {sign.handshape.description && <p className="text-sm text-foreground/70 mt-1">{sign.handshape.description}</p>}
              </div>
            )}

            {sign.location && (
              <div className="p-4 rounded-lg bg-accent-soft">
                <p className="text-sm font-medium text-surface-muted mb-1">Location</p>
                <p className="font-semibold text-foreground">{sign.location.body_part}</p>
                {sign.location.description && <p className="text-sm text-foreground/70 mt-1">{sign.location.description}</p>}
              </div>
            )}

            {sign.movementDetails && (
              <div className="p-4 rounded-lg bg-accent-soft">
                <p className="text-sm font-medium text-surface-muted mb-1">Movement Type</p>
                <p className="font-semibold text-foreground">{sign.movementDetails.type}</p>
                {sign.movementDetails.direction && (
                  <p className="text-sm text-foreground/70 mt-1">{sign.movementDetails.direction}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Usage Context */}
      {sign.usage_context && (
        <div className="p-4 rounded-lg bg-accent-soft/50 border border-accent-soft">
          <h3 className="font-semibold text-foreground mb-2">Usage Context</h3>
          <p className="text-foreground/80">{sign.usage_context}</p>
        </div>
      )}

      {/* Regional Variations */}
      {sign.regionalVariations && sign.regionalVariations.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-line">
          <h3 className="text-lg font-semibold text-foreground">Regional Variations</h3>
          {sign.regionalVariations.map((variation, index) => (
            <div key={index} className="p-4 rounded-lg bg-surface border border-line">
              <p className="font-semibold text-accent mb-1">{variation.region}</p>
              <p className="text-foreground/80">{variation.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Etymology */}
      {sign.etymology && (
        <div className="p-4 rounded-lg bg-surface border border-line">
          <h3 className="font-semibold text-foreground mb-2">Etymology</h3>
          <p className="text-foreground/80">{sign.etymology}</p>
        </div>
      )}
    </div>
  );
}
