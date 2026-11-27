export const ROOM = {
  minX: -10,
  maxX: 10,
  minZ: -8,
  maxZ: 8,
  wallH: 4.0,
};

export const MEETING = { x: 2.2, z: 3.4, r: 1.45, seatR: 2.35 };

const SEAT_DEG = [20, 80, 140, 200, 260, 320];

export const MEETING_SEATS = SEAT_DEG.map((deg) => {
  const a = (deg * Math.PI) / 180;
  return {
    x: MEETING.x + Math.cos(a) * MEETING.seatR,
    z: MEETING.z + Math.sin(a) * MEETING.seatR,
    deg,
  };
});

export const LOUNGE_SPOTS = [
  { id: 'bean-a', type: 'beanbag', x: -5.9, z: 4.6, yaw: 0.45, sitY: -0.22 },
  { id: 'bean-b', type: 'beanbag', x: -4.2, z: 6.3, yaw: -0.35, sitY: -0.24 },
  { id: 'massage', type: 'massage', x: -2.4, z: 6.4, yaw: Math.PI, sitY: 0.03 },
];

export const LOUNGE_QUEUE = { x: -7.2, z: 4.3 };

// ---------------------------------------------------------------- team
// rank: '대표' | '팀장' | '팀원'  (화이트보드·카드·대시보드에 직책으로 표시)
// duty: 화이트보드 한 줄 설명 (짧게)
// home: where the character belongs. pose 'sit' = at desk chair, 'stand' = floor spot.
//       lift: sitting height offset for AI capsules so they perch on the chair.
// meeting: index into MEETING_SEATS (null = stays at the desk during meetings).
export const TEAM = [
  {
    id: 'jangwon',
    name: '장원님',
    rank: '대표',
    role: '대표 · VFORGE 운영',
    duty: 'VFORGE 운영',
    kind: 'human',
    color: '#2f4c7e',
    look: { body: '#2f4c7e', skin: '#f2c7a1', hair: '#241b18', hairStyle: 'short', pants: '#3a445a', prop: 'mug', glasses: false },
    home: { x: -5.6, z: -3.5, yaw: Math.PI, pose: 'sit' },
    meeting: null,
    task: '오늘 주문·매출 확인하고 12월 패키지 기획 중',
    tip: '대표 자리 · 듀얼 모니터 + 커피 한 잔',
    chatter: ['12월 패키지 구성 좀 더 다듬어볼까?', '오늘 문의 들어온 거 확인해볼까.'],
  },
  {
    id: 'siljang',
    name: 'VFORGE실장',
    rank: '팀장',
    role: '팀장 · 총괄 오퍼레이터',
    duty: '총괄 오퍼레이터',
    kind: 'mascot',
    color: '#2e6bff',
    look: { body: '#2e6bff', skin: '#ffffff' },
    home: { x: -2.9, z: -2.3, yaw: -0.35, pose: 'stand' },
    meeting: 0,
    task: '팀장으로 오늘 브리핑 주재 · 드라마 팀 업무 배분 중',
    tip: '파란 ㅂ 마스코트 · 회의를 소집하고 주재하는 팀장',
    chatter: ['팀장으로 한마디! 다들 오늘 잘 부탁해요 😎', '브리핑 자료 정리해둘게요.'],
  },
  {
    id: 'blog',
    name: '블로그 매니저',
    rank: '팀원',
    role: '팀원 · 네이버 블로그·서로이웃',
    duty: '블로그·이웃',
    kind: 'human',
    color: '#d9899a',
    look: { body: '#e4a3b1', skin: '#f6cfae', hair: '#5a3a2a', hairStyle: 'bob', pants: '#5c4a5e', prop: 'notebook' },
    home: { x: 0.4, z: -3.85, yaw: Math.PI, pose: 'sit', row: 1, aisle: 1.8 },
    meeting: 2,
    task: '네이버 블로그 11/27 초안 작성 · 사진 3장 고르는 중',
    tip: '하루 1편 초안 + 서로이웃 15명 관리',
    chatter: ['오늘 글 제목 뭐로 할까요?', '이웃 58명 돌파했어요!'],
  },
  {
    id: 'threads',
    name: '스레드·인스타 매니저',
    rank: '팀원',
    role: '팀원 · 스레드·인스타 @vforge.lab',
    duty: '스레드·인스타',
    kind: 'human',
    color: '#9a86e0',
    look: { body: '#b3a2ea', skin: '#f5c9a8', hair: '#2c2530', hairStyle: 'ponytail', pants: '#3f3a55', prop: 'phone' },
    home: { x: 3.2, z: -3.85, yaw: Math.PI, pose: 'sit', row: 1, aisle: 1.8 },
    meeting: 3,
    task: '스레드 자유주제 글 예약 발행 · 반하리 4건 확인 중',
    tip: '반모 말투 · 사진 1장 필수 · 새벽 1~7시 휴식',
    chatter: ['드라마 티저 컷 올려볼까요? 🔥', '인스타 DM 정리해서 보고할게요.'],
  },
  {
    id: 'kmong',
    name: '크몽·당근 견적 매니저',
    rank: '팀원',
    role: '팀원 · 크몽·당근·외주 견적',
    duty: '크몽·당근 견적',
    kind: 'human',
    color: '#d9a441',
    look: { body: '#e8b455', skin: '#eec39c', hair: '#2a2118', hairStyle: 'cap', capColor: '#3b5bb5', pants: '#4a4a52', prop: 'clipboard' },
    home: { x: 6.0, z: -3.85, yaw: Math.PI, pose: 'sit', row: 1, aisle: 4.6 },
    meeting: null,
    task: '당근 문의 2건 답장 준비 · 홈페이지 견적서 정리 중',
    tip: '견적은 전문가 단가의 30~50%로 · 발송 전 확인',
    chatter: ['견적서 초안 나왔습니다!', '당근 문의 답장 확인 부탁드려요.'],
  },
  {
    id: 'pd',
    name: '유튜브·영상 PD',
    rank: '팀원',
    role: '팀원 · 쇼츠·홍보 영상 제작',
    duty: '영상 제작',
    kind: 'human',
    color: '#6fbfa6',
    look: { body: '#7cc4ad', skin: '#f3c9a4', hair: '#33261d', hairStyle: 'headphones', pants: '#3d4b56', prop: 'camera' },
    home: { x: 0.4, z: -0.45, yaw: Math.PI, pose: 'sit', row: 2 },
    meeting: 4,
    task: '드라마 15씬 이미지·더빙 기본 영상 컷 확인 중',
    tip: '15초 쇼츠 · 첫 3초 후킹 담당',
    chatter: ['드라마 기본 영상 16분 28초로 나왔어요!', '이 장면 썸네일로 쓰면 좋겠는데요.'],
  },
  {
    id: 'dev',
    name: '웹·코드 개발자',
    rank: '팀원',
    role: '팀원 · 홈페이지·자동화 개발',
    duty: '홈페이지·개발',
    kind: 'human',
    color: '#6c82a8',
    look: { body: '#7d92b5', skin: '#f0c8a4', hair: '#22242c', hairStyle: 'messy', pants: '#3a4152', prop: 'laptop', glasses: true },
    home: { x: 3.2, z: -0.45, yaw: Math.PI, pose: 'sit', row: 2 },
    meeting: null,
    task: 'VFORGE 3D 오피스 팀 개편 배포 · 폰 테스트 중',
    tip: '랜딩페이지·자동화 도구를 직접 만듭니다',
    chatter: ['배포 완료! 폰에서도 잘 돌아가요.', '이번엔 로딩 속도 줄여볼게요.'],
  },
  {
    id: 'claude',
    name: 'Claude',
    rank: '팀원',
    role: '팀원 · 대본·문서·정교한 글쓰기',
    duty: '대본·문서',
    kind: 'ai',
    color: '#d97757',
    look: { body: '#d97757', belly: '#f4e7db', prop: 'book' },
    home: { x: 6.0, z: -0.45, yaw: Math.PI, pose: 'sit', row: 2, lift: 0.2 },
    meeting: 1,
    task: '《엄마가 평생 모은 돈》 15씬 대본 톤 다듬는 중',
    tip: '팀원 책상 · 대본·문서·정교한 글쓰기 담당',
    chatter: ['대본 15씬 톤 맞춰서 다듬었어요.', '이 문장은 조금 더 담백하게 가볼게요.'],
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    rank: '팀원',
    role: '팀원 · 기획·아이디어·구조화',
    duty: '기획·구조화',
    kind: 'ai',
    color: '#10a37f',
    look: { body: '#10a37f', belly: '#d9f3ec', prop: 'orb', propColor: '#9ff0da' },
    home: { x: 8.6, z: -0.45, yaw: Math.PI, pose: 'sit', row: 2, lift: 0.2 },
    meeting: 5,
    task: '드라마 기획안·15씬 비트시트 구조 잡는 중',
    tip: '팀원 책상 · 기획·아이디어·구조화 담당',
    chatter: ['기획안 구조 이렇게 잡으면 좋겠어요.', '반전 2개 넣은 비트시트 뽑아봤어요.'],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    rank: '팀원',
    role: '팀원 · 조사·요약 (AI LAB)',
    duty: '조사·요약',
    kind: 'ai',
    color: '#5b6cff',
    look: { body: '#5b6cff', belly: '#c9d1ff', prop: 'orb', propColor: '#aebaff' },
    home: { x: 8.0, z: 7.4, yaw: Math.PI, pose: 'stand' },
    meeting: null,
    task: '부업 채널 자료 조사하고 요약 정리 중',
    tip: 'AI LAB 리서치 데스크 · 조사와 요약 담당',
    chatter: ['자료 조사 끝났습니다. 요약해둘게요.', '이번 주 트렌드 정리해봤어요.'],
  },
];

