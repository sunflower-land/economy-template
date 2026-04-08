import React from "react";

/** Inline spinner used inside collect / reveal flows. */
export const MinigameLoading: React.FC = () => (
  <div className="flex flex-col items-center gap-2 p-4 text-sm opacity-80">
    <span
      className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#674544] border-t-transparent"
      aria-hidden
    />
    <span>Loading…</span>
  </div>
);
