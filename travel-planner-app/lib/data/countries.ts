export type DialysisLevel = "high" | "medium" | "low";

export type TranslationSupport = "confirmed" | "unclear";

export interface DialysisHospital {
  name: string;
  url: string;
  translationSupport: TranslationSupport;
  notes: string;
}

export interface DialysisInfo {
  level: DialysisLevel;
  notes: string;
  citiesWithCenters: string[];
  /** 실제 웹검색으로 조사한 병원 목록. 조사가 안 된 국가는 undefined. */
  hospitals?: DialysisHospital[];
}

export interface CountryInfo {
  code: string;
  nameKo: string;
  nameEn: string;
  /** 인천(ICN) 출발 항공권 딥링크에 사용할 목적지 공항 IATA 코드 */
  airportCode: string;
  representativeCity: {
    name: string;
    lat: number;
    lon: number;
  };
  /** 1-12, 여행하기 가장 좋다고 통상적으로 알려진 달 */
  bestMonths: number[];
  /** 1-12, 나쁘지는 않지만 최적은 아닌 달 (성수기 직전/직후, 환절기 등) */
  shoulderMonths: number[];
  climateNotes: string;
  dialysis: DialysisInfo;
}

export const countries: CountryInfo[] = [
  {
    code: "JP",
    nameKo: "일본",
    nameEn: "Japan",
    airportCode: "NRT",
    representativeCity: { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
    bestMonths: [3, 4, 5, 10, 11],
    shoulderMonths: [9, 12],
    climateNotes: "3~5월 벚꽃/온화한 봄, 10~11월 단풍/선선한 가을이 최적기. 6~7월은 장마, 8~9월은 태풍 시즌이라 주의 필요.",
    dialysis: {
      level: "high",
      notes: "의료 수준이 매우 높고 대도시에는 임시투석(gaishi)을 받아주는 병원이 많은 편이나, 사전 예약과 소개장이 필수.",
      citiesWithCenters: ["도쿄", "오사카", "교토", "삿포로", "후쿠오카"],
      hospitals: [
        {
          name: "국립국제의료연구센터병원 (National Center for Global Health and Medicine, 도쿄)",
          url: "https://www.hosp.jihs.go.jp/en/outpatient/hemodialysis/index.html",
          translationSupport: "confirmed",
          notes: "여행자 대상 투석 프로그램을 운영하며 영어·중국어 통역 지원을 명시하고 있음.",
        },
        {
          name: "Tokatsu Dialysis Hospital & Clinics",
          url: "https://www.tokatsu-clinic.jp/kor/dialysis.html",
          translationSupport: "confirmed",
          notes: "한국어 안내 페이지를 별도로 제공. 임시투석 환자 접수 절차 안내.",
        },
        {
          name: "Hobashira Clinic (후쿠오카)",
          url: "https://hobashira.com/blog/travel-dialysis-for-international-visitors%EF%BC%88english-chinese-korean%EF%BC%89/",
          translationSupport: "confirmed",
          notes: "영어·중국어·한국어 지원을 명시한 여행자 투석 안내 페이지.",
        },
      ],
    },
  },
  {
    code: "VN",
    nameKo: "베트남",
    nameEn: "Vietnam",
    airportCode: "DAD",
    representativeCity: { name: "Da Nang", lat: 16.0544, lon: 108.2022 },
    bestMonths: [2, 3, 4],
    shoulderMonths: [1, 11, 12],
    climateNotes: "지역별 편차가 크며, 다낭/호이안 기준 2~4월이 건기+선선한 날씨. 9~11월은 중부지방 우기/태풍 위험.",
    dialysis: {
      level: "medium",
      notes: "하노이·호치민의 국제병원급 시설에서는 가능하나 소도시는 어려움. 영어/한국어 통역 지원 여부를 사전 확인 필요.",
      citiesWithCenters: ["하노이", "호치민"],
      hospitals: [
        {
          name: "Vinmec Healthcare System (하노이/호치민)",
          url: "https://my1health.com/hospital/vietnam/hanoi/vinmec-healthcare-system",
          translationSupport: "unclear",
          notes: "외국인 환자 전담 부서를 운영하는 것으로 알려짐. 통역 가능 언어는 직접 문의 필요.",
        },
        {
          name: "MedicalTourism.vn — 여행 중 투석 안내",
          url: "https://medicaltourism.vn/blog/dialysis-in-vietnam-a-solution-for-travelling-patients/",
          translationSupport: "unclear",
          notes: "다낭·호치민 등 주요 병원의 여행자 투석 정보를 정리한 영문 블로그.",
        },
      ],
    },
  },
  {
    code: "TH",
    nameKo: "태국",
    nameEn: "Thailand",
    airportCode: "BKK",
    representativeCity: { name: "Bangkok", lat: 13.7563, lon: 100.5018 },
    bestMonths: [11, 12, 1, 2],
    shoulderMonths: [3, 10],
    climateNotes: "11~2월 건기·저습도로 최적기. 3~5월은 매우 더움, 6~10월은 우기.",
    dialysis: {
      level: "high",
      notes: "방콕은 의료관광이 발달해 임시투석 프로그램을 운영하는 대형 병원이 다수 있음. 치앙마이·푸켓도 가능하나 사전 예약 필수.",
      citiesWithCenters: ["방콕", "치앙마이", "푸켓", "파타야"],
      hospitals: [
        {
          name: "Bumrungrad International Hospital",
          url: "https://www.bumrungrad.com/faqs/how-do-the-international-patients-communicate-with",
          translationSupport: "confirmed",
          notes: "25개 이상 언어, 200명 이상의 의료 통역사를 무료로 상시 지원. 투석 프로그램 운영.",
        },
        {
          name: "태국 투석 클리닉 디렉터리 (Bookimed)",
          url: "https://us-uk.bookimed.com/clinics/country=thailand/procedure=dialysis/",
          translationSupport: "unclear",
          notes: "태국 내 여러 투석 클리닉의 가격/후기를 비교할 수 있는 중개 디렉터리.",
        },
        {
          name: "Bumrungrad 방문 가이드 (my1health)",
          url: "https://my1health.com/guides/bumrungrad-international-hospital-bangkok-patient-guide",
          translationSupport: "confirmed",
          notes: "외국인 환자를 위한 Bumrungrad 이용 가이드(공항 픽업, 숙박 지원 등 포함).",
        },
      ],
    },
  },
  {
    code: "TW",
    nameKo: "대만",
    nameEn: "Taiwan",
    airportCode: "TPE",
    representativeCity: { name: "Taipei", lat: 25.033, lon: 121.5654 },
    bestMonths: [3, 4, 10, 11],
    shoulderMonths: [2, 12],
    climateNotes: "3~4월, 10~11월이 온화. 5~9월은 무덥고 태풍 영향권.",
    dialysis: {
      level: "high",
      notes: "건강보험 제도가 잘 갖춰져 있고 대도시 종합병원에서 단기 방문 투석 대응 경험이 있는 편. 예약 리드타임을 넉넉히 잡을 것.",
      citiesWithCenters: ["타이베이", "가오슝", "타이중"],
      hospitals: [
        {
          name: "SunnyEase Clinic 向怡診所 (난강, 타이베이) — 여행 투석 서비스",
          url: "https://sunnyease.tw/for_travelers/",
          translationSupport: "confirmed",
          notes: "영어·중국어·대만어 가능 인력 보유를 명시. MRT역 도보권.",
        },
        {
          name: "Holiday Hemodialysis — 외국인 대상 투석 예약 플랫폼",
          url: "https://www.holiday-hemodialysis.com/en-us/",
          translationSupport: "confirmed",
          notes: "대만 내 여러 병원의 외국인 투석 예약을 대행하는 영문 플랫폼.",
        },
        {
          name: "Taiwan Adventist Hospital 국제의료센터",
          url: "https://www.tahsda.org.tw/en/WhyChooseTAH.php",
          translationSupport: "confirmed",
          notes: "2008년 설립된 국제의료센터로 외국인 환자 응대 경험이 많음.",
        },
      ],
    },
  },
  {
    code: "SG",
    nameKo: "싱가포르",
    nameEn: "Singapore",
    airportCode: "SIN",
    representativeCity: { name: "Singapore", lat: 1.3521, lon: 103.8198 },
    bestMonths: [2, 3, 7, 8],
    shoulderMonths: [1, 4, 9],
    climateNotes: "연중 고온다습, 11~1월이 우기로 스콜이 잦음. 상대적으로 건조한 2~3월/7~8월이 낫다.",
    dialysis: {
      level: "high",
      notes: "의료 인프라 최상급, 영어 소통 원활. 다만 물가와 진료비가 비싼 편.",
      citiesWithCenters: ["싱가포르 시내 전역"],
      hospitals: [
        {
          name: "Firstline Dialysis Centre — Tourist Dialysis in Singapore",
          url: "https://firstlinedialysis.sg/f/tourist-dialysis-in-singapore",
          translationSupport: "unclear",
          notes: "관광객 대상 투석 안내 페이지를 별도 운영. 왓츠앱/이메일/전화로 예약 문의 가능.",
        },
        {
          name: "Renal Traveller — Singapore",
          url: "https://renaltraveller.com/en/country/singapore",
          translationSupport: "unclear",
          notes: "전 세계 여행자용 투석센터 정보를 모아둔 사이트의 싱가포르 페이지.",
        },
        {
          name: "SATA CommHealth Dialysis Centre",
          url: "https://www.sata.com.sg/sata-commhealth-dialysis-centre/",
          translationSupport: "unclear",
          notes: "싱가포르 내 종합 투석센터, 영어 기반 진료.",
        },
      ],
    },
  },
  {
    code: "PH",
    nameKo: "필리핀(세부)",
    nameEn: "Philippines (Cebu)",
    airportCode: "CEB",
    representativeCity: { name: "Cebu", lat: 10.3157, lon: 123.8854 },
    bestMonths: [1, 2, 3, 4],
    shoulderMonths: [12, 5],
    climateNotes: "1~4월 건기가 최적. 6~11월은 우기+태풍(특히 9~11월) 위험이 커서 비추천.",
    dialysis: {
      level: "medium",
      notes: "세부/마닐라 대형병원에서 가능하나 시설·대기시간 편차가 큼. 사전 확인과 여유 있는 예약이 중요.",
      citiesWithCenters: ["세부", "마닐라"],
      hospitals: [
        {
          name: "Fresenius Kidney Care Philippines — Holiday Dialysis",
          url: "https://www.freseniuskidneycare.ph/holiday-dialysis",
          translationSupport: "confirmed",
          notes: "여행 중 투석 일정 조율을 도와주는 전용 서비스. 영어로 응대.",
        },
        {
          name: "The Hospital at Maayo (세부)",
          url: "https://thehospitalatmaayo.com/services/hemodialysis-treatment",
          translationSupport: "unclear",
          notes: "세부 소재 종합병원의 혈액투석 서비스 페이지.",
        },
        {
          name: "Philippine Red Cross Dialysis Center (마닐라)",
          url: "https://redcross.org.ph/dialysis-center/",
          translationSupport: "unclear",
          notes: "마닐라 포트 지역 소재 투석센터.",
        },
      ],
    },
  },
  {
    code: "ID",
    nameKo: "인도네시아(발리)",
    nameEn: "Indonesia (Bali)",
    airportCode: "DPS",
    representativeCity: { name: "Denpasar", lat: -8.65, lon: 115.2167 },
    bestMonths: [5, 6, 7, 8, 9],
    shoulderMonths: [4, 10],
    climateNotes: "4~10월 건기가 여행 최적기. 11~3월은 우기.",
    dialysis: {
      level: "medium",
      notes: "덴파사르 시내 종합병원에서 대응 가능하나 관광지 소도시는 어려움. 통역 지원이 제한적일 수 있음.",
      citiesWithCenters: ["덴파사르"],
    },
  },
  {
    code: "MY",
    nameKo: "말레이시아",
    nameEn: "Malaysia",
    airportCode: "KUL",
    representativeCity: { name: "Kuala Lumpur", lat: 3.139, lon: 101.6869 },
    bestMonths: [1, 2, 3, 6, 7, 8],
    shoulderMonths: [4, 5, 9],
    climateNotes: "동/서해안 몬순 시기가 달라 지역별 확인 필요. 쿠알라룸푸르 기준 우기(10~12월)를 피하는 게 무난.",
    dialysis: {
      level: "high",
      notes: "쿠알라룸푸르는 의료관광 인프라가 우수해 단기 투석 프로그램 운영 병원이 있음.",
      citiesWithCenters: ["쿠알라룸푸르", "페낭"],
      hospitals: [
        {
          name: "Prince Court Medical Centre — International Patients",
          url: "https://princecourt.com/internationalpatients",
          translationSupport: "confirmed",
          notes: "140개국 이상의 의료관광객을 응대하는 국제환자 전담 창구 보유.",
        },
        {
          name: "Gleneagles Hospital Kuala Lumpur — Haemodialysis Unit",
          url: "https://gleneagles.com.my/kuala-lumpur/facilities-services/haemodialysis-unit",
          translationSupport: "unclear",
          notes: "IHH Healthcare 계열 병원으로 국제환자 대응 경험이 많음.",
        },
        {
          name: "IHH Healthcare Malaysia — International Patients",
          url: "https://www.ihhhealthcare.com/my/international-patients",
          translationSupport: "confirmed",
          notes: "말레이시아 내 여러 병원 그룹의 국제환자 지원 포털.",
        },
      ],
    },
  },
  {
    code: "HK",
    nameKo: "홍콩",
    nameEn: "Hong Kong",
    airportCode: "HKG",
    representativeCity: { name: "Hong Kong", lat: 22.3193, lon: 114.1694 },
    bestMonths: [10, 11, 12],
    shoulderMonths: [3, 4, 9],
    climateNotes: "10~12월 선선하고 건조해 최적. 6~8월은 고온다습+태풍 시즌.",
    dialysis: {
      level: "high",
      notes: "의료 수준 최상급이나 진료비가 높은 편. 사전 예약 필수.",
      citiesWithCenters: ["홍콩 시내 전역"],
      hospitals: [
        {
          name: "The Integrated Dialysis Facilities — Dialysis Service for Tourist",
          url: "https://www.dialysis.com.hk/en/dialysis-service-for-tourist/",
          translationSupport: "confirmed",
          notes: "홍콩에서 외국인 투석 환자를 받는 유일한 민간 위성투석센터로 소개됨. 사전예약 필수.",
        },
        {
          name: "Gleneagles Hospital Hong Kong — Dialysis Centre",
          url: "https://gleneagles.hk/facilities-services/explore-facilities-and-services/general-facilities/dialysis-centre",
          translationSupport: "confirmed",
          notes: "관광객 대상 혈액투석 제공을 명시.",
        },
        {
          name: "Hong Kong Adventist Hospital — Hemodialysis Center",
          url: "https://www.hkah.org.hk/en/centers/hemodialysis-center",
          translationSupport: "confirmed",
          notes: "1999년 설립, 내국인·외국인 환자 모두 진료.",
        },
      ],
    },
  },
  {
    code: "AU",
    nameKo: "호주",
    nameEn: "Australia",
    airportCode: "SYD",
    representativeCity: { name: "Sydney", lat: -33.8688, lon: 151.2093 },
    bestMonths: [3, 4, 5, 9, 10, 11],
    shoulderMonths: [12, 2],
    climateNotes: "남반구라 계절이 반대. 봄(9~11월)·가을(3~5월)이 온화해 여행하기 좋음. 한여름(12~2월)은 폭염 주의.",
    dialysis: {
      level: "high",
      notes: "의료 시스템이 잘 갖춰져 있으나 방문객 임시투석은 병원별로 수용 가능 여부와 비용을 미리 확인해야 함.",
      citiesWithCenters: ["시드니", "멜버른", "브리즈번"],
    },
  },
  {
    code: "FR",
    airportCode: "CDG",
    nameKo: "프랑스",
    nameEn: "France",
    representativeCity: { name: "Paris", lat: 48.8566, lon: 2.3522 },
    bestMonths: [4, 5, 6, 9, 10],
    shoulderMonths: [3, 11],
    climateNotes: "봄(4~6월)과 초가을(9~10월)이 온화하고 관광하기 좋음. 7~8월은 성수기+더위, 겨울은 흐리고 해가 짧음.",
    dialysis: {
      level: "high",
      notes: "의료 수준 최상급. 대도시 병원에서 방문 투석(dialyse de vacances) 프로그램을 운영하는 곳이 있어 사전 예약 시 가능.",
      citiesWithCenters: ["파리", "니스", "리옹"],
    },
  },
  {
    code: "IT",
    airportCode: "FCO",
    nameKo: "이탈리아",
    nameEn: "Italy",
    representativeCity: { name: "Rome", lat: 41.9028, lon: 12.4964 },
    bestMonths: [4, 5, 9, 10],
    shoulderMonths: [3, 6, 11],
    climateNotes: "봄가을이 온화. 7~8월은 매우 덥고 성수기 인파가 많음.",
    dialysis: {
      level: "medium",
      notes: "관광 도시 중심 병원에서 대응 가능하나 예약 절차가 복잡할 수 있어 여유 있는 사전 준비가 필요.",
      citiesWithCenters: ["로마", "밀라노", "피렌체"],
    },
  },
  {
    code: "ES",
    airportCode: "MAD",
    nameKo: "스페인",
    nameEn: "Spain",
    representativeCity: { name: "Madrid", lat: 40.4168, lon: -3.7038 },
    bestMonths: [4, 5, 9, 10],
    shoulderMonths: [3, 6, 11],
    climateNotes: "봄가을이 쾌적. 한여름(7~8월)은 내륙 지역 폭염 주의.",
    dialysis: {
      level: "medium",
      notes: "대도시에서는 가능하나 사전 조율 기간이 필요. 통역 지원 여부 확인 권장.",
      citiesWithCenters: ["마드리드", "바르셀로나"],
    },
  },
  {
    code: "GB",
    airportCode: "LHR",
    nameKo: "영국",
    nameEn: "United Kingdom",
    representativeCity: { name: "London", lat: 51.5072, lon: -0.1276 },
    bestMonths: [5, 6, 9],
    shoulderMonths: [4, 7, 8],
    climateNotes: "5~6월, 9월이 비교적 맑고 온화. 겨울은 해가 짧고 흐린 날이 많음.",
    dialysis: {
      level: "high",
      notes: "의료 수준 최상급. NHS 외 사설 병원 방문 투석 예약이 일반적인 경로.",
      citiesWithCenters: ["런던", "에든버러", "맨체스터"],
    },
  },
  {
    code: "DE",
    airportCode: "MUC",
    nameKo: "독일",
    nameEn: "Germany",
    representativeCity: { name: "Munich", lat: 48.1351, lon: 11.582 },
    bestMonths: [5, 6, 9],
    shoulderMonths: [4, 7, 8],
    climateNotes: "늦봄~초여름, 초가을이 쾌적. 겨울은 흐리고 추움.",
    dialysis: {
      level: "high",
      notes: "'Urlaubsdialyse'(휴가 투석)라는 개념이 보편화되어 있어 관광객 대상 단기 투석 예약이 비교적 체계적.",
      citiesWithCenters: ["뮌헨", "베를린", "프랑크푸르트"],
    },
  },
  {
    code: "CH",
    airportCode: "ZRH",
    nameKo: "스위스",
    nameEn: "Switzerland",
    representativeCity: { name: "Zurich", lat: 47.3769, lon: 8.5417 },
    bestMonths: [6, 7, 8, 9],
    shoulderMonths: [5, 10],
    climateNotes: "여름(6~9월)이 하이킹/알프스 관광 최적기. 겨울은 스키 시즌이지만 산간 접근성 고려 필요.",
    dialysis: {
      level: "high",
      notes: "의료 수준 최상급이나 비용이 매우 높은 편. 사전 예약 필수.",
      citiesWithCenters: ["취리히", "제네바"],
    },
  },
  {
    code: "TR",
    airportCode: "IST",
    nameKo: "튀르키예",
    nameEn: "Turkey",
    representativeCity: { name: "Istanbul", lat: 41.0082, lon: 28.9784 },
    bestMonths: [4, 5, 9, 10],
    shoulderMonths: [3, 6, 11],
    climateNotes: "봄가을이 온화. 한여름은 매우 더움, 카파도키아 열기구는 바람 영향으로 결항 가능성 있음.",
    dialysis: {
      level: "medium",
      notes: "이스탄불 대형병원 중심으로 가능. 사전 예약과 진료기록 준비가 중요.",
      citiesWithCenters: ["이스탄불", "앙카라"],
    },
  },
  {
    code: "CZ",
    airportCode: "PRG",
    nameKo: "체코",
    nameEn: "Czech Republic",
    representativeCity: { name: "Prague", lat: 50.0755, lon: 14.4378 },
    bestMonths: [5, 6, 9],
    shoulderMonths: [4, 7, 8, 10],
    climateNotes: "늦봄~초가을이 쾌적. 겨울은 춥고 해가 짧음(크리스마스 마켓 시즌 인기).",
    dialysis: {
      level: "medium",
      notes: "프라하 대형병원에서 대응 가능하나 사전 조율 리드타임 필요.",
      citiesWithCenters: ["프라하"],
    },
  },
  {
    code: "IS",
    airportCode: "KEF",
    nameKo: "아이슬란드",
    nameEn: "Iceland",
    representativeCity: { name: "Reykjavik", lat: 64.1466, lon: -21.9426 },
    bestMonths: [6, 7, 8],
    shoulderMonths: [5, 9],
    climateNotes: "여름(백야)이 이동/관광에 최적. 겨울은 오로라 시즌이지만 도로/날씨 변수가 큼.",
    dialysis: {
      level: "medium",
      notes: "레이캬비크 국립병원 외에는 시설이 제한적. 반드시 수도권 위주 일정으로 계획 필요.",
      citiesWithCenters: ["레이캬비크"],
    },
  },
  {
    code: "NZ",
    airportCode: "AKL",
    nameKo: "뉴질랜드",
    nameEn: "New Zealand",
    representativeCity: { name: "Auckland", lat: -36.8485, lon: 174.7633 },
    bestMonths: [12, 1, 2, 3],
    shoulderMonths: [11, 4],
    climateNotes: "남반구라 계절 반대. 12~3월(여름)이 야외활동에 최적.",
    dialysis: {
      level: "high",
      notes: "의료 시스템이 안정적이나 방문객 임시투석은 병원별 수용 여부를 미리 확인해야 함.",
      citiesWithCenters: ["오클랜드", "웰링턴"],
    },
  },
  {
    code: "CN",
    airportCode: "PVG",
    nameKo: "중국",
    nameEn: "China",
    representativeCity: { name: "Shanghai", lat: 31.2304, lon: 121.4737 },
    bestMonths: [3, 4, 5, 9, 10, 11],
    shoulderMonths: [2, 12],
    climateNotes: "봄가을이 쾌적. 여름은 지역별로 매우 덥고 습함, 겨울은 북부 한파 주의.",
    dialysis: {
      level: "medium",
      notes: "상하이·베이징 대형병원에서 가능하나 행정 절차와 통역 준비가 까다로울 수 있음.",
      citiesWithCenters: ["상하이", "베이징", "광저우"],
    },
  },
];

export function findCountry(code: string): CountryInfo | undefined {
  return countries.find((c) => c.code === code);
}
