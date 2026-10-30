import catalogCopy from './data/catalog-copy.en.json';
import { foodLabel } from '@/shared/lib/food-label';
import type { ProductDetailResponse } from './products.types';

/** US English translations of the catalog source copy. Keep source data and IDs intact. */
const productCopyEn: Readonly<Record<string, string>> = {
  '오늘 마감': 'Closes today',
  '1팩 · 300g': '1 pack · 300 g',
  '1봉 · 500g': '1 bag · 500 g',
  '1상자 · 400g': '1 box · 400 g',
  마감: 'Closed',
  '경북 성주의 강변 모래밭에서 참외를 재배하는 가족농장입니다. 하우스에서 알맞게 익은 참외만 수확해 보냅니다.':
    'A family farm growing Korean melons in sandy riverside fields in Seongju, North Gyeongsang Province. Only greenhouse-grown melons at the right stage of ripeness are harvested and shipped.',
  '참외 5~6과(약 1.1kg)를 신문지에 개별 포장해 상자에 담아 보냅니다.':
    'Five to six Korean melons (about 1.1 kg), individually wrapped in newspaper and packed in a box.',
  '참외 100%가 사용됩니다.': '100% Korean melon.',
  '과일 특유의 성분에 민감한 분은 섭취 전 소량으로 확인해 주세요.':
    'If you are sensitive to compounds naturally present in fruit, try a small amount first.',
  '도착 후 냉장(0~5℃)에 보관하고, 3일 내로 드시는 것을 권합니다.':
    'Refrigerate at 0–5°C on arrival and enjoy within three days.',
  '품종별 예약 배송으로 수확 다음 날 출고됩니다.':
    'Preordered varieties ship the day after harvest.',
  '수확 시기에 따라 당도와 크기는 조금씩 달라질 수 있습니다.':
    'Sweetness and size may vary slightly with the harvest season.',
  '더 달게 드시려면': 'Bring out the sweetness',
  '먹기 1~2시간 전 실온에 두면 향이 살아납니다. 잘 씻어 껍질째 드시면 향이 더 진합니다.':
    'Leave at room temperature for one to two hours before eating to bring out the aroma. Wash well and enjoy with the peel for a fuller flavor.',
  '손질 요령': 'How to prepare',
  '반으로 가른 뒤 숟가락으로 씨를 긁어내고 먹기 좋게 잘라 드세요.':
    'Cut in half, scoop out the seeds with a spoon, and slice into bite-sized pieces.',
  '충남 부여의 유리온실에서 수경재배로 방울토마토를 키우는 농원입니다. 관수량을 조절해 당도를 관리합니다.':
    'This farm grows cherry tomatoes hydroponically in a glass greenhouse in Buyeo, South Chungcheong Province. Watering is adjusted to manage sweetness.',
  '방울토마토 500g을 투명 용기에 담아 보냅니다.':
    'A 500 g pack of cherry tomatoes in a clear container.',
  '방울토마토 100%가 사용됩니다.': '100% cherry tomatoes.',
  '토마토에 민감한 분은 섭취 전 소량으로 확인해 주세요.':
    'If you are sensitive to tomatoes, try a small amount first.',
  '꼭지를 제거하지 않은 채 냉장 보관하고 가급적 빨리 드세요.':
    'Refrigerate with the stems attached and enjoy as soon as possible.',
  '월·화·수 예약 접수 후 익일 출고됩니다.':
    'Preorders placed Monday through Wednesday ship the following day.',
  '보관 팁': 'Storage tips',
  '받침이 있는 밀폐 용기에 옮겨 담으면 눌림 없이 보관됩니다.':
    'Transfer to an airtight container with a raised insert to help prevent bruising.',
  '활용 방법': 'Serving ideas',
  '반으로 갈라 올리브유와 소금을 넣고 볶으면 간단한 파스타 소스가 됩니다.':
    'Halve and sauté with olive oil and salt for a simple pasta sauce.',
  '1개(약 1.2kg)': '1 melon (about 1.2 kg)',
  '전북 김제 평야의 점토질 밭에서 멜론을 재배합니다. 한 줄기에 열매를 하나만 남겨 크고 고르게 키웁니다.':
    'Melons are grown in clay-rich fields on the Gimje plains in North Jeolla Province. Each vine is left with just one fruit to encourage large, evenly developed melons.',
  '노란 멜론 1과(약 1.2kg)를 완충재에 포장해 보냅니다.':
    'One yellow melon (about 1.2 kg), packed with protective cushioning.',
  '멜론 100%가 사용됩니다.': '100% melon.',
  '멜론 과육·씨에 민감한 분은 섭취 전 소량으로 확인해 주세요.':
    'If you are sensitive to melon flesh or seeds, try a small amount first.',
  '실온에서 숙성 후 먹기 전 냉장 보관하세요.':
    'Ripen at room temperature, then refrigerate before eating.',
  '화·금 예약 배송으로 수확일 출고됩니다.':
    'Tuesday and Friday preorders ship on the day of harvest.',
  '숙성 확인법': 'Check for ripeness',
  '꼭지 반대편을 가볍게 눌렀을 때 살짝 들어가면 먹기 좋습니다.':
    'The melon is ready when the end opposite the stem gives slightly under gentle pressure.',
  '한입 크기로 썰어 요거트와 함께 담으면 간식이 됩니다.':
    'Cut into bite-sized pieces and serve with yogurt for a snack.',
  '1개(약 1.5kg)': '1 pumpkin (about 1.5 kg)',
  '강원 횡성 고지대 밭에서 늙은 호박을 재배합니다. 서리 내리기 전까지 밭에서 충분히 익혀 수확합니다.':
    'Ripe pumpkins are grown in highland fields in Hoengseong, Gangwon Province. They are left to ripen fully in the field before being harvested ahead of the first frost.',
  '늙은 호박 1과(약 1.5kg)를 신문지에 싸서 보냅니다.':
    'One ripe pumpkin (about 1.5 kg), wrapped in newspaper.',
  '호박 100%가 사용됩니다.': '100% pumpkin.',
  '호박에 민감한 분은 섭취 전 소량으로 확인해 주세요.':
    'If you are sensitive to pumpkin, try a small amount first.',
  '신문지에 싸서 통풍이 잘 되는 서늘한 곳에 세워 보관하면 오래 갑니다.':
    'Wrap in newspaper and store upright in a cool, well-ventilated place to help it keep longer.',
  '주문 다음날 오후에 출고됩니다.':
    'Ships the afternoon after your order is placed.',
  '모양과 색이 균일하지 않을 수 있습니다.': 'Shape and color may vary.',
  '조리 팁': 'Cooking tips',
  '전자레인지에 2~3분 데운 뒤 자르면 손이 덜 가고 껍질도 쉽게 벗겨집니다.':
    'Microwave for two to three minutes before cutting to make slicing and peeling easier.',
  '찬밥과 함께 갈아 죽을 끓이면 아침 식사 대용이 됩니다.':
    'Blend with leftover cooked rice and simmer into a porridge for breakfast.',
  '제주 한라산 중산간 마을의 밭에서 귤을 재배합니다. 풀을 손으로 베어 가며 밭을 관리합니다.':
    'Mandarins are grown in fields in the foothills of Hallasan on Jeju Island. The fields are maintained by cutting the grass by hand.',
  '귤 약 16~20과(2kg)를 통풍 상자에 담아 보냅니다.':
    'About 16–20 mandarins (2 kg), packed in a ventilated box.',
  '귤 100%가 사용됩니다.': '100% mandarins.',
  '감귤에 민감한 분은 섭취 전 소량으로 확인해 주세요.':
    'If you are sensitive to citrus fruit, try a small amount first.',
  '서늘한 실온에서 4~5일, 그 뒤는 냉장 보관하세요.':
    'Keep at a cool room temperature for four to five days, then refrigerate.',
  '월·목 예약 접수 후 다음날 출고됩니다.':
    'Monday and Thursday preorders ship the following day.',
  '껍질에 얼룩이 있을 수 있으나 과육 품질에는 영향이 없습니다.':
    'The peel may have marks that do not affect the quality of the flesh.',
  '고르는 법': 'How to choose',
  '껍질이 얇고 탄력이 있으며 무게가 묵직한 것이 과즙이 많습니다.':
    'Look for thin, springy skin and fruit that feels heavy for its size for plenty of juice.',
  '껍질을 잘 씻어 말린 뒤 뜨거운 물에 우리면 향긋한 귤피차가 됩니다.':
    'Wash and dry the peel thoroughly, then steep in hot water for fragrant mandarin peel tea.',
  '경북 청송 산기슭 비가림 하우스에서 거봉을 재배합니다. 알이 터지지 않도록 비닐로 비를 막아 키웁니다.':
    'Kyoho grapes are grown under rain shelters at the foot of the mountains in Cheongsong, North Gyeongsang Province. Plastic covers protect the fruit from rain to help prevent splitting.',
  '거봉 포도 1.2kg을 2팩으로 나눠 보냅니다.':
    'Kyoho grapes totaling 1.2 kg, divided into two packs.',
  '거봉 포도 100%가 사용됩니다.': '100% Kyoho grapes.',
  '포도 과육·껍질에 민감한 분은 섭취 전 소량으로 확인해 주세요.':
    'If you are sensitive to grape flesh or skin, try a small amount first.',
  '씻지 않은 채 냉장 보관하고 드실 때만 씻으세요.':
    'Refrigerate unwashed and rinse just before eating.',
  '수·일 예약 배송으로 수확일 출고됩니다.':
    'Wednesday and Sunday preorders ship on the day of harvest.',
  '송이 모양과 색은 기후에 따라 조금씩 달라질 수 있습니다.':
    'Bunch shape and color may vary slightly with the weather.',
  '세척 팁': 'Washing tips',
  '흐르는 물에 가볍게 씻고 줄기 쪽부터 알을 하나씩 떼어 드세요.':
    'Rinse gently under running water and remove the grapes one at a time, starting near the stem.',
  '씻어 냉동해 두면 아이스크림 대용 간식이 됩니다.':
    'Wash and freeze for a refreshing alternative to ice cream.',
  '경기 화성 하우스에서 허리 높이 재배대로 딸기를 키웁니다. 아침에 수확해 바로 포장합니다.':
    'Strawberries are grown on waist-high benches in greenhouses in Hwaseong, Gyeonggi Province. They are harvested in the morning and packed right away.',
  '딸기 400g을 2팩으로 나눠 완충재와 함께 보냅니다.':
    'Two 400 g packs of strawberries, shipped with protective cushioning.',
  '딸기 100%가 사용됩니다.': '100% strawberries.',
  '딸기에 민감한 분은 섭취 전 소량으로 확인해 주세요.':
    'If you are sensitive to strawberries, try a small amount first.',
  '씻지 않은 채 냉장 보관하고 받은 날부터 2~3일 안에 드세요.':
    'Refrigerate unwashed and enjoy within two to three days of arrival.',
  '월·수·금 예약 배송으로 수확일 출고됩니다.':
    'Monday, Wednesday, and Friday preorders ship on the day of harvest.',
  '운송 중 흠집이 생길 수 있으니 개봉 후 가급적 빨리 드세요.':
    'Some bruising may occur in transit. Enjoy as soon as possible after opening.',
  '씻는 요령': 'How to wash',
  '꼭지를 떼지 않은 채 흐르는 물에 짧게 씻고 물기를 빼세요.':
    'Rinse briefly under running water with the stems attached, then drain.',
  '설탕에 버무려 약한 불에 졸이면 간단한 잼이 됩니다.':
    'Toss with sugar and simmer over low heat for a simple jam.',
  '3개(약 900g)': '3 onions (about 900 g)',
  '전남 무안의 황토밭에서 양파를 재배합니다. 수확 후 그늘에서 충분히 말려 보냅니다.':
    'Onions are grown in red clay fields in Muan, South Jeolla Province. After harvest, they are thoroughly dried in the shade before shipping.',
  '양파 3과(약 900g)를 망 포장해 보냅니다.':
    'Three onions (about 900 g), packed in a mesh bag.',
  '양파 100%가 사용됩니다.': '100% onions.',
  '양파에 민감한 분은 섭취 전 소량으로 확인해 주세요.':
    'If you are sensitive to onions, try a small amount first.',
  '통풍이 잘 되는 실온에 보관합니다. 자른 것은 밀폐해 냉장하세요.':
    'Store at room temperature in a well-ventilated place. Refrigerate cut onions in an airtight container.',
  '겉껍질이 벗겨진 정도는 조금씩 다를 수 있습니다.':
    'The amount of outer skin remaining may vary.',
  '썰 때 눈 안 따갑게': 'Fewer tears when chopping',
  '썰기 전 냉장고에 30분 두거나 칼에 물을 묻혀 썰면 눈이 덜 맵습니다.':
    'Chill for 30 minutes before cutting, or wet your knife, to help reduce eye irritation.',
  '갈색이 날 때까지 볶아 두면 카레·수프의 단맛을 내는 재료가 됩니다.':
    'Sauté until brown and use to add sweetness to curries and soups.',
  '1포기(약 1.2kg)': '1 head (about 1.2 kg)',
  '경기 양주 밭에서 퇴비로 땅을 일궈 양배추를 재배합니다.':
    'Cabbages are grown in compost-enriched fields in Yangju, Gyeonggi Province.',
  '양배추 1포기(약 1.2kg)를 신문지에 싸서 보냅니다.':
    'One head of cabbage (about 1.2 kg), wrapped in newspaper.',
  '양배추 100%가 사용됩니다.': '100% cabbage.',
  '십자화과 채소에 민감한 분은 섭취 전 소량으로 확인해 주세요.':
    'If you are sensitive to cruciferous vegetables, try a small amount first.',
  '겉잎을 살짝 제거하고 랩을 씌워 야채칸에 보관합니다.':
    "Remove a few outer leaves, wrap, and store in the refrigerator's vegetable drawer.",
  '겉잎에 재배 과정의 흠집이 남을 수 있습니다.':
    'Outer leaves may show marks from growing in the field.',
  '겉잎부터 차례로 떼어 쓰면 오래 신선합니다.':
    'Remove and use the outer leaves first to help the rest stay fresh longer.',
  '얇게 채 썰어 두고 샐러드·볶음에 나눠 쓰면 손질 시간이 줄어듭니다.':
    'Shred in advance and use portions in salads and stir-fries to save prep time.',
  '1다발(약 800g)': '1 bunch (about 800 g)',
  '경남 밀양의 파 전문 밭에서 흙을 북돋아 주며 대파를 키웁니다. 흰 대가 길게 자랍니다.':
    'Green onions are grown in dedicated fields in Miryang, South Gyeongsang Province. Soil is mounded around the plants to develop long white stalks.',
  '대파 1다발(약 800g, 5~8대)을 신문지에 싸 보냅니다.':
    'One bunch of green onions (about 800 g, five to eight stalks), wrapped in newspaper.',
  '대파 100%가 사용됩니다.': '100% green onions.',
  '파에 민감한 분은 섭취 전 소량으로 확인해 주세요.':
    'If you are sensitive to green onions, try a small amount first.',
  '씻지 않은 채 신문지에 싸 서늘한 곳에 보관하거나, 잘게 썰어 냉동하세요.':
    'Store unwashed in newspaper in a cool place, or chop and freeze.',
  '주문 다음날 오전에 출고됩니다.':
    'Ships the morning after your order is placed.',
  '대 길이와 굵기는 수확 시기에 따라 달라질 수 있습니다.':
    'Stalk length and thickness may vary with the harvest season.',
  '손질 팁': 'Prep tips',
  '뿌리 쪽 흙은 털어내고, 잎 사이 모래는 흐르는 물에 씻어내세요.':
    'Shake soil from the roots and rinse sand from between the leaves under running water.',
  '흰 대와 푸른 잎을 나눠 쓰세요. 흰 대는 국·찌개에, 잎은 무침·볶음에 씁니다.':
    'Use the white stalks and green leaves separately. Add the stalks to soups and stews, and the leaves to seasoned salads and stir-fries.',
  '전북 익산 밭에서 완두콩을 재배합니다. 꼬투리가 통통해졌을 때 손으로 따서 수확합니다.':
    'Green peas are grown in fields in Iksan, North Jeolla Province. The pods are picked by hand once they are plump.',
  '껍질을 까낸 완두콩 알만 600g을 담아 보냅니다.':
    'A 600 g pack of shelled green peas.',
  '완두콩 100%가 사용됩니다.': '100% green peas.',
  '콩류에 민감한 분은 섭취 전 소량으로 확인해 주세요.':
    'If you are sensitive to legumes, try a small amount first.',
  '밀폐 봉지에 담아 냉장 보관하고 3일 내로 드세요.':
    'Refrigerate in a sealed bag and enjoy within three days.',
  '화·목 예약 접수 후 다음날 출고됩니다.':
    'Tuesday and Thursday preorders ship the following day.',
  '수확 시기에 따라 알 크기와 단맛은 조금씩 달라질 수 있습니다.':
    'Pea size and sweetness may vary slightly with the harvest season.',
  '익히는 팁': 'Cooking tips',
  '끓는 물에 소금을 약간 넣고 2~3분 데치면 초록빛이 살아납니다.':
    'Blanch in lightly salted boiling water for two to three minutes to bring out the green color.',
  '데친 콩에 참기름과 소금을 곁들여 간단한 반찬으로 드세요.':
    'Serve blanched peas with sesame oil and salt for a simple side dish.',
  '강원 정선 고랭지 밭에서 방울양배추를 재배합니다. 낮과 밤의 온도차가 알 단맛을 살립니다.':
    'Brussels sprouts are grown in highland fields in Jeongseon, Gangwon Province. The difference between daytime and nighttime temperatures brings out their sweetness.',
  '방울양배추 약 20알(400g)을 종이상자에 담아 보냅니다.':
    'About 20 Brussels sprouts (400 g), packed in a cardboard box.',
  '방울양배추 100%가 사용됩니다.': '100% Brussels sprouts.',
  '십자화과에 민감한 분은 섭취 전 소량으로 확인해 주세요.':
    'If you are sensitive to cruciferous vegetables, try a small amount first.',
  '밀폐 용기에 담아 야채칸에 보관하고 4~5일 내 드세요.':
    'Refrigerate in an airtight container in the vegetable drawer and enjoy within four to five days.',
  '월·목 예약 배송으로 수확일 출고됩니다.':
    'Monday and Thursday preorders ship on the day of harvest.',
  '알 크기는 고르지 않을 수 있습니다.': 'Sprout sizes may vary.',
  '밑동을 조금 잘라내고 시든 겉잎을 떼어낸 뒤 씻어 쓰세요.':
    'Trim the bases, remove any wilted outer leaves, and rinse before use.',
  '절반으로 가르고 올리브유·소금을 뿌려 180℃ 오븐에 15분 구우면 곁들임 요리가 됩니다.':
    'Halve, drizzle with olive oil, season with salt, and roast at 180°C (356°F) for 15 minutes for a simple side dish.',
  '2개(약 900g)': '2 apples (about 900 g)',
  '충북 괴산 밭에서 사과를 재배합니다. 열매에 햇빛이 골고루 닿도록 봉지 씌우기 작업을 합니다.':
    'Apples are grown in fields in Goesan, North Chungcheong Province. Fruit is bagged as part of the growing process to help manage even exposure to sunlight.',
  '사과 2개(약 900g)를 완충망에 개별 포장해 보냅니다.':
    'Two apples (about 900 g), individually packed in protective foam sleeves.',
  '사과 100%가 사용됩니다.': '100% apples.',
  '사과 과육에 민감한 분은 섭취 전 소량으로 확인해 주세요.':
    'If you are sensitive to apple flesh, try a small amount first.',
  '실온 3~4일, 그 이후는 냉장 보관하세요.':
    'Keep at room temperature for three to four days, then refrigerate.',
  '수·일 예약 배송으로 수확 다음날 출고됩니다.':
    'Wednesday and Sunday preorders ship the day after harvest.',
  '색과 직경은 개체차가 있습니다.':
    'Color and diameter vary between individual apples.',
  '갈변 막기': 'Slow down browning',
  '자른 면에 레몬즙을 살짝 뿌리면 갈변이 늦어집니다.':
    'Sprinkle cut surfaces with a little lemon juice to help slow browning.',
  '얇게 썰어 시나몬을 뿌려 구우면 부드러운 후식이 됩니다.':
    'Slice thinly, sprinkle with cinnamon, and bake for a tender dessert.',
  '제주 서귀포 중산간 밭에서 하우스 감귤을 재배합니다. 하우스 온도를 맞춰 껍질이 얇고 단 귤을 키웁니다.':
    'Greenhouse mandarins are grown in the foothills of Seogwipo on Jeju Island. Greenhouse temperatures are managed to produce sweet fruit with thin skin.',
  '감귤 약 10~14과(800g)를 종이상자에 담아 보냅니다.':
    'About 10–14 mandarins (800 g), packed in a cardboard box.',
  '감귤 100%가 사용됩니다.': '100% mandarins.',
  '서늘한 실온에 두고 일주일 내로 드세요.':
    'Keep at a cool room temperature and enjoy within one week.',
  '수요일 예약 접수 후 목요일 출고됩니다.':
    'Wednesday preorders ship on Thursday.',
  '껍질 오점은 과육 품질에 영향이 없습니다.':
    'Marks on the peel do not affect the quality of the flesh.',
  '깔끔하게 벗기기': 'Peel with less mess',
  '꼭지 반대편부터 껍질을 벗기면 속껍질이 덜 남습니다.':
    'Start peeling from the end opposite the stem to leave less white pith behind.',
  '껍질을 말려 뜨거운 물에 우려내면 간단한 차가 됩니다.':
    'Dry the peel and steep in hot water for a simple tea.',
  '1통(약 5kg)': '1 whole watermelon (about 5 kg)',
  '강원 고성 해안가 밭에서 수박을 재배합니다. 순을 하나만 남겨 열매에 양분을 집중시킵니다.':
    'Watermelons are grown in coastal fields in Goseong, Gangwon Province. Just one shoot is kept to direct nutrients toward the fruit.',
  '수박 1통(약 5kg)을 눌림 방지 완충재로 포장해 보냅니다.':
    'One whole watermelon (about 5 kg), packed with cushioning to help prevent bruising.',
  '수박 100%가 사용됩니다.': '100% watermelon.',
  '수박에 민감한 분은 섭취 전 소량으로 확인해 주세요.':
    'If you are sensitive to watermelon, try a small amount first.',
  '자르기 전 실온 보관, 자른 뒤 밀폐해 냉장하세요.':
    'Store at room temperature before cutting. Once cut, refrigerate in an airtight container.',
  '껍질 무늬와 무게는 개체차가 있습니다.':
    'Rind patterns and weight vary between individual watermelons.',
  '당도 확인법': 'Check for sweetness',
  '두드릴 때 통통 소리가 나고 꼭지가 마르면 먹기 좋습니다.':
    'A hollow sound when tapped and a dry stem are signs that it is ready to eat.',
  '남은 과육은 씨를 제거해 갈아 시원한 주스로 드세요.':
    'Remove the seeds from leftover flesh and blend into a refreshing juice.',
  '강원 횡성에서 한우를 기르는 목장입니다. 주문을 받은 뒤 정육점에서 두께를 맞춰 손질합니다.':
    'This farm raises Hanwoo cattle in Hoengseong, Gangwon Province. The beef is trimmed and cut to thickness at the butcher shop after an order is placed.',
  '소고기 등심 300g(2장)을 진공 포장해 보냅니다.':
    'Two beef loin steaks totaling 300 g, vacuum-packed.',
  '소고기(국내산) 100%': '100% beef, raised in South Korea.',
  '소고기에 민감한 분은 섭취 전 확인해 주세요.':
    'If you are sensitive to beef, check before eating.',
  '냉장(0~4℃) 보관하고 받은 날부터 3일 안에 드세요.':
    'Refrigerate at 0–4°C and enjoy within three days of arrival.',
  '아이스팩과 함께 냉장 배송으로 출고됩니다.':
    'Shipped chilled with ice packs.',
  '부위별로 마블링과 모양은 조금씩 다를 수 있습니다.':
    'Marbling and shape may vary slightly between cuts.',
  '굽기 전 준비': 'Before cooking',
  '굽기 30분 전에 꺼내 실온에 두고 소금은 굽기 직전에 뿌리세요.':
    'Remove from the refrigerator 30 minutes before cooking and leave at room temperature. Season with salt just before cooking.',
  '굽는 방법': 'How to cook',
  '센 불에서 앞뒤로 1~2분씩 굽고 5분 쉬게 한 뒤 썰어 드세요.':
    'Sear over high heat for one to two minutes per side, rest for five minutes, then slice and serve.',
  '주문 다음날 출고됩니다.': 'Ships the day after your order is placed.',
  '경남 함양 지리산 자락에서 흑돼지를 기릅니다. 도축 후 바로 손질해 냉장으로 보냅니다.':
    'Black pigs are raised at the foot of Jirisan in Hamyang, South Gyeongsang Province. The pork is prepared right after slaughter and shipped chilled.',
  '돼지 목살 500g을 구이용 두께로 썰어 진공 포장합니다.':
    'A 500 g portion of pork collar, cut for grilling and vacuum-packed.',
  '돼지고기(국내산) 100%': '100% pork, raised in South Korea.',
  '돼지고기에 민감한 분은 섭취 전 확인해 주세요.':
    'If you are sensitive to pork, check before eating.',
  '지방 분포는 조금씩 다를 수 있습니다.': 'Fat distribution may vary slightly.',
  '중불에서 뚜껑을 덮어 속까지 익힌 뒤 센 불로 겉을 노릇하게 구우세요.':
    'Cook over medium heat with the lid on until cooked through, then increase the heat to brown the outside.',
  곁들이기: 'What to serve with it',
  '구운 마늘과 쌈채소를 곁들이면 한 끼 식사가 됩니다.':
    'Serve with grilled garlic and leafy greens for a complete meal.',
  '전북 정읍에서 닭을 기르는 농장입니다. 손질을 마친 닭다리살을 냉장으로 보냅니다.':
    'This farm raises chickens in Jeongeup, North Jeolla Province. Prepared chicken thigh meat is shipped chilled.',
  '뼈를 바른 닭다리살 500g을 진공 포장해 보냅니다.':
    'A 500 g portion of boneless chicken thigh, vacuum-packed.',
  '닭고기(국내산) 100%': '100% chicken, raised in South Korea.',
  '닭고기에 민감한 분은 섭취 전 확인해 주세요.':
    'If you are sensitive to chicken, check before eating.',
  '냉장(0~4℃) 보관하고 받은 날부터 2일 안에 드세요.':
    'Refrigerate at 0–4°C and enjoy within two days of arrival.',
  '조각 크기는 조금씩 다를 수 있습니다.': 'Piece sizes may vary slightly.',
  '껍질 쪽부터 팬에 올려 기름이 나올 때까지 중불에서 구우세요.':
    'Place skin-side down in a pan and cook over medium heat until the fat renders.',
  '한입 크기로 썰어 간장 양념에 볶으면 덮밥이 됩니다.':
    'Cut into bite-sized pieces, stir-fry with a soy-based sauce, and serve over rice.',
  '알이 단단한 생블루베리 한 팩입니다.': 'A pack of firm, fresh blueberries.',
  '1팩 · 250g': '1 pack · 250 g',
  용인블루베리농원: 'Yongin Blueberry Farm',
  '경기 용인의 노지 밭에서 블루베리를 재배합니다. 아침에 수확한 열매만 골라 담습니다.':
    'Blueberries are grown in open fields in Yongin, Gyeonggi Province. Only berries harvested that morning are selected for packing.',
  '블루베리 250g을 투명 용기에 담아 보냅니다.':
    'A 250 g pack of blueberries in a clear container.',
  '블루베리(국내산) 100%': '100% blueberries, grown in South Korea.',
  '블루베리에 민감한 분은 섭취 전 소량으로 확인해 주세요.':
    'If you are sensitive to blueberries, try a small amount first.',
  '씻지 않은 채 냉장 보관하고 받은 날부터 3일 안에 드세요.':
    'Refrigerate unwashed and enjoy within three days of arrival.',
  '수확 다음날 출고됩니다.': 'Ships the day after harvest.',
  '수확 시기에 따라 알 크기와 당도가 조금씩 다를 수 있습니다.':
    'Berry size and sweetness may vary slightly with the harvest season.',
  '먹기 직전에 흐르는 물에 가볍게 헹구고 물기를 빼세요.':
    'Rinse gently under running water just before eating, then drain.',
  '요거트나 시리얼에 올리거나 냉동해 두고 간식으로 드세요.':
    'Spoon over yogurt or cereal, or freeze for a snack.',
};

export function translateProductText(text: string): string {
  return (
    (catalogCopy as Record<string, string>)[text] ??
    productCopyEn[text] ??
    foodLabel(text)
  );
}

/** Localize presentation fields only; never replace live details with sample catalog data. */
export function localizeProductDetail(
  detail: ProductDetailResponse,
): ProductDetailResponse {
  return {
    ...detail,
    name: translateProductText(detail.name),
    category: translateProductText(detail.category),
    unit: translateProductText(detail.unit),
    farmName: translateProductText(detail.farmName),
    description: translateProductText(detail.description),
    farmInfo: translateProductText(detail.farmInfo),
    basicInfo: {
      contentGuide: translateProductText(detail.basicInfo.contentGuide),
      ingredients: translateProductText(detail.basicInfo.ingredients),
      allergyInfo: translateProductText(detail.basicInfo.allergyInfo),
      storageMethod: translateProductText(detail.basicInfo.storageMethod),
      shippingInfo: translateProductText(detail.basicInfo.shippingInfo),
      notice: translateProductText(detail.basicInfo.notice),
    },
    tips: detail.tips.map((tip) => ({
      ...tip,
      title: translateProductText(tip.title),
      content: translateProductText(tip.content),
    })),
  };
}