export const TODAY = {
  date: '2026.11.27 (금)',
  stats: [
    { label: '오늘 발행', value: '6건', note: '블로그 1 · 스레드 4 · 인스타 2' },
    { label: '블로그 이웃', value: '58명', note: '서로이웃 관리 중' },
    { label: '당근 문의', value: '2건', note: '답장 준비 완료' },
    { label: '진행 프로젝트', value: '3건', note: '드라마 · 3D 오피스 · 전자책' },
  ],
  boardStats: {
    blog: '1편',
    threads: '4건',
    insta: '2건',
    quote: '1건',
  },
};

// 팀장(VFORGE실장)이 주재하는 브리핑 — 오늘의 실제 작업(유튜브 드라마 기획·대본)을 그대로 반영
export const MEETING_SCRIPT = [
  { id: 'siljang', text: '다들 모여주세요! 팀장 주재로 오늘의 VFORGE 브리핑 시작합니다 📣' },
  { id: 'chatgpt', text: '유튜브 드라마 《엄마가 평생 모은 돈》 기획안이랑 15씬 비트시트 정리 끝났어요!' },
  { id: 'claude', text: '그 구조로 15씬 대본 완성했고, 지금 문장 톤 다듬는 중이에요 ✍️' },
  { id: 'pd', text: '장면 이미지 15장이랑 더빙 기본 영상까지 나왔어요. 16분 28초!' },
  { id: 'blog', text: '이번 주 블로그는 드라마 제작기로 한 편 더 쓸 수 있겠네요.' },
  { id: 'threads', text: '스레드·인스타에는 드라마 티저 컷으로 예고 올려볼게요 🔥' },
  { id: 'siljang', text: '좋아요. 오늘 목표는 드라마 1편 완성입니다. 각자 맡은 것 마무리해 주세요! 🚀' },
];

export const CHATTER = [
  '커피 한 잔 하고 올게요 ☕',
  '이번 주 목표까지 조금 남았어요!',
  '작업 큐 정리 중…',
  '반응 좋은 글 다시 확인해볼게요.',
];
