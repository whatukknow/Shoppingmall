import catalogLabels from './catalog-labels.en.json';

/** English display labels. Keep source names unchanged for recommendations and sprite lookup. */
const foodLabels: Readonly<Record<string, string>> = {
  // Legacy operational aliases; display-only translation.
  체리: 'Cherries',
  딸기: 'Strawberries',
  라즈베리: 'Raspberries',
  청사과: 'Green apples',
  바나나: 'Bananas',
  귤: 'Mandarins',
  단감: 'Sweet persimmons',
  자두: 'Plums',
  오디: 'Mulberries',
  토마토: 'Tomatoes',
  비트: 'Beetroot',
  라디치오: 'Radicchio',
  '버터헤드 레터스': 'Butterhead lettuce',
  레터스: 'Lettuce',
  알배추: 'Baby napa cabbage',
  그린빈: 'Green beans',
  옥수수: 'Corn',
  가지: 'Eggplant',
  팽이버섯: 'Enoki mushrooms',
  새송이버섯: 'King oyster mushrooms',
  새송이: 'King oyster mushrooms',
  양송이버섯: 'Button mushrooms',
  '손질 고등어': 'Prepared mackerel',
  고등어: 'Mackerel',
  '백미 소포장': 'Small white rice pack',
  백미: 'White rice',
  '찹쌀 소포장': 'Small glutinous rice pack',
  찹쌀: 'Glutinous rice',
  '흑미 소포장': 'Small black rice pack',
  흑미: 'Black rice',
  마스카르포네: 'Mascarpone',
  치즈: 'Cheese',
  생크림: 'Cream',
  버터: 'Butter',
  '토마토 파스타 키트': 'Tomato pasta kit',
  '버섯 크림 파스타 키트': 'Creamy mushroom pasta kit',
  '브런치 케이크 키트': 'Brunch cake kit',
  '피크닉 과일 바구니': 'Picnic fruit basket',
  '그린 샐러드 키트': 'Green salad kit',
  '홈 포카치아 키트': 'Bake-at-home focaccia kit',
  '바질 페스토': 'Basil pesto',
  페스토: 'Pesto',
  파스타: 'Pasta',
  소스: 'Sauce',
  생지: 'Dough',
  손질: 'Prepared',
  '기존 레시피 1회분의 포함 재료만':
    'Included ingredients for one recipe batch',
  목: 'Wood',
  화: 'Fire',
  토: 'Earth',
  금: 'Metal',
  수: 'Water',
  쥐: 'Rat',
  소: 'Ox',
  호랑이: 'Tiger',
  토끼: 'Rabbit',
  용: 'Dragon',
  뱀: 'Snake',
  말: 'Horse',
  양: 'Goat',
  원숭이: 'Monkey',
  닭: 'Rooster',
  개: 'Dog',
  돼지: 'Pig',
  '브리오슈 프렌치토스트 키트': 'Brioche French toast kit',
  '원디쉬 라구 파스타 키트': 'One-pan ragù pasta kit',
  '주말 와플 브런치 키트': 'Weekend waffle brunch kit',
  '새우와 채소 한 접시 키트': 'Shrimp and vegetable plate kit',
  '작은 식탁의 크림 케이크': 'Small cream cake',
  '햄을 곁들인 프렌치토스트': 'French toast with ham',
  '햄·달걀 바게트 브런치': 'Ham and egg baguette brunch',
  '리가토니 한 접시 키트': 'Rigatoni meal kit',
  '버섯 크림 한 접시 키트': 'Creamy mushroom meal kit',
  '피크닉 베이글 샌드위치': 'Picnic bagel sandwich',
  '에그 샌드위치 키트': 'Egg sandwich kit',
  '토마토 치즈 한 접시': 'Tomato and cheese plate',
  '청포도 치즈 샐러드': 'Green grape and cheese salad',
  '초록 페스토 샐러드': 'Green pesto salad',
  '새우·달걀 브런치 키트': 'Shrimp and egg brunch kit',
  '구운 청어알 비빔메밀면': 'Buckwheat noodles with grilled herring roe',
  '멕시칸 타코 샐러드': 'Mexican taco salad',
  '토마토 뇨키 키트': 'Tomato gnocchi kit',
  '노른자 크림 파스타 키트': 'Egg yolk cream pasta kit',
  '갓 구운 바게트 잠봉뵈르': 'Fresh baguette jambon-beurre',
  '갓 만든 베이글 아침 세트': 'Fresh bagel breakfast set',
  '집에서 굽는 포카치아 키트': 'Bake-at-home focaccia kit',
  '한강 피크닉 도시락 세트': 'Han River picnic lunch set',
  '이탈리아 식품 셀렉션': 'Italian pantry selection',
  '홈메이드 바질페스토 150g': 'Homemade basil pesto · 150g',
  '직접 만든 발효 베이글 · 2개': 'Handmade fermented bagels · 2 pieces',
  '한 줌의 바질': 'A handful of basil',
  '한 끼 토마토': 'Tomatoes for one',
  '조금씩 담는 채소 믹스': 'Small mixed vegetable pack',
  '작은 딸기 한 팩': 'Small strawberry pack',
  '컬러 방울토마토': 'Mixed cherry tomatoes',
  '잎채소 소분 믹스': 'Mixed leafy greens',
  '구이용 소고기 소분': 'Grilling beef portion',
  '고소한 잣 소분': 'Pine nuts portion',
  '요리에 더하는 치즈 소분': 'Cooking cheese portion',
  '시간을 들인 바게트': 'Slow-fermented baguette',
  '집에서 굽는 미니빵 생지': 'Mini bread dough',
  '우유 소포장': 'Small milk carton',
  '생크림 소포장': 'Small cream carton',
  레몬: 'Lemon',
  '천일염 미니': 'Mini sea salt',
  '플레인 크래커': 'Plain crackers',
  짜장라면: 'Black bean instant noodles',
  '얼큰 우동라면': 'Spicy udon noodles',
  '채끝 스테이크 소분': 'Striploin steak portion',
  '달걀 소포장': 'Small egg pack',
  '베이컨 소포장': 'Small bacon pack',
  '우유식빵 소포장': 'Small milk bread pack',
  '우동면 소포장': 'Small udon pack',
  '쯔유 미니': 'Mini tsuyu sauce',
  '손질 꽃게': 'Prepared blue crab',
  크림치즈: 'Cream cheese',
  '블루베리 잼': 'Blueberry jam',
  깜빠뉴: 'Country bread',
  '올리브오일 미니': 'Mini olive oil',
  '신김치 소포장': 'Small aged kimchi pack',
  '코인 육수': 'Stock tablets',
  '들기름 미니': 'Mini perilla oil',
  쌀국수면: 'Rice noodles',
  '쌀국수 육수 소스': 'Rice noodle broth base',
  숙주: 'Mung bean sprouts',
  고수: 'Cilantro',
  두부: 'Tofu',
  강황: 'Turmeric',
  템페: 'Tempeh',
  '잠봉 소포장': 'Small jambon pack',
  루꼴라: 'Arugula',
  무화과: 'Figs',
  '버터 소포장': 'Small butter pack',
  '메이플 시럽 미니': 'Mini maple syrup',
  '토마토 통조림': 'Canned tomatoes',
  '하리사 미니': 'Mini harissa',
  당근: 'Carrots',
  '홀그레인 머스터드': 'Wholegrain mustard',
  '소고기 양지 소분': 'Beef brisket portion',
  '양파 소포장': 'Small onion pack',
  양송이: 'Button mushrooms',
  '대파 소포장': 'Small green onion pack',
  '간장 미니': 'Mini soy sauce',
  즉석밥: 'Instant rice',
  '병아리콩 통조림': 'Canned chickpeas',
  코코넛밀크: 'Coconut milk',
  '커리 페이스트': 'Curry paste',
  '케첩 미니': 'Mini ketchup',
  '스리라차 미니': 'Mini sriracha',
  '비트 후무스': 'Beet hummus',
  단호박: 'Kabocha squash',
  밤: 'Chestnuts',
  '쑥 페이스트': 'Mugwort paste',
  박력분: 'Cake flour',
  '국물 라면': 'Soup ramen',
  '브리오슈 슬라이스': 'Brioche slices',
  '롱 파스타면': 'Long pasta',
  '라구 소스': 'Ragù sauce',
  와플: 'Waffles',
  '마스카르포네 크림': 'Mascarpone cream',
  '손질 새우': 'Peeled shrimp',
  '마늘 조리 소스': 'Garlic cooking sauce',
  리가토니면: 'Rigatoni',
  '토마토 파스타 소스': 'Tomato pasta sauce',
  '크림 소스 베이스': 'Cream sauce base',
  '마요네즈 소포장': 'Small mayonnaise pack',
  '감자 뇨키': 'Potato gnocchi',
  '노른자 소스 베이스': 'Egg yolk sauce base',
  '포카치아 생지': 'Focaccia dough',
  '올리브 토핑': 'Olive topping',
  '닭고기 소포장': 'Small chicken pack',
  '생강 소포장': 'Small ginger pack',
  사과: 'Apples',
  '제철 귤': 'Seasonal mandarins',
  '손질 오징어': 'Cleaned squid',
  참치캔: 'Canned tuna',
  '슬라이스 치즈': 'Sliced cheese',
  과자: 'Snacks',
  '케이크 시트': 'Cake layers',
  오이: 'Cucumber',
  감자: 'Potatoes',
  '딸기 팩': 'Strawberry pack',
  '달콤한 참외': 'Sweet Korean melon',
  '사과 2입': 'Apples · 2 pieces',
  '대파 다발': 'Green onion bunch',
  '늙은 호박': 'Ripe pumpkin',
  통수박: 'Whole watermelon',
  방울토마토: 'Cherry tomatoes',
  완두콩: 'Green peas',
  '제주 귤': 'Jeju mandarins',
  '양파 3개': 'Onions · 3 pieces',
  '감귤 팩': 'Mandarin pack',
  '노란 멜론': 'Yellow melon',
  방울양배추: 'Brussels sprouts',
  '거봉 포도': 'Kyoho grapes',
  양배추: 'Cabbage',
  '스테이크용 소고기': 'Beef steak',
  '돼지 목살': 'Pork collar',
  닭다리살: 'Chicken thigh',
  '블루베리 팩': 'Blueberry pack',
  '용인 블루베리': 'Yongin blueberries',
  '시흥 스테비아 토마토': 'Siheung stevia tomatoes',
  과일: 'Fruit',
  채소: 'Vegetables',
  정육: 'Meat',
  달걀: 'Eggs',
  '아침에 딴 참외를 그날 바로 보냅니다.':
    'Korean melons picked in the morning and shipped the same day.',
  '탱글한 식감의 방울토마토를 500g씩 담았습니다.':
    'Firm, juicy cherry tomatoes in a 500g pack.',
  '부드러운 과육의 노란 멜론 한 통입니다.':
    'A whole yellow melon with tender flesh.',
  '단맛이 진한 늙은 호박을 1.5kg 규격으로 보냅니다.':
    'Sweet, ripe pumpkin in an approximately 1.5kg size.',
  '새콤달콤한 귤을 2kg 규격으로 담았습니다.':
    'Sweet and tangy mandarins in a 2kg pack.',
  '알이 굵은 거봉 포도 1.2kg을 한 송이씩 포장합니다.':
    'Large Kyoho grapes, individually wrapped by the bunch, totaling 1.2kg.',
  '묵직한 딸기를 400g씩 두 팩으로 보냅니다.':
    'Two 400g packs of plump strawberries.',
  '단단하고 알이 고른 양파를 3개씩 포장합니다.':
    'Three firm, evenly sized onions.',
  '속까지 단단한 양배추 한 통입니다.': 'One whole, firm cabbage.',
  '뿌리까지 싱싱한 대파를 다발로 보냅니다.':
    'A fresh bunch of green onions, roots and all.',
  '알이 통통한 신선한 완두콩을 600g으로 담았습니다.':
    'Plump, fresh green peas in a 600g pack.',
  '한 알씩 탱글한 방울양배추를 400g으로 보냅니다.':
    'Firm Brussels sprouts in a 400g pack.',
  '아삭한 사과 두 알을 포장해 보냅니다.': 'Two crisp apples, packed together.',
  '새콤달콤한 귤 800g 팩입니다.': 'An 800g pack of sweet and tangy mandarins.',
  '잘 익은 통수박을 통째로 보냅니다.': 'One whole, ripe watermelon.',
  '두툼하게 썬 스테이크용 소고기입니다.': 'Thick-cut beef for steak.',
  '구이용으로 두껍게 썬 돼지 목살입니다.':
    'Thick-cut pork collar for grilling.',
  '뼈를 발라낸 부드러운 닭다리살입니다.': 'Tender, boneless chicken thigh.',
  성천참외농장: 'Seongcheon Korean Melon Farm',
  햇살밭농원: 'Haetsalbat Farm',
  김제멜론농원: 'Gimje Melon Farm',
  들녘농원: 'Deullyeok Farm',
  한라밭농장: 'Hallabat Farm',
  청송포도농원: 'Cheongsong Grape Farm',
  화성딸기농장: 'Hwaseong Strawberry Farm',
  무안양파농원: 'Muan Onion Farm',
  양주채소농원: 'Yangju Vegetable Farm',
  밀양대파농원: 'Miryang Green Onion Farm',
  한밭농원: 'Hanbat Farm',
  산촌농원: 'Sanchon Farm',
  괴산사과농장: 'Goesan Apple Farm',
  서귀포감귤농원: 'Seogwipo Mandarin Farm',
  고성수박농장: 'Goseong Watermelon Farm',
  횡성한우목장: 'Hoengseong Hanwoo Farm',
  지리산흑돼지농장: 'Jirisan Black Pig Farm',
  청정닭농장: 'Cheongjeong Chicken Farm',
};

