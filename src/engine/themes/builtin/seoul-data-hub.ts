import type { ThemeDefinition } from "../../core/types";

export const seoulDataHubTheme: ThemeDefinition = {
  id: "seoul-data-hub",
  name: "서울 데이터 AI",
  fontFamily: "'Noto Sans KR', system-ui, sans-serif",
  palette: {
    background: "#F8FAFC",
    surface: "#FFFFFF",
    primary: "#3B82F6",
    secondary: "#0EA5E9",
    accent: "#6366F1",
    text: "#1E293B",
    textMuted: "#94A3B8",
  },
  sceneAccents: {
    spawn:     { accent: "#3B82F6", accentSoft: "#DBEAFE" },
    intake:    { accent: "#0EA5E9", accentSoft: "#E0F2FE" },
    discovery: { accent: "#10B981", accentSoft: "#D1FAE5" },
    alignment: { accent: "#F59E0B", accentSoft: "#FEF3C7" },
    compute:   { accent: "#8B5CF6", accentSoft: "#EDE9FE" },
    assembly:  { accent: "#EC4899", accentSoft: "#FCE7F3" },
    reveal:    { accent: "#F43F5E", accentSoft: "#FFE4E6" },
  },
  actorSkins: {
    particleSwarm: { fill: "#3B82F6", glow: "#3B82F6", glowStrength: 8 },
    ring:          { stroke: "#3B82F6", glow: "#3B82F6", glowStrength: 4 },
    taskCard:      { fill: "#FFFFFF", stroke: "#3B82F6" },
    resultCard:    { fill: "#FFFFFF", stroke: "#F43F5E" },
    beam:          { fill: "#3B82F6", glow: "#3B82F6", glowStrength: 18 },
    glyph:         { fill: "#FFFFFF", stroke: "#3B82F6" },
  },
  stageBackground:
    "linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 55%, #CBD5E1 100%)",
  stageGrid: { size: 44, color: "#0F172A", opacity: 0.05 },
};
