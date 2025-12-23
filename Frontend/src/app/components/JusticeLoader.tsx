import React, { useEffect, useState } from "react";
import ladyJustice from "/lady-justice.png";

export function JusticeLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + 1));
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative w-[300px] h-[420px]">

        {/* Image Container */}
        <div className="relative w-full h-full overflow-hidden">

          {/* IMAGE BLUSH GLOW (ALWAYS ON) */}
          <img
            src={ladyJustice}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-contain"
            style={{
              filter: "blur(18px)",
              opacity: 0.95,
              transform: "scale(1.05)",
              mixBlendMode: "screen",
            }}
          />

          {/* MAIN LADY JUSTICE IMAGE */}
          <img
            src={ladyJustice}
            alt="Lady Justice"
            className="absolute inset-0 w-full h-full object-contain transition-opacity duration-700"
            style={{ opacity: progress > 2 ? 1 : 0 }}
          />

          {/* REVEAL MASK — TOP ➝ BOTTOM */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: `translateY(${progress}%)`,
              transition: "transform 0.06s linear",
              background: "black",
              boxShadow: "0 0 80px rgba(192,160,104,0.25)",
            }}
          />
        </div>

        {/* Progress */}
        <div className="absolute -bottom-22 w-full text-center">
          <p className="tracking-widest text-constitution-gold text-sm">
            {progress < 33 && "WEIGHING TRUTH"}
            {progress >= 33 && progress < 66 && "BALANCING SCALES"}
            {progress >= 66 && "DELIVERING JUSTICE"}
          </p>
          <p className="mt-2 text-2xl font-bold text-constitution-gold">
            {progress}%
          </p>
        </div>

      </div>
    </div>
  );
}
