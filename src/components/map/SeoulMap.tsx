"use client";

import { useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Tooltip as MapTooltip,
} from "react-leaflet";
import type { Layer, PathOptions } from "leaflet";
import "leaflet/dist/leaflet.css";
import { districts } from "@/data/districts";
import { scenarios } from "@/data/scenarios";

interface SeoulMapProps {
  activeScenario?: string;
}

// Simple GeoJSON for Seoul districts (circles/markers approach since we don't have real boundaries)
// We'll create a simple choropleth using circle markers
function getColor(value: number): string {
  if (value >= 85) return "#1e40af";
  if (value >= 80) return "#3b82f6";
  if (value >= 75) return "#60a5fa";
  if (value >= 70) return "#93c5fd";
  if (value >= 65) return "#bfdbfe";
  return "#dbeafe";
}

export default function SeoulMap({ activeScenario = "childcare" }: SeoulMapProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  const scenario = scenarios.find((s) => s.id === activeScenario);
  const mapValues = scenario?.result.mapValues || {};

  // Create simple GeoJSON features for districts
  const geojsonData = useMemo(() => {
    const features = districts.map((d) => {
      const value = mapValues[d.name] || 50;
      // Create a small polygon around center for each district
      const [lat, lng] = d.center;
      const offset = 0.015;
      return {
        type: "Feature" as const,
        properties: {
          name: d.name,
          nameEn: d.nameEn,
          population: d.population,
          value,
          code: d.code,
        },
        geometry: {
          type: "Polygon" as const,
          coordinates: [
            [
              [lng - offset, lat - offset * 0.8],
              [lng + offset, lat - offset * 0.8],
              [lng + offset, lat + offset * 0.8],
              [lng - offset, lat + offset * 0.8],
              [lng - offset, lat - offset * 0.8],
            ],
          ],
        },
      };
    });
    return { type: "FeatureCollection" as const, features };
  }, [mapValues]);

  const styleFeature = (feature: GeoJSON.Feature | undefined): PathOptions => {
    const value = feature?.properties?.value || 50;
    const isSelected = feature?.properties?.name === selectedDistrict;
    return {
      fillColor: getColor(value),
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: isSelected ? "#1e3a8a" : "#94a3b8",
      fillOpacity: 0.75,
    };
  };

  const onEachFeature = (feature: GeoJSON.Feature, layer: Layer) => {
    const props = feature.properties;
    if (props) {
      layer.bindTooltip(
        `<div style="font-family: 'Noto Sans KR', sans-serif; padding: 4px;">
          <strong>${props.name}</strong><br/>
          ${scenario?.result.mapIndicator || "점수"}: ${props.value}점<br/>
          인구: ${(props.population / 10000).toFixed(1)}만명
        </div>`,
        { sticky: true }
      );
      layer.on({
        click: () => setSelectedDistrict(props.name),
      });
    }
  };

  const selectedDist = districts.find((d) => d.name === selectedDistrict);

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[37.5665, 126.978]}
        zoom={11}
        className="h-full w-full rounded-lg"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <GeoJSON
          key={activeScenario}
          data={geojsonData}
          style={styleFeature}
          onEachFeature={onEachFeature}
        />
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border bg-white/95 p-3 backdrop-blur-sm shadow-sm">
        <p className="text-xs font-semibold mb-2">
          {scenario?.result.mapIndicator || "지표"}
        </p>
        <div className="space-y-1">
          {[
            { label: "85+", color: "#1e40af" },
            { label: "80-84", color: "#3b82f6" },
            { label: "75-79", color: "#60a5fa" },
            { label: "70-74", color: "#93c5fd" },
            { label: "65-69", color: "#bfdbfe" },
            { label: "~64", color: "#dbeafe" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="h-3 w-6 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px] text-muted-foreground">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected district detail */}
      {selectedDist && (
        <div className="absolute top-4 right-4 z-[1000] w-64 rounded-lg border bg-white/95 p-4 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">{selectedDist.name}</h3>
            <button
              onClick={() => setSelectedDistrict(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              닫기
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {scenario?.result.mapIndicator}:{" "}
            <span className="font-semibold text-foreground">
              {mapValues[selectedDist.name]}점
            </span>
          </p>
          <div className="space-y-1.5">
            {selectedDist.dongs.map((dong) => {
              const avg =
                Object.values(dong.scores).reduce((a, b) => a + b, 0) /
                Object.values(dong.scores).length;
              return (
                <div
                  key={dong.name}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-muted-foreground">{dong.name}</span>
                  <span className="font-medium">{avg.toFixed(0)}점</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