function countLabel(amount: string, singular: string, plural: string) {
  const [numerator, denominator = '1'] = amount.split('/');
  const count = Number(numerator) / Number(denominator);
  return `${amount} ${count <= 1 ? singular : plural}`;
}

export function foodLabel(name: string): string {
  const catalogLabel = (catalogLabels as Record<string, string>)[name];
  if (catalogLabel) return catalogLabel;
  if (foodLabels[name]) return foodLabels[name];
  const labels: Readonly<Record<string, string>> = {
    ...foodLabels,
    ...catalogLabels,
  };
  const prefix = Object.keys(labels)
    .filter((key) => key.length > 1 || ['귤', '밤', '무', '배'].includes(key))
    .sort((a, b) => b.length - a.length)
    .find((key) => name.startsWith(key + ' '));
  if (prefix) name = labels[prefix] + name.slice(prefix.length);
  return (
    foodLabels[name] ??
    name
      .replace(/소분/g, 'shared pack')
      .replace(/(\d+)입/g, '$1 pieces')
      .replace(/약\s*/g, 'approx. ')
      .replace(/(\d+(?:\/\d+)?)개/g, (_match, amount: string) =>
        countLabel(amount, 'piece', 'pieces'),
      )
      .replace(/(\d+(?:\/\d+)?)팩/g, (_match, amount: string) =>
        countLabel(amount, 'pack', 'packs'),
      )
      .replace(/(\d+(?:\/\d+)?)구/g, (_match, amount: string) =>
        countLabel(amount, 'egg', 'eggs'),
      )
      .replace(/(\d+(?:\/\d+)?)포기/g, (_match, amount: string) =>
        countLabel(amount, 'head', 'heads'),
      )
      .replace(/(\d+(?:\/\d+)?)다발/g, (_match, amount: string) =>
        countLabel(amount, 'bunch', 'bunches'),
      )
      .replace(/(\d+)통/g, '$1 whole')
      .replace(/(\d+(?:\/\d+)?)장/g, (_match, amount: string) =>
        countLabel(amount, 'slice', 'slices'),
      )
      .replace(/(\d+(?:\/\d+)?)조각/g, (_match, amount: string) =>
        countLabel(amount, 'piece', 'pieces'),
      )
      .replace(/(\d+(?:\/\d+)?)봉/g, (_match, amount: string) =>
        countLabel(amount, 'bag', 'bags'),
      )
      .replace(/(\d+(?:\/\d+)?)인분/g, (_match, amount: string) =>
        countLabel(amount, 'serving', 'servings'),
      )
      .replace(/키트/g, 'kit')
      .replace(/바구니/g, 'basket')
  );
}
