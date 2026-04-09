"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Database, BarChart3, MapPin, Shield, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { recommendedQuestions } from "@/data/scenarios";
import { datasets } from "@/data/datasets";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    router.push(`/analysis?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-seoul-50 via-white to-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-seoul-100)_0%,_transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-24 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1.5 text-sm font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              서울시 공공데이터 AI 분석 서비스
            </Badge>

            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              공개된 데이터를,{" "}
              <span className="bg-gradient-to-r from-seoul-500 to-seoul-700 bg-clip-text text-transparent">
                시민이 직접 질문
              </span>
              하고 이해하다
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              서울시 공공데이터를 AI가 미리 정제하고, 여러분의 질문에 맞는 데이터를
              탐색·조합·분석해 근거 있는 답변을 제공합니다
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-10 max-w-2xl"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="궁금한 것을 자유롭게 질문해보세요..."
                className="h-14 w-full rounded-2xl border border-border bg-white pl-12 pr-32 text-base shadow-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/30 focus:shadow-md"
              />
              <Button
                onClick={() => handleSearch()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-5 h-10"
              >
                분석하기
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* Recommended Questions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto mt-6 max-w-2xl"
          >
            <p className="mb-3 text-sm text-muted-foreground">추천 질문</p>
            <div className="flex flex-wrap justify-center gap-2">
              {recommendedQuestions.slice(0, 4).map((q) => (
                <button
                  key={q.text}
                  onClick={() => handleSearch(q.text)}
                  className="rounded-full border border-border bg-white px-4 py-2 text-sm text-foreground transition-all hover:border-primary/30 hover:bg-seoul-50 hover:shadow-sm"
                >
                  {q.text}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              어떻게 작동하나요?
            </h2>
            <p className="mt-3 text-muted-foreground">
              3단계로 공공데이터를 시민이 이해할 수 있는 분석 결과로 바꿉니다
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Database,
                step: "1단계",
                title: "데이터 사전 정제",
                description:
                  "서울시 공공데이터를 AI가 분석해 영문 컬럼명을 한국어로 매핑하고, 품질을 점검하고, 연결 가능한 데이터셋을 정리합니다",
              },
              {
                icon: Search,
                step: "2단계",
                title: "질문 기반 데이터 탐색",
                description:
                  "질문 의도를 파악하고 관련 데이터셋을 찾습니다. 카탈로그만으로 부족하면 추가 공개 데이터를 동적으로 발굴합니다",
              },
              {
                icon: BarChart3,
                step: "3단계",
                title: "AI 분석 및 시각화",
                description:
                  "검증된 데이터로 실제 계산을 수행하고, 비교 결과를 지도·차트와 함께 투명한 근거와 함께 제공합니다",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative rounded-2xl border bg-card p-8"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-seoul-100">
                  <item.icon className="h-6 w-6 text-seoul-600" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-seoul-500 mb-2">
                  {item.step}
                </p>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Data sources preview */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              활용 데이터 미리보기
            </h2>
            <p className="mt-3 text-muted-foreground">
              {datasets.length}개의 정제된 서울시 공공데이터셋을 활용합니다
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {datasets.slice(0, 6).map((ds, i) => (
              <motion.div
                key={ds.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-xl border bg-card p-5 cursor-pointer transition-all hover:shadow-md hover:border-primary/20"
                onClick={() => router.push(`/catalog/${ds.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    {ds.title}
                  </h3>
                  <Badge variant="secondary" className={`text-xs shrink-0 ${ds.categoryColor}`}>
                    {ds.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {ds.summary}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{ds.rows.toLocaleString()}행</span>
                  <span>·</span>
                  <span>품질 {ds.qualityScore}점</span>
                  <span>·</span>
                  <span>{ds.updateDate}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => router.push("/catalog")}
              className="rounded-xl"
            >
              전체 카탈로그 보기
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="border-t bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              기존 서비스와 무엇이 다른가요?
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Search, label: "질문 기반 분석", desc: "데이터를 검색·다운로드하는 게 아니라, 질문하면 분석 결과를 받습니다" },
              { icon: Database, label: "동적 데이터 조합", desc: "여러 데이터셋을 자동으로 탐색·결합해 복합적인 질문에 답합니다" },
              { icon: MapPin, label: "시각화 결과 제공", desc: "지도, 차트, 비교 테이블로 이해하기 쉬운 결과를 제공합니다" },
              { icon: Shield, label: "투명한 근거 공개", desc: "데이터 출처, 계산 기준, 한계점을 모두 공개합니다" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex gap-4 rounded-xl border p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-seoul-100">
                  <item.icon className="h-5 w-5 text-seoul-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {item.label}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <p className="text-xs text-muted-foreground">
            서울 데이터 AI (데모) · 서울시 공공데이터를 활용한 AI 분석 서비스 프로토타입
          </p>
        </div>
      </footer>
    </div>
  );
}
