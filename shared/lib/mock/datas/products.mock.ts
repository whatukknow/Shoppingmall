import type {
  ProductDetailResponse,
  ProductListItem,
} from '@/domains/products/products.types';

const IMAGES = '/uploads/images/home/products';

type Seed = {
  id: string;
  name: string;
  image: string;
  image2?: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  discountRate: number;
  farmName: string;
  farmInfo: string;
  basicInfo: ProductDetailResponse['basicInfo'];
  tips: ProductDetailResponse['tips'];
};

const seeds: Seed[] = [
  {
    id: 'pc-001',
    name: '달콤한 참외',
    image: `${IMAGES}/korean-melon.png`,
    description: '아침에 딴 참외를 그날 바로 보냅니다.',
    category: '과일',
    price: 12900,
    unit: '1.1kg',
    discountRate: 10,
    farmName: '성천참외농장',
    farmInfo:
      '경북 성주의 강변 모래밭에서 참외를 재배하는 가족농장입니다. 하우스에서 알맞게 익은 참외만 수확해 보냅니다.',
    basicInfo: {
      contentGuide:
        '참외 5~6과(약 1.1kg)를 신문지에 개별 포장해 상자에 담아 보냅니다.',
      ingredients: '참외 100%가 사용됩니다.',
      allergyInfo:
        '과일 특유의 성분에 민감한 분은 섭취 전 소량으로 확인해 주세요.',
      storageMethod:
        '도착 후 냉장(0~5℃)에 보관하고, 3일 내로 드시는 것을 권합니다.',
      shippingInfo: '품종별 예약 배송으로 수확 다음 날 출고됩니다.',
      notice: '수확 시기에 따라 당도와 크기는 조금씩 달라질 수 있습니다.',
    },
    tips: [
      {
        id: 'pc-001-tip-1',
        title: '더 달게 드시려면',
        content:
          '먹기 1~2시간 전 실온에 두면 향이 살아납니다. 잘 씻어 껍질째 드시면 향이 더 진합니다.',
      },
      {
        id: 'pc-001-tip-2',
        title: '손질 요령',
        content:
          '반으로 가른 뒤 숟가락으로 씨를 긁어내고 먹기 좋게 잘라 드세요.',
      },
    ],
  },
  {
    id: 'pc-002',
    name: '방울토마토',
    image: `${IMAGES}/tomatoes.png`,
    description: '탱글한 식감의 방울토마토를 500g씩 담았습니다.',
    category: '채소',
    price: 6900,
    unit: '500g',
    discountRate: 0,
    farmName: '햇살밭농원',
    farmInfo:
      '충남 부여의 유리온실에서 수경재배로 방울토마토를 키우는 농원입니다. 관수량을 조절해 당도를 관리합니다.',
    basicInfo: {
      contentGuide: '방울토마토 500g을 투명 용기에 담아 보냅니다.',
      ingredients: '방울토마토 100%가 사용됩니다.',
      allergyInfo: '토마토에 민감한 분은 섭취 전 소량으로 확인해 주세요.',
      storageMethod:
        '꼭지를 제거하지 않은 채 냉장 보관하고 가급적 빨리 드세요.',
      shippingInfo: '월·화·수 예약 접수 후 익일 출고됩니다.',
      notice: '수확 시기에 따라 당도와 크기는 조금씩 달라질 수 있습니다.',
    },
    tips: [
      {
        id: 'pc-002-tip-1',
        title: '보관 팁',
        content: '받침이 있는 밀폐 용기에 옮겨 담으면 눌림 없이 보관됩니다.',
      },
      {
        id: 'pc-002-tip-2',
        title: '활용 방법',
        content:
          '반으로 갈라 올리브유와 소금을 넣고 볶으면 간단한 파스타 소스가 됩니다.',
      },
    ],
  },
  {
    id: 'pc-003',
    name: '노란 멜론',
    image: `${IMAGES}/honeydew-melon.png`,
    description: '부드러운 과육의 노란 멜론 한 통입니다.',
    category: '과일',
    price: 15900,
    unit: '1개(약 1.2kg)',
    discountRate: 5,
    farmName: '김제멜론농원',
    farmInfo:
      '전북 김제 평야의 점토질 밭에서 멜론을 재배합니다. 한 줄기에 열매를 하나만 남겨 크고 고르게 키웁니다.',
    basicInfo: {
      contentGuide: '노란 멜론 1과(약 1.2kg)를 완충재에 포장해 보냅니다.',
      ingredients: '멜론 100%가 사용됩니다.',
      allergyInfo: '멜론 과육·씨에 민감한 분은 섭취 전 소량으로 확인해 주세요.',
      storageMethod: '실온에서 숙성 후 먹기 전 냉장 보관하세요.',
      shippingInfo: '화·금 예약 배송으로 수확일 출고됩니다.',
      notice: '수확 시기에 따라 당도와 크기는 조금씩 달라질 수 있습니다.',
    },
    tips: [
      {
        id: 'pc-003-tip-1',
        title: '숙성 확인법',
        content: '꼭지 반대편을 가볍게 눌렀을 때 살짝 들어가면 먹기 좋습니다.',
      },
      {
        id: 'pc-003-tip-2',
        title: '활용 방법',
        content: '한입 크기로 썰어 요거트와 함께 담으면 간식이 됩니다.',
      },
    ],
  },
  {
    id: 'pc-004',
    name: '늙은 호박',
    image: `${IMAGES}/pumpkin.png`,
    description: '단맛이 진한 늙은 호박을 1.5kg 규격으로 보냅니다.',
    category: '채소',
    price: 8200,
    unit: '1개(약 1.5kg)',
    discountRate: 0,
    farmName: '들녘농원',
    farmInfo:
      '강원 횡성 고지대 밭에서 늙은 호박을 재배합니다. 서리 내리기 전까지 밭에서 충분히 익혀 수확합니다.',
    basicInfo: {
      contentGuide: '늙은 호박 1과(약 1.5kg)를 신문지에 싸서 보냅니다.',
      ingredients: '호박 100%가 사용됩니다.',
      allergyInfo: '호박에 민감한 분은 섭취 전 소량으로 확인해 주세요.',
      storageMethod:
        '신문지에 싸서 통풍이 잘 되는 서늘한 곳에 세워 보관하면 오래 갑니다.',
      shippingInfo: '주문 다음날 오후에 출고됩니다.',
      notice: '모양과 색이 균일하지 않을 수 있습니다.',
    },
    tips: [
      {
        id: 'pc-004-tip-1',
        title: '조리 팁',
        content:
          '전자레인지에 2~3분 데운 뒤 자르면 손이 덜 가고 껍질도 쉽게 벗겨집니다.',
      },
      {
        id: 'pc-004-tip-2',
        title: '활용 방법',
        content: '찬밥과 함께 갈아 죽을 끓이면 아침 식사 대용이 됩니다.',
      },
    ],
  },
  {
    id: 'pc-005',
    name: '제주 귤',
    image: `${IMAGES}/orange.png`,
    description: '새콤달콤한 귤을 2kg 규격으로 담았습니다.',
    category: '과일',
    price: 12900,
    unit: '2kg',
    discountRate: 15,
    farmName: '한라밭농장',
    farmInfo:
      '제주 한라산 중산간 마을의 밭에서 귤을 재배합니다. 풀을 손으로 베어 가며 밭을 관리합니다.',
    basicInfo: {
      contentGuide: '귤 약 16~20과(2kg)를 통풍 상자에 담아 보냅니다.',
      ingredients: '귤 100%가 사용됩니다.',
      allergyInfo: '감귤에 민감한 분은 섭취 전 소량으로 확인해 주세요.',
      storageMethod: '서늘한 실온에서 4~5일, 그 뒤는 냉장 보관하세요.',
      shippingInfo: '월·목 예약 접수 후 다음날 출고됩니다.',
      notice: '껍질에 얼룩이 있을 수 있으나 과육 품질에는 영향이 없습니다.',
    },
    tips: [
      {
        id: 'pc-005-tip-1',
        title: '고르는 법',
        content:
          '껍질이 얇고 탄력이 있으며 무게가 묵직한 것이 과즙이 많습니다.',
      },
      {
        id: 'pc-005-tip-2',
        title: '활용 방법',
        content:
          '껍질을 잘 씻어 말린 뒤 뜨거운 물에 우리면 향긋한 귤피차가 됩니다.',
      },
    ],
  },
  {
    id: 'pc-006',
    name: '거봉 포도',
    image: `${IMAGES}/grapes.png`,
    description: '알이 굵은 거봉 포도 1.2kg을 한 송이씩 포장합니다.',
    category: '과일',
    price: 18900,
    unit: '1.2kg',
    discountRate: 0,
    farmName: '청송포도농원',
    farmInfo:
      '경북 청송 산기슭 비가림 하우스에서 거봉을 재배합니다. 알이 터지지 않도록 비닐로 비를 막아 키웁니다.',
    basicInfo: {
      contentGuide: '거봉 포도 1.2kg을 2팩으로 나눠 보냅니다.',
      ingredients: '거봉 포도 100%가 사용됩니다.',
      allergyInfo:
        '포도 과육·껍질에 민감한 분은 섭취 전 소량으로 확인해 주세요.',
      storageMethod: '씻지 않은 채 냉장 보관하고 드실 때만 씻으세요.',
      shippingInfo: '수·일 예약 배송으로 수확일 출고됩니다.',
      notice: '송이 모양과 색은 기후에 따라 조금씩 달라질 수 있습니다.',
    },
    tips: [
      {
        id: 'pc-006-tip-1',
        title: '세척 팁',
        content: '흐르는 물에 가볍게 씻고 줄기 쪽부터 알을 하나씩 떼어 드세요.',
      },
      {
        id: 'pc-006-tip-2',
        title: '활용 방법',
        content: '씻어 냉동해 두면 아이스크림 대용 간식이 됩니다.',
      },
    ],
  },
  {
    id: 'pc-007',
    name: '딸기 팩',
    image: `${IMAGES}/strawberry.png`,
    description: '묵직한 딸기를 400g씩 두 팩으로 보냅니다.',
    category: '과일',
    price: 16800,
    unit: '400g×2',
    discountRate: 10,
    farmName: '화성딸기농장',
    farmInfo:
      '경기 화성 하우스에서 허리 높이 재배대로 딸기를 키웁니다. 아침에 수확해 바로 포장합니다.',
    basicInfo: {
      contentGuide: '딸기 400g을 2팩으로 나눠 완충재와 함께 보냅니다.',
      ingredients: '딸기 100%가 사용됩니다.',
      allergyInfo: '딸기에 민감한 분은 섭취 전 소량으로 확인해 주세요.',
      storageMethod:
        '씻지 않은 채 냉장 보관하고 받은 날부터 2~3일 안에 드세요.',
      shippingInfo: '월·수·금 예약 배송으로 수확일 출고됩니다.',
      notice: '운송 중 흠집이 생길 수 있으니 개봉 후 가급적 빨리 드세요.',
    },
    tips: [
      {
        id: 'pc-007-tip-1',
        title: '씻는 요령',
        content: '꼭지를 떼지 않은 채 흐르는 물에 짧게 씻고 물기를 빼세요.',
      },
      {
        id: 'pc-007-tip-2',
        title: '활용 방법',
        content: '설탕에 버무려 약한 불에 졸이면 간단한 잼이 됩니다.',
      },
    ],
  },
  {
    id: 'pc-008',
    name: '양파 3개',
    image: `${IMAGES}/onion.png`,
    description: '단단하고 알이 고른 양파를 3개씩 포장합니다.',
    category: '채소',
    price: 3900,
    unit: '3개(약 900g)',
    discountRate: 0,
    farmName: '무안양파농원',
    farmInfo:
      '전남 무안의 황토밭에서 양파를 재배합니다. 수확 후 그늘에서 충분히 말려 보냅니다.',
    basicInfo: {
      contentGuide: '양파 3과(약 900g)를 망 포장해 보냅니다.',
      ingredients: '양파 100%가 사용됩니다.',
      allergyInfo: '양파에 민감한 분은 섭취 전 소량으로 확인해 주세요.',
      storageMethod:
        '통풍이 잘 되는 실온에 보관합니다. 자른 것은 밀폐해 냉장하세요.',
      shippingInfo: '주문 다음날 오후에 출고됩니다.',
      notice: '겉껍질이 벗겨진 정도는 조금씩 다를 수 있습니다.',
    },
    tips: [
      {
        id: 'pc-008-tip-1',
        title: '썰 때 눈 안 따갑게',
        content:
          '썰기 전 냉장고에 30분 두거나 칼에 물을 묻혀 썰면 눈이 덜 맵습니다.',
      },
      {
        id: 'pc-008-tip-2',
        title: '활용 방법',
        content:
          '갈색이 날 때까지 볶아 두면 카레·수프의 단맛을 내는 재료가 됩니다.',
      },
    ],
  },
  {
    id: 'pc-009',
    name: '양배추',
    image: `${IMAGES}/cabbage.png`,
    description: '속까지 단단한 양배추 한 통입니다.',
    category: '채소',
    price: 4500,
    unit: '1포기(약 1.2kg)',
    discountRate: 0,
    farmName: '양주채소농원',
    farmInfo: '경기 양주 밭에서 퇴비로 땅을 일궈 양배추를 재배합니다.',
    basicInfo: {
      contentGuide: '양배추 1포기(약 1.2kg)를 신문지에 싸서 보냅니다.',
      ingredients: '양배추 100%가 사용됩니다.',
      allergyInfo:
        '십자화과 채소에 민감한 분은 섭취 전 소량으로 확인해 주세요.',
      storageMethod: '겉잎을 살짝 제거하고 랩을 씌워 야채칸에 보관합니다.',
      shippingInfo: '화·금 예약 배송으로 수확일 출고됩니다.',
      notice: '겉잎에 재배 과정의 흠집이 남을 수 있습니다.',
    },
    tips: [
      {
        id: 'pc-009-tip-1',
        title: '보관 팁',
        content: '겉잎부터 차례로 떼어 쓰면 오래 신선합니다.',
      },
      {
        id: 'pc-009-tip-2',
        title: '활용 방법',
        content:
          '얇게 채 썰어 두고 샐러드·볶음에 나눠 쓰면 손질 시간이 줄어듭니다.',
      },
    ],
  },
  {
    id: 'pc-010',
    name: '대파 다발',
    image: `${IMAGES}/scallion.png`,
    description: '뿌리까지 싱싱한 대파를 다발로 보냅니다.',
    category: '채소',
    price: 4200,
    unit: '1다발(약 800g)',
    discountRate: 0,
    farmName: '밀양대파농원',
    farmInfo:
      '경남 밀양의 파 전문 밭에서 흙을 북돋아 주며 대파를 키웁니다. 흰 대가 길게 자랍니다.',
    basicInfo: {
      contentGuide: '대파 1다발(약 800g, 5~8대)을 신문지에 싸 보냅니다.',
      ingredients: '대파 100%가 사용됩니다.',
      allergyInfo: '파에 민감한 분은 섭취 전 소량으로 확인해 주세요.',
      storageMethod:
        '씻지 않은 채 신문지에 싸 서늘한 곳에 보관하거나, 잘게 썰어 냉동하세요.',
      shippingInfo: '주문 다음날 오전에 출고됩니다.',
      notice: '대 길이와 굵기는 수확 시기에 따라 달라질 수 있습니다.',
    },
    tips: [
      {
        id: 'pc-010-tip-1',
        title: '손질 팁',
        content:
          '뿌리 쪽 흙은 털어내고, 잎 사이 모래는 흐르는 물에 씻어내세요.',
      },
      {
        id: 'pc-010-tip-2',
        title: '활용 방법',
        content:
          '흰 대와 푸른 잎을 나눠 쓰세요. 흰 대는 국·찌개에, 잎은 무침·볶음에 씁니다.',
      },
    ],
  },
  {
    id: 'pc-011',
    name: '완두콩',
    image: `${IMAGES}/peas.png`,
    description: '알이 통통한 신선한 완두콩을 600g으로 담았습니다.',
    category: '채소',
    price: 7800,
    unit: '600g',
    discountRate: 5,
    farmName: '한밭농원',
    farmInfo:
      '전북 익산 밭에서 완두콩을 재배합니다. 꼬투리가 통통해졌을 때 손으로 따서 수확합니다.',
    basicInfo: {
      contentGuide: '껍질을 까낸 완두콩 알만 600g을 담아 보냅니다.',
      ingredients: '완두콩 100%가 사용됩니다.',
      allergyInfo: '콩류에 민감한 분은 섭취 전 소량으로 확인해 주세요.',
      storageMethod: '밀폐 봉지에 담아 냉장 보관하고 3일 내로 드세요.',
      shippingInfo: '화·목 예약 접수 후 다음날 출고됩니다.',
      notice: '수확 시기에 따라 알 크기와 단맛은 조금씩 달라질 수 있습니다.',
    },
    tips: [
      {
        id: 'pc-011-tip-1',
        title: '익히는 팁',
        content: '끓는 물에 소금을 약간 넣고 2~3분 데치면 초록빛이 살아납니다.',
      },
      {
        id: 'pc-011-tip-2',
        title: '활용 방법',
        content: '데친 콩에 참기름과 소금을 곁들여 간단한 반찬으로 드세요.',
      },
    ],
  },
  {
    id: 'pc-012',
    name: '방울양배추',
    image: `${IMAGES}/brussels-sprouts.png`,
    description: '한 알씩 탱글한 방울양배추를 400g으로 보냅니다.',
    category: '채소',
    price: 8500,
    unit: '400g',
    discountRate: 0,
    farmName: '산촌농원',
    farmInfo:
      '강원 정선 고랭지 밭에서 방울양배추를 재배합니다. 낮과 밤의 온도차가 알 단맛을 살립니다.',
    basicInfo: {
      contentGuide: '방울양배추 약 20알(400g)을 종이상자에 담아 보냅니다.',
      ingredients: '방울양배추 100%가 사용됩니다.',
      allergyInfo: '십자화과에 민감한 분은 섭취 전 소량으로 확인해 주세요.',
      storageMethod: '밀폐 용기에 담아 야채칸에 보관하고 4~5일 내 드세요.',
      shippingInfo: '월·목 예약 배송으로 수확일 출고됩니다.',
      notice: '알 크기는 고르지 않을 수 있습니다.',
    },
    tips: [
      {
        id: 'pc-012-tip-1',
        title: '손질 팁',
        content: '밑동을 조금 잘라내고 시든 겉잎을 떼어낸 뒤 씻어 쓰세요.',
      },
      {
        id: 'pc-012-tip-2',
        title: '활용 방법',
        content:
          '절반으로 가르고 올리브유·소금을 뿌려 180℃ 오븐에 15분 구우면 곁들임 요리가 됩니다.',
      },
    ],
  },
  {
    id: 'pc-013',
    name: '사과 2입',
    image: `${IMAGES}/apple.png`,
    description: '아삭한 사과 두 알을 포장해 보냅니다.',
    category: '과일',
    price: 8900,
    unit: '2개(약 900g)',
    discountRate: 0,
    farmName: '괴산사과농장',
    farmInfo:
      '충북 괴산 밭에서 사과를 재배합니다. 열매에 햇빛이 골고루 닿도록 봉지 씌우기 작업을 합니다.',
    basicInfo: {
      contentGuide: '사과 2개(약 900g)를 완충망에 개별 포장해 보냅니다.',
      ingredients: '사과 100%가 사용됩니다.',
      allergyInfo: '사과 과육에 민감한 분은 섭취 전 소량으로 확인해 주세요.',
      storageMethod: '실온 3~4일, 그 이후는 냉장 보관하세요.',
      shippingInfo: '수·일 예약 배송으로 수확 다음날 출고됩니다.',
      notice: '색과 직경은 개체차가 있습니다.',
    },
    tips: [
      {
        id: 'pc-013-tip-1',
        title: '갈변 막기',
        content: '자른 면에 레몬즙을 살짝 뿌리면 갈변이 늦어집니다.',
      },
      {
        id: 'pc-013-tip-2',
        title: '활용 방법',
        content: '얇게 썰어 시나몬을 뿌려 구우면 부드러운 후식이 됩니다.',
      },
    ],
  },
  {
    id: 'pc-014',
    name: '감귤 팩',
    image: `${IMAGES}/mandarin.png`,
    description: '새콤달콤한 귤 800g 팩입니다.',
    category: '과일',
    price: 9900,
    unit: '800g',
    discountRate: 20,
    farmName: '서귀포감귤농원',
    farmInfo:
      '제주 서귀포 중산간 밭에서 하우스 감귤을 재배합니다. 하우스 온도를 맞춰 껍질이 얇고 단 귤을 키웁니다.',
    basicInfo: {
      contentGuide: '감귤 약 10~14과(800g)를 종이상자에 담아 보냅니다.',
      ingredients: '감귤 100%가 사용됩니다.',
      allergyInfo: '감귤에 민감한 분은 섭취 전 소량으로 확인해 주세요.',
      storageMethod: '서늘한 실온에 두고 일주일 내로 드세요.',
      shippingInfo: '수요일 예약 접수 후 목요일 출고됩니다.',
      notice: '껍질 오점은 과육 품질에 영향이 없습니다.',
    },
    tips: [
      {
        id: 'pc-014-tip-1',
        title: '깔끔하게 벗기기',
        content: '꼭지 반대편부터 껍질을 벗기면 속껍질이 덜 남습니다.',
      },
      {
        id: 'pc-014-tip-2',
        title: '활용 방법',
        content: '껍질을 말려 뜨거운 물에 우려내면 간단한 차가 됩니다.',
      },
    ],
  },
  {
    id: 'pc-015',
    name: '통수박',
    image: `${IMAGES}/watermelon.png`,
    description: '잘 익은 통수박을 통째로 보냅니다.',
    category: '과일',
    price: 22900,
    unit: '1통(약 5kg)',
    discountRate: 0,
    farmName: '고성수박농장',
    farmInfo:
      '강원 고성 해안가 밭에서 수박을 재배합니다. 순을 하나만 남겨 열매에 양분을 집중시킵니다.',
    basicInfo: {
      contentGuide: '수박 1통(약 5kg)을 눌림 방지 완충재로 포장해 보냅니다.',
      ingredients: '수박 100%가 사용됩니다.',
      allergyInfo: '수박에 민감한 분은 섭취 전 소량으로 확인해 주세요.',
      storageMethod: '자르기 전 실온 보관, 자른 뒤 밀폐해 냉장하세요.',
      shippingInfo: '화·금 예약 배송으로 수확일 출고됩니다.',
      notice: '껍질 무늬와 무게는 개체차가 있습니다.',
    },
    tips: [
      {
        id: 'pc-015-tip-1',
        title: '당도 확인법',
        content: '두드릴 때 통통 소리가 나고 꼭지가 마르면 먹기 좋습니다.',
      },
      {
        id: 'pc-015-tip-2',
        title: '활용 방법',
        content: '남은 과육은 씨를 제거해 갈아 시원한 주스로 드세요.',
      },
    ],
  },
];

