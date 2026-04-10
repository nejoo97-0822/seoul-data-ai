"use client";

export function SceneBadge({
  sceneIndex,
  totalScenes,
}: {
  sceneIndex: number;
  totalScenes: number;
}) {
  return (
    <div className="absolute bottom-4 right-5 text-[10px] font-bold tracking-[0.2em] text-slate-400 select-none">
      SCENE {String(sceneIndex + 1).padStart(2, "0")} /{" "}
      {String(totalScenes).padStart(2, "0")}
    </div>
  );
}
