import React from "react";

interface ArcadeGameShellProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

/**
 * Shared wrapper for all arcade game pages.
 * Provides a consistent back button and page structure so individual
 * game components only need to implement their own logic.
 */
export const ArcadeGameShell: React.FC<ArcadeGameShellProps> = ({
  title,
  onBack,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#1b1725] flex flex-col p-4 text-[#f4f4f4]">
      <div className="w-full max-w-lg mx-auto flex flex-col gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            className="rounded bg-[#3e2731] px-3 py-1 text-xs text-white hover:brightness-95"
            onClick={onBack}
          >
            ← Back
          </button>
          <h1 className="text-lg font-bold">{title}</h1>
        </div>
        {children}
      </div>
    </div>
  );
};