// 등록 역순(최신 등록순)으로 정렬해 노출합니다.
// AI 추천(users/me/product-recommendations)에만 나오는 상품입니다. 상세만 제공하고 전체 목록에는 넣지 않습니다.
const recommendationOnlySeeds: Seed[] = [
  {
    id: 'pc-101',
    name: '스테이크용 소고기',
    image: `${IMAGES}/illustration-beef-steak.png`,
    description: '두툼하게 썬 스테이크용 소고기입니다.',
    category: '정육',
    price: 18900,
    unit: '300g',
    discountRate: 10,
    farmName: '횡성한우목장',
    farmInfo:
      '강원 횡성에서 한우를 기르는 목장입니다. 주문을 받은 뒤 정육점에서 두께를 맞춰 손질합니다.',
    basicInfo: {
      contentGuide: '소고기 등심 300g(2장)을 진공 포장해 보냅니다.',
      ingredients: '소고기(국내산) 100%',
      allergyInfo: '소고기에 민감한 분은 섭취 전 확인해 주세요.',
      storageMethod: '냉장(0~4℃) 보관하고 받은 날부터 3일 안에 드세요.',
      shippingInfo: '아이스팩과 함께 냉장 배송으로 출고됩니다.',
      notice: '부위별로 마블링과 모양은 조금씩 다를 수 있습니다.',
    },
    tips: [
      {
        id: 'pc-101-tip-1',
        title: '굽기 전 준비',
        content: '굽기 30분 전에 꺼내 실온에 두고 소금은 굽기 직전에 뿌리세요.',
      },
      {
        id: 'pc-101-tip-2',
        title: '굽는 방법',
        content: '센 불에서 앞뒤로 1~2분씩 굽고 5분 쉬게 한 뒤 썰어 드세요.',
      },
    ],
  },
  {
    id: 'pc-102',
    name: '유정란 10구',
    image: `${IMAGES}/illustration-fried-egg.png`,
    description: '넓은 마당에서 키운 닭이 낳은 유정란입니다.',
    category: '달걀',
    price: 6900,
    unit: '10구',
    discountRate: 0,
    farmName: '햇살마당농장',
    farmInfo:
      '충남 홍성에서 닭을 풀어 키우는 농장입니다. 매일 아침 모은 달걀을 세척해 보냅니다.',
    basicInfo: {
      contentGuide: '유정란 10구를 난좌에 담아 보냅니다.',
      ingredients: '달걀(국내산) 100%',
      allergyInfo: '달걀에 민감한 분은 섭취 전 확인해 주세요.',
      storageMethod: '뾰족한 쪽이 아래로 가게 냉장 보관하세요.',
      shippingInfo: '주문 다음날 출고됩니다.',
      notice: '달걀 크기와 껍질 색은 조금씩 다를 수 있습니다.',
    },
    tips: [
      {
        id: 'pc-102-tip-1',
        title: '반숙 만들기',
        content:
          '끓는 물에 넣고 6분 30초 뒤 찬물에 식히면 노른자가 부드럽습니다.',
      },
      {
        id: 'pc-102-tip-2',
        title: '보관 팁',
        content: '씻지 않은 채 보관하고 쓰기 직전에 물로 헹구세요.',
      },
    ],
  },
  {
    id: 'pc-103',
    name: '돼지 목살',
    image: `${IMAGES}/illustration-pork-steak.png`,
    description: '구이용으로 두껍게 썬 돼지 목살입니다.',
    category: '정육',
    price: 11900,
    unit: '500g',
    discountRate: 5,
    farmName: '지리산흑돼지농장',
    farmInfo:
      '경남 함양 지리산 자락에서 흑돼지를 기릅니다. 도축 후 바로 손질해 냉장으로 보냅니다.',
    basicInfo: {
      contentGuide: '돼지 목살 500g을 구이용 두께로 썰어 진공 포장합니다.',
      ingredients: '돼지고기(국내산) 100%',
      allergyInfo: '돼지고기에 민감한 분은 섭취 전 확인해 주세요.',
      storageMethod: '냉장(0~4℃) 보관하고 받은 날부터 3일 안에 드세요.',
      shippingInfo: '아이스팩과 함께 냉장 배송으로 출고됩니다.',
      notice: '지방 분포는 조금씩 다를 수 있습니다.',
    },
    tips: [
      {
        id: 'pc-103-tip-1',
        title: '굽는 방법',
        content:
          '중불에서 뚜껑을 덮어 속까지 익힌 뒤 센 불로 겉을 노릇하게 구우세요.',
      },
      {
        id: 'pc-103-tip-2',
        title: '곁들이기',
        content: '구운 마늘과 쌈채소를 곁들이면 한 끼 식사가 됩니다.',
      },
    ],
  },
  {
    id: 'pc-104',
    name: '닭다리살',
    image: `${IMAGES}/illustration-chicken-drumstick.png`,
    description: '뼈를 발라낸 부드러운 닭다리살입니다.',
    category: '정육',
    price: 8900,
    unit: '500g',
    discountRate: 0,
    farmName: '청정닭농장',
    farmInfo:
      '전북 정읍에서 닭을 기르는 농장입니다. 손질을 마친 닭다리살을 냉장으로 보냅니다.',
    basicInfo: {
      contentGuide: '뼈를 바른 닭다리살 500g을 진공 포장해 보냅니다.',
      ingredients: '닭고기(국내산) 100%',
      allergyInfo: '닭고기에 민감한 분은 섭취 전 확인해 주세요.',
      storageMethod: '냉장(0~4℃) 보관하고 받은 날부터 2일 안에 드세요.',
      shippingInfo: '아이스팩과 함께 냉장 배송으로 출고됩니다.',
      notice: '조각 크기는 조금씩 다를 수 있습니다.',
    },
    tips: [
      {
        id: 'pc-104-tip-1',
        title: '굽는 방법',
        content: '껍질 쪽부터 팬에 올려 기름이 나올 때까지 중불에서 구우세요.',
      },
      {
        id: 'pc-104-tip-2',
        title: '활용 방법',
        content: '한입 크기로 썰어 간장 양념에 볶으면 덮밥이 됩니다.',
      },
    ],
  },
  {
    id: 'pc-105',
    name: '블루베리 팩',
    image: `${IMAGES}/illustration-blueberries.png`,
    description: '알이 단단한 생블루베리 한 팩입니다.',
    category: '과일',
    price: 9900,
    unit: '1팩 · 250g',
    discountRate: 5,
    farmName: '용인블루베리농원',
    farmInfo:
      '경기 용인의 노지 밭에서 블루베리를 재배합니다. 아침에 수확한 열매만 골라 담습니다.',
    basicInfo: {
      contentGuide: '블루베리 250g을 투명 용기에 담아 보냅니다.',
      ingredients: '블루베리(국내산) 100%',
      allergyInfo: '블루베리에 민감한 분은 섭취 전 소량으로 확인해 주세요.',
      storageMethod: '씻지 않은 채 냉장 보관하고 받은 날부터 3일 안에 드세요.',
      shippingInfo: '수확 다음날 출고됩니다.',
      notice: '수확 시기에 따라 알 크기와 당도가 조금씩 다를 수 있습니다.',
    },
    tips: [
      {
        id: 'pc-105-tip-1',
        title: '씻는 요령',
        content: '먹기 직전에 흐르는 물에 가볍게 헹구고 물기를 빼세요.',
      },
      {
        id: 'pc-105-tip-2',
        title: '활용 방법',
        content: '요거트나 시리얼에 올리거나 냉동해 두고 간식으로 드세요.',
      },
    ],
  },
];

