"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  Calendar,
  Layers,
  Link2,
  AlertTriangle,
  MessageSquare,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDatasetById, getConnectedDatasets } from "@/data/datasets";

export default function DatasetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const dataset = getDatasetById(id);

  if (!dataset) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Database className="h-12 w-12 text-muted-foreground/30" />
        <p className="mt-4 text-muted-foreground">
          데이터셋을 찾을 수 없습니다
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/catalog")}
        >
          카탈로그로 돌아가기
        </Button>
      </div>
    );
  }

  const connected = getConnectedDatasets(dataset.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Back */}
      <button
        onClick={() => router.push("/catalog")}
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        카탈로그로 돌아가기
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start gap-3 mb-3">
          <h1 className="text-2xl font-bold text-foreground">
            {dataset.title}
          </h1>
          <Badge className={`shrink-0 ${dataset.categoryColor}`}>
            {dataset.category}
          </Badge>
        </div>
        <p className="text-muted-foreground">{dataset.summary}</p>

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Database className="h-4 w-4" />
            {dataset.rows.toLocaleString()}행 · {dataset.columns}열
          </span>
          <span className="flex items-center gap-1.5">
            <Layers className="h-4 w-4" />
            {dataset.spatialUnit}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {dataset.updateDate} ({dataset.updateCycle} 갱신)
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="h-4 w-4" />
            품질 {dataset.qualityScore}/100
          </span>
        </div>

        <div className="mt-3">
          <Progress value={dataset.qualityScore} className="h-2 max-w-xs" />
        </div>

        <div className="mt-4">
          <Button
            onClick={() =>
              router.push(
                `/analysis?q=${encodeURIComponent(dataset.title + " 분석")}`
              )
            }
            className="rounded-xl"
          >
            <MessageSquare className="mr-1.5 h-4 w-4" />
            AI에게 이 데이터로 질문하기
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="columns" className="mt-6">
        <TabsList>
          <TabsTrigger value="columns">컬럼 매핑</TabsTrigger>
          <TabsTrigger value="usecases">활용 시나리오</TabsTrigger>
          <TabsTrigger value="connected">연결 데이터셋</TabsTrigger>
          <TabsTrigger value="quality">품질 정보</TabsTrigger>
        </TabsList>

        <TabsContent value="columns" className="mt-4">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">원본 컬럼</TableHead>
                  <TableHead className="w-[140px]">한국어 매핑</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead className="w-[80px]">타입</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataset.columnMappings.map((col) => (
                  <TableRow key={col.original}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {col.original}
                    </TableCell>
                    <TableCell className="font-semibold text-sm">
                      {col.korean}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {col.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {col.type}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="usecases" className="mt-4">
          <div className="space-y-3">
            {dataset.useCases.map((uc, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border p-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-seoul-100 text-xs font-semibold text-seoul-600">
                  {i + 1}
                </div>
                <p className="text-sm text-foreground">{uc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              관련 태그
            </h3>
            <div className="flex flex-wrap gap-2">
              {dataset.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="connected" className="mt-4">
          {connected.length > 0 ? (
            <div className="space-y-3">
              {connected.map((ds) => (
                <div
                  key={ds.id}
                  className="flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => router.push(`/catalog/${ds.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {ds.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ds.summary}
                      </p>
                    </div>
                  </div>
                  <Badge className={`text-xs ${ds.categoryColor}`}>
                    {ds.category}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              연결된 데이터셋이 없습니다
            </p>
          )}

          <div className="mt-4">
            <p className="text-xs text-muted-foreground">
              결합 가능 키: {dataset.joinKeys.join(", ")}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="mt-4">
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                출처
              </h3>
              <p className="text-sm text-muted-foreground">{dataset.source}</p>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                주의사항
              </h3>
              <ul className="space-y-2">
                {dataset.cautions.map((c, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
