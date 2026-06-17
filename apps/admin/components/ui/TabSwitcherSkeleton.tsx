"use client";

import { C } from "@/constants/colors";

export const TabSwitcherSkeleton = () => {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -600px 0 }
          100% { background-position:  600px 0 }
        }
        .sk {
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 600px 100%;
          animation: shimmer 1.4s ease infinite;
          border-radius: 6px;
        }
      `}</style>

      <div
        style={{
          display: "flex",
          gap: 4,
          background: C.bg,
          borderRadius: 12,
          padding: 4,
          marginBottom: 20,
          width: "fit-content",
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="sk"
            style={{
              height: 30,
              width: 80,
              borderRadius: 9,
            }}
          />
        ))}
      </div>
    </>
  );
};