export interface Dong {
  name: string;
  scores: {
    childcare: number;
    safety: number;
    transport: number;
    medical: number;
    park: number;
    convenience: number;
  };
}

export interface District {
  code: string;
  name: string;
  nameEn: string;
  center: [number, number]; // [lat, lng]
  population: number;
  area: number; // km²
  dongs: Dong[];
}

export const districts: District[] = [
  {
    code: "11680",
    name: "강남구",
    nameEn: "Gangnam-gu",
    center: [37.5172, 127.0473],
    population: 540000,
    area: 39.5,
    dongs: [
      { name: "역삼동", scores: { childcare: 82, safety: 88, transport: 95, medical: 90, park: 65, convenience: 92 } },
      { name: "삼성동", scores: { childcare: 78, safety: 85, transport: 92, medical: 88, park: 70, convenience: 90 } },
      { name: "대치동", scores: { childcare: 90, safety: 90, transport: 85, medical: 85, park: 60, convenience: 88 } },
      { name: "개포동", scores: { childcare: 85, safety: 92, transport: 78, medical: 80, park: 75, convenience: 82 } },
      { name: "압구정동", scores: { childcare: 75, safety: 87, transport: 88, medical: 92, park: 68, convenience: 95 } },
    ],
  },
  {
    code: "11740",
    name: "강동구",
    nameEn: "Gangdong-gu",
    center: [37.5301, 127.1238],
    population: 440000,
    area: 24.6,
    dongs: [
      { name: "천호동", scores: { childcare: 75, safety: 78, transport: 88, medical: 82, park: 70, convenience: 85 } },
      { name: "길동", scores: { childcare: 80, safety: 80, transport: 82, medical: 78, park: 72, convenience: 80 } },
      { name: "둔촌동", scores: { childcare: 82, safety: 85, transport: 80, medical: 75, park: 68, convenience: 78 } },
      { name: "암사동", scores: { childcare: 78, safety: 82, transport: 75, medical: 72, park: 80, convenience: 75 } },
    ],
  },
  {
    code: "11305",
    name: "강북구",
    nameEn: "Gangbuk-gu",
    center: [37.6396, 127.0255],
    population: 310000,
    area: 23.6,
    dongs: [
      { name: "미아동", scores: { childcare: 72, safety: 68, transport: 82, medical: 75, park: 78, convenience: 72 } },
      { name: "번동", scores: { childcare: 68, safety: 65, transport: 78, medical: 70, park: 82, convenience: 68 } },
      { name: "수유동", scores: { childcare: 75, safety: 70, transport: 85, medical: 78, park: 85, convenience: 75 } },
    ],
  },
  {
    code: "11500",
    name: "강서구",
    nameEn: "Gangseo-gu",
    center: [37.5510, 126.8495],
    population: 580000,
    area: 41.4,
    dongs: [
      { name: "화곡동", scores: { childcare: 78, safety: 75, transport: 85, medical: 80, park: 72, convenience: 82 } },
      { name: "등촌동", scores: { childcare: 80, safety: 78, transport: 82, medical: 78, park: 75, convenience: 80 } },
      { name: "마곡동", scores: { childcare: 85, safety: 88, transport: 90, medical: 82, park: 88, convenience: 85 } },
      { name: "발산동", scores: { childcare: 76, safety: 76, transport: 85, medical: 76, park: 70, convenience: 78 } },
    ],
  },
  {
    code: "11620",
    name: "관악구",
    nameEn: "Gwanak-gu",
    center: [37.4784, 126.9516],
    population: 500000,
    area: 29.7,
    dongs: [
      { name: "신림동", scores: { childcare: 65, safety: 62, transport: 85, medical: 72, park: 70, convenience: 82 } },
      { name: "봉천동", scores: { childcare: 68, safety: 65, transport: 88, medical: 75, park: 65, convenience: 85 } },
      { name: "낙성대동", scores: { childcare: 70, safety: 68, transport: 82, medical: 70, park: 72, convenience: 78 } },
    ],
  },
  {
    code: "11215",
    name: "광진구",
    nameEn: "Gwangjin-gu",
    center: [37.5385, 127.0823],
    population: 360000,
    area: 17.1,
    dongs: [
      { name: "건대입구", scores: { childcare: 72, safety: 75, transport: 92, medical: 80, park: 65, convenience: 90 } },
      { name: "자양동", scores: { childcare: 75, safety: 72, transport: 85, medical: 78, park: 68, convenience: 82 } },
      { name: "화양동", scores: { childcare: 68, safety: 70, transport: 88, medical: 75, park: 60, convenience: 88 } },
    ],
  },
  {
    code: "11530",
    name: "구로구",
    nameEn: "Guro-gu",
    center: [37.4954, 126.8874],
    population: 410000,
    area: 20.1,
    dongs: [
      { name: "구로동", scores: { childcare: 72, safety: 70, transport: 85, medical: 78, park: 68, convenience: 80 } },
      { name: "신도림동", scores: { childcare: 70, safety: 72, transport: 92, medical: 80, park: 62, convenience: 85 } },
      { name: "개봉동", scores: { childcare: 75, safety: 75, transport: 78, medical: 72, park: 72, convenience: 75 } },
    ],
  },
  {
    code: "11545",
    name: "금천구",
    nameEn: "Geumcheon-gu",
    center: [37.4568, 126.8955],
    population: 230000,
    area: 13.0,
    dongs: [
      { name: "가산동", scores: { childcare: 65, safety: 68, transport: 88, medical: 72, park: 60, convenience: 82 } },
      { name: "독산동", scores: { childcare: 68, safety: 65, transport: 82, medical: 70, park: 65, convenience: 78 } },
    ],
  },
  {
    code: "11350",
    name: "노원구",
    nameEn: "Nowon-gu",
    center: [37.6542, 127.0568],
    population: 520000,
    area: 35.4,
    dongs: [
      { name: "상계동", scores: { childcare: 80, safety: 78, transport: 82, medical: 78, park: 82, convenience: 78 } },
      { name: "중계동", scores: { childcare: 82, safety: 80, transport: 80, medical: 80, park: 85, convenience: 80 } },
      { name: "공릉동", scores: { childcare: 78, safety: 75, transport: 78, medical: 75, park: 80, convenience: 75 } },
    ],
  },
  {
    code: "11320",
    name: "도봉구",
    nameEn: "Dobong-gu",
    center: [37.6688, 127.0471],
    population: 320000,
    area: 20.7,
    dongs: [
      { name: "창동", scores: { childcare: 78, safety: 76, transport: 85, medical: 78, park: 88, convenience: 78 } },
      { name: "쌍문동", scores: { childcare: 75, safety: 72, transport: 80, medical: 75, park: 82, convenience: 75 } },
    ],
  },
  {
    code: "11230",
    name: "동대문구",
    nameEn: "Dongdaemun-gu",
    center: [37.5744, 127.0396],
    population: 350000,
    area: 14.2,
    dongs: [
      { name: "전농동", scores: { childcare: 72, safety: 70, transport: 85, medical: 80, park: 68, convenience: 82 } },
      { name: "답십리동", scores: { childcare: 70, safety: 68, transport: 82, medical: 78, park: 65, convenience: 80 } },
      { name: "회기동", scores: { childcare: 68, safety: 72, transport: 88, medical: 82, park: 70, convenience: 78 } },
    ],
  },
  {
    code: "11590",
    name: "동작구",
    nameEn: "Dongjak-gu",
    center: [37.5124, 126.9394],
    population: 390000,
    area: 16.4,
    dongs: [
      { name: "노량진동", scores: { childcare: 68, safety: 72, transport: 88, medical: 78, park: 70, convenience: 82 } },
      { name: "사당동", scores: { childcare: 75, safety: 75, transport: 90, medical: 80, park: 72, convenience: 85 } },
      { name: "흑석동", scores: { childcare: 72, safety: 78, transport: 82, medical: 75, park: 68, convenience: 78 } },
    ],
  },
  {
    code: "11440",
    name: "마포구",
    nameEn: "Mapo-gu",
    center: [37.5663, 126.9014],
    population: 380000,
    area: 23.8,
    dongs: [
      { name: "연남동", scores: { childcare: 72, safety: 80, transport: 88, medical: 78, park: 82, convenience: 92 } },
      { name: "합정동", scores: { childcare: 70, safety: 78, transport: 90, medical: 80, park: 75, convenience: 90 } },
      { name: "상암동", scores: { childcare: 85, safety: 88, transport: 82, medical: 75, park: 90, convenience: 78 } },
      { name: "망원동", scores: { childcare: 75, safety: 82, transport: 85, medical: 76, park: 80, convenience: 88 } },
      { name: "성산동", scores: { childcare: 80, safety: 82, transport: 80, medical: 78, park: 85, convenience: 82 } },
    ],
  },
  {
    code: "11410",
    name: "서대문구",
    nameEn: "Seodaemun-gu",
    center: [37.5791, 126.9368],
    population: 310000,
    area: 17.6,
    dongs: [
      { name: "신촌동", scores: { childcare: 65, safety: 72, transport: 92, medical: 85, park: 65, convenience: 90 } },
      { name: "연희동", scores: { childcare: 78, safety: 85, transport: 78, medical: 80, park: 80, convenience: 80 } },
      { name: "홍제동", scores: { childcare: 72, safety: 75, transport: 82, medical: 78, park: 75, convenience: 78 } },
    ],
  },
  {
    code: "11650",
    name: "서초구",
    nameEn: "Seocho-gu",
    center: [37.4837, 127.0324],
    population: 430000,
    area: 47.0,
    dongs: [
      { name: "서초동", scores: { childcare: 82, safety: 88, transport: 92, medical: 90, park: 72, convenience: 90 } },
      { name: "반포동", scores: { childcare: 85, safety: 90, transport: 88, medical: 88, park: 78, convenience: 88 } },
      { name: "잠원동", scores: { childcare: 80, safety: 86, transport: 85, medical: 85, park: 82, convenience: 85 } },
      { name: "양재동", scores: { childcare: 78, safety: 85, transport: 82, medical: 82, park: 75, convenience: 82 } },
    ],
  },
  {
    code: "11200",
    name: "성동구",
    nameEn: "Seongdong-gu",
    center: [37.5633, 127.0371],
    population: 310000,
    area: 16.9,
    dongs: [
      { name: "성수동", scores: { childcare: 72, safety: 78, transport: 85, medical: 78, park: 72, convenience: 88 } },
      { name: "왕십리", scores: { childcare: 70, safety: 75, transport: 90, medical: 82, park: 68, convenience: 85 } },
      { name: "옥수동", scores: { childcare: 75, safety: 80, transport: 82, medical: 78, park: 80, convenience: 80 } },
    ],
  },
  {
    code: "11290",
    name: "성북구",
    nameEn: "Seongbuk-gu",
    center: [37.5894, 127.0167],
    population: 430000,
    area: 24.6,
    dongs: [
      { name: "길음동", scores: { childcare: 75, safety: 72, transport: 85, medical: 78, park: 78, convenience: 78 } },
      { name: "정릉동", scores: { childcare: 72, safety: 70, transport: 78, medical: 72, park: 85, convenience: 72 } },
      { name: "안암동", scores: { childcare: 68, safety: 72, transport: 85, medical: 80, park: 70, convenience: 80 } },
    ],
  },
  {
    code: "11710",
    name: "송파구",
    nameEn: "Songpa-gu",
    center: [37.5145, 127.1059],
    population: 660000,
    area: 33.9,
    dongs: [
      { name: "잠실동", scores: { childcare: 82, safety: 85, transport: 92, medical: 88, park: 85, convenience: 92 } },
      { name: "문정동", scores: { childcare: 80, safety: 82, transport: 85, medical: 82, park: 78, convenience: 85 } },
      { name: "가락동", scores: { childcare: 78, safety: 80, transport: 82, medical: 80, park: 75, convenience: 82 } },
      { name: "위례동", scores: { childcare: 88, safety: 90, transport: 78, medical: 78, park: 88, convenience: 80 } },
    ],
  },
  {
    code: "11470",
    name: "양천구",
    nameEn: "Yangcheon-gu",
    center: [37.5170, 126.8664],
    population: 450000,
    area: 17.4,
    dongs: [
      { name: "목동", scores: { childcare: 88, safety: 88, transport: 85, medical: 85, park: 82, convenience: 88 } },
      { name: "신정동", scores: { childcare: 82, safety: 82, transport: 80, medical: 78, park: 78, convenience: 82 } },
      { name: "신월동", scores: { childcare: 78, safety: 78, transport: 78, medical: 75, park: 75, convenience: 78 } },
    ],
  },
  {
    code: "11560",
    name: "영등포구",
    nameEn: "Yeongdeungpo-gu",
    center: [37.5264, 126.8963],
    population: 390000,
    area: 24.6,
    dongs: [
      { name: "여의도동", scores: { childcare: 72, safety: 88, transport: 92, medical: 85, park: 90, convenience: 85 } },
      { name: "당산동", scores: { childcare: 75, safety: 78, transport: 88, medical: 80, park: 72, convenience: 85 } },
      { name: "영등포동", scores: { childcare: 68, safety: 70, transport: 90, medical: 82, park: 65, convenience: 82 } },
    ],
  },
  {
    code: "11170",
    name: "용산구",
    nameEn: "Yongsan-gu",
    center: [37.5326, 126.9906],
    population: 230000,
    area: 21.9,
    dongs: [
      { name: "이태원동", scores: { childcare: 62, safety: 72, transport: 85, medical: 82, park: 78, convenience: 88 } },
      { name: "한남동", scores: { childcare: 70, safety: 82, transport: 80, medical: 85, park: 82, convenience: 82 } },
      { name: "이촌동", scores: { childcare: 78, safety: 88, transport: 85, medical: 82, park: 88, convenience: 82 } },
    ],
  },
  {
    code: "11380",
    name: "은평구",
    nameEn: "Eunpyeong-gu",
    center: [37.6027, 126.9291],
    population: 480000,
    area: 29.7,
    dongs: [
      { name: "녹번동", scores: { childcare: 75, safety: 75, transport: 82, medical: 78, park: 80, convenience: 78 } },
      { name: "불광동", scores: { childcare: 72, safety: 72, transport: 85, medical: 75, park: 78, convenience: 75 } },
      { name: "진관동", scores: { childcare: 82, safety: 85, transport: 75, medical: 72, park: 90, convenience: 72 } },
    ],
  },
  {
    code: "11110",
    name: "종로구",
    nameEn: "Jongno-gu",
    center: [37.5735, 126.9790],
    population: 150000,
    area: 23.9,
    dongs: [
      { name: "삼청동", scores: { childcare: 60, safety: 82, transport: 85, medical: 80, park: 90, convenience: 72 } },
      { name: "혜화동", scores: { childcare: 65, safety: 78, transport: 88, medical: 85, park: 82, convenience: 80 } },
    ],
  },
  {
    code: "11140",
    name: "중구",
    nameEn: "Jung-gu",
    center: [37.5640, 126.9975],
    population: 130000,
    area: 9.96,
    dongs: [
      { name: "명동", scores: { childcare: 55, safety: 80, transport: 95, medical: 88, park: 60, convenience: 95 } },
      { name: "충무로", scores: { childcare: 58, safety: 78, transport: 92, medical: 85, park: 62, convenience: 90 } },
    ],
  },
  {
    code: "11260",
    name: "중랑구",
    nameEn: "Jungnang-gu",
    center: [37.6063, 127.0928],
    population: 400000,
    area: 18.5,
    dongs: [
      { name: "면목동", scores: { childcare: 72, safety: 68, transport: 82, medical: 75, park: 72, convenience: 78 } },
      { name: "상봉동", scores: { childcare: 70, safety: 70, transport: 85, medical: 78, park: 70, convenience: 78 } },
      { name: "망우동", scores: { childcare: 68, safety: 65, transport: 78, medical: 72, park: 80, convenience: 72 } },
    ],
  },
];

export function getDistrictByCode(code: string) {
  return districts.find((d) => d.code === code);
}

export function getDistrictByName(name: string) {
  return districts.find((d) => d.name === name);
}
