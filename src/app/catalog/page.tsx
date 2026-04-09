"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Database, ArrowRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { datasets, categories } from "@/data/datasets";
import { motion } from "framer-motion";

export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");
  const router = useRouter();

  const filtered = datasets.filter((ds) => {
    const matchesCategory =
      activeCategory === "전체" || ds.category === activeCategory;
    const matchesSearch =
      !search ||
      ds.title.includes(search) ||
      ds.summary.includes(search) ||
      ds.tags.some((t) => t.includes(search));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">데이터 카탈로그</h1>
        <p className="mt-2 text-muted-foreground">
          AI가 사전 정제한 {datasets.length}개의 서울시 공공데이터셋을
          탐색하세요
        </p>
      </div>

      {/* Search + Filter */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="데이터셋 검색..."
            className="h-10 w-full rounded-lg border bg-white pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat.name
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat.name}
            <span className="ml-1.5 text-xs opacity-70">{cat.count}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ds, i) => (
          <motion.div
            key={ds.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="group cursor-pointer rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/20"
            onClick={() => router.push(`/catalog/${ds.id}`)}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {ds.title}
              </h3>
              <Badge
                variant="secondary"
                className={`text-xs shrink-0 ml-2 ${ds.categoryColor}`}
              >
                {ds.category}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
              {ds.summary}
            </p>

            {/* Quality */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3" />
                  품질 점수
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {ds.qualityScore}/100
                </span>
              </div>
              <Progress value={ds.qualityScore} className="h-1.5" />
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{ds.rows.toLocaleString()}행</span>
              <span>·</span>
              <span>{ds.spatialUnit}</span>
              <span>·</span>
              <span>{ds.updateDate}</span>
            </div>

            {/* Tags */}
            <div className="mt-3 flex flex-wrap gap-1">
              {ds.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center">
          <Database className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">
            검색 결과가 없습니다
          </p>
        </div>
      )}
    </div>
  );
}
