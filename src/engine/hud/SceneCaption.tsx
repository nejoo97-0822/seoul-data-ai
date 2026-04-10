"use client";

export function SceneCaption({
  text,
  accent,
}: {
  text: string;
  accent: string;
}) {
  return (
    <div
      key={text}
      className="absolute left-1/2 bottom-6 -translate-x-1/2 text-[11px] font-medium tracking-wide select-none"
      style={{
        color: `${accent}99`,
        animation: "captionFadeIn 0.5s ease-out",
        transition: "color 0.5s ease-out",
      }}
    >
      {text}
      <style>{`
        @keyframes captionFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(6px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
