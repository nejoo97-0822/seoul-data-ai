export interface ColumnMapping {
  original: string;
  korean: string;
  description: string;
  type: "string" | "number" | "date" | "code";
}

export interface Dataset {
  id: string;
  title: string;
  summary: string;
  category: string;
  categoryColor: string;
  rows: number;
  columns: number;
  qualityScore: number;
  updateDate: string;
  updateCycle: string;
  source: string;
  spatialUnit: string;
  columnMappings: ColumnMapping[];
  useCases: string[];
  cautions: string[];
  tags: string[];
  connectedDatasetIds: string[];
  joinKeys: string[];
}

export const datasets: Dataset[] = [
  {
    id: "childcare-facilities",
    title: "서울시 어린이집 현황",
    summary: "서울시 전체 어린이집의 위치, 정원, 유형, 운영 현황 데이터",
    category: "육아",
    categoryColor: "bg-pink-100 text-pink-700",
    rows: 6842,
    columns: 18,
    qualityScore: 92,
    updateDate: "2025-12",
    updateCycle: "분기",
    source: "서울열린데이터광장",
    spatialUnit: "동 단위",
    columnMappings: [
      { original: "CRADDR", korean: "도로명주소", description: "어린이집 소재지 도로명 주소", type: "string" },
      { original: "CRCAPA", korean: "정원", description: "인가 정원 수", type: "number" },
      { original: "CRTYPE", korean: "유형", description: "국공립/민간/가정 등 시설 유형", type: "code" },
      { original: "CRNAME", korean: "시설명", description: "어린이집 이름", type: "string" },
      { original: "SGG_CD", korean: "자치구코드", description: "행정구역 자치구 코드", type: "code" },
      { original: "DONG_CD", korean: "행정동코드", description: "행정동 코드", type: "code" },
      { original: "OPNDT", korean: "개원일", description: "어린이집 개원 날짜", type: "date" },
      { original: "CRCNT", korean: "현원", description: "현재 이용 아동 수", type: "number" },
    ],
    useCases: ["지역별 어린이집 밀집도 비교", "정원 대비 이용률 분석", "국공립 비율 비교"],
    cautions: ["폐원 어린이집 포함 여부 확인 필요", "정원과 현원 차이가 큰 시설 존재"],
    tags: ["육아", "보육", "어린이집", "돌봄"],
    connectedDatasetIds: ["parks", "pediatric-clinics", "living-population"],
    joinKeys: ["SGG_CD", "DONG_CD"],
  },
  {
    id: "parks",
    title: "서울시 공원 현황",
    summary: "도시공원, 자연공원, 어린이공원 등 공원 위치 및 면적 데이터",
    category: "환경",
    categoryColor: "bg-green-100 text-green-700",
    rows: 2183,
    columns: 12,
    qualityScore: 88,
    updateDate: "2025-11",
    updateCycle: "반기",
    source: "서울열린데이터광장",
    spatialUnit: "좌표 (위도/경도)",
    columnMappings: [
      { original: "P_PARK", korean: "공원명", description: "공원의 공식 명칭", type: "string" },
      { original: "P_ADDR", korean: "소재지주소", description: "공원 소재지 주소", type: "string" },
      { original: "P_ZONE", korean: "공원구분", description: "도시공원/자연공원 등", type: "code" },
      { original: "AR", korean: "면적(㎡)", description: "공원 면적", type: "number" },
      { original: "LAT", korean: "위도", description: "중심점 위도", type: "number" },
      { original: "LNG", korean: "경도", description: "중심점 경도", type: "number" },
    ],
    useCases: ["동별 공원 접근성 분석", "1인당 공원 면적 비교", "어린이공원 분포 파악"],
    cautions: ["소규모 쌈지공원 누락 가능", "면적에 비공개 구역 포함 가능"],
    tags: ["공원", "녹지", "환경", "여가"],
    connectedDatasetIds: ["childcare-facilities", "living-population"],
    joinKeys: ["SGG_CD"],
  },
  {
    id: "pediatric-clinics",
    title: "서울시 소아과 의원 현황",
    summary: "소아청소년과 전문의가 있는 의료기관 위치 및 진료과목 데이터",
    category: "의료",
    categoryColor: "bg-blue-100 text-blue-700",
    rows: 1245,
    columns: 14,
    qualityScore: 85,
    updateDate: "2025-10",
    updateCycle: "분기",
    source: "건강보험심사평가원",
    spatialUnit: "좌표 (위도/경도)",
    columnMappings: [
      { original: "YADM_NM", korean: "기관명", description: "의료기관 이름", type: "string" },
      { original: "ADDR", korean: "주소", description: "의료기관 소재지", type: "string" },
      { original: "DGSBJ_CD", korean: "진료과목코드", description: "표시 진료과목 코드", type: "code" },
      { original: "DR_CNT", korean: "의사수", description: "전문의 포함 의사 수", type: "number" },
      { original: "SGG_CD", korean: "자치구코드", description: "행정구역 자치구 코드", type: "code" },
    ],
    useCases: ["지역별 소아과 접근성 비교", "의사 1인당 아동 수 분석"],
    cautions: ["야간/주말 진료 여부 미포함", "전문의 수 별도 확인 필요"],
    tags: ["의료", "소아과", "병원", "건강"],
    connectedDatasetIds: ["childcare-facilities", "living-population"],
    joinKeys: ["SGG_CD"],
  },
  {
    id: "living-population",
    title: "서울 생활인구 데이터",
    summary: "시간대별·연령대별·성별 유동인구 및 상주인구 집계 데이터",
    category: "인구",
    categoryColor: "bg-purple-100 text-purple-700",
    rows: 892450,
    columns: 22,
    qualityScore: 95,
    updateDate: "2026-01",
    updateCycle: "월간",
    source: "서울열린데이터광장 (KT 기반)",
    spatialUnit: "집계구 단위",
    columnMappings: [
      { original: "STDR_DE", korean: "기준일자", description: "데이터 기준 날짜", type: "date" },
      { original: "TMZON_PD_SE", korean: "시간대구분", description: "시간대 구분 코드", type: "code" },
      { original: "ADSTRD_CD", korean: "행정동코드", description: "행정동 코드", type: "code" },
      { original: "TOT_LVPOP_CO", korean: "총생활인구수", description: "해당 시간대 총 생활인구", type: "number" },
      { original: "M_LVPOP", korean: "남성생활인구", description: "남성 생활인구 수", type: "number" },
      { original: "F_LVPOP", korean: "여성생활인구", description: "여성 생활인구 수", type: "number" },
    ],
    useCases: ["심야 시간대 유동인구 분석", "1인 가구 밀집 지역 추정", "연령대별 인구 분포"],
    cautions: ["KT 가입자 기반 추정치", "외국인 포함 여부 데이터셋마다 상이"],
    tags: ["인구", "유동인구", "생활인구", "통계"],
    connectedDatasetIds: ["safety-index", "convenience-stores"],
    joinKeys: ["ADSTRD_CD", "SGG_CD"],
  },
  {
    id: "safety-index",
    title: "서울시 안전지수",
    summary: "범죄, 화재, 교통사고, 생활안전, 자살 5대 분야 안전지수 데이터",
    category: "안전",
    categoryColor: "bg-red-100 text-red-700",
    rows: 625,
    columns: 16,
    qualityScore: 90,
    updateDate: "2025-09",
    updateCycle: "연간",
    source: "서울시 안전관리본부",
    spatialUnit: "구 단위",
    columnMappings: [
      { original: "SGG_NM", korean: "자치구명", description: "자치구 이름", type: "string" },
      { original: "CRIME_IDX", korean: "범죄안전지수", description: "범죄 발생 기반 안전 점수", type: "number" },
      { original: "FIRE_IDX", korean: "화재안전지수", description: "화재 발생 기반 안전 점수", type: "number" },
      { original: "TRAF_IDX", korean: "교통안전지수", description: "교통사고 기반 안전 점수", type: "number" },
      { original: "SAFE_IDX", korean: "종합안전지수", description: "5대 분야 종합 안전 점수", type: "number" },
    ],
    useCases: ["구별 안전도 비교", "야간 귀가 안전 분석", "범죄율 추이 분석"],
    cautions: ["연간 데이터로 최신 변화 미반영", "구 단위 집계로 동 단위 차이 미반영"],
    tags: ["안전", "범죄", "치안", "야간"],
    connectedDatasetIds: ["cctv-locations", "streetlight-data", "living-population"],
    joinKeys: ["SGG_CD"],
  },
  {
    id: "cctv-locations",
    title: "서울시 CCTV 설치 현황",
    summary: "방범용·교통용 CCTV 설치 위치 및 관리기관 데이터",
    category: "안전",
    categoryColor: "bg-red-100 text-red-700",
    rows: 78542,
    columns: 10,
    qualityScore: 82,
    updateDate: "2025-08",
    updateCycle: "반기",
    source: "서울열린데이터광장",
    spatialUnit: "좌표 (위도/경도)",
    columnMappings: [
      { original: "CCTV_NM", korean: "관리번호", description: "CCTV 관리 번호", type: "string" },
      { original: "CCTV_PURPOSE", korean: "설치목적", description: "방범/교통/기타 목적", type: "code" },
      { original: "LAT", korean: "위도", description: "설치 위도", type: "number" },
      { original: "LNG", korean: "경도", description: "설치 경도", type: "number" },
    ],
    useCases: ["CCTV 사각지대 분석", "방범 CCTV 밀도 비교"],
    cautions: ["고장/철거 CCTV 포함 가능", "실시간 운영 여부 미포함"],
    tags: ["CCTV", "방범", "안전", "치안"],
    connectedDatasetIds: ["safety-index", "streetlight-data"],
    joinKeys: ["SGG_CD"],
  },
  {
    id: "streetlight-data",
    title: "서울시 가로등 현황",
    summary: "가로등 설치 위치, 조도, 관리 현황 데이터",
    category: "안전",
    categoryColor: "bg-red-100 text-red-700",
    rows: 234000,
    columns: 9,
    qualityScore: 78,
    updateDate: "2025-06",
    updateCycle: "연간",
    source: "서울시 도시기반시설본부",
    spatialUnit: "좌표 (위도/경도)",
    columnMappings: [
      { original: "LAMP_CD", korean: "가로등코드", description: "가로등 관리 코드", type: "string" },
      { original: "LAMP_TYPE", korean: "등주유형", description: "LED/나트륨 등 유형", type: "code" },
      { original: "WATT", korean: "소비전력(W)", description: "소비전력 와트", type: "number" },
      { original: "LAT", korean: "위도", description: "설치 위도", type: "number" },
      { original: "LNG", korean: "경도", description: "설치 경도", type: "number" },
    ],
    useCases: ["야간 조도 분석", "어두운 골목 파악"],
    cautions: ["실제 밝기와 차이 가능", "LED 교체 현황 반영 지연"],
    tags: ["가로등", "조명", "야간", "안전"],
    connectedDatasetIds: ["cctv-locations", "safety-index"],
    joinKeys: ["SGG_CD"],
  },
  {
    id: "convenience-stores",
    title: "서울시 편의점 현황",
    summary: "편의점 위치, 브랜드, 24시간 운영 여부 데이터",
    category: "생활",
    categoryColor: "bg-orange-100 text-orange-700",
    rows: 12450,
    columns: 8,
    qualityScore: 80,
    updateDate: "2025-12",
    updateCycle: "분기",
    source: "소상공인시장진흥공단",
    spatialUnit: "좌표 (위도/경도)",
    columnMappings: [
      { original: "BIZ_NM", korean: "상호명", description: "편의점 상호명", type: "string" },
      { original: "BRAND", korean: "브랜드", description: "CU/GS25/세븐일레븐 등", type: "string" },
      { original: "ADDR", korean: "주소", description: "소재지 주소", type: "string" },
      { original: "H24_YN", korean: "24시간여부", description: "24시간 운영 여부 (Y/N)", type: "code" },
    ],
    useCases: ["1인 가구 생활 편의 분석", "심야 편의시설 접근성"],
    cautions: ["폐업 후 반영 지연 가능", "무인매장 별도 구분 미제공"],
    tags: ["편의점", "생활", "1인가구", "편의시설"],
    connectedDatasetIds: ["living-population"],
    joinKeys: ["SGG_CD"],
  },
  {
    id: "public-transport",
    title: "서울시 대중교통 이용 현황",
    summary: "지하철역·버스정류장별 일평균 승하차 인원 데이터",
    category: "교통",
    categoryColor: "bg-cyan-100 text-cyan-700",
    rows: 156000,
    columns: 15,
    qualityScore: 94,
    updateDate: "2026-01",
    updateCycle: "월간",
    source: "서울교통공사 / 서울시 버스정보시스템",
    spatialUnit: "정류장/역 단위",
    columnMappings: [
      { original: "STATN_NM", korean: "역명", description: "지하철역 또는 버스정류장명", type: "string" },
      { original: "LINE_NM", korean: "노선명", description: "노선 번호 또는 호선", type: "string" },
      { original: "RIDE_CNT", korean: "승차인원", description: "일평균 승차 인원", type: "number" },
      { original: "ALIGHT_CNT", korean: "하차인원", description: "일평균 하차 인원", type: "number" },
    ],
    useCases: ["교통 접근성 비교", "출퇴근 이동 패턴 분석"],
    cautions: ["환승 인원 중복 집계 가능", "심야버스 별도 집계"],
    tags: ["교통", "지하철", "버스", "대중교통"],
    connectedDatasetIds: ["living-population"],
    joinKeys: ["SGG_CD", "STATN_CD"],
  },
  {
    id: "hospital-emergency",
    title: "서울시 응급의료기관 현황",
    summary: "응급실 운영 병원 위치, 가용 병상, 진료과목 데이터",
    category: "의료",
    categoryColor: "bg-blue-100 text-blue-700",
    rows: 385,
    columns: 20,
    qualityScore: 91,
    updateDate: "2025-12",
    updateCycle: "월간",
    source: "국립중앙의료원 E-gen",
    spatialUnit: "좌표 (위도/경도)",
    columnMappings: [
      { original: "HOSP_NM", korean: "병원명", description: "의료기관 이름", type: "string" },
      { original: "EMRG_YN", korean: "응급실유무", description: "응급실 운영 여부", type: "code" },
      { original: "BED_CNT", korean: "병상수", description: "가용 병상 수", type: "number" },
      { original: "ADDR", korean: "주소", description: "소재지 주소", type: "string" },
    ],
    useCases: ["응급의료 접근성 분석", "지역별 병상 수 비교"],
    cautions: ["실시간 가용 병상과 차이", "전문 응급센터 별도 구분 필요"],
    tags: ["의료", "응급실", "병원", "건강"],
    connectedDatasetIds: ["pediatric-clinics", "public-transport"],
    joinKeys: ["SGG_CD"],
  },
];

export function getDatasetById(id: string) {
  return datasets.find((d) => d.id === id);
}

export function getDatasetsByCategory(category: string) {
  return datasets.filter((d) => d.category === category);
}

export function getConnectedDatasets(id: string) {
  const dataset = getDatasetById(id);
  if (!dataset) return [];
  return dataset.connectedDatasetIds
    .map((cid) => getDatasetById(cid))
    .filter(Boolean) as Dataset[];
}

export const categories = [
  { name: "전체", count: datasets.length },
  { name: "육아", count: datasets.filter((d) => d.category === "육아").length },
  { name: "안전", count: datasets.filter((d) => d.category === "안전").length },
  { name: "의료", count: datasets.filter((d) => d.category === "의료").length },
  { name: "인구", count: datasets.filter((d) => d.category === "인구").length },
  { name: "생활", count: datasets.filter((d) => d.category === "생활").length },
  { name: "교통", count: datasets.filter((d) => d.category === "교통").length },
  { name: "환경", count: datasets.filter((d) => d.category === "환경").length },
];
