import type { RoomOption, DmOption, DestinationOption, CarpoolRequest, CountdownReminder } from '@/types/carpool';

export const mockRooms: RoomOption[] = [
  { id: 'r1', name: '1号房', theme: '古风' },
  { id: 'r2', name: '2号房', theme: '恐怖' },
  { id: 'r3', name: '3号房', theme: '情感本' },
  { id: 'r4', name: '4号房', theme: '硬核推理' },
  { id: 'r5', name: '5号房', theme: '欢乐本' },
  { id: 'r6', name: '6号房', theme: '民国' },
  { id: 'r7', name: '7号房', theme: '日式' },
  { id: 'r8', name: 'Vip包厢', theme: '全息投影' }
];

export const mockDms: DmOption[] = [
  { id: 'd1', name: '阿杰' },
  { id: 'd2', name: '小悦' },
  { id: 'd3', name: '老李' },
  { id: 'd4', name: '七七' },
  { id: 'd5', name: '大刘' },
  { id: 'd6', name: '朵朵' },
  { id: 'd7', name: '阿楠' }
];

export const mockDestinations: DestinationOption[] = [
  { id: 'dest1', type: 'subway', name: '地铁2号线 · 人民广场站', address: '人民大道100号' },
  { id: 'dest2', type: 'subway', name: '地铁10号线 · 新天地站', address: '马当路200号' },
  { id: 'dest3', type: 'subway', name: '地铁1号线 · 火车站', address: '秣陵路303号' },
  { id: 'dest4', type: 'university', name: '复旦大学 · 邯郸校区', address: '邯郸路220号' },
  { id: 'dest5', type: 'university', name: '同济大学 · 四平校区', address: '四平路1239号' },
  { id: 'dest6', type: 'university', name: '上海交大 · 徐汇校区', address: '华山路1954号' },
  { id: 'dest7', type: 'hotel', name: '希尔顿酒店', address: '静安区华山路250号' },
  { id: 'dest8', type: 'hotel', name: '万豪酒店', address: '黄浦区南京西路399号' },
  { id: 'dest9', type: 'hotel', name: '如家快捷酒店', address: '浦东新区浦东南路1000号' },
  { id: 'dest10', type: 'mall', name: '环球港购物中心', address: '中山北路3300号' },
  { id: 'dest11', type: 'mall', name: '正大广场', address: '陆家嘴西路168号' },
  { id: 'dest12', type: 'mall', name: '来福士广场', address: '西藏中路268号' }
];

const now = Date.now();
const hour = 60 * 60 * 1000;

export const mockCarpoolRequests: CarpoolRequest[] = [
  {
    id: 'cp1',
    roomId: 'r2',
    roomName: '2号房',
    dmId: 'd1',
    dmName: '阿杰',
    playerCount: 6,
    estimatedEndTime: new Date(now + 2 * hour).toISOString(),
    destinationId: 'dest2',
    destinationName: '地铁10号线 · 新天地站',
    destinationType: 'subway',
    hasLuggage: false,
    acceptCarpool: true,
    needFemaleDriver: false,
    remark: '恐怖本，玩家可能情绪较激动',
    status: 'pending',
    createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 30 * 60 * 1000).toISOString(),
    createdBy: 'host'
  },
  {
    id: 'cp2',
    roomId: 'r3',
    roomName: '3号房',
    dmId: 'd2',
    dmName: '小悦',
    playerCount: 5,
    estimatedEndTime: new Date(now + 1.5 * hour).toISOString(),
    destinationId: 'dest4',
    destinationName: '复旦大学 · 邯郸校区',
    destinationType: 'university',
    hasLuggage: true,
    acceptCarpool: false,
    needFemaleDriver: true,
    remark: '女生，生日包场，有蛋糕和礼物',
    budget: 120,
    contactPhone: '138****5678',
    status: 'published',
    createdAt: new Date(now - 2 * hour).toISOString(),
    updatedAt: new Date(now - 1 * hour).toISOString(),
    createdBy: 'host'
  },
  {
    id: 'cp3',
    roomId: 'r4',
    roomName: '4号房',
    dmId: 'd3',
    dmName: '老李',
    playerCount: 7,
    estimatedEndTime: new Date(now + 3 * hour).toISOString(),
    destinationId: 'dest3',
    destinationName: '地铁1号线 · 火车站',
    destinationType: 'subway',
    hasLuggage: true,
    acceptCarpool: true,
    needFemaleDriver: false,
    remark: '外地游客，带行李箱',
    status: 'pending',
    createdAt: new Date(now - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 15 * 60 * 1000).toISOString(),
    createdBy: 'host'
  },
  {
    id: 'cp4',
    roomId: 'r1',
    roomName: '1号房',
    dmId: 'd4',
    dmName: '七七',
    playerCount: 8,
    estimatedEndTime: new Date(now + 0.5 * hour).toISOString(),
    destinationId: 'dest10',
    destinationName: '环球港购物中心',
    destinationType: 'mall',
    hasLuggage: false,
    acceptCarpool: false,
    needFemaleDriver: false,
    budget: 80,
    contactPhone: '139****1234',
    status: 'published',
    createdAt: new Date(now - 4 * hour).toISOString(),
    updatedAt: new Date(now - 3.5 * hour).toISOString(),
    createdBy: 'host'
  },
  {
    id: 'cp5',
    roomId: 'r8',
    roomName: 'Vip包厢',
    dmId: 'd5',
    dmName: '大刘',
    playerCount: 10,
    estimatedEndTime: new Date(now + 4 * hour).toISOString(),
    destinationId: 'dest7',
    destinationName: '希尔顿酒店',
    destinationType: 'hotel',
    hasLuggage: false,
    acceptCarpool: false,
    needFemaleDriver: false,
    remark: '公司团建包场，需要两辆商务车',
    budget: 300,
    contactPhone: '137****9999',
    status: 'published',
    createdAt: new Date(now - 1 * hour).toISOString(),
    updatedAt: new Date(now - 45 * 60 * 1000).toISOString(),
    createdBy: 'frontdesk'
  }
];

export const mockCountdownReminders: CountdownReminder[] = [
  {
    id: 'rem1',
    carpoolId: 'cp4',
    roomName: '1号房',
    dmName: '七七',
    endTime: new Date(now + 0.5 * hour).toISOString(),
    reminded: true,
    confirmed: false
  },
  {
    id: 'rem2',
    carpoolId: 'cp2',
    roomName: '3号房',
    dmName: '小悦',
    endTime: new Date(now + 1.5 * hour).toISOString(),
    reminded: false,
    confirmed: false
  }
];
