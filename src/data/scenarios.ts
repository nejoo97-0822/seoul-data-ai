export interface ScenarioStep {
  phase: "intent" | "catalog" | "exploration" | "calculation" | "result";
  title: string;
  description: string;
  duration: number; // ms
}

export interface AnalysisIntent {
  region: string;
  purpose: string;
  perspective: string;
}

export interface RankingItem {
  rank: number;
  name: string;
  totalScore: number;
  dimensions: Record<string, number>;
}

export interface ScenarioResult {
  rankings: RankingItem[];
  radarCategories: string[];
  methodology: {
    criteria: string[];
    weights: Record<string, number>;
    timePeriod: string;
    limitations: string[];
  };
  mapIndicator: string;
  mapValues: Record<string, number>; // district name -> value
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  keywords: string[][];
  icon: string;
  datasetIds: string[];
  intent: AnalysisIntent;
  steps: ScenarioStep[];
  result: ScenarioResult;
}

export const scenarios: Scenario[] = [
  {
    id: "childcare",
    title: "육아 친화 지역 비교",
    description: "어린이집, 공원, 소아과, 안전지표를 종합해 육아에 좋은 동네를 비교합니다",
    keywords: [["육아"], ["아이", "키우"], ["어린이집"], ["보육"], ["유치원"], ["돌봄"]],
    icon: "👶",
    datasetIds: ["childcare-facilities", "parks", "pediatric-clinics", "safety-index", "living-population"],
    intent: {
      region: "서울시 전체 (구별 비교)",
      purpose: "육아 친화 지역 비교 분석",
      perspective: "영유아 자녀가 있는 가구 관점",
    },
    steps: [
      { phase: "intent", title: "질문 의도 파악", description: "지역, 목적, 관점을 분석하고 있습니다", duration: 1500 },
      { phase: "catalog", title: "내부 카탈로그 탐색", description: "관련 데이터셋을 검색하고 있습니다", duration: 2000 },
      { phase: "exploration", title: "데이터 탐색 및 검증", description: "데이터 결합 가능성과 품질을 확인하고 있습니다", duration: 1500 },
      { phase: "calculation", title: "분석 수행 중", description: "지표별 점수를 계산하고 순위를 매기고 있습니다", duration: 2000 },
      { phase: "result", title: "결과 생성 완료", description: "분석 결과를 정리했습니다", duration: 500 },
    ],
    result: {
      rankings: [
        { rank: 1, name: "송파구", totalScore: 88.2, dimensions: { "어린이집 접근성": 85, "공원 접근성": 85, "소아과 접근성": 88, "안전지수": 87, "교육환경": 92 } },
        { rank: 2, name: "양천구", totalScore: 86.5, dimensions: { "어린이집 접근성": 90, "공원 접근성": 82, "소아과 접근성": 85, "안전지수": 85, "교육환경": 90 } },
        { rank: 3, name: "서초구", totalScore: 85.8, dimensions: { "어린이집 접근성": 82, "공원 접근성": 78, "소아과 접근성": 90, "안전지수": 88, "교육환경": 91 } },
        { rank: 4, name: "강남구", totalScore: 84.2, dimensions: { "어린이집 접근성": 80, "공원 접근성": 68, "소아과 접근성": 92, "안전지수": 86, "교육환경": 95 } },
        { rank: 5, name: "노원구", totalScore: 82.0, dimensions: { "어린이집 접근성": 85, "공원 접근성": 85, "소아과 접근성": 78, "안전지수": 78, "교육환경": 84 } },
        { rank: 6, name: "마포구", totalScore: 80.5, dimensions: { "어린이집 접근성": 78, "공원 접근성": 85, "소아과 접근성": 78, "안전지수": 82, "교육환경": 80 } },
        { rank: 7, name: "강서구", totalScore: 79.8, dimensions: { "어린이집 접근성": 82, "공원 접근성": 80, "소아과 접근성": 80, "안전지수": 78, "교육환경": 79 } },
        { rank: 8, name: "은평구", totalScore: 78.2, dimensions: { "어린이집 접근성": 78, "공원 접근성": 82, "소아과 접근성": 75, "안전지수": 76, "교육환경": 80 } },
      ],
      radarCategories: ["어린이집 접근성", "공원 접근성", "소아과 접근성", "안전지수", "교육환경"],
      methodology: {
        criteria: ["어린이집 수 및 정원 대비 아동 수", "반경 500m 내 공원 수 및 면적", "소아과 의원 수 및 접근 거리", "범죄·교통 안전지수", "학원·도서관 등 교육시설 밀도"],
        weights: { "어린이집 접근성": 0.25, "공원 접근성": 0.20, "소아과 접근성": 0.20, "안전지수": 0.20, "교육환경": 0.15 },
        timePeriod: "2025년 하반기 기준",
        limitations: ["동 단위 차이가 크므로 구 단위 평균은 참고용", "국공립 어린이집과 민간 어린이집 미구분", "실제 대기 인원 미반영"],
      },
      mapIndicator: "육아 친화도",
      mapValues: {
        "송파구": 88, "양천구": 87, "서초구": 86, "강남구": 84,
        "노원구": 82, "마포구": 81, "강서구": 80, "은평구": 78,
        "도봉구": 77, "성동구": 76, "강동구": 75, "용산구": 74,
        "동작구": 73, "광진구": 72, "서대문구": 71, "영등포구": 70,
        "성북구": 69, "동대문구": 68, "구로구": 67, "종로구": 66,
        "중랑구": 65, "강북구": 64, "금천구": 63, "관악구": 62, "중구": 60,
      },
    },
  },
  {
    id: "single-household",
    title: "1인 가구 생활 편의 비교",
    description: "편의점, 대중교통, 의료, 안전 등 1인 가구에 중요한 생활 인프라를 비교합니다",
    keywords: [["1인"], ["혼자"], ["자취"], ["원룸"], ["싱글"], ["독신"], ["1인가구"]],
    icon: "🏠",
    datasetIds: ["convenience-stores", "public-transport", "hospital-emergency", "safety-index", "living-population"],
    intent: {
      region: "서울시 전체 (구별 비교)",
      purpose: "1인 가구 생활 편의성 비교 분석",
      perspective: "혼자 거주하는 청년·직장인 관점",
    },
    steps: [
      { phase: "intent", title: "질문 의도 파악", description: "1인 가구 관점의 생활 편의성을 분석합니다", duration: 1500 },
      { phase: "catalog", title: "내부 카탈로그 탐색", description: "편의시설, 교통, 안전 데이터를 검색합니다", duration: 2000 },
      { phase: "exploration", title: "데이터 탐색 및 검증", description: "심야 시간대 데이터 포함 여부를 확인합니다", duration: 1500 },
      { phase: "calculation", title: "분석 수행 중", description: "편의성 지표를 계산하고 순위를 매기고 있습니다", duration: 2000 },
      { phase: "result", title: "결과 생성 완료", description: "분석 결과를 정리했습니다", duration: 500 },
    ],
    result: {
      rankings: [
        { rank: 1, name: "마포구", totalScore: 89.5, dimensions: { "편의시설": 92, "대중교통": 90, "의료접근성": 80, "야간안전": 82, "생활비": 78 } },
        { rank: 2, name: "관악구", totalScore: 86.2, dimensions: { "편의시설": 88, "대중교통": 88, "의료접근성": 72, "야간안전": 65, "생활비": 92 } },
        { rank: 3, name: "강남구", totalScore: 85.8, dimensions: { "편의시설": 92, "대중교통": 95, "의료접근성": 90, "야간안전": 85, "생활비": 55 } },
        { rank: 4, name: "영등포구", totalScore: 84.0, dimensions: { "편의시설": 85, "대중교통": 90, "의료접근성": 82, "야간안전": 78, "생활비": 75 } },
        { rank: 5, name: "성동구", totalScore: 83.5, dimensions: { "편의시설": 88, "대중교통": 85, "의료접근성": 78, "야간안전": 80, "생활비": 78 } },
        { rank: 6, name: "광진구", totalScore: 82.0, dimensions: { "편의시설": 85, "대중교통": 88, "의료접근성": 78, "야간안전": 72, "생활비": 80 } },
        { rank: 7, name: "동작구", totalScore: 81.5, dimensions: { "편의시설": 82, "대중교통": 88, "의료접근성": 78, "야간안전": 75, "생활비": 82 } },
        { rank: 8, name: "서대문구", totalScore: 80.0, dimensions: { "편의시설": 82, "대중교통": 85, "의료접근성": 80, "야간안전": 72, "생활비": 80 } },
      ],
      radarCategories: ["편의시설", "대중교통", "의료접근성", "야간안전", "생활비"],
      methodology: {
        criteria: ["편의점·마트 밀도 및 24시간 운영 비율", "지하철역·버스정류장 접근성 및 배차 간격", "의원·약국 접근 거리", "야간 CCTV·가로등·범죄율", "평균 월세·관리비 수준"],
        weights: { "편의시설": 0.20, "대중교통": 0.25, "의료접근성": 0.15, "야간안전": 0.20, "생활비": 0.20 },
        timePeriod: "2025년 하반기 기준",
        limitations: ["생활비는 평균 기준으로 동별 편차 큼", "배달 인프라 미반영", "개인 생활 패턴에 따라 우선순위 다름"],
      },
      mapIndicator: "1인 가구 편의도",
      mapValues: {
        "마포구": 90, "관악구": 86, "강남구": 86, "영등포구": 84,
        "성동구": 84, "광진구": 82, "동작구": 82, "서대문구": 80,
        "용산구": 79, "종로구": 78, "중구": 77, "송파구": 76,
        "구로구": 75, "강서구": 74, "동대문구": 73, "성북구": 72,
        "양천구": 71, "은평구": 70, "강동구": 69, "노원구": 68,
        "중랑구": 67, "강북구": 66, "도봉구": 65, "금천구": 64, "서초구": 78,
      },
    },
  },
  {
    id: "nighttime-safety",
    title: "야간 귀가 안전도 비교",
    description: "CCTV, 가로등, 범죄율, 유동인구를 종합해 야간 귀가 안전도를 비교합니다",
    keywords: [["야간"], ["밤"], ["귀가"], ["안전"], ["범죄"], ["치안"], ["밤길"]],
    icon: "🌙",
    datasetIds: ["safety-index", "cctv-locations", "streetlight-data", "living-population"],
    intent: {
      region: "서울시 전체 (구별 비교)",
      purpose: "야간 귀가 안전도 비교 분석",
      perspective: "심야 시간대 도보 귀가자 관점",
    },
    steps: [
      { phase: "intent", title: "질문 의도 파악", description: "야간 귀가 안전 관점을 분석합니다", duration: 1500 },
      { phase: "catalog", title: "내부 카탈로그 탐색", description: "치안·조명·CCTV 데이터를 검색합니다", duration: 2000 },
      { phase: "exploration", title: "데이터 탐색 및 검증", description: "야간 시간대 특화 데이터를 확인합니다", duration: 1500 },
      { phase: "calculation", title: "분석 수행 중", description: "야간 안전 지표를 계산하고 있습니다", duration: 2000 },
      { phase: "result", title: "결과 생성 완료", description: "분석 결과를 정리했습니다", duration: 500 },
    ],
    result: {
      rankings: [
        { rank: 1, name: "서초구", totalScore: 91.2, dimensions: { "CCTV 밀도": 90, "가로등 밀도": 92, "범죄안전지수": 90, "심야 유동인구": 85, "편의점 밀도": 88 } },
        { rank: 2, name: "강남구", totalScore: 89.8, dimensions: { "CCTV 밀도": 92, "가로등 밀도": 88, "범죄안전지수": 88, "심야 유동인구": 92, "편의점 밀도": 90 } },
        { rank: 3, name: "송파구", totalScore: 86.5, dimensions: { "CCTV 밀도": 85, "가로등 밀도": 88, "범죄안전지수": 87, "심야 유동인구": 82, "편의점 밀도": 85 } },
        { rank: 4, name: "용산구", totalScore: 85.0, dimensions: { "CCTV 밀도": 85, "가로등 밀도": 85, "범죄안전지수": 82, "심야 유동인구": 88, "편의점 밀도": 82 } },
        { rank: 5, name: "양천구", totalScore: 83.8, dimensions: { "CCTV 밀도": 82, "가로등 밀도": 86, "범죄안전지수": 85, "심야 유동인구": 75, "편의점 밀도": 82 } },
        { rank: 6, name: "마포구", totalScore: 82.5, dimensions: { "CCTV 밀도": 80, "가로등 밀도": 82, "범죄안전지수": 80, "심야 유동인구": 88, "편의점 밀도": 85 } },
        { rank: 7, name: "영등포구", totalScore: 81.0, dimensions: { "CCTV 밀도": 82, "가로등 밀도": 80, "범죄안전지수": 78, "심야 유동인구": 85, "편의점 밀도": 82 } },
        { rank: 8, name: "동작구", totalScore: 79.5, dimensions: { "CCTV 밀도": 78, "가로등 밀도": 82, "범죄안전지수": 78, "심야 유동인구": 78, "편의점 밀도": 80 } },
      ],
      radarCategories: ["CCTV 밀도", "가로등 밀도", "범죄안전지수", "심야 유동인구", "편의점 밀도"],
      methodology: {
        criteria: ["방범용 CCTV 설치 밀도 (개/km²)", "가로등 밀도 및 LED 교체율", "5대 범죄 발생 건수 기반 안전지수", "22시~06시 유동인구 밀도", "24시간 편의점·무인매장 밀도"],
        weights: { "CCTV 밀도": 0.20, "가로등 밀도": 0.20, "범죄안전지수": 0.30, "심야 유동인구": 0.15, "편의점 밀도": 0.15 },
        timePeriod: "2025년 기준",
        limitations: ["CCTV 실제 작동 여부 미확인", "가로등 조도 실측값이 아닌 등록 데이터", "범죄 신고 기준으로 암수범죄 미포함"],
      },
      mapIndicator: "야간 안전도",
      mapValues: {
        "서초구": 91, "강남구": 90, "송파구": 87, "용산구": 85,
        "양천구": 84, "마포구": 83, "영등포구": 81, "동작구": 80,
        "성동구": 79, "종로구": 78, "강동구": 77, "노원구": 76,
        "도봉구": 75, "광진구": 74, "서대문구": 73, "구로구": 72,
        "은평구": 71, "동대문구": 70, "성북구": 69, "강서구": 68,
        "중구": 75, "금천구": 66, "중랑구": 65, "관악구": 64, "강북구": 63,
      },
    },
  },
  {
    id: "accessibility",
    title: "공원·의료·교통 접근성 비교",
    description: "생활권 내 공원, 의료시설, 대중교통 접근성을 종합 비교합니다",
    keywords: [["공원"], ["병원"], ["교통"], ["접근성"], ["편의"], ["인프라"]],
    icon: "🏥",
    datasetIds: ["parks", "hospital-emergency", "pediatric-clinics", "public-transport", "living-population"],
    intent: {
      region: "서울시 전체 (구별 비교)",
      purpose: "생활 인프라 접근성 종합 비교",
      perspective: "일상 생활권 접근성 관점",
    },
    steps: [
      { phase: "intent", title: "질문 의도 파악", description: "생활 인프라 접근성을 분석합니다", duration: 1500 },
      { phase: "catalog", title: "내부 카탈로그 탐색", description: "공원·의료·교통 데이터를 검색합니다", duration: 2000 },
      { phase: "exploration", title: "데이터 탐색 및 검증", description: "접근 거리 산출을 위한 좌표 데이터를 확인합니다", duration: 1500 },
      { phase: "calculation", title: "분석 수행 중", description: "접근성 점수를 계산하고 있습니다", duration: 2000 },
      { phase: "result", title: "결과 생성 완료", description: "분석 결과를 정리했습니다", duration: 500 },
    ],
    result: {
      rankings: [
        { rank: 1, name: "중구", totalScore: 90.5, dimensions: { "공원 접근성": 75, "의료 접근성": 95, "대중교통": 98, "문화시설": 92, "생활편의": 90 } },
        { rank: 2, name: "종로구", totalScore: 88.8, dimensions: { "공원 접근성": 90, "의료 접근성": 90, "대중교통": 92, "문화시설": 88, "생활편의": 82 } },
        { rank: 3, name: "강남구", totalScore: 87.2, dimensions: { "공원 접근성": 72, "의료 접근성": 92, "대중교통": 95, "문화시설": 85, "생활편의": 92 } },
        { rank: 4, name: "용산구", totalScore: 86.0, dimensions: { "공원 접근성": 88, "의료 접근성": 85, "대중교통": 85, "문화시설": 88, "생활편의": 82 } },
        { rank: 5, name: "마포구", totalScore: 84.5, dimensions: { "공원 접근성": 85, "의료 접근성": 80, "대중교통": 88, "문화시설": 82, "생활편의": 88 } },
        { rank: 6, name: "영등포구", totalScore: 83.2, dimensions: { "공원 접근성": 82, "의료 접근성": 82, "대중교통": 90, "문화시설": 78, "생활편의": 82 } },
        { rank: 7, name: "서초구", totalScore: 82.8, dimensions: { "공원 접근성": 80, "의료 접근성": 88, "대중교통": 85, "문화시설": 80, "생활편의": 80 } },
        { rank: 8, name: "송파구", totalScore: 82.0, dimensions: { "공원 접근성": 85, "의료 접근성": 82, "대중교통": 82, "문화시설": 78, "생활편의": 82 } },
      ],
      radarCategories: ["공원 접근성", "의료 접근성", "대중교통", "문화시설", "생활편의"],
      methodology: {
        criteria: ["반경 500m 내 공원 면적 합계", "반경 1km 내 의료기관 수", "가장 가까운 지하철역·버스정류장 거리", "도서관·문화센터 접근성", "편의점·마트·약국 밀도"],
        weights: { "공원 접근성": 0.20, "의료 접근성": 0.25, "대중교통": 0.25, "문화시설": 0.15, "생활편의": 0.15 },
        timePeriod: "2025년 하반기 기준",
        limitations: ["직선거리 기준으로 실제 도보 거리와 차이", "시설 규모·품질 미반영", "인구 대비 접근성 미반영"],
      },
      mapIndicator: "생활 접근성",
      mapValues: {
        "중구": 91, "종로구": 89, "강남구": 87, "용산구": 86,
        "마포구": 85, "영등포구": 83, "서초구": 83, "송파구": 82,
        "성동구": 80, "광진구": 79, "동작구": 78, "서대문구": 77,
        "강동구": 76, "양천구": 75, "구로구": 74, "동대문구": 73,
        "성북구": 72, "노원구": 71, "은평구": 70, "강서구": 69,
        "금천구": 68, "도봉구": 67, "중랑구": 66, "강북구": 65, "관악구": 72,
      },
    },
  },
];

export const recommendedQuestions = [
  { text: "서울에서 아이 키우기 좋은 구는 어디야?", scenarioId: "childcare" },
  { text: "1인 가구가 살기 좋은 동네 추천해줘", scenarioId: "single-household" },
  { text: "밤에 귀가하기 안전한 지역은?", scenarioId: "nighttime-safety" },
  { text: "공원이랑 병원 접근성 좋은 곳 비교해줘", scenarioId: "accessibility" },
  { text: "마포구에서 아이 키우기 좋은 동네 알려줘", scenarioId: "childcare" },
  { text: "자취하기 좋은 서울 지역 분석해줘", scenarioId: "single-household" },
];