const listItems: ProductListItem[] = [...seeds]
  .reverse()
  .map(({ id, name, image, description, category, price }) => ({
    id,
    name,
    imageUrl: image,
    description,
    category,
    price,
  }));

function toDetail(seed: Seed): ProductDetailResponse {
  const images = seed.image2 ? [seed.image, seed.image2] : [seed.image];
  return {
    id: seed.id,
    name: seed.name,
    category: seed.category,
    images,
    farmName: seed.farmName,
    price: seed.price,
    unit: seed.unit,
    discountRate: seed.discountRate,
    description: seed.description,
    farmInfo: seed.farmInfo,
    farmImageUrl: seed.image2 ?? seed.image,
    basicInfo: seed.basicInfo,
    tips: seed.tips,
  };
}

// 상품 목록·상세 목업: 공통 응답 구조는 유지합니다.
export const productsData: Record<`GET ${string}`, string> = {
  'GET products?category=all&sort=latest': JSON.stringify({
    data: {
      list: listItems,
      total: seeds.length,
      limit: 15,
      offset: 0,
    },
  }),
  ...Object.fromEntries(
    [...seeds, ...recommendationOnlySeeds].map((seed) => [
      `GET products/${seed.id}`,
      JSON.stringify({ data: toDetail(seed) }),
    ]),
  ),
};
