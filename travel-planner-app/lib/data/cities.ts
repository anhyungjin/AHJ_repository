export type SpotCategory = "attraction" | "lunch" | "cafe" | "dinner";

export interface Spot {
  name: string;
  category: SpotCategory;
  /** Google 지도에서 검색/길찾기에 쓸 질의어 (장소명 + 지역 + 국가로 동명이인/동명장소 혼동 방지) */
  mapQuery: string;
  notes?: string;
}

export interface RecommendedLodging {
  name: string;
  area: string;
  notes: string;
  mapQuery: string;
}

export interface CityInfo {
  id: string;
  countryCode: string;
  nameKo: string;
  nameEn: string;
  spots: Spot[];
  /** 배치로 미리 조사해둔, 이 도시의 명소 클러스터 기준 실제 숙소 추천 (정적 데이터, 런타임 API 호출 없음) */
  recommendedLodging: RecommendedLodging[];
}

export const cities: CityInfo[] = [
  {
    id: "tokyo",
    countryCode: "JP",
    nameKo: "도쿄",
    nameEn: "Tokyo",
    spots: [
      { name: "센소지 (아사쿠사)", category: "attraction", mapQuery: "Senso-ji Temple, Asakusa, Tokyo, Japan" },
      { name: "시부야 스크램블 교차로", category: "attraction", mapQuery: "Shibuya Crossing, Tokyo, Japan" },
      { name: "teamLab Planets", category: "attraction", mapQuery: "teamLab Planets TOKYO, Japan", notes: "사전 예약 권장" },
      { name: "메이지신궁", category: "attraction", mapQuery: "Meiji Jingu Shrine, Tokyo, Japan" },
      { name: "츠키지 장외시장 (스시/해산물 덮밥)", category: "lunch", mapQuery: "Tsukiji Outer Market, Tokyo, Japan" },
      { name: "이치란 라멘 시부야점", category: "lunch", mapQuery: "Ichiran Ramen Shibuya, Tokyo, Japan" },
      { name: "카지츠엔 (시부야, 고급 과일 디저트)", category: "cafe", mapQuery: "Kajitsuen Shibuya, Tokyo, Japan" },
      { name: "아이비 플레이스 (다이칸야마)", category: "cafe", mapQuery: "Ivy Place Daikanyama, Tokyo, Japan", notes: "버터밀크 팬케이크 유명" },
      { name: "오모이데요코초 이자카야 골목 (신주쿠)", category: "dinner", mapQuery: "Omoide Yokocho, Shinjuku, Tokyo, Japan" },
    ],
    recommendedLodging: [
      {
        name: "신주쿠 프린스 호텔",
        area: "신주쿠",
        notes: "세이부 신주쿠역 직결, JR 신주쿠역 도보 5분. 오모이데요코초·시내 각지 접근 좋음.",
        mapQuery: "Shinjuku Prince Hotel, Tokyo, Japan",
      },
      {
        name: "시부야 도큐 레이 호텔",
        area: "시부야",
        notes: "시부야 스크램블 교차로·이치란 라멘 도보권. 하라주쿠·다이칸야마 이동도 편함.",
        mapQuery: "Shibuya Tokyu REI Hotel, Tokyo, Japan",
      },
    ],
  },
  {
    id: "osaka",
    countryCode: "JP",
    nameKo: "오사카",
    nameEn: "Osaka",
    spots: [
      { name: "오사카성", category: "attraction", mapQuery: "Osaka Castle, Osaka, Japan" },
      { name: "도톤보리 글리코 사인", category: "attraction", mapQuery: "Dotonbori Glico Sign, Osaka, Japan" },
      { name: "구로몬 시장", category: "attraction", mapQuery: "Kuromon Ichiba Market, Osaka, Japan" },
      { name: "킨류라멘 (도톤보리)", category: "lunch", mapQuery: "Kinryu Ramen Dotonbori, Osaka, Japan" },
      { name: "신사이바시스지 상점가 카페거리", category: "cafe", mapQuery: "Shinsaibashi-suji Shopping Street, Osaka, Japan", notes: "특정 매장보다 상점가 내 여러 카페 중 선택" },
      { name: "야키젠 (오코노미야키/야끼소바, 도톤보리)", category: "dinner", mapQuery: "Dotonbori, Osaka, Japan (okonomiyaki restaurant Yakizen)" },
    ],
    recommendedLodging: [
      {
        name: "크로스 호텔 오사카",
        area: "난바/도톤보리",
        notes: "난바역 도보 5분, 도톤보리 중심가에 위치해 맛집·야경 접근이 가장 좋음.",
        mapQuery: "Cross Hotel Osaka, Japan",
      },
      {
        name: "호텔 비스타 오사카 난바",
        area: "닛폰바시",
        notes: "닛폰바시역 도보 5분, 도톤보리·구로몬시장 접근 편리, 조식 평가 좋음.",
        mapQuery: "Hotel Vista Osaka Namba, Japan",
      },
    ],
  },
  {
    id: "bangkok",
    countryCode: "TH",
    nameKo: "방콕",
    nameEn: "Bangkok",
    spots: [
      { name: "왓아룬 (새벽사원)", category: "attraction", mapQuery: "Wat Arun, Bangkok, Thailand" },
      { name: "왕궁 & 왓프라깨우", category: "attraction", mapQuery: "Grand Palace, Bangkok, Thailand" },
      { name: "왓포 (와불사)", category: "attraction", mapQuery: "Wat Pho, Bangkok, Thailand" },
      { name: "아시아티크 리버프론트", category: "attraction", mapQuery: "Asiatique The Riverfront, Bangkok, Thailand" },
      { name: "팁싸마이 (팟타이)", category: "lunch", mapQuery: "Thipsamai Pad Thai, Bangkok, Thailand", notes: "미슐랭 빕구르망" },
      { name: "KAYY Coffee (카오산로드 인근)", category: "cafe", mapQuery: "KAYY Coffee, Khao San Road, Bangkok, Thailand" },
      { name: "Make Me Mango (왓포 인근)", category: "cafe", mapQuery: "Make Me Mango, Maharat Road, Bangkok, Thailand" },
      { name: "아시아티크 리버프론트 야시장 식당가", category: "dinner", mapQuery: "Asiatique The Riverfront, Bangkok, Thailand" },
    ],
    recommendedLodging: [
      {
        name: "프린스 팰리스 호텔 방콕",
        area: "왕궁/카오산 인근",
        notes: "운하변 위치, 왕궁·카오산로드와 가깝고 페리 서비스로 강변 이동도 편리.",
        mapQuery: "Prince Palace Hotel Bangkok, Thailand",
      },
      {
        name: "바이올렛 타워 앳 카오산 팰리스",
        area: "카오산로드",
        notes: "카오산로드 바로 인근, 왕궁까지 도보 약 13분.",
        mapQuery: "Violet Tower at Khaosan Palace, Bangkok, Thailand",
      },
    ],
  },
  {
    id: "taipei",
    countryCode: "TW",
    nameKo: "타이베이",
    nameEn: "Taipei",
    spots: [
      { name: "타이베이 101", category: "attraction", mapQuery: "Taipei 101, Taipei, Taiwan" },
      { name: "스린 관저", category: "attraction", mapQuery: "Shilin Official Residence, Taipei, Taiwan" },
      { name: "용산사", category: "attraction", mapQuery: "Longshan Temple, Taipei, Taiwan" },
      { name: "딘타이펑 (본점)", category: "lunch", mapQuery: "Din Tai Fung Xinyi, Taipei, Taiwan" },
      { name: "융캉제 카페거리", category: "cafe", mapQuery: "Yongkang Street, Taipei, Taiwan", notes: "특정 매장보다 거리 내 카페 다수" },
      { name: "스린 야시장 (왕자치즈감자 등)", category: "dinner", mapQuery: "Shilin Night Market, Taipei, Taiwan" },
    ],
    recommendedLodging: [
      {
        name: "웨스트게이트 호텔 (西門町)",
        area: "시먼딩",
        notes: "MRT 시먼역 6번 출구 도보 1분. 야시장·번화가 접근 최고.",
        mapQuery: "Westgate Hotel Taipei, Ximending, Taiwan",
      },
      {
        name: "시먼딩 오렌지 호텔",
        area: "시먼딩",
        notes: "MRT 시먼역 1번 출구 도보 2분, 최근 리노베이션.",
        mapQuery: "Orange Hotel Ximending, Taipei, Taiwan",
      },
    ],
  },
  {
    id: "danang",
    countryCode: "VN",
    nameKo: "다낭",
    nameEn: "Da Nang",
    spots: [
      { name: "다낭 대성당", category: "attraction", mapQuery: "Da Nang Cathedral, Da Nang, Vietnam" },
      { name: "용다리 (드래곤 브릿지)", category: "attraction", mapQuery: "Dragon Bridge, Da Nang, Vietnam", notes: "주말 밤 불쇼 시간 확인" },
      { name: "오행산 (마블마운틴)", category: "attraction", mapQuery: "Marble Mountains, Da Nang, Vietnam" },
      { name: "바두엉 (반쎄오)", category: "lunch", mapQuery: "Ba Duong Banh Xeo, Da Nang, Vietnam" },
      { name: "콩카페 (다낭)", category: "cafe", mapQuery: "Cong Caphe, Da Nang, Vietnam", notes: "연유커피(카페 쓰어다) 추천" },
      { name: "냐벱 (반쎄오·넴루이, 미케비치 인근)", category: "dinner", mapQuery: "My Khe Beach area restaurant Nha Bep, Da Nang, Vietnam" },
    ],
    recommendedLodging: [
      {
        name: "골든 로터스 호텔",
        area: "미케비치",
        notes: "미케비치 도보 3분, 루프탑 수영장 보유.",
        mapQuery: "Golden Lotus Hotel Da Nang, Vietnam",
      },
      {
        name: "셀리나 호텔 앤 아파트먼트",
        area: "미케비치",
        notes: "미케비치 인근 가성비 숙소, 해변 산책에 최적.",
        mapQuery: "Celina Hotel and Apartment Da Nang, Vietnam",
      },
    ],
  },
  {
    id: "hoian",
    countryCode: "VN",
    nameKo: "호이안",
    nameEn: "Hoi An",
    spots: [
      { name: "호이안 올드타운 (구시가지)", category: "attraction", mapQuery: "Hoi An Ancient Town, Vietnam" },
      { name: "일본교 (내원교)", category: "attraction", mapQuery: "Japanese Covered Bridge, Hoi An, Vietnam" },
      { name: "등불거리 (야경)", category: "attraction", mapQuery: "Hoi An Lantern Street, Vietnam", notes: "해질녘 이후 방문 추천" },
      { name: "화이트 로즈 레스토랑 (카오라우/화이트로즈)", category: "lunch", mapQuery: "White Rose Restaurant, Hoi An, Vietnam" },
      { name: "호이안 로스터리 (에그커피)", category: "cafe", mapQuery: "Hoi An Roastery, Vietnam" },
      { name: "호이안 야시장 먹거리", category: "dinner", mapQuery: "Hoi An Night Market, Vietnam" },
    ],
    recommendedLodging: [
      {
        name: "아난타라 호이안 리조트",
        area: "올드타운",
        notes: "올드타운 도보 1분, 투본강변 리버사이드 리조트. 무료 조식·자전거 대여.",
        mapQuery: "Anantara Hoi An Resort, Vietnam",
      },
      {
        name: "리틀 리버사이드 호이안",
        area: "올드타운 인근",
        notes: "올드타운에서 약 1.7km, 강변 부티크 호텔.",
        mapQuery: "Little Riverside Hoi An, Vietnam",
      },
    ],
  },
  {
    id: "singapore",
    countryCode: "SG",
    nameKo: "싱가포르",
    nameEn: "Singapore",
    spots: [
      { name: "마리나베이 샌즈 스카이파크", category: "attraction", mapQuery: "Marina Bay Sands SkyPark, Singapore" },
      { name: "가든스 바이 더 베이", category: "attraction", mapQuery: "Gardens by the Bay, Singapore" },
      { name: "머라이언 파크", category: "attraction", mapQuery: "Merlion Park, Singapore" },
      { name: "차이나타운 콤플렉스 호커센터 (딤섬/얌차)", category: "lunch", mapQuery: "Chinatown Complex Food Centre, Singapore" },
      { name: "야쿤 카야토스트 (차이나타운 본점)", category: "cafe", mapQuery: "Ya Kun Kaya Toast Chinatown, Singapore" },
      { name: "클락키 리버사이드 레스토랑 거리", category: "dinner", mapQuery: "Clarke Quay, Singapore" },
    ],
    recommendedLodging: [
      {
        name: "파라독스 싱가포르",
        area: "클락키",
        notes: "클락키역 바로 앞, 차이나타운 도보 10분. 웬만한 명소는 도보로 이동 가능.",
        mapQuery: "Paradox Singapore, Clarke Quay, Singapore",
      },
      {
        name: "홀리데이 인 익스프레스 싱가포르 클락키",
        area: "클락키",
        notes: "차이나타운 도보 10분, 마리나베이 도보 20분. 옥상 수영장 보유.",
        mapQuery: "Holiday Inn Express Singapore Clarke Quay, Singapore",
      },
    ],
  },
];

export const recommendedCitiesByCountry: Record<string, string[]> = {
  JP: ["tokyo", "osaka"],
  TH: ["bangkok"],
  TW: ["taipei"],
  VN: ["danang", "hoian"],
  SG: ["singapore"],
};

export function getCity(id: string): CityInfo | undefined {
  return cities.find((c) => c.id === id);
}

export function getCitiesForCountry(countryCode: string): CityInfo[] {
  const ids = recommendedCitiesByCountry[countryCode] ?? [];
  return ids.map(getCity).filter((c): c is CityInfo => Boolean(c));
}
