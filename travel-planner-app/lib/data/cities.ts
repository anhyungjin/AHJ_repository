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
    id: "kyoto",
    countryCode: "JP",
    nameKo: "교토",
    nameEn: "Kyoto",
    spots: [
      { name: "후시미이나리 타이샤 (센본토리이)", category: "attraction", mapQuery: "Fushimi Inari Taisha, Kyoto, Japan" },
      { name: "킨카쿠지 (금각사)", category: "attraction", mapQuery: "Kinkaku-ji Golden Pavilion, Kyoto, Japan" },
      { name: "아라시야마 대나무숲", category: "attraction", mapQuery: "Arashiyama Bamboo Grove, Kyoto, Japan", notes: "도게츠쿄·텐류지와 함께 둘러보기 좋음" },
      { name: "니시키 시장 (교토의 부엌)", category: "lunch", mapQuery: "Nishiki Market, Kyoto, Japan" },
      { name: "% Arabica 교토 아라시야마점", category: "cafe", mapQuery: "% Arabica Kyoto Arashiyama, Japan", notes: "가쓰라강변 뷰, 세계적으로 유명한 카페 체인의 교토점" },
      { name: "폰토초 골목 (전통 요정·이자카야)", category: "dinner", mapQuery: "Pontocho Alley, Kyoto, Japan" },
    ],
    recommendedLodging: [
      {
        name: "호텔 그랑비아 교토",
        area: "교토역",
        notes: "JR 교토역 직결, 신칸센/공항버스 접근 최고. 후시미이나리·아라시야마 이동도 편리.",
        mapQuery: "Hotel Granvia Kyoto, Japan",
      },
      {
        name: "호텔 게이한 교토 에키미나미",
        area: "교토역 남쪽",
        notes: "교토역 도보 5분, 가성비 좋은 비즈니스 호텔.",
        mapQuery: "Hotel Keihan Kyoto Ekiminami, Japan",
      },
    ],
  },
  {
    id: "fukuoka",
    countryCode: "JP",
    nameKo: "후쿠오카",
    nameEn: "Fukuoka",
    spots: [
      { name: "오호리 공원", category: "attraction", mapQuery: "Ohori Park, Fukuoka, Japan" },
      { name: "다자이후 텐만구", category: "attraction", mapQuery: "Dazaifu Tenmangu Shrine, Fukuoka, Japan", notes: "하카타역에서 전철로 약 25분" },
      { name: "캐널시티 하카타", category: "attraction", mapQuery: "Canal City Hakata, Fukuoka, Japan" },
      { name: "잇푸도 라멘 다이묘 본점", category: "lunch", mapQuery: "Ippudo Ramen Daimyo Main Branch, Fukuoka, Japan", notes: "돈코츠라멘 원조 격 하카타라멘 본점" },
      { name: "카페 브라질레이로 (텐진)", category: "cafe", mapQuery: "Cafe Brasileiro Tenjin, Fukuoka, Japan", notes: "70년 전통의 텐진 대표 다방" },
      { name: "나카스 야타이 포장마차 거리", category: "dinner", mapQuery: "Nakasu Yatai Food Stalls, Fukuoka, Japan" },
    ],
    recommendedLodging: [
      {
        name: "미야코 호텔 하카타",
        area: "하카타역",
        notes: "JR 하카타역 도보 2분, 공항·신칸센 접근 편리.",
        mapQuery: "Miyako Hotel Hakata, Japan",
      },
      {
        name: "호텔 오리엔탈 익스프레스 후쿠오카 텐진",
        area: "텐진",
        notes: "텐진·오호리공원·나카스 야타이 접근이 좋음.",
        mapQuery: "Hotel Oriental Express Fukuoka Tenjin, Japan",
      },
    ],
  },
  {
    id: "sapporo",
    countryCode: "JP",
    nameKo: "삿포로",
    nameEn: "Sapporo",
    spots: [
      { name: "오도리 공원", category: "attraction", mapQuery: "Odori Park, Sapporo, Japan" },
      { name: "시로이 코이비토 파크", category: "attraction", mapQuery: "Shiroi Koibito Park, Sapporo, Japan", notes: "사전 예약 시 초콜릿 만들기 체험 가능" },
      { name: "삿포로 시계탑", category: "attraction", mapQuery: "Sapporo Clock Tower, Japan" },
      { name: "스스키노 라멘요코초", category: "lunch", mapQuery: "Sapporo Ramen Yokocho, Susukino, Japan", notes: "미소라멘 명가 다수" },
      { name: "모리히코 커피 (마루야마)", category: "cafe", mapQuery: "Morihico Coffee Maruyama, Sapporo, Japan", notes: "1996년부터 이어온 삿포로 대표 로스터리 카페" },
      { name: "스스키노 이자카야·가니(대게) 요리", category: "dinner", mapQuery: "Susukino district, Sapporo, Japan" },
    ],
    recommendedLodging: [
      {
        name: "JR 타워 호텔 닛코 삿포로",
        area: "삿포로역",
        notes: "삿포로역 직결, 고층 시내 전망.",
        mapQuery: "JR Tower Hotel Nikko Sapporo, Japan",
      },
      {
        name: "호텔 그레이서리 삿포로",
        area: "삿포로역",
        notes: "삿포로역 바로 인근, 오도리공원·스스키노 이동 편리.",
        mapQuery: "Hotel Gracery Sapporo, Japan",
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
      {
        name: "코트야드 바이 메리어트 타이베이 (난강)",
        area: "난강",
        notes: "여행자 투석 서비스를 제공하는 SunnyEase Clinic(向怡診所)과 도보권, 난강역(MRT·철도·고속철 환승역) 바로 앞이라 투석 일정이 있는 경우 이동 부담이 적음.",
        mapQuery: "Courtyard by Marriott Taipei, Nangang, Taiwan",
      },
    ],
  },
  {
    id: "kaohsiung",
    countryCode: "TW",
    nameKo: "가오슝",
    nameEn: "Kaohsiung",
    spots: [
      { name: "롄츠탄 (연지담)", category: "attraction", mapQuery: "Lotus Pond, Zuoying, Kaohsiung, Taiwan", notes: "가오슝영관병원(투석 가능)과 같은 줘잉구 소재, 용호탑 등 사원 다수" },
      { name: "피어2 예술특구", category: "attraction", mapQuery: "Pier-2 Art Center, Kaohsiung, Taiwan" },
      { name: "치진도 (페리 섬)", category: "attraction", mapQuery: "Cijin Island, Kaohsiung, Taiwan", notes: "구시 페리부두에서 소형 페리로 이동, 해변·등대" },
      { name: "줘잉 궈마오 시장 (로컬 아침/점심 맛집골목)", category: "lunch", mapQuery: "Kuo Mao Market, Zuoying, Kaohsiung, Taiwan", notes: "가오슝영관병원 인근" },
      { name: "리하우 카페 (피어2 인근)", category: "cafe", mapQuery: "Li How Cafe, Pier-2 Art Center, Kaohsiung, Taiwan" },
      { name: "류허 야시장", category: "dinner", mapQuery: "Liuhe Night Market, Kaohsiung, Taiwan", notes: "신선한 해산물·전통 소식거리로 유명한 대표 야시장" },
    ],
    recommendedLodging: [
      {
        name: "워터 우즈 인 (Water Woods Inn)",
        area: "줘잉",
        notes: "가오슝영관병원(Kaohsiung Veterans General Hospital) 및 줘잉 고속철역 도보권. 투석 일정이 있는 경우 이동이 가장 짧음.",
        mapQuery: "Water Woods Inn, Zuoying, Kaohsiung, Taiwan",
      },
      {
        name: "트래블러 스테이션 R15",
        area: "줘잉",
        notes: "롄츠탄 차량 5분, 가오슝영관병원과 가까운 줘잉구 소재 숙소.",
        mapQuery: "Traveler Station R15, Zuoying, Kaohsiung, Taiwan",
      },
    ],
  },
  {
    id: "taichung",
    countryCode: "TW",
    nameKo: "타이중",
    nameEn: "Taichung",
    spots: [
      { name: "레인보우 빌리지 (무지개마을)", category: "attraction", mapQuery: "Rainbow Village, Taichung, Taiwan" },
      { name: "가오메이 습지", category: "attraction", mapQuery: "Gaomei Wetlands, Taichung, Taiwan", notes: "일몰 명소, 밀물 시간 미리 확인 필요" },
      { name: "국립 타이중 극장", category: "attraction", mapQuery: "National Taichung Theater, Taichung, Taiwan" },
      { name: "춘수당 (버블티 원조 본점)", category: "lunch", mapQuery: "Chun Shui Tang Original Store, Taichung, Taiwan", notes: "버블 밀크티 발상지로 알려진 찻집 겸 레스토랑" },
      { name: "미야하라 (宮原眼科)", category: "cafe", mapQuery: "Miyahara, Taichung, Taiwan", notes: "일제강점기 안과 건물을 개조한 아이스크림·디저트숍" },
      { name: "펑자 야시장", category: "dinner", mapQuery: "Feng Chia Night Market, Taichung, Taiwan" },
    ],
    recommendedLodging: [
      {
        name: "하워드 프린스 호텔 타이중",
        area: "시툰구",
        notes: "타이중영관병원(Taichung Veterans General Hospital) 인근 시툰구 소재로 투석 일정 이동 부담이 적음.",
        mapQuery: "Howard Prince Hotel Taichung, Xitun, Taiwan",
      },
      {
        name: "아이클라우드 럭셔리 리조트 앤 호텔",
        area: "시툰구",
        notes: "타이중영관병원과 같은 시툰구, 펑자 야시장 이동도 가능한 거리.",
        mapQuery: "iCloud Luxury Resort and Hotel, Xitun, Taichung, Taiwan",
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
      { name: "이스트코스트 파크", category: "attraction", mapQuery: "East Coast Park, Singapore", notes: "베독/카통 인근 해변공원, 자전거 대여 가능" },
      { name: "328 카통 락사", category: "lunch", mapQuery: "328 Katong Laksa, Singapore", notes: "페라나칸 지역 대표 로컬 맛집" },
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
      {
        name: "홀리데이 인 익스프레스 싱가포르 카통",
        area: "베독/카통",
        notes: "관광객 대상 투석 안내를 운영하는 Firstline Dialysis Centre(베독) 도보권. 이스트코스트·카통 로컬 맛집 밀집 지역이라 투석 일정이 있는 가족 여행에 적합.",
        mapQuery: "Holiday Inn Express Singapore Katong, Singapore",
      },
    ],
  },
];

export const recommendedCitiesByCountry: Record<string, string[]> = {
  JP: ["tokyo", "osaka", "kyoto", "fukuoka", "sapporo"],
  TH: ["bangkok"],
  TW: ["taipei", "kaohsiung", "taichung"],
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
